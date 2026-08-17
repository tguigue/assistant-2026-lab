import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * SurfaceScope — the responsive root of the chatbot.
 *
 * Everything inside adapts to the WIDTH OF THIS ELEMENT, not the browser
 * viewport. That matters because the same primitives render at very different
 * widths on the same screen: the Éditeur assistant panel (400) and the document
 * column (900+) sit side by side, so a viewport breakpoint would give them the
 * same answer when they need opposite ones.
 *
 * Two mechanisms, one element, so they can't drift:
 *   • `@container/surface` — CSS container queries for layout (`@2xl/surface:…`).
 *     Use this for anything that is a style tweak: wrap, columns, gaps, hiding
 *     a label. Free, no JS.
 *   • `useNarrow()` — the measured width, for the few places where narrow needs
 *     a genuinely DIFFERENT component (a control that folds into a popover, a
 *     drawer that becomes a sheet). Use sparingly.
 *
 * NARROW is < 42rem (672px). A phone and the Éditeur panel land below it;
 * full screen on a desktop lands above.
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
 * Overlays (modals, drawers) are `position: fixed`, so they size against the
 * viewport no matter which surface opened them — container queries and the width
 * context can't reach them. They read the window directly.
 */
export function useNarrowOverlay() {
  return useMediaQuery(`(max-width: ${NARROW_BP - 1}px)`);
}

/** Plain window-level media query, for chrome that sizes against the viewport. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return matches;
}
