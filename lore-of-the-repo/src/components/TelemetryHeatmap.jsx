import React, { useMemo } from 'react';

// ── 6. Heatmap Telemetry ──────────────────────────────────────────────
// This visually wraps islands in a glowing red/orange aura based on 
// "hotness" (simulating clicked/edited telemetry data)
export function TelemetryHeatmap({ islands, active }) {
    if (!active || !islands) return null;

    // Generate random heatmap data for demonstration
    const heatData = useMemo(() => {
        return islands.map(island => {
            const heatScore = island.isCore ? 0 : Math.random();
            const color = heatScore > 0.8 ? '#ff0000' : heatScore > 0.5 ? '#ffaa00' : '#ffff00';
            const radius = 2 + heatScore * 4;
            return {
                id: `heat-${island.id}`,
                pos: island.position,
                score: heatScore,
                color,
                radius
            };
        }).filter(h => h.score > 0.3); // Only show moderately hot ones
    }, [islands]);

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
