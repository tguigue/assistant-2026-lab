import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../chatbot/store';
import { PRIMITIVES_BY_CODE } from '../dashboard/primitiveDefs';
import { Icon } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * C8 — Conversation header.
 * Always visible above the composer. The variant encodes the matter scope:
 *   - 'idle' (default) — conversation title + share + options menu
 *   - any matter id    — same chrome + a matter chip on the left to signal scope
 *
 * canHide is false in primitiveDefs so the dashboard checkbox is hidden.
 */

const CONVERSATION_TITLE = 'Conversation du 1ᵉʳ juin';

// Per-matter color tint (same visual language as ComposerBar avatars).
const C8_MATTER_TINTS: Record<string, string> = {
  'leroy-merlin': 'bg-gradient-to-br from-sky-300 to-blue-400',
  moreau:         'bg-gradient-to-br from-emerald-200 to-cyan-300',
  aurelia:        'bg-gradient-to-br from-indigo-300 to-violet-400',
  'acme-corp':    'bg-gradient-to-br from-amber-200 to-orange-300',
  pernod:         'bg-gradient-to-br from-fuchsia-300 to-pink-300',
};

function MatterDot({ id, size = 'sm' }: { id: string; size?: 'sm' | 'md' }) {
  const tint = C8_MATTER_TINTS[id] ?? 'bg-zinc-200';
  const cls = size === 'md' ? 'size-3.5' : 'size-2.5';
  return <span className={'inline-block rounded-full shrink-0 ' + cls + ' ' + tint} />;
}

export function ConversationHeader() {
  const visible  = useChatbot((s) => s.primitives.C8.visible);
  const variant  = useChatbot((s) => s.primitives.C8.variant);
  const setVariant = useChatbot((s) => s.setPrimitiveVariant);

  const [menuOpen, setMenuOpen] = useState(false);
  const [matterSubOpen, setMatterSubOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const subTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setMatterSubOpen(false);
      }
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  if (!visible) return null;

  const isMatter = variant !== 'idle';
  const allVariants = PRIMITIVES_BY_CODE.C8.variants;
  const matterMeta = isMatter ? allVariants.find((v) => v.id === variant) : null;
  const matterName = matterMeta?.name?.replace(/^Scoped — /, '') ?? '';
  const matterVariants = allVariants.filter((v) => v.id !== 'idle');

  const openSub = () => { if (subTimer.current) clearTimeout(subTimer.current); setMatterSubOpen(true); };
  const closeSubSoon = () => { if (subTimer.current) clearTimeout(subTimer.current); subTimer.current = setTimeout(() => setMatterSubOpen(false), 150); };

  return (
    <PrimitiveSlot code="C8" block>
      <div className="px-5 py-2.5 border-b border-zinc-100 bg-white flex items-center gap-3 t-small-regular">
        {/* Title */}
        <span className="t-small-regular text-zinc-700 truncate">{CONVERSATION_TITLE}</span>

        {/* Matter chip — only when scoped */}
        {isMatter && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-zinc-200 bg-zinc-50 t-small-medium text-zinc-700">
            <MatterDot id={variant} />
            <span className="truncate max-w-[200px]">{matterName.replace(/^Scoped — /, '')}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          {/* Share */}
          <button
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md t-small-medium text-zinc-700 hover:bg-zinc-100"
            title="Partager la conversation"
          >
            <Icon name="upload" className="size-3.5" />
            <span className="hidden sm:inline">Partager</span>
          </button>

          {/* Options menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center size-7 rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              title="Options"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
                <circle cx="5"  cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="19" cy="12" r="1.6" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-visible z-30 py-1">
                <MenuItem icon="pen" label="Renommer" />

                {isMatter ? (
                  <MenuItem
                    icon="x"
                    label="Détacher du matter"
                    onClick={() => { setVariant('C8', 'idle'); setMenuOpen(false); }}
                  />
                ) : (
                  <div className="relative" onMouseEnter={openSub} onMouseLeave={closeSubSoon}>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 text-left text-zinc-700">
                      <Icon name="folder" className="size-3.5 text-zinc-500" />
                      <span className="flex-1 t-base-regular">Associer à un matter</span>
                      <Icon name="chevron-right" className="size-3 text-zinc-400" />
                    </button>
                    {matterSubOpen && (
                      <div className="absolute right-full top-0 mr-1 w-60 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-40 py-1">
                        <MenuItem icon="plus" label="Nouveau matter" />
                        <div className="border-t border-zinc-100 my-1" />
                        {matterVariants.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setVariant('C8', m.id); setMenuOpen(false); setMatterSubOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 text-left text-zinc-700"
                          >
                            <MatterDot id={m.id} size="md" />
                            <span className="t-base-regular truncate">{m.name.replace(/^Scoped — /, '')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-zinc-100 my-1" />
                <MenuItem icon="x" label="Supprimer" danger />
              </div>
            )}
          </div>
        </div>
      </div>
    </PrimitiveSlot>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={
        'w-full flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 text-left ' +
        (danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700')
      }
    >
      <Icon name={icon} className={'size-3.5 ' + (danger ? 'text-red-500' : 'text-zinc-500')} />
      <span className="t-base-regular">{label}</span>
    </button>
  );
}
