/**
 * Sidebar.jsx — v2
 * Framer-motion animated glassmorphism panel with lucide-react icons.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, GitFork, Users, GitCommit, Bug, HardDrive,
    BookOpen, Cpu, Layers, ChevronRight, Sparkles
} from 'lucide-react';

export function Sidebar({ narrative, repoInfo, selectedIsland, themeColor = '#00f5ff' }) {
    if (!narrative || !repoInfo) return null;
    const { lore, themeName, stats, core, coreEmoji, isAIGenerated } = narrative;

    const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : (n?.toString() || '0');

    const statCards = [
        { icon: <Star size={11} />, label: 'Stars', value: fmt(stats.stars) },
        { icon: <GitFork size={11} />, label: 'Forks', value: fmt(stats.forks) },
        { icon: <Users size={11} />, label: 'Contributors', value: fmt(stats.contributors) },
        { icon: <GitCommit size={11} />, label: 'Commits', value: fmt(stats.commits) },
        { icon: <Bug size={11} />, label: 'Issues', value: fmt(stats.issues) },
        { icon: <HardDrive size={11} />, label: 'Size', value: `${Math.round((stats.size || 0) / 1024)}MB` },
    ];

    return (
        <motion.aside
            className="sidebar"
            style={{ '--theme-color': themeColor }}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
        >
            {/* Repo header */}
            <div className="sidebar-header">
                <div className="repo-badge">
                    <motion.span
                        className="repo-icon"
                        animate={{ filter: [`drop-shadow(0 0 4px ${themeColor})`, `drop-shadow(0 0 12px ${themeColor})`, `drop-shadow(0 0 4px ${themeColor})`] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >⬡</motion.span>
                    <div>
                        <div className="repo-name">{repoInfo.name}</div>
                        <div className="repo-owner">{repoInfo.full_name || repoInfo.name}</div>
                    </div>
                </div>
                <div className="theme-chip" style={{ borderColor: themeColor, color: themeColor }}>
                    {themeName}
                </div>
            </div>

            {/* AI badge */}
            {isAIGenerated && (
                <motion.div
                    className="ai-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ borderColor: `${themeColor}55`, color: themeColor }}
                >
                    <Sparkles size={10} /> AI-Generated Lore (Gemini)
                </motion.div>
            )}

            {/* Description */}
            {repoInfo.description && (
                <p className="repo-desc">{repoInfo.description}</p>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {statCards.map((s, i) => (
                    <motion.div
                        key={s.label}
                        className="stat-card"
                        style={{ '--theme-color': themeColor }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.04, backgroundColor: `${themeColor}12` }}
                    >
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.icon}{s.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Language + topics */}
            {repoInfo.language && (
                <div className="lang-row">
                    <span className="lang-dot" style={{ background: themeColor }} />
                    <span className="lang-label">{repoInfo.language}</span>
                    {(stats.topics || []).slice(0, 3).map(t => (
                        <span key={t} className="topic-tag" style={{ borderColor: `${themeColor}44`, color: `${themeColor}aa` }}>
                            {t}
                        </span>
                    ))}
                </div>
            )}

            {/* AI Lore */}
            <motion.div
                className="lore-card"
                style={{ borderColor: `${themeColor}33`, background: `${themeColor}07` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
            >
                <div className="lore-header">
                    <BookOpen size={13} />
                    <span className="lore-title">CITY LORE</span>
                </div>
                <p className="lore-text">{lore}</p>
            </motion.div>

            {/* Core */}
            <div className="core-card" style={{ borderColor: `${themeColor}44` }}>
                <span className="core-emoji">{coreEmoji}</span>
                <div>
                    <div className="core-label"><Cpu size={9} style={{ display: 'inline', marginRight: 4 }} />CENTRAL CORE</div>
                    <div className="core-desc">{core}</div>
                </div>
            </div>

            {/* Selected island inspector */}
            <AnimatePresence>
                {selectedIsland && (
                    <motion.div
                        className="selected-island"
                        style={{ borderColor: themeColor, background: `${themeColor}0e` }}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="selected-header" style={{ color: themeColor }}>
                            <Layers size={11} /> SELECTED NODE
                        </div>
                        <div className="selected-name">{selectedIsland.name}</div>
                        <div className="selected-meta">
                            <MetaRow label="Type" value={selectedIsland.type} />
                            {selectedIsland.altitude !== undefined && (
                                <MetaRow label="Stratum" value={
                                    selectedIsland.altitude > 8 ? '▲ Elite' :
                                        selectedIsland.altitude > 4 ? '◈ Mid-Tier' : '▼ Fringe'
                                } />
                            )}
                            {selectedIsland.fileSize && (
                                <MetaRow label="Size" value={`${(selectedIsland.fileSize / 1024).toFixed(1)} KB`} />
                            )}
                            {selectedIsland.originalPath && (
                                <MetaRow label="Path" value={selectedIsland.originalPath} mono />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="controls-hint">
                <div className="hint-item">🖱️ Drag to orbit</div>
                <div className="hint-item">🔍 Scroll to zoom</div>
                <div className="hint-item">👆 Click islands to inspect</div>
            </div>
        </motion.aside>
    );
}

function MetaRow({ label, value, mono }) {
    return (
        <div className="meta-item" style={mono ? { fontFamily: 'Space Mono, monospace', wordBreak: 'break-all' } : {}}>
            <span style={{ opacity: 0.55 }}>{label}: </span>
            <b>{value}</b>
        </div>
    );
}
