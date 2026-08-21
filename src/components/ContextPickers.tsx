import { useState } from 'react';
import { useChatbot } from '../chatbot/store';
import { Button, Icon, Modal } from './ui';
import { useNarrowOverlay } from './SurfaceScope';

/* ----------------------------------------------------------------------
   Context pickers — faithful reproduction of Doctrine's connector browsers.
   SharePoint = centered modal; Knowledge base + Matters = right drawers.
   Mounted once at the app root; driven by store.contextPicker.
   ---------------------------------------------------------------------- */

type Format = 'PDF' | 'DOCX' | 'XLSX';
type TreeNode = {
  id: string;
  name: string;
  format?: Format;
  children?: TreeNode[];
  /** Optional section header rendered above this node (top level only). */
  section?: string;
  /** Crop the child list to the first N rows (a "Voir les N autres" row reveals
   *  the rest). Keeps long corpora (juridictions, codes…) from pushing the
   *  other categories below the fold. */
  cap?: number;
};

const FORMAT_STYLE: Record<Format, string> = {
  PDF:  'text-red-600',
  DOCX: 'text-blue-600',
  XLSX: 'text-emerald-600',
};

/* ---- Knowledge base tree ---- */
const KB_TREE: TreeNode[] = [
  {
    id: 'memos', name: 'Mémos',
    children: [
      {
        id: 'memos-travail', name: 'Droit du travail',
        children: [
          { id: 'm1', name: 'Mémo – Licenciement pour faute grave', format: 'PDF' },
          { id: 'm2', name: 'Mémo – Clause de non-concurrence', format: 'DOCX' },
          { id: 'm3', name: 'Mémo – Rupture conventionnelle', format: 'PDF' },
        ],
      },
      {
        id: 'memos-societes', name: 'Droit des sociétés',
        children: [
          { id: 'm4', name: 'Mémo – Responsabilité des dirigeants', format: 'PDF' },
          { id: 'm5', name: 'Mémo – Fusion-absorption', format: 'DOCX' },
        ],
      },
      { id: 'm6', name: 'Mémo – Procédure collective', format: 'PDF' },
    ],
  },
  { id: 'prejudice', name: 'Préjudice corporel', children: [] },
  { id: 'conclusions', name: 'Jeux de conclusions', children: [] },
  { id: 'modeles', name: 'Modèles de contrats', children: [] },
  { id: 'fiches', name: 'Fiches pratiques', children: [] },
];

/* ---- Client matters tree ---- */
const MATTERS_TREE: TreeNode[] = [
  {
    id: 'pernod', name: 'Affaire Pernod Ricard',
    children: [
      {
        id: 'pernod-contrats', name: 'Contrats',
        children: [
          { id: 'c1', name: "Convention d'animation Pernod Ricard 2024", format: 'PDF' },
          { id: 'c2', name: "Avenant n°1 – Convention d'animation", format: 'DOCX' },
          { id: 'c3', name: "Contrat d'agence de distribution – Modèle", format: 'DOCX' },
        ],
      },
      {
        id: 'pernod-reg', name: 'Réglementation',
        children: [
          { id: 'r1', name: 'Loi Galland – Extraits applicables', format: 'PDF' },
          { id: 'r2', name: 'Règlement UE n°330-2010 – Distribution sélective', format: 'PDF' },
          { id: 'r3', name: "Note jurisprudentielle – Conventions d'animation", format: 'DOCX' },
        ],
      },
      {
        id: 'pernod-corr', name: 'Correspondance',
        children: [
          { id: 'co1', name: 'Email – Négociation clause exclusivité', format: 'PDF' },
          { id: 'co2', name: 'Courrier distributeur – Acceptation conditions', format: 'PDF' },
          { id: 'co3', name: 'Analyse concurrentielle – Pratiques du secteur', format: 'XLSX' },
        ],
      },
    ],
  },
  { id: 'acme', name: 'Matter ACME CORP', children: [] },
  { id: 'evil', name: 'Matter EVIL CORP', children: [] },
  { id: 'pernod-v', name: 'Pernod c/ Ricard', children: [] },
  { id: 'coca', name: 'Coca c/ Cola', children: [] },
  { id: 'angel', name: 'Matter ANGEL CORP', children: [] },
];

/* ---- Sources institutionnelles (Doctrine corpus) tree ---- */
/* Which sections have somewhere to manage, and what to open. "Sources Doctrine"
   has none — it is Doctrine's corpus, not yours to reorganise. */
const MANAGE: Record<string, { icon: string; open: 'connectors' | 'library' } | undefined> = {
  'Ma bibliothèque': { icon: 'database', open: 'library' },
  'Mes connecteurs': { icon: 'apps',     open: 'connectors' },
};

const SOURCES_TREE: TreeNode[] = [
  // SharePoint first — connected drive at the top.
  {
    section: 'Mes connecteurs',
    id: 'sp-root', name: 'SharePoint',
    children: [
      { id: 'sp-juridique', name: 'Juridique - Corporate' },
      { id: 'sp-rh',        name: 'Ressources Humaines' },
      { id: 'sp-finance',   name: 'Direction Financière' },
    ],
  },
  // Your own materials — a different provenance from a connected drive, and a
  // different place to manage them, so a section of their own.
  {
    section: 'Ma bibliothèque',
    id: 'kb-root', name: 'Bases de connaissances',
    children: KB_TREE,
  },
  {
    section: 'Sources Doctrine',
    id: 'juridictions', name: 'Juridictions', cap: 3,
    children: [
      { id: 'j1', name: 'Tribunal judiciaire / TGI' },
      { id: 'j2', name: 'Tribunal de commerce / TAE' },
      { id: 'j3', name: "Cour d'appel" },
      { id: 'j4', name: 'Tribunal administratif' },
      { id: 'j5', name: 'Cour de cassation' },
      { id: 'j6', name: "Cour administrative d'appel" },
      { id: 'j7', name: "Conseil d'État" },
      { id: 'j8', name: 'Conseil constitutionnel' },
      { id: 'j9', name: "Cour de justice de l'UE (CJUE)" },
    ],
  },
  {
    id: 'codes', name: 'Codes', cap: 3,
    children: [
      { id: 'cd1', name: 'Code civil' },
      { id: 'cd2', name: 'Code de commerce' },
      { id: 'cd3', name: 'Code du travail' },
      { id: 'cd4', name: 'Code pénal' },
      { id: 'cd5', name: 'Code de procédure civile' },
      { id: 'cd6', name: 'Code de la consommation' },
      { id: 'cd7', name: 'Code général des impôts' },
      { id: 'cd8', name: 'Code de la commande publique' },
      { id: 'cd9', name: 'Code de la propriété intellectuelle' },
    ],
  },
  {
    id: 'fiscal', name: 'Le Fiscal',
  },
  {
    id: 'clausier', name: 'Clausier', cap: 3,
    children: [
      { id: 'cl1', name: 'Clauses de confidentialité' },
      { id: 'cl2', name: 'Clauses de non-concurrence' },
      { id: 'cl3', name: 'Clauses limitatives de responsabilité' },
      { id: 'cl4', name: 'Clauses de résiliation' },
      { id: 'cl5', name: 'Clauses de force majeure' },
      { id: 'cl6', name: 'Clauses de propriété intellectuelle' },
      { id: 'cl7', name: 'Clauses pénales' },
    ],
  },
];

/* ---- SharePoint sites (modal) ---- */
const SP_SITES = [
  { id: 'sp-juridique', name: 'Juridique - Corporate', count: 3 },
  { id: 'sp-rh',        name: 'Ressources Humaines',   count: 2 },
  { id: 'sp-finance',   name: 'Direction Financière',  count: 1 },
];

/* ====================================================================== */

export function ContextPickers() {
  const picker = useChatbot((s) => s.contextPicker);
  if (!picker) return null;
  if (picker === 'sharepoint') return <SharePointModal />;
  return <TreeDrawer kind={picker} />;
}

/* ---- shared helpers ---- */
function useApplyContext() {
  const toggleContent = useChatbot((s) => s.togglePrimitiveContent);
  const setVisible = useChatbot((s) => s.setPrimitiveVisible);
  const setContextPicker = useChatbot((s) => s.setContextPicker);
  const content = useChatbot((s) => s.primitives.C6.content);
  const active = Array.isArray(content) ? content : [];
  return (sourceId: string) => {
    if (!active.includes(sourceId)) toggleContent('C6', sourceId);
    setVisible('C6', true);
    setContextPicker(null);
  };
}

/* ====================================================================== */
/*  SharePoint — centered modal                                           */
/* ====================================================================== */
function SharePointModal() {
  const narrow = useNarrowOverlay();
  const close = useChatbot((s) => s.setContextPicker);
  const apply = useApplyContext();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Modal
      title="Parcourir SharePoint"
      leading={<SharePointGlyph className="size-6" />}
      onClose={() => close(null)}
      width="max-w-[560px]"
      narrow={narrow}
      footerLeft={
        <span className="t-small-regular text-zinc-500">
          {selected ? '1 site sélectionné' : 'Aucun fichier sélectionné'}
        </span>
      }
      footerRight={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" onClick={() => close(null)}>Annuler</Button>
          <Button variant="solid" size="md" disabled={!selected} onClick={() => apply('sharepoint')}>
            Sélectionner
          </Button>
        </div>
      }
    >
      <div className="px-5 pt-3 pb-1 t-small-medium text-zinc-500">Sites</div>
        <ul className="px-2 pb-2">
          {SP_SITES.map((site) => (
            <li key={site.id}>
              <button
                onClick={() => setSelected(site.id)}
                className={
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ' +
                  (selected === site.id ? 'bg-zinc-100' : 'hover:bg-zinc-50')
                }
              >
                <Icon name="folder" className="size-4 text-blue-500 shrink-0" />
                <span className="flex-1 t-base-regular text-zinc-900">{site.name}</span>
                <span className="t-small-regular text-zinc-400">{site.count} élément{site.count > 1 ? 's' : ''}</span>
                <Icon name="chevron-right" className="size-3.5 text-zinc-400" />
              </button>
            </li>
          ))}
        </ul>

    </Modal>
  );
}

/* ====================================================================== */
/*  Knowledge base / Matters — right drawer with a checkbox tree          */
/* ====================================================================== */
const DRAWER_META = {
  sources:  { title: 'Sources',                    tree: SOURCES_TREE,  tabs: null,                                                footer: 'Appliquer',           source: null as string | null,        defaultOpen: true },
  kb:       { title: 'Bases de connaissances',     tree: KB_TREE,       tabs: ['Toutes', 'Bases personnelles', 'Bases du cabinet'], footer: 'Ajouter au contexte', source: 'kb' as string | null,        defaultOpen: false },
  matters:  { title: 'Matters',                    tree: MATTERS_TREE,  tabs: null,                                                footer: 'Ajouter au contexte', source: 'matter' as string | null,    defaultOpen: false },
} as const;

function TreeDrawer({ kind }: { kind: 'sources' | 'kb' | 'matters' }) {
  const narrow = useNarrowOverlay();
  const meta = DRAWER_META[kind];
  const close = useChatbot((s) => s.setContextPicker);
  const apply = useApplyContext();
  const setConnectorsBrowserOpen = useChatbot((s) => s.setConnectorsBrowserOpen);
  const setLibraryManagerOpen = useChatbot((s) => s.setLibraryManagerOpen);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState(0);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const count = checked.size;
  const onApply = () => (meta.source ? apply(meta.source) : close(null));

  // Sources stays as a right-side drawer; Matters and KB open as centered modals.
  const isModal = kind === 'kb' || kind === 'matters';
  const [query, setQuery] = useState('');
  const TAB_IDS = ['all', 'perso', 'cabinet'] as const;

  return (
    <Modal
      as={isModal ? 'modal' : 'drawer'}
      title={meta.title}
      onClose={() => close(null)}
      width={isModal ? 'max-w-[640px]' : 'w-[480px]'}
      narrow={narrow}
      search={kind !== 'sources' ? { value: query, onChange: setQuery } : undefined}
      tabs={meta.tabs ? {
        value: TAB_IDS[tab],
        onChange: (v: typeof TAB_IDS[number]) => setTab(TAB_IDS.indexOf(v)),
        options: meta.tabs.map((label, i) => ({ value: TAB_IDS[i], label })),
      } : undefined}
      footerLeft={
        <span className="t-small-regular text-zinc-500">
          {count > 0 ? `${count} élément${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}` : 'Aucun élément sélectionné'}
        </span>
      }
      footerRight={
        <Button variant="solid" size="md" disabled={count === 0} onClick={onApply}>
          {meta.footer}
        </Button>
      }
    >
      <div className="px-3 py-2">

          {meta.tree.map((node, i) => (
            <div key={node.id}>
              {node.section && (
                <div className={'flex items-center justify-between gap-2 pl-3 pr-1 pb-1.5 ' + (i === 0 ? 'pt-1' : 'pt-5')}>
                  <span className="t-small-medium text-zinc-500">{node.section}</span>
                  {/* One affordance, one verb, per section that has somewhere to
                      manage. Deliberately a quiet pill rather than a blue link:
                      a link reads as navigation OUT, and leaving the picker
                      mid-selection to go reorganise a library loses the session.
                      These open OVER the picker instead. */}
                  {MANAGE[node.section] && (
                    <button
                      onClick={MANAGE[node.section]!.open === 'connectors'
                        ? () => setConnectorsBrowserOpen(true)
                        : () => setLibraryManagerOpen(true)}
                      className="inline-flex items-center gap-1 h-6 px-2 rounded-full t-small-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    >
                      <Icon name={MANAGE[node.section]!.icon} className="size-3" />
                      Gérer
                    </button>
                  )}
                </div>
              )}
              <TreeRow node={node} depth={0} checked={checked} onToggle={toggle} defaultOpen={meta.defaultOpen} />
            </div>
          ))}
        </div>
    </Modal>
  );
}

