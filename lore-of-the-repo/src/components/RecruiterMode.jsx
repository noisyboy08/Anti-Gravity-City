/**
 * RecruiterMode.jsx
 * Activated by ?mode=hire URL param.
 * Renders a massive holographic portfolio billboard above the city core.
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Check URL param ────────────────────────────────────────────
export function useRecruiterMode() {
    return useMemo(() => {
        if (typeof window === 'undefined') return false;
        return new URLSearchParams(window.location.search).get('mode') === 'hire';
    }, []);
}

// ── Skill chip floating in 3D ──────────────────────────────────
function SkillOrb({ skill, color, radius, angle, speed, yOff }) {
    const groupRef = useRef();
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        const a = angle + t * speed;
        groupRef.current.position.set(
            Math.cos(a) * radius,
            yOff + Math.sin(t * 0.4 + angle) * 0.3,
            Math.sin(a) * radius,
        );
    });

    return (
        <group ref={groupRef}>
            <mesh>
                <sphereGeometry args={[0.18, 8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0} metalness={0.8} />
            </mesh>
            <pointLight color={color} intensity={1.2} distance={3} decay={2} />
            <Html center distanceFactor={14} style={{ pointerEvents: 'none' }}>
                <div style={{
                    fontFamily: 'Space Mono, monospace', fontSize: '8px', fontWeight: 700,
                    color, background: 'rgba(0,0,10,0.75)', border: `1px solid ${color}55`,
                    borderRadius: '4px', padding: '2px 7px', whiteSpace: 'nowrap',
                    boxShadow: `0 0 8px ${color}33`,
                }}>{skill}</div>
            </Html>
        </group>
    );
}

// ── 3D Avatar proxy ───────────────────────────────────────────
function HoloBust({ color }) {
    const headRef = useRef();
    const ringRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (headRef.current) {
            headRef.current.rotation.y = Math.sin(t * 0.5) * 0.35;
        }
        if (ringRef.current) {
            ringRef.current.rotation.y += 0.012;
            ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.15;
        }
    });

    return (
        <group>
            {/* Head */}
            <mesh ref={headRef} position={[0, 0.6, 0]}>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshStandardMaterial color="#0a0a2a" emissive={color} emissiveIntensity={0.4}
                    roughness={0} metalness={0.9} transparent opacity={0.85} wireframe={false} />
            </mesh>
            {/* Eyes */}
            {[-0.2, 0.2].map((x, i) => (
                <mesh key={i} position={[x, 0.65, 0.48]}>
                    <sphereGeometry args={[0.075, 8, 8]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
                </mesh>
            ))}
            {/* Neck */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.14, 0.18, 0.4, 8]} />
                <meshStandardMaterial color="#0a0a2a" emissive={color} emissiveIntensity={0.2} roughness={0.2} />
            </mesh>
            {/* Shoulders */}
            <mesh position={[0, -0.15, 0]}>
                <cylinderGeometry args={[0.6, 0.5, 0.3, 12]} />
                <meshStandardMaterial color="#060618" emissive={color} emissiveIntensity={0.15} roughness={0.3} />
            </mesh>
            {/* Holo rings */}
            <group ref={ringRef}>
                {[1.0, 1.3].map((r, i) => (
                    <mesh key={i} rotation={[Math.PI / 2, 0, i * 1.1]}>
                        <torusGeometry args={[r, 0.025, 6, 48]} />
                        <meshBasicMaterial color={color} transparent opacity={0.4} depthWrite={false} />
                    </mesh>
                ))}
            </group>
            <pointLight color={color} intensity={3} distance={5} decay={2} position={[0, 1, 1]} />
        </group>
    );
}

