import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../types';
import { useFilters } from '../context/FilterContext';

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  selectedIds?: string[];
  onToggleSelect?: (productId: string) => void;
}

export function ProductGrid({ products, currentPage, totalPages, totalCount, onPageChange, selectedIds = [], onToggleSelect }: ProductGridProps) {
  const { clearFilters } = useFilters();
  
  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12">
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--jolly-bg)' }}
        >
          <PackageOpen size={48} style={{ color: 'var(--jolly-text-disabled)' }} />
        </div>
        <h3 className="mb-2" style={{ color: 'var(--jolly-text-body)', fontSize: '18px', fontWeight: 600 }}>
          No products found
        </h3>
        <p className="mb-4 text-center" style={{ color: 'var(--jolly-text-secondary)', fontSize: '14px' }}>
          No products match your current filters.
        </p>
        <button 
          onClick={clearFilters}
          className="px-4 py-2 rounded border"
          style={{
            borderColor: 'var(--jolly-primary)',
            color: 'var(--jolly-primary)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-2 px-6 mb-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSelected={selectedIds.includes(product.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-6 border-t" style={{ borderColor: 'var(--jolly-border)' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            color: currentPage === 1 ? 'var(--jolly-text-disabled)' : 'var(--jolly-primary)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ color: 'var(--jolly-text-body)', fontSize: '14px' }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            color: currentPage === totalPages ? 'var(--jolly-text-disabled)' : 'var(--jolly-primary)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}