import type { ReactNode } from 'react';
import { useChatbot } from '../chatbot/store';
import { PRIMITIVES, type PrimitiveCode } from '../dashboard/primitiveDefs';

/**
 * Wraps a primitive's rendered output so it can be highlighted on hover
 * (bidirectional with the left dashboard rows). Pass-through when
 * highlightMode is off.
 */
export function PrimitiveSlot({
  code,
  children,
  block = false,
}: {
  code: PrimitiveCode;
  children: ReactNode;
  /** If true wraps in a block-level div, otherwise an inline-block span. */
  block?: boolean;
}) {
  const highlightMode    = useChatbot((s) => s.highlightMode);
  const hovered          = useChatbot((s) => s.hoveredPrimitive);
  const setHovered       = useChatbot((s) => s.setHoveredPrimitive);

  if (!highlightMode) {
    return <>{children}</>;
  }

  const active = hovered === code;
  const ring = active
    ? 'outline outline-2 outline-amber-500 outline-offset-2 rounded-md bg-amber-50/40'
    : 'outline outline-1 outline-dashed outline-amber-300/70 outline-offset-2 rounded-md';

  const Tag = block ? 'div' : 'span';

  return (
    <Tag
      data-primitive={code}
      onMouseEnter={() => setHovered(code)}
      onMouseLeave={() => setHovered(null)}
      className={'relative transition-shadow ' + ring + (block ? '' : ' inline-block')}
    >
      {active && block && (
        <span className="absolute -top-4 left-0 z-10 inline-flex items-center h-4 px-1.5 rounded-sm bg-amber-500 text-white text-[10px] leading-none">
          {PRIMITIVES.find((p) => p.code === code)?.name ?? code}
        </span>
      )}
      {children}
    </Tag>
  );
}
