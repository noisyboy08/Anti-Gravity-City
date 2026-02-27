/**
 * LegacyDecay.jsx
 * Maps "time since last commit" to visual rust/moss decay on island materials.
 * Older files → higher roughness, lower opacity, brownish tint, crumbling particles.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Decay Calculator ──────────────────────────────────────────
export function getDecayLevel(island, repoCreatedAt) {
    // Use island's position in the layout as a proxy for "age"
    // Islands at higher altitude = newer code (recently touched directories)
    // Islands at low altitude = older, peripheral code
    const base = 1 - Math.min(1, (island.altitude || 0) / 12);

    // Add some deterministic variation per island name
    const nameHash = (island.name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const variation = (nameHash % 100) / 100;

    return Math.min(1, base * 0.7 + variation * 0.3);
}

export function getDecayMaterialProps(decayLevel) {
    // Low decay (new): smooth, metallic, full color
    // High decay (old): rough, dull, brownish, semi-transparent
    return {
        roughness: 0.1 + decayLevel * 0.88,
        metalness: 0.9 - decayLevel * 0.8,
        opacity: 1.0 - decayLevel * 0.45,
        colorShift: decayLevel,           // 0 = original, 1 = rust-brown
        emissiveScale: 1 - decayLevel * 0.7,
    };
}

// ── Decay Particle Crumbles ───────────────────────────────────
export function DecayParticles({ position, decay, color }) {
    const pointsRef = useRef();
    const count = Math.floor(decay * 25);

    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = [];
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 2;
            pos[i * 3 + 1] = Math.random() * 1.5;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
            vel.push({ x: (Math.random() - 0.5) * 0.003, y: -0.008 - Math.random() * 0.005, vy0: 0 });
        }
        return { positions: pos, velocities: vel };
    }, [count]);

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    useFrame(() => {
        if (!pointsRef.current || count === 0) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            attr.array[i * 3] += velocities[i].x;
            attr.array[i * 3 + 1] += velocities[i].y;
            attr.array[i * 3 + 2] += velocities[i].z || 0;
            if (attr.array[i * 3 + 1] < -2) {
                attr.array[i * 3] = (Math.random() - 0.5) * 2;
                attr.array[i * 3 + 1] = 1 + Math.random();
                attr.array[i * 3 + 2] = (Math.random() - 0.5) * 2;
            }
        }
        attr.needsUpdate = true;
    });

    if (count === 0) return null;

    // Rust color
    const rustColor = new THREE.Color('#8B4513').lerp(new THREE.Color(color), 1 - decay);

    return (
        <group position={position}>
            <points ref={pointsRef} geometry={geo}>
                <pointsMaterial
                    color={rustColor}
                    size={0.04 + decay * 0.06}
                    transparent
                    opacity={0.45 * decay}
                    sizeAttenuation
                    depthWrite={false}
                />
            </points>
        </group>
    );
}

// ── Moss/Rust Decal Layer ─────────────────────────────────────
export function DecayOverlay({ island, decay }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = decay * 0.35 * (0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 0.3));
        }
    });

    if (decay < 0.25) return null;

    return (
        <mesh ref={meshRef} scale={[island.scale * 1.82, island.scale * 0.78, island.scale * 1.82]} position={[0, 0, 0]}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
                color={decay > 0.65 ? '#7a3a1a' : '#3a6a2a'}  // rust or moss
                roughness={0.99}
                metalness={0}
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.MultiplyBlending}
            />
        </mesh>
    );
}
