'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { DeskSchematic } from './desk-schematic';
import { SceneBoundary } from './scene-boundary';
import type { CameraCommand } from './camera-framing';
import { catalogV1 } from '@/lib/catalog';
import type { ProductConfiguration } from '@/lib/catalog';
import type { TextureReport } from './wood-surface';

const SceneCanvas = dynamic(() => import('./scene-canvas'), {
  ssr: false,
  loading: () => <p className="scene-message" role="status">Loading the 3D module…</p>,
});

function Unavailable({ reason, configuration }: { reason: string; configuration: ProductConfiguration }) {
  return <div className="scene-unavailable">
    <p role="status">{reason} Your desk information and quote draft are still available.</p>
    <DeskSchematic configuration={configuration} />
    <a className="text-link" href="/configure">Reload page to retry 3D</a>
  </div>;
}

/** Starts no WebGL or Three import until explicitly requested. */
export function SceneViewer({ configuration }: { configuration: ProductConfiguration }) {
  const [attempt, setAttempt] = useState(0);
  const [textureReport, setTextureReport] = useState<TextureReport | null>(null);
  const onTextureStatus = useCallback((report: TextureReport) => setTextureReport(report), []);
  const textureStatus = textureReport?.finishId === configuration.finishId && textureReport.attempt === attempt ? textureReport.status : 'loading';
  const finishLabel = catalogV1.finishes[configuration.finishId].label;
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

  const fallback = <Unavailable reason="3D is unavailable. Showing the 2D schematic." configuration={configuration} />;
  return <section className="scene-viewer" aria-labelledby="viewer-title">
    <div className="viewer-top"><h2 id="viewer-title">Scene preview</h2><span className="scene-version">01 / 3D</span></div>
    <p className="scene-notice">Choose a size, finish, frame and fixed-position accessories. Rotate or zoom to explore.</p>
    {(mode === 'idle') && <div className="scene-idle">
      <DeskSchematic configuration={configuration} />
      <button type="button" className="button" onClick={start}>View desk in 3D ↗</button>
      <noscript><p>JavaScript is unavailable. The 2D schematic, product summary and draft fields remain available.</p></noscript>
    </div>}
    {(mode === 'loading' || mode === 'ready') && <>
      <div className="canvas-region" data-testid="scene-region" aria-busy={mode === 'loading'}>
        <SceneBoundary fallback={fallback} onError={unavailable}>
          <SceneCanvas onReady={ready} onUnavailable={unavailable} command={cameraCommand} configuration={configuration} attempt={attempt} onTextureStatus={onTextureStatus} />
        </SceneBoundary>
      </div>
      <p className="scene-status" role="status">{mode === 'loading' ? 'Starting 3D renderer…' : '3D desk ready. Drag to rotate; scroll or pinch to zoom.'}</p>
      {mode === 'ready' && <div className="texture-feedback" role="status" aria-live="polite">
        {textureStatus === 'loading' && <p>Loading {finishLabel} finish… The previous surface stays visible until ready.</p>}
        {textureStatus === 'ready' && <p>{finishLabel} finish ready · {catalogV1.frameColours[configuration.frameColourId].label} frame</p>}
        {textureStatus === 'error' && <><p>{finishLabel} texture unavailable. Neutral surface shown; your selection is preserved.</p><button type="button" className="secondary-button" onClick={() => setAttempt(value => value + 1)}>Retry finish</button></>}
      </div>}
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
