import { useEffect, useRef, useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Icon, cn } from './ui';
import { PrimitiveSlot } from './PrimitiveSlot';

/**
 * E5 — Feature promotion. How the composer ADVERTISES what the Assistant can
 * do. Seven forms, one at a time (the lab compares them):
 *
 *   banner      — dismissible "Nouveau" announcement above the composer
 *   video       — a demo card below the composer + a fake player modal
 *   tour        — coachmarks spotlighting the REAL composer controls
 *   placeholder — the input itself advertises capabilities (rotating)
 *   tips        — a "Le saviez-vous ?" one-liner under the composer
 *   checklist   — getting-started checklist with progress
 *   badges      — a "Nouveau" pill pinned on one composer control
 *
 * The `feature` axis picks WHAT is advertised where a single feature is
 * featured (banner / video / badges). Mounts: EmptyState (banner, below-
 * composer forms), ComposerBar (placeholder + badges, via hooks), Chatbot
 * (tour + video player overlays).
 */

/* ------------------------------------------------------------------ *
 * Featured-feature copy (single-feature forms: banner, video, badges)
 * ------------------------------------------------------------------ */
type FeatureId = 'veilles' | 'actions' | 'dossiers' | 'sources';

const FEATURES: Record<FeatureId, {
  icon: string; title: string; desc: string; cta: string;
  /** Which composer control a "Nouveau" badge pins to. */
  badgeTarget: 'actions' | 'sources' | 'folder';
}> = {
  veilles: {
    icon: 'bell',
    title: 'Créez des veilles depuis l’Assistant',
    desc: 'Les recherches effectuées pour vous répondre peuvent devenir des veilles — nouvelles décisions et évolutions législatives, chaque semaine.',
    cta: 'Découvrir',
    badgeTarget: 'actions',
  },
  actions: {
    icon: 'bolt',
    title: 'Des actions spécialisées pour vos documents',
    desc: 'Extraire, comparer, traduire, analyser — des outils dédiés, à un clic du composer.',
    cta: 'Voir les actions',
    badgeTarget: 'actions',
  },
  dossiers: {
    icon: 'folder',
    title: 'Des conversations scopées à vos dossiers',
    desc: 'Choisissez un dossier : analyses, documents et échanges restent au même endroit, partagés avec l’équipe.',
    cta: 'Choisir un dossier',
    badgeTarget: 'folder',
  },
  sources: {
    icon: 'database',
    title: 'L’Assistant branché sur vos sources',
    desc: 'SharePoint, Drive, bases de connaissance : des réponses fondées sur vos propres documents.',
    cta: 'Connecter une source',
    badgeTarget: 'sources',
  },
};

/* ------------------------- store plumbing ------------------------- */
function usePromo() {
  const e5 = useChatbot((s) => s.primitives.E5);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const content = Array.isArray(e5.content) ? e5.content : [];
  const feature = (e5.axisVariants?.feature ?? 'veilles') as FeatureId;
  return {
    visible: e5.visible,
    variant: e5.variant,
    feature,
    f: FEATURES[feature],
    videoOpen: content.includes('video-open'),
    openVideo: () => { if (!content.includes('video-open')) toggleContent('E5', 'video-open'); },
    closeVideo: () => { if (content.includes('video-open')) toggleContent('E5', 'video-open'); },
    dismiss: () => setVisible('E5', false),
  };
}

/* ================================================================== *
 * 1 · BANNER — a quiet announcement strip above the composer.
 * ================================================================== */
