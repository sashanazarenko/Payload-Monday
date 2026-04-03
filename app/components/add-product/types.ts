export interface Variant {
  id: string;
  name: string;
  sku: string;
  supplierSku: string;
  status: 'active' | 'inactive';
  source: 'appa' | 'manual';
}

export interface PricingTier {
  id: string;
  minQty: number;
  maxQty: number | null;
  unitCost: number;
  /** Tracks how the row was populated so the Pricing step can badge auto-filled rows. */
  source?: 'decorator' | 'template' | 'manual';
}

export interface BespokeAddon {
  id: string;
  name: string;
  /** Add-on $/unit at each product pricing tier (keys = `PricingTier.id`). */
  tierCosts: Record<string, number>;
}

/** Ensure `tierCosts` has an entry for every tier; migrates legacy flat `unitCost` if present. */
export function normalizeBespokeAddon(
  raw: { id: string; name: string; tierCosts?: Record<string, number>; unitCost?: number },
  tierIds: string[],
): BespokeAddon {
  const fallback = typeof raw.unitCost === 'number' ? raw.unitCost : 0;
  const tierCosts: Record<string, number> = {};
  for (const tid of tierIds) {
    const v = raw.tierCosts?.[tid];
    tierCosts[tid] = typeof v === 'number' ? v : fallback;
  }
  return { id: raw.id, name: raw.name, tierCosts };
}

export function sumBespokeAddonsForTier(addons: BespokeAddon[], tierId: string | undefined): number {
  if (!tierId) return 0;
  return addons.reduce((sum, a) => sum + (a.tierCosts[tierId] ?? 0), 0);
}

export interface DecorationMethod {
  id: string;
  method: string;
  preferred: boolean;
  printAreaWidth: number;
  printAreaHeight: number;
  maxColors: number;
  positionX: number;
  positionY: number;
  decorator: string;
  setupCost: number;
  runCost: number;
  notes: string;
}

export interface AssetFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'complete' | 'error';
  progress: number;
  category: 'blank' | 'lifestyle' | 'decoration' | 'website_tile' | 'website_hover' | 'website_variant';
  decorationMethodId?: string;
}

/** At least one complete asset in each website slot (tile, hover, variant). */
export function websiteStorefrontPackComplete(assets: AssetFile[]): boolean {
  const ok = (cat: AssetFile['category']) =>
    assets.some(a => a.category === cat && a.status === 'complete');
  return ok('website_tile') && ok('website_hover') && ok('website_variant');
}

/** Freight/shipping lines supplied by APPA (read-only in wizard; prototype uses defaults until feed API). */
export interface AppaFreightFromFeed {
  lineLabel: string;
  lineSubtitle: string;
  /** Charge per order (e.g. domestic handling), not per unit. */
  perOrderAmount: number;
  /** Line quantity in supplier UI (usually 1 per order). */
  perOrderQuantity: number;
}

export const DEFAULT_APPA_FREIGHT: AppaFreightFromFeed = {
  lineLabel: 'Shipping & Handling',
  lineSubtitle: 'Per domestic address',
  perOrderAmount: 15,
  perOrderQuantity: 1,
};

export interface ProductFormData {
  // Step 1 — Core Details
  productName: string;
  supplier: string;
  supplierSku: string;
  internalSku: string;
  category: string;
  subcategory: string;
  source: 'standard' | 'appa' | 'proposal-only' | 'bespoke';
  description: string;
  isNonPublic: boolean;
  isProposalOnly: boolean;
  /** When true, storefront requires tile, hover, and variant images before staying on. */
  liveOnWebsite: boolean;

  // Step 2 — Decoration
  /** Primary decoration method selected in Step 2 — drives rate-card lookup in Step 3. */
  primaryDecorationMethod: string;
  /** Primary decorator supplier selected in Step 2 — drives rate-card lookup in Step 3. */
  primaryDecoratorSupplier: string;
  /** Optional bespoke decoration description (shown when source === 'bespoke'). */
  bespokeDecorationDescription: string;
  /** Bespoke add-ons configured in Step 2; per-tier $/unit aligned with `pricingTiers` (edit in Step 3). */
  bespokeAddons: BespokeAddon[];
  decorationMethods: DecorationMethod[];

