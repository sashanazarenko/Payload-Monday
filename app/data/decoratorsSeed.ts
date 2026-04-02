/** Seed decorator list — shared by Decorator Matrix + Dashboard (pricing review widget). */

export type DecoratorStatus = 'Active' | 'Onboarding' | 'Inactive' | 'Suspended';

export type DecorationMethod =
  | 'Screen Print'
  | 'Embroidery'
  | 'DTG'
  | 'Laser Engrave'
  | 'Pad Print'
  | 'Sublimation'
  | 'Deboss'
  | 'UV Print'
  | 'Heat Transfer';

export interface Decorator {
  id: string;
  name: string;
  code: string;
  location: string;
  state: string;
  methods: DecorationMethod[];
  preferredFor: DecorationMethod[];
  productCategories: string[];
  minOrder: number;
  avgLeadDays: number;
  rushAvailable: boolean;
  rushLeadDays?: number;
  qualityRating: number;
  onTimeRate: number;
  status: DecoratorStatus;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  priceLevel: 'Budget' | 'Standard' | 'Premium';
  lastOrderDate: string;
  totalOrders: number;
  notes?: string;
  isAppaLinked: boolean;
  appaLastSync?: string;
  reviewFrequencyMonths?: 6 | 12 | 24;
  lastReviewedDate?: string;
}

