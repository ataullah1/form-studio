'use client';
import { AccountProvider } from '@/features/account/account-notice';
import { readAuthDesign, clearAuthDesign } from '@/features/auth/design-context';

import { useEffect, useReducer, useRef, useState, useSyncExternalStore, type Dispatch } from 'react';
import { defaultConfiguration } from '@/lib/catalog';
import { validateConfig } from '@/lib/catalog/pricing';
import { QuoteDraft } from '@/features/quotes/quote-draft';
import { SceneViewer } from '@/features/scene/scene-viewer';
import { ConfigurationPanel } from './configuration-panel';
import { configurationReducer, type ConfigurationAction } from './configuration-state';
import { DRAFT_DELAY_MS, loadInitialConfiguration, saveDraft, type DraftStatus } from './local-draft';

const subscribe = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;
const storage = () => window.localStorage;

/** Resolves local state before mounting interactive choices; no default-selection flash or hydration mismatch. */
function ResolvedConfigurator({ sharedSnapshot, sourcePublicId }: { sharedSnapshot?: unknown; sourcePublicId?: string }) {
  const hydrated = useSyncExternalStore(subscribe, hydratedSnapshot, serverSnapshot);
  const serverConfiguration = sharedSnapshot === undefined ? defaultConfiguration : validateConfig(sharedSnapshot);
  if (!hydrated) return <><div className="draft-pending" aria-busy="true">
    <p className="draft-loading" role="status">Loading your desk draft…</p>
    <div className="builder" style={{ visibility: 'hidden' }}><SceneViewer configuration={serverConfiguration} /><ConfigurationPanel configuration={serverConfiguration} dispatch={() => {}} /></div>
    <noscript><style>{'.draft-pending .builder { visibility: visible !important; } .draft-loading { display: none; }'}</style></noscript>
  </div><QuoteDraft configuration={serverConfiguration} active={false} /></>;
  return <DraftConfigurator sharedSnapshot={sharedSnapshot} sourcePublicId={sourcePublicId} />;
}

function DraftConfigurator({ sharedSnapshot, sourcePublicId }: { sharedSnapshot?: unknown; sourcePublicId?: string }) {
  const [boot] = useState(() => { const resumed=readAuthDesign(sourcePublicId); return resumed ? { configuration:resumed,status:sourcePublicId?'shared' as const:'restored' as const } : loadInitialConfiguration(storage, sharedSnapshot); });
  useEffect(() => { if(new URLSearchParams(window.location.search).get('resume')==='1')clearAuthDesign(); }, []);
  const [configuration, reduce] = useReducer(configurationReducer, boot.configuration);
  const [status, setStatus] = useState<DraftStatus>(boot.status);
  const [blocked, setBlocked] = useState(boot.status === 'invalid');
  const [edited, setEdited] = useState(false);
  const latest = useRef(configuration);
  const maySave = useRef(false);

  // Shared snapshots are read-only sources until an explicit edit makes a local copy.
  const persist = !blocked && (boot.status !== 'shared' || edited);
  useEffect(() => {
    latest.current = configuration; maySave.current = persist;
    if (!persist) return;
    const timer = window.setTimeout(() => setStatus(saveDraft(storage, configuration) ? 'saved' : 'unavailable'), DRAFT_DELAY_MS);
    const flush = () => { saveDraft(storage, configuration); };
    window.addEventListener('pagehide', flush);
    return () => { clearTimeout(timer); window.removeEventListener('pagehide', flush); };
  }, [configuration, persist]);
  useEffect(() => () => { if (maySave.current) saveDraft(storage, latest.current); }, []);

  const dispatch: Dispatch<ConfigurationAction> = action => {
    setEdited(true);
    if (action.type === 'reset') {
      setBlocked(false);
      // Reset is durable immediately, even when a reload beats the debounce.
      setStatus(saveDraft(storage, defaultConfiguration) ? 'saved' : 'unavailable');
    }
    reduce(action);
  };
  const messages: Record<DraftStatus, string> = {
    new: 'Your design saves automatically on this browser.', restored: 'Your saved desk draft has been restored.',
    saved: 'Desk draft saved on this browser.', unavailable: 'Local saving is unavailable. You can keep designing for this visit.',
    invalid: 'This saved draft is invalid or from an unsupported version. Defaults were loaded. Changes stay in this visit until you discard the saved draft.',
    shared: 'Shared design loaded. Changes create a local copy on this browser.',
  };
  return <>
    <div className="draft-notice" role="status"><p>{messages[status]}</p>{blocked && <button type="button" className="secondary-button" onClick={() => dispatch({ type: 'reset' })}>Discard saved draft</button>}</div>
    <div className="builder"><SceneViewer configuration={configuration} /><ConfigurationPanel sourcePublicId={sourcePublicId} configuration={configuration} dispatch={dispatch} /></div>
    <QuoteDraft configuration={configuration} sourcePublicId={sourcePublicId} />
  </>;
}

export function Configurator(props:{sharedSnapshot?:unknown;sourcePublicId?:string}) { return <AccountProvider><ResolvedConfigurator {...props}/></AccountProvider>; }
