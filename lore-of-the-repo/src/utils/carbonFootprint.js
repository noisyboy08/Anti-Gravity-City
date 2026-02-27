/**
 * CarbonFootprint.js
 * Calculates a "carbon footprint" score from repo size + language efficiency.
 * Binds to lighting: low = bright yellow sun, high = harsh dark orange smog.
 */

// Language efficiency ratings (lower = more efficient/green)
const LANG_EFFICIENCY = {
    'C': 0.1,
    'C++': 0.12,
    'Rust': 0.11,
    'Go': 0.18,
    'Java': 0.38,
    'Kotlin': 0.35,
    'Swift': 0.32,
    'JavaScript': 0.45,
    'TypeScript': 0.44,
    'Python': 0.55,
    'Ruby': 0.62,
    'PHP': 0.58,
    'R': 0.70,
    'Jupyter Notebook': 0.75,
    'Shell': 0.20,
    'Dockerfile': 0.15,
};

/**
 * Returns a 0–1 carbon score (0 = pristine clean, 1 = max footprint/smog)
 */
export function calcCarbonScore(repoMeta) {
    if (!repoMeta) return 0.3;
    const langScore = LANG_EFFICIENCY[repoMeta.language] ?? 0.5;
    // Size impact (log scale, capped at 500MB = 512000 KB)
    const sizeKB = repoMeta.size || 0;
    const sizeScore = Math.min(1, Math.log10(Math.max(1, sizeKB) + 1) / 5.7);
    // Contributor complexity
    const contribScore = Math.min(1, (repoMeta.contributors_count || 1) / 200);

    return Math.min(1, langScore * 0.55 + sizeScore * 0.35 + contribScore * 0.1);
}

/**
 * Returns scene configuration based on carbon score.
 */
export function getCarbonVisuals(score) {
    // Green zone (0–0.33): bright, clean
    if (score < 0.33) return {
        sunColor: '#ffffc8',
        sunIntensity: 2.8,
        fogColor: '#000818',
        fogNear: 70,
        fogFar: 220,
        ambientColor: '#0a1a3a',
        label: '🌱 LOW FOOTPRINT',
        labelColor: '#00ff88',
        description: `${(score * 100).toFixed(0)}% — Clean & Efficient`,
    };

    // Amber zone (0.33–0.66): moderate
    if (score < 0.66) return {
        sunColor: '#ffcc44',
        sunIntensity: 1.8,
        fogColor: '#100c04',
        fogNear: 50,
        fogFar: 160,
        ambientColor: '#1a1204',
        label: '⚡ MODERATE IMPACT',
        labelColor: '#ffcc44',
        description: `${(score * 100).toFixed(0)}% — Room to Optimize`,
    };

    // Red zone (0.66–1.0): heavy smog
    return {
        sunColor: '#cc5500',
        sunIntensity: 0.8,
        fogColor: '#180800',
        fogNear: 30,
        fogFar: 90,
        ambientColor: '#1a0800',
        label: '🏭 HIGH FOOTPRINT',
        labelColor: '#ff4400',
        description: `${(score * 100).toFixed(0)}% — Heavy Environmental Cost`,
    };
}
