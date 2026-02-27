/**
 * FeaturePanel.jsx
 * Collapsible glassmorphism panel controlling all 10 advanced features.
 * Framer-motion animated, lucide-react icons.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Activity, Cloud, Music2, Users,
    Skull, Swords, Brain, Leaf, ChevronLeft, ChevronRight, Settings2,
    Bug, Hexagon, Eye, Dna, Network, Crosshair,
    TrendingUp, Rocket, CircleDashed, Gamepad2, Ghost, BoxSelect, Map,
    AlertCircle
} from 'lucide-react';

import { playHoverSound, playClickSound, playWormholeSound } from '../../utils/soundEffects';

const FEATURES = [
    { key: 'security', icon: <Shield size={13} />, label: 'Security Shield', desc: 'Vuln hex shields' },
    { key: 'traffic', icon: <Activity size={13} />, label: 'Live Traffic', desc: 'Data packet beams' },
    { key: 'weather', icon: <Cloud size={13} />, label: 'Build Weather', desc: 'CI/CD rain & sun' },
    { key: 'music', icon: <Music2 size={13} />, label: 'District Music', desc: 'Web Audio API' },
    { key: 'ghosts', icon: <Users size={13} />, label: 'Ghost Avatars', desc: 'Multi-user orbs' },
    { key: 'decay', icon: <Skull size={13} />, label: 'Legacy Ruins', desc: 'Rust & moss decay' },
    { key: 'battle', icon: <Swords size={13} />, label: 'Battle Mode', desc: 'Merge conflicts' },
    { key: 'neural', icon: <Brain size={13} />, label: 'Neural Pathway', desc: 'ML/AI graph view' },
    { key: 'carbon', icon: <Leaf size={13} />, label: 'Carbon Footprint', desc: 'Eco lighting' },
    { key: 'glitch', icon: <Bug size={13} />, label: 'Glitch Hunt', desc: 'Gamified bug tracking' },
    { key: 'nebula', icon: <Hexagon size={13} />, label: 'Supply Nebula', desc: 'Dependency visual' },
    { key: 'phantom', icon: <Eye size={13} />, label: 'Phantom Reviewer', desc: 'AI code agent' },
    { key: 'helix', icon: <Dna size={13} />, label: 'Code DNA', desc: 'Helix mode layout' },
    { key: 'graph', icon: <Network size={13} />, label: 'Knowledge Graph', desc: 'AST Dependencies' },
    { key: 'linter', icon: <Crosshair size={13} />, label: 'Linter Wars', desc: 'Tower Defense' },
    { key: 'economy', icon: <TrendingUp size={13} />, label: 'Economy of Code', desc: 'Stock Market' },
    { key: 'burndown', icon: <Rocket size={13} />, label: 'The Burndown', desc: 'Live CI/CD' },
    { key: 'wormhole', icon: <CircleDashed size={13} />, label: 'The Nexus', desc: 'Cross-Repo' },
    { key: 'fps', icon: <Gamepad2 size={13} />, label: 'FPS Mode', desc: 'Walk around' },
    { key: 'boss', icon: <Ghost size={13} />, label: 'Git Boss Fight', desc: 'Merge monsters' },
    { key: 'instanced', icon: <BoxSelect size={13} />, label: 'Mega City', desc: '+50k Background Nodes' },
    { key: 'heatmap', icon: <Map size={13} />, label: 'Telemetry Heatmap', desc: 'Dev Hotspots' },
    { key: 'bugs', icon: <AlertCircle size={13} />, label: 'Jira / Linear Tracker', desc: 'Issue Visualization' },
];

export function FeaturePanel({ features, onToggle, themeColor = '#00f5ff', carbonVisuals }) {
    const activeCount = Object.values(features).filter(Boolean).length;

    return (
        <motion.div
            className="feature-panel"
            style={{ '--theme-color': themeColor }}
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        >
                        <div className="fp-header">
                            <Settings2 size={12} />
                            <span>FEATURE LAB</span>
                            <span className="fp-active-count">{activeCount} active</span>
                        </div>

                        {/* Carbon Footprint info bar */}
                        {carbonVisuals && features.carbon && (
                            <motion.div
                                className="fp-carbon-bar"
                                style={{ borderColor: `${carbonVisuals.labelColor}44`, background: `${carbonVisuals.labelColor}0e` }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <span style={{ color: carbonVisuals.labelColor }}>{carbonVisuals.label}</span>
                                <span style={{ fontSize: '9px', opacity: 0.65 }}>{carbonVisuals.description}</span>
                            </motion.div>
                        )}

                        {/* Feature toggles */}
                        <div className="fp-list">
                            {FEATURES.map((feat, i) => {
                                const on = !!features[feat.key];
                                return (
                                    <motion.button
                                        key={feat.key}
                                        className={`fp-item ${on ? 'active' : ''}`}
                                        style={{ '--theme-color': themeColor }}
                                        onClick={() => {
                                            if (feat.key === 'wormhole' && !on) playWormholeSound();
                                            else playClickSound();
                                            onToggle(feat.key);
                                        }}
                                        onMouseEnter={() => playHoverSound()}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        whileHover={{ x: -3 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <span className={`fp-icon ${on ? 'on' : ''}`} style={on ? { color: themeColor } : {}}>
                                            {feat.icon}
                                        </span>
                                        <div className="fp-text">
                                            <span className="fp-label">{feat.label}</span>
                                            <span className="fp-desc">{feat.desc}</span>
                                        </div>
                                        <div className={`fp-toggle ${on ? 'on' : ''}`} style={on ? { background: themeColor } : {}}>
                                            <div className="fp-toggle-knob" />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="fp-footer">
                            All features use mock/procedural data.<br />
                            Gemini key enables real AI lore. ↑
                        </div>
        </motion.div>
    );
}
