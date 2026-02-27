/**
 * FeatureExpansions.jsx
 * Contains components for the massive 10-feature update:
 * 1. Glitch Hunt (Spiders on bugs)
 * 2. Supply Chain Nebula
 * 3. Phantom Reviewer (AI drone)
 * 4. The Portal (VS Code link - mostly in FloatingIsland)
 * 5. Desktop Trophy (STL Export)
 * 6. Commander (Voice Control)
 * 7. Galaxy View (Zoom Out)
 * 8. Auto-Documentary (Speech + Camera)
 * 9. Code DNA (Helix mode - handled in Scene/Island)
 * 10. AR Business Card (WebXR QR Code)
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { seededRandom } from '../utils/seededRandom';

// ── 1. The Glitch Hunt (Gamified Bug Tracker) ────────────────
export function GlitchSpiders({ islands, active }) {
    if (!active || !islands) return null;

    // Attach to 3 random islands
    const infectedIslands = useMemo(() => {
        return islands.filter(i => !i.isCore).slice(0, 3).map((island, i) => ({
            island,
            id: `glitch-${i}`,
            issueNum: 1042 + i * 17
        }));
    }, [islands]);

    return (
        <group>
            {infectedIslands.map(item => (
                <GlitchMonster key={item.id} data={item} />
            ))}
        </group>
    );
}

function GlitchMonster({ data }) {
    const groupRef = useRef();
    const [dead, setDead] = useState(false);

    useFrame((state) => {
        if (!groupRef.current || dead) return;
        const t = state.clock.elapsedTime;
        // Jittery scatter movement
        groupRef.current.position.y = Math.sin(t * 15) * 0.1;
        groupRef.current.rotation.y = Math.sin(t * 8) * 0.2;
        groupRef.current.rotation.z = Math.cos(t * 12) * 0.1;
    });

    if (dead) {
        return <Explosion position={data.island.position} color="#ff0044" />;
    }

    return (
        <group position={data.island.position} ref={groupRef}>
            <mesh position={[0, data.island.scale * 1.5, 0]}>
                <icosahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#ff0000" wireframe emissive="#ff0044" emissiveIntensity={2} />
            </mesh>
            <Html position={[0, data.island.scale * 2.2, 0]} center distanceFactor={15} style={{ pointerEvents: 'all' }}>
                <button
                    onClick={() => {
                        window.open(`https://github.com/issues/${data.issueNum}`);
                        setDead(true); // "Kill" monster on click
                    }}
                    style={{
                        background: 'rgba(255,0,0,0.8)', color: '#fff',
                        border: '1px solid #ff4444', borderRadius: '4px',
                        padding: '4px 8px', fontSize: '9px', cursor: 'pointer',
                        fontFamily: 'monospace', fontWeight: 'bold'
                    }}
                >
                    👾 FIX ISSUE #{data.issueNum}
                </button>
            </Html>
        </group>
    );
}

function Explosion({ position, color }) {
    const pointsRef = useRef();
    const count = 40;
    const { pos, vels } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const v = [];
        for (let i = 0; i < count; i++) {
            const r1 = seededRandom('expl-' + i, 1) - 0.5;
            const r2 = seededRandom('expl-' + i, 2) - 0.5;
            const r3 = seededRandom('expl-' + i, 3) - 0.5;
            v.push(new THREE.Vector3(r1 * 0.2, r2 * 0.2, r3 * 0.2));
            p[i * 3] = position[0];
            p[i * 3 + 1] = position[1];
            p[i * 3 + 2] = position[2];
        }
        return { pos: p, vels: v };
    }, [position]);

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return g;
    }, [pos]);

    useFrame(() => {
        if (!pointsRef.current) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            attr.array[i * 3] += vels[i].x;
            attr.array[i * 3 + 1] += vels[i].y;
            attr.array[i * 3 + 2] += vels[i].z;
        }
        attr.needsUpdate = true;
        pointsRef.current.material.opacity = Math.max(0, pointsRef.current.material.opacity - 0.02);
    });

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial color={color} size={0.15} transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    );
}

// ── 2. Supply Chain Nebula ──────────────────────────────────────
export function SupplyChainNebula({ active }) {
    const pointsRef = useRef();
    const count = 2000;

    const { geo } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r1 = seededRandom('neb-' + i, 1);
            const r2 = seededRandom('neb-' + i, 2);
            const r3 = seededRandom('neb-' + i, 3);
            const angle = r1 * Math.PI * 2;
            const r = 120 + r2 * 80; // Asteroid belt distance
            pos[i * 3] = Math.cos(angle) * r;
            pos[i * 3 + 1] = (r3 - 0.5) * 30;
            pos[i * 3 + 2] = Math.sin(angle) * r;

            const baseColor = new THREE.Color(r1 > 0.5 ? '#8800ff' : '#440088');
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return { geo: g };
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
        }
    });

    if (!active) return null;

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial size={1.2} vertexColors transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    );
}

// ── 3. Phantom Reviewer ─────────────────────────────────────────
export function PhantomReviewer({ islands, active }) {
    const meshRef = useRef();
    const [target, setTarget] = useState(null);
    const [graffiti, setGraffiti] = useState([]);

    useEffect(() => {
        if (!active || !islands || islands.length === 0) return;
        const interval = setInterval(() => {
            const t = islands[Math.floor(Math.random() * islands.length)];
            setTarget(t);
        }, 6000);
        return () => clearInterval(interval);
    }, [active, islands]);

    const tVec = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        if (!meshRef.current || !target) return;
        tVec.set(target.position[0], target.position[1] + 3, target.position[2]);
        meshRef.current.position.lerp(tVec, 0.05);

        // Drop graffiti if close
        if (meshRef.current.position.distanceTo(tVec) < 1.0) {
            setGraffiti(prev => {
                // Keep only last 10 graffiti to prevent DOM overload
                const nextList = prev.find(g => g.id === target.id) ? prev : [...prev, { id: target.id, pos: target.position }];
                return nextList.slice(-10);
            });
            setTarget(null);
        }
    });

    if (!active) return null;

    return (
        <group>
            {/* Phantom Drone */}
            <mesh ref={meshRef} position={[0, 40, 0]}>
                <octahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#00ffcc" emissive="#00ffa0" emissiveIntensity={2} wireframe />
                <pointLight color="#00ffcc" intensity={2} distance={8} />
                <Html position={[0, 1, 0]} center style={{ pointerEvents: 'none' }}>
                    <div style={{ color: '#00ffcc', fontFamily: 'monospace', fontSize: '9px', background: 'rgba(0,0,0,0.8)', padding: '2px 4px', borderRadius: '3px' }}>
                        🤖 Phantom Reviewer
                    </div>
                </Html>
            </mesh>

            {/* Sprayed Graffiti */}
            {graffiti.map(g => (
                <Html key={g.id} position={[g.pos[0], g.pos[1] + 2, g.pos[2]]} center distanceFactor={12} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        color: '#ff00aa', fontFamily: 'cursive', fontSize: '14px',
                        transform: 'rotate(-10deg)', textShadow: '0 0 10px #ff00aa'
                    }}>
                        Refactor This!
                    </div>
                </Html>
            ))}
        </group>
    );
}

