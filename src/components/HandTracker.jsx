import { useRef, useEffect, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

// ─── Smoothing: 5-frame moving average ───
const SMOOTH_FRAMES = 5;
class CoordSmoother {
    constructor() { this.buffers = {}; }
    smooth(id, x, y) {
        if (!this.buffers[id]) this.buffers[id] = [];
        const buf = this.buffers[id];
        buf.push({ x, y });
        if (buf.length > SMOOTH_FRAMES) buf.shift();
        const sx = buf.reduce((s, p) => s + p.x, 0) / buf.length;
        const sy = buf.reduce((s, p) => s + p.y, 0) / buf.length;
        return { x: sx, y: sy };
    }
    clear(id) { delete this.buffers[id]; }
}

// ─── Hand persistence: 10-frame grace period ───
const GRACE_FRAMES = 10;

export default function HandTracker({ videoEl, canvasRef, onHandsDetected, debugMode, onDebugInfo }) {
    const landmarkerRef = useRef(null);
    const rafRef = useRef(null);
    const lastTimeRef = useRef(-1);
    const smootherRef = useRef(new CoordSmoother());
    const persistRef = useRef({ left: null, right: null });
    const missingRef = useRef({ left: 0, right: 0 });
    const fpsRef = useRef({ frames: 0, lastTs: performance.now(), fps: 0 });

    // Initialize MediaPipe HandLandmarker
    useEffect(() => {
        let cancelled = false;
        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
                const hl = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
                    runningMode: 'VIDEO',
                    numHands: 2,
                    minHandDetectionConfidence: 0.8,
                    minHandPresenceConfidence: 0.8,
                    minTrackingConfidence: 0.8,
                });
                if (!cancelled) landmarkerRef.current = hl;
            } catch (err) {
                console.error('HandLandmarker init error:', err);
            }
        }
        init();
        return () => { cancelled = true; };
    }, []);

    // Detection loop
    const detect = useCallback(() => {
        const hl = landmarkerRef.current;
        if (!hl || !videoEl || videoEl.readyState < 2) {
            rafRef.current = requestAnimationFrame(detect);
            return;
        }

        const now = performance.now();
        if (now === lastTimeRef.current) {
            rafRef.current = requestAnimationFrame(detect);
            return;
        }
        lastTimeRef.current = now;

        // FPS counter
        const fpsData = fpsRef.current;
        fpsData.frames++;
        if (now - fpsData.lastTs >= 1000) {
            fpsData.fps = fpsData.frames;
            fpsData.frames = 0;
            fpsData.lastTs = now;
        }

        const results = hl.detectForVideo(videoEl, now);
        const canvas = canvasRef?.current;
        const smoother = smootherRef.current;

        // Build detected hand map by side
        const detected = {};
        const confidences = {};
        if (results.landmarks) {
            results.landmarks.forEach((lm, i) => {
                const rawSide = results.handednesses?.[i]?.[0]?.categoryName || 'Unknown';
                const confidence = results.handednesses?.[i]?.[0]?.score || 0;
                // MediaPipe "Right" = user's right (when mirrored)
                const side = rawSide === 'Right' ? 'right' : 'left';
                detected[side] = lm;
                confidences[side] = confidence;
            });
        }

        // Apply persistence logic
        const activeSides = ['left', 'right'];
        const finalHands = [];

        activeSides.forEach(side => {
            if (detected[side]) {
                missingRef.current[side] = 0;
                persistRef.current[side] = detected[side];
            } else {
                missingRef.current[side]++;
                if (missingRef.current[side] > GRACE_FRAMES) {
                    persistRef.current[side] = null;
                    smoother.clear(side);
                    smoother.clear(side + '_top');
                    smoother.clear(side + '_cx');
                }
            }

            const lm = persistRef.current[side];
            if (!lm) return;

            const isLive = missingRef.current[side] === 0;
            const isWeak = missingRef.current[side] > 0;
            const confidence = confidences[side] || 0;

            // Determine landmark color based on detection quality
            let color, quality;
            if (!isLive) {
                color = '#ef4444'; quality = 'lost'; // Red: using persisted data
            } else if (confidence < 0.85) {
                color = '#eab308'; quality = 'weak'; // Yellow: low confidence
            } else {
                color = '#22c55e'; quality = 'stable'; // Green: strong detection
            }

            // Smoothed center point
            const wrist = lm[0];
            const middle = lm[9];
            const rawCX = 1 - (wrist.x + middle.x) / 2;
            const rawCY = (wrist.y + middle.y) / 2;
            const smoothedCenter = smoother.smooth(side + '_cx', rawCX, rawCY);

            // Smoothed top point for label
            const topY = Math.min(...lm.map(p => p.y));
            const topX = 1 - lm[12].x;
            const smoothedTop = smoother.smooth(side + '_top', topX, topY);

            finalHands.push({
                side,
                cx: smoothedCenter.x,
                cy: smoothedCenter.y,
                topX: smoothedTop.x,
                topY: smoothedTop.y,
                landmarks: lm,
                confidence,
                quality,
                color,
                isLive,
            });
        });

        // Draw on canvas
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = videoEl.videoWidth;
            canvas.height = videoEl.videoHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            finalHands.forEach(hand => {
                const lm = hand.landmarks;
                const color = hand.color;
                const w = canvas.width;
                const h = canvas.height;

                // Draw connections
                const connections = [
                    [0, 1], [1, 2], [2, 3], [3, 4],
                    [0, 5], [5, 6], [6, 7], [7, 8],
                    [0, 9], [9, 10], [10, 11], [11, 12],
                    [0, 13], [13, 14], [14, 15], [15, 16],
                    [0, 17], [17, 18], [18, 19], [19, 20],
                    [5, 9], [9, 13], [13, 17]
                ];
                ctx.strokeStyle = color + '55';
                ctx.lineWidth = 2;
                connections.forEach(([a, b]) => {
                    const pa = lm[a], pb = lm[b];
                    ctx.beginPath();
                    ctx.moveTo((1 - pa.x) * w, pa.y * h);
                    ctx.lineTo((1 - pb.x) * w, pb.y * h);
                    ctx.stroke();
                });

                // Draw landmark dots
                lm.forEach(pt => {
                    const x = (1 - pt.x) * w;
                    const y = pt.y * h;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color;
                    ctx.fill();
                    // Outer glow
                    ctx.beginPath();
                    ctx.arc(x, y, 7, 0, Math.PI * 2);
                    ctx.strokeStyle = color + '44';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });

                // Bounding box
                const xs = lm.map(p => (1 - p.x) * w);
                const ys = lm.map(p => p.y * h);
                const minX = Math.min(...xs) - 12;
                const maxX = Math.max(...xs) + 12;
                const minY = Math.min(...ys) - 12;
                const maxY = Math.max(...ys) + 12;
                ctx.strokeStyle = color + '66';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([6, 4]);
                ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
                ctx.setLineDash([]);

                // Quality label on bounding box
                ctx.font = '10px Inter, sans-serif';
                ctx.fillStyle = color;
                ctx.fillText(`${hand.side.toUpperCase()} · ${hand.quality}`, minX + 4, minY - 4);
            });
        }

        // Report hands to parent
        if (onHandsDetected) onHandsDetected(finalHands);

        // Debug info
        if (debugMode && onDebugInfo) {
            let dist = null;
            const left = finalHands.find(h => h.side === 'left');
            const right = finalHands.find(h => h.side === 'right');
            if (left && right) {
                const dx = left.cx - right.cx;
                const dy = left.cy - right.cy;
                dist = Math.sqrt(dx * dx + dy * dy).toFixed(3);
            }
            onDebugInfo({
                fps: fpsData.fps,
                handsDetected: finalHands.length,
                leftConf: (confidences.left || 0).toFixed(2),
                rightConf: (confidences.right || 0).toFixed(2),
                leftQuality: finalHands.find(h => h.side === 'left')?.quality || '—',
                rightQuality: finalHands.find(h => h.side === 'right')?.quality || '—',
                distance: dist || '—',
                leftMissing: missingRef.current.left,
                rightMissing: missingRef.current.right,
            });
        }

        rafRef.current = requestAnimationFrame(detect);
    }, [videoEl, canvasRef, onHandsDetected, debugMode, onDebugInfo]);

    useEffect(() => {
        if (videoEl) {
            rafRef.current = requestAnimationFrame(detect);
        }
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [videoEl, detect]);

    return null;
}