function TreeRow({
  node, depth, checked, onToggle, defaultOpen,
}: {
  node: TreeNode;
  depth: number;
  checked: Set<string>;
  onToggle: (id: string) => void;
  defaultOpen: boolean;
}) {
  const isFolder = !!node.children;
  // Top-level folders open when the drawer opts in (e.g. Sources); deeper levels stay collapsed.
  const [open, setOpen] = useState(defaultOpen && depth === 0);
  // Long child lists are cropped to `node.cap` until "Voir les N autres" is clicked.
  const [showAll, setShowAll] = useState(false);
  const kids = node.children ?? [];
  const cropped = node.cap != null && !showAll && kids.length > node.cap;
  const shownKids = cropped ? kids.slice(0, node.cap) : kids;

  return (
    <>
      <div
        className="flex items-center gap-2 rounded-md hover:bg-zinc-50 group"
        style={{ paddingLeft: depth * 20 + 4 }}
      >
        {isFolder ? (
          <button onClick={() => setOpen((v) => !v)} className="size-5 grid place-items-center text-zinc-400 shrink-0">
            <Icon name="chevron-right" className={'size-3 transition-transform ' + (open ? 'rotate-90' : '')} />
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <button onClick={() => onToggle(node.id)} className="flex items-center gap-2.5 flex-1 min-w-0 py-2 text-left">
          <span className={
            'size-4 rounded border shrink-0 inline-flex items-center justify-center ' +
            (checked.has(node.id) ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-300 bg-white')
          }>
            {checked.has(node.id) && (
              <Icon name="check" className="size-2.5 text-white" />
            )}
          </span>
          <Icon name={isFolder ? 'folder' : 'file-text'} className={'size-4 shrink-0 ' + (isFolder ? 'text-zinc-400' : 'text-zinc-400')} />
          <span className="flex-1 min-w-0 truncate t-base-regular text-zinc-800">{node.name}</span>
        </button>

        {node.format ? (
          <span className={'shrink-0 mr-1 t-mono text-[10px] font-semibold tracking-wide ' + FORMAT_STYLE[node.format]}>{node.format}</span>
        ) : null}
      </div>

      {isFolder && open && (
        <>
          {shownKids.map((child) => (
            <TreeRow key={child.id} node={child} depth={depth + 1} checked={checked} onToggle={onToggle} defaultOpen={defaultOpen} />
          ))}
          {cropped && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-2 py-1.5 t-small-medium text-zinc-500 hover:text-zinc-800"
              style={{ paddingLeft: (depth + 1) * 20 + 4 }}
            >
              <span className="w-5 shrink-0 grid place-items-center"><Icon name="plus" className="size-3.5" /></span>
              Voir les {kids.length - node.cap!} autres
            </button>
          )}
        </>
      )}
    </>
  );
}

/* SharePoint source glyph (Material) */
function SharePointGlyph({ className }: { className?: string }) {
  return (
    <span className={'inline-grid place-items-center rounded ' + (className ?? '')}>
      <Icon name="cloud" className="size-full text-[#036C70]" />
    </span>
  );
}
