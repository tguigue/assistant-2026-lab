import type { ReactNode } from 'react';

export function PageShell({
  eyebrow,
  title,
  lede,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="px-8 py-8 max-w-[1024px] mx-auto">
      <header className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            {eyebrow && (
              <div className="t-micro text-zinc-500 mb-2">{eyebrow}</div>
            )}
            <h1 className="t-title-1 text-zinc-900 t-balance">{title}</h1>
            {lede && (
              <p className="t-large-regular text-zinc-500 t-pretty mt-2 max-w-prose">
                {lede}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

/** Section primitive used inside pages (sub-block separator). */
export function PageSection({
  eyebrow,
  title,
  hint,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={'border-t border-zinc-200 pt-8 mt-10 ' + (className ?? '')}>
      <header className="mb-5">
        {eyebrow && (
          <div className="t-micro text-zinc-500 mb-1.5">{eyebrow}</div>
        )}
        <h2 className="t-title-3 text-zinc-900">{title}</h2>
        {hint && (
          <p className="t-base-regular text-zinc-500 mt-1 max-w-prose">{hint}</p>
        )}
      </header>
      {children}
    </section>
  );
}
