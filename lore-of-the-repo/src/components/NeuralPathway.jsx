/**
 * NeuralPathway.jsx
 * AI/ML Neural Architecture view mode.
 * Transforms islands into floating neural nodes connected by weight-lines.
 * LineSegments whose emissiveIntensity represents weight, thickness represents bias.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Neural Node ───────────────────────────────────────────────
function NeuralNode({ island, color, weight, activated }) {
    const meshRef = useRef();
    const ringRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            const pulse = activated
                ? 2 + 1.5 * Math.abs(Math.sin(t * (3 + weight * 4)))
                : 0.5 + 0.3 * Math.sin(t * 1.2);
            meshRef.current.material.emissiveIntensity = pulse;
        }
        if (ringRef.current) {
            ringRef.current.rotation.y += 0.015 * (1 + weight);
            ringRef.current.rotation.z += 0.008;
            ringRef.current.material.opacity = 0.25 + weight * 0.5;
        }
    });

    const nodeSize = 0.2 + weight * 0.4;

    return (
        <group position={island.position}>
            {/* Core sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[nodeSize, 12, 12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    roughness={0}
                    metalness={0.8}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Weight rings */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[nodeSize * 2.2, nodeSize * 0.08, 6, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} />
            </mesh>

            {/* Point light proportional to weight */}
            <pointLight color={color} intensity={2 + weight * 3} distance={5 + weight * 6} decay={2} />

            {/* Node metadata */}
            <Html position={[0, nodeSize + 0.8, 0]} center distanceFactor={16} style={{ pointerEvents: 'none' }}>
                <div style={{
                    fontFamily: 'Space Mono, monospace', fontSize: '8px',
                    color, background: 'rgba(0,0,0,0.7)', border: `1px solid ${color}44`,
                    borderRadius: '4px', padding: '2px 7px', whiteSpace: 'nowrap',
                }}>
                    w={weight.toFixed(2)} · {island.name}
                </div>
            </Html>
        </group>
    );
}

// ── Weight Connection Lines ───────────────────────────────────
function WeightLines({ islands, color }) {
    const linesRef = useRef();

    const { positions, intensities } = useMemo(() => {
        const pts = [];
        const ix = [];
        const n = islands.length;

        // Create a layered neural graph: each layer connects to next
        for (let i = 0; i < n - 1; i++) {
            const from = islands[i].position;
            // Connect to next 2 nodes (simulate dense layer)
            for (let j = 1; j <= Math.min(2, n - 1 - i); j++) {
                const to = islands[i + j].position;
                pts.push(from[0], from[1], from[2], to[0], to[1], to[2]);

                // Random weight as intensity
                const w = 0.2 + Math.random() * 0.8;
                ix.push(w, w);
            }
        }

        return { positions: new Float32Array(pts), intensities: ix };
    }, [islands]);

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    useFrame((state) => {
        if (linesRef.current) {
            // Pulse all connections
            linesRef.current.material.opacity = 0.3 + 0.25 * Math.sin(state.clock.elapsedTime * 2);
        }
    });

    return (
        <lineSegments ref={linesRef} geometry={geo}>
            <lineBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} linewidth={1} />
        </lineSegments>
    );
}

// ── Signal Pulse along weights ─────────────────────────────────
function SignalPulse({ from, to, color, offset }) {
    const meshRef = useRef();
    const progressRef = useRef(offset || 0);

    const fromV = useMemo(() => new THREE.Vector3(...from), [from]);
    const toV = useMemo(() => new THREE.Vector3(...to), [to]);
    const tmp = useMemo(() => new THREE.Vector3(), []);

    useFrame((_, delta) => {
        progressRef.current = (progressRef.current + delta * 0.8) % 1;
        tmp.lerpVectors(fromV, toV, progressRef.current);
        if (meshRef.current) meshRef.current.position.copy(tmp);
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.07, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}

// ── Main Export ───────────────────────────────────────────────
export function NeuralPathway({ islands, active, themeColor = '#dd00ff' }) {
    const neuralColor = themeColor || '#dd00ff';

    const nodeData = useMemo(() => {
        if (!islands) return [];
        return islands.map((island, i) => {
            const nameHash = (island.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const weight = 0.15 + (nameHash % 100) / 100 * 0.85;
            const activated = weight > 0.65;
            return { island, weight, activated };
        });
    }, [islands]);

    const connections = useMemo(() => {
        if (!nodeData || nodeData.length < 2) return [];
        return nodeData.slice(0, -1).flatMap((a, i) =>
            nodeData.slice(i + 1, i + 3).map((b, j) => ({
                key: `${a.island.id}-${b.island.id}`,
                from: a.island.position,
                to: b.island.position,
                offset: (i + j) * 0.3,
            }))
        );
    }, [nodeData]);

    if (!active || !islands?.length) return null;

    return (
        <group>
            {/* Background weight line network */}
            {islands.length >= 2 && <WeightLines islands={islands} color={neuralColor} />}

            {/* Neural nodes */}
            {nodeData.map(({ island, weight, activated }) => (
                <NeuralNode
                    key={island.id}
                    island={island}
                    color={neuralColor}
                    weight={weight}
                    activated={activated}
                />
            ))}

            {/* Traveling signal pulses */}
            {connections.slice(0, 12).map(c => (
                <SignalPulse key={c.key} from={c.from} to={c.to} color={neuralColor} offset={c.offset} />
            ))}
        </group>
    );
}
