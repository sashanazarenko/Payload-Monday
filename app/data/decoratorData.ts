/**
 * Shared decorator rate card data used across the Add Product wizard.
 * Step 2 (Decoration) reads DECORATOR_MATRIX_LIST to populate dropdowns.
 * Step 3 (Pricing & Tiers) reads getDecoratorRateCard() to auto-fill tiers.
 */

import { PricingTier } from '../components/add-product/types';

export interface DecoratorInfo {
  name: string;
  location: string;
  methods: string[];
  priceLevel: 'Budget' | 'Standard' | 'Premium';
}

export interface DecoratorRateCardEntry {
  decoratorName: string;
  method: string;
  minOrder: number;
  tiers: Omit<PricingTier, 'id' | 'source'>[];
}

/** Canonical list of decorator suppliers drawn from the Decorator Matrix page */
export const DECORATOR_MATRIX_LIST: DecoratorInfo[] = [
  {
    name: 'Print Co Melbourne',
    location: 'Melbourne VIC',
    methods: ['Screen Print', 'Digital Print', 'Heat Transfer'],
    priceLevel: 'Standard',
  },
  {
    name: 'BrandPrint Sydney',
    location: 'Sydney NSW',
    methods: ['Screen Print', 'Pad Print', 'Sublimation'],
    priceLevel: 'Standard',
  },
  {
    name: 'EmbroidMe Brisbane',
    location: 'Brisbane QLD',
    methods: ['Embroidery'],
    priceLevel: 'Premium',
  },
  {
    name: 'LaserEdge Engraving',
    location: 'Adelaide SA',
    methods: ['Laser Engraving', 'Deboss', 'UV Print'],
    priceLevel: 'Standard',
  },
  {
    name: 'SubliMax Perth',
    location: 'Perth WA',
    methods: ['Sublimation', 'Digital Print'],
    priceLevel: 'Budget',
  },
  {
    name: 'FullSpectrum Digital',
    location: 'Melbourne VIC',
    methods: ['Digital Print', 'UV Print'],
    priceLevel: 'Standard',
  },
  {
    name: 'PromoLine Decorators',
    location: 'Sydney NSW',
    methods: ['Screen Print', 'Pad Print', 'Embroidery'],
    priceLevel: 'Standard',
  },
  {
    name: 'StitchMaster Embroidery',
    location: 'Melbourne VIC',
    methods: ['Embroidery'],
    priceLevel: 'Standard',
  },
  {
    name: 'InkWorks Australia',
    location: 'Brisbane QLD',
    methods: ['Screen Print', 'Pad Print', 'Deboss'],
    priceLevel: 'Budget',
  },
];

/** Rate cards per decorator + method. These are the decoration unit costs that
 *  pre-populate the MOQ tier table in Step 3 (Pricing & Tiers). */
