import React, { useMemo } from 'react';
import { seededRandom } from '../utils/seededRandom';

// ── 6. Heatmap Telemetry ──────────────────────────────────────────────
// This visually wraps islands in a glowing red/orange aura based on
// "hotness" (simulating clicked/edited telemetry data)
export function TelemetryHeatmap({ islands, active }) {
    // Hooks MUST be called unconditionally — early-returning before useMemo
    // changes the hook count between renders and crashes React when this
    // feature is toggled. We compute lazily and bail out below.
    const heatData = useMemo(() => {
        if (!islands) return [];
        return islands.map(island => {
            // Deterministic so toggling on/off is stable, no re-randomisation lag
            const heatScore = island.isCore ? 0 : seededRandom(island.id || 'heat', 7);
            const color = heatScore > 0.8 ? '#ff0000' : heatScore > 0.5 ? '#ffaa00' : '#ffff00';
            const radius = 2 + heatScore * 4;
            return {
                id: `heat-${island.id}`,
                pos: island.position,
                score: heatScore,
                color,
                radius,
            };
        }).filter(h => h.score > 0.3);
    }, [islands]);

    if (!active || !islands) return null;

    return (
        <group>
            {heatData.map(h => (
                <mesh key={h.id} position={h.pos}>
                    <sphereGeometry args={[h.radius, 16, 16]} />
                    <meshBasicMaterial color={h.color} transparent opacity={0.15 + h.score * 0.2} depthWrite={false} blending={2} />
                </mesh>
            ))}
        </group>
    );
}
