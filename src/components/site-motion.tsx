'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const revealTargets = '.story-heading, .story-option, .accessory-library figure, .material-study, .details-heading, .specification-sheet, .process-steps li, .concept-faq, .story-invitation, .page-heading, .design-card, .surface-panel, .auth-panel, .quote-draft';

/** Progressive enhancement: content stays visible without JavaScript or motion. */
export function SiteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;
    function setup() {
      dispose?.();
      dispose = undefined;
      if (preference.matches || !('IntersectionObserver' in window)) return;
      const seen = new WeakSet<Element>();
      const animations = new Set<Animation>();
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const animation = entry.target.animate(
            [{ opacity: 0.65, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
      }, { threshold: 0.08 });
      function register(root: ParentNode) {
        const nodes = [...root.querySelectorAll(revealTargets)];
        if (root instanceof Element && root.matches(revealTargets)) nodes.push(root);
        for (const node of nodes) {
          if (seen.has(node)) continue;
          seen.add(node);
          observer.observe(node);
        }
      }
      register(document);
      const mutations = new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (node instanceof Element) register(node);
        }
      });
      mutations.observe(document.body, { childList: true, subtree: true });
      dispose = () => {
        mutations.disconnect();
        observer.disconnect();
        for (const animation of animations) animation.cancel();
        animations.clear();
      };
    }
    setup();
    preference.addEventListener('change', setup);
    return () => { dispose?.(); preference.removeEventListener('change', setup); };
  }, [pathname]);
  return null;
}