export function PromoBanner() {
  const d = usePromo();
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  if (!d.visible || d.variant !== 'banner') return null;
  // CTAs open the real surface when one exists in the lab.
  const onCta =
    d.feature === 'actions' ? () => setActionPickerOpen(true)
    : d.feature === 'sources' ? () => setContextPicker('sources')
    : undefined;
  return (
    <PrimitiveSlot code="E5" block>
      <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 pl-3 pr-2 py-2.5">
        <span className="inline-flex items-center h-5 px-2 rounded-full bg-zinc-900 text-white text-[10px] font-semibold tracking-wide shrink-0">
          Nouveau
        </span>
        <p className="flex-1 min-w-0 t-base-regular text-zinc-700 truncate">
          <span className="t-base-medium text-zinc-900">{d.f.title}</span>
          <span className="hidden sm:inline"> — {d.f.desc}</span>
        </p>
        <button onClick={onCta} className="shrink-0 inline-flex items-center gap-1 t-base-medium text-zinc-900 hover:text-zinc-600">
          {d.f.cta}
          <Icon name="arrow-right" className="size-3 text-inherit" />
        </button>
        <button onClick={d.dismiss} className="shrink-0 size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700" title="Fermer">
          <Icon name="x" className="size-3.5" />
        </button>
      </div>
    </PrimitiveSlot>
  );
}

/* ================================================================== *
 * 2 · VIDEO — a demo card below the composer; play opens the player.
 * ================================================================== */
function VideoCard() {
  const d = usePromo();
  return (
    <div className="flex items-stretch gap-4 rounded-xl border border-zinc-200 bg-white p-3 hover:shadow-sm transition-shadow">
      {/* Poster — a miniature of the product, not a stock thumbnail. */}
      <button
        onClick={d.openVideo}
        className="group relative w-[220px] shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 text-left"
        title="Voir la démo"
      >
        {/* Mini composer mock inside the poster */}
        <div className="absolute inset-x-5 top-5 rounded-md bg-white/95 px-2.5 py-2">
          <div className="h-1.5 w-2/3 rounded-full bg-zinc-300" />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-zinc-200" />
        </div>
        <div className="absolute inset-x-5 top-[52px] flex gap-1">
          <span className="h-4 flex-1 rounded bg-white/25" />
          <span className="h-4 flex-1 rounded bg-white/25" />
          <span className="h-4 flex-1 rounded bg-white/25" />
        </div>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid place-items-center size-10 rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
            <Icon name="play" className="size-5 text-zinc-900 translate-x-px" />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">2:04</span>
        <span className="block pt-[52%]" />
      </button>
      <div className="min-w-0 flex flex-col py-1">
        <span className="t-small-medium text-zinc-500 mb-1">Démo · 2 min</span>
        <p className="t-base-semibold text-zinc-900">{FEATURES[d.feature].title}</p>
        <p className="t-small-regular text-zinc-500 mt-1 line-clamp-2">{FEATURES[d.feature].desc}</p>
        <div className="mt-auto pt-2 flex items-center gap-3">
          <button onClick={d.openVideo} className="inline-flex items-center gap-1.5 t-base-medium text-zinc-900 hover:text-zinc-600">
            <Icon name="play" className="size-3.5 text-inherit" />
            Voir la démo
          </button>
          <button onClick={d.dismiss} className="t-base-medium text-zinc-400 hover:text-zinc-600">Plus tard</button>
        </div>
      </div>
    </div>
  );
}

/* The fake player modal — chapters advertise the feature bundle. */
const VIDEO_CHAPTERS = [
  { t: '0:00', label: 'Poser une question juridique' },
  { t: '0:32', label: 'Joindre vos documents' },
  { t: '1:04', label: 'Lancer une action spécialisée' },
  { t: '1:38', label: 'Créer une veille depuis une recherche' },
];

