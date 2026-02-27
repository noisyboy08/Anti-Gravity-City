/**
 * App.jsx — v4
 * Orchestrates all 14 advanced systems.
 */

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scene } from './components/Scene';
import { SearchBar } from './components/UI/SearchBar';
import { Sidebar } from './components/UI/Sidebar';
import { CinematicControls, LoadingOverlay, ErrorOverlay, LandingScreen } from './components/UI/CinematicMode';
import { CommitTimeline } from './components/CommitTimeline';
import { FeaturePanel } from './components/UI/FeaturePanel';
import { VRButton } from './components/VRMode';
import { TerminalTrigger, Terminal } from './components/TerminalEasterEgg';
import { DeployCountdown } from './components/ContainerTransport';
import { useRecruiterMode } from './components/RecruiterMode';
import { useGitHubData } from './hooks/useGitHubData';
import { calcCarbonScore, getCarbonVisuals } from './utils/carbonFootprint';
import { ActionButtonGroup, ARBusinessCardModal } from './components/FeatureExpansions';
import { RepoChatModal } from './components/RepoChatModal';
import { CodeInspector } from './components/UI/CodeInspector';
import { SaaSLogin } from './components/SaaSLogin';

const DEFAULT_FEATURES = {
  security: false,
  traffic: false,
  weather: false,
  music: false,
  ghosts: false,
  decay: false,
  battle: false,
  neural: false,
  vr: false,
  carbon: false,
  glitch: false,
  nebula: false,
  phantom: false,
  helix: false,
  graph: false,
  linter: false,
  fps: false,
  economy: false,
  wormhole: false,
  burndown: false,
  boss: false,
  instanced: false,
  heatmap: false,
  deploy: true,   // Container Transport on by default
};

