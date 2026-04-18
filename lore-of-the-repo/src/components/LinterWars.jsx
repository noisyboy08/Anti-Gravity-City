import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── The Linter Wars: Tower Defense ──
export function LinterWars({ islands, active }) {
    const [towers, setTowers] = useState([]);
    const [enemies, setEnemies] = useState([]);
    const lasersRef = useRef([]);

    // Temporary logic: Add a tower when clicked? 
    // We listen to ISLAND_CLICKED event globally.
    React.useEffect(() => {
        if (!active) return;
        const addTower = (e) => {
            const islandId = e.detail?.islandId;
            const island = islands.find(i => i.id === islandId);
            if (island && island.type !== 'core') {
                setTowers(prev => [...prev, { id: Date.now(), position: island.position, type: Math.random() > 0.5 ? 'TS' : 'ESLint' }]);
            }
        };
        window.addEventListener('ISLAND_CLICKED', addTower);

        // Spawn bugs
        const interval = setInterval(() => {
            setEnemies(prev => [...prev, { id: Date.now(), position: [Math.random() * 40 - 20, 30, Math.random() * 40 - 20], hp: 100 }]);
        }, 3000);

        return () => {
            window.removeEventListener('ISLAND_CLICKED', addTower);
            clearInterval(interval);
        };
    }, [active, islands]);

    // Critical perf fix: only update state when there are enemies to update,
    // and bail out the moment the feature is disabled. Before this, even when
    // `active` was false the early-return below this hook never triggered, so
    // setEnemies(new array) ran on every frame and forced a re-render at 60fps.
    useFrame(() => {
        if (!active) return;
        setEnemies(prev => {
            if (prev.length === 0) return prev;
            const next = [];
            for (let i = 0; i < prev.length; i++) {
                const e = prev[i];
                const ny = e.position[1] - 0.1;
                if (ny > 0) {
                    next.push({
                        ...e,
                        position: [e.position[0] * 0.99, ny, e.position[2] * 0.99],
                    });
                }
            }
            return next;
        });
    });

    if (!active) return null;

    return (
        <group>
            {/* Towers */}
            {towers.map(t => (
                <group key={t.id} position={t.position}>
                    <mesh position={[0, 2, 0]}>
                        <cylinderGeometry args={[0.2, 0.4, 1.5]} />
                        <meshStandardMaterial color={t.type === 'TS' ? '#3178c6' : '#4b32c3'} emissive={t.type === 'TS' ? '#3178c6' : '#8080ff'} emissiveIntensity={2} />
                    </mesh>
                    <Html position={[0, 3, 0]} center><div style={{ color: '#fff', fontSize: '10px', background: 'rgba(0,0,0,0.5)', padding: '2px', borderRadius: '4px' }}>{t.type} Cannon</div></Html>
                </group>
            ))}

            {/* Enemies (Raw Commits / Bugs) */}
            {enemies.map(e => (
                <mesh key={e.id} position={e.position}>
                    <icosahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial color="#ff0000" wireframe />
                </mesh>
            ))}
        </group>
    );
}