  // Step 3 — Variants & Pricing
  variants: Variant[];
  pricingTiers: PricingTier[];
  marginTarget: number;
  marginFloor: number;
  /** @deprecated use freightLeg1 + freightLeg2 instead */
  freightAllocation: number;
  rushFee: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  // Freight legs (non-APPA — admin-configured)
  supplierIsDecorator: boolean;
  freightLeg1: number;  // Supplier → Decorator (only when supplierIsDecorator = false)
  freightLeg2: number;  // Decorator → Jolly HQ (always; or Supplier/Decorator → Jolly HQ)
  /** When source === 'appa', shipping is read-only from feed; null for other sources. */
  appaFreight: AppaFreightFromFeed | null;
  // MOQ availability & below-MOQ settings
  moqAvailable: boolean;
  allowBelowMoq: boolean;
  belowMoqSurchargeType: 'none' | 'flat' | 'percent';
  belowMoqSurchargeValue: number;
  belowMoqNote: string;

  // Step 4 — Assets
  assets: AssetFile[];
}

export function isProposalOnlyProduct(formData: Pick<ProductFormData, 'source' | 'isProposalOnly'>): boolean {
  return formData.source === 'proposal-only' || formData.isProposalOnly;
}

export interface StepInfo {
  number: number;
  label: string;
  status: 'not-started' | 'in-progress' | 'complete' | 'complete-with-warning' | 'error';
}

export type StepStatus = StepInfo['status'];

export const INITIAL_FORM_DATA: ProductFormData = {
  productName: '',
  supplier: '',
  supplierSku: '',
  internalSku: '',
  category: '',
  subcategory: '',
  source: 'standard',
  description: '',
  isNonPublic: false,
  isProposalOnly: false,
  liveOnWebsite: false,
  primaryDecorationMethod: '',
  primaryDecoratorSupplier: '',
  bespokeDecorationDescription: '',
  bespokeAddons: [],
  variants: [
    { id: '1', name: 'Natural', sku: 'AS-CT001-NAT', supplierSku: '(auto from APPA)', status: 'active', source: 'appa' },
    { id: '2', name: 'Black', sku: 'AS-CT001-BLK', supplierSku: '(auto from APPA)', status: 'active', source: 'appa' },
  ],
  pricingTiers: [
    { id: '1', minQty: 1, maxQty: 49, unitCost: 6.80 },
    { id: '2', minQty: 50, maxQty: 99, unitCost: 5.20 },
    { id: '3', minQty: 100, maxQty: 249, unitCost: 4.20 },
    { id: '4', minQty: 250, maxQty: null, unitCost: 3.80 },
  ],
  marginTarget: 42,
  marginFloor: 25,
  freightAllocation: 0.80,
  rushFee: 0.50,
  minOrderQty: 50,
  maxOrderQty: null,
  supplierIsDecorator: false,
  freightLeg1: 0.50,
  freightLeg2: 0.30,
  appaFreight: null,
  moqAvailable: true,
  allowBelowMoq: false,
  belowMoqSurchargeType: 'none',
  belowMoqSurchargeValue: 0,
  belowMoqNote: '',
  decorationMethods: [
    {
      id: 'dm1',
      method: 'Screen Print',
      preferred: true,
      printAreaWidth: 280,
      printAreaHeight: 200,
      maxColors: 4,
      positionX: 50,
      positionY: 80,
      decorator: 'PromoLine Decorators',
      setupCost: 45.00,
      runCost: 1.20,
      notes: 'Full front print area. Max 4 spot colours.',
    },
  ],
  assets: [],
};

export const SUPPLIERS = [
  'AS Colour', 'Biz Collection', 'JB\'s Wear', 'Winning Spirit',
  'Ramo', 'Stencil', 'Grace Collection', 'Legend Life',
  'Headwear Professionals', 'Adcraft'
];

export const CATEGORIES = [
  'Bags & Totes', 'Drinkware', 'Apparel', 'Headwear',
  'Technology', 'Stationery', 'Outdoor & Leisure',
  'Health & Wellness', 'Home & Living', 'Eco & Sustainable'
];

