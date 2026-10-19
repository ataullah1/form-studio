'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { DeskSchematic } from './desk-schematic';
import { SceneBoundary } from './scene-boundary';

const SceneCanvas = dynamic(() => import('./scene-canvas'), {
  ssr: false,
  loading: () => <p className="scene-message" role="status">Loading the 3D module…</p>,
});

function Unavailable({ reason }: { reason: string }) {
  return <div className="scene-unavailable">
    <p role="status">{reason} Your desk information and quote draft are still available.</p>
    <DeskSchematic />
    <a className="text-link" href="/configure">Reload page to retry 3D</a>
  </div>;
}

/** Starts no WebGL or Three import until explicitly requested. */
export function SceneViewer() {
  const [mode, setMode] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const ready = useCallback(() => setMode('ready'), []);
  const unavailable = useCallback(() => setMode('fallback'), []);

  useEffect(() => {
    if (mode !== 'loading') return;
    const timeout = window.setTimeout(unavailable, 20000);
    return () => window.clearTimeout(timeout);
  }, [mode, unavailable]);

  function start() {
    // Current Three renderer requires WebGL2. Dispose this capability probe;
    // the actual renderer owns a separate canvas/context inside SceneCanvas.
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2');
      if (!context) { unavailable(); return; }
      context.getExtension('WEBGL_lose_context')?.loseContext();
      setMode('loading');
    } catch { unavailable(); }
  }

  const fallback = <Unavailable reason="3D is unavailable. Showing the 2D schematic." />;
  return <section className="scene-viewer" aria-labelledby="viewer-title">
    <div className="viewer-top"><h2 id="viewer-title">Scene preview</h2><span className="pill">Step 1 · Integration test</span></div>
    <p className="scene-notice">The 3D test object verifies the renderer. Desk geometry and materials come in later steps.</p>
    {(mode === 'idle') && <>
      <DeskSchematic />
      <button type="button" className="button" onClick={start}>Load 3D test scene ↗</button>
      <noscript><p>JavaScript is unavailable. The 2D schematic, product summary and draft fields remain available.</p></noscript>
    </>}
    {(mode === 'loading' || mode === 'ready') && <>
      <div className="canvas-region" data-testid="scene-region" aria-busy={mode === 'loading'}>
        <SceneBoundary fallback={fallback} onError={unavailable}>
          <SceneCanvas onReady={ready} onUnavailable={unavailable} />
        </SceneBoundary>
      </div>
      <p className="scene-status" role="status">{mode === 'loading' ? 'Starting 3D renderer…' : '3D test scene ready. Drag to rotate; scroll or pinch to zoom.'}</p>
      <button type="button" className="secondary-button" onClick={unavailable}>Use 2D view</button>
    </>}
    {mode === 'fallback' && fallback}
  </section>;
}
