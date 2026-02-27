/**
 * DistrictMusic.jsx — Fixed & Optimized
 * Web Audio API positional synth per island.
 * Fixed: moved Html import to top of file (was mid-file, crashing bundler).
 */

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Synth Profiles ────────────────────────────────────────────
const PROFILES = {
    js: { freq: 220, type: 'sawtooth', lfo: 0.8, gain: 0.07, label: 'Cyber Drone' },
    ts: { freq: 220, type: 'sawtooth', lfo: 0.8, gain: 0.07, label: 'Cyber Drone' },
    jsx: { freq: 261, type: 'sine', lfo: 1.2, gain: 0.08, label: 'UI Synth' },
    tsx: { freq: 261, type: 'sine', lfo: 1.2, gain: 0.08, label: 'UI Synth' },
    py: { freq: 174, type: 'sine', lfo: 0.3, gain: 0.07, label: 'Ambient Pad' },
    rb: { freq: 196, type: 'triangle', lfo: 0.4, gain: 0.06, label: 'Ambient Pad' },
    go: { freq: 185, type: 'triangle', lfo: 0.35, gain: 0.06, label: 'Go Drone' },
    rs: { freq: 110, type: 'square', lfo: 4.0, gain: 0.05, label: 'Heavy Pulse' },
    cpp: { freq: 98, type: 'square', lfo: 3.5, gain: 0.05, label: 'Heavy Pulse' },
    c: { freq: 98, type: 'square', lfo: 3.5, gain: 0.05, label: 'Heavy Pulse' },
    json: { freq: 440, type: 'triangle', lfo: 0.1, gain: 0.04, label: 'Data Pluck' },
    yaml: { freq: 392, type: 'triangle', lfo: 0.1, gain: 0.04, label: 'Config Tone' },
    md: { freq: 523, type: 'sine', lfo: 0.05, gain: 0.03, label: 'Soft Breeze' },
    default: { freq: 330, type: 'sine', lfo: 0.2, gain: 0.05, label: 'Ambient' },
};

function getProfile(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    return PROFILES[ext] || PROFILES.default;
}

// ── Lazy audio context ─────────────────────────────────────────
let _ctx = null;
function getCtx() {
    if (!_ctx) {
        try {
            _ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch { return null; }
    }
    return _ctx;
}

// ── Per-island synth ──────────────────────────────────────────
class IslandSynth {
    constructor(profile, position) {
        this.profile = profile;
        this.started = false;
        try {
            const ctx = getCtx();
            if (!ctx) return;
            this.osc = ctx.createOscillator();
            this.lfo = ctx.createOscillator();
            this.lfoGain = ctx.createGain();
            this.gain = ctx.createGain();
            this.pan = ctx.createPanner();

            this.lfo.frequency.value = profile.lfo;
            this.lfoGain.gain.value = profile.freq * 0.03;
            this.lfo.connect(this.lfoGain);
            this.lfoGain.connect(this.osc.frequency);

            this.osc.type = profile.type;
            this.osc.frequency.value = profile.freq;

            this.pan.panningModel = 'HRTF';
            this.pan.distanceModel = 'inverse';
            this.pan.refDistance = 5;
            this.pan.maxDistance = 30;
            this.pan.rolloffFactor = 1.5;
            if (this.pan.positionX) {
                this.pan.positionX.value = position[0];
                this.pan.positionY.value = position[1];
                this.pan.positionZ.value = position[2];
            } else {
                this.pan.setPosition(position[0], position[1], position[2]);
            }

            this.gain.gain.value = 0;
            this.osc.connect(this.gain);
            this.gain.connect(this.pan);
            this.pan.connect(ctx.destination);
        } catch { /* audio not supported */ }
    }

    start() {
        if (this.started || !this.osc) return;
        try {
            const ctx = getCtx();
            if (!ctx) return;
            ctx.resume();
            this.osc.start(ctx.currentTime);
            this.lfo.start(ctx.currentTime);
            this.gain.gain.setTargetAtTime(this.profile.gain, ctx.currentTime, 0.8);
            this.started = true;
        } catch { }
    }

    setVolume(v) {
        if (!this.started || !this.gain) return;
        try {
            const ctx = getCtx();
            if (!ctx) return;
            this.gain.gain.setTargetAtTime(Math.max(0, v * this.profile.gain), ctx.currentTime, 0.4);
        } catch { }
    }

    stop() {
        try {
            if (this.gain) this.gain.gain.setTargetAtTime(0, getCtx()?.currentTime || 0, 0.3);
            setTimeout(() => {
                try { this.osc?.stop(); this.lfo?.stop(); } catch { }
            }, 800);
        } catch { }
    }
}

// ── Hook ──────────────────────────────────────────────────────
const _tmp = new THREE.Vector3();

export function useDistrictMusic(islands, active) {
    const synthsRef = useRef({});
    const { camera } = useThree();

    useEffect(() => {
        if (!active) {
            Object.values(synthsRef.current).forEach(({ synth }) => synth.stop());
            synthsRef.current = {};
            return;
        }
        if (!islands?.length) return;

        // Limit to 6 islands to avoid audio overload
        islands.slice(0, 6).forEach(island => {
            if (!synthsRef.current[island.id]) {
                const s = new IslandSynth(getProfile(island.name), island.position);
                synthsRef.current[island.id] = { synth: s, island };
                s.start();
            }
        });

        return () => {
            Object.values(synthsRef.current).forEach(({ synth }) => synth.stop());
            synthsRef.current = {};
        };
    }, [active, islands]);

    useFrame(() => {
        if (!active) return;
        _tmp.copy(camera.position);
        Object.values(synthsRef.current).forEach(({ synth, island }) => {
            const dist = _tmp.distanceTo(
                new THREE.Vector3(island.position[0], island.position[1], island.position[2])
            );
            synth.setVolume(Math.max(0, 1 - dist / 28));
        });
    });
}

// ── Visual indicator ──────────────────────────────────────────
export function AudioIndicator({ island, active, themeColor }) {
    if (!active || !island) return null;
    const profile = getProfile(island.name);
    return (
        <Html
            position={[0, -(island.scale || 1) * 1.1, 0]}
            center distanceFactor={22}
            style={{ pointerEvents: 'none' }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(0,0,0,0.6)', border: `1px solid ${themeColor}44`,
                borderRadius: '4px', padding: '2px 6px',
                fontFamily: 'Space Mono, monospace', fontSize: '8px',
                color: themeColor, opacity: 0.75, whiteSpace: 'nowrap',
            }}>
                🎵 {profile.label}
            </div>
        </Html>
    );
}
