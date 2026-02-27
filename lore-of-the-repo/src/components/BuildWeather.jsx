/**
 * BuildWeather.jsx — Performance Fixed & Optimized
 * CI/CD health visualization (sun vs rain).
 * Fixed: Lightning component was calling setState inside useFrame repeatedly!
 * Refactored to manage state silently via refs for maximum performance.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Rain Particles ─────────────────────────────────────────────
function RainSystem({ center, radius = 9, count = 250 }) {
    const pointsRef = useRef();

    const { positions, velocities, geo } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vels = [];
        for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            // Start randomly positioned inside the column
            pos[i * 3] = center[0] + Math.cos(a) * r;
            pos[i * 3 + 1] = center[1] + Math.random() * 12;
            pos[i * 3 + 2] = center[2] + Math.sin(a) * r;
            // Drop speed
            vels.push({
                y: -(0.06 + Math.random() * 0.08),
                x: (Math.random() - 0.5) * 0.015
            });
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return { positions: pos, velocities: vels, geo: g };
    }, [center, radius, count]);

    useFrame(() => {
        if (!pointsRef.current) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            attr.array[i * 3] += velocities[i].x;
            attr.array[i * 3 + 1] += velocities[i].y;

            // Respawn at cloud level when hitting ground
            if (attr.array[i * 3 + 1] < center[1] - 3) {
                const a = Math.random() * Math.PI * 2;
                const r = Math.random() * radius;
                attr.array[i * 3] = center[0] + Math.cos(a) * r;
                attr.array[i * 3 + 1] = center[1] + 9 + Math.random() * 4;
                attr.array[i * 3 + 2] = center[2] + Math.sin(a) * r;
            }
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial color="#88aacc" size={0.07} transparent opacity={0.65} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
}

// ── Lightning (Crash-proof) ───────────────────────────────────
function Lightning({ center }) {
    const lightRef = useRef();
    const timerRef = useRef(0);
    const flashEndRef = useRef(0);

    // Offset position slightly above center
    const lPos = useMemo(() => [
        center[0] + (Math.random() - 0.5) * 4,
        center[1] + 6,
        center[2]
    ], [center]);

    useFrame((state, delta) => {
        if (!lightRef.current) return;

        // Instead of setState, we just update the light intensity directly, avoiding re-renders
        const time = state.clock.elapsedTime;
        timerRef.current += delta;

        // Trigger flash randomly between 0.7s - 3.2s
        if (timerRef.current > 0.7 + Math.random() * 2.5) {
            timerRef.current = 0;
            // Flash lasts 80ms - 200ms
            flashEndRef.current = time + (0.08 + Math.random() * 0.12);
        }

        if (time < flashEndRef.current) {
            lightRef.current.intensity = 15 + Math.random() * 12; // flicker
        } else {
            lightRef.current.intensity = 0;
        }
    });

    return (
        <pointLight ref={lightRef} position={lPos} color="#b0d0ff" distance={20} decay={2} intensity={0} />
    );
}

// ── Clear-Sky Sunburst (pass) ─────────────────────────────────
function SunburstEffect({ position }) {
    const groupRef = useRef();
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.elapsedTime * 0.12;
        }
    });

    const rays = 12;
    const meshes = useMemo(() => {
        return Array.from({ length: rays }).map((_, i) => {
            const angle = (i / rays) * Math.PI * 2;
            return (
                <mesh key={i} position={[Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0]} rotation={[0, 0, angle]}>
                    <planeGeometry args={[0.07, 2.6]} />
                    <meshBasicMaterial color="#ffffa0" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
            );
        });
    }, [rays]);

    return (
        <group ref={groupRef} position={position}>
            {meshes}
            <pointLight color="#ffffa0" intensity={3} distance={15} decay={2} />
        </group>
    );
}

// ── Build Cloud Badge (shows CI status) ───────────────────────
function CIBadge({ island, status }) {
    // Use static references to avoid recreation
    const cfg = useMemo(() => {
        const list = {
            pass: { color: '#00ff88', icon: '✅', label: 'BUILD PASS' },
            fail: { color: '#ff3344', icon: '❌', label: 'BUILD FAIL' },
            pending: { color: '#ffaa00', icon: '⏳', label: 'CI RUNNING' },
        };
        return list[status] || list.pending;
    }, [status]);

    return (
        <Html position={[0, (island.scale || 1) * 3.5, 0]} center distanceFactor={16} style={{ pointerEvents: 'none' }}>
            <div style={{
                background: `rgba(0,0,0,0.85)`, border: `1px solid ${cfg.color}55`,
                borderRadius: '6px', padding: '3px 9px',
                fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 'bold',
                color: cfg.color, whiteSpace: 'nowrap',
                boxShadow: `0 0 12px ${cfg.color}33`,
            }}>
                {cfg.icon} {cfg.label}
            </div>
        </Html>
    );
}

// ── Mock CI state for random islands ─────────────────────────
const BUILD_STATES = ['pass', 'fail', 'pending', 'pass', 'pass']; // Bias toward pass
export function getBuildState(islandName) {
    const hash = (islandName || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return BUILD_STATES[hash % BUILD_STATES.length];
}

// ── Main Export ───────────────────────────────────────────────
export function BuildWeather({ island, buildStatus, active }) {
    if (!active || !island || !island.position) return null;

    const pos = island.position;
    const status = buildStatus || getBuildState(island.name);

    return (
        <group>
            <CIBadge island={island} status={status} />

            {status === 'fail' && (
                <>
                    <RainSystem center={pos} />
                    <Lightning center={pos} />
                    {/* Subtle dark fog spot instead of heavy light subtraction */}
                    <pointLight position={[pos[0], pos[1] + 4, pos[2]]} color="#000022" intensity={-0.2} distance={8} />
                </>
            )}

            {status === 'pass' && (
                <SunburstEffect position={[pos[0], pos[1] + (island.scale || 1) * 2.5, pos[2]]} />
            )}

            {status === 'pending' && (
                <pointLight position={pos} color="#ffaa00" intensity={1.2} distance={10} decay={2} />
            )}
        </group>
    );
}

// ── Global weather overlay (scene-level) ─────────────────────
export function GlobalWeatherFog({ islands, active }) {
    const anyFail = useMemo(() => islands?.some(i => getBuildState(i.name) === 'fail'), [islands]);
    if (!active || !anyFail) return null;

    return (
        <>
            {/* Dark storm atmosphere */}
            <fog attach="fog" args={['#050010', 20, 90]} />
            <ambientLight intensity={0.10} color="#050015" />
        </>
    );
}
