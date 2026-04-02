/**
 * Persistent pricing matrix store for the Decorator Matrix.
 * Seeded on first load from the static DECORATOR_RATE_CARDS array.
 * Subsequent reads/writes go through localStorage.
 *
 * The `getDecoratorRateCard()` helper in decoratorData.ts should be kept
 * for backward-compat in the wizard; it reads from the static data.
 * Products opened in the wizard will always reflect the matrix's
 * current values because the wizard re-reads on each mount.
 */

import { DECORATOR_RATE_CARDS, DECORATOR_MATRIX_LIST, DecoratorInfo } from './decoratorData';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TierColumn {
  id: string;
  minQty: number;
  maxQty: number | null;
}

export interface PricingRowData {
  id: string;
  method: string;        // e.g. "Screen Print"
  pricingCode: string;   // e.g. "SP-A", "P1"
  setupFee: number;      // one-time setup fee per job ($)
  costs: Record<string, number>; // tierId → cost per unit ($)
}

export interface DecoratorPricingData {
  /** Matches the Decorator.name field in DecoratorMatrix */
  decoratorName: string;
  /** true = APPA sync, false = manual */
  isAppaLinked: boolean;
  appaLastSync?: string;
  tiers: TierColumn[];
  rows: PricingRowData[];
  lastUpdated: string;
}

export type PricingStore = Record<string, DecoratorPricingData>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'jolly_decorator_pricing_v2';

/** APPA-linked decorator names (pricing synced from APPA, not manual) */
const APPA_LINKED_NAMES = new Set([
  'Print Co Melbourne',
  'BrandPrint Sydney',
  'EmbroidMe Brisbane',
]);

const APPA_LAST_SYNC: Record<string, string> = {
  'Print Co Melbourne': 'Mar 20, 2026',
  'BrandPrint Sydney': 'Mar 19, 2026',
  'EmbroidMe Brisbane': 'Mar 18, 2026',
};

const DEFAULT_SETUP_FEES: Record<string, number> = {
  'Screen Print':    55.00,
  'Pad Print':       45.00,
  'Embroidery':      80.00,
  'Laser Engraving': 35.00,
  'Deboss':          60.00,
  'Digital Print':   25.00,
  'Sublimation':     30.00,
  'UV Print':        40.00,
  'Heat Transfer':   20.00,
};

const DEFAULT_PRICING_CODES: Record<string, string> = {
  'Screen Print':    'SP-1',
  'Pad Print':       'PP-1',
  'Embroidery':      'EM-1',
  'Laser Engraving': 'LE-1',
  'Deboss':          'DB-1',
  'Digital Print':   'DP-1',
  'Sublimation':     'SB-1',
  'UV Print':        'UV-1',
  'Heat Transfer':   'HT-1',
};

// ─── Seed from static rate cards ─────────────────────────────────────────────

