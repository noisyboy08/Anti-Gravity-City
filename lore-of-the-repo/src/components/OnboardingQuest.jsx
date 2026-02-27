/**
 * OnboardingQuest.jsx
 * NPC Guide Drone — flies to each district (folder island) and displays
 * AI-generated district descriptions as RPG-style quest dialogue boxes.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';

// ── District descriptions (AI-style lore per folder type) ─────
function generateDistrictLore(island) {
    const name = island.name || 'Unknown';
    const nameL = name.toLowerCase();

    if (nameL.includes('auth'))
        return `⚑ AUTHENTICATION CORE\n\nThis fortress district manages identity & access control. JWT tokens are forged and validated here. The sentinels never sleep — every request is inspected before entry to the inner city is granted.`;
    if (nameL.includes('api') || nameL.includes('route'))
        return `⬡ API GATEWAY DISTRICT\n\nAll network traffic flows through this hub. RESTful pathways weave between the towers, routing signals from the outer network to the correct processing nodes within the city.`;
    if (nameL.includes('component') || nameL.includes('ui'))
        return `◈ UI COMPONENT DISTRICT\n\nThe aesthetic quarter. Visual elements are assembled here — each spire is a reusable interface fragment, crafted and exported to the surfaces of the wider city.`;
    if (nameL.includes('util') || nameL.includes('helper') || nameL.includes('lib'))
        return `⚙ UTILITY DISTRICT\n\nThe workshop of the city. Shared tools, converters, and formatters operate from this district. Without it, the rest of the city would collapse into chaos.`;
    if (nameL.includes('test') || nameL.includes('spec'))
        return `◉ TESTING ARENA\n\nEvery building must pass through the Arena before joining the city. Automated drones run simulated stress tests day and night, ensuring structural integrity across the entire codebase.`;
    if (nameL.includes('config') || nameL.includes('env') || nameL.includes('setting'))
        return `⌘ CONFIGURATION CONTROL\n\nThe nerve center of the city's operating parameters. Environment variables and feature flags are stored here. Modifying these nodes changes the behavior of the entire city.`;
    if (nameL.includes('model') || nameL.includes('schema') || nameL.includes('db'))
        return `▣ DATA MODEL DISTRICT\n\nThe bedrock layer of the city. Database schemas and object models define the fundamental shape of all information flowing through the city's veins.`;
    if (nameL.includes('service') || nameL.includes('controller'))
        return `⬢ SERVICE LAYER\n\nThe city's middleware. Service nodes mediate between the raw data layer below and the presentation layer above. Business logic crystallizes into these spires.`;
    if (nameL.includes('src') || nameL.includes('source'))
        return `★ SOURCE CORE\n\nThe heart of the codebase. All districts radiate outward from this origin point. The source core is where the city's primary logic was first conceived.`;

    return `◆ ${name.toUpperCase()} DISTRICT\n\nThis district contains ${island.fileCount || 'multiple'} nodes operating in coordination. The architecture here reflects the unique patterns of this domain — study it carefully to understand the code's intent.`;
}

// ── NPC Drone mesh ─────────────────────────────────────────────
function DroneMesh({ color }) {
    const bodyRef = useRef();
    const rotorRefs = [useRef(), useRef(), useRef(), useRef()];

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (bodyRef.current) {
            bodyRef.current.rotation.y += 0.02;
            bodyRef.current.position.y = Math.sin(t * 2.5) * 0.08;
        }
        rotorRefs.forEach((r, i) => {
            if (r.current) r.current.rotation.y += 0.18 * (i % 2 === 0 ? 1 : -1);
        });
    });

    const rotorPositions = [[0.28, 0.08, 0.28], [-0.28, 0.08, 0.28], [0.28, 0.08, -0.28], [-0.28, 0.08, -0.28]];

    return (
        <group ref={bodyRef}>
            {/* Body */}
            <mesh>
                <boxGeometry args={[0.28, 0.1, 0.28]} />
                <meshStandardMaterial color="#0a0a1f" emissive={color} emissiveIntensity={0.8} roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Sensor eye */}
            <mesh position={[0, 0, 0.15]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
            </mesh>
            {/* Rotors */}
            {rotorPositions.map((pos, i) => (
                <group key={i} ref={rotorRefs[i]} position={pos}>
                    <mesh>
                        <cylinderGeometry args={[0.12, 0.12, 0.015, 12]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} transparent opacity={0.55} />
                    </mesh>
                    {/* Rotor strut */}
                    <mesh rotation={[0, 0, Math.PI / 2]} position={[pos[0] > 0 ? -0.14 : 0.14, 0, 0]}>
                        <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
                        <meshStandardMaterial color="#222240" roughness={0.1} metalness={0.9} />
                    </mesh>
                </group>
            ))}
            <pointLight color={color} intensity={1.5} distance={4} decay={2} />
        </group>
    );
}