export function PromoVideoModal() {
  const d = usePromo();
  const [playing, setPlaying] = useState(false);
  if (!d.visible || !d.videoOpen) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={d.closeVideo} />
      <div className="relative w-full max-w-[640px] bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100">
          <h2 className="t-title-4 text-zinc-900">Découvrir l’Assistant</h2>
          <button onClick={d.closeVideo} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>

        {/* Screen — inert 16:9 with a play toggle + a progress bar that runs. */}
        <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-950">
          <span className="block pt-[56%]" />
          <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 grid place-items-center group">
            {!playing && (
              <span className="grid place-items-center size-14 rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
                <Icon name="play" className="size-7 text-zinc-900 translate-x-0.5" />
              </span>
            )}
          </button>
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <div className="h-1 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-[width] ease-linear"
                style={{ width: playing ? '100%' : '0%', transitionDuration: playing ? '124s' : '0s' }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-white/80">
              <span>{playing ? 'Lecture…' : 'En pause'}</span>
              <span>2:04</span>
            </div>
          </div>
        </div>

        {/* Chapters — the feature bundle, scannable without watching. */}
        <div className="px-3 py-2">
          {VIDEO_CHAPTERS.map((c) => (
            <button key={c.t} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-zinc-50">
              <span className="t-small-medium text-zinc-400 w-8 shrink-0 font-mono">{c.t}</span>
              <span className="t-base-regular text-zinc-800">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * 3 · TOUR — coachmarks over the REAL composer controls.
 * Targets are tagged with data-tour attributes in ComposerBar; missing
 * targets (compact surface, hidden primitive) are skipped at runtime.
 * ================================================================== */
const TOUR_STEPS = [
  { target: 'input',   title: 'Demandez, en langage courant',   desc: 'Recherche, analyse, rédaction — une seule zone pour tout demander à l’Assistant.' },
  { target: 'attach',  title: 'Joignez vos documents',           desc: 'Contrats, conclusions, pièces — jusqu’à 128 documents d’un coup. L’Assistant travaille dessus.' },
  { target: 'sources', title: 'Choisissez vos sources',          desc: 'Doctrine + vos espaces (SharePoint, Drive, bases de connaissance) : les réponses citent ce que vous validez.' },
  { target: 'actions', title: 'Lancez une action spécialisée',   desc: 'Extraire, comparer, traduire, analyser — des outils dédiés, prêts à l’emploi.' },
  { target: 'folder',  title: 'Scopez à un dossier',             desc: 'La conversation rejoint le dossier : analyses et documents partagés avec votre équipe.' },
];

export function PromoTour() {
  const d = usePromo();
  const active = d.visible && d.variant === 'tour';
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Keep only the steps whose target actually exists on the canvas.
  const steps = TOUR_STEPS.filter((s) => document.querySelector(`[data-tour="${s.target}"]`));
  const cur = steps[Math.min(step, Math.max(0, steps.length - 1))];

  useEffect(() => { if (active) setStep(0); }, [active]);

  useEffect(() => {
    if (!active || !cur) { setRect(null); return; }
    const measure = () => {
      const el = document.querySelector(`[data-tour="${cur.target}"]`);
      const root = rootRef.current;
      if (!el || !root) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      const c = root.getBoundingClientRect();
      setRect({ x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active, cur?.target]);

  if (!active || !cur) return null;
  const last = step >= steps.length - 1;
  const PAD = 6;

  return (
    // overflow-hidden clips the spotlight's huge box-shadow to the canvas.
    <div ref={rootRef} className="absolute inset-0 z-50 overflow-hidden">
      {rect && (
        <>
          {/* Spotlight — transparent hole, the shadow dims everything else. */}
          <div
            className="absolute rounded-xl transition-all duration-300"
            style={{
              left: rect.x - PAD, top: rect.y - PAD, width: rect.w + PAD * 2, height: rect.h + PAD * 2,
              boxShadow: '0 0 0 9999px rgba(24,24,27,0.45)',
            }}
          />
          {/* Step card — below the spotlight, clamped to the canvas. */}
          <div
            className="absolute w-[340px] max-w-[calc(100%-24px)] rounded-xl bg-white shadow-xl border border-zinc-200 p-4 transition-all duration-300"
            style={{
              left: Math.max(12, Math.min(rect.x, (rootRef.current?.clientWidth ?? 800) - 360)),
              top: rect.y + rect.h + 16,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="t-small-medium text-zinc-400">{step + 1} sur {steps.length}</span>
              <button onClick={d.dismiss} className="size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Quitter la visite">
                <Icon name="x" className="size-3.5" />
              </button>
            </div>
            <p className="t-base-semibold text-zinc-900">{cur.title}</p>
            <p className="t-small-regular text-zinc-500 mt-1">{cur.desc}</p>
            <div className="mt-3 flex items-center justify-between">
              {/* Progress dots */}
              <span className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <span key={i} className={cn('size-1.5 rounded-full transition-colors', i === step ? 'bg-zinc-900' : 'bg-zinc-200')} />
                ))}
              </span>
              <span className="flex items-center gap-2">
                {step > 0 && (
                  <button onClick={() => setStep((s) => s - 1)} className="h-7 px-2.5 rounded-md t-base-medium text-zinc-600 hover:bg-zinc-100">
                    Précédent
                  </button>
                )}
                <button
                  onClick={() => (last ? d.dismiss() : setStep((s) => s + 1))}
                  className="h-7 px-3 rounded-md bg-zinc-900 text-white t-base-medium hover:bg-zinc-800"
                >
                  {last ? 'Terminer' : 'Suivant'}
                </button>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ================================================================== *
 * 4 · PLACEHOLDER — the input itself advertises, rotating. Hook used
 * by ComposerBar's InputCard (the text renders in the composer).
 * ================================================================== */
const PLACEHOLDER_ADS = [
  'Demandez : « Compare ces deux contrats de bail »',
  'Demandez : « Mes arguments tiennent-ils face aux écritures adverses ? »',
  'Demandez : « Rédige une clause de non-concurrence équilibrée »',
  'Créez une veille : cherchez, puis « Suivre cette recherche »',
  'Demandez : « Traduis ce contrat en anglais juridique »',
];

export function usePlaceholderAd(): string | null {
  const e5 = useChatbot((s) => s.primitives.E5);
  const active = e5.visible && e5.variant === 'placeholder';
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((x) => x + 1), 3500);
    return () => clearInterval(t);
  }, [active]);
  if (!active) return null;
  return PLACEHOLDER_ADS[i % PLACEHOLDER_ADS.length];
}

/* ================================================================== *
 * 5 · TIPS — one rotating "Le saviez-vous ?" line under the composer.
 * ================================================================== */
const TIPS = [
  'Le trombone accepte jusqu’à 128 documents d’un coup — l’Assistant les traite ensemble.',
  'Vos recherches peuvent devenir des veilles : demandez, puis « Suivre cette recherche ».',
  'L’Assistant peut répondre uniquement depuis vos sources internes (SharePoint, bases de connaissance).',
  'Scopez un dossier : toute l’équipe retrouve les analyses au même endroit.',
];

function Tips() {
  const [i, setI] = useState(0);
  const tip = TIPS[((i % TIPS.length) + TIPS.length) % TIPS.length];
  return (
    <div className="flex items-center gap-2.5 px-1">
      <Icon name="sparkles" className="size-3.5 text-zinc-500 shrink-0" />
      <p key={i} className="flex-1 min-w-0 t-small-regular text-zinc-500 truncate detect-rise">
        <span className="t-small-medium text-zinc-600">Le saviez-vous ?</span> {tip}
      </p>
      <span className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => setI((x) => x - 1)} className="size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Astuce précédente">
          <Icon name="chevron-right" className="size-3 rotate-180" />
        </button>
        <button onClick={() => setI((x) => x + 1)} className="size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Astuce suivante">
          <Icon name="chevron-right" className="size-3" />
        </button>
      </span>
    </div>
  );
}

/* ================================================================== *
 * 6 · CHECKLIST — getting started, with progress. "Essayer" opens the
 * real surface when the lab has one.
 * ================================================================== */
function Checklist() {
  const d = usePromo();
  const setFilesModalOpen = useChatbot((s) => s.setFilesModalOpen);
  const setActionPickerOpen = useChatbot((s) => s.setActionPickerOpen);
  const [done, setDone] = useState<Record<string, boolean>>({ ask: true });
  const items = [
    { id: 'ask',     label: 'Poser votre première question',            try: undefined },
    { id: 'import',  label: 'Importer un document',                     try: () => setFilesModalOpen(true) },
    { id: 'action',  label: 'Lancer une action (extraire, comparer…)',  try: () => setActionPickerOpen(true) },
    { id: 'veille',  label: 'Créer une veille depuis une recherche',    try: undefined },
  ];
  const count = items.filter((it) => done[it.id]).length;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <p className="t-base-semibold text-zinc-900">Bien démarrer avec l’Assistant</p>
          <p className="t-small-regular text-zinc-400">{count} sur {items.length}</p>
        </div>
        <button onClick={d.dismiss} className="size-6 grid place-items-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" title="Masquer">
          <Icon name="x" className="size-3.5" />
        </button>
      </div>
      <div className="mx-4 h-1 rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full rounded-full bg-zinc-900 transition-all duration-300" style={{ width: `${(count / items.length) * 100}%` }} />
      </div>
      <div className="mt-1 pb-1">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 group">
            <button
              onClick={() => setDone((s) => ({ ...s, [it.id]: !s[it.id] }))}
              className={cn(
                'grid place-items-center size-4.5 w-[18px] h-[18px] rounded-full border transition-colors shrink-0',
                done[it.id] ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 hover:border-zinc-500',
              )}
              title={done[it.id] ? 'Fait' : 'Marquer comme fait'}
            >
              {done[it.id] && <Icon name="check" className="size-2.5 text-white" />}
            </button>
            <span className={cn('flex-1 min-w-0 t-base-regular truncate', done[it.id] ? 'text-zinc-400 line-through' : 'text-zinc-800')}>
              {it.label}
            </span>
            {it.try && !done[it.id] && (
              <button onClick={it.try} className="shrink-0 t-small-medium text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-900 transition-opacity">
                Essayer →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== *
 * 7 · BADGES — a "Nouveau" pill pinned on ONE composer control (the
 * feature axis picks which). Hook used by ComposerBar.
 * ================================================================== */
export function useNewBadge(target: 'actions' | 'sources' | 'folder'): boolean {
  const e5 = useChatbot((s) => s.primitives.E5);
  if (!e5.visible || e5.variant !== 'badges') return false;
  const feature = (e5.axisVariants?.feature ?? 'veilles') as FeatureId;
  return FEATURES[feature].badgeTarget === target;
}

export function NewBadge() {
  return (
    <span className="ml-0.5 inline-flex items-center h-4 px-1.5 rounded-full bg-blue-600 text-white text-[9px] font-semibold tracking-wide">
      Nouveau
    </span>
  );
}

/* ================================================================== *
 * 8 · HEADLINE — the empty-state hero itself advertises, rotating
 * capability statements in place of the greeting. Hook used by
 * EmptyState's <h1>.
 * ================================================================== */
const HEADLINE_ADS = [
  'Comparez deux contrats en un message.',
  'Vos recherches deviennent des veilles.',
  'Des réponses fondées sur VOS documents.',
  'Rédigez plus vite, avec vos modèles.',
];

export function useHeadlineAd(): string | null {
  const e5 = useChatbot((s) => s.primitives.E5);
  const active = e5.visible && e5.variant === 'headline';
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setI((x) => x + 1), 4000);
    return () => clearInterval(t);
  }, [active]);
  if (!active) return null;
  return HEADLINE_ADS[i % HEADLINE_ADS.length];
}

/* ================================================================== *
 * 9 · HOVER PREVIEWS — hovering an "Actions rapides" card shows a
 * miniature of what the action PRODUCES, before any click. The minis
 * are drawn (bars/cells), not screenshots — they read as sketches of
 * the output shape. Hook + popover used by EmptyState's action cards.
 * ================================================================== */
export function useHoverPreviews(): boolean {
  const e5 = useChatbot((s) => s.primitives.E5);
  return e5.visible && e5.variant === 'preview';
}

const bar = (w: string, tone = 'bg-zinc-200') => <span className={`block h-1.5 rounded-full ${tone} ${w}`} />;

const MINI_PREVIEWS: Record<string, { caption: string; node: React.ReactNode }> = {
  extraire: {
    caption: 'Un tableau structuré, extrait de vos documents',
    node: (
      <div className="rounded-md border border-zinc-200 overflow-hidden">
        <div className="grid grid-cols-3 gap-px bg-zinc-100 p-1">{bar('w-8', 'bg-zinc-300')}{bar('w-6', 'bg-zinc-300')}{bar('w-7', 'bg-zinc-300')}</div>
        <div className="grid grid-cols-3 gap-px p-1 border-t border-zinc-100">{bar('w-7')}{bar('w-5')}{bar('w-8')}</div>
        <div className="grid grid-cols-3 gap-px p-1 border-t border-zinc-100">{bar('w-6')}{bar('w-8')}{bar('w-5')}</div>
      </div>
    ),
  },
  comparer: {
    caption: 'Les divergences, côte à côte',
    node: (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-md border border-zinc-200 p-1.5 space-y-1">{bar('w-10')}{bar('w-8', 'bg-red-200')}{bar('w-9')}</div>
        <div className="rounded-md border border-zinc-200 p-1.5 space-y-1">{bar('w-10')}{bar('w-9', 'bg-emerald-200')}{bar('w-7')}</div>
      </div>
    ),
  },
  traduire: {
    caption: 'La traduction, structure conservée',
    node: (
      <div className="flex items-center gap-1.5">
        <div className="flex-1 rounded-md border border-zinc-200 p-1.5 space-y-1"><span className="text-[9px] font-semibold text-zinc-400">FR</span>{bar('w-full')}{bar('w-3/4')}</div>
        <Icon name="arrow-right" className="size-3 text-zinc-500 shrink-0" />
        <div className="flex-1 rounded-md border border-zinc-200 p-1.5 space-y-1"><span className="text-[9px] font-semibold text-zinc-400">EN</span>{bar('w-full')}{bar('w-2/3')}</div>
      </div>
    ),
  },
  analyser: {
    caption: 'Les points d’attention, surlignés',
    node: <div className="rounded-md border border-zinc-200 p-1.5 space-y-1">{bar('w-full')}{bar('w-5/6', 'bg-amber-200')}{bar('w-3/4')}{bar('w-4/6', 'bg-amber-200')}</div>,
  },
  'nouveau-doc': {
    caption: 'Un premier brouillon structuré',
    node: <div className="rounded-md border border-zinc-200 p-1.5 space-y-1">{bar('w-1/2', 'bg-zinc-300')}{bar('w-full')}{bar('w-5/6')}{bar('w-full')}</div>,
  },
  'modifier-doc': {
    caption: 'Des modifications à valider une par une',
    node: <div className="rounded-md border border-zinc-200 p-1.5 space-y-1">{bar('w-full')}{bar('w-4/6', 'bg-blue-200')}{bar('w-5/6')}</div>,
  },
  sources: {
    caption: 'Chaque source vérifiée, une par une',
    node: (
      <div className="rounded-md border border-zinc-200 p-1.5 space-y-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center gap-1.5"><Icon name="check" className="size-2.5 text-emerald-600 shrink-0" />{bar(i === 1 ? 'w-3/4' : 'w-5/6')}</span>
        ))}
      </div>
    ),
  },
  exemples: {
    caption: 'Des requêtes prêtes à adapter',
    node: (
      <div className="space-y-1">
        <div className="w-4/5 rounded-lg rounded-bl-sm bg-zinc-100 p-1.5">{bar('w-5/6', 'bg-zinc-300')}</div>
        <div className="w-4/5 ml-auto rounded-lg rounded-br-sm bg-zinc-900/90 p-1.5">{bar('w-4/6', 'bg-zinc-500')}</div>
      </div>
    ),
  },
};

export function ActionHoverPreview({ id }: { id: string }) {
  const p = MINI_PREVIEWS[id];
  if (!p) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-xl border border-zinc-200 bg-white shadow-lg p-2.5 opacity-0 translate-y-1 group-hover/pv:opacity-100 group-hover/pv:translate-y-0 transition-all duration-150 z-20">
      {p.node}
      <p className="mt-2 t-small-regular text-zinc-500 leading-snug">{p.caption}</p>
    </div>
  );
}

/* ================================================================== *
 * 10 · "NOUVEAUTÉS" — a what's-new panel sliding over the canvas from
 * the right: dated releases, each teaching one feature. Mounted in
 * Chatbot (overlay level), active while the variant is selected.
 * ================================================================== */
const RELEASES = [
  { date: 'Juillet 2026', tag: 'Nouveau',  icon: 'bell',     title: 'Veilles depuis l’Assistant',  desc: 'Les recherches effectuées pour vous répondre deviennent des veilles — alerte hebdomadaire par e-mail.' },
  { date: 'Juin 2026',    tag: 'Nouveau',  icon: 'bolt',     title: 'Actions spécialisées',        desc: 'Extraire, comparer, traduire, analyser — des outils dédiés à vos documents, depuis le composer.' },
  { date: 'Mai 2026',     tag: 'Amélioré', icon: 'folder',   title: 'Dossiers partagés',           desc: 'Les conversations scopées à un dossier sont visibles par toute l’équipe, avec leurs analyses.' },
  { date: 'Avril 2026',   tag: 'Nouveau',  icon: 'database', title: 'Connecteur SharePoint',       desc: 'Des réponses fondées sur vos espaces internes, citées document par document.' },
];

export function PromoWhatsNew() {
  const d = usePromo();
  if (!d.visible || d.variant !== 'whatsnew') return null;
  return (
    <div className="absolute inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={d.dismiss} />
      <aside className="absolute right-0 inset-y-0 w-[380px] max-w-full bg-white border-l border-zinc-200 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-zinc-100 shrink-0">
          <h2 className="t-title-4 text-zinc-900">Nouveautés</h2>
          <button onClick={d.dismiss} className="size-7 grid place-items-center rounded-md text-zinc-500 hover:bg-zinc-100" title="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-5">
          {RELEASES.map((r) => (
            <article key={r.title}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="t-small-regular text-zinc-400">{r.date}</span>
                <span className={cn(
                  'inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-semibold tracking-wide',
                  r.tag === 'Nouveau' ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-600',
                )}>
                  {r.tag}
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="grid place-items-center size-7 rounded-lg bg-zinc-100 shrink-0 mt-px">
                  <Icon name={r.icon} className="size-3.5 text-zinc-500" />
                </span>
                <div className="min-w-0">
                  <p className="t-base-semibold text-zinc-900">{r.title}</p>
                  <p className="t-small-regular text-zinc-500 mt-0.5">{r.desc}</p>
                  <button className="mt-1 inline-flex items-center gap-1 t-small-medium text-zinc-900 hover:text-zinc-600">
                    Essayer
                    <Icon name="arrow-right" className="size-2.5 text-inherit" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

/* ------------------- below-composer mount (EmptyState) ------------------- */
export function PromoBelow() {
  const d = usePromo();
  if (!d.visible) return null;
  if (d.variant !== 'video' && d.variant !== 'tips' && d.variant !== 'checklist') return null;
  return (
    <PrimitiveSlot code="E5" block>
      {d.variant === 'video' && <VideoCard />}
      {d.variant === 'tips' && <Tips />}
      {d.variant === 'checklist' && <Checklist />}
    </PrimitiveSlot>
  );
}
