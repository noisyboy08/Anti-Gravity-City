/**
 * cityBuilder.js
 * Converts GitHub repository tree structure into 3D spatial coordinates.
 * Maps folders → floating islands with altitude, orbital radius, and energy connections.
 */

const ALTITUDE_MAP = {
    'src': 12, 'core': 11, 'lib': 10, 'main': 10, 'api': 9, 'app': 9,
    'components': 7, 'utils': 6, 'services': 6, 'hooks': 6, 'store': 6, 'context': 6,
    'assets': 4, 'styles': 4, 'public': 4, 'static': 4,
    'test': 2, 'tests': 2, '__tests__': 2, 'examples': 2,
    'docs': 1, 'deprecated': 0, 'legacy': 0,
};

const ISLAND_RADIUS_BASE = 14;

/**
 * Build a deterministic but "natural-looking" angle from a folder name
 */
function nameToAngle(name, index, total) {
    const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const baseAngle = (index / total) * Math.PI * 2;
    const jitter = (hash % 30) * (Math.PI / 180);
    return baseAngle + jitter;
}

/**
 * Convert file size (bytes) to island scale
 */
function sizeToScale(size) {
    if (size < 10000) return 0.6;
    if (size < 50000) return 0.9;
    if (size < 200000) return 1.2;
    if (size < 1000000) return 1.6;
    return 2.0;
}

/**
 * Get altitude for a folder based on its name
 */
function getAltitude(name, depth) {
    const key = name.toLowerCase();
    if (ALTITUDE_MAP[key] !== undefined) return ALTITUDE_MAP[key];
    // Deeper nesting = lower altitude
    return Math.max(0, 8 - depth * 2);
}

/**
 * Build the city layout from GitHub tree data
 */
