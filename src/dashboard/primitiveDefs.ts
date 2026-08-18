/**
 * Primitive definitions.
 *
 * Each primitive has:
 *   - one flat list of variants (visual + content combined where applicable)
 *   - a default variant id
 *   - a default visibility (a primitive that's `defaultVisible: false`
 *     starts unchecked in the dashboard)
 *
 * Visibility is a separate axis from variant. No `hidden` option inside the
 * variant list — the checkbox in the dashboard turns the primitive on/off.
 */

import type { ViewMode, Surface } from '../chatbot/store';

export type PrimitiveCode =
  | 'E3' | 'E4' | 'E5' | 'E6'
  | 'C2' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9' | 'C12' | 'C13' | 'C14' | 'C15'
  | 'A0' | 'A1' | 'A2' | 'A4' | 'A7' | 'A8' | 'A9' | 'A10'
  | 'D2' | 'D3' | 'D4';

export type Variant = { id: string; name: string };

export type ContentDef =
  | { multiSelect?: false; defaultId: string; defaultIds?: never; variants: Variant[] }
  // In React terms these boolean toggles are all `props` (caller config) by
  // default. Two escape hatches move an item into the `state` group instead:
  //   - `stateIds`   — genuine RUNTIME state (e.g. "running") the component owns.
  //   - `previewIds` — LAB/preview affordances (e.g. "pin the menu open"): a
  //                    state forced for design, not real product behaviour.
  //                    Rendered under `state` with an `@lab` sub-label.
  | { multiSelect: true;  defaultIds: string[]; defaultId?: never; variants: Variant[]; previewIds?: string[]; stateIds?: string[] };

export type PrimitiveDef = {
  code: PrimitiveCode;
  /** Plain-language label — the name designers & PMs read on the canvas/panel. */
  name: string;
  /** The design-system (Astryx / Meta) component this maps to, in React
   *  PascalCase (e.g. `FileInput`). Code-level metadata only — NOT rendered in
   *  the UI (the panel shows the plain `name`). Kept as documentation of the
   *  DS mapping; several primitives can share one component (e.g. `ChatToolCalls`). */
  component?: string;
  blurb: string;
  /** WHICH MOMENTS the panel lists this primitive in. Omitted = every moment.
   *  This is the ONLY moment gate — the `code` prefix is a stable id, not a group.
   *  Rule: list it in every moment where toggling it changes the canvas FOR THAT
   *  MOMENT'S SUBJECT. The composer bar is `['empty']` because during the Answer
   *  moment the bar is chrome, not the subject; C8's header and the C13/C14/C15
   *  modals omit it because they genuinely change in — or over — both. */
  views?: ViewMode[];
  /** WHICH SURFACES it's listed on. Omitted = every surface. */
  surfaces?: Surface[];
  variants: Variant[];
  defaultVariantId: string;
  defaultVisible: boolean;
  /** Declared here but not drawn on the canvas yet: the row shows a quiet `todo`
   *  badge so an empty canvas reads as intentional, not broken. Delete the flag
   *  in the commit that lands the renderer. */
  todo?: boolean;
  /** Always-on chrome (not a configurable primitive) — hidden from the design panel. */
  chrome?: boolean;
  /** Optional secondary content-axis variants. */
  content?: ContentDef;
  /** Optional EXTRA visual variant axes (radio), beyond the primary `variants`.
   *  Each renders as its own "design variant" block in the sidebar. Used when a
   *  primitive has several independent design choices (e.g. A1: running
   *  indicator + reasoning-finished marker). Keyed so the store can hold one
   *  selection per axis. */
  axes?: {
    key: string;
    label: string;
    /** `prop` (default) = caller config → grouped under `props`.
     *  `state` = genuine runtime state (e.g. usage/modal status) → under `state`. */
    kind?: 'prop' | 'state';
    defaultVariantId: string;
    variants: Variant[];
  }[];
};

