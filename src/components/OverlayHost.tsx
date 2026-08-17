import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Overlay plumbing for the mobile frame.
 *
 * Modals and drawers are `position: fixed`, so by default they paint over the
 * whole lab window — a 560px modal next to a 390px phone tells you nothing
 * about how it behaves on a phone. `OverlayHost` gives the mobile frame a mount
 * point; `<Overlay>` portals into it when it exists, and renders in place
 * otherwise (full screen / Éditeur).
 *
 * The host is a containing block for fixed-position descendants (see below), so
 * a portaled `fixed inset-0` resolves against the phone, not the browser window.
 * What does NOT follow are viewport units: overlay chrome must use `%` /
 * `h-full`, never `vw` / `vh` / `h-screen`.
 */

let hostEl: HTMLElement | null = null;
const listeners = new Set<() => void>();
function publish(el: HTMLElement | null) {
  hostEl = el;
  listeners.forEach((l) => l());
}

export function OverlayHost() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    publish(ref.current);
    return () => publish(null);
  }, []);
  // translateZ(0) is what makes this a containing block for `position: fixed`
  // children, so a portaled modal sizes and positions against the PHONE rather
  // than the browser window. (container-type alone doesn't do it in practice.)
  return <div ref={ref} className="absolute inset-0 z-50 empty:hidden [transform:translateZ(0)]" />;
}

export function Overlay({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(hostEl);
  useEffect(() => {
    const l = () => setHost(hostEl);
    listeners.add(l);
    l();
    return () => { listeners.delete(l); };
  }, []);
  if (!host) return <>{children}</>;
  return createPortal(children, host);
}