// ── Main billboard panel (HTML overlay) ───────────────────────
function Bill({ themeColor, name, title, skills, links }) {
    const [activeSkill, setActiveSkill] = useState(null);

    return (
        <Html center distanceFactor={22} style={{ pointerEvents: 'all', zIndex: 50 }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                style={{
                    width: '320px',
                    background: 'rgba(0,2,20,0.92)',
                    border: `1px solid ${themeColor}55`,
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 0 60px ${themeColor}22, inset 0 0 40px rgba(0,0,0,0.5)`,
                    fontFamily: 'Space Mono, monospace',
                    overflow: 'hidden',
                }}
            >
                {/* Header scanline */}
                <div style={{
                    height: '2px', background: `linear-gradient(90deg, transparent, ${themeColor}, transparent)`,
                    animation: 'scan 2s linear infinite',
                }} />

                {/* Top bar */}
                <div style={{
                    padding: '10px 16px 8px', display: 'flex', alignItems: 'center', gap: '8px',
                    borderBottom: `1px solid ${themeColor}22`
                }}>
                    <div style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: themeColor,
                        boxShadow: `0 0 8px ${themeColor}`, animation: 'pulse 1.5s infinite'
                    }} />
                    <span style={{ fontSize: '8px', letterSpacing: '.2em', color: themeColor, flex: 1 }}>
                        RECRUITER MODE ACTIVE
                    </span>
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>
                        {new Date().getFullYear()}
                    </span>
                </div>

                {/* Name block */}
                <div style={{ padding: '14px 16px 10px', textAlign: 'center' }}>
                    <div style={{
                        fontSize: '22px', fontWeight: 900, color: '#fff',
                        letterSpacing: '.08em', textShadow: `0 0 20px ${themeColor}88`
                    }}>
                        {name}
                    </div>
                    <div style={{ fontSize: '10px', color: themeColor, letterSpacing: '.15em', marginTop: '4px' }}>
                        {title}
                    </div>
                </div>

                {/* Skills */}
                <div style={{ padding: '6px 14px 10px' }}>
                    <div style={{
                        fontSize: '7.5px', letterSpacing: '.18em', color: 'rgba(255,255,255,0.35)',
                        marginBottom: '8px'
                    }}>CAPABILITIES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {skills.map((s, i) => (
                            <motion.span
                                key={s.name}
                                onClick={() => setActiveSkill(activeSkill === s.name ? null : s.name)}
                                style={{
                                    fontSize: '9px', fontWeight: 700, padding: '3px 9px',
                                    borderRadius: '20px', border: `1px solid ${s.color}66`,
                                    color: activeSkill === s.name ? '#000' : s.color,
                                    background: activeSkill === s.name ? s.color : `${s.color}12`,
                                    cursor: 'pointer', letterSpacing: '.04em',
                                    boxShadow: activeSkill === s.name ? `0 0 14px ${s.color}55` : 'none',
                                    transition: 'all 0.2s',
                                }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                {s.name}
                            </motion.span>
                        ))}
                    </div>
                </div>

                {/* Links */}
                <div style={{
                    padding: '8px 14px 12px', display: 'flex', gap: '8px',
                    borderTop: `1px solid ${themeColor}18`,
                }}>
                    {links.map(l => (
                        <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{
                            flex: 1, textAlign: 'center', fontSize: '9px', fontWeight: 700,
                            letterSpacing: '.08em', color: themeColor,
                            border: `1px solid ${themeColor}44`, borderRadius: '8px',
                            padding: '6px 10px', textDecoration: 'none',
                            background: `${themeColor}0a`, transition: 'all 0.2s',
                        }}>
                            {l.label}
                        </a>
                    ))}
                </div>

                {/* Bottom scanline */}
                <div style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${themeColor}44, transparent)` }} />
            </motion.div>
        </Html>
    );
}

// ── Holographic Billboard above core ─────────────────────────
const SKILLS = [
    { name: 'React', color: '#61dafb' },
    { name: 'Three.js', color: '#00ff88' },
    { name: 'Node.js', color: '#68a063' },
    { name: 'TypeScript', color: '#3178c6' },
    { name: 'Python', color: '#ffcc00' },
    { name: 'WebGL', color: '#ff6b6b' },
    { name: 'AI/ML', color: '#dd00ff' },
    { name: 'DevOps', color: '#ff9500' },
];

// (Edit these to your real info)
const RECRUITER_PROFILE = {
    name: 'DEV.EXE',
    title: 'FULL-STACK ENGINEER · 3D/XR SPECIALIST',
    skills: SKILLS,
    links: [
        { label: '⬡ GitHub', url: 'https://github.com' },
        { label: '◈ LinkedIn', url: 'https://linkedin.com' },
        { label: '⌘ Portfolio', url: 'https://example.com' },
    ],
};

export function RecruiterBillboard({ coreIsland, themeColor }) {
    const baseY = coreIsland
        ? coreIsland.position[1] + coreIsland.scale * 6
        : 16;
    const basePos = coreIsland
        ? [coreIsland.position[0], baseY, coreIsland.position[2]]
        : [0, 16, 0];

    return (
        <Float speed={1.5} rotationIntensity={0.04} floatIntensity={0.4}>
            <group position={basePos}>
                {/* 3D Avatar */}
                <group position={[0, -2, 0]}>
                    <HoloBust color={themeColor} />
                </group>

                {/* Billboard HTML panel */}
                <group position={[0, 2.5, 0]}>
                    <Bill
                        themeColor={themeColor}
                        name={RECRUITER_PROFILE.name}
                        title={RECRUITER_PROFILE.title}
                        skills={RECRUITER_PROFILE.skills}
                        links={RECRUITER_PROFILE.links}
                    />
                </group>

                {/* Orbiting skill orbs */}
                {SKILLS.map((skill, i) => (
                    <SkillOrb
                        key={skill.name}
                        skill={skill.name}
                        color={skill.color}
                        radius={3.8 + (i % 2) * 0.8}
                        angle={(i / SKILLS.length) * Math.PI * 2}
                        speed={0.12 + i * 0.015}
                        yOff={-0.5 + (i % 3 - 1) * 0.6}
                    />
                ))}

                {/* Pillar of light from below */}
                <mesh position={[0, -10, 0]}>
                    <cylinderGeometry args={[0.08, 0.6, 20, 8, 1, true]} />
                    <meshBasicMaterial color={themeColor} transparent opacity={0.08}
                        side={THREE.DoubleSide} depthWrite={false} />
                </mesh>

                {/* Core ambient glow */}
                <pointLight color={themeColor} intensity={5} distance={18} decay={2} />
            </group>
        </Float>
    );
}
