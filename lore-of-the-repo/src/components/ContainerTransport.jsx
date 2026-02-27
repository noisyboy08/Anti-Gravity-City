/**
 * ContainerTransport.jsx
 * Docker Cargo Ship DevOps simulation.
 * Every 60s: ship descends → drones carry code cubes → ship blasts off.
 *
 * Phases:
 *  0: IDLE (ship docked high in sky, invisible)
 *  1: DESCEND (ship slowly flies down)
 *  2: LOADING (mini drones carry glowing cubes from islands to ship)
 *  3: LAUNCH (engines fire, ship blasts off with exhaust trail)
 */

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import gsap from 'gsap';

// ── Phase constants ────────────────────────────────────────────
const PHASE_IDLE = 0;
const PHASE_DESCEND = 1;
const PHASE_LOADING = 2;
const PHASE_LAUNCH = 3;

const DEPLOY_INTERVAL = 60 * 1000; // 60 seconds
const SHIP_DOCK_Y = 38;
const SHIP_LOAD_Y = 18;
const SHIP_ORBIT_Y = 80;

// ── Cargo Ship Mesh ────────────────────────────────────────────
function CargoShip({ posRef, phase, themeColor }) {
    const groupRef = useRef();
    const engineRef = [useRef(), useRef()];
    const exhaustRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;
        groupRef.current.position.copy(posRef.current);
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;

        // Engine glow pulse
        const loading = phase === PHASE_LOADING;
        const launching = phase === PHASE_LAUNCH;
        engineRef.forEach(r => {
            if (r.current) {
                r.current.material.emissiveIntensity = launching
                    ? 4 + Math.sin(state.clock.elapsedTime * 20) * 2
                    : loading ? 1.5 + Math.sin(state.clock.elapsedTime * 3) * 0.5
                        : 0.3;
            }
        });

        // Exhaust particles
        if (exhaustRef.current) {
            exhaustRef.current.visible = launching;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Main hull */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[5, 1.2, 2.2]} />
                <meshStandardMaterial color="#0a0e1a" roughness={0.2} metalness={0.9}
                    emissive={themeColor} emissiveIntensity={0.05} />
            </mesh>

            {/* Bridge tower */}
            <mesh position={[1.5, 1.0, 0]}>
                <boxGeometry args={[1.2, 1.4, 1.8]} />
                <meshStandardMaterial color="#080c18" roughness={0.3} metalness={0.85} />
            </mesh>

            {/* Bridge windows */}
            {[-0.4, 0, 0.4].map((x, i) => (
                <mesh key={i} position={[2.12, 1.15, x]}>
                    <boxGeometry args={[0.05, 0.28, 0.28]} />
                    <meshStandardMaterial color={themeColor} emissive={themeColor} emissiveIntensity={2} />
                </mesh>
            ))}

            {/* Cargo bay */}
            <mesh position={[-0.8, 0.4, 0]}>
                <boxGeometry args={[2.8, 0.7, 1.8]} />
                <meshStandardMaterial color="#090d18" roughness={0.15} metalness={0.95}
                    emissive="#001133" emissiveIntensity={0.3} />
            </mesh>

            {/* Wing fins */}
            {[-1, 1].map((s, i) => (
                <mesh key={i} position={[0, -0.35, s * 1.6]} rotation={[s * 0.2, 0, 0]}>
                    <boxGeometry args={[4, 0.12, 0.9]} />
                    <meshStandardMaterial color="#060a16" roughness={0.1} metalness={0.98} />
                </mesh>
            ))}

            {/* Engine nacelles */}
            {[-1, 1].map((s, i) => (
                <group key={i} ref={engineRef[i]} position={[-2.2, -0.2, s * 0.8]}>
                    <mesh>
                        <cylinderGeometry args={[0.28, 0.35, 1.2, 12]} />
                        <meshStandardMaterial color="#050818" roughness={0.05} metalness={1}
                            emissive={s > 0 ? '#ff6600' : '#ff4400'} emissiveIntensity={0.3} />
                    </mesh>
                    {/* Nozzle glow */}
                    <mesh position={[0, -0.65, 0]}>
                        <circleGeometry args={[0.3, 12]} />
                        <meshBasicMaterial color={s > 0 ? '#ff8800' : '#ff5500'}
                            transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
                    </mesh>
                    <pointLight color="#ff6600" intensity={0} distance={6} decay={2} />
                </group>
            ))}

            {/* Exhaust particle burst (launch only) */}
            <group ref={exhaustRef} position={[-2.5, -0.2, 0]}>
                <pointLight color="#ff8800" intensity={15} distance={12} decay={2} />
                {/* Simple exhaust cone */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <coneGeometry args={[1.4, 5, 8, 1, true]} />
                    <meshBasicMaterial color="#ff6600" transparent opacity={0.3}
                        side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
            </group>

            {/* Status badge */}
            {phase !== PHASE_IDLE && (
                <Html position={[0, 2.5, 0]} center distanceFactor={20} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        fontFamily: 'Space Mono, monospace', fontSize: '9px', fontWeight: 700,
                        color: phase === PHASE_LAUNCH ? '#ff8800' : themeColor,
                        background: 'rgba(0,0,0,0.8)', border: `1px solid ${phase === PHASE_LAUNCH ? '#ff880044' : themeColor + '44'}`,
                        borderRadius: '5px', padding: '3px 9px', whiteSpace: 'nowrap',
                        boxShadow: `0 0 10px ${phase === PHASE_LAUNCH ? '#ff880033' : themeColor + '33'}`,
                    }}>
                        {phase === PHASE_DESCEND && '⬇ DEPLOYMENT VESSEL ARRIVING'}
                        {phase === PHASE_LOADING && '📦 LOADING BUILD ARTIFACTS'}
                        {phase === PHASE_LAUNCH && '🚀 DEPLOYING TO PRODUCTION'}
                    </div>
                </Html>
            )}
        </group>
    );
}