export const PRIMITIVES: PrimitiveDef[] = [

  // ============ Composer ============
  {
    code: 'C8', name: 'Conversation header', component: 'ChatLayout', surfaces: ['fullscreen'],
    blurb: 'Conversation header above the composer — title + share + options menu (Renommer / Associer à un matter / Supprimer). Always visible. Matter scope is the variant.',
    defaultVariantId: 'idle',
    defaultVisible: true,
    variants: [
      { id: 'idle',         name: 'Conversation (no matter)' },
      { id: 'leroy-merlin', name: 'Scoped — Leroy c/ Merlin' },
      { id: 'moreau',       name: 'Scoped — Moreau c/ SAS Aurelia' },
      { id: 'aurelia',      name: 'Scoped — Aurelia — Politique RH' },
      { id: 'acme-corp',    name: 'Scoped — Matter ACME Corp' },
      { id: 'pernod',       name: 'Scoped — Pernod Ricard' },
    ],
  },
  {
    code: 'C2', name: 'Mode selector', component: 'SegmentedControl', views: ['empty'],
    blurb: 'Conversation mode inside the composer. Switch = fast Éditer on/off (default on). Segmented = the available modes as a control. The agent infers intent, so this is opt-in; the modes shown are the content states.',
    defaultVariantId: 'switch',
    defaultVisible: false,
    variants: [
      { id: 'switch',    name: 'Switch' },
      { id: 'segmented', name: 'Segmented' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['edit'],
      variants: [
        { id: 'search',  name: 'Search' },
        { id: 'edit',    name: 'Edit' },
        { id: 'analyse', name: 'Analyze' },
      ],
    },
  },
  {
    code: 'C5', name: 'Imported files', component: 'FileInput', views: ['empty'],
    blurb: 'THE uploaded-set knob. "set" = what the user uploaded (drives the composer cards, the Import manager list, AND the Document-actions detection — one source of truth). The bar always shows cards; overflow collapses into "Afficher tout".',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Cards (name + format tag)' },
    ],
    axes: [
      {
        key: 'set',
        label: 'files',
        defaultVariantId: 'pack',
        variants: [
          { id: 'contract',    name: 'Single contract' },
          { id: 'ndas',        name: '2 NDAs (same type)' },
          { id: 'pack',        name: 'Mixed pack (5)' },
          { id: 'bulk',        name: 'Volume (128)' },
          { id: 'conclusions', name: 'Conclusions' },
        ],
      },
    ],
  },
  {
    code: 'C14', name: 'Import manager', component: 'Dialog',
    blurb: 'The "Vos documents" modal behind "Afficher tout" — manages the uploaded set: file list, count, Valider. It reads the SAME set from C5 (no own state). Opens via "Afficher tout", or toggle this primitive visible to preview it.',
    defaultVariantId: 'modal',
    defaultVisible: false,
    variants: [
      { id: 'modal', name: 'Modal' },
    ],
  },
  {
    code: 'C15', name: 'Connecteurs', component: 'Dialog',
    blurb: 'Catalogue d\'apps à connecter — GED, e-mail & agenda, sources juridiques, outils. Opened from the Sources panel ("+ Connecteurs"); search + category filter, one grid of cards. Each card is a toggle. `connection` is runtime state on the CONNECTED cards only: a live connector can have expired, hold a partial perimeter, be mid-sync, or be installed by an admin and not yours to disconnect — an integration that is only ever "on" hides every way it actually fails. Toggle this primitive visible to preview it.',
    defaultVariantId: 'modal',
    defaultVisible: false,
    variants: [
      { id: 'modal', name: 'Modal' },
    ],
    axes: [
      {
        // A connection is in exactly one state. It applies ONLY to the cards that
        // are actually connected — twenty catalogue cards all reading "expirée"
        // would be nonsense.
        key: 'auth',
        label: 'connection',
        kind: 'state',
        defaultVariantId: 'ok',
        variants: [
          { id: 'ok',      name: 'Connected' },
          { id: 'expired', name: 'Authorisation expired' },
          { id: 'partial', name: 'Partial scope' },
          { id: 'syncing', name: 'Syncing' },
          { id: 'managed', name: 'Installed by the admin' },
        ],
      },
    ],
  },
  {
    code: 'C12', name: 'Reasoning level', component: 'DropdownMenu', views: ['empty'],
    blurb: 'Composer-footer effort/usage control (a dropdown). Combine features freely: Show usage % (adds the live consumption bar + reset time to the control), Full list (the model picker vs the simple Défaut/Maximum). Usage status (Normal / Near / Reached) is a radio since they\'re mutually exclusive. Usage is shown as a percentage with a reset time — no credits, tokens or price.',
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Dropdown' },
    ],
    axes: [
      {
        // Mutually exclusive — you can't be normal AND near AND over the limit.
        key: 'status',
        label: 'status',
        kind: 'state',
        defaultVariantId: 'normal',
        variants: [
          { id: 'normal',  name: 'Normal' },
          { id: 'near',    name: 'Near limit' },
          { id: 'reached', name: 'Limit reached' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['full-list'],
      previewIds: ['open'],
      variants: [
        { id: 'usage-meter', name: 'Show usage %' },
        { id: 'full-list',   name: 'Full model list' },
        { id: 'open',        name: 'Keep open' },
      ],
    },
  },
  {
    code: 'C13', name: 'Reasoning level (modal)', component: 'Dialog',
    blurb: 'The next-step surface opened from the budget CTA. What it offers depends on WHO opened it (radio): a Solo lawyer self-serves a plan upgrade; a Firm member can\'t pay and requests more from their admin; an Admin / legal dept manages seat credits & billing. Usage anchors the top; the action below is role-specific. Modal status (Normal / Limit reached / Request sent) is the one-at-a-time radio. Default off; enabling it (or the C12 CTA) opens it over the canvas.',
    defaultVariantId: 'default',
    defaultVisible: false,
    variants: [
      { id: 'default', name: 'Modal' },
    ],
    axes: [
      {
        // WHO opened the modal decides what they can do — mutually exclusive.
        key: 'role',
        label: 'role',
        defaultVariantId: 'solo',
        variants: [
          { id: 'solo',   name: 'Solo lawyer (self-serve)' },
          { id: 'member', name: 'Firm member (asks admin)' },
          { id: 'admin',  name: 'Admin / legal dept (billing)' },
        ],
      },
      {
        // The modal is in exactly one status at a time — mutually exclusive.
        key: 'status',
        label: 'status',
        kind: 'state',
        defaultVariantId: 'normal',
        variants: [
          { id: 'normal',   name: 'Normal' },
          { id: 'blocking', name: 'Limit reached' },
          { id: 'sent',     name: 'Request sent' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['open'],
      previewIds: ['open'],
      variants: [
        { id: 'open', name: 'Keep open' },
      ],
    },
  },
  {
    code: 'C7', name: 'Snapshot', component: 'Banner', views: ['empty'],
    blurb: 'Excerpt selected from the left document to narrow context. Hint-banner style above the composer, with an "Améliorer" action.',
    defaultVariantId: 'banner',
    defaultVisible: false,
    variants: [
      { id: 'banner', name: 'Hint — Banner' },
    ],
  },
  {
    code: 'C6', name: 'Context', component: 'Tokenizer', views: ['empty'],
    blurb: 'The "+" attach-file button (opens "Vos documents") + the chips for picked context. Always-on chrome — not a configurable/hideable primitive.',
    defaultVariantId: 'default',
    defaultVisible: true,
    chrome: true,
    variants: [
      { id: 'default', name: 'Default' },
    ],
    content: {
      multiSelect: true,
      // Nothing attached by default — context chips appear only for what the
      // user actually picks via the + popover (SharePoint included).
      defaultIds: [],
      variants: [
        // Mixed model:
        //   - Whole-source toggles (SharePoint is on/off as a source).
        //   - Specific picks (a matter, a KB, a file) that the user would cherry-pick
        //     through the + popover. Listed here as canonical demo items.
        { id: 'sharepoint',     name: 'SharePoint (source)' },
        { id: 'matter-moreau',  name: 'Matter — Moreau c/ SAS Aurelia' },
        { id: 'kb-mises',       name: 'KB — Mises en demeure' },
        { id: 'file',           name: 'File — Conclusions_def.pdf' },
      ],
    },
  },
  {
    code: 'C9', name: 'Matters', component: 'Selector', views: ['empty'],
    blurb: 'Folder (matter) scope above the composer. Picking one scopes the conversation (activates the Conversation Header matter scope). OPTIONAL — matterless research is a first-class flow. "picker" labels the affordance ("Choisir un dossier") + recent folders; "create" is the empty state for a user with no folders yet, nudging them to create one.',
    defaultVariantId: 'picker',
    defaultVisible: true,
    variants: [
      { id: 'picker', name: '“Choisir un dossier” + recents' },
      { id: 'create', name: 'No folder yet — “Créer un dossier”' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['leroy-merlin', 'moreau', 'aurelia', 'acme-corp', 'pernod'],
      variants: [
        { id: 'leroy-merlin', name: 'Leroy c/ Merlin' },
        { id: 'moreau',       name: 'Moreau c/ SAS Aurelia' },
        { id: 'aurelia',      name: 'Aurelia — Politique RH' },
        { id: 'acme-corp',    name: 'Matter ACME Corp' },
        { id: 'pernod',       name: 'Pernod Ricard' },
      ],
    },
  },

  // ============ Empty State ============
  {
    code: 'E3', name: 'Suggested actions', component: 'ChatToolCalls', views: ['empty'],
    blurb: 'Tool launchers in the empty composer — pick a tool BEFORE prompting. "source" = where the list comes from: curated (hand-picked), detected (derived from the C5 uploaded set), folder (the selected dossier), or firm — the playbooks the cabinet itself authored, which is where an answer saved via A7 “Enregistrer comme action” lands. Firm is deliberately NOT treated as a smart source: playbooks are written by people, so faking the sparkle “analyse” would be a lie about where they came from. Auto-activates in DETECTED mode when "Imported files" (C5) is turned on — the upload is what triggers the intelligence. Content = which curated tools show.',
    defaultVariantId: 'verbose',
    defaultVisible: true,
    variants: [
      { id: 'verbose', name: 'Cards with descriptions' },
    ],
    axes: [
      {
        key: 'source',
        label: 'source',
        defaultVariantId: 'curated',
        variants: [
          { id: 'curated',  name: 'Curated (hand-picked)' },
          { id: 'detected', name: 'Detected (from C5 upload)' },
          { id: 'folder',   name: 'Folder (from selected dossier)' },
          { id: 'firm',     name: 'Firm (playbooks du cabinet)' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      // Defaults work from a blank slate (no document attached yet).
      defaultIds: ['nouveau-doc', 'modifier-doc', 'exemples', 'sources'],
      variants: [
        { id: 'nouveau-doc',  name: 'Nouveau document' },
        { id: 'modifier-doc', name: 'Modifier un document' },
        { id: 'exemples',     name: 'Exemples de prompt' },
        { id: 'sources',      name: 'Détecter les sources citées' },
        { id: 'extraire',     name: 'Extraire' },
        { id: 'traduire',     name: 'Traduire' },
        { id: 'analyser',     name: 'Analyser' },
        { id: 'comparer',     name: 'Comparer' },
      ],
    },
  },
  {
    code: 'E5', name: 'Feature promotion', component: 'Banner', views: ['empty'],
    blurb: 'How the composer ADVERTISES what the Assistant can do — seven forms to compare, one at a time (radio): Banner (a dismissible "Nouveau" announcement above the composer), Video (a demo card + fake player modal), Tour (coachmarks that spotlight the real composer controls, step by step), Placeholder (the input itself advertises capabilities, rotating), Tips ("Le saviez-vous ?" one-liner under the composer), Checklist (getting-started with progress), Badges ("Nouveau" pill on a composer control). The `feature` axis picks WHAT is advertised where a single feature is featured (banner / video / badges): veilles, actions, dossiers, or sources. Off by default — promotion is additive chrome, not the product.',
    defaultVariantId: 'banner',
    defaultVisible: false,
    variants: [
      { id: 'banner',      name: 'Banner — “Nouveau” announcement' },
      { id: 'video',       name: 'Video — demo card + player' },
      { id: 'tour',        name: 'Tour — coachmarks on the composer' },
      { id: 'placeholder', name: 'Placeholder — the input advertises' },
      { id: 'headline',    name: 'Headline — the hero advertises' },
      { id: 'tips',        name: 'Tips — “Le saviez-vous ?”' },
      { id: 'checklist',   name: 'Checklist — getting started' },
      { id: 'badges',      name: 'Badges — “Nouveau” on a control' },
      { id: 'preview',     name: 'Hover previews — on Actions rapides' },
      { id: 'whatsnew',    name: '“Nouveautés” — what’s new panel' },
    ],
    axes: [
      {
        // WHICH feature is featured (single-feature forms only).
        key: 'feature',
        label: 'feature',
        defaultVariantId: 'veilles',
        variants: [
          { id: 'veilles',  name: 'Veilles depuis l’Assistant' },
          { id: 'actions',  name: 'Actions spécialisées' },
          { id: 'dossiers', name: 'Dossiers (conversations scopées)' },
          { id: 'sources',  name: 'Sources connectées (SharePoint…)' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      previewIds: ['video-open'],
      variants: [
        { id: 'video-open', name: 'Video player open' },
      ],
    },
  },
  {
    code: 'E4', name: 'History', component: 'List', views: ['empty'],
    blurb: 'Quick access to recent items (conversations, documents, matters).',
    defaultVariantId: 'list',
    defaultVisible: false,
    variants: [
      { id: 'list', name: 'Compact list' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['conversations'],
      variants: [
        { id: 'conversations', name: 'Recent conversations' },
        { id: 'documents',     name: 'Recent documents' },
        { id: 'matters',       name: 'Recent matters' },
      ],
    },
  },
  {
    code: 'E6', name: 'Activity', component: 'List', views: ['empty'],
    blurb: 'Activity feed for the matter — recent prompts/actions by the team, each with its artifact and date.',
    defaultVariantId: 'feed',
    defaultVisible: false,
    variants: [
      { id: 'feed', name: 'Feed' },
    ],
  },

  // ============ Response ============
  {
    code: 'A0', name: 'Ask user question', component: 'ChatSystemMessage', views: ['full'],
    blurb: 'Human-in-the-loop question docked above the composer. ONE card design (generous, app-consistent: pagination, question, numbered options, Autre + Passer). The Example radio picks WHICH question is asked — content, not forme: document edit (Oui/Non), clarifying choice, sources pre-check, tool choice (the options ARE tools), output preview (a snippet of what a tool WOULD produce), a memory write (the options are C18\'s three scopes verbatim — a preference is remembered for you, the cabinet, or this dossier alone, never ambiguously), or a write action (the agent is about to act OUTSIDE the chat — save to the GED, send a courrier, pose an échéance — so the card carries the payload it is about to commit). A0 asks "may I"; A12 reports what happened.',
    defaultVariantId: 'card',
    defaultVisible: false,
    variants: [
      { id: 'card', name: 'Card' },
    ],
    axes: [
      {
        // One question at a time — the example is fond, mutually exclusive.
        key: 'example',
        label: 'example',
        defaultVariantId: 'edit',
        variants: [
          { id: 'edit',       name: 'Document edit (Oui / Non)' },
          { id: 'choice',     name: 'Clarifying choice' },
          { id: 'sources',    name: 'Sources pre-check' },
          { id: 'toolchoice', name: 'Tool choice (options are tools)' },
          { id: 'snippet',    name: 'Output preview (confirm before opening)' },
          { id: 'veille',     name: 'Watcher proposal (suivre ces recherches ?)' },
          { id: 'memory',     name: 'Memory (retenir cette préférence ?)' },
          { id: 'write',      name: 'Write action (enregistrer / envoyer / poser)' },
        ],
      },
    ],
  },
  {
    code: 'A1', name: 'Reasoning', component: 'ChatToolCalls', views: ['full'],
    blurb: 'Agentic trace shown before the answer. Header is inline: "Raisonnement · N sources · durée". A final timeline row marks the state — a pulsing bullet with "Raisonnement en cours" while thinking, a steady bullet with "Raisonnement terminé" once done. Toggle Running to preview the live phase. "Suivre" adds a bell on each search / law-article hit — the queries in the trace ARE valid watchers, one click opens the Watcher surface (A10) pre-filled with that exact query or entity.',
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Inline — sources + duration' },
    ],
    content: {
      multiSelect: true,
      // Default = finished reasoning (collapsed) + the "Suivre" bells on, since
      // suggesting watchers from the trace is the point of the exploration.
      defaultIds: ['veille'],
      // "running" is genuine runtime state (thinking → done), not caller config.
      stateIds: ['running'],
      variants: [
        { id: 'running', name: 'Running — show "Raisonnement en cours"' },
        { id: 'veille',  name: '“Suivre” on searches & articles' },
      ],
    },
  },
  {
    code: 'A2', name: 'Text answer', component: 'ChatMessage', views: ['full'],
    blurb: "The chatbot's written answer. Toggle which elements appear: Excerpts (verbatim legal text quoted block-level), Source citations (public — décisions/lois/codes, blue underlined links), Document citations (private — uploaded files/matter docs, anonymised numbers), and Verification. Verification is deliberately NOT an axis: status is per-citation, and one global radio would force every citation into one state — exactly the failure it exists to catch. A verified citation is marked with nothing at all; only obsolète and non vérifiable earn ink, because a green check on all twelve is noise, and noise is how the real one gets missed. Shares D4's status vocabulary and its ArticleCheck component.",
    defaultVariantId: 'default',
    defaultVisible: true,
    variants: [
      { id: 'default', name: 'Standard' },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['excerpt', 'sources', 'docs', 'verified'],
      variants: [
        { id: 'excerpt',  name: 'Excerpts' },
        { id: 'sources',  name: 'Source citations' },
        { id: 'docs',     name: 'Document citations' },
        { id: 'verified', name: 'Citation verification' },
      ],
    },
  },
  {
    code: 'A4', name: 'Suggested action', component: 'ChatToolCalls', views: ['full'],
    blurb: 'A handoff CTA — "continue in this tool". `variant` = its form: Card (icon + title + CTA) or Inline (a sentence that EXPLAINS why it is suggested, with the action as a link). `slot` = TOP (before the answer — "better tool") or BOTTOM (after — "next step"). Tier lives in the tool catalog; paid tools show an Add-on / Actif chip via the global add-ons switch. Defaults on, card form, top slot, a paid tool — the presentation leads with the add-on.',
    defaultVariantId: 'card',
    defaultVisible: true,
    variants: [
      { id: 'card',    name: 'Card — icon + title + quiet link' },
      { id: 'banner',  name: 'Banner — slim neutral strip' },
      { id: 'compact', name: 'Compact — one dense row' },
      { id: 'inline',  name: 'Inline — sentence + link (explains why)' },
    ],
    axes: [
      {
        // WHERE the suggestion sits relative to the answer — two distinct intents.
        key: 'slot',
        label: 'slot',
        kind: 'prop',
        defaultVariantId: 'top',
        variants: [
          { id: 'top',    name: 'Top — before the answer (better tool)' },
          { id: 'bottom', name: 'Bottom — after the answer (next step)' },
        ],
      },
      {
        // Paid-tool entitlement. Single-select — a plan either owns the add-on or
        // it doesn't. Drives the eyebrow label: locked → "Add-on", owned → "Actif".
        key: 'owned',
        label: 'entitlement',
        kind: 'prop',
        defaultVariantId: 'locked',
        variants: [
          { id: 'locked', name: 'Locked — Add-on (upsell)' },
          { id: 'owned',  name: 'Owned — Actif' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['counter-argument'],
      variants: [
        { id: 'negocier',         name: 'Négocier (Flow Counsel)' },
        { id: 'counsel',          name: 'Counsel' },
        { id: 'counter-argument', name: 'Counter-Argument (Flow Litigate)' },
        { id: 'extract',          name: 'Extract' },
        { id: 'tableau',          name: 'Table' },
        { id: 'sources',          name: 'Knowledge base' },
        { id: 'veille',           name: 'Watcher (suivre cette recherche)' },
      ],
    },
  },
  {
    code: 'A9', name: 'Snippet answer', component: 'ChatToolCalls', views: ['full'],
    blurb: 'When the answer IS a tool\'s output, rendered inline in the body. `kind` picks which: a generated document (one or several, Éditeur), an Extract table, or an edits review — the proposed changes to a document, reviewed change-by-change (a diff tool\'s output). Separate from "Suggested action" (the handoff CTA).',
    defaultVariantId: 'preview',
    defaultVisible: false,
    variants: [
      { id: 'preview', name: 'Inline preview' },
    ],
    content: {
      defaultId: 'document',
      variants: [
        { id: 'document',        name: 'Single document' },
        { id: 'documents',       name: 'Multiple documents' },
        { id: 'extract',         name: 'Extract (table)' },
        { id: 'edits',           name: 'Edits review (diff)' },
        { id: 'clause-analysis', name: 'Clause analysis (per-clause)' },
      ],
    },
  },
  {
    code: 'A7', name: 'Actions bar', component: 'Toolbar', views: ['full'],
    blurb: 'Action row at the bottom of the answer — Copier, exports (Word, PDF), feedback (utile / pas utile). Optional extras are checkboxes. "Créer une veille" adds a bell that opens the Watcher surface (A10) — the answer-level way to turn the search just run into an alert. "Enregistrer comme action" is its mirror for SKILLS: the trace becomes a watcher, the conversation becomes a firm playbook, and what a saved playbook DOES is show up in E3 under source = firm. That closes the loop through the registry instead of another modal.',
    defaultVariantId: 'labeled',
    defaultVisible: true,
    variants: [
      { id: 'labeled', name: 'Labeled (Copy + icons)' },
      { id: 'icons',   name: 'Icons only' },
    ],
    content: {
      multiSelect: true,
      defaultIds: [],
      variants: [
        { id: 'veille',      name: '“Créer une veille” action' },
        { id: 'save-action', name: '“Enregistrer comme action”' },
      ],
    },
  },
  {
    code: 'A10', name: 'Watcher creation', component: 'ChatToolCalls', views: ['full'],
    blurb: 'Watchers work on KEYWORDS or ENTITIES, never themes (prod model). The chatbot\'s edge: the reasoning trace already holds the exact queries the agent ran, and the answer cites the exact entities — so suggestions are grounded, verbatim, never invented. `variant`: Picker (the hero — multi-select list of the concrete watcher candidates detected in the conversation), Card / Strip / Modal (single-watcher setup forms; Modal mirrors the two prod dialogs). `kind` picks which single watcher the card/strip/modal configure: the main search query (mots-clés + juridictions + commentaires switch) or the cited law article (its legal graph: évolutions / décisions / commentaires / textes). Status is runtime state: Setup → Created (the CTA actually flips it). Entry points that open it: the A1 trace "Suivre" bells, A7 "Créer une veille", the A4 veille suggestion, the A0 veille ask, the C8 ⋯ menu.',
    defaultVariantId: 'picker',
    defaultVisible: false,
    variants: [
      { id: 'picker', name: 'Picker — suggested watchers (multi)' },
      { id: 'card',   name: 'Card — single watcher setup (in the flow)' },
      { id: 'strip',  name: 'Strip — one-row quick create' },
      { id: 'modal',  name: 'Modal — the classic dialog' },
    ],
    axes: [
      {
        // WHICH single watcher the card/strip/modal configure. Mirrors the two
        // production watcher types; ignored by the picker (it lists all).
        key: 'kind',
        label: 'watcher',
        defaultVariantId: 'requete',
        variants: [
          { id: 'requete', name: 'Requête — mots-clés + filtres' },
          { id: 'article', name: 'Article de loi — graphe légal' },
        ],
      },
      {
        // Runtime lifecycle — a veille is being configured OR has been created.
        key: 'status',
        label: 'status',
        kind: 'state',
        defaultVariantId: 'setup',
        variants: [
          { id: 'setup',   name: 'Setup (configuring)' },
          { id: 'created', name: 'Created (confirmation)' },
        ],
      },
    ],
    content: {
      multiSelect: true,
      defaultIds: ['filtres', 'commentaires', 'frequence'],
      variants: [
        { id: 'filtres',      name: 'Juridictions (CASS / CA / CE…)' },
        { id: 'commentaires', name: '“Alerte sur les commentaires” switch' },
        { id: 'frequence',    name: 'Fréquence' },
        { id: 'canal',        name: 'Canal (e-mail / in-app)' },
      ],
    },
  },
  {
    code: 'A8', name: 'Follow-ups', component: 'List', views: ['full'],
    blurb: 'Suggested follow-up questions under the answer — full-width rows, subtle dividers.',
    defaultVariantId: 'rows',
    defaultVisible: true,
    variants: [
      { id: 'rows', name: 'Full-width rows' },
    ],
  },

  // ============ Éditeur (doc surface) ============
  {
    code: 'D2', name: 'Reference document', component: 'Token', surfaces: ['doc'],
    blurb: 'A "Document de référence : …" badge in the Éditeur header — the source document the draft/edit is based on. Reads scenario.referenceDoc.',
    defaultVariantId: 'badge',
    defaultVisible: false,
    variants: [
      { id: 'badge', name: 'Header badge' },
    ],
  },
  {
    code: 'D3', name: 'Sources panel', component: 'Citation', surfaces: ['doc'],
    blurb: 'Right-side panel of reference-document excerpts + legal article cards (the "Sources — section" view). Opened from an edits-review change’s "Sources". Reads scenario.sourcesPanel.',
    defaultVariantId: 'panel',
    defaultVisible: false,
    variants: [
      { id: 'panel', name: 'Side panel' },
    ],
  },
  {
    code: 'D4', name: 'Legal article check', component: 'StatusDot', views: ['full'],
    blurb: 'Inline status cards for cited articles (À jour ✓ / obsolète ⚠ / modifié). Drives the "replace outdated article" prompt. Reads scenario.sourcesPanel.articles.',
    defaultVariantId: 'cards',
    defaultVisible: false,
    variants: [
      { id: 'cards', name: 'Status cards' },
    ],
  },
];

export const PRIMITIVES_BY_CODE: Record<PrimitiveCode, PrimitiveDef> =
  Object.fromEntries(PRIMITIVES.map((p) => [p.code, p])) as Record<PrimitiveCode, PrimitiveDef>;

export const PRIMITIVE_CODES: PrimitiveCode[] = PRIMITIVES.map((p) => p.code);

export function defaultVariantFor(code: PrimitiveCode): string {
  return PRIMITIVES_BY_CODE[code].defaultVariantId;
}
export function defaultVisibleFor(code: PrimitiveCode): boolean {
  return PRIMITIVES_BY_CODE[code].defaultVisible;
}
export function defaultContentFor(code: PrimitiveCode): string | string[] | undefined {
  const c = PRIMITIVES_BY_CODE[code].content;
  if (!c) return undefined;
  if (c.multiSelect) return c.defaultIds;
  return c.defaultId;
}
export function defaultAxesFor(code: PrimitiveCode): Record<string, string> | undefined {
  const axes = PRIMITIVES_BY_CODE[code].axes;
  if (!axes || axes.length === 0) return undefined;
  const out: Record<string, string> = {};
  for (const a of axes) out[a.key] = a.defaultVariantId;
  return out;
}
