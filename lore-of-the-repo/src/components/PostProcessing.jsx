/**
 * PostProcessing.jsx
 * Deep-space bloom, chromatic aberration, and vignette effects.
 * Uses @react-three/postprocessing for GPU-accelerated post-FX.
 */

import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Vector2 } from 'three';
import { useMemo } from 'react';

export function PostProcessingEffects({ theme = 'cyber-astral', intensity = 1.0 }) {
    const bloomConfig = useMemo(() => {
        const configs = {
            'cyber-astral': { luminanceThreshold: 0.15, intensity: 2.8 * intensity, color: undefined },
            'bioluminescent': { luminanceThreshold: 0.10, intensity: 3.2 * intensity, color: undefined },
            'steampunk': { luminanceThreshold: 0.20, intensity: 2.0 * intensity, color: undefined },
            'minimalist-void': { luminanceThreshold: 0.30, intensity: 1.2 * intensity, color: undefined },
        };
        return configs[theme] || configs['cyber-astral'];
    }, [theme, intensity]);

    return (
        <EffectComposer multisampling={4}>
            <Bloom
                luminanceThreshold={bloomConfig.luminanceThreshold}
                luminanceSmoothing={0.05}
                intensity={bloomConfig.intensity}
                kernelSize={KernelSize.LARGE}
                mipmapBlur
                blendFunction={BlendFunction.ADD}
            />
            <ChromaticAberration
                blendFunction={BlendFunction.NORMAL}
                offset={new Vector2(0.0006, 0.0006)}
                radialModulation={false}
                modulationOffset={0.15}
            />
            <Vignette
                offset={0.4}
                darkness={0.65}
                eskil={false}
                blendFunction={BlendFunction.NORMAL}
            />
        </EffectComposer>
    );
}
