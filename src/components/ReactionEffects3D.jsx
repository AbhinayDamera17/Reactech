import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * ReactionEffects3D — Dramatic visual effects for Live Lab reactions.
 *
 * Effect types by risk level:
 *  - safe:     emerald sparkle burst + pulsing aura rings + floating bubbles
 *  - moderate: swirling smoke clouds + amber sparks + steam jets
 *  - danger:   fireball + shockwave rings + flying debris + embers + white flash + screen shake
 *
 * All effects originate from the midpoint between user's hands.
 * Particle positions are pre-computed in JS for browser compatibility.
 */

const EFFECT_DURATION = 4000;

function randRange(min, max) { return min + Math.random() * (max - min); }

function makeParticles(risk, cx, cy) {
    const count = risk === 'danger' ? 80 : risk === 'moderate' ? 60 : 50;
    return Array.from({ length: count }, (_, i) => {
        const angleDeg = Math.random() * 360;
        const angleRad = (angleDeg * Math.PI) / 180;
        const speed = risk === 'danger' ? randRange(100, 300) : randRange(40, 140);
        const dx = Math.cos(angleRad) * speed;
        const dy = Math.sin(angleRad) * speed + (risk === 'danger' ? 30 : 0);
        const size = risk === 'danger' ? randRange(4, 16) : randRange(3, 10);
        const delay = Math.random() * 0.4;
        const dur = randRange(1.2, 2.5);
        return { id: i, dx, dy, size, delay, dur };
    });
}

function makeEmbers(cx, cy, count = 40) {
    return Array.from({ length: count }, (_, i) => {
        const angleRad = (Math.random() * 360 * Math.PI) / 180;
        const speed = randRange(80, 220);
        return { id: i, dx: Math.cos(angleRad) * speed, dy: Math.sin(angleRad) * speed + 40, delay: Math.random() * 0.3 };
    });
}