// ── Delivery Drone (carries code cube) ────────────────────────
function DeliveryDrone({ fromPos, toPos, color, delay, onDone }) {
    const meshRef = useRef();
    const progressRef = useRef(0);
    const startedRef = useRef(false);
    const timeRef = useRef(0);

    // Pre-calculate the entire arc path outside the 60fps loop
    const curve = useMemo(() => {
        const from = new THREE.Vector3(...fromPos);
        const to = new THREE.Vector3(...toPos);
        const mid = from.clone().add(to).multiplyScalar(0.5);
        mid.y += 4;
        return new THREE.QuadraticBezierCurve3(from, mid, to);
    }, [fromPos, toPos]);

    // Pre-allocate vector for positional updates
    const posVec = useMemo(() => new THREE.Vector3(), []);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (timeRef.current < delay) return;
        if (!startedRef.current) startedRef.current = true;

        progressRef.current = Math.min(1, progressRef.current + delta * 0.35);
        const t = progressRef.current;

        if (t >= 1) {
            if (meshRef.current) meshRef.current.visible = false;
            onDone?.();
            return;
        }

        curve.getPoint(t, posVec);
        if (meshRef.current) {
            meshRef.current.visible = true;
            meshRef.current.position.copy(posVec);
        }
    });

    return (
        <group ref={meshRef} visible={false}>
            {/* Tiny drone body */}
            <mesh>
                <boxGeometry args={[0.16, 0.06, 0.16]} />
                <meshStandardMaterial color="#0a0a20" emissive={color} emissiveIntensity={1.5} roughness={0.1} />
            </mesh>
            {/* Code cube payload */}
            <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[0.12, 0.12, 0.12]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} roughness={0} />
            </mesh>
            <pointLight color={color} intensity={0.8} distance={2} decay={2} />
        </group>
    );
}

// ── Main hook + controller ─────────────────────────────────────
export function useContainerTransport() {
    const [phase, setPhase] = useState(PHASE_IDLE);
    const [deployCount, setDeployCount] = useState(0);

    // Auto-trigger every 60s
    useEffect(() => {
        const start = () => {
            setPhase(PHASE_DESCEND);
            setTimeout(() => setPhase(PHASE_LOADING), 4000);
            setTimeout(() => setPhase(PHASE_LAUNCH), 12000);
            setTimeout(() => { setPhase(PHASE_IDLE); setDeployCount(c => c + 1); }, 17000);
        };

        // First deploy after 8 seconds
        const first = setTimeout(start, 8000);
        const interval = setInterval(start, DEPLOY_INTERVAL);
        return () => { clearTimeout(first); clearInterval(interval); };
    }, []);

    return { phase, deployCount };
}

// ── Full Container Transport Scene Component ───────────────────
export function ContainerTransport({ islands, themeColor, active }) {
    const { phase, deployCount } = useContainerTransport();
    const shipPosRef = useRef(new THREE.Vector3(0, SHIP_DOCK_Y, -20));
    const [drones, setDrones] = useState([]);

    // Animate ship position per phase
    useEffect(() => {
        if (!active) return;
        if (phase === PHASE_DESCEND) {
            gsap.to(shipPosRef.current, { y: SHIP_LOAD_Y, duration: 4, ease: 'power2.inOut' });
        }
        if (phase === PHASE_LOADING) {
            // Spawn delivery drones
            const sources = islands?.filter(i => !i.isCore).slice(0, 6) || [];
            const shipDockPos = [shipPosRef.current.x, shipPosRef.current.y, shipPosRef.current.z];
            const newDrones = sources.map((island, i) => ({
                id: `${deployCount}-${i}`,
                from: island.position,
                to: [shipDockPos[0] - 0.5 + Math.random(), shipDockPos[1] - 0.2, shipDockPos[2] + (Math.random() - 0.5)],
                delay: i * 0.8,
                color: themeColor,
            }));
            setDrones(newDrones);
        }
        if (phase === PHASE_LAUNCH) {
            setDrones([]);
            gsap.to(shipPosRef.current, {
                y: SHIP_ORBIT_Y, x: 15, z: -50,
                duration: 5, ease: 'power4.in',
                onComplete: () => {
                    shipPosRef.current.set(0, SHIP_DOCK_Y, -20);
                }
            });
        }
    }, [phase, active]);

    if (!active || phase === PHASE_IDLE) return null;

    return (
        <group>
            <CargoShip posRef={shipPosRef} phase={phase} themeColor={themeColor} />
            {phase === PHASE_LOADING && drones.map(d => (
                <DeliveryDrone
                    key={d.id}
                    fromPos={d.from}
                    toPos={d.to}
                    color={d.color}
                    delay={d.delay}
                    onDone={() => setDrones(prev => prev.filter(x => x.id !== d.id))}
                />
            ))}
        </group>
    );
}

// ── Deploy countdown HUD ──────────────────────────────────────
export function DeployCountdown({ deployCount, phase }) {
    if (phase === PHASE_IDLE) return null;
    return (
        <AnimatePresence>
            <motion.div
                className="deploy-hud"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <div className="deploy-icon">🐋</div>
                <div className="deploy-text">
                    <div className="deploy-label">
                        {phase === PHASE_DESCEND && 'CONTAINER ARRIVING'}
                        {phase === PHASE_LOADING && 'LOADING ARTIFACTS'}
                        {phase === PHASE_LAUNCH && 'DEPLOYING...'}
                    </div>
                    <div className="deploy-count">Deploy #{deployCount + 1}</div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
