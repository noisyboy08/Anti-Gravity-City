/**
 * FloatingIsland.jsx — v2 (Enhanced)
 * Low-poly floating rock with:
 * - Sine-wave bobbing animation
 * - Holographic HTML overlay on hover (@react-three/drei Html)
 * - Timeline-based visibility (Ghost of Commits)
 * - Multi-vibe color system
 * - Raycaster interaction
 */

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import axios from 'axios';
import { seededRandom, hashStringToInt } from '../utils/seededRandom';

// ─── Island Rock Geometry ─────────────────────────────────────
function IslandRock({ scale, color, isHovered, selected }) {
    const geo = useMemo(() => {
        const g = new THREE.IcosahedronGeometry(1, 1);
        const pos = g.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            const z = pos.getZ(i);
            pos.setY(i, y * 0.42);
            pos.setX(i, x + Math.sin(i * 2.3) * 0.09);
            pos.setZ(i, z + Math.cos(i * 1.7) * 0.09);
        }
        g.computeVertexNormals();
        return g;
    }, []);

    return (
        <mesh geometry={geo} scale={[scale * 1.8, scale * 0.75, scale * 1.8]}>
            <meshStandardMaterial
                color={isHovered ? '#1a2a5a' : '#080f2a'}
                roughness={0.82}
                metalness={0.22}
                emissive={color}
                emissiveIntensity={isHovered || selected ? 0.35 : 0.06}
            />
        </mesh>
    );
}

// ─── Core Crystal / Building ──────────────────────────────────
function CoreCrystal({ color, isCore, type, scale }) {
    const meshRef = useRef();
    const innerRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.y += isCore ? 0.009 : 0.005;
            if (isCore) meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.12;
        }
        // Inner glow pulse
        if (innerRef.current) {
            innerRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 2.5) * 0.5;
        }
    });

    // Sun (large file)
    if (type === 'sun') {
        return (
            <mesh ref={meshRef} position={[0, scale * 0.85, 0]}>
                <sphereGeometry args={[scale * 0.52, 18, 18]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0} metalness={1} />
            </mesh>
        );
    }

    // Star (small file)
    if (type === 'star') {
        return (
            <mesh ref={meshRef} position={[0, scale * 0.75, 0]}>
                <octahedronGeometry args={[scale * 0.28, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} roughness={0.1} metalness={0.7} />
            </mesh>
        );
    }

    // Central Core Station
    if (isCore) {
        return (
            <group ref={meshRef} position={[0, scale * 1.2, 0]}>
                <mesh ref={innerRef}>
                    <octahedronGeometry args={[scale * 0.72, 0]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0} metalness={1} transparent opacity={0.92} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[scale * 0.42, 16, 16]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} transparent opacity={0.55} />
                </mesh>
                {/* Primary ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[scale * 1.05, scale * 0.055, 8, 72]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
                </mesh>
                {/* Secondary tilted ring */}
                <mesh rotation={[Math.PI / 3, 0, 0]}>
                    <torusGeometry args={[scale * 1.28, scale * 0.032, 8, 72]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} transparent opacity={0.65} />
                </mesh>
                {/* Tertiary ring */}
                <mesh rotation={[0, Math.PI / 4, Math.PI / 6]}>
                    <torusGeometry args={[scale * 1.5, scale * 0.02, 8, 72]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.4} />
                </mesh>
            </group>
        );
    }

    // Default: Directory crystal
    return (
        <group ref={meshRef} position={[0, scale * 0.82, 0]}>
            <mesh>
                <octahedronGeometry args={[scale * 0.36, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} roughness={0.08} metalness={0.85} transparent opacity={0.88} />
            </mesh>
            {/* Small floating detail shard */}
            <mesh position={[scale * 0.2, scale * 0.15, 0]} rotation={[0.4, 0.6, 0.3]}>
                <tetrahedronGeometry args={[scale * 0.12, 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </mesh>
        </group>
    );
}

// ─── Holographic HTML Overlay ─────────────────────────────────
function HoloOverlay({ island, themeColor, show }) {
    if (!show) return null; // Critical performance fix: unmount entirely when hidden

    const typeIcons = { core: '🌐', directory: '📁', sun: '☀️', star: '✨' };
    const icon = typeIcons[island.type] || '📄';
    const altLabel = island.altitude > 8 ? '▲ ELITE' : island.altitude > 4 ? '◈ MID-TIER' : '▼ FRINGE';
    const yOffset = island.isCore ? island.scale * 3.5 : island.scale * 2.0;

    return (
        <Html
            position={[0, yOffset, 0]}
            center
            distanceFactor={14}
            style={{ pointerEvents: 'none', zIndex: 100 }}
        >
            <motion.div
                className="holo-card"
                style={{ '--holo-color': themeColor }}
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
            >
                <div className="holo-header">
                    <span className="holo-icon">{icon}</span>
                    <span className="holo-name">{island.name}</span>
                    <span className="holo-badge">{island.type?.toUpperCase()}</span>
                </div>
                <div className="holo-divider" />
                <div className="holo-body">
                    {island.originalPath && (
                        <div className="holo-row">
                            <span className="holo-key">PATH</span>
                            <span className="holo-val path">{island.originalPath}</span>
                        </div>
                    )}
                    {island.altitude !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">STRATUM</span>
                            <span className="holo-val" style={{ color: themeColor }}>{altLabel}</span>
                        </div>
                    )}
                    {island.fileSize !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">SIZE</span>
                            <span className="holo-val">{(island.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                    )}
                    {island.fileCount !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">NODES</span>
                            <span className="holo-val">{island.fileCount} files</span>
                        </div>
                    )}
                    {island.orbitSpeed !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">ORBIT ω</span>
                            <span className="holo-val">{(island.orbitSpeed * 10000).toFixed(2)}</span>
                        </div>
                    )}
                </div>
                {/* Corner glyphs */}
                <div className="holo-corner tl" />
                <div className="holo-corner tr" />
                <div className="holo-corner bl" />
                <div className="holo-corner br" />
            </motion.div>
        </Html>
    );
}

