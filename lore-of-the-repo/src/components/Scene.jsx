/**
 * Scene.jsx — v4 (All 14 systems)
 */

import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { FloatingIsland } from './FloatingIsland';
import { EnergyBeam, BeamParticles } from './EnergyBeam';
import { StarField, NebulaClouds, VerticalSpire } from './StarField';
import { PostProcessingEffects } from './PostProcessing';
import { DroneCamera } from './DroneCamera';
import { LiveTraffic } from './LiveTraffic';
import { BuildWeather, GlobalWeatherFog, getBuildState } from './BuildWeather';
import { GhostAvatars } from './GhostAvatars';
import { IslandBattle, getMockConflicts } from './BattleMode';
import { NeuralPathway } from './NeuralPathway';
import { SecurityShield, getIslandVulnerability } from './SecurityShield';
import { DecayParticles, DecayOverlay, getDecayLevel } from './LegacyDecay';
import { useDistrictMusic, AudioIndicator } from './DistrictMusic';
import { VRScene } from './VRMode';
import { RecruiterBillboard } from './RecruiterMode';
import { OnboardingDrone } from './OnboardingQuest';
import { MatrixRain, MatrixSceneOverlay } from './TerminalEasterEgg';
import { ContainerTransport } from './ContainerTransport';
import { useFrame } from '@react-three/fiber';
import { GlitchSpiders, SupplyChainNebula, PhantomReviewer, DesktopTrophyExporter, AutoDocumentary } from './FeatureExpansions';
import { LinterWars } from './LinterWars';
import { BurndownVis, FPSController, CrossRepoWormholes } from './NextLevelFeatures';
import { BossFight } from './BossFight';
import { InstancedCity } from './InstancedCity';
import { TelemetryHeatmap } from './TelemetryHeatmap';
import { JiraTickets } from './JiraTickets';

// ── Knowledge Graph Links ─────────────────────────────────────
function KnowledgeGraphLinks({ islands, active }) {
    const geo = useRef();
    if (!geo.current && active && islands?.length > 0) {
        const positions = [];
        const num = islands.length;
        const pts = islands.map((iso, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / num);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const r = 25;
            return { x: r * Math.cos(theta) * Math.sin(phi), y: r * Math.sin(theta) * Math.sin(phi), z: r * Math.cos(phi) };
        });
        for (let i = 0; i < num; i++) {
            if (i + 1 < num) positions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
            if (i + 5 < num) positions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 5].x, pts[i + 5].y, pts[i + 5].z);
        }
        geo.current = new THREE.BufferGeometry();
        geo.current.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    }

    if (!active || !geo.current) return null;
    return (
        <lineSegments geometry={geo.current}>
            <lineBasicMaterial color="#00ff88" transparent opacity={0.3} />
        </lineSegments>
    );
}

// ── Void Dust ─────────────────────────────────────────────────
function VoidDust({ color }) {
    const pointsRef = useRef();
    const count = 500;
    const positions = useRef((() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 70;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 45;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }
        return pos;
    })()).current;
    const velocities = useRef(
        Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 0.002,
            y: (Math.random() - 0.5) * 0.001,
            z: (Math.random() - 0.5) * 0.002,
        }))
    ).current;
    const geo = useRef((() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    })()).current;

    useFrame(() => {
        if (!pointsRef.current) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            attr.array[i * 3] += velocities[i].x;
            attr.array[i * 3 + 1] += velocities[i].y;
            attr.array[i * 3 + 2] += velocities[i].z;
            if (Math.abs(attr.array[i * 3]) > 35) velocities[i].x *= -1;
            if (Math.abs(attr.array[i * 3 + 1]) > 22) velocities[i].y *= -1;
            if (Math.abs(attr.array[i * 3 + 2]) > 35) velocities[i].z *= -1;
        }
        attr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial color={color} size={0.055} transparent opacity={0.35} sizeAttenuation depthWrite={false} />
        </points>
    );
}

