/**
 * softCircleTexture.js
 *
 * Returns a single shared THREE.CanvasTexture that fades from solid white at
 * the centre to transparent at the edge. Without this, every <pointsMaterial>
 * in the project renders as a hard SQUARE (the default for WebGL point
 * sprites with no `map`), which is what made the city look like it was
 * full of giant purple cubes "stuck" to the screen.
 *
 * One texture is shared across the whole scene to avoid uploading hundreds of
 * tiny canvases to the GPU.
 */
import * as THREE from 'three';

let _cached = null;

export function getSoftCircleTexture() {
    if (_cached) return _cached;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0.00, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.85)');
    gradient.addColorStop(0.70, 'rgba(255,255,255,0.25)');
    gradient.addColorStop(1.00, 'rgba(255,255,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    _cached = tex;
    return tex;
}