export const DECORATOR_RATE_CARDS: DecoratorRateCardEntry[] = [
  // ─── Print Co Melbourne ──────────────────────────────────────────────────
  {
    decoratorName: 'Print Co Melbourne',
    method: 'Screen Print',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 1.80 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.40 },
      { minQty: 100, maxQty: 249, unitCost: 1.10 },
      { minQty: 250, maxQty: null, unitCost: 0.90 },
    ],
  },
  {
    decoratorName: 'Print Co Melbourne',
    method: 'Digital Print',
    minOrder: 25,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 2.80 },
      { minQty: 50,  maxQty: 99,  unitCost: 2.20 },
      { minQty: 100, maxQty: 249, unitCost: 1.80 },
      { minQty: 250, maxQty: null, unitCost: 1.50 },
    ],
  },
  // ─── BrandPrint Sydney ───────────────────────────────────────────────────
  {
    decoratorName: 'BrandPrint Sydney',
    method: 'Screen Print',
    minOrder: 100,
    tiers: [
      { minQty: 1,   maxQty: 99,  unitCost: 2.10 },
      { minQty: 100, maxQty: 249, unitCost: 1.60 },
      { minQty: 250, maxQty: null, unitCost: 1.30 },
    ],
  },
  {
    decoratorName: 'BrandPrint Sydney',
    method: 'Pad Print',
    minOrder: 100,
    tiers: [
      { minQty: 1,   maxQty: 99,  unitCost: 2.40 },
      { minQty: 100, maxQty: 249, unitCost: 1.90 },
      { minQty: 250, maxQty: null, unitCost: 1.50 },
    ],
  },
  // ─── EmbroidMe Brisbane ──────────────────────────────────────────────────
  {
    decoratorName: 'EmbroidMe Brisbane',
    method: 'Embroidery',
    minOrder: 25,
    tiers: [
      { minQty: 1,   maxQty: 24,  unitCost: 5.20 },
      { minQty: 25,  maxQty: 99,  unitCost: 4.10 },
      { minQty: 100, maxQty: 249, unitCost: 3.40 },
      { minQty: 250, maxQty: null, unitCost: 2.80 },
    ],
  },
  // ─── LaserEdge Engraving ─────────────────────────────────────────────────
  {
    decoratorName: 'LaserEdge Engraving',
    method: 'Laser Engraving',
    minOrder: 30,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 2.90 },
      { minQty: 50,  maxQty: 199, unitCost: 2.20 },
      { minQty: 200, maxQty: null, unitCost: 1.70 },
    ],
  },
  {
    decoratorName: 'LaserEdge Engraving',
    method: 'Deboss',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 2.20 },
      { minQty: 50,  maxQty: 199, unitCost: 1.70 },
      { minQty: 200, maxQty: null, unitCost: 1.30 },
    ],
  },
  // ─── SubliMax Perth ──────────────────────────────────────────────────────
  {
    decoratorName: 'SubliMax Perth',
    method: 'Sublimation',
    minOrder: 25,
    tiers: [
      { minQty: 1,   maxQty: 24,  unitCost: 3.60 },
      { minQty: 25,  maxQty: 99,  unitCost: 2.80 },
      { minQty: 100, maxQty: 249, unitCost: 2.20 },
      { minQty: 250, maxQty: null, unitCost: 1.80 },
    ],
  },
  {
    decoratorName: 'SubliMax Perth',
    method: 'Digital Print',
    minOrder: 25,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 3.20 },
      { minQty: 50,  maxQty: 99,  unitCost: 2.50 },
      { minQty: 100, maxQty: null, unitCost: 2.00 },
    ],
  },
  // ─── FullSpectrum Digital ────────────────────────────────────────────────
  {
    decoratorName: 'FullSpectrum Digital',
    method: 'Digital Print',
    minOrder: 25,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 3.40 },
      { minQty: 50,  maxQty: 99,  unitCost: 2.60 },
      { minQty: 100, maxQty: null, unitCost: 2.10 },
    ],
  },
  // ─── PromoLine Decorators ────────────────────────────────────────────────
  {
    decoratorName: 'PromoLine Decorators',
    method: 'Screen Print',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 1.90 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.50 },
      { minQty: 100, maxQty: 249, unitCost: 1.20 },
      { minQty: 250, maxQty: null, unitCost: 0.95 },
    ],
  },
  {
    decoratorName: 'PromoLine Decorators',
    method: 'Pad Print',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 2.10 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.70 },
      { minQty: 100, maxQty: 249, unitCost: 1.40 },
      { minQty: 250, maxQty: null, unitCost: 1.10 },
    ],
  },
  {
    decoratorName: 'PromoLine Decorators',
    method: 'Embroidery',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 4.80 },
      { minQty: 50,  maxQty: 99,  unitCost: 3.90 },
      { minQty: 100, maxQty: null, unitCost: 3.20 },
    ],
  },
  // ─── StitchMaster Embroidery ─────────────────────────────────────────────
  {
    decoratorName: 'StitchMaster Embroidery',
    method: 'Embroidery',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 4.40 },
      { minQty: 50,  maxQty: 149, unitCost: 3.60 },
      { minQty: 150, maxQty: null, unitCost: 2.90 },
    ],
  },
  // ─── InkWorks Australia ──────────────────────────────────────────────────
  {
    decoratorName: 'InkWorks Australia',
    method: 'Screen Print',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 1.60 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.25 },
      { minQty: 100, maxQty: 249, unitCost: 1.00 },
      { minQty: 250, maxQty: null, unitCost: 0.80 },
    ],
  },
  {
    decoratorName: 'InkWorks Australia',
    method: 'Pad Print',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 1.90 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.50 },
      { minQty: 100, maxQty: null, unitCost: 1.20 },
    ],
  },
  {
    decoratorName: 'InkWorks Australia',
    method: 'Deboss',
    minOrder: 50,
    tiers: [
      { minQty: 1,   maxQty: 49,  unitCost: 2.00 },
      { minQty: 50,  maxQty: 99,  unitCost: 1.60 },
      { minQty: 100, maxQty: null, unitCost: 1.30 },
    ],
  },
];

/** Returns all decorators that support the given primary decoration method. */
export function getDecoratorsByMethod(method: string): DecoratorInfo[] {
  if (!method) return DECORATOR_MATRIX_LIST;
  const lower = method.toLowerCase();
  return DECORATOR_MATRIX_LIST.filter(d =>
    d.methods.some(m => m.toLowerCase() === lower),
  );
}

/** Returns decoration cost tiers for a given decorator + method pair, or null. */
export function getDecoratorRateCard(
  decoratorName: string,
  method: string,
): Omit<PricingTier, 'id' | 'source'>[] | null {
  const card = DECORATOR_RATE_CARDS.find(
    rc => rc.decoratorName === decoratorName && rc.method === method,
  );
  return card?.tiers ?? null;
}

/** Returns the minimum order quantity for a given decorator + method pair. */
export function getDecoratorMinOrder(decoratorName: string, method: string): number {
  const card = DECORATOR_RATE_CARDS.find(
    rc => rc.decoratorName === decoratorName && rc.method === method,
  );
  return card?.minOrder ?? 1;
}
