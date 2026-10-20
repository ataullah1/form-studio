'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { catalogV1, defaultConfiguration, type FinishId, type ProductConfiguration } from '@/lib/catalog';
import { saveDraft } from '@/features/configurator/local-draft';
import type { CameraCommand } from '@/features/scene/camera-framing';
import { SceneBoundary } from '@/features/scene/scene-boundary';

const SceneCanvas = dynamic(() => import('@/features/scene/scene-canvas'), { ssr: false });
const ignoreTexture = () => {};

export function HeroDesk() {
  const [mode, setMode] = useState<'poster' | 'loading' | 'ready' | 'fallback'>('poster');
  const [configuration, setConfiguration] = useState<ProductConfiguration>({ ...defaultConfiguration, accessoryIds: ['lamp', 'monitor-stand'] });
  const [active, setActive] = useState(true);
  const [command, setCommand] = useState<CameraCommand>({ revision: 0, action: 'reset' });
  const [draftError, setDraftError] = useState(false);
  const region = useRef<HTMLElement>(null);
  const ready = useCallback(() => setMode('ready'), []);
  const unavailable = useCallback(() => setMode('fallback'), []);
  const live = mode === 'loading' || mode === 'ready';

  useEffect(() => {
    const element = region.current;
    if (!element) return;
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (mode !== 'loading') return;
    const timer = window.setTimeout(unavailable, 20000);
    return () => window.clearTimeout(timer);
  }, [mode, unavailable]);

  function start() {
    try {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) { unavailable(); return; }
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      setMode('loading');
    } catch { unavailable(); }
  }
  function view(action: CameraCommand['action']) { setCommand(previous => ({ revision: previous.revision + 1, action })); }
  const poster = <Image src="/assets/studio-desk-01.webp" alt="Studio Desk 01 concept in natural oak with a black frame, desk lamp and monitor stand" fill sizes="(max-width: 767px) 115vw, (max-width: 1440px) 92vw, 1296px" priority />;

  return <figure ref={region} className="hero-art" data-live={live || undefined}>
    {live ? <div className="hero-canvas" aria-busy={mode === 'loading'}>
      <SceneBoundary fallback={poster} onError={unavailable}>
        <SceneCanvas quality="low" lighting="day" allowZoom={false} active={active} onReady={ready} onUnavailable={unavailable} command={command} configuration={configuration} attempt={0} onTextureStatus={ignoreTexture} />
      </SceneBoundary>
    </div> : poster}
    <div className="hero-explore">
      {!live ? <><button className="secondary-button" type="button" onClick={start}>Explore in 3D <span aria-hidden="true">↗</span></button><p role="status">{mode === 'fallback' ? '3D unavailable. You can still build your desk.' : 'A closer look. A different angle.'}</p></> : <>
        <p role="status">{mode === 'loading' ? 'Opening your desk…' : 'Drag to explore · Scroll to discover'}</p>
        <div className="hero-finishes" role="group" aria-label="Hero desk finish">{Object.entries(catalogV1.finishes).map(([id, finish]) => <button type="button" key={id} aria-pressed={configuration.finishId === id} onClick={() => setConfiguration(previous => ({ ...previous, finishId: id as FinishId }))}>{finish.label}</button>)}</div>
        <div className="hero-view-actions"><button type="button" disabled={mode !== 'ready'} onClick={() => view('front')}>Front</button><button type="button" disabled={mode !== 'ready'} onClick={() => view('reset')}>Reset view</button><button type="button" onClick={() => setMode('poster')}>Close 3D</button></div>
        <Link href="/configure" className="text-link" onClick={event => { if (!saveDraft(() => localStorage, configuration)) { event.preventDefault(); setDraftError(true); } }}>Continue this design <span aria-hidden="true">↗</span></Link>
        {draftError && <p role="alert">Browser storage is blocked. Use Build your desk to start a fresh design.</p>}
      </>}
    </div>
    {!live && <figcaption>Oak / Black <span>Optional accessories shown</span></figcaption>}
  </figure>;
}
