import { useState } from 'react';
import { Button, IconButtonV2 } from '@doctrinelegal/design-system/button';
import { TabList, Tab } from '@doctrinelegal/design-system/navigation';
import { useChatbot } from '../chatbot/store';
import { Icon } from './ui';

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
const SOURCES_TREE: TreeNode[] = [
  {
    id: 'juridictions', name: 'Juridictions',
    children: [
      { id: 'j1', name: 'Tribunal judiciaire / TGI' },
      { id: 'j2', name: 'Tribunal de commerce / TAE' },
      { id: 'j3', name: "Cour d'appel" },
      { id: 'j4', name: 'Tribunal administratif' },
      { id: 'j5', name: 'Cour de cassation' },
      { id: 'j6', name: "Cour administrative d'appel" },
    ],
  },
  {
    id: 'codes', name: 'Codes',
    children: [
      { id: 'cd1', name: 'Code civil' },
      { id: 'cd2', name: 'Code de commerce' },
      { id: 'cd3', name: 'Code de déontologie des architectes' },
      { id: 'cd4', name: 'Code de justice administrative' },
      { id: 'cd5', name: 'Code de justice militaire (nouveau)' },
      { id: 'cd6', name: 'Code de la commande publique' },
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
  const close = useChatbot((s) => s.setContextPicker);
  const apply = useApplyContext();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => close(null)} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[560px] max-w-[92vw] bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
          <SharePointGlyph className="size-6" />
          <h2 className="flex-1 t-title-4 text-zinc-900">Parcourir SharePoint</h2>
          <IconButtonV2 iconName="close" size="small" onClick={() => close(null)} ariaLabel="Fermer" />
        </div>

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

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-100 bg-zinc-50/60">
          <span className="t-small-regular text-zinc-500">
            {selected ? '1 site sélectionné' : 'Aucun fichier sélectionné'}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="medium" onClick={() => close(null)}>Annuler</Button>
            <Button variant="primary" size="medium" disabled={!selected} onClick={() => apply('sharepoint')}>Sélectionner</Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ====================================================================== */
/*  Knowledge base / Matters — right drawer with a checkbox tree          */
/* ====================================================================== */
const CLAUSIER_TREE: TreeNode[] = [
  {
    id: 'cla-baux', name: 'Baux commerciaux',
    children: [
      { id: 'cla-baux-1', name: 'Clause de résiliation — Modèle A',     format: 'DOCX' },
      { id: 'cla-baux-2', name: 'Clause de loyer indexé',               format: 'DOCX' },
      { id: 'cla-baux-3', name: 'Clause de non-concurrence — Modèle B', format: 'DOCX' },
    ],
  },
  {
    id: 'cla-cdi', name: 'Contrats de travail',
    children: [
      { id: 'cla-cdi-1', name: 'CDI cadre dirigeant — clause de mobilité', format: 'DOCX' },
      { id: 'cla-cdi-2', name: 'Clause de confidentialité standard',       format: 'DOCX' },
      { id: 'cla-cdi-3', name: 'Clause de non-sollicitation post-contrat',  format: 'DOCX' },
    ],
  },
  {
    id: 'cla-sas', name: "Pactes d'associés",
    children: [
      { id: 'cla-sas-1', name: 'Pacte SAS — Clause de sortie conjointe',   format: 'DOCX' },
      { id: 'cla-sas-2', name: 'Clause de préemption',                     format: 'DOCX' },
      { id: 'cla-sas-3', name: 'Clause anti-dilution',                     format: 'DOCX' },
    ],
  },
  {
    id: 'cla-prest', name: 'Contrats de prestation',
    children: [
      { id: 'cla-prest-1', name: 'Clause de propriété intellectuelle — Modèle C', format: 'DOCX' },
      { id: 'cla-prest-2', name: 'Clause de garantie — version étendue',          format: 'DOCX' },
    ],
  },
  { id: 'cla-misc', name: 'Modèles transverses', children: [] },
];

const DRAWER_META = {
  sources:  { title: 'Sources',                    tree: SOURCES_TREE,  tabs: null,                                                footer: 'Appliquer',           source: null as string | null,        defaultOpen: true },
  kb:       { title: 'Bases de connaissances',     tree: KB_TREE,       tabs: ['Toutes', 'Bases personnelles', 'Bases du cabinet'], footer: 'Ajouter au contexte', source: 'kb' as string | null,        defaultOpen: false },
  matters:  { title: 'Matters',                    tree: MATTERS_TREE,  tabs: null,                                                footer: 'Ajouter au contexte', source: 'matter' as string | null,    defaultOpen: false },
  clausier: { title: 'Clausier — Modèles partagés', tree: CLAUSIER_TREE, tabs: ['Toutes', 'Mes modèles', 'Modèles du cabinet'],     footer: 'Ajouter au contexte', source: 'clausier' as string | null,  defaultOpen: true  },
} as const;

function TreeDrawer({ kind }: { kind: 'sources' | 'kb' | 'matters' | 'clausier' }) {
  const meta = DRAWER_META[kind];
  const close = useChatbot((s) => s.setContextPicker);
  const apply = useApplyContext();
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
  const overlayClass = isModal ? 'fixed inset-0 bg-black/30 z-40' : 'fixed inset-0 bg-black/20 z-40';
  const shellClass = isModal
    ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[640px] max-w-[94vw] max-h-[80vh] bg-white rounded-2xl border border-zinc-200 shadow-xl flex flex-col overflow-hidden'
    : 'fixed top-0 right-0 h-screen w-[480px] max-w-[94vw] bg-white border-l border-zinc-200 shadow-xl z-50 flex flex-col';

  return (
    <>
      <div className={overlayClass} onClick={() => close(null)} />
      <aside className={shellClass}>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <h2 className="flex-1 t-h2-semibold text-zinc-900">{meta.title}</h2>
          <IconButtonV2 iconName="close" size="small" onClick={() => close(null)} ariaLabel="Fermer" />
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-zinc-200 bg-zinc-50">
            <Icon name="search" className="size-4 text-zinc-400" />
            <input
              placeholder="Rechercher un matter ou fichier..."
              className="flex-1 bg-transparent outline-none t-base-regular text-zinc-800 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {meta.tabs && (
          <div className="px-5 pb-3">
            <TabList>
              {meta.tabs.map((t, i) => (
                <Tab key={t} tabIndex={String(i)} selected={tab === i} onClick={() => setTab(i)} size="small">
                  {t}
                </Tab>
              ))}
            </TabList>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-4">
          {meta.tree.map((node) => (
            <TreeRow key={node.id} node={node} depth={0} checked={checked} onToggle={toggle} defaultOpen={meta.defaultOpen} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-100 bg-white">
          <span className="t-small-regular text-zinc-500">
            {count > 0 ? `${count} élément${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}` : 'Aucun élément sélectionné'}
          </span>
          <Button variant="primary" size="medium" disabled={count === 0} onClick={onApply}>{meta.footer}</Button>
        </div>
      </aside>
    </>
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

        <button onClick={() => onToggle(node.id)} className="flex items-center gap-2.5 flex-1 min-w-0 py-1.5 text-left">
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

      {isFolder && open && node.children!.map((child) => (
        <TreeRow key={child.id} node={child} depth={depth + 1} checked={checked} onToggle={onToggle} defaultOpen={defaultOpen} />
      ))}
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
