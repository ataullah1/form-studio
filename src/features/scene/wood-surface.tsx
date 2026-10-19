'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color, type MeshStandardMaterial } from 'three';
import type { FinishId } from '@/lib/catalog';
import { WoodTextureLibrary, type WoodTextureSet } from './wood-texture-library';
import { woodPresets } from './wood-presets';

export interface TextureReport { finishId: FinishId; attempt: number; status: 'loading' | 'ready' | 'error' }
interface Loaded extends TextureReport { textures?: WoodTextureSet }
interface Props { finishId: FinishId; attempt: number; onStatus: (report: TextureReport) => void }

export function WoodSurface({ finishId, attempt, onStatus }: Props) {
  const renderer = useThree(state => state.gl);
  const invalidate = useThree(state => state.invalidate);
  const library = useRef<WoodTextureLibrary | null>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const [loaded, setLoaded] = useState<Loaded>({ finishId, attempt, status: 'loading' });
  const reveal = useRef(1);
  const reducedMotion = useRef(false);
  const revealStart = useRef(new Color('#c9b8a4'));
  const revealEnd = useRef(new Color('#ffffff'));

  useEffect(() => {
    const owned = new WoodTextureLibrary(renderer.capabilities.getMaxAnisotropy());
    library.current = owned;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => { reducedMotion.current = query.matches; };
    updateMotion();
    query.addEventListener('change', updateMotion);
    return () => { query.removeEventListener('change', updateMotion); owned.dispose(); library.current = null; };
  }, [renderer]);

  useEffect(() => {
    const owned = library.current;
    if (!owned) return;
    let current = true;
    queueMicrotask(() => { if (current) onStatus({ finishId, attempt, status: 'loading' }); });
    owned.load(finishId, attempt).then(textures => {
      if (!current) return;
      const result: Loaded = { finishId, attempt, status: 'ready', textures };
      setLoaded(result);
      onStatus({ finishId, attempt, status: 'ready' });
      invalidate();
    }).catch(() => {
      if (!current) return;
      const result: Loaded = { finishId, attempt, status: 'error' };
      setLoaded(result);
      onStatus(result);
      invalidate();
    });
    return () => { current = false; };
  }, [attempt, finishId, invalidate, onStatus, renderer]);

  // Keep the last successfully rendered wood while a new selection downloads.
  // A failure deliberately drops the maps and shows an explicit neutral fallback.
  const textures = loaded.status === 'ready' ? loaded.textures : undefined;
  const displayedFinish = textures ? loaded.finishId : finishId;
  const preset = woodPresets[displayedFinish];

  useLayoutEffect(() => {
    if (!material.current) return;
    reveal.current = textures && !reducedMotion.current ? 0 : 1;
    revealEnd.current.set(preset.surfaceColour);
    revealStart.current.copy(revealEnd.current).multiplyScalar(0.84);
    if (textures) material.current.color.copy(reveal.current === 0 ? revealStart.current : revealEnd.current);
    invalidate();
  }, [textures, preset.surfaceColour, invalidate]);

  useFrame((_, delta) => {
    if (reveal.current >= 1 || !material.current) return;
    reveal.current = reducedMotion.current ? 1 : Math.min(1, reveal.current + delta / 0.18);
    const eased = 1 - (1 - reveal.current) ** 3;
    material.current.color.lerpColors(revealStart.current, revealEnd.current, eased);
    invalidate();
  });

  return <meshStandardMaterial
    key={textures ? 'wood' : 'neutral'}
    ref={material}
    color={textures ? preset.surfaceColour : '#bdb3a3'}
    map={textures?.colour ?? null}
    normalMap={textures?.normal ?? null}
    roughnessMap={textures?.roughness ?? null}
    roughness={textures ? preset.roughness : 0.75}
    normalScale={[preset.normalStrength, preset.normalStrength]}
    metalness={0}
  />;
}
