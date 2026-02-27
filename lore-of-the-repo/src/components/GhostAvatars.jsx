/**
 * GhostAvatars.jsx
 * Multi-user ghost collaboration system.
 * Simulates Socket.io with smooth-interpolated glowing orb avatars.
 * Mock WebSocket broadcasts fake "other users" camera positions.
 */

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { io } from 'socket.io-client';

// Remote Ghost Orb Component
function GhostOrb({ user }) {
    const groupRef = useRef();
    const ringRef = useRef();
    const targetPos = useRef(new THREE.Vector3().fromArray(user.position || [0, 10, 0]));
    const currentPos = useRef(new THREE.Vector3().fromArray(user.position || [0, 10, 0]));
    const [showLabel, setShowLabel] = useState(false);
    const audioContextRef = useRef(null);
    const pannerRef = useRef(null);
    const oscRef = useRef(null);

    // Derived random color based on ID hash
    const color = `#${Math.floor(Math.abs(Math.sin(user.id.charCodeAt(0)) * 16777215)).toString(16).padEnd(6, '0')}`;

    // Setup authentic WebRTC / Spatial Audio mock
    useEffect(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContextRef.current = new AudioContext();
            const ctx = audioContextRef.current;

            // Spatial Panner
            pannerRef.current = ctx.createPanner();
            pannerRef.current.panningModel = 'HRTF';
            pannerRef.current.distanceModel = 'inverse';
            pannerRef.current.refDistance = 1;
            pannerRef.current.maxDistance = 50;
            pannerRef.current.rolloffFactor = 3;

            // Fake WebRTC Voice Activity (Modulated Osc)
            oscRef.current = ctx.createOscillator();
            oscRef.current.type = 'triangle';
            oscRef.current.frequency.value = 120 + (Math.random() * 80);

            const lfo = ctx.createOscillator();
            lfo.frequency.value = 4 + Math.random() * 4;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 40;
            lfo.connect(lfoGain);
            lfoGain.connect(oscRef.current.frequency);

            const env = ctx.createGain();
            env.gain.value = 0.05; // Master volume is low so it's not annoying
            
            oscRef.current.connect(env);
            env.connect(pannerRef.current);
            pannerRef.current.connect(ctx.destination);

            oscRef.current.start();
            lfo.start();
        } catch(e) { /* ignore */ }

        return () => {
            if (oscRef.current) oscRef.current.stop();
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        targetPos.current.fromArray(user.position);
        currentPos.current.lerp(targetPos.current, 0.1);

        if (groupRef.current) {
            groupRef.current.position.copy(currentPos.current);
            groupRef.current.position.y += Math.sin(t * 2) * 0.5; // Hover bounce
        }
        if (ringRef.current) {
            ringRef.current.rotation.y += 0.05;
            ringRef.current.rotation.x = Math.sin(t) * 0.2;
        }
        if (pannerRef.current && audioContextRef.current) {
            // Update spatial audio position
            const p = currentPos.current;
            const ctxNow = audioContextRef.current;
            pannerRef.current.positionX.setTargetAtTime(p.x, ctxNow.currentTime, 0.1);
            pannerRef.current.positionY.setTargetAtTime(p.y, ctxNow.currentTime, 0.1);
            pannerRef.current.positionZ.setTargetAtTime(p.z, ctxNow.currentTime, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            <mesh onPointerOver={() => setShowLabel(true)} onPointerOut={() => setShowLabel(false)}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.6} />
            </mesh>
            <mesh>
                <sphereGeometry args={[0.55, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.15} side={THREE.BackSide} />
            </mesh>
            <group ref={ringRef}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.7, 0.025, 8, 48]} />
                    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
                </mesh>
            </group>

            {/* Holographic Laser Pointer to Island */}
            {user.action === 'inspecting' && user.islandId && (
                <mesh position={[0, -10, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 20]} />
                    <meshBasicMaterial color={color} transparent opacity={0.6} />
                </mesh>
            )}

            <pointLight color={color} intensity={1.5} distance={10} />
            <Html position={[0, 1.2, 0]} center distanceFactor={15} style={{ pointerEvents: 'none' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: color, background: 'rgba(0,0,0,0.8)', border: `1px solid ${color}66`, borderRadius: '4px', padding: '3px 8px', opacity: showLabel || user.action === 'inspecting' ? 1 : 0.4 }}>
                    {user.id.substring(0, 6)} {user.action === 'inspecting' ? '🔍 Inspecting' : '✨'}
                </div>
            </Html>
        </group>
    );
}

export function GhostAvatars({ active }) {
    const [users, setUsers] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!active) {
            if (socketRef.current) socketRef.current.disconnect();
            return;
        }

        // Connect to local multiplayer backend
        socketRef.current = io('http://localhost:4000');

        socketRef.current.on('usersUpdated', (newUsers) => {
            // Filter out self
            setUsers(newUsers.filter(u => u.id !== socketRef.current.id));
        });

        const handlePointerMove = (e) => {
            if (socketRef.current && socketRef.current.connected) {
                // Map mouse to a reasonable 3D orbital position around center based on mouse coords
                const x = (e.clientX / window.innerWidth) * 2 - 1;
                const y = -(e.clientY / window.innerHeight) * 2 + 1;
                socketRef.current.emit('mousemove', [x * 20, 10 + y * 5, y * 20]);
            }
        };

        const handleClick = (e) => {
            // Mock detecting which island was clicked (if CustomEvent payload has islandId)
            if (socketRef.current && e.detail?.islandId) {
                socketRef.current.emit('clickIsland', e.detail.islandId);
            }
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('ISLAND_CLICKED', handleClick);

        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('ISLAND_CLICKED', handleClick);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [active]);

    // Render mock/bot ghosts dynamically if offline just so it looks cool
    if (!active) return null;

    return (
        <group>
            {users.map(u => <GhostOrb key={u.id} user={u} />)}

            {/* Fallback mock ghost if server is offline or empty */}
            {users.length === 0 && (
                <GhostOrb user={{ id: 'bot-1', position: [15, 8, 10], action: 'idling' }} />
            )}
        </group>
    );
}
