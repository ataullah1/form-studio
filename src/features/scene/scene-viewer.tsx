'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { DeskSchematic } from './desk-schematic';
import { SceneBoundary } from './scene-boundary';
import type { CameraCommand } from './camera-framing';

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
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({ revision: 0, action: 'reset' });
  function moveCamera(action: CameraCommand['action']) {
    setCameraCommand(previous => ({ revision: previous.revision + 1, action }));
  }
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
    <div className="viewer-top"><h2 id="viewer-title">Scene preview</h2><span className="pill">Step 2 · Geometry preview</span></div>
    <p className="scene-notice">140 × 70 × 74 cm · Neutral geometry preview. Wood finishes arrive in Step 3.</p>
    {(mode === 'idle') && <>
      <DeskSchematic />
      <button type="button" className="button" onClick={start}>View desk in 3D ↗</button>
      <noscript><p>JavaScript is unavailable. The 2D schematic, product summary and draft fields remain available.</p></noscript>
    </>}
    {(mode === 'loading' || mode === 'ready') && <>
      <div className="canvas-region" data-testid="scene-region" aria-busy={mode === 'loading'}>
        <SceneBoundary fallback={fallback} onError={unavailable}>
          <SceneCanvas onReady={ready} onUnavailable={unavailable} command={cameraCommand} />
        </SceneBoundary>
      </div>
      <p className="scene-status" role="status">{mode === 'loading' ? 'Starting 3D renderer…' : '3D desk ready. Drag to rotate; scroll or pinch to zoom.'}</p>
      <div className="camera-actions" aria-label="Viewer controls">
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('reset')}>Reset view</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('zoom-in')}>Zoom in</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('zoom-out')}>Zoom out</button>
        <button type="button" className="secondary-button" onClick={unavailable}>Use 2D view</button>
      </div>
    </>}
    {mode === 'fallback' && fallback}
  </section>;
}