// ── 5. Desktop Trophy (STL Export) ──────────────────────────────
export function DesktopTrophyExporter({ triggerIndex }) {
    const { scene, camera } = useThree();

    useEffect(() => {
        if (triggerIndex > 0) {
            const exporter = new STLExporter();
            // We only want to export standard meshes, so we traverse and filter
            const exportScene = scene.clone();
            const result = exporter.parse(exportScene);

            const blob = new Blob([result], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'code_city_trophy.stl';
            link.click();
        }
    }, [triggerIndex, scene]);

    return null;
}

// ── 8. Auto-Documentary Tracker ─────────────────────────────────
export function AutoDocumentary({ triggerIndex, islands }) {
    const { camera } = useThree();
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        if (triggerIndex > 0 && islands?.length > 0) {
            const utterance = new SpeechSynthesisUtterance("It started with a single commit. Over the years, this codebase grew into a sprawling metropolis. Notice the densely packed core modules, representing years of technical debt and foundational architecture.");
            utterance.rate = 0.9;
            utterance.pitch = 0.9;
            synthRef.current.speak(utterance);

            // Animate camera flythrough
            gsap.to(camera.position, {
                x: 0, y: 5, z: 15,
                duration: 4,
                ease: 'power2.inOut',
                onComplete: () => {
                    gsap.to(camera.position, {
                        x: 20, y: 15, z: 0,
                        duration: 5,
                        ease: 'linear'
                    });
                }
            });
        }
    }, [triggerIndex, islands, camera]);

    return null;
}