// ─── Economy Stock Ticker ─────────────────────────────────────
function EconomyTicker({ island, show, color }) {
    if (!show || island.isCore) return null;

    // Fake stock values based on file size/altitude
    const value = Math.floor((island.fileSize || 500) * (island.altitude || 1) * 0.12);
    const trend = Math.random() > 0.4 ? '▲' : '▼';
    const trendColor = trend === '▲' ? '#00ff41' : '#ff003c';

    return (
        <Html position={[0, island.scale * 2.8, 0]} center distanceFactor={25} style={{ pointerEvents: 'none', zIndex: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.85)', padding: '4px 6px', borderRadius: '4px', border: `1px solid ${trendColor}66` }}>
                <span style={{ fontSize: '10px', color: '#fff', fontFamily: 'monospace', fontWeight: 'bold' }}>{island.name.substring(0, 10).toUpperCase()}</span>
                <span style={{ fontSize: '12px', color: trendColor, fontFamily: 'monospace' }}>{trend} {value}</span>
            </div>
        </Html>
    );
}

// ─── Main FloatingIsland Component ────────────────────────────
export function FloatingIsland({ island, themeColors, onSelect, selected, timelineProgress = 100, features = {} }) {
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);

    const phaseOffset = useRef(seededRandom(island.id || 'island') * Math.PI * 2);
    const bobSpeed = island.isCore ? 0.38 : 0.55 + seededRandom(island.id || 'island', 1) * 0.35;
    const bobAmp = island.isCore ? 0.18 : 0.09;
    const scaleRef = useRef(new THREE.Vector3(1, 1, 1));

    const color = themeColors?.primaryColor || '#00f5ff';
    const coreColor = island.isCore ? (themeColors?.coreColor || color) : color;

    // Timeline-based visibility: islands appear as timeline progresses
    // Each island has a "birth" percentage based on its altitude (higher = older/earlier)
    const birthPct = island.isCore ? 0 : Math.max(0, 100 - (island.altitude || 5) * 7);
    const isVisible = timelineProgress >= birthPct;
    const appearProgress = Math.min(1, Math.max(0, (timelineProgress - birthPct) / 15));

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;

        // Anti-gravity sine-wave bobbing — the core effect!
        groupRef.current.position.y =
            island.position[1] + Math.sin(t * bobSpeed + phaseOffset.current) * bobAmp;

        // Scale lerp: hover inflate / timeline appear
        const baseScale = isVisible ? appearProgress : 0;
        const targetScale = (hovered || selected ? 1.08 : 1.0) * baseScale;
        scaleRef.current.set(targetScale, targetScale, targetScale);
        groupRef.current.scale.lerp(scaleRef.current, 0.1);
    });

    return (
        <group
            ref={groupRef}
            position={island.position}
            userData={{ islandId: island.id }}
            onClick={(e) => {
                e.stopPropagation();
                if (e.altKey) {
                    // Feature: The Portal (VS Code deep linking)
                    const repoPath = 'C:/Users/udayd/OneDrive/Desktop/Anti-Gravity City/lore-of-the-repo/';
                    window.open(`vscode://file/${repoPath}${island.originalPath || island.name}`);
                } else {
                    onSelect?.(island);
                }
            }}
            onDoubleClick={async (e) => {
                e.stopPropagation();

                const isDemo = window.CURRENT_REPO_INFO?.full_name === 'demo/lord-of-repo';
                const path = island.originalPath || island.name;

                // Dispatch immediately with loading text
                window.dispatchEvent(new CustomEvent('OPEN_CODE_FILE', {
                    detail: { name: island.name, path, content: 'Fetching code matrix...', type: island.type }
                }));

                if (isDemo) {
                    // MOCK RESPONSE FOR DEMO CITY
                    setTimeout(() => {
                        const mockCode = `// ----------------------------------------\n// [LORD OF REPO DEMO CITY]\n// Simulated File: ${path}\n// ----------------------------------------\n\nimport { system } from 'nexus-core';\nimport { initialize } from 'orbit-controls';\n\nexport function ${island.name.replace(/[^a-zA-Z]/g, '') || 'Module'}() {\n    // Initialize Quantum Core Engine\n    const engine = system.boot();\n    engine.optimize();\n    \n    return {\n        status: "ONLINE",\n        integrity: "99.9%",\n        hash: "${Math.random().toString(36).substring(7)}"\n    };\n}\n`;
                        window.dispatchEvent(new CustomEvent('OPEN_CODE_FILE', {
                            detail: { name: island.name, path, content: mockCode, type: island.type }
                        }));

                        // Mock AST Beans
                        if (!window.AST_CONNECTIONS) window.AST_CONNECTIONS = [];
                        let newlyAdded = false;
                        ['nexus-core', 'orbit-controls'].forEach(m => {
                            const toPos = [island.position[0] + (Math.random() * 8 - 4), island.position[1] + 4, island.position[2] + (Math.random() * 8 - 4)];
                            window.AST_CONNECTIONS.push({
                                id: `ast-demo-${island.id}-${m}-${Date.now()}`,
                                from: island.position,
                                to: toPos,
                                isPrimary: false,
                                thickness: 1
                            });
                            newlyAdded = true;
                        });
                        if (newlyAdded) window.dispatchEvent(new Event('AST_UPDATED'));

                    }, 400);
                } else if (window.CURRENT_REPO_INFO) {
                    // LIVE GITHUB FETCH
                    const repo = window.CURRENT_REPO_INFO;
                    try {
                        const rawUrl = `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch || 'main'}/${path}`;
                        const res = await axios.get(rawUrl);
                        const codeStr = res.data.slice(0, 3000); // Limit size for performance

                        // Dispatch again with real content
                        window.dispatchEvent(new CustomEvent('OPEN_CODE_FILE', {
                            detail: { name: island.name, path, content: codeStr, type: island.type }
                        }));

                        // True AST Parsing Magic! Parse imports from the file
                        if (!window.AST_CONNECTIONS) window.AST_CONNECTIONS = [];
                        const matches = [...codeStr.matchAll(/import.*?from\s+['"](.*?)['"]/g)];
                        if (matches.length > 0) {
                            let newlyAdded = false;
                            matches.forEach(m => {
                                // Add random local offset beam so we see logic sparks
                                const toPos = [island.position[0] + (Math.random() * 10 - 5), island.position[1] + 5, island.position[2] + (Math.random() * 10 - 5)];
                                window.AST_CONNECTIONS.push({
                                    id: `ast-${island.id}-${m[1]}-${Date.now()}`,
                                    from: island.position,
                                    to: toPos,
                                    isPrimary: false,
                                    thickness: 1
                                });
                                newlyAdded = true;
                            });
                            // Force an update by dispatching event
                            if (newlyAdded) window.dispatchEvent(new Event('AST_UPDATED'));
                        }
                    } catch (err) {
                        window.dispatchEvent(new CustomEvent('OPEN_CODE_FILE', {
                            detail: { name: island.name, path, content: '// Error loading core file matrix:\n// ' + err.message, type: island.type }
                        }));
                    }
                } else {
                    // Fallback to local VS Code deep linking for offline/demo logic
                    const repoPath = 'C:/Users/udayd/OneDrive/Desktop/Anti-Gravity City/lore-of-the-repo/';
                    window.open(`vscode://file/${repoPath}${island.originalPath || island.name}`);
                }
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'auto';
            }}
        >
            {/* Rock platform */}
            {island.type !== 'sun' && island.type !== 'star' && (
                <IslandRock scale={island.scale} color={color} isHovered={hovered} selected={selected} />
            )}

            {/* Crystal / Building */}
            <CoreCrystal color={coreColor} isCore={island.isCore} type={island.type} scale={island.scale} />

            {/* Point light */}
            <pointLight
                color={color}
                intensity={island.isCore ? 5 : (hovered ? 2.5 : 1.0)}
                distance={island.isCore ? 22 : 9}
                decay={2}
            />

            {/* Holographic HTML overlay on hover */}
            <HoloOverlay island={island} themeColor={color} show={hovered || selected} />

            {/* Economy Stock Market Ticker */}
            <EconomyTicker island={island} show={features.economy} color={color} />

            {/* Selection ring */}
            {selected && !island.isCore && (
                <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
                    <ringGeometry args={[island.scale * 1.55, island.scale * 1.75, 36]} />
                    <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            )}
        </group>
    );
}
