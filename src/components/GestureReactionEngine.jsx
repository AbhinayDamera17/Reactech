import { useEffect, useRef } from 'react';
import { mixChemicals } from '../api';
import { REACTIONS, reactionKey } from '../chemicals';

/**
 * GestureReactionEngine — ref-based, zero-delay reaction trigger.
 *
 * - Uses smoothed cx/cy from HandTracker for distance (already mirrored + smoothed)
 * - Normalized 0-1 threshold (0.12) — works at any resolution
 * - All logic via refs — no setState in the hot path
 * - 2-second debounce lock
 * - Preloads animation with local fallback before API
 * - Always mounted (receives `blocked` prop instead of being unmounted)
 */

const NORM_THRESHOLD = 0.20;    // normalized distance — triggers when hands are close (not touching)
const READY_MULTIPLIER = 1.8;   // "ready" zone = threshold * 1.8
const LOCK_MS = 1500;           // cooldown after trigger (1.5s)

export default function GestureReactionEngine({
    hands, chemLeft, chemRight, onReaction, onStatusChange, onGestureDebug, blocked,
}) {
    const lockRef = useRef(false);
    const lastStatusRef = useRef('waiting');
    const apiStatusRef = useRef('idle');

    useEffect(() => {
        const left = hands.find(h => h.side === 'left');
        const right = hands.find(h => h.side === 'right');
        const hasBoth = left && right && chemLeft && chemRight && chemLeft !== chemRight;

        if (!hasBoth) {
            if (lastStatusRef.current !== 'waiting') {
                lastStatusRef.current = 'waiting';
                onStatusChange?.('waiting');
            }
            onGestureDebug?.({
                distance: null,
                threshold: NORM_THRESHOLD,
                locked: lockRef.current,
                apiStatus: apiStatusRef.current,
            });
            return;
        }

        // Use smoothed cx/cy from HandTracker — already mirrored and averaged
        const dx = left.cx - right.cx;
        const dy = left.cy - right.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Determine status
        let status;
        if (dist < NORM_THRESHOLD) {
            status = 'triggered';
        } else if (dist < NORM_THRESHOLD * READY_MULTIPLIER) {
            status = 'ready';
        } else {
            status = 'waiting';
        }

        // Push status change
        if (status !== lastStatusRef.current) {
            lastStatusRef.current = status;
            onStatusChange?.(status);
        }

        // Debug info
        onGestureDebug?.({
            distance: dist.toFixed(3),
            threshold: NORM_THRESHOLD,
            locked: lockRef.current,
            apiStatus: apiStatusRef.current,
        });

        // Trigger reaction INSTANTLY — but only if not blocked by mistake detector
        if (status === 'triggered' && !lockRef.current && !blocked) {
            lockRef.current = true;
            apiStatusRef.current = 'loading';

            // 1) Immediately fire local fallback for instant visual feedback
            const key = reactionKey(chemLeft, chemRight);
            const localData = REACTIONS[key] || null;
            if (localData) {
                onReaction?.(localData);
            }

            // 2) Background API call
            (async () => {
                try {
                    const apiData = await mixChemicals(chemLeft, chemRight);
                    apiStatusRef.current = 'done';
                    if (apiData && (!localData || apiData.risk !== localData.risk)) {
                        onReaction?.(apiData);
                    }
                } catch {
                    apiStatusRef.current = 'done';
                }
            })();

            // Unlock after cooldown
            setTimeout(() => {
                lockRef.current = false;
                apiStatusRef.current = 'idle';
            }, LOCK_MS);
        }
    }); // no deps — runs every render

    // Render orb between hands
    const left = hands.find(h => h.side === 'left');
    const right = hands.find(h => h.side === 'right');

    if (!left || !right) return null;

    const midX = ((left.cx + right.cx) / 2) * 100;
    const midY = ((left.cy + right.cy) / 2) * 100;
    const dx = left.cx - right.cx;
    const dy = left.cy - right.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const showOrb = dist < NORM_THRESHOLD * READY_MULTIPLIER;

    if (!showOrb) return null;

    return (
        <div
            className={`reaction-orb ${dist < NORM_THRESHOLD ? 'mixing' : 'ready'}`}
            style={{ left: `${midX}%`, top: `${midY}%` }}
        >
            <div className="orb-inner" />
            <div className="orb-glow" />
        </div>
    );
}
