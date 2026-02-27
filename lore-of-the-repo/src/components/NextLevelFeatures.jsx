import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// ── 3. The Burndown (Real-Time Live CI/CD Visuals) ──
export function BurndownVis({ active }) {
    const [payloads, setPayloads] = useState([]);

    useEffect(() => {
        if (!active) return;
        // Simulate a CI build pushing a payload every 15s
        const interval = setInterval(() => {
            setPayloads(prev => [...prev, { id: Date.now(), pos: [0, 80, 0], status: Math.random() > 0.3 ? 'pass' : 'fail' }]);
        }, 15000);
        return () => clearInterval(interval);
    }, [active]);

    useFrame(() => {
        setPayloads(prev => prev.map(p => ({ ...p, pos: [p.pos[0], p.pos[1] - 0.5, p.pos[2]] })).filter(p => p.pos[1] > 0));
    });

    if (!active) return null;

    return (
        <group>
            {payloads.map(p => (
                <mesh key={p.id} position={p.pos}>
                    <coneGeometry args={[2, 4, 4]} />
                    <meshStandardMaterial color={p.status === 'pass' ? '#00ff41' : '#ff0033'} emissive={p.status === 'pass' ? '#00ff41' : '#ff0033'} emissiveIntensity={3} />
                    {p.pos[1] < 5 && p.status === 'pass' && (
                        <pointLight color="#00ff41" intensity={50} distance={150} />
                    )}
                </mesh>
            ))}
        </group>
    );
}

// ── 5. FPS Mode "Glitch Hunt" ──
// Wrapper to enable PointerLockControls for FPS when a feature is toggled
export function FPSController({ active }) {
    const { camera } = useThree();

    useEffect(() => {
        if (active) {
            camera.position.set(0, 5, 20); // Move to a pedestrian level
        }
    }, [active, camera]);

    if (!active) return null;
    return <PointerLockControls />;
}

// ── 7. The Nexus (Cross-Repo Wormholes) ──
export function CrossRepoWormholes({ active }) {
    const ringRef = useRef();

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z -= 0.05;
        }
    });

    if (!active) return null;

    return (
        <group position={[150, 40, -100]}>
            {/* The Stargate */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
                <torusGeometry args={[30, 2, 16, 100]} />
                <meshStandardMaterial color="#00f5ff" emissive="#0055ff" emissiveIntensity={5} wireframe />
            </mesh>
            {/* The Portal Event Horizon */}
            <mesh rotation={[0, Math.PI / 4, 0]}>
                <circleGeometry args={[29, 64]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
            <Html position={[0, -35, 0]} center distanceFactor={80}>
                <div style={{ color: '#00f5ff', textShadow: '0 0 20px #00f5ff', fontSize: '18px', fontFamily: 'Orbitron', background: 'rgba(0,0,0,0.8)', padding: '10px', borderRadius: '8px', border: '1px solid #0055ff' }}>
                    ⬡ WORMHOLE: react/next.js
                </div>
            </Html>
        </group>
    );
}
