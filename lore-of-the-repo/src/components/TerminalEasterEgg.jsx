/**
 * TerminalEasterEgg.jsx
 * Hidden terminal icon → CLI overlay → sudo/hack triggers Matrix wireframe mode.
 * Matrix mode: green wireframe + digital rain particles.
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// ── Matrix Digital Rain (inside Canvas) ──────────────────────
export function MatrixRain({ active }) {
    const pointsRef = useRef();
    const count = 800;

    const { positions, velocities, chars } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = [];
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 70;
            pos[i * 3 + 1] = (Math.random() - 0.3) * 50;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 70;
            vel.push({ speed: 0.04 + Math.random() * 0.12 });
        }
        return { positions: pos, velocities: vel, chars: [] };
    }, []);

    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    useFrame(() => {
        if (!pointsRef.current || !active) return;
        const attr = pointsRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            attr.array[i * 3 + 1] -= velocities[i].speed;
            if (attr.array[i * 3 + 1] < -25) {
                attr.array[i * 3] = (Math.random() - 0.5) * 70;
                attr.array[i * 3 + 1] = 25 + Math.random() * 10;
                attr.array[i * 3 + 2] = (Math.random() - 0.5) * 70;
            }
        }
        attr.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial
                color="#00ff41"
                size={0.22}
                transparent
                opacity={0.85}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

// ── Glitch overlay flash ───────────────────────────────────────
function GlitchFlash({ active }) {
    if (!active) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,255,65,0.08)',
            pointerEvents: 'none',
            animation: 'glitch-flash 0.4s steps(2, end)',
        }} />
    );
}

// ── Terminal history entry ─────────────────────────────────────
function makeResponse(cmd) {
    const c = cmd.trim().toLowerCase();
    if (c === 'help') return [
        '  Available commands:',
        '  ls          — list city districts',
        '  ls -la      — reveal hidden files',
        '  sudo su     — *** ACTIVATE MATRIX MODE ***',
        '  adb shell   — *** ACTIVATE MATRIX MODE ***',
        '  hack        — attempt infiltration',
        '  whoami      — display identity',
        '  clear       — clear terminal',
    ];
    if (c === 'whoami') return ['  root@lord-of-repo ~ #'];
    if (c === 'ls') return [
        '  src/  node_modules/  .env  package.json  .gitignore',
    ];
    if (c === 'ls -la') return [
        '  drwxr-xr-x  src/',
        '  drwxr-xr-x  node_modules/ (1,847 packages)',
        '  -rw-------  .env           ← SENSITIVE',
        '  -rw-r--r--  .env.example',
        '  -rw-r--r--  package.json',
        '  -rw-------  secrets.json   ← HIDDEN',
        '  drwx------  .ssh/',
        '  ⚠ WARNING: Hidden nodes revealed. Handle with care.',
    ];
    if (c === 'hack') return [
        '  Initiating infiltration sequence...',
        '  [■■■■■■■■□□□□□□□□] 50%',
        '  ERROR: Firewall detected anomalous activity.',
        '  TIP: Try sudo su for elevated access.',
    ];
    if (c === 'clear') return ['__CLEAR__'];
    if (c === 'sudo su' || c === 'sudo su -' || c === 'adb shell' || c === 'matrix') {
        return ['__MATRIX__'];  // triggers matrix mode
    }
    if (c === 'exit' || c === 'quit') return ['  Session terminated. Goodbye, root.', '__EXIT__'];
    if (c === '') return [];
    return [`  bash: command not found: ${cmd}`, `  (type 'help' for available commands)`];
}

// ── Terminal component ────────────────────────────────────────
export function Terminal({ onMatrix, onClose, themeColor }) {
    const [history, setHistory] = useState([
        { type: 'system', text: 'LORD-OF-REPO OS v2.4.1 — root shell' },
        { type: 'system', text: 'Type \'help\' for available commands.' },
        { type: 'system', text: '─'.repeat(44) },
    ]);
    const [input, setInput] = useState('');
    const [glitch, setGlitch] = useState(false);
    const inputRef = useRef();
    const scrollRef = useRef();

    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 99999);
    }, [history]);

    const submit = useCallback(() => {
        if (!input.trim() && input !== '') return;
        const cmd = input;
        setInput('');
        const response = makeResponse(cmd);

        if (response.includes('__CLEAR__')) {
            setHistory([{ type: 'system', text: '' }]);
            return;
        }
        if (response.includes('__EXIT__')) {
            setHistory(h => [...h, { type: 'cmd', text: `$ ${cmd}` }, { type: 'out', text: '  Session terminated.' }]);
            setTimeout(onClose, 1200);
            return;
        }
        if (response.includes('__MATRIX__')) {
            setGlitch(true);
            setHistory(h => [
                ...h,
                { type: 'cmd', text: `$ ${cmd}` },
                { type: 'system', text: '  ██████████████████████████████████████' },
                { type: 'system', text: '  ENTERING MATRIX MODE... ALL FACADES REMOVED' },
                { type: 'system', text: '  ██████████████████████████████████████' },
            ]);
            setTimeout(() => {
                setGlitch(false);
                onMatrix?.();
            }, 600);
            return;
        }

        setHistory(h => [
            ...h,
            { type: 'cmd', text: `$ ${cmd}` },
            ...response.map(text => ({ type: 'out', text })),
        ]);
    }, [input, onClose, onMatrix]);

    return (
        <>
            {glitch && <GlitchFlash active />}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.96 }}
                style={{
                    position: 'fixed', bottom: '80px', left: '20px',
                    width: '520px', height: '320px',
                    background: 'rgba(0,6,0,0.97)',
                    border: '1px solid #00ff4144',
                    borderRadius: '10px',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '11px', zIndex: 500,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 0 40px rgba(0,255,65,0.15)',
                    overflow: 'hidden',
                }}
            >
                {/* Title bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderBottom: '1px solid #00ff4122',
                    background: '#001400',
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
                    <span style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: '#00ff4188', letterSpacing: '.1em' }}>
                        root@lord-of-repo — bash
                    </span>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: '#00ff4166',
                        cursor: 'pointer', fontSize: '13px', lineHeight: 1,
                    }}>✕</button>
                </div>

                {/* Output */}
                <div ref={scrollRef} style={{
                    flex: 1, overflowY: 'auto', padding: '10px 14px',
                    scrollbarWidth: 'thin', scrollbarColor: '#00ff4133 transparent',
                }}>
                    {history.map((line, i) => (
                        <div key={i} style={{
                            color: line.type === 'cmd' ? '#00ff41' : line.type === 'system' ? '#00cc33' : '#88cc88',
                            lineHeight: 1.65, whiteSpace: 'pre',
                        }}>
                            {line.text}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderTop: '1px solid #00ff4122',
                    background: '#000a00',
                }}>
                    <span style={{ color: '#00ff41', fontSize: '11px' }}>$</span>
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                        style={{
                            flex: 1, background: 'transparent', border: 'none', outline: 'none',
                            color: '#00ff41', fontFamily: 'Space Mono, monospace', fontSize: '11px',
                            caretColor: '#00ff41',
                        }}
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>
            </motion.div>
        </>
    );
}

