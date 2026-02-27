import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { seededRandom } from '../utils/seededRandom';

// ── 3. Jira / Linear Issue Tracking Integration ─────────────────
export function JiraTickets({ islands, active }) {
    // Generate mock active bugs for a random subset of islands
    const bugData = useMemo(() => {
        if (!islands) return [];
        return islands.map(island => {
            const r = seededRandom(island.id || 'anon');
            if (r <= 0.85) return null;
            const bugCount = Math.floor(seededRandom(island.id || 'anon', 1) * 4) + 1;
            return {
                id: `jira-${island.id}`,
                pos: island.position,
                count: bugCount,
                altitude: island.altitude || 10
            };
        }).filter(Boolean);
    }, [islands]);

    if (!active || !islands) return null;

    return (
        <group>
            {bugData.map(bug => (
                <JiraMarker key={bug.id} data={bug} />
            ))}
        </group>
    );
}

function JiraMarker({ data }) {
    const markerRef = useRef();

    useFrame((state) => {
        if (!markerRef.current) return;
        const t = state.clock.elapsedTime;
        // Bounce up and down
        markerRef.current.position.y = data.altitude + 5 + Math.sin(t * 3 + data.id.length) * 1.5;
        // Spin
        markerRef.current.rotation.y = t * 2;
    });

    return (
        <group position={[data.pos[0], data.altitude + 5, data.pos[2]]} ref={markerRef}>
            {/* The Floating Exclamation Mark */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.4, 4, 16]} />
                <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0, -3, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} />
            </mesh>
            <pointLight color="#ff0000" intensity={50} distance={20} />

            {/* Floating UI Ticket Tag */}
            <Html center position={[0, 4, 0]} distanceFactor={60}>
                <div style={{
                    background: 'rgba(255,0,0,0.85)', color: 'white', padding: '4px 8px',
                    borderRadius: '4px', fontFamily: 'monospace', fontWeight: 'bold', border: '1px solid #ffaa00',
                    fontSize: '12px', whiteSpace: 'nowrap', boxShadow: '0 0 10px rgba(255,0,0,0.5)',
                    pointerEvents: 'none'
                }}>
                    💥 {data.count} Open Bug{data.count > 1 ? 's' : ''} (Jira)
                </div>
            </Html>
        </group>
    );
}