export const INITIAL_DECORATORS: Decorator[] = [
  {
    id: 'DEC-001', name: 'Print Co Melbourne', code: 'PCM', location: 'Melbourne', state: 'VIC',
    methods: ['Screen Print', 'DTG', 'Heat Transfer'], preferredFor: ['Screen Print'],
    productCategories: ['Apparel', 'Bags', 'Headwear'], minOrder: 50, avgLeadDays: 8,
    rushAvailable: true, rushLeadDays: 3, qualityRating: 4.8, onTimeRate: 96, status: 'Active',
    contactName: 'Mark Thompson', contactEmail: 'mark@printcomelb.com.au',
    contactPhone: '+61 3 9123 4567', website: 'printcomelb.com.au', priceLevel: 'Standard',
    lastOrderDate: 'Mar 10, 2026', totalOrders: 342, isAppaLinked: true, appaLastSync: 'Mar 20, 2026',
  },
  {
    id: 'DEC-002', name: 'BrandPrint Sydney', code: 'BPS', location: 'Sydney', state: 'NSW',
    methods: ['Screen Print', 'Pad Print', 'Sublimation'], preferredFor: ['Pad Print'],
    productCategories: ['Drinkware', 'Tech', 'Pens', 'Bags'], minOrder: 100, avgLeadDays: 10,
    rushAvailable: true, rushLeadDays: 5, qualityRating: 4.5, onTimeRate: 91, status: 'Active',
    contactName: 'Lisa Chen', contactEmail: 'lisa@brandprint.com.au',
    contactPhone: '+61 2 8765 4321', website: 'brandprint.com.au', priceLevel: 'Standard',
    lastOrderDate: 'Mar 8, 2026', totalOrders: 218, isAppaLinked: true, appaLastSync: 'Mar 19, 2026',
  },
  {
    id: 'DEC-003', name: 'EmbroidMe Brisbane', code: 'EMB', location: 'Brisbane', state: 'QLD',
    methods: ['Embroidery'], preferredFor: ['Embroidery'],
    productCategories: ['Apparel', 'Headwear', 'Towels'], minOrder: 25, avgLeadDays: 12,
    rushAvailable: false, qualityRating: 4.9, onTimeRate: 98, status: 'Active',
    contactName: "James O'Brien", contactEmail: 'james@embroidme.com.au',
    contactPhone: '+61 7 3456 7890', website: 'embroidme.com.au', priceLevel: 'Premium',
    lastOrderDate: 'Mar 12, 2026', totalOrders: 167, isAppaLinked: true, appaLastSync: 'Mar 18, 2026',
  },
  {
    id: 'DEC-004', name: 'LaserEdge Engraving', code: 'LEE', location: 'Adelaide', state: 'SA',
    methods: ['Laser Engrave', 'Deboss', 'UV Print'], preferredFor: ['Laser Engrave'],
    productCategories: ['Drinkware', 'Tech', 'Leather Goods', 'Awards'], minOrder: 30, avgLeadDays: 7,
    rushAvailable: true, rushLeadDays: 2, qualityRating: 4.7, onTimeRate: 94, status: 'Active',
    contactName: 'Daniel Kim', contactEmail: 'daniel@laseredge.com.au',
    contactPhone: '+61 8 2345 6789', priceLevel: 'Standard',
    lastOrderDate: 'Mar 6, 2026', totalOrders: 289, isAppaLinked: false, reviewFrequencyMonths: 12, lastReviewedDate: '2025-01-15',
  },
  {
    id: 'DEC-005', name: 'SubliMax Perth', code: 'SMP', location: 'Perth', state: 'WA',
    methods: ['Sublimation', 'DTG', 'Heat Transfer'], preferredFor: ['Sublimation'],
    productCategories: ['Apparel', 'Bags', 'Drinkware', 'Mousepads'], minOrder: 25, avgLeadDays: 14,
    rushAvailable: false, qualityRating: 4.3, onTimeRate: 87, status: 'Active',
    contactName: 'Sarah Nguyen', contactEmail: 'sarah@sublimax.com.au',
    contactPhone: '+61 8 9876 5432', website: 'sublimax.com.au', priceLevel: 'Budget',
    lastOrderDate: 'Feb 28, 2026', totalOrders: 94,
    notes: 'WA-only freight can add 2–3 days. Factor in for east-coast clients.', isAppaLinked: false, reviewFrequencyMonths: 12, lastReviewedDate: '2025-04-01',
  },
  {
    id: 'DEC-006', name: 'FullSpectrum Digital', code: 'FSD', location: 'Melbourne', state: 'VIC',
    methods: ['DTG', 'UV Print', 'Sublimation'], preferredFor: ['DTG', 'UV Print'],
    productCategories: ['Apparel', 'Tech', 'Promotional'], minOrder: 10, avgLeadDays: 6,
    rushAvailable: true, rushLeadDays: 2, qualityRating: 4.6, onTimeRate: 93, status: 'Active',
    contactName: 'Rachel Wong', contactEmail: 'rachel@fullspectrum.com.au',
    contactPhone: '+61 3 5678 9012', website: 'fullspectrum.com.au', priceLevel: 'Premium',
    lastOrderDate: 'Mar 14, 2026', totalOrders: 156, isAppaLinked: false, reviewFrequencyMonths: 6, lastReviewedDate: '2025-11-10',
  },
  {
    id: 'DEC-007', name: 'QuickPrint Geelong', code: 'QPG', location: 'Geelong', state: 'VIC',
    methods: ['Screen Print', 'Pad Print'], preferredFor: [],
    productCategories: ['Bags', 'Pens', 'Promotional'], minOrder: 200, avgLeadDays: 15,
    rushAvailable: false, qualityRating: 3.8, onTimeRate: 78, status: 'Onboarding',
    contactName: 'Tom Brady', contactEmail: 'tom@quickprint.com.au',
    contactPhone: '+61 3 4567 8901', priceLevel: 'Budget',
    lastOrderDate: '—', totalOrders: 0,
    notes: 'New supplier. Trial order pending for quality assessment.', isAppaLinked: false, reviewFrequencyMonths: 12, lastReviewedDate: '2025-09-20',
  },
  {
    id: 'DEC-008', name: 'Heritage Emboss Co', code: 'HEC', location: 'Hobart', state: 'TAS',
    methods: ['Deboss', 'Laser Engrave'], preferredFor: ['Deboss'],
    productCategories: ['Leather Goods', 'Notebooks', 'Awards'], minOrder: 50, avgLeadDays: 18,
    rushAvailable: false, qualityRating: 4.9, onTimeRate: 95, status: 'Active',
    contactName: 'Emily Hart', contactEmail: 'emily@heritageemboss.com.au',
    contactPhone: '+61 3 6234 5678', priceLevel: 'Premium',
    lastOrderDate: 'Feb 20, 2026', totalOrders: 73, isAppaLinked: false, reviewFrequencyMonths: 24, lastReviewedDate: '2024-10-01',
  },
  {
    id: 'DEC-009', name: 'OutdoorPrint NT', code: 'OPN', location: 'Darwin', state: 'NT',
    methods: ['Screen Print', 'Heat Transfer'], preferredFor: [],
    productCategories: ['Apparel', 'Headwear'], minOrder: 100, avgLeadDays: 20,
    rushAvailable: false, qualityRating: 3.5, onTimeRate: 72, status: 'Suspended',
    contactName: 'Kevin Brown', contactEmail: 'kevin@outdoorprint.com.au',
    contactPhone: '+61 8 8901 2345', priceLevel: 'Budget',
    lastOrderDate: 'Jan 15, 2026', totalOrders: 31,
    notes: 'Suspended due to consistent quality issues. Review in Q2 2026.', isAppaLinked: false, reviewFrequencyMonths: 12, lastReviewedDate: '2024-12-12',
  },
  {
    id: 'DEC-010', name: 'UrbanInk Canberra', code: 'UIC', location: 'Canberra', state: 'ACT',
    methods: ['Screen Print', 'DTG', 'Embroidery'], preferredFor: [],
    productCategories: ['Apparel', 'Bags', 'Headwear'], minOrder: 50, avgLeadDays: 10,
    rushAvailable: true, rushLeadDays: 4, qualityRating: 4.2, onTimeRate: 89, status: 'Inactive',
    contactName: 'Amy Foster', contactEmail: 'amy@urbanink.com.au',
    contactPhone: '+61 2 6123 4567', priceLevel: 'Standard',
    lastOrderDate: 'Dec 5, 2025', totalOrders: 48,
    notes: 'Inactive — no orders placed in 90+ days.', isAppaLinked: false, reviewFrequencyMonths: 12, lastReviewedDate: '2025-03-05',
  },
];
