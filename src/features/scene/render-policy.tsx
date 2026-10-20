'use client';
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import type { ProductConfiguration } from '@/lib/catalog';
import type { WebGLRenderer } from 'three';
import type { LightingMode, ViewerQuality } from './viewer-settings';

// Three's renderer is an imperative resource owned by Canvas, not immutable React state.
function automaticShadows(renderer: WebGLRenderer, enabled: boolean) { renderer.shadowMap.autoUpdate = enabled; }
function refreshShadows(renderer: WebGLRenderer) { renderer.shadowMap.needsUpdate = true; }

/** Static lights/meshes need one shadow refresh per product/lighting change, not per orbit frame. */
export function RenderPolicy({ active, configuration, lighting, quality }: { quality: ViewerQuality; active: boolean; configuration: ProductConfiguration; lighting: LightingMode }) {
  const gl = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    const previous = gl.shadowMap.autoUpdate;
    automaticShadows(gl, false);
    return () => { automaticShadows(gl, previous); };
  }, [gl]);
  useEffect(() => { refreshShadows(gl); if (active) invalidate(); }, [active, configuration, gl, invalidate, lighting, quality]);
  return null;
}
