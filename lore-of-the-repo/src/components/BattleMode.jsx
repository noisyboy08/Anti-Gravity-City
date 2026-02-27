/**
 * BattleMode.jsx — Fixed & Optimized
 * Fixed: ConflictBeam was getting from===to (degenerate geometry crash).
 * Now beams originate from offset positions above the island.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Mock conflicts ─────────────────────────────────────────────
export function getMockConflicts(islands) {
    if (!islands || islands.length < 3) return [];
    return islands
        .filter(i => !i.isCore && (i.altitude || 0) > 3)
        .slice(0, 2)
        .map(island => ({
            islandId: island.id,
            branchA: { name: 'feature/ui-redesign', color: '#00aaff' },
            branchB: { name: 'hotfix/auth-patch', color: '#ff4400' },
        }));
}

// ── GLSL beam shaders ─────────────────────────────────────────
const BEAM_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BEAM_FRAG = `
  uniform float uTime;
  uniform vec3  uColor;
  varying vec2  vUv;
  void main() {
    float pulse = 0.55 + 0.45 * sin(uTime * 7.0 - vUv.x * 10.0);
    float edge  = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
    gl_FragColor = vec4(uColor * pulse, pulse * edge * 0.88);
  }
`;

// ── Conflict Beam ─────────────────────────────────────────────
function ConflictBeam({ islandPos, color, side }) {
    const meshRef = useRef();
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
    }), [color]);

    // Beam originates from a fixed offset above and to the side of the island
    const geo = useMemo(() => {
        const target = new THREE.Vector3(...islandPos);
        const origin = side === 0
            ? new THREE.Vector3(islandPos[0] - 12, islandPos[1] + 8, islandPos[2] + 4)
            : new THREE.Vector3(islandPos[0] + 12, islandPos[1] + 6, islandPos[2] - 4);
        const mid = origin.clone().lerp(target, 0.45);
        mid.y += 3;
        const curve = new THREE.QuadraticBezierCurve3(origin, mid, target);
        const path = new THREE.CatmullRomCurve3(curve.getPoints(20));
        return new THREE.TubeGeometry(path, 20, 0.07, 6, false);
    }, [islandPos, side]);

    useFrame(s => { uniforms.uTime.value = s.clock.elapsedTime; });

    return (
        <mesh ref={meshRef} geometry={geo}>
            <shaderMaterial
                vertexShader={BEAM_VERT}
                fragmentShader={BEAM_FRAG}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
}

// ── Collision particles ───────────────────────────────────────
function CollisionBurst({ position, colorA, colorB }) {
    const pointsRef = useRef();
    const count = 40;

    const { geo, vels } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const col = new Float32Array(count * 3);
        const vels = [];
        const cA = new THREE.Color(colorA);
        const cB = new THREE.Color(colorB);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 0;
            const c = cA.clone().lerp(cB, Math.random());
            col[i * 3] = c.r;
            col[i * 3 + 1] = c.g;
            col[i * 3 + 2] = c.b;
            const a = Math.random() * Math.PI * 2;
            const el = (Math.random() - 0.5) * Math.PI;
            const sp = 0.04 + Math.random() * 0.07;
            vels.push({
                x: Math.cos(a) * Math.cos(el) * sp,
                y: Math.sin(el) * sp + 0.01,
                z: Math.sin(a) * Math.cos(el) * sp,
                life: 0, max: 70 + Math.random() * 60,
            });
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        return { geo: g, vels };
    }, [colorA, colorB]);

    useFrame(() => {
        if (!pointsRef.current) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            const v = vels[i];
            v.life++;
            const drag = 1 - (v.life / v.max) * 0.015;
            attr.array[i * 3] += v.x * drag;
            attr.array[i * 3 + 1] += v.y * drag - 0.0015 * v.life / v.max;
            attr.array[i * 3 + 2] += v.z * drag;
            if (v.life >= v.max) {
                attr.array[i * 3] = attr.array[i * 3 + 1] = attr.array[i * 3 + 2] = 0;
                v.life = 0;
            }
        }
        attr.needsUpdate = true;
    });

    return (
        <group position={position}>
            <points ref={pointsRef} geometry={geo}>
                <pointsMaterial
                    size={0.11} vertexColors transparent opacity={0.82}
                    sizeAttenuation depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>
            <pointLight color={colorA} intensity={2} distance={8} decay={2} />
        </group>
    );
}

// ── Conflict badge ────────────────────────────────────────────
function ConflictBadge({ island, conflict }) {
    return (
        <Html
            position={[0, (island.scale || 1) * 3.5, 0]}
            center distanceFactor={15}
            style={{ pointerEvents: 'none' }}
        >
            <div style={{
                fontFamily: 'Space Mono, monospace', fontSize: '8.5px',
                background: 'rgba(0,0,0,0.88)', border: '1px solid rgba(255,85,0,0.4)',
                borderRadius: '6px', padding: '4px 9px', textAlign: 'center',
                boxShadow: '0 0 14px rgba(255,80,0,0.3)',
            }}>
                <div style={{ color: '#ff4400', fontWeight: 700, marginBottom: '2px' }}>⚔ MERGE CONFLICT</div>
                <div style={{ color: '#00aaff', fontSize: '8px' }}>{conflict.branchA.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '7px' }}>vs</div>
                <div style={{ color: '#ff5500', fontSize: '8px' }}>{conflict.branchB.name}</div>
            </div>
        </Html>
    );
}

// ── Main export ───────────────────────────────────────────────
export function IslandBattle({ island, conflict }) {
    if (!conflict || !island?.position) return null;

    return (
        <group>
            <ConflictBeam islandPos={island.position} color={conflict.branchA.color} side={0} />
            <ConflictBeam islandPos={island.position} color={conflict.branchB.color} side={1} />
            <CollisionBurst
                position={island.position}
                colorA={conflict.branchA.color}
                colorB={conflict.branchB.color}
            />
            <ConflictBadge island={island} conflict={conflict} />
        </group>
    );
}
