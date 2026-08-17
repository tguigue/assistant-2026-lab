import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useChatbot } from '../chatbot/store';

/**
 * SurfaceScope — the responsive root of the chatbot.
 *
 * Everything inside adapts to the WIDTH OF THIS ELEMENT, never the browser
 * viewport. That matters because the same primitives render at very different
 * widths on the same screen: a real phone (~390), the Éditeur assistant panel
 * (400), the mobile frame (390), full screen (900+). Tailwind's `sm:`/`md:`
 * read the viewport, so in the lab's mobile frame they'd all be "desktop".
 *
 * Two mechanisms, one element, so they can't drift:
 *   • `@container/surface` — CSS container queries for layout (`@2xl/surface:…`).
 *     Use this for anything that is a style tweak: wrap, columns, gaps, hiding
 *     a label. Free, no JS.
 *   • `useNarrow()` — the measured width, for the few places where narrow needs
 *     a genuinely DIFFERENT component (a control that folds into a popover, a
 *     drawer that becomes a sheet). Use sparingly.
 *
 * NARROW is < 42rem (672px). Both the mobile frame and the Éditeur panel land
 * below it, full screen lands above.
 */

export const NARROW_BP = 672;

const SurfaceWidthCtx = createContext<number>(Number.POSITIVE_INFINITY);

export function SurfaceScope({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Infinity until measured — a first paint at "narrow" would flash the folded
  // controls on full screen, which is worse than one frame of the wide layout.
  const [width, setWidth] = useState<number>(Number.POSITIVE_INFINITY);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <SurfaceWidthCtx.Provider value={width}>
      <div ref={ref} className={'@container/surface ' + className}>{children}</div>
    </SurfaceWidthCtx.Provider>
  );
}

export const useSurfaceWidth = () => useContext(SurfaceWidthCtx);
export const useNarrow = (bp: number = NARROW_BP) => useContext(SurfaceWidthCtx) < bp;

/**
 * Measure an element you own. For layouts that decide their OWN shape (the
 * Éditeur choosing between side-by-side and stacked), where a container query
 * can't help because the decision changes the DOM, not just the styling.
 */
export function useElementNarrow(bp: number): [(el: HTMLDivElement | null) => void, boolean] {
  const [width, setWidth] = useState<number>(Number.POSITIVE_INFINITY);
  const roRef = useRef<ResizeObserver | null>(null);
  // Stable identity: a callback ref that changed every render would detach and
  // reattach on each pass, and the observer's first callback would re-render —
  // a loop. Reading the size is left entirely to the observer, which fires once
  // on observe().
  const attach = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    roRef.current = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    roRef.current.observe(el);
  }, []);
  useEffect(() => () => roRef.current?.disconnect(), []);
  return [attach, width < bp];
}

/**
 * Overlays (modals, drawers) mount OUTSIDE the surface subtree, so they can see
 * neither the container query nor the width context — React context follows the
 * React tree, and `<Overlay>` portals only move the DOM node. They get their own
 * answer instead: an overlay is narrow when it opens in the mobile frame, or
 * when the real window is narrow.
 */
export function useNarrowOverlay() {
  const inMobileFrame = useChatbot((s) => s.surface === 'mobile');
  const [windowNarrow, setWindowNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${NARROW_BP - 1}px)`);
    const sync = () => setWindowNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return inMobileFrame || windowNarrow;
}
