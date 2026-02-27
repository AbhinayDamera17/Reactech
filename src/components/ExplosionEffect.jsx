import { useEffect, useState } from 'react';

export default function ExplosionEffect({ visible }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
            // screen shake
            document.body.classList.add('shake');
            const t1 = setTimeout(() => document.body.classList.remove('shake'), 600);
            // auto-hide after 1.5s
            const t2 = setTimeout(() => setShow(false), 1500);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setShow(false);
        }
    }, [visible]);

    if (!show) return null;

    return (
        <div className="explosion-overlay">
            <div className="explosion-circle" />
            <div className="explosion-flash" />
        </div>
    );
}
