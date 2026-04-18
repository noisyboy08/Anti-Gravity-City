import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { seededRandom } from '../utils/seededRandom';

// Hard ceiling so we never freeze the main thread no matter what `count` the
// caller asks for. 50k instances of a tessellated octahedron + a 50k Matrix4
// allocation loop locks Chrome for several seconds on most machines.
const MAX_SAFE_INSTANCES = 8000;

// ── 1. Performance via InstancedMesh (Render the Linux Kernel) ──
export function InstancedCity({ active, count = 4000 }) {
    const meshRef = useRef();

    // Cap to a safe value before any heavy work.
    const safeCount = Math.min(count, MAX_SAFE_INSTANCES);

    // CRITICAL: do NOT pre-compute when the feature is off. Previously the
    // useMemo always ran even when `active=false`, allocating 50k instances
    // and serialising them to a Float32Array on every mount. That freeze is
    // the single biggest reason the app got "stuck in the middle".
    const { matrices, baseColors } = useMemo(() => {
        if (!active) return { matrices: null, baseColors: null };

        const obj = new THREE.Object3D();
        const colors = new Float32Array(safeCount * 3);
        const matrices = new Float32Array(safeCount * 16);
        const colorObj = new THREE.Color();
        const baseColorList = ['#00f5ff', '#ff0055', '#bb00ff', '#00ff41'];

        for (let i = 0; i < safeCount; i++) {
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
    }, [active, safeCount]);

    // Apply prepared matrices/colors to the instanced mesh once the ref is available.
    // Re-uses a single Matrix4 instead of `new`-ing safeCount of them.
    useEffect(() => {
        if (!active || !meshRef.current || !matrices) return;
        const tmp = new THREE.Matrix4();
        for (let i = 0; i < safeCount; i++) {
            tmp.fromArray(matrices, i * 16);
            meshRef.current.setMatrixAt(i, tmp);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.geometry && baseColors) {
            meshRef.current.geometry.setAttribute(
                'color',
                new THREE.InstancedBufferAttribute(baseColors, 3)
            );
        }
    }, [active, safeCount, matrices, baseColors]);

    // Animate slow rotation only while active (still cheap, but no work when off).
    useFrame((state) => {
        if (active && meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
        }
    });

    if (!active) return null;

    return (
        <instancedMesh ref={meshRef} args={[null, null, safeCount]}>
            <octahedronGeometry args={[1, 0]}>
                <instancedBufferAttribute attach="attributes-color" args={[baseColors, 3]} />
            </octahedronGeometry>
            <meshStandardMaterial vertexColors emissiveIntensity={0.8} transparent opacity={0.6} />
        </instancedMesh>
    );
}
