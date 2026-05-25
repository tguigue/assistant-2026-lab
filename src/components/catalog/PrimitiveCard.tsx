import { useState, type ReactNode } from 'react';

export type VariantTab = { id: string; label: string };

/**
 * Generic primitive card matching the user's screenshot:
 *  - Top-left: code (e.g. C7)
 *  - Name (bold sans)
 *  - Description (small gray)
 *  - Centered example showing the rendered primitive
 *  - Variant tabs below
 */
export function PrimitiveCard({
  code,
  name,
  description,
  variants,
  defaultVariantId,
  render,
}: {
  code: string;
  name: string;
  description: string;
  variants?: VariantTab[];
  defaultVariantId?: string;
  render: (variantId: string) => ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>(
    defaultVariantId ?? variants?.[0]?.id ?? 'default',
  );

  return (
    <article className="border border-zinc-200 rounded-xl bg-white overflow-hidden">
      <div className="px-7 pt-6 pb-2">
        <div className="t-mono t-small-medium text-zinc-400 mb-1">{code}</div>
        <h3 className="t-title-3 text-zinc-900 mb-1.5">{name}</h3>
        <p className="t-base-regular text-zinc-500 leading-relaxed max-w-prose">{description}</p>
      </div>

      <div className="px-7 py-10 flex items-center justify-center bg-white">
        <div className="w-full max-w-2xl flex items-center justify-center">
          {render(activeId)}
        </div>
      </div>

      {variants && variants.length > 0 && (
        <div className="px-7 pb-5 border-t border-zinc-100 pt-3 flex flex-wrap gap-4">
          {variants.map((v) => {
            const active = v.id === activeId;
            return (
              <button
                key={v.id}
                onClick={() => setActiveId(v.id)}
                className={
                  'pb-0.5 t-small-medium transition-colors ' +
                  (active
                    ? 'text-zinc-900 border-b border-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-700')
                }
              >
                {v.label}
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}
