import type { Composition } from './types';

/**
 * The three architectures from the prototypes repo, expressed as Compositions.
 * Each preset is a starting point — the user can tweak any value and the
 * preset switches to "custom".
 */

export const PRESET_A: Composition = {
  preset: 'A',
  scenario: 'research',
  primitives: {
    intent:     'dominant',
    sources:    'absent',
    provenance: 'secondary',
    artifact:   'absent',
    matter:     'secondary',
    preamble:   'dominant',
  },
  sources: { doctrine: true, kb: true, clausier: false, matter: false },
};

export const PRESET_B: Composition = {
  preset: 'B',
  scenario: 'draft',
  primitives: {
    intent:     'absent',
    sources:    'dominant',
    provenance: 'dominant',
    artifact:   'dominant',
    matter:     'dominant',
    preamble:   'absent',
  },
  sources: { doctrine: true, kb: true, clausier: true, matter: true },
};

export const PRESET_C: Composition = {
  preset: 'C',
  scenario: 'internal',
  primitives: {
    intent:     'secondary',
    sources:    'secondary',
    provenance: 'secondary',
    artifact:   'secondary',
    matter:     'dominant',
    preamble:   'absent',
  },
  sources: { doctrine: true, kb: true, clausier: true, matter: true },
};

export const PRESETS = { A: PRESET_A, B: PRESET_B, C: PRESET_C } as const;

export const DEFAULT_COMPOSITION: Composition = PRESET_A;
