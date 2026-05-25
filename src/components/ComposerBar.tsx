import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';

/**
 * The bottom composer — matches the real Doctrine Assistant screenshots:
 *   [textarea]
 *   [+] [🏛 Sources] [source chip — e.g. Sharepoint X]            [🎤] [↑]
 *
 * Source chips reflect the 7 parameters (Doctrine / KB / Clausier / Matter).
 */
export function ComposerBar() {
  const params = useChatbot((s) => s.comp.params);
  const [open, setOpen] = useState(false);

  const sources: { id: string; label: string; tone?: string }[] = [];
  if (params.doctrine) sources.push({ id: 'doctrine', label: 'Doctrine' });
  if (params.kb)       sources.push({ id: 'kb',       label: 'Sharepoint', tone: 'emerald' });
  if (params.clausier) sources.push({ id: 'clausier', label: 'Clausier' });
  if (params.matter !== 'none') sources.push({ id: 'matter', label: 'Affaire Leroy c/ Merlin' });

  return (
    <div className="relative">
      {/* The Sources dropdown — anchored above the composer */}
      {open && <SourcesDropdown onClose={() => setOpen(false)} />}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm px-4 py-3 hover:border-zinc-300 focus-within:border-zinc-900 transition-colors">
        <textarea
          className="w-full t-large-regular text-zinc-900 placeholder:text-zinc-400 outline-none resize-none bg-transparent leading-snug"
          rows={1}
          placeholder="Poser une question à l'IA, tapez @ pour référencer un document ou faire une action"
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-700 hover:border-zinc-400"
              title="Ajouter une source ou un fichier"
            >
              <Icon name="plus" className="size-4" />
            </button>

            <button className="inline-flex items-center gap-1.5 h-7 px-2 t-small-medium text-zinc-700 hover:bg-zinc-50 rounded">
              <Icon name="scales" className="size-3.5 text-zinc-500" />
              Sources
            </button>

            {/* Source chips inline */}
            {sources.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md bg-zinc-100 t-small-regular text-zinc-700"
              >
                <span
                  className={
                    'inline-flex items-center justify-center size-4 rounded text-white t-small-semibold ' +
                    (s.tone === 'emerald' ? 'bg-emerald-600' : 'bg-zinc-500')
                  }
                  style={{ fontSize: 9 }}
                >
                  {s.label[0]}
                </span>
                {s.label}
                <button className="text-zinc-400 hover:text-zinc-700">×</button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-600 hover:border-zinc-400"
              title="Voix"
            >
              <Mic />
            </button>
            <button
              className="inline-flex items-center justify-center size-7 rounded border border-zinc-200 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900"
              title="Envoyer"
            >
              <Icon name="arrow-up" className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mic() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

/* ----- Sources dropdown matching the user's real-product screenshots ----- */
function SourcesDropdown({ onClose }: { onClose: () => void }) {
  const params = useChatbot((s) => s.comp.params);
  const setParam = useChatbot((s) => s.setParam);

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute bottom-full left-0 mb-2 w-[320px] bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-20">
        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Sélectionner des fichiers</div>
        <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 text-left">
          <Icon name="paperclip" className="size-4 text-zinc-500" />
          <span className="flex-1 t-base-regular text-zinc-700">Importer des fichiers</span>
          <Icon name="chevron-right" className="size-3 text-zinc-400" />
        </button>

        <div className="border-t border-zinc-100" />

        <div className="px-4 pt-3 pb-2 t-small-regular text-zinc-500">Cibler une source</div>
        <SourceToggleRow
          name="Sharepoint"
          color="emerald"
          on={params.kb}
          onChange={() => setParam('kb', !params.kb)}
        />
        <SourceToggleRow
          name="Base de connaissance"
          color="zinc"
          on={params.clausier}
          onChange={() => setParam('clausier', !params.clausier)}
        />
        <SourceToggleRow
          name="Doctrine"
          color="blue"
          on={params.doctrine}
          onChange={() => setParam('doctrine', !params.doctrine)}
        />
        <div className="px-4 py-2 t-small-regular text-zinc-400 italic border-t border-zinc-100">
          Plus de connecteurs dans la configuration ⚙
        </div>
      </div>
    </>
  );
}

function SourceToggleRow({
  name, color, on, onChange,
}: {
  name: string; color: string; on: boolean; onChange: () => void;
}) {
  const bg = color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
             color === 'blue' ? 'bg-blue-100 text-blue-700' :
             'bg-zinc-100 text-zinc-700';
  return (
    <button onClick={onChange} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-zinc-50">
      <span className={'inline-flex items-center justify-center size-6 rounded ' + bg + ' t-small-semibold'}>
        {name[0]}
      </span>
      <span className="flex-1 t-base-regular text-zinc-700 text-left">{name}</span>
      <span
        className={
          'inline-flex w-9 h-5 rounded-full p-0.5 transition-colors ' +
          (on ? 'bg-blue-600 justify-end' : 'bg-zinc-200 justify-start')
        }
      >
        <span className="size-4 rounded-full bg-white" />
      </span>
    </button>
  );
}
