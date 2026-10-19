'use client';

import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback: ReactNode; onError: () => void }

/** Keeps renderer/module failures inside the viewer, away from HTML content/forms. */
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
