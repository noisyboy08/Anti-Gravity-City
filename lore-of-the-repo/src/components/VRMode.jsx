/**
 * VRMode.jsx — Crash-safe version
 * - NO @react-three/xr store at module load time (was crashing the Canvas)
 * - VR button only renders if browser actually supports immersive-vr
 * - Teleport rings are plain Three.js meshes (zero XR dependency)
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';

// ── Teleport ring — plain R3F, no XR import ───────────────────
function TeleportRing({ position }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
        meshRef.current.material.opacity =
            0.4 + 0.2 * Math.sin(state.clock.elapsedTime * 4);
    });

    return (
        <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.2, 0.07, 8, 48]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.5} depthWrite={false} />
        </mesh>
    );
}

// ── VR Scene — rendered INSIDE Canvas ────────────────────────
// Only shows teleport rings when vrActive is true.
// Wrapping the canvas in <XR> was the original crash cause — removed entirely.
export function VRScene({ islands, vrActive }) {
    if (!vrActive || !islands) return null;

    return (
        <group>
            {islands.slice(0, 8).map(island => (
                <TeleportRing key={island.id} position={island.position} />
            ))}
        </group>
    );
}

// ── VR Button — rendered OUTSIDE Canvas ──────────────────────
// Only shows if the browser reports WebXR immersive-vr support.
export function VRButton({ themeColor = '#00f5ff', onToggle, vrActive }) {
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if (!('xr' in navigator)) return;
        navigator.xr
            ?.isSessionSupported('immersive-vr')
            .then(yes => setSupported(yes))
            .catch(() => setSupported(false));
    }, []);

    // Don't render at all on non-XR browsers (desktop Chrome/Firefox without VR headset)
    if (!supported) return null;

    return (
        <motion.button
            className="cinema-btn"
            onClick={onToggle}
            style={vrActive ? { borderColor: themeColor, color: themeColor } : {}}
            title="Enter VR Mode"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
        >
            <span>🥽</span>
            <span className="cinema-label">VR</span>
        </motion.button>
    );
}
