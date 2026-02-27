import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 80 }) {
    const mesh = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const arr = [];
        for (let i = 0; i < count; i++) {
            arr.push({
                x: (Math.random() - 0.5) * 4,
                y: (Math.random() - 0.5) * 3,
                z: (Math.random() - 0.5) * 2,
                sx: (Math.random() - 0.5) * 0.008,
                sy: Math.random() * 0.01 + 0.003,
                sz: (Math.random() - 0.5) * 0.005,
                scale: 0.06 + Math.random() * 0.12,
            });
        }
        return arr;
    }, [count]);

    useFrame(() => {
        if (!mesh.current) return;
        particles.forEach((p, i) => {
            p.x += p.sx;
            p.y += p.sy;
            p.z += p.sz;
            if (p.y > 2) { p.y = -1.5; p.x = (Math.random() - 0.5) * 4; }
            if (Math.abs(p.x) > 3) p.sx *= -1;
            dummy.position.set(p.x, p.y, p.z);
            dummy.scale.setScalar(p.scale);
            dummy.updateMatrix();
            mesh.current.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#9ca3af" transparent opacity={0.35} roughness={1} />
        </instancedMesh>
    );
}

export default function SmokeEffect({ visible }) {
    if (!visible) return null;

    return (
        <div className="smoke-3d-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[2, 3, 4]} intensity={0.8} />
                <Particles />
            </Canvas>
        </div>
    );
}
