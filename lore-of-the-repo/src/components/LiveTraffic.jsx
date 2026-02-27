/**
 * LiveTraffic.jsx — Performance Fixed & Optimized
 * Mock WebSocket traffic simulation.
 * Fixed: Removed useFrame state-update callbacks that caused React rendering crash loops.
 * Packets are managed by an independent timer, avoiding frame-synced React setState cascading.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Packet particle along a bezier curve ──────────────────────
function DataPacket({ from, to, color, speed, size }) {
    const meshRef = useRef();
    const progressRef = useRef(Math.random() * 0.3); // Start slightly offset

    // Pre-calculate the arc path
    const curve = useMemo(() => {
        const f = new THREE.Vector3(...from);
        const t = new THREE.Vector3(...to);
        const mid = f.clone().add(t).multiplyScalar(0.5);
        mid.y += 4 + Math.random() * 5;
        return new THREE.QuadraticBezierCurve3(f, mid, t);
    }, [from, to]);

    const pVec = useMemo(() => new THREE.Vector3(), []);

    useFrame((_, delta) => {
        if (!meshRef.current) return;
        progressRef.current += delta * speed;

        // Instead of calling a React setState callback `onDone`, we just visually hide the mesh
        // when it reaches the end. The parent's interval will clean up the object eventually.
        if (progressRef.current >= 1) {
            meshRef.current.visible = false;
            return;
        }

        meshRef.current.visible = true;
        curve.getPoint(progressRef.current, pVec);
        meshRef.current.position.copy(pVec);

        // Smooth pulse scaling
        const s = size * (0.6 + 0.4 * Math.sin(progressRef.current * Math.PI * 6));
        meshRef.current.scale.setScalar(s);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.88} depthWrite={false} />
        </mesh>
    );
}

// ── Beam trail along the curve ────────────────────────────────
function TrafficBeamTrail({ from, to, color, opacity = 0.25 }) {
    const points = useMemo(() => {
        const f = new THREE.Vector3(...from);
        const t = new THREE.Vector3(...to);
        const mid = f.clone().add(t).multiplyScalar(0.5);
        mid.y += 4;
        return new THREE.QuadraticBezierCurve3(f, mid, t).getPoints(24);
    }, [from, to]);

    const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line geometry={geo}>
            <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} linewidth={1} />
        </line>
    );
}

// ── Mock WebSocket event emitter ──────────────────────────────
function useMockWebSocket(islands, active) {
    const [packets, setPackets] = useState([]);
    const idCounter = useRef(0);

    useEffect(() => {
        if (!active || !islands || islands.length < 2) {
            setPackets([]);
            return;
        }

        const interval = setInterval(() => {
            setPackets(prev => {
                // Clean up packets older than 4 seconds to prevent runaway memory
                const now = Date.now();
                const activePackets = prev.filter(p => now - p.createdAt < 4000);

                if (activePackets.length >= 20) return activePackets; // Cap max active

                const candidates = islands.filter(i => !i.isCore);
                if (candidates.length < 2) return activePackets;

                // Pick random endpoints
                const fromIdx = Math.floor(Math.random() * candidates.length);
                let toIdx = Math.floor(Math.random() * candidates.length);
                if (fromIdx === toIdx) toIdx = (toIdx + 1) % candidates.length;

                const fromIsland = candidates[fromIdx];
                const toIsland = candidates[toIdx];

                const types = [
                    { color: '#00f5ff', size: 0.18 }, // GET
                    { color: '#00ff88', size: 0.22 }, // POST
                    { color: '#ff9900', size: 0.15 }, // EVENT
                    { color: '#dd44ff', size: 0.19 }, // WS
                ];
                const type = types[Math.floor(Math.random() * types.length)];
                idCounter.current += 1;

                return [
                    ...activePackets,
                    {
                        id: idCounter.current,
                        createdAt: now,
                        from: fromIsland.position,
                        to: toIsland.position,
                        color: type.color,
                        size: type.size,
                        speed: 0.25 + Math.random() * 0.35,
                    }
                ];
            });
        }, 450); // Spawn time

        return () => clearInterval(interval);
    }, [active, islands]);

    return packets;
}

// ── Main Export ───────────────────────────────────────────────
export function LiveTraffic({ islands, active, themeColor = '#00f5ff' }) {
    const packets = useMockWebSocket(islands, active);

    // Background, static trails between islands
    const trails = useMemo(() => {
        if (!islands || !active) return [];
        // Only map between nearest neighbors to limit geometry
        return islands.slice(0, 10).flatMap((a, i) =>
            islands.slice(i + 1, i + 3).map(b => ({
                key: `${a.id}-${b.id}`,
                from: a.position,
                to: b.position,
            }))
        );
    }, [islands, active]);

    if (!active || !islands) return null;

    return (
        <group>
            {trails.map(t => (
                <TrafficBeamTrail key={t.key} from={t.from} to={t.to} color={themeColor} opacity={0.06} />
            ))}

            {packets.map(p => (
                <DataPacket
                    key={p.id}
                    from={p.from}
                    to={p.to}
                    color={p.color}
                    speed={p.speed}
                    size={p.size}
                />
            ))}
        </group>
    );
}
