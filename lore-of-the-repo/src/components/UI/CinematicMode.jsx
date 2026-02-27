/**
 * CinematicMode.jsx — v2
 * Full control bar: Drone Cam, Timeline Toggle, Screenshot, Share.
 * Powered by framer-motion + lucide-react.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Camera, Share2, Linkedin, Clock, Pause, Play } from 'lucide-react';

export function CinematicControls({
    droneActive, onToggleDrone,
    showTimeline, onToggleTimeline,
    themeColor = '#00f5ff',
    repoName,
}) {
    const [shareToast, setShareToast] = useState('');

    const handleShare = (platform) => {
        const text = `I turned ${repoName || 'a GitHub repo'} into an epic 3D Anti-Gravity City! 🌌⚡ Try it: Lord of Repo #LordOfRepo #ThreeJS #CodeVisualization #DevTools`;
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
        };
        window.open(urls[platform], '_blank', 'width=620,height=420');
        setShareToast(`Opening ${platform === 'twitter' ? '𝕏' : 'LinkedIn'}...`);
        setTimeout(() => setShareToast(''), 2500);
    };

    const handleScreenshot = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        try {
            const link = document.createElement('a');
            link.download = `lord-of-repo-${repoName || 'city'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            setShareToast('📸 Screenshot saved!');
            setTimeout(() => setShareToast(''), 2500);
        } catch {
            setShareToast('⚠️ Enable "preserveDrawingBuffer" for screenshots');
            setTimeout(() => setShareToast(''), 3000);
        }
    };

    return (
        <>
            <motion.div
                className="cinematic-controls"
                style={{ '--theme-color': themeColor }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                {/* Drone Cam button */}
                <motion.button
                    className={`cinema-btn ${droneActive ? 'active' : ''}`}
                    onClick={onToggleDrone}
                    title={droneActive ? 'Exit Drone Mode' : 'Cinematic Drone Cam'}
                    style={droneActive ? { background: themeColor, color: '#000', borderColor: themeColor } : {}}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    {droneActive ? <VideoOff size={14} /> : <Video size={14} />}
                    <span className="cinema-label">{droneActive ? 'EXIT DRONE' : 'DRONE CAM'}</span>
                </motion.button>

                {/* Timeline toggle */}
                <motion.button
                    className={`cinema-btn ${showTimeline ? 'active' : ''}`}
                    onClick={onToggleTimeline}
                    title="Ghost of Commits Timeline"
                    style={showTimeline ? { borderColor: themeColor, color: themeColor } : {}}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                >
                    <Clock size={14} />
                    <span className="cinema-label">TIMELINE</span>
                </motion.button>

                {/* Divider */}
                <div className="ctrl-divider" />

                {/* Screenshot */}
                <motion.button
                    className="share-btn"
                    onClick={handleScreenshot}
                    title="Save Screenshot"
                    whileHover={{ scale: 1.12, backgroundColor: 'rgba(255,255,255,0.12)' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Camera size={15} />
                </motion.button>

                {/* Share X */}
                <motion.button
                    className="share-btn"
                    onClick={() => handleShare('twitter')}
                    title="Share on X"
                    whileHover={{ scale: 1.12, color: '#1d9bf0', borderColor: '#1d9bf0' }}
                    whileTap={{ scale: 0.95 }}
                >
                    𝕏
                </motion.button>

                {/* Share LinkedIn */}
                <motion.button
                    className="share-btn"
                    onClick={() => handleShare('linkedin')}
                    title="Share on LinkedIn"
                    whileHover={{ scale: 1.12, color: '#0a66c2', borderColor: '#0a66c2' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Linkedin size={14} />
                </motion.button>
            </motion.div>

            {/* Toast notification */}
            <AnimatePresence>
                {shareToast && (
                    <motion.div
                        className="share-toast"
                        style={{ background: themeColor }}
                        initial={{ opacity: 0, y: 10, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -10, x: '-50%' }}
                        transition={{ duration: 0.2 }}
                    >
                        {shareToast}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// ─── Loading Overlay ────────────────────────────────────────────
export function LoadingOverlay({ themeColor = '#00f5ff' }) {
    const steps = [
        'Fetching repository metadata...',
        'Parsing directory tree...',
        'Generating city lore...',
        'Constructing floating islands...',
    ];

    return (
        <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="loading-content">
                <motion.div
                    className="loading-spinner"
                    style={{ borderTopColor: themeColor, borderRightColor: `${themeColor}44` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    className="loading-text"
                    style={{ color: themeColor }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    ANALYZING REPOSITORY
                </motion.div>
                <div className="loading-steps">
                    {steps.map((step, i) => (
                        <motion.span
                            key={step}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                        >
                            {step}
                        </motion.span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// ─── Error Overlay ──────────────────────────────────────────────
export function ErrorOverlay({ error, onDismiss }) {
    return (
        <motion.div
            className="error-overlay"
            onClick={onDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="error-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
                <div className="error-icon">⚠️</div>
                <div className="error-title">TRANSMISSION FAILED</div>
                <div className="error-message">{error}</div>
                <motion.button
                    className="error-btn"
                    onClick={onDismiss}
                    whileHover={{ backgroundColor: '#ff4466', color: '#000' }}
                    whileTap={{ scale: 0.97 }}
                >
                    DISMISS
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

// ─── Landing Screen ──────────────────────────────────────────────
export function LandingScreen({ themeColor = '#00f5ff' }) {
    const features = [
        '🌌 4 Cosmic Themes', '⚡ GLSL Energy Beams',
        '🏝️ Altitude Mapping', '📜 AI City Lore (Gemini)',
        '🎬 Drone Cam (GSAP)', '💥 Post-Processing Bloom',
        '🕰️ Ghost of Commits', '🔭 Holographic Scanning',
    ];

    return (
        <div className="landing-screen">
            <div className="landing-content">
                <motion.div
                    className="landing-glyph"
                    style={{ color: themeColor }}
                    animate={{ y: [0, -14, 0], filter: [`drop-shadow(0 0 20px ${themeColor})`, `drop-shadow(0 0 45px ${themeColor})`, `drop-shadow(0 0 20px ${themeColor})`] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    ⬡
                </motion.div>

                <motion.h1
                    className="landing-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                >
                    <span style={{ color: themeColor }}>LORD</span> OF <span style={{ color: themeColor }}>REPO</span>
                </motion.h1>

                <motion.p
                    className="landing-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Transform any GitHub repository into a breathtaking<br />
                    <strong>3D Anti-Gravity Floating City</strong>
                </motion.p>

                <motion.div
                    className="landing-features"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f}
                            className="feature-chip"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.06 }}
                            whileHover={{ scale: 1.07, backgroundColor: `${themeColor}12`, borderColor: `${themeColor}88` }}
                        >
                            {f}
                        </motion.div>
                    ))}
                </motion.div>

                <motion.p
                    className="landing-cta"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                >
                    Enter a GitHub URL above to begin ↑
                </motion.p>
            </div>
        </div>
    );
}
