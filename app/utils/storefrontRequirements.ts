import { Product } from '../types';

export interface StorefrontRequirement {
  key: string;
  label: string;
  met: boolean;
}

export function checkStorefrontRequirements(product: Product): StorefrontRequirement[] {
  return [
    {
      key: 'description',
      label: 'Product description',
      met: !!product.description && product.description.trim().length > 0,
    },
    {
      key: 'images',
      label: 'Product images uploaded',
      met: !!product.image,
    },
    {
      key: 'decoration',
      label: 'Decoration method configured',
      met: product.decorationMethods.length > 0,
    },
    {
      key: 'pricing',
      label: 'Pricing tiers set',
      met: true, // mock: always true for existing products
    },
    {
      key: 'category',
      label: 'Category assigned',
      met: !!product.category,
    },
  ];
}

export function canPublishProduct(product: Product): boolean {
  return checkStorefrontRequirements(product).every(r => r.met);
}

export function getMissingFields(product: Product): StorefrontRequirement[] {
  return checkStorefrontRequirements(product).filter(r => !r.met);
}