// ── Hidden terminal trigger button ────────────────────────────
export function TerminalTrigger({ onClick }) {
    const [hint, setHint] = useState(false);

    return (
        <motion.button
            onClick={onClick}
            onMouseEnter={() => setHint(true)}
            onMouseLeave={() => setHint(false)}
            style={{
                position: 'fixed', bottom: '22px', left: '22px',
                width: '28px', height: '28px',
                background: 'rgba(0,10,0,0.7)',
                border: '1px solid rgba(0,255,65,0.15)',
                borderRadius: '6px', cursor: 'pointer', zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(0,255,65,0.35)', fontSize: '13px',
                transition: 'all 0.2s',
            }}
            whileHover={{
                scale: 1.1, color: 'rgba(0,255,65,0.9)',
                boxShadow: '0 0 12px rgba(0,255,65,0.2)'
            }}
            title=""
        >
            <span style={{ fontFamily: 'monospace', letterSpacing: '-0.1em' }}>_</span>
            <AnimatePresence>
                {hint && (
                    <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'absolute', left: '36px', bottom: '0',
                            background: 'rgba(0,6,0,0.95)', border: '1px solid #00ff4133',
                            borderRadius: '5px', padding: '3px 8px', whiteSpace: 'nowrap',
                            fontFamily: 'Space Mono, monospace', fontSize: '9px',
                            color: '#00ff4166', pointerEvents: 'none',
                        }}
                    >
                        root access
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

// ── Matrix Mode overlay scene elements ────────────────────────
export function MatrixSceneOverlay({ active }) {
    if (!active) return null;
    return (
        <>
            <color attach="background" args={['#000500']} />
            <fog attach="fog" args={['#000500', 20, 80]} />
            <ambientLight intensity={0.15} color="#00ff41" />
            <directionalLight position={[0, 20, 0]} intensity={0.5} color="#00ff41" />
        </>
    );
}
