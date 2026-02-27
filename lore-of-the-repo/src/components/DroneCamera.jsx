/**
 * DroneCamera.jsx
 * GSAP-powered cinematic drone camera controller.
 * Smooth circular orbit with altitude variation for social-media-worthy flyby.
 */

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import gsap from 'gsap';

export function DroneCamera({ active, onComplete }) {
    const { camera } = useThree();
    const tlRef = useRef(null);
    const orbitRef = useRef({
        angle: 0,
        radius: 30,
        altitude: 10,
        lookTarget: { x: 0, y: 0, z: 0 },
    });
    const activeRef = useRef(active);
    activeRef.current = active;

    useEffect(() => {
        if (active) {
            // Kill any existing timeline
            tlRef.current?.kill();

            // Snapshot current camera state
            const startPos = {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z,
            };

            // Calculate starting angle from current camera position
            orbitRef.current.angle = Math.atan2(startPos.z, startPos.x);
            orbitRef.current.radius = Math.sqrt(startPos.x ** 2 + startPos.z ** 2) || 30;

            // Phase 1: Pull back to orbit radius
            tlRef.current = gsap.timeline({ onComplete: () => onComplete?.() });

            tlRef.current
                .to(orbitRef.current, {
                    radius: 34,
                    altitude: 14,
                    duration: 1.8,
                    ease: 'power2.inOut',
                })
                // Phase 2: Full dramatic orbit (360° + )
                .to(orbitRef.current, {
                    angle: orbitRef.current.angle + Math.PI * 2.5,
                    duration: 14,
                    ease: 'sine.inOut',
                }, '<0.5')
                // Phase 3: Swoop down dramatically
                .to(orbitRef.current, {
                    altitude: 4,
                    radius: 22,
                    duration: 5,
                    ease: 'power3.inOut',
                }, '-=6')
                // Phase 4: Rise back up
                .to(orbitRef.current, {
                    altitude: 12,
                    radius: 30,
                    duration: 4,
                    ease: 'power2.out',
                }, '-=2');

        } else {
            tlRef.current?.kill();
        }

        return () => tlRef.current?.kill();
    }, [active]);

    useFrame(() => {
        if (!activeRef.current) return;

        const { angle, radius, altitude } = orbitRef.current;
        camera.position.x = Math.cos(angle) * radius;
        camera.position.z = Math.sin(angle) * radius;
        camera.position.y = altitude;
        camera.lookAt(0, orbitRef.current.lookTarget.y, 0);
    });

    return null;
}

/**
 * Simple auto-rotate when NOT in drone mode (passive orbit)
 */
export function PassiveRotation({ active, speed = 0.15 }) {
    const { camera } = useThree();
    const angleRef = useRef(Math.atan2(camera.position.z, camera.position.x));
    const radiusRef = useRef(Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2) || 30);

    useFrame((state) => {
        if (active) return; // Don't interfere with drone mode
        // Passive slow drift handled by OrbitControls autoRotate
    });

    return null;
}