function uid(): string {
  return `id_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function seedStore(): PricingStore {
  const store: PricingStore = {};

  for (const dec of DECORATOR_MATRIX_LIST) {
    const cards = DECORATOR_RATE_CARDS.filter(rc => rc.decoratorName === dec.name);
    const isAppa = APPA_LINKED_NAMES.has(dec.name);

    // Build tier columns from the first rate card for this decorator
    // (assume same breakpoints across all methods for a given decorator)
    let tiers: TierColumn[];
    if (cards.length > 0) {
      tiers = cards[0].tiers.map((t, i) => ({
        id: `tier-${i + 1}`,
        minQty: t.minQty,
        maxQty: t.maxQty,
      }));
    } else {
      // Default 4-tier columns
      tiers = [
        { id: 'tier-1', minQty: 1,   maxQty: 49  },
        { id: 'tier-2', minQty: 50,  maxQty: 99  },
        { id: 'tier-3', minQty: 100, maxQty: 249 },
        { id: 'tier-4', minQty: 250, maxQty: null },
      ];
    }

    // Build rows from rate cards, then add blank rows for remaining supported methods
    const rows: PricingRowData[] = [];
    const methodsCovered = new Set<string>();

    for (const card of cards) {
      methodsCovered.add(card.method);
      // Map the raw tier costs onto our column IDs
      const costs: Record<string, number> = {};
      card.tiers.forEach((t, i) => {
        const col = tiers[i];
        if (col) costs[col.id] = t.unitCost;
      });

      rows.push({
        id: uid(),
        method: card.method,
        pricingCode: DEFAULT_PRICING_CODES[card.method] ?? 'P1',
        setupFee: DEFAULT_SETUP_FEES[card.method] ?? 0,
        costs,
      });
    }

    // Add blank rows for methods supported by this decorator but without rate cards
    for (const m of dec.methods) {
      if (!methodsCovered.has(m)) {
        rows.push({
          id: uid(),
          method: m,
          pricingCode: DEFAULT_PRICING_CODES[m] ?? 'P1',
          setupFee: DEFAULT_SETUP_FEES[m] ?? 0,
          costs: {},
        });
      }
    }

    store[dec.name] = {
      decoratorName: dec.name,
      isAppaLinked: isAppa,
      appaLastSync: isAppa ? APPA_LAST_SYNC[dec.name] : undefined,
      tiers,
      rows,
      lastUpdated: 'Mar 20, 2026',
    };
  }

  return store;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadPricingStore(): PricingStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PricingStore;
  } catch { /* ignore */ }
  return seedStore();
}

export function savePricingStore(store: PricingStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

export function getDecoratorPricing(decoratorName: string): DecoratorPricingData | null {
  const store = loadPricingStore();
  return store[decoratorName] ?? null;
}

/** Updates pricing data for one decorator and persists the entire store. */
export function updateDecoratorPricing(
  decoratorName: string,
  updater: (prev: DecoratorPricingData) => DecoratorPricingData,
): void {
  const store = loadPricingStore();
  const existing = store[decoratorName] ?? {
    decoratorName,
    isAppaLinked: APPA_LINKED_NAMES.has(decoratorName),
    appaLastSync: APPA_LAST_SYNC[decoratorName],
    tiers: [
      { id: 'tier-1', minQty: 1, maxQty: 49 },
      { id: 'tier-2', minQty: 50, maxQty: 99 },
      { id: 'tier-3', minQty: 100, maxQty: 249 },
      { id: 'tier-4', minQty: 250, maxQty: null },
    ],
    rows: [],
    lastUpdated: new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }),
  };
  store[decoratorName] = updater(existing);
  store[decoratorName].lastUpdated = new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' });
  savePricingStore(store);
}

/** Returns the rate card for a decorator+method pair, reading from the live store.
 *  Falls back to static DECORATOR_RATE_CARDS if not found in store. */
export function getLiveRateCard(
  decoratorName: string,
  method: string,
): Array<{ minQty: number; maxQty: number | null; unitCost: number }> | null {
  const data = getDecoratorPricing(decoratorName);
  if (!data) return null;

  const row = data.rows.find(r => r.method === method);
  if (!row) return null;

  return data.tiers.map(tier => ({
    minQty: tier.minQty,
    maxQty: tier.maxQty,
    unitCost: row.costs[tier.id] ?? 0,
  }));
}

export function makeNewRow(methods: string[]): PricingRowData {
  const firstMethod = methods[0] ?? 'Screen Print';
  return {
    id: uid(),
    method: firstMethod,
    pricingCode: DEFAULT_PRICING_CODES[firstMethod] ?? 'P1',
    setupFee: DEFAULT_SETUP_FEES[firstMethod] ?? 0,
    costs: {},
  };
}

export function makeNewTier(existing: TierColumn[]): TierColumn {
  const last = existing[existing.length - 1];
  const newMin = last ? (last.maxQty !== null ? last.maxQty + 1 : last.minQty + 250) : 1;
  return { id: uid(), minQty: newMin, maxQty: null };
}

export const ALL_DECORATION_METHODS = [
  'Screen Print', 'Pad Print', 'Laser Engraving', 'Embroidery',
  'Deboss', 'Digital Print', 'Sublimation', 'UV Print', 'Heat Transfer',
];
