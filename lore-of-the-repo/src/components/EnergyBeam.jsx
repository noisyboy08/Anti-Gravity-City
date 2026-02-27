/**
 * EnergyBeam.jsx — GC Optimized
 * Glowing energy beams connecting floating islands.
 * Fixed: Removed all new THREE.Vector3() calls from within useFrame to prevent GC stutter.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BEAM_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BEAM_FRAG = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float pulse = sin(vUv.x * 10.0 - uTime * 3.0) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    float alpha = (pulse * 0.5 + 0.5) * uOpacity * edge;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function EnergyBeam({ from, to, color, thickness = 1, isPrimary = false }) {
    const meshRef = useRef();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: isPrimary ? 0.7 : 0.35 },
    }), []); // Init once

    useEffect(() => {
        uniforms.uColor.value.set(color);
        uniforms.uOpacity.value = isPrimary ? 0.7 : 0.35;
    }, [color, isPrimary, uniforms]);

    // Create tube geometry along the beam path
    const tubeGeometry = useMemo(() => {
        const fromVec = new THREE.Vector3(...from);
        const toVec = new THREE.Vector3(...to);
        const mid = new THREE.Vector3().lerpVectors(fromVec, toVec, 0.5);
        mid.y += 1.5;

        const curve = new THREE.QuadraticBezierCurve3(fromVec, mid, toVec);
        return new THREE.TubeGeometry(curve, 20, thickness * 0.04, 6, false);
    }, [from, to, thickness]);

    const material = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms,
            vertexShader: BEAM_VERT,
            fragmentShader: BEAM_FRAG,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
    }, [uniforms]);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
    });

    return (
        <mesh ref={meshRef} geometry={tubeGeometry} material={material} />
    );
}

/**
 * GC-Free Particle trail along the beam
 */
export function BeamParticles({ from, to, color }) {
    const pointsRef = useRef();
    const count = 20;

    const { positions, initialPositions } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const initial = new Float32Array(count);
        const f = new THREE.Vector3(...from);
        const t = new THREE.Vector3(...to);
        const tmp = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const phase = i / count;
            tmp.lerpVectors(f, t, phase);
            pos[i * 3] = tmp.x;
            pos[i * 3 + 1] = tmp.y + (Math.random() - 0.5) * 0.3;
            pos[i * 3 + 2] = tmp.z;
            initial[i] = phase;
        }
        return { positions: pos, initialPositions: initial };
    }, [from, to]);

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
        return geo;
    }, [positions]);

    // Pre-allocate vectors outside the render loop
    const fVec = useMemo(() => new THREE.Vector3(...from), [from]);
    const tVec = useMemo(() => new THREE.Vector3(...to), [to]);
    const tmpVec = useMemo(() => new THREE.Vector3(), []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const posAttr = pointsRef.current.geometry.attributes.position;
        const time = state.clock.elapsedTime;

        for (let i = 0; i < count; i++) {
            const phase = (initialPositions[i] + time * 0.3) % 1;
            tmpVec.lerpVectors(fVec, tVec, phase);
            posAttr.setXYZ(i, tmpVec.x, tmpVec.y + Math.sin(time * 2 + i) * 0.1, tmpVec.z);
        }
        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} geometry={geometry}>
            <pointsMaterial
                color={color}
                size={0.08}
                transparent
                opacity={0.6}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