export default function ReactionEffects3D({ result, visible, hands }) {
    const [phase, setPhase] = useState('idle');
    const timerRef = useRef([]);

    // Midpoint from hands
    const mid = useMemo(() => {
        if (!hands || hands.length < 2) return { x: 50, y: 50 };
        const l = hands.find(h => h.side === 'left');
        const r = hands.find(h => h.side === 'right');
        if (!l || !r) return { x: 50, y: 50 };
        return { x: ((l.cx + r.cx) / 2) * 100, y: ((l.cy + r.cy) / 2) * 100 };
    }, [hands]);

    const particles = useMemo(() => {
        if (!result || !visible) return [];
        return makeParticles(result.risk, mid.x, mid.y);
    }, [result, visible, mid.x, mid.y]);

    const embers = useMemo(() => {
        if (!result || result.risk !== 'danger' || !visible) return [];
        return makeEmbers(mid.x, mid.y);
    }, [result, visible, mid.x, mid.y]);

    useEffect(() => {
        timerRef.current.forEach(t => clearTimeout(t));
        timerRef.current = [];

        if (!visible || !result) { setPhase('idle'); return; }

        setPhase('flash');

        // Screen shake
        const frame = document.querySelector('.live-camera-frame');
        if (frame) {
            const cls = result.risk === 'danger' ? 'fx-shake-heavy' : result.risk === 'moderate' ? 'fx-shake-light' : '';
            if (cls) {
                frame.classList.add(cls);
                timerRef.current.push(setTimeout(() => frame.classList.remove(cls), 800));
            }
        }

        timerRef.current.push(setTimeout(() => setPhase('active'), 150));
        timerRef.current.push(setTimeout(() => setPhase('fading'), EFFECT_DURATION - 1000));
        timerRef.current.push(setTimeout(() => setPhase('idle'), EFFECT_DURATION));

        return () => timerRef.current.forEach(t => clearTimeout(t));
    }, [visible, result]);

    if (phase === 'idle' || !result) return null;

    const { risk } = result;
    const { x, y } = mid;

    return (
        <div className={`fx-container ${phase}`}>

            {/* ═══ SAFE ═══ */}
            {risk === 'safe' && (
                <>
                    {/* Pulsing glow core + rings */}
                    <div className="fx-center-glow fx-safe-glow" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="fx-glow-core" />
                        <div className="fx-glow-ring ring-1" />
                        <div className="fx-glow-ring ring-2" />
                        <div className="fx-glow-ring ring-3" />
                    </div>

                    {/* Sparkle particles */}
                    {particles.map(p => (
                        <div key={p.id} className="fx-particle fx-sparkle" style={{
                            left: `${x}%`, top: `${y}%`,
                            width: p.size, height: p.size,
                            '--dx': `${p.dx}px`, '--dy': `${p.dy - 30}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.dur}s`,
                        }} />
                    ))}

                    {/* Floating bubbles */}
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={`b${i}`} className="fx-bubble" style={{
                            left: `${x + randRange(-15, 15)}%`,
                            top: `${y + randRange(-10, 10)}%`,
                            '--drift': `${randRange(-40, 40)}px`,
                            '--size': `${randRange(6, 16)}px`,
                            animationDelay: `${randRange(0, 1.5)}s`,
                        }} />
                    ))}

                    {/* Label */}
                    <div className="fx-text fx-text-safe" style={{ left: `${x}%`, top: `${y - 12}%` }}>
                        ✅ Safe Reaction
                    </div>
                </>
            )}

            {/* ═══ MODERATE ═══ */}
            {risk === 'moderate' && (
                <>
                    {/* Amber glow */}
                    <div className="fx-center-glow fx-moderate-glow" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="fx-glow-core" />
                        <div className="fx-glow-ring ring-1" />
                        <div className="fx-glow-ring ring-2" />
                    </div>

                    {/* Smoke clouds */}
                    {Array.from({ length: 25 }, (_, i) => (
                        <div key={`sm${i}`} className="fx-smoke-cloud" style={{
                            left: `${x + randRange(-10, 10)}%`,
                            top: `${y + randRange(-8, 8)}%`,
                            '--driftX': `${randRange(-60, 60)}px`,
                            '--driftY': `${randRange(-40, -100)}px`,
                            '--size': `${randRange(20, 60)}px`,
                            animationDelay: `${randRange(0, 1)}s`,
                            animationDuration: `${randRange(1.5, 3.5)}s`,
                        }} />
                    ))}

                    {/* Orange spark particles */}
                    {particles.map(p => (
                        <div key={p.id} className="fx-particle fx-spark" style={{
                            left: `${x}%`, top: `${y}%`,
                            width: p.size, height: p.size,
                            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.dur}s`,
                        }} />
                    ))}

                    {/* Steam jets */}
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={`st${i}`} className="fx-steam-jet" style={{
                            left: `${x + randRange(-5, 5)}%`, top: `${y}%`,
                            animationDelay: `${i * 0.15}s`,
                        }} />
                    ))}

                    <div className="fx-text fx-text-moderate" style={{ left: `${x}%`, top: `${y - 12}%` }}>
                        ⚠️ Caution — Heat Released
                    </div>
                </>
            )}

            {/* ═══ DANGER ═══ */}
            {risk === 'danger' && (
                <>
                    {/* White flash */}
                    {phase === 'flash' && <div className="fx-white-flash" />}

                    {/* Fireball */}
                    <div className="fx-fireball" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="fx-fireball-inner" />
                        <div className="fx-fireball-outer" />
                    </div>

                    {/* Shockwave rings */}
                    <div className="fx-shockwave" style={{ left: `${x}%`, top: `${y}%` }}>
                        <div className="fx-shock-ring ring-1" />
                        <div className="fx-shock-ring ring-2" />
                        <div className="fx-shock-ring ring-3" />
                    </div>

                    {/* Flying debris */}
                    {particles.map(p => (
                        <div key={p.id} className="fx-particle fx-debris" style={{
                            left: `${x}%`, top: `${y}%`,
                            width: p.size, height: p.size,
                            '--dx': `${p.dx}px`, '--dy': `${p.dy}px`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.dur}s`,
                        }} />
                    ))}

                    {/* Embers */}
                    {embers.map(e => (
                        <div key={`em${e.id}`} className="fx-ember" style={{
                            left: `${x}%`, top: `${y}%`,
                            '--dx': `${e.dx}px`, '--dy': `${e.dy}px`,
                            animationDelay: `${e.delay}s`,
                        }} />
                    ))}

                    {/* Red overlay pulse */}
                    <div className="fx-danger-overlay" />

                    <div className="fx-text fx-text-danger" style={{ left: `${x}%`, top: `${y - 15}%` }}>
                        🔴 DANGER — Explosive Reaction!
                    </div>
                </>
            )}
        </div>
    );
}
