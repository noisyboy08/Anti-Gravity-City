/**
 * narrativeEngine.js
 * Generates AI-style lore, themes, and color palettes from repository metadata.
 * Produces legendary, cinematic backstories for each unique codebase.
 */

const THEMES = {
    'cyber-astral': {
        name: 'Cyber-Astral',
        primaryColor: '#00f5ff',
        secondaryColor: '#7b2fff',
        accentColor: '#ff00aa',
        ambientColor: '#0a0020',
        emissiveColor: '#00f5ff',
        bgGradient: ['#000010', '#050020', '#0a0040'],
        islandColor: '#0d1b3e',
        coreColor: '#00f5ff',
        beamColor: '#7b2fff',
    },
    'bioluminescent': {
        name: 'Bioluminescent Jungle',
        primaryColor: '#00ff88',
        secondaryColor: '#ff6b35',
        accentColor: '#ffff00',
        ambientColor: '#001a0a',
        emissiveColor: '#00ff88',
        bgGradient: ['#000a05', '#001a0a', '#002a10'],
        islandColor: '#0a1f0a',
        coreColor: '#00ff88',
        beamColor: '#00cc66',
    },
    'steampunk': {
        name: 'Ancient Steampunk',
        primaryColor: '#ff9500',
        secondaryColor: '#8b4513',
        accentColor: '#ffd700',
        ambientColor: '#1a0f00',
        emissiveColor: '#ff9500',
        bgGradient: ['#0d0800', '#1a1000', '#261800'],
        islandColor: '#2a1a08',
        coreColor: '#ff9500',
        beamColor: '#ffd700',
    },
    'minimalist-void': {
        name: 'Minimalist Void',
        primaryColor: '#ffffff',
        secondaryColor: '#888888',
        accentColor: '#aaaaaa',
        ambientColor: '#050505',
        emissiveColor: '#cccccc',
        bgGradient: ['#000000', '#050505', '#0a0a0a'],
        islandColor: '#111111',
        coreColor: '#ffffff',
        beamColor: '#555555',
    },
};

const LANGUAGE_CORE_DESCRIPTIONS = {
    javascript: { core: 'a blazing V8 reactor core, spinning with event loops', emoji: '⚡' },
    typescript: { core: 'a crystalline type matrix, glowing with strict blue light', emoji: '🔷' },
    python: { core: 'a serpentine energy crystal pulsing with interpreted power', emoji: '🐍' },
    rust: { core: 'an iron-forged memory fortress, impenetrable and eternal', emoji: '⚙️' },
    go: { core: 'a rapid-firing goroutine engine, always concurrent', emoji: '🏃' },
    java: { core: 'a towering JVM citadel, its bytecode flowing like lava', emoji: '☕' },
    cpp: { core: 'a raw silicon reactor, brutal and unforgiving in its power', emoji: '💀' },
    ruby: { core: 'a gem-encrusted palace of elegant syntax and magic', emoji: '💎' },
    php: { core: 'an ancient server relic, weathered but eternally serving', emoji: '🌐' },
    swift: { core: 'a swift-metal forge, crafting elegant interfaces from thin air', emoji: '🦅' },
    kotlin: { core: 'a JVM nexus reborn, sleek and null-safe', emoji: '🌊' },
    default: { core: 'a radiant data nexus, humming with ancient computational energy', emoji: '🌟' },
};

const LORE_TEMPLATES = [
    (name, lang, commits, contributors) =>
        `The Fortress of ${name} drifts eternal in the Cyber-Astral void, its spires forged from ${commits.toLocaleString()} commits of pure ${lang} logic. ${contributors} architects gave their code to birth this legend — and now it floats, sentient and sovereign.`,
    (name, lang, commits, contributors) =>
        `Long before the digital age collapsed into the Void, ${contributors} engineers raised the ${name} Citadel from raw ${lang} ore. Today, ${commits.toLocaleString()} crystallized commits power its anti-gravity cores, keeping it aloft above the dying servers below.`,
    (name, lang, commits, contributors) =>
        `They said a codebase this complex could not fly. ${contributors} heretics proved them wrong. The ${name} Archipelago now orbits the binary sun, its ${commits.toLocaleString()} commits blazing like ${lang}-fueled supernovae.`,
    (name, lang, commits, contributors) =>
        `In the ${commits.toLocaleString()}th cycle of the DevOps Era, ${contributors} code-weavers raised ${name} from the datastream depths. Its foundations: pure ${lang} logic. Its destiny: to float forever above mortal repositories.`,
];

/**
 * Determine theme based on language and repo characteristics
 */
function selectTheme(language, stars, description) {
    const lang = (language || '').toLowerCase();
    const desc = (description || '').toLowerCase();

    if (lang === 'python' || lang === 'julia' || desc.includes('machine learning') || desc.includes('ai') || desc.includes('neural')) {
        return 'bioluminescent';
    }
    if (lang === 'rust' || lang === 'c' || lang === 'cpp' || desc.includes('system') || desc.includes('embedded')) {
        return 'steampunk';
    }
    if (desc.includes('minimal') || desc.includes('clean') || desc.includes('simple')) {
        return 'minimalist-void';
    }
    return 'cyber-astral';
}

/**
 * Main narrative generation function
 */
export function generateNarrative(repoData) {
    const {
        name = 'Unknown Repo',
        language = 'Unknown',
        description = '',
        stargazers_count = 0,
        forks_count = 0,
        open_issues_count = 0,
        contributors_count = 1,
        commits_count = 100,
        topics = [],
        size = 1000,
    } = repoData;

    const themeKey = selectTheme(language, stargazers_count, description);
    const theme = THEMES[themeKey];
    const langKey = (language || 'default').toLowerCase();
    const coreDesc = LANGUAGE_CORE_DESCRIPTIONS[langKey] || LANGUAGE_CORE_DESCRIPTIONS.default;

    const loreTemplate = LORE_TEMPLATES[Math.floor(name.length % LORE_TEMPLATES.length)];
    const lore = loreTemplate(name, language || 'unknown', commits_count, contributors_count);

    return {
        theme: themeKey,
        themeName: theme.name,
        colors: theme,
        lore,
        core: coreDesc.core,
        coreEmoji: coreDesc.emoji,
        stats: {
            stars: stargazers_count,
            forks: forks_count,
            issues: open_issues_count,
            contributors: contributors_count,
            commits: commits_count,
            size: size,
            topics,
        },
        altitude: {
            high: ['src', 'core', 'lib', 'main', 'api', 'app'],
            medium: ['components', 'utils', 'services', 'hooks', 'store'],
            low: ['test', 'tests', '__tests__', 'deprecated', 'legacy', 'examples', 'docs'],
        },
    };
}

export { THEMES };