export const SUBCATEGORIES: Record<string, string[]> = {
  'Bags & Totes': ['Tote Bags', 'Backpacks', 'Duffel Bags', 'Cooler Bags', 'Drawstring Bags'],
  'Drinkware': ['Mugs', 'Water Bottles', 'Travel Cups', 'Wine Glasses', 'Tumblers'],
  'Apparel': ['T-Shirts', 'Polo Shirts', 'Hoodies', 'Jackets', 'Workwear'],
  'Headwear': ['Caps', 'Beanies', 'Bucket Hats', 'Visors', 'Trucker Caps'],
  'Technology': ['USB Drives', 'Power Banks', 'Speakers', 'Earbuds', 'Phone Accessories'],
  'Stationery': ['Pens', 'Notebooks', 'Folders', 'Desk Accessories', 'Calendars'],
  'Outdoor & Leisure': ['Umbrellas', 'Towels', 'Picnic Sets', 'Sports Equipment', 'Beach Items'],
  'Health & Wellness': ['Hand Sanitiser', 'First Aid', 'Stress Balls', 'Lip Balm', 'Sunscreen'],
  'Home & Living': ['Candles', 'Coasters', 'Kitchen Items', 'Blankets', 'Photo Frames'],
  'Eco & Sustainable': ['Bamboo Products', 'Recycled Items', 'Organic Cotton', 'Reusable Bags', 'Seed Kits'],
};

export const DECORATION_METHODS_LIST = [
  // Primary 6 (per spec — shown in Step 2 primary dropdown)
  'Screen Print', 'Pad Print', 'Laser Engraving', 'Embroidery', 'Deboss', 'Digital Print',
  // Additional methods available in decoration detail cards
  'Sublimation', 'Heat Transfer', 'UV Print',
];

/** The six primary decoration methods shown in the Step 2 primary dropdown. */
export const PRIMARY_DECORATION_METHODS = [
  'Screen Print', 'Pad Print', 'Laser Engraving', 'Embroidery', 'Deboss', 'Digital Print',
];

export const DECORATORS = [
  'Print Co Melbourne', 'BrandPrint Sydney', 'EmbroidMe Brisbane',
  'LaserEdge Engraving', 'SubliMax Perth', 'FullSpectrum Digital',
  'PromoLine Decorators', 'StitchMaster Embroidery', 'InkWorks Australia',
];

// ─── Global Price Curve (persisted in localStorage) ───────────────────────────

export const DEFAULT_PRICE_CURVE: PricingTier[] = [
  { id: 'default-1', minQty: 1,   maxQty: 49,  unitCost: 6.80 },
  { id: 'default-2', minQty: 50,  maxQty: 99,  unitCost: 5.20 },
  { id: 'default-3', minQty: 100, maxQty: 249, unitCost: 4.20 },
  { id: 'default-4', minQty: 250, maxQty: null, unitCost: 3.80 },
];

/** Legacy multi-template storage (pre–single-tier Settings). Migrated once into `jolly_price_curve`. */
const LEGACY_TEMPLATES_KEY = 'jolly_price_curve_templates';

export function getGlobalPriceCurve(): PricingTier[] {
  try {
    const stored = localStorage.getItem('jolly_price_curve');
    if (stored) {
      const parsed = JSON.parse(stored) as PricingTier[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t) => ({ ...t }));
      }
    }
    const legacy = localStorage.getItem(LEGACY_TEMPLATES_KEY);
    if (legacy) {
      const arr = JSON.parse(legacy) as { isDefault?: boolean; tiers?: PricingTier[] }[];
      if (Array.isArray(arr)) {
        const def = arr.find((x) => x.isDefault) ?? arr[0];
        if (def?.tiers && def.tiers.length > 0) {
          const tiers = def.tiers.map((t) => ({ ...t }));
          saveGlobalPriceCurve(tiers);
          return tiers;
        }
      }
    }
  } catch {}
  return DEFAULT_PRICE_CURVE.map((t) => ({ ...t }));
}

export function saveGlobalPriceCurve(tiers: PricingTier[]): void {
  try {
    localStorage.setItem('jolly_price_curve', JSON.stringify(tiers));
  } catch {}
}