/**
 * SearchBar.jsx — v2
 * Glassmorphism search UI with framer-motion animations and lucide-react icons.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap, Key, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const DEMO_REPOS = [
    'github.com/facebook/react',
    'github.com/vercel/next.js',
    'github.com/microsoft/vscode',
    'github.com/tensorflow/tensorflow',
    'github.com/vuejs/core',
];

export function SearchBar({ onSearch, onDemo, loading, themeColor = '#00f5ff', geminiApiKey, onSaveApiKey, hasCity, onTour, tourActive, onFeatureLab, featureLabActive }) {
    const [value, setValue] = useState('');
    const [focused, setFocused] = useState(false);
    const [placeholder] = useState(() => DEMO_REPOS[Math.floor(Math.random() * DEMO_REPOS.length)]);
    const [showApiKey, setShowApiKey] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey || '');
    const [apiKeyVisible, setApiKeyVisible] = useState(false);
    const [apiKeySaved, setApiKeySaved] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (value.trim()) onSearch(value.trim());
    };

    const handleSaveKey = () => {
        onSaveApiKey(apiKeyInput.trim());
        setApiKeySaved(true);
        setTimeout(() => setApiKeySaved(false), 2000);
    };

    return (
        <div className="search-container">
            {/* Logo */}
            <motion.div
                className="search-header"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="logo-mark">
                    <motion.span
                        className="logo-hex"
                        animate={{ filter: [`drop-shadow(0 0 8px ${themeColor})`, `drop-shadow(0 0 22px ${themeColor})`, `drop-shadow(0 0 8px ${themeColor})`] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        ⬡
                    </motion.span>
                    <div className="logo-text">
                        <span className="logo-title">LORD OF REPO</span>
                        <span className="logo-subtitle">3D ANTI-GRAVITY CITY VISUALIZER</span>
                    </div>
                </div>
            </motion.div>

            {/* Search form */}
            <motion.form
                onSubmit={handleSubmit}
                className="search-form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <motion.div
                    className={`search-input-wrap ${focused ? 'focused' : ''}`}
                    style={{ '--theme-color': themeColor }}
                    animate={{ boxShadow: focused ? `0 0 0 1px ${themeColor}, 0 0 28px ${themeColor}44` : '0 0 0 0px transparent' }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="search-icon"><Search size={16} strokeWidth={2} /></span>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder={`Try: ${placeholder}`}
                        className="search-input"
                        disabled={loading}
                        spellCheck={false}
                        autoCorrect="off"
                    />
                    <AnimatePresence>
                        {value && (
                            <motion.button
                                type="button"
                                className="clear-btn"
                                onClick={() => setValue('')}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.1 }}
                            >
                                <X size={13} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                    <motion.button
                        type="submit"
                        className="search-btn"
                        disabled={loading || !value.trim()}
                        style={{ borderColor: themeColor, color: themeColor }}
                        whileHover={{ scale: 1.04, backgroundColor: themeColor, color: '#000' }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                    >
                        {loading ? <LoadingDots /> : 'VISUALIZE'}
                    </motion.button>
                </motion.div>
            </motion.form>

            {/* Actions row */}
            <motion.div
                className="search-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
            >
                {hasCity && (
                   <motion.button
                       className={`feature-btn ${featureLabActive ? 'active' : ''}`}
                       onClick={onFeatureLab}
                       type="button"
                       style={{ '--theme-color': themeColor }}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.96 }}
                   >
                       🧬 {featureLabActive ? 'CLOSE LAB' : 'FEATURE LAB'}
                   </motion.button>
                )}
                
                {hasCity && (
                   <motion.button
                       className={`tour-btn ${tourActive ? 'active' : ''}`}
                       onClick={onTour}
                       type="button"
                       style={{ '--theme-color': themeColor }}
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.96 }}
                   >
                       🤖 {tourActive ? 'END TOUR' : 'TOUR CODEBASE'}
                   </motion.button>
                )}

                <motion.button
                    className="demo-btn"
                    onClick={onDemo}
                    disabled={loading}
                    type="button"
                    style={{ '--theme-color': themeColor }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <Zap size={12} />
                    Load Demo City
                </motion.button>

                <motion.button
                    className="api-key-toggle"
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{ color: geminiApiKey ? '#00ff88' : 'rgba(255,255,255,0.35)' }}
                    whileHover={{ color: themeColor }}
                >
                    <Key size={11} />
                    <span>{geminiApiKey ? 'Gemini AI ✓' : 'Add Gemini Key'}</span>
                    {showApiKey ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </motion.button>
            </motion.div>

            {/* Gemini API Key Input Popup (Centered) */}
            <AnimatePresence>
                {showApiKey && (
                    <motion.div
                        className="api-key-panel absolute-center-popup"
                        style={{ '--theme-color': themeColor }}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="api-key-label" style={{ color: '#a78bfa' }}>
                            <Key size={14} /> Nexus AI Authentication Key
                        </div>
                        <div className="api-key-input-row">
                            <input
                                type={apiKeyVisible ? 'text' : 'password'}
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder="AIza..."
                                className="api-key-input"
                                spellCheck={false}
                            />
                            <button className="api-key-eye" onClick={() => setApiKeyVisible(!apiKeyVisible)}>
                                {apiKeyVisible ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <motion.button
                                className="api-key-save"
                                onClick={handleSaveKey}
                                style={{ background: apiKeySaved ? '#a78bfa22' : '#a78bfa', borderColor: apiKeySaved ? '#a78bfa' : '#a78bfa', color: apiKeySaved ? '#a78bfa' : '#000' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {apiKeySaved ? '✓ Verified' : 'Authenticate'}
                            </motion.button>
                        </div>
                        <div className="api-key-hint">
                            Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: '#a78bfa' }}>aistudio.google.com</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LoadingDots() {
    return (
        <span className="loading-dots">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
        </span>
    );
}
