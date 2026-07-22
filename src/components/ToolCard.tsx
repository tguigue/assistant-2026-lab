import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Icon } from './ui';

/* ----------------------------------------------------------------------
   ToolCard — the ONE shell every tool primitive renders through: Tool output
   (A9: document, multi-doc, extract), Tool suggestion (A4) AND the Watcher
   creation surface (A10). It owns the chrome so it can't drift: border,
   header (leading slot + title + optional subtitle on the left, actions
   pinned top-right), body padding, and the optional footer. Nothing else
   re-creates this chrome.
   ---------------------------------------------------------------------- */
export function ToolCard({
  leading, eyebrow, title, subtitle, actions, children, bodyFlush = false, footer,
}: {
  leading?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  bodyFlush?: boolean;
  footer?: ReactNode;
}) {
  // Treat falsy children/footer (false from `cond && <…>`) as absent so the
  // shell never renders an empty body box or a dangling divider.
  const body = children == null || children === false ? null : children;
  const foot = footer == null || footer === false ? null : footer;
  const hasBelow = body != null || foot != null;
  return (
    <div className="sg-suggest rounded-md border border-zinc-200 bg-white overflow-hidden">
      {/* When there's content below, the header becomes a tinted band so it
          reads as a title bar over the content — not as the first list row. */}
      <div className={'sg-head flex items-start justify-between gap-3 px-4 py-3' + (hasBelow ? ' bg-zinc-50/70 border-b border-zinc-200' : '')}>
        <div className="flex items-start gap-2.5 min-w-0">
          {leading != null && <span className="shrink-0 mt-px">{leading}</span>}
          <div className="min-w-0">
            {eyebrow != null && <div className="flex items-center gap-1.5 mb-1">{eyebrow}</div>}
            <div className="t-base-semibold text-zinc-900 truncate">{title}</div>
            {subtitle != null && <p className="t-small-regular text-zinc-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions != null && <div className="sg-actions flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>
      {body != null && (bodyFlush ? body : <div className="px-4 py-3">{body}</div>)}
      {foot != null && <div className="border-t border-zinc-100">{foot}</div>}
    </div>
  );
}

// The leading icon in a ToolCard header: neutral, single size everywhere.
export function ToolIcon({ name }: { name: string }) {
  return <Icon name={name} className="size-4 text-zinc-500" />;
}

// Full-width text button that sits in a ToolCard footer ("Read more", "View all…").
export function CardFooterButton({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="w-full py-2.5 t-base-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50">
      {children}
    </button>
  );
}
