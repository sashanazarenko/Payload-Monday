import { Product, FilterState } from '../types';

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.supplier.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Categories
    if (filters.categories.length > 0) {
      if (!filters.categories.includes(product.category.toLowerCase())) {
        return false;
      }
    }

    // Suppliers
    if (filters.suppliers.length > 0) {
      if (!filters.suppliers.includes(product.supplier.toLowerCase())) {
        return false;
      }
    }

    // Decoration Methods
    if (filters.decorationMethods.length > 0) {
      const hasMethod = filters.decorationMethods.some(method => 
        product.decorationMethods.some(pm => pm.toLowerCase().includes(method))
      );
      if (!hasMethod) return false;
    }

    // Colors
    if (filters.colors.length > 0) {
      const hasColor = filters.colors.some(color => 
        product.colors.includes(color)
      );
      if (!hasColor) return false;
    }

    // Price Range
    if (product.price < filters.priceRange.min || product.price > filters.priceRange.max) {
      return false;
    }

    // Availability
    if (filters.availability !== 'all') {
      if (product.availability !== filters.availability) {
        return false;
      }
    }

    // Show non-public
    if (!filters.showNonPublic) {
      if (product.status === 'non-public' || product.status === 'proposal') {
        return false;
      }
    }

    return true;
  });
}

export function getActiveFilterCount(filters: FilterState): number {
  let count = 0;
  if (filters.categories.length > 0) count += filters.categories.length;
  if (filters.suppliers.length > 0) count += filters.suppliers.length;
  if (filters.decorationMethods.length > 0) count += filters.decorationMethods.length;
  if (filters.colors.length > 0) count += filters.colors.length;
  if (filters.availability !== 'all') count++;
  if (!filters.showNonPublic) count++;
  return count;
}