export default function App() {
  const {
    loading, error, cityData, narrative, repoInfo,
    fetchRepo, loadDemo, geminiApiKey, saveApiKey,
  } = useGitHubData();

  // Core state
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [droneActive, setDroneActive] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineProgress, setTimelineProgress] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dismissedError, setDismissedError] = useState(false);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  // New feature state
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [featureLabActive, setFeatureLabActive] = useState(false);
  // Deploy phase (for HUD — managed inside ContainerTransport but mirrored here)
  const [deployPhase, setDeployPhase] = useState(0);
  const [deployCount, setDeployCount] = useState(0);

  // Expansion features state
  const [arOpen, setArOpen] = useState(false);
  const [exportSTLTrig, setExportSTLTrig] = useState(0);
  const [docTrig, setDocTrig] = useState(0);
  const [galaxyMode, setGalaxyMode] = useState(false);
  const [isLoggedIntoSaaS, setIsLoggedIntoSaaS] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Recruiter mode from URL
  const recruiterMode = useRecruiterMode();

  const themeColor = matrixMode ? '#00ff41' : (narrative?.colors?.primaryColor || '#00f5ff');
  const hasCity = !!(cityData && narrative);

  const carbonScore = useMemo(() => calcCarbonScore(repoInfo), [repoInfo]);
  const carbonVisuals = useMemo(() => features.carbon ? getCarbonVisuals(carbonScore) : null, [features.carbon, carbonScore]);

  // Determine global visual themes based on carbon mode
  const carbonActive = features.carbon;

  const handleToggleFeature = useCallback((key) => {
    setFeatures(prev => {
      const willTurnOn = !prev[key];
      if (willTurnOn) {
         const activeCount = Object.keys(prev).filter(k => k !== 'deploy' && prev[k]).length;
         if (activeCount >= 5) {
             console.warn('⚠️ SYSTEM OVERLOAD WARNING: Running many systems simultaneously may drop FPS.');
         }
      }
      return { ...prev, [key]: !prev[key] };
    });
  }, []);

  const handleSearch = useCallback((url) => {
    setSelectedIsland(null);
    setDismissedError(false);
    setDroneActive(false);
    setShowTimeline(false);
    setTimelineProgress(100);
    setMatrixMode(false);
    fetchRepo(url);
  }, [fetchRepo]);

  const handleDemo = useCallback(() => {
    setSelectedIsland(null);
    setDismissedError(false);
    setDroneActive(false);
    setShowTimeline(false);
    setTimelineProgress(100);
    setMatrixMode(false);
    loadDemo();
  }, [loadDemo]);

  const handleSelectIsland = useCallback((island) => {
    setSelectedIsland(prev => prev?.id === island.id ? null : island);
  }, []);

  const handleToggleDrone = useCallback(() => {
    setDroneActive(prev => {
      if (!prev) setSidebarOpen(false);
      else setSidebarOpen(true);
      return !prev;
    });
  }, []);

  const handleDroneComplete = useCallback(() => {
    setDroneActive(false);
    setSidebarOpen(true);
  }, []);

  const handleMatrix = useCallback(() => {
    setMatrixMode(true);
    setTerminalOpen(false);
    setSidebarOpen(false);
  }, []);

  const handleExitMatrix = useCallback(() => {
    setMatrixMode(false);
    setSidebarOpen(true);
  }, []);

  const handleVoiceCommand = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) throw new Error("Not supported");
      const recognition = new SpeechRecognition();
      recognition.onstart = () => console.log('🎤 Listening...');
      recognition.onresult = (event) => {
        const cmd = event.results[0][0].transcript.toLowerCase();
        alert('Voice Command Received:\n"' + cmd + '"\n\n(Commander parsing executed.)');
      };
      recognition.start();
    } catch (e) {
      alert("⚠️ Web Speech API not supported in this browser.");
    }
  }, []);

  const handleAction = useCallback((id) => {
    if (id === 'ar') setArOpen(true);
    if (id === 'stl') setExportSTLTrig(c => c + 1);
    if (id === 'video') setDocTrig(c => c + 1);
    if (id === 'galaxy') setGalaxyMode(p => !p);
    if (id === 'voice') handleVoiceCommand();
    if (id === 'chat') setChatOpen(true);
  }, [handleVoiceCommand]);

  const showError = error && !dismissedError;

  if (!isLoggedIntoSaaS && !recruiterMode) {
     return <SaaSLogin onLogin={setIsLoggedIntoSaaS} />;
  }

  return (
    <div className={`app ${droneActive ? 'drone-active' : ''} ${matrixMode ? 'matrix-active' : ''}`}>

      {/* ── 3D Canvas ─────────────────────────────────────── */}
      <div className="scene-container">
        {hasCity ? (
          <Scene
            cityData={cityData}
            narrative={narrative}
            onSelectIsland={handleSelectIsland}
            selectedIsland={selectedIsland}
            droneActive={droneActive}
            onDroneComplete={handleDroneComplete}
            timelineProgress={timelineProgress}
            features={features}
            carbonVisuals={carbonVisuals}
            recruiterMode={recruiterMode}
            matrixMode={matrixMode}
            onboardingActive={onboardingActive}
            onOnboardingClose={() => setOnboardingActive(false)}
            docTrig={docTrig}
            exportSTLTrig={exportSTLTrig}
            galaxyMode={galaxyMode}
          />
        ) : (
          <div className="empty-scene" />
        )}
      </div>

      {/* ── Matrix Mode Exit Bar ───────────────────────────── */}
      <AnimatePresence>
        {matrixMode && (
          <motion.div
            className="matrix-hud-bar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <span className="matrix-text">◉ ROOT ACCESS · MATRIX MODE ACTIVE</span>
            <button className="matrix-exit-btn" onClick={handleExitMatrix}>
              [exit --safe]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main UI ────────────────────────────────────────── */}
      <AnimatePresence>
        {!droneActive && !matrixMode && (
          <motion.div
            className="ui-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <header className="header-bar">
              <SearchBar
                onSearch={handleSearch}
                onDemo={handleDemo}
                loading={loading}
                themeColor={themeColor}
                geminiApiKey={geminiApiKey}
                onSaveApiKey={saveApiKey}
                hasCity={hasCity}
                onTour={() => setOnboardingActive(!onboardingActive)}
                tourActive={onboardingActive}
                onFeatureLab={() => setFeatureLabActive(!featureLabActive)}
                featureLabActive={featureLabActive}
              />
            </header>

            {/* Code Inspector Panel */}
            <CodeInspector />


            {/* Sidebar */}
            {hasCity && (
              <>
                <motion.button
                  className="sidebar-toggle"
                  onClick={() => setSidebarOpen(p => !p)}
                  style={{ color: themeColor, borderColor: `${themeColor}44` }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                >
                  {sidebarOpen ? '◀' : '▶'}
                </motion.button>
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      className="sidebar-wrapper open"
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 60, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      <Sidebar
                        narrative={narrative}
                        repoInfo={repoInfo}
                        selectedIsland={selectedIsland}
                        themeColor={themeColor}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            {/* Feature Panel */}
            {hasCity && featureLabActive && (
              <div className="feature-panel-container">
                <FeaturePanel
                  features={features}
                  onToggle={handleToggleFeature}
                  themeColor={themeColor}
                  carbonVisuals={carbonVisuals}
                />
              </div>
            )}

            {/* Recruiter Mode badge */}
            {recruiterMode && (
              <motion.div
                className="recruiter-badge"
                style={{ borderColor: `${themeColor}55`, color: themeColor }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                💼 RECRUITER MODE ACTIVE — Holographic Portfolio Enabled
              </motion.div>
            )}

            {!hasCity && !loading && <LandingScreen themeColor={themeColor} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Drone HUD ──────────────────────────────────────── */}
      <AnimatePresence>
        {droneActive && (
          <motion.div className="drone-hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="drone-topbar" style={{ borderBottomColor: `${themeColor}30` }}>
              <div className="drone-title" style={{ color: themeColor }}>
                ⬡ {repoInfo?.name?.toUpperCase()} — {narrative?.themeName}
              </div>
              <div className="drone-lore">{narrative?.lore?.slice(0, 110)}…</div>
            </div>
            <div className="drone-corner tl" style={{ borderColor: themeColor }} />
            <div className="drone-corner tr" style={{ borderColor: themeColor }} />
            <div className="drone-corner bl" style={{ borderColor: themeColor }} />
            <div className="drone-corner br" style={{ borderColor: themeColor }} />
            <div className="drone-scan-line" style={{ background: `${themeColor}22` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Controls ──────────────────────────────── */}
      {hasCity && !matrixMode && (
        <div className="floating-controls">
          <CinematicControls
            droneActive={droneActive}
            onToggleDrone={handleToggleDrone}
            showTimeline={showTimeline}
            onToggleTimeline={() => { setShowTimeline(p => !p); if (!showTimeline) setTimelineProgress(100); }}
            themeColor={themeColor}
            repoName={repoInfo?.name}
          />
          <VRButton
            themeColor={themeColor}
            islands={cityData?.islands}
            vrActive={features.vr}
            onToggle={() => handleToggleFeature('vr')}
          />
        </div>
      )}

      {/* ── Ghost of Commits Timeline ──────────────────────── */}
      <AnimatePresence>
        {hasCity && showTimeline && (
          <motion.div
            className="timeline-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <CommitTimeline
              value={timelineProgress}
              onChange={setTimelineProgress}
              repoInfo={repoInfo}
              themeColor={themeColor}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Carbon Status Bar ──────────────────────────────── */}
      <AnimatePresence>
        {hasCity && features.carbon && carbonVisuals && (
          <motion.div
            className="carbon-status-bar"
            style={{ borderColor: `${carbonVisuals.labelColor}44`, background: `${carbonVisuals.labelColor}0a` }}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
          >
            <span style={{ color: carbonVisuals.labelColor }}>{carbonVisuals.label}</span>
            <span>|</span>
            <span>{carbonVisuals.description}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ color: carbonVisuals.labelColor }}>{repoInfo?.language}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Deploy HUD ─────────────────────────────────────── */}
      {hasCity && features.deploy && (
        <DeployCountdown deployCount={deployCount} phase={deployPhase} />
      )}

      {/* ── Terminal Easter Egg ─────────────────────────────── */}
      <TerminalTrigger onClick={() => setTerminalOpen(p => !p)} />
      <AnimatePresence>
        {terminalOpen && (
          <Terminal
            onMatrix={handleMatrix}
            onClose={() => setTerminalOpen(false)}
            themeColor={themeColor}
          />
        )}
      </AnimatePresence>

      {/* ── Loading / Error ─────────────────────────────────── */}
      <AnimatePresence>{loading && <LoadingOverlay themeColor={themeColor} />}</AnimatePresence>
      <AnimatePresence>
        {showError && <ErrorOverlay error={error} onDismiss={() => setDismissedError(true)} />}
      </AnimatePresence>

      {/* ── Ext Actions & Modals ────────────────────────────── */}
      {hasCity && <ActionButtonGroup onAction={handleAction} />}
      <AnimatePresence>
        {arOpen && <ARBusinessCardModal onClose={() => setArOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {chatOpen && <RepoChatModal onClose={() => setChatOpen(false)} geminiApiKey={geminiApiKey} repoInfo={repoInfo} />}
      </AnimatePresence>
    </div>
  );
}
