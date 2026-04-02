export type StorefrontStatus = 'published' | 'unpublished';
export type StorefrontDisplayStatus = 'published' | 'unpublished' | 'draft';

export interface Product {
  id: string;
  name: string;
  supplier: string;
  category: string;
  price: number;
  status: 'active' | 'non-public' | 'proposal';
  image: string;
  decorationMethods: string[];
  colors: string[];
  availability: 'in-stock' | 'made-to-order';
  sku: string;
  description?: string;
  storefrontStatus?: StorefrontStatus;
}

export interface FilterState {
  categories: string[];
  suppliers: string[];
  decorationMethods: string[];
  colors: string[];
  priceRange: { min: number; max: number };
  availability: 'all' | 'in-stock' | 'made-to-order';
  showNonPublic: boolean;
  searchQuery: string;
}

export type UserRole = 'sales' | 'designer' | 'finance' | 'admin';

export interface UserRoleInfo {
  role: UserRole;
  label: string;
  description: string;
  permissions: string[];
}