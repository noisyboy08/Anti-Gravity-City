/**
 * SecurityShield.jsx
 * Custom GLSL ShaderMaterial: red pulsating cracked hexagonal energy shield.
 * Wraps islands that have mock vulnerability hits.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Hex Shield GLSL ───────────────────────────────────────────
const shieldVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shieldFragmentShader = `
  uniform float uTime;
  uniform float uSeverity;   // 0.0 = low, 1.0 = critical
  varying vec3 vPosition;
  varying vec3 vNormal;

  // Hex grid SDF
  float hexDist(vec2 p) {
    p = abs(p);
    return max(dot(p, normalize(vec2(1.0, 1.732))), p.x);
  }

  vec2 hexCoord(vec2 p, float s) {
    vec2 r = vec2(s, s * 1.732);
    vec2 a = mod(p, r) - r * 0.5;
    vec2 b = mod(p - r * 0.5, r) - r * 0.5;
    return dot(a,a) < dot(b,b) ? a : b;
  }

  void main() {
    // Fresnel rim
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

    // Hex grid
    vec2 uv = vPosition.xy * 2.5 + vPosition.z * 1.2;
    vec2 hc = hexCoord(uv, 0.35);
    float h = hexDist(hc);
    float hexLine = smoothstep(0.28, 0.30, h) - smoothstep(0.30, 0.32, h);

    // Crack effect: noisy dark bands
    float crack = step(0.94, fract(sin(dot(vPosition.xy, vec2(12.9898, 78.233))) * 43758.5));

    // Pulse
    float pulse = 0.55 + 0.45 * sin(uTime * 3.0 + vPosition.y * 2.0);
    float alertPulse = 0.7 + 0.3 * sin(uTime * 8.0);  // fast flicker for high severity

    float severity = mix(pulse, alertPulse, uSeverity);
    float alpha = (fresnel * 0.9 + hexLine * 0.6 - crack * 0.5) * severity * 0.85;

    vec3 lowColor  = vec3(1.0, 0.55, 0.0);   // orange: low
    vec3 highColor = vec3(1.0, 0.05, 0.05);  // red: critical
    vec3 col = mix(lowColor, highColor, uSeverity);

    // Crack coloring
    col = mix(col, vec3(0.2, 0.0, 0.0), crack * 0.8);

    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.9));
  }
`;

// ── Mock Vulnerability Database ───────────────────────────────
const MOCK_VULN_DB = {
    'package.json': { severity: 'critical', cve: 'CVE-2024-1337', count: 3 },
    'requirements.txt': { severity: 'high', cve: 'CVE-2024-5588', count: 2 },
    'pom.xml': { severity: 'medium', cve: 'CVE-2024-3001', count: 1 },
    'Cargo.toml': { severity: 'low', cve: 'CVE-2024-0099', count: 1 },
    'go.mod': { severity: 'medium', cve: 'CVE-2024-4422', count: 2 },
    'composer.json': { severity: 'high', cve: 'CVE-2024-7811', count: 4 },
    'Gemfile': { severity: 'critical', cve: 'CVE-2024-6600', count: 5 },
};

const SEVERITY_SCALE = { low: 0.15, medium: 0.45, high: 0.75, critical: 1.0 };

export function getIslandVulnerability(islandName) {
    return MOCK_VULN_DB[islandName] || null;
}

// ── ShieldMesh Component ──────────────────────────────────────
function ShieldMesh({ scale, severity }) {
    const meshRef = useRef();
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSeverity: { value: SEVERITY_SCALE[severity] || 0.5 },
    }), [severity]);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.004;
        }
    });

    const geo = useMemo(() => new THREE.SphereGeometry(scale * 1.85, 32, 32), [scale]);

    return (
        <mesh ref={meshRef} geometry={geo}>
            <shaderMaterial
                vertexShader={shieldVertexShader}
                fragmentShader={shieldFragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

// ── Main Export ───────────────────────────────────────────────
export function SecurityShield({ island, vuln }) {
    if (!vuln) return null;
    const severityNum = SEVERITY_SCALE[vuln.severity] || 0.5;

    return (
        <group>
            <ShieldMesh scale={island.scale} severity={vuln.severity} />

            {/* Alert badge */}
            <Html
                position={[0, island.scale * 2.8, 0]}
                center
                distanceFactor={18}
                style={{ pointerEvents: 'none' }}
            >
                <div style={{
                    background: `rgba(${severityNum > 0.7 ? '220,0,0' : '200,100,0'},0.88)`,
                    border: `1px solid rgba(255,${severityNum > 0.7 ? '50' : '150'},0,0.7)`,
                    borderRadius: '6px', padding: '3px 8px',
                    fontFamily: 'Space Mono, monospace', fontSize: '9px',
                    color: '#fff', whiteSpace: 'nowrap',
                    boxShadow: `0 0 12px rgba(255,50,0,0.4)`,
                }}>
                    🛡️ {vuln.severity.toUpperCase()} · {vuln.cve}
                </div>
            </Html>
        </group>
    );
}