// ── Quest dialogue panel ───────────────────────────────────────
function QuestPanel({ island, onNext, onClose, step, total, themeColor }) {
    const lore = generateDistrictLore(island);
    const lines = lore.split('\n\n');

    return (
        <Html
            position={[0, 2.5, 0]}
            center
            distanceFactor={14}
            style={{ pointerEvents: 'all', zIndex: 200 }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{
                    width: '280px',
                    background: 'rgba(0,4,20,0.96)',
                    border: `1px solid ${themeColor}55`,
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 0 30px ${themeColor}22`,
                    fontFamily: 'Space Mono, monospace',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderBottom: `1px solid ${themeColor}22`,
                    background: `${themeColor}0c`,
                }}>
                    <span style={{ fontSize: '10px' }}>🤖</span>
                    <span style={{ fontSize: '8px', letterSpacing: '.15em', color: themeColor, flex: 1 }}>
                        GUIDE DRONE · DISTRICT {step}/{total}
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                        cursor: 'pointer', fontSize: '12px', lineHeight: 1, padding: '0 2px',
                    }}>✕</button>
                </div>

                {/* Content */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {lines.map((line, i) => (
                        <motion.p
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            style={{
                                margin: 0,
                                fontSize: i === 0 ? '10px' : '10.5px',
                                fontWeight: i === 0 ? 700 : 400,
                                color: i === 0 ? themeColor : 'rgba(200,210,255,0.8)',
                                lineHeight: 1.6,
                            }}
                        >
                            {line}
                        </motion.p>
                    ))}
                </div>

                {/* Navigation */}
                <div style={{
                    padding: '8px 12px', display: 'flex', justifyContent: 'flex-end',
                    borderTop: `1px solid ${themeColor}18`,
                }}>
                    <motion.button
                        onClick={onNext}
                        style={{
                            background: `${themeColor}18`, border: `1px solid ${themeColor}55`,
                            color: themeColor, borderRadius: '8px', padding: '5px 16px',
                            fontFamily: 'inherit', fontSize: '9px', cursor: 'pointer',
                            letterSpacing: '.08em', fontWeight: 700,
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        {step < total ? 'NEXT DISTRICT →' : '⌂ END TOUR'}
                    </motion.button>
                </div>
            </motion.div>
        </Html>
    );
}

// ── Drone orbit path (while idle) ─────────────────────────────
function IdleDrone({ color, startPos }) {
    const groupRef = useRef();
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        groupRef.current.position.set(
            startPos[0] + Math.sin(t * 0.6) * 3,
            startPos[1] + Math.sin(t * 1.1) * 0.8,
            startPos[2] + Math.cos(t * 0.6) * 3,
        );
    });

    return (
        <group ref={groupRef}>
            <DroneMesh color={color} />
        </group>
    );
}

export function OnboardingDrone({ islands, active, onClose, themeColor }) {
    const [step, setStep] = useState(0);
    const [dronePos, setDronePos] = useState([0, 12, 15]);

    // Build tour stops: pick directory islands only
    const tourStops = islands
        ? islands.filter(i => !i.isCore && i.type === 'directory').slice(0, 6)
        : [];

    const currentIsland = tourStops[step];

    useEffect(() => {
        if (!active || !currentIsland) return;
        // Animate drone position to current island
        const target = [
            currentIsland.position[0],
            currentIsland.position[1] + 3,
            currentIsland.position[2] + 2,
        ];
        gsap.to({ x: dronePos[0], y: dronePos[1], z: dronePos[2] }, {
            x: target[0], y: target[1], z: target[2],
            duration: 1.8, ease: 'power2.inOut',
            onUpdate: function () {
                setDronePos([this.targets()[0].x, this.targets()[0].y, this.targets()[0].z]);
            },
        });
    }, [step, active]);

    const handleNext = useCallback(() => {
        if (step < tourStops.length - 1) setStep(s => s + 1);
        else onClose?.();
    }, [step, tourStops.length, onClose]);

    if (!active) return null;

    return (
        <group>
            {/* Drone at current position */}
            <group position={dronePos}>
                <DroneMesh color={themeColor} />
                {/* Quest panel at current island */}
                {currentIsland && (
                    <group position={[
                        currentIsland.position[0] - dronePos[0],
                        currentIsland.position[1] - dronePos[1],
                        currentIsland.position[2] - dronePos[2],
                    ]}>
                        <QuestPanel
                            island={currentIsland}
                            onNext={handleNext}
                            onClose={onClose}
                            step={step + 1}
                            total={tourStops.length}
                            themeColor={themeColor}
                        />
                    </group>
                )}
            </group>
        </group>
    );
}
