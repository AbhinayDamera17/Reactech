import { useRef, useEffect, useState } from 'react';

export default function CameraFeed({ onVideoReady }) {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let stream = null;
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280, min: 640 },
                        height: { ideal: 720, min: 480 },
                        facingMode: 'user',
                        aspectRatio: { ideal: 16 / 9 },
                        frameRate: { ideal: 30 },
                    },
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = () => {
                        videoRef.current.play();
                        if (onVideoReady) onVideoReady(videoRef.current);
                    };
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('Camera access denied or unavailable. Please allow camera permissions and ensure a webcam is connected.');
            }
        }
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [onVideoReady]);

    if (error) {
        return (
            <div className="camera-error">
                <span className="camera-error-icon">📷</span>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            className="camera-feed"
            autoPlay
            playsInline
            muted
            style={{ transform: 'scaleX(-1)' }}
        />
    );
}
