'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DeskSchematic } from './desk-schematic';
import { SceneBoundary } from './scene-boundary';
import type { CameraCommand } from './camera-framing';
import { catalogV1 } from '@/lib/catalog';
import type { ProductConfiguration } from '@/lib/catalog';
import type { LightingMode, ViewerQuality } from './viewer-settings';
import { floorFinishes, type FloorFinish, type RoomView } from './design-settings';
import { calculatePrice } from '@/lib/catalog/pricing';
import { formatUsd } from '@/lib/catalog';
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
export function SceneViewer({ configuration, readOnly = false }: { configuration: ProductConfiguration; readOnly?: boolean }) {
  const [room, setRoom] = useState<RoomView>('studio');
  const [floor, setFloor] = useState<FloorFinish>('sand');
  const [showDimensions, setShowDimensions] = useState(false);
  const [lampOverride, setLampOverride] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [comparison, setComparison] = useState<ProductConfiguration | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [captureRevision, setCaptureRevision] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [detail, setDetail] = useState<'surface' | 'frame' | 'accessories' | null>(null);
  const displayed = showComparison && comparison ? comparison : configuration;
  const onCapture = useCallback((data: string | null) => {
    if (!data) { setExportStatus('Preview could not be downloaded. Please retry.'); return; }
    const link = document.createElement('a');
    link.href = data;
    link.download = `form-studio-${displayed.sizeId}-${displayed.finishId}.png`;
    document.body.append(link); link.click(); link.remove();
    setExportStatus('Preview downloaded. Dimension labels are not included.');
  }, [displayed.sizeId, displayed.finishId]);
  const [quality, setQuality] = useState<ViewerQuality>('balanced');
  const [lighting, setLighting] = useState<LightingMode>('day');
  const [active, setActive] = useState(true);
  const region = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [textureReport, setTextureReport] = useState<TextureReport | null>(null);
  const onTextureStatus = useCallback((report: TextureReport) => setTextureReport(report), []);
  const textureStatus = textureReport?.quality === quality && textureReport.finishId === displayed.finishId && textureReport.attempt === attempt ? textureReport.status : 'loading';
  const finishLabel = catalogV1.finishes[displayed.finishId].label;
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

  useEffect(() => {
    const element = region.current;
    if (!element) return;
    let inView = true;
    const update = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }, { rootMargin: '120px' });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [mode]);

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

  const lampOn = lampOverride ?? lighting === 'night';
  const fallback = <Unavailable reason="3D is unavailable. Showing the 2D schematic." configuration={configuration} />;
  return <section className={`scene-viewer${expanded ? ' is-expanded' : ''}`} aria-labelledby="viewer-title">
    <div className="viewer-top"><h2 id="viewer-title">Scene preview</h2><span className="scene-version">01 / 3D</span></div>
    <p className="scene-notice">{readOnly ? 'Explore the saved design. Edit a copy to make it yours.' : 'Your selected desk, ready to explore in 2D or 3D.'}</p>
    {mode !== 'fallback' && <div className="quality-actions" role="group" aria-label="Preview quality">
      <span>Preview quality</span>{(['balanced', 'low'] as const).map(value => <button key={value} type="button" className="secondary-button" aria-pressed={quality === value} onClick={() => setQuality(value)}>{value === 'low' ? 'Low' : 'Balanced'}</button>)}
      <p>{quality === 'low' ? 'Lighter preview.' : 'Detail and soft shadows.'}</p>
    </div>}
    {mode !== 'fallback' && <div className="design-toolbar">
      <div className="stage-switch" role="group" aria-label="Preview setting"><span>Setting</span>{(['studio', 'room'] as const).map(value => <button type="button" key={value} aria-pressed={room === value} onClick={() => setRoom(value)}>{value === 'studio' ? 'Studio' : 'Room'}</button>)}</div>
      {room === 'room' && <label className="floor-select">Floor<select aria-label="Room floor" value={floor} onChange={event => setFloor(event.target.value as FloorFinish)}>{Object.entries(floorFinishes).map(([id, finish]) => <option key={id} value={id}>{finish.label}</option>)}</select></label>}
      <button type="button" aria-pressed={showDimensions} onClick={() => setShowDimensions(value => !value)}>Dimensions</button>
      <button type="button" aria-pressed={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Compact preview' : 'Expand preview'}</button>
    </div>}
    {showComparison && comparison && <div className="comparison-notice" role="status">Viewing comparison · {catalogV1.sizes[comparison.sizeId].label} · {catalogV1.finishes[comparison.finishId].label} · {formatUsd(calculatePrice(comparison).estimatedTotalCents)}<p>Your current design and save actions stay unchanged.</p></div>}
    {(mode === 'idle') && <div className="scene-idle">
      <DeskSchematic configuration={configuration} />
      <button type="button" className="button" onClick={start}>View desk in 3D ↗</button>
      <noscript><p>JavaScript is unavailable. The 2D schematic, product summary and draft fields remain available.</p></noscript>
    </div>}
    {(mode === 'loading' || mode === 'ready') && <>
      <div ref={region} className="canvas-region" data-testid="scene-region" aria-busy={mode === 'loading'}>
        <SceneBoundary fallback={fallback} onError={unavailable}>
          <SceneCanvas onLampToggle={() => setLampOverride(!lampOn)} room={room} floor={floor} showDimensions={showDimensions} lampOn={lampOn} captureRevision={captureRevision} onCapture={onCapture} quality={quality} onReady={ready} onUnavailable={unavailable} command={cameraCommand} lighting={lighting} active={active} configuration={displayed} attempt={attempt} onTextureStatus={onTextureStatus} />
        </SceneBoundary>
      </div>
      <p className="scene-status" role="status">{mode === 'loading' ? 'Starting 3D renderer…' : '3D desk ready. Drag to rotate; scroll or pinch to zoom.'}</p>
      {mode === 'ready' && <div className="texture-feedback" role="status" aria-live="polite">
        {textureStatus === 'loading' && <p>Loading {finishLabel} finish… The previous surface stays visible until ready.</p>}
        {textureStatus === 'ready' && <p>{finishLabel} finish ready · {catalogV1.frameColours[displayed.frameColourId].label} frame</p>}
        {textureStatus === 'error' && <><p>{finishLabel} texture unavailable. Neutral surface shown; your selection is preserved.</p><button type="button" className="secondary-button" onClick={() => setAttempt(value => value + 1)}>Retry finish</button></>}
      </div>}
      <p className="interaction-hint">Drag or pinch inside the 3D area. Scroll the page outside it.</p>
      <div className="lighting-actions" role="group" aria-label="Scene lighting">
        {(['day', 'night'] as const).map(value => <button key={value} type="button" className="secondary-button" disabled={mode !== 'ready'} aria-pressed={lighting === value} onClick={() => setLighting(value)}>{value === 'day' ? 'Day' : 'Night'}</button>)}
        <span>{lighting === 'day' ? 'Day studio' : displayed.accessoryIds.includes('lamp') && lampOn ? 'Night studio · Desk lamp on' : 'Night studio · Ambient light'}</span>
      </div>
      <div className="camera-actions" aria-label="Viewer controls">
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('front')}>Front view</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('detail')}>Detail view</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('reset')}>Reset view</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('zoom-in')}>Zoom in</button>
        <button type="button" className="secondary-button" disabled={mode !== 'ready'} onClick={() => moveCamera('zoom-out')}>Zoom out</button>
        <button type="button" className="secondary-button" onClick={unavailable}>Use 2D view</button>
      </div>
    </>}
    {mode === 'ready' && <div className="workbench-tools">
      <div className="inspection-tools" role="group" aria-label="Inspect desk details"><span>Look closer</span><button type="button" aria-pressed={detail === 'surface'} onClick={() => { setDetail('surface'); moveCamera('top'); }}>Tabletop</button><button type="button" aria-pressed={detail === 'frame'} onClick={() => { setDetail('frame'); moveCamera('detail'); }}>Frame detail</button><button type="button" aria-pressed={detail === 'accessories'} onClick={() => { setDetail('accessories'); moveCamera('rear'); }}>Rear & accessories</button></div>
      {detail && <p className="inspection-note">{detail === 'surface' ? 'Rounded corners, a 3 cm edge and natural grain. Change the finish in Product options.' : detail === 'frame' ? 'A matte metal frame with rounded edges and protective feet. Black and white are included.' : 'Add the lamp, monitor stand or cable tray in Product options. Each keeps its own dimensions across desk sizes.'}</p>}
      {displayed.accessoryIds.includes('lamp') && <button type="button" className="secondary-button lamp-toggle" aria-pressed={lampOn} onClick={() => setLampOverride(!lampOn)}>Desk lamp {lampOn ? 'on' : 'off'}</button>}
      <div className="design-output"><button type="button" className="secondary-button" onClick={() => { setComparison(configuration); setShowComparison(false); }}>Keep for comparison</button>{comparison && <button type="button" className="secondary-button" aria-pressed={showComparison} onClick={() => setShowComparison(value => !value)}>{showComparison ? 'View current design' : 'View comparison'}</button>}<button type="button" className="secondary-button" onClick={() => { setExportStatus('Preparing preview…'); setCaptureRevision(value => value + 1); }}>Download preview</button></div>
      <p className="fine" role="status">{exportStatus || 'Room, camera and lighting are preview settings. Saved links contain your product selections.'}</p>
    </div>}
    {mode === 'fallback' && fallback}
  </section>;
}
