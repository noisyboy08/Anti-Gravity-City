import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// ── 5. Git Merge "Boss Fights" ──────────────────────────────────
export function BossFight({ active }) {
    const bossRef = useRef();
    const [hp, setHp] = useState(100);

    // Simulate community commits reducing the Boss HP
    useFrame((state) => {
        if (!active || hp <= 0) return;
        const t = state.clock.elapsedTime;
        if (bossRef.current) {
            bossRef.current.position.y = 80 + Math.sin(t * 2) * 5;
            bossRef.current.rotation.y = t * 0.5;
            bossRef.current.rotation.z = Math.sin(t) * 0.1;
        }
        
        // Randomly take damage
        if (Math.random() > 0.99) {
            setHp(prev => Math.max(0, prev - (Math.random() * 5)));
        }
    });

    if (!active || hp <= 0) return null;

    return (
        <group position={[0, 80, 0]} ref={bossRef}>
            {/* The Boss Body */}
            <mesh>
                <dodecahedronGeometry args={[15, 0]} />
                <meshStandardMaterial color="#ff0000" wireframe emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            
            {/* Core Eye */}
            <mesh position={[0, 0, 10]}>
                <sphereGeometry args={[5, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <pointLight color="#ff0000" intensity={500} distance={200} />

            {/* Boss HP UI */}
            <Html position={[0, 25, 0]} center distanceFactor={80}>
                <div style={{ background: 'rgba(0,0,0,0.8)', border: '2px solid #ff0000', padding: '10px 20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ color: '#ff0000', fontFamily: 'Orbitron', fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 10px #ff0000' }}>
                        THE MERGE CONFLICT
                    </div>
                    <div style={{ width: '300px', height: '10px', background: '#330000', marginTop: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${hp}%`, height: '100%', background: '#ff0000', transition: 'width 0.2s' }} />
                    </div>
                    <div style={{ color: '#ffaa00', fontFamily: 'monospace', fontSize: '12px', marginTop: '5px' }}>
                        HP: {Math.floor(hp)}% | Awaiting Commits...
                    </div>
                </div>
            </Html>
        </group>
    );
}