// ── District Music hook wrapper (inside Canvas) ────────────────
function MusicLayer({ islands, active }) {
    useDistrictMusic(islands, active);
    return null;
}

// ── Matrix wireframe island override ─────────────────────────
const matrixGeo = new THREE.IcosahedronGeometry(1, 1);
const matrixMat = new THREE.MeshBasicMaterial({ color: '#00ff41', wireframe: true, transparent: true, opacity: 0.85 });

function MatrixIsland({ island }) {
    return (
        <mesh
            position={island.position}
            scale={[island.scale * 1.8, island.scale * 0.75, island.scale * 1.8]}
            geometry={matrixGeo}
            material={matrixMat}
        />
    );
}

// ── Scene Contents ────────────────────────────────────────────
function SceneContents({
    cityData, narrative, onSelectIsland, selectedIsland,
    droneActive, onDroneComplete, timelineProgress,
    features, carbonVisuals,
    recruiterMode, matrixMode,
    onboardingActive, onOnboardingClose,
    docTrig, exportSTLTrig, galaxyMode
}) {
    const colors = narrative?.colors;
    const primary = matrixMode ? '#00ff41' : (colors?.primaryColor || '#00f5ff');
    const beam = colors?.beamColor || '#7b2fff';
    const theme = narrative?.theme || 'cyber-astral';
    const islands = cityData?.islands || [];

    const [astBeams, setAstBeams] = useState([]);
    useEffect(() => {
        const updateBeams = () => setAstBeams([...(window.AST_CONNECTIONS || [])]);
        window.addEventListener('AST_UPDATED', updateBeams);
        return () => window.removeEventListener('AST_UPDATED', updateBeams);
    }, []);

    const conflicts = getMockConflicts(islands);
    const conflictMap = Object.fromEntries(conflicts.map(c => [c.islandId, c]));
    const coreIsland = islands.find(i => i.isCore);

    const sunColor = matrixMode ? '#003300' : (features.carbon ? (carbonVisuals?.sunColor || primary) : primary);
    const ambientClr = matrixMode ? '#000500' : (features.carbon ? (carbonVisuals?.ambientColor || '#050020') : '#050020');
    const sunIntensity = matrixMode ? 0.2 : (features.carbon ? (carbonVisuals?.sunIntensity ?? 1.8) : 0.45);

    // Dynamic Performance Throttling
    const activeCount = Object.values(features || {}).filter(Boolean).length;
    const isExtremeLoad = activeCount >= 8;

    return (
        <>
            {/* ── Matrix atmosphere override ── */}
            {matrixMode && <MatrixSceneOverlay active />}

            {/* ── Lighting ── */}
            {!matrixMode && <ambientLight intensity={0.25} color={ambientClr} />}
            {!matrixMode && <directionalLight position={[15, 25, 10]} intensity={sunIntensity} color={sunColor} castShadow />}
            {!matrixMode && <pointLight position={[0, 0, 0]} intensity={3} color={primary} distance={45} decay={2} />}
            {!matrixMode && <pointLight position={[0, -18, 0]} intensity={0.8} color={beam} distance={35} decay={2} />}

            {/* ── Fog ── */}
            {!matrixMode && (
                features.carbon && carbonVisuals?.fogColor
                    ? <fog attach="fog" args={[carbonVisuals.fogColor, carbonVisuals.fogNear ?? 65, carbonVisuals.fogFar ?? 180]} />
                    : <fog attach="fog" args={['#000010', 65, 180]} />
            )}

            {/* ── Build weather global ── */}
            {features.weather && <GlobalWeatherFog islands={islands} active={features.weather} />}

            {/* ── Camera ── */}
            <DroneCamera active={droneActive} onComplete={onDroneComplete} />

            {/* ── Background (hidden in matrix mode) ── */}
            {!matrixMode && (
                <>
                    <StarField count={isExtremeLoad ? 800 : 5000} theme={theme} />
                    <NebulaClouds theme={theme} />
                    {!isExtremeLoad && <VoidDust color={primary} />}
                    {!isExtremeLoad && <VerticalSpire color={primary} />}
                </>
            )}

            {/* ── Matrix Rain ── */}
            <MatrixRain active={matrixMode} />

            {/* ── Live Traffic ── */}
            {!matrixMode && <LiveTraffic islands={islands} active={features.traffic} themeColor={primary} />}

            {/* ── Ghost Avatars ── */}
            {!matrixMode && <GhostAvatars active={features.ghosts} userCount={3} />}

            {/* ── Neural Pathway ── */}
            {!matrixMode && features.neural && (
                <NeuralPathway islands={islands} active themeColor="#dd00ff" />
            )}

            {/* ── Recruiter Billboard ── */}
            {recruiterMode && coreIsland && (
                <RecruiterBillboard coreIsland={coreIsland} themeColor={primary} />
            )}

            {/* ── Onboarding Drone ── */}
            <OnboardingDrone
                islands={islands}
                active={onboardingActive}
                onClose={onOnboardingClose}
                themeColor={primary}
            />

            {/* ── Container Transport ── */}
            <ContainerTransport
                islands={islands}
                themeColor={primary}
                active={features.deploy}
            />

            {/* ── Energy beams (off in neural/matrix/graph mode) ── */}
            {!features.neural && !matrixMode && !galaxyMode && !features.graph && cityData?.connections?.map((conn) => (
                <group key={conn.id}>
                    <EnergyBeam from={conn.from} to={conn.to} color={conn.isPrimary ? primary : beam}
                        thickness={conn.thickness || 1} isPrimary={conn.isPrimary} />
                    {conn.isPrimary && <BeamParticles from={conn.from} to={conn.to} color={primary} />}
                </group>
            ))}

            {/* ── True AST Code Connections ── */}
            {!features.neural && !matrixMode && !galaxyMode && !features.graph && astBeams.map((conn) => (
                <group key={conn.id}>
                    <EnergyBeam from={conn.from} to={conn.to} color="#ff0044" thickness={1.2} isPrimary={true} />
                    <BeamParticles from={conn.from} to={conn.to} color="#ff0044" />
                </group>
            ))}

            {/* ── Knowledge Graph Structural Connections ── */}
            <KnowledgeGraphLinks islands={islands} active={features.graph} />

            {/* ── Jira / Linear Tickets ── */}
            <JiraTickets islands={islands} active={features.bugs} />

            {/* ── Feature Expansions (Spiders, Phantom, Nebula, Trophy, Documentary, Linter Wars) ── */}
            <LinterWars islands={islands} active={features.linter} />
            <BurndownVis active={features.burndown} />
            <FPSController active={features.fps} />
            <CrossRepoWormholes active={features.wormhole} />
            <BossFight active={features.boss} />
            <InstancedCity active={features.instanced} count={isExtremeLoad ? 4000 : 50000} />
            <TelemetryHeatmap islands={islands} active={features.heatmap} />

            <SupplyChainNebula active={features.nebula} />
            <GlitchSpiders islands={islands} active={features.glitch} />
            <PhantomReviewer islands={islands} active={features.phantom} />
            <DesktopTrophyExporter triggerIndex={exportSTLTrig} />
            <AutoDocumentary triggerIndex={docTrig} islands={islands} />

            {/* ── Islands / Galaxy Mode ── */}
            <group scale={galaxyMode ? 0.05 : 1} position={galaxyMode ? [0, -20, 0] : [0, 0, 0]}>
                {galaxyMode && (
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[15, 32, 32]} />
                        <meshStandardMaterial color="#ffaa00" emissive="#ff3300" emissiveIntensity={2} />
                        <pointLight color="#ff8800" intensity={2} distance={300} />
                    </mesh>
                )}
                {islands.map((island, index) => {
                    if (matrixMode) return <MatrixIsland key={island.id} island={island} />;

                    // Code DNA Helix & Knowledge Graph
                    let transformPos = null;
                    if (features.graph) {
                        const num = islands.length;
                        const phi = Math.acos(1 - 2 * (index + 0.5) / num);
                        const theta = Math.PI * (1 + Math.sqrt(5)) * index;
                        const r = 25;
                        transformPos = [r * Math.cos(theta) * Math.sin(phi), r * Math.sin(theta) * Math.sin(phi), r * Math.cos(phi)];
                    } else if (features.helix) {
                        transformPos = [Math.sin(index * 0.5) * 15, index * 1.5 - 20, Math.cos(index * 0.5) * 15];
                    }

                    const vuln = features.security ? getIslandVulnerability(island.name) : null;
                    const decay = features.decay ? getDecayLevel(island) : 0;
                    const buildSt = features.weather ? getBuildState(island.name) : null;
                    const conflict = features.battle ? conflictMap[island.id] : null;

                    return (
                        <group key={island.id} position={transformPos || [0, 0, 0]}>
                            <FloatingIsland
                                island={{ ...island, position: transformPos ? [0, 0, 0] : island.position }}
                                themeColors={colors}
                                onSelect={onSelectIsland}
                                selected={selectedIsland?.id === island.id}
                                timelineProgress={timelineProgress}
                                features={features}
                                matrixMode={matrixMode}
                            />
                            {vuln && <SecurityShield island={island} vuln={vuln} />}
                            {features.legacy && decay > 0 && index < 25 && (
                                <>
                                    <DecayOverlay island={island} decay={decay} />
                                    <DecayParticles position={island.position} decay={decay} color={primary} />
                                </>
                            )}
                            {buildSt && index < 10 && <BuildWeather island={island} buildStatus={buildSt} active={features.weather} />}
                            {conflict && <IslandBattle island={island} conflict={conflict} />}
                            {features.music && index < 6 && <AudioIndicator island={island} active themeColor={primary} />}
                        </group>
                    );
                })}
            </group>

            {/* ── Music Hook ── */}
            <MusicLayer islands={islands} active={features.music} />

            {/* ── VR Teleport targets ── */}
            <VRScene islands={islands} vrActive={features.vr} />

            {/* ── Orbit Controls ── */}
            {!droneActive && (
                <OrbitControls enablePan enableZoom enableRotate
                    minDistance={4} maxDistance={90}
                    autoRotate autoRotateSpeed={0.25}
                    makeDefault
                />
            )}

            {/* ── Post-processing ── */}
            {!isExtremeLoad && (
                <PostProcessingEffects
                    theme={matrixMode ? 'matrix' : theme}
                    intensity={narrative ? 1.0 : 0.6}
                />
            )}
        </>
    );
}

