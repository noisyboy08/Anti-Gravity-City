import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '../utils/seededRandom';

// ── 1. Performance via InstancedMesh (Render the Linux Kernel) ──
export function InstancedCity({ active, count = 50000 }) {
    const meshRef = useRef();

    // Create matrix and color data for files spreading to the horizon (pure, deterministic)
    const { matrices, baseColors } = useMemo(() => {
        const obj = new THREE.Object3D();
        const colors = new Float32Array(count * 3);
        const matrices = new Float32Array(count * 16);
        const colorObj = new THREE.Color();
        const baseColorList = ['#00f5ff', '#ff0055', '#bb00ff', '#00ff41'];

        for (let i = 0; i < count; i++) {
            const r1 = seededRandom('inst-' + i, 1);
            const r2 = seededRandom('inst-' + i, 2);
            const r3 = seededRandom('inst-' + i, 3);
            const angle = r1 * Math.PI * 2;
            const radius = 200 + r2 * 800;

            obj.position.set(
                Math.cos(angle) * radius,
                (r3 - 0.5) * 50 - 20,
                Math.sin(angle) * radius
            );

            obj.rotation.set(r1 * Math.PI, r2 * Math.PI, r3 * Math.PI);
            const scale = 0.5 + seededRandom('inst-' + i, 4) * 2;
            obj.scale.set(scale, scale, scale);
            obj.updateMatrix();

            obj.matrix.toArray(matrices, i * 16);

            const idx = Math.floor(seededRandom('inst-' + i, 5) * baseColorList.length);
            const c = baseColorList[idx];
            colorObj.set(c);
            colors[i * 3 + 0] = colorObj.r;
            colors[i * 3 + 1] = colorObj.g;
            colors[i * 3 + 2] = colorObj.b;
        }

        return { matrices, baseColors: colors };
    }, [count]);

    // Apply prepared matrices/colors to the instanced mesh once the ref is available
    useEffect(() => {
        if (!meshRef.current) return;
        for (let i = 0; i < count; i++) {
            const m = new THREE.Matrix4();
            m.fromArray(matrices, i * 16);
            meshRef.current.setMatrixAt(i, m);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.geometry) {
            meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(baseColors, 3));
        }
    }, [count, matrices, baseColors]);

    // Animate the rotation of the entire instanced mesh very slowly
    useFrame((state) => {
        if (active && meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
        }
    });

    if (!active) return null;

    return (
        <instancedMesh ref={meshRef} args={[null, null, count]}>
            <octahedronGeometry args={[1, 0]}>
                <instancedBufferAttribute attach="attributes-color" args={[baseColors, 3]} />
            </octahedronGeometry>
            <meshStandardMaterial vertexColors emissiveIntensity={0.8} transparent opacity={0.6} />
        </instancedMesh>
    );
}
