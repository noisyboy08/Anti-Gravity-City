/**
 * StarField.jsx
 * Animated background starfield with nebula particles
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField({ count = 3000, theme = 'cyber-astral' }) {
    const pointsRef = useRef();

    const { positions, colors, sizes } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const sz = new Float32Array(count);

        const primaryColors = {
            'cyber-astral': [[0, 0.96, 1], [0.48, 0.19, 1], [1, 0, 0.67]],
            'bioluminescent': [[0, 1, 0.53], [1, 0.42, 0.21], [1, 1, 0]],
            'steampunk': [[1, 0.58, 0], [0.55, 0.27, 0.07], [1, 0.84, 0]],
            'minimalist-void': [[1, 1, 1], [0.7, 0.7, 0.7], [0.5, 0.5, 0.5]],
        };
        const themeColors = primaryColors[theme] || primaryColors['cyber-astral'];

        for (let i = 0; i < count; i++) {
            // Sphere distribution
            const r = 80 + Math.random() * 120;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            // Mostly white stars, occasional colored ones
            const colorIdx = Math.random() < 0.15 ? Math.floor(Math.random() * themeColors.length) : -1;
            if (colorIdx >= 0) {
                col[i * 3] = themeColors[colorIdx][0];
                col[i * 3 + 1] = themeColors[colorIdx][1];
                col[i * 3 + 2] = themeColors[colorIdx][2];
            } else {
                const brightness = 0.6 + Math.random() * 0.4;
                col[i * 3] = brightness;
                col[i * 3 + 1] = brightness;
                col[i * 3 + 2] = brightness;
            }

            sz[i] = Math.random() * 0.15 + 0.02;
        }

        return { positions: pos, colors: col, sizes: sz };
    }, [count, theme]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        return geo;
    }, [positions, colors, sizes]);

    // Very slow rotation for the starfield
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
            pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.02;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                vertexColors
                sizeAttenuation
                transparent
                opacity={0.9}
                size={0.25}
                depthWrite={false}
            />
        </points>
    );
}

/**
 * Nebula cloud effect - large transparent particles
 */
export function NebulaClouds({ theme = 'cyber-astral' }) {
    const pointsRef = useRef();
    const count = 200;

    const { positions, colors } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);

        const themeNebula = {
            'cyber-astral': new THREE.Color('#7b2fff'),
            'bioluminescent': new THREE.Color('#00ff88'),
            'steampunk': new THREE.Color('#ff9500'),
            'minimalist-void': new THREE.Color('#444444'),
        };
        const nebulaColor = themeNebula[theme] || themeNebula['cyber-astral'];

        for (let i = 0; i < count; i++) {
            const r = 30 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            pos[i * 3] = Math.cos(theta) * r * (0.5 + Math.random());
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 2] = Math.sin(theta) * r * (0.5 + Math.random());

            col[i * 3] = nebulaColor.r;
            col[i * 3 + 1] = nebulaColor.g;
            col[i * 3 + 2] = nebulaColor.b;
        }
        return { positions: pos, colors: col };
    }, [theme]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geo;
    }, [positions, colors]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * -0.008;
        }
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                vertexColors
                size={4}
                transparent
                opacity={0.07}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

/**
 * Vertical light spire (the central beam of the city)
 */
export function VerticalSpire({ color = '#00f5ff' }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
        }
    });

    return (
        <group>
            {/* Main beam */}
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 60, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
            </mesh>
            {/* Glow around the beam */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 60, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.04} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            {/* Bottom base glow */}
            <mesh position={[0, -30, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <circleGeometry args={[8, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.06} depthWrite={false} />
            </mesh>
        </group>
    );
}