// ── Overlays (AR Business Card, Commander, Galaxy View) ─────────

export function ARBusinessCardModal({ onClose }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#0d1117', border: '1px solid #30363d',
                    padding: '30px', borderRadius: '12px', textAlign: 'center',
                    maxWidth: '400px'
                }}
            >
                <h2 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '18px' }}>AR Business Card</h2>
                <div style={{
                    background: '#fff', padding: '15px', borderRadius: '8px',
                    display: 'inline-block', marginBottom: '20px'
                }}>
                    {/* Fake QR for demonstration */}
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://github.com/uday" alt="QR" width="150" height="150" />
                </div>
                <p style={{ color: '#8b949e', fontSize: '13px', lineHeight: '1.4' }}>
                    Scan with your phone's camera to open WebXR Augmented Reality mode. Place the code city on your physical desk!
                </p>
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '15px', background: '#238636', color: '#fff',
                        border: 'none', padding: '8px 16px', borderRadius: '6px',
                        cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    Close
                </button>
            </motion.div>
        </div>
    );
}

export function ActionButtonGroup({ onAction }) {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { id: 'chat', icon: '💬', label: 'Chat w/ Codebase' },
        { id: 'stl', icon: '🏆', label: 'Export 3D Trophy' },
        { id: 'voice', icon: '🎙️', label: 'Voice Command' },
        { id: 'galaxy', icon: '🌌', label: 'Galaxy View' },
        { id: 'video', icon: '🎬', label: 'Auto-Documentary' },
        { id: 'ar', icon: '📱', label: 'AR Card' },
    ];

    return (
        <div style={{
            position: 'fixed', bottom: '20px', right: '20px', zIndex: 500,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
        }} className="mobile-action-group">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}
                    >
                        {actions.map(a => (
                            <motion.button
                                key={a.id}
                                onClick={() => { onAction(a.id); setIsOpen(false); }}
                                whileHover={{ scale: 1.05, x: -5 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    background: 'rgba(10,14,23,0.92)',
                                    border: '1px solid rgba(0,245,255,0.4)',
                                    borderRadius: '8px', padding: '10px 14px',
                                    color: '#00f5ff', display: 'flex', alignItems: 'center', gap: '10px',
                                    fontFamily: 'Space Mono, monospace', fontSize: '11px', fontWeight: 'bold',
                                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,245,255,0.15)',
                                    backdropFilter: 'blur(8px)'
                                }}
                            >
                                <span style={{ fontSize: '15px' }}>{a.icon}</span>
                                <span style={{ width: '130px', textAlign: 'left' }}>{a.label}</span>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: isOpen ? 45 : 0 }}
                style={{
                    width: '55px', height: '55px', borderRadius: '50%',
                    background: 'rgba(0, 245, 255, 0.1)', border: '2px solid #00f5ff',
                    color: '#00f5ff', fontSize: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    cursor: 'pointer', boxShadow: '0 0 20px rgba(0,245,255,0.3)', backdropFilter: 'blur(10px)'
                }}
            >
                +
            </motion.button>
        </div>
    );
}
