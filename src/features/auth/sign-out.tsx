'use client';

import { useState } from 'react';

export function SignOut() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  return <form action="/api/admin/logout" method="post" className="sign-out-form" onSubmit={async event => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error('Sign-out failed');
      // A full navigation drops any cached private workspace after session revocation.
      window.location.assign(new URL('/login', window.location.origin).href);
    } catch {
      setBusy(false);
      setError(true);
    }
  }}>
    <button className="button-quiet" disabled={busy} type="submit">{busy ? 'Signing out…' : 'Sign out'}</button>
    {error && <p className="fine" role="alert">Sign-out failed. Please retry.</p>}
  </form>;
}
