/**
 * HolographicScan.jsx
 * Raycaster-powered holographic overlay using @react-three/drei's Html component.
 * Shows filename, type, size, and a code-style snippet on hover.
 */

import { useState, useRef, useCallback } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// Raycaster that picks islands on pointer move
export function useHolographicRaycaster(islands) {
    const { camera, gl, scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const mouse = useRef(new THREE.Vector2());
    const [hoveredId, setHoveredId] = useState(null);

    const handlePointerMove = useCallback((e) => {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }, [gl]);

    useFrame(() => {
        raycaster.current.setFromCamera(mouse.current, camera);
        const intersects = raycaster.current.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const islandId = hit.userData?.islandId;
            if (islandId) setHoveredId(islandId);
        }
    });

    return { hoveredId, handlePointerMove };
}

// The holographic card that appears over a hovered island
export function HolographicCard({ island, themeColor = '#00f5ff' }) {
    if (!island) return null;

    const typeIcons = {
        core: '🌐', directory: '📁', sun: '☀️', star: '✨', default: '📄',
    };
    const icon = typeIcons[island.type] || typeIcons.default;

    const altLabel = island.altitude > 8 ? '▲ ELITE ALTITUDE'
        : island.altitude > 4 ? '◈ MID-TIER'
            : '▼ FRINGE LAYER';

    return (
        <Html
            position={[0, island.scale * 2.2 + 0.5, 0]}
            center
            distanceFactor={12}
            occlude={false}
            style={{ pointerEvents: 'none' }}
        >
            <motion.div
                className="holo-card"
                initial={{ opacity: 0, scaleY: 0.6, y: 10 }}
                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                exit={{ opacity: 0, scaleY: 0.6, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{ '--holo-color': themeColor }}
            >
                <div className="holo-header">
                    <span className="holo-icon">{icon}</span>
                    <span className="holo-name">{island.name}</span>
                    <span className="holo-type">{island.type?.toUpperCase()}</span>
                </div>

                <div className="holo-scanline" />

                <div className="holo-body">
                    {island.originalPath && (
                        <div className="holo-row">
                            <span className="holo-key">PATH</span>
                            <span className="holo-val">{island.originalPath}</span>
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
                            <span className="holo-key">MASS</span>
                            <span className="holo-val">{(island.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                    )}
                    {island.orbitSpeed !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">ORBITAL ω</span>
                            <span className="holo-val">{(island.orbitSpeed * 10000).toFixed(2)} rad/s</span>
                        </div>
                    )}
                    {island.fileCount !== undefined && (
                        <div className="holo-row">
                            <span className="holo-key">NODES</span>
                            <span className="holo-val">{island.fileCount} files</span>
                        </div>
                    )}
                </div>

                {/* Animated corner decorations */}
                <div className="holo-corner tl" />
                <div className="holo-corner tr" />
                <div className="holo-corner bl" />
                <div className="holo-corner br" />
                <div className="holo-pulse" style={{ background: themeColor }} />
            </motion.div>
        </Html>
    );
}

// Standalone floating label for all islands (lightweight version)
export function IslandLabel({ island, themeColor }) {
    return (
        <Html
            position={[0, island.scale * 1.4 + 0.8, 0]}
            center
            distanceFactor={20}
            style={{ pointerEvents: 'none' }}
        >
            <div className="island-label-pill" style={{ '--holo-color': themeColor }}>
                {island.name}
            </div>
        </Html>
    );
}