// ── Main Export ───────────────────────────────────────────────
export function Scene({
    cityData, narrative, onSelectIsland, selectedIsland,
    droneActive, onDroneComplete, timelineProgress = 100,
    features = {}, carbonVisuals = null,
    recruiterMode = false,
    matrixMode = false,
    onboardingActive = false,
    onOnboardingClose,
    docTrig,
    exportSTLTrig,
    galaxyMode
}) {
    const bgColor = matrixMode ? '#000500' : (narrative?.colors?.bgGradient?.[0] || '#000010');

    return (
        <Canvas
            camera={{ position: [0, 10, 32], fov: 58, near: 0.1, far: 600 }}
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.15,
                preserveDrawingBuffer: true,
            }}
            dpr={[1, 1.5]}
        >
            <color attach="background" args={[bgColor]} />

            <SceneContents
                cityData={cityData}
                narrative={narrative}
                onSelectIsland={onSelectIsland}
                selectedIsland={selectedIsland}
                droneActive={droneActive}
                onDroneComplete={onDroneComplete}
                timelineProgress={timelineProgress}
                features={features}
                carbonVisuals={carbonVisuals}
                recruiterMode={recruiterMode}
                matrixMode={matrixMode}
                onboardingActive={onboardingActive}
                onOnboardingClose={onOnboardingClose}
                docTrig={docTrig}
                exportSTLTrig={exportSTLTrig}
                galaxyMode={galaxyMode}
            />
        </Canvas>
    );
}