export function buildCityLayout(treeData, repoMeta) {
    if (!treeData || !treeData.length) return buildDemoCity(repoMeta);

    // Filter to directories and notable files
    const dirs = treeData.filter(item => item.type === 'tree');
    const topFiles = treeData
        .filter(item => item.type === 'blob')
        .sort((a, b) => (b.size || 0) - (a.size || 0))
        .slice(0, 8);

    const islands = [];
    const connections = [];

    // === CENTRAL CORE STATION ===
    islands.push({
        id: 'core-station',
        name: repoMeta.name,
        type: 'core',
        position: [0, 0, 0],
        scale: 2.5,
        altitude: 0,
        color: null, // uses theme color
        fileCount: treeData.length,
        isCore: true,
    });

    // === DIRECTORY ISLANDS ===
    const topDirs = dirs.filter(d => !d.path.includes('/')).slice(0, 16);
    topDirs.forEach((dir, i) => {
        const name = dir.path.split('/').pop();
        const depth = (dir.path.match(/\//g) || []).length;
        const altitude = getAltitude(name, depth);
        const angle = nameToAngle(name, i, topDirs.length);
        const radius = ISLAND_RADIUS_BASE + (Math.sin(i * 1.3) * 4);
        const scale = 0.8 + (altitude / 15);

        const pos = [
            Math.cos(angle) * radius,
            altitude - 5,
            Math.sin(angle) * radius,
        ];

        islands.push({
            id: dir.sha || `dir-${i}`,
            name,
            type: 'directory',
            position: pos,
            scale,
            altitude,
            angle,
            orbitSpeed: 0.0002 + (altitude * 0.00003),
            orbitRadius: radius,
            depth,
            originalPath: dir.path,
        });

        // Connect to core
        connections.push({
            id: `conn-core-${i}`,
            from: [0, 0, 0],
            to: pos,
            thickness: altitude > 8 ? 2 : 1,
            isPrimary: altitude > 7,
        });
    });

    // === FILE ORBS (top files become bright suns/stars) ===
    topFiles.forEach((file, i) => {
        const name = file.path.split('/').pop();
        const size = file.size || 1000;
        const angle = (i / topFiles.length) * Math.PI * 2 + Math.PI / 4;
        const radius = 6 + (i % 3) * 2;
        const altitude = 2 + (size > 50000 ? 4 : 0);

        islands.push({
            id: file.sha || `file-${i}`,
            name,
            type: size > 50000 ? 'sun' : 'star',
            position: [
                Math.cos(angle) * radius,
                altitude - 3,
                Math.sin(angle) * radius,
            ],
            scale: sizeToScale(size),
            altitude,
            fileSize: size,
            originalPath: file.path,
        });
    });

    return { islands, connections };
}

/**
 * Demo city layout when no real data is available
 */
export function buildDemoCity(repoMeta) {
    const name = repoMeta?.name || 'DemoRepo';
    const islands = [
        {
            id: 'core-station',
            name,
            type: 'core',
            position: [0, 0, 0],
            scale: 2.5,
            altitude: 0,
            isCore: true,
            fileCount: 247,
        },
        { id: 'src', name: 'src', type: 'directory', position: [-12, 7, -5], scale: 1.4, altitude: 12, angle: 0, orbitSpeed: 0.0003, orbitRadius: 13 },
        { id: 'api', name: 'api', type: 'directory', position: [10, 6, -8], scale: 1.3, altitude: 9, angle: 1.2, orbitSpeed: 0.00025, orbitRadius: 13 },
        { id: 'components', name: 'components', type: 'directory', position: [5, 2, 12], scale: 1.1, altitude: 7, angle: 2.1, orbitSpeed: 0.00022, orbitRadius: 13 },
        { id: 'utils', name: 'utils', type: 'directory', position: [-8, 1, 10], scale: 1.0, altitude: 6, angle: 3.0, orbitSpeed: 0.0002, orbitRadius: 12 },
        { id: 'hooks', name: 'hooks', type: 'directory', position: [14, 1, 3], scale: 0.9, altitude: 6, angle: 3.8, orbitSpeed: 0.00018, orbitRadius: 14 },
        { id: 'store', name: 'store', type: 'directory', position: [-14, 0, -3], scale: 0.9, altitude: 6, angle: 4.5, orbitSpeed: 0.00017, orbitRadius: 14 },
        { id: 'assets', name: 'assets', type: 'directory', position: [3, -3, -14], scale: 0.8, altitude: 4, angle: 5.2, orbitSpeed: 0.00015, orbitRadius: 14 },
        { id: 'tests', name: 'tests', type: 'directory', position: [-6, -5, -12], scale: 0.7, altitude: 2, angle: 5.9, orbitSpeed: 0.00012, orbitRadius: 13 },
        { id: 'docs', name: 'docs', type: 'directory', position: [12, -6, 7], scale: 0.65, altitude: 1, angle: 0.8, orbitSpeed: 0.0001, orbitRadius: 14 },
        { id: 'main-file', name: 'index.js', type: 'sun', position: [4, 5, 4], scale: 1.2, altitude: 8, fileSize: 80000 },
        { id: 'config-file', name: 'config.json', type: 'star', position: [-4, 3, 5], scale: 0.7, altitude: 5, fileSize: 5000 },
        { id: 'readme', name: 'README.md', type: 'star', position: [6, 2, -5], scale: 0.65, altitude: 3, fileSize: 3000 },
    ];

    const connections = [
        { id: 'c1', from: [0, 0, 0], to: [-12, 7, -5], thickness: 2, isPrimary: true },
        { id: 'c2', from: [0, 0, 0], to: [10, 6, -8], thickness: 2, isPrimary: true },
        { id: 'c3', from: [0, 0, 0], to: [5, 2, 12], thickness: 1.5, isPrimary: true },
        { id: 'c4', from: [0, 0, 0], to: [-8, 1, 10], thickness: 1, isPrimary: false },
        { id: 'c5', from: [0, 0, 0], to: [14, 1, 3], thickness: 1, isPrimary: false },
        { id: 'c6', from: [0, 0, 0], to: [-14, 0, -3], thickness: 1, isPrimary: false },
        { id: 'c7', from: [0, 0, 0], to: [3, -3, -14], thickness: 0.8, isPrimary: false },
        { id: 'c8', from: [0, 0, 0], to: [-6, -5, -12], thickness: 0.6, isPrimary: false },
        { id: 'c9', from: [-12, 7, -5], to: [5, 2, 12], thickness: 1, isPrimary: false },
        { id: 'c10', from: [10, 6, -8], to: [14, 1, 3], thickness: 0.8, isPrimary: false },
    ];

    return { islands, connections };
}
