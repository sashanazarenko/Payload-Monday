import { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState } from '../types';

interface FilterContextType {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  clearFilters: () => void;
  removeFilter: (filterType: keyof FilterState, value?: string) => void;
}

const defaultFilters: FilterState = {
  categories: [],
  suppliers: [],
  decorationMethods: [],
  colors: [],
  priceRange: { min: 0, max: 100 },
  availability: 'all',
  showNonPublic: true,
  searchQuery: ''
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters, searchQuery: filters.searchQuery });
  };

  const removeFilter = (filterType: keyof FilterState, value?: string) => {
    if (filterType === 'searchQuery') {
      updateFilters({ searchQuery: '' });
    } else if (Array.isArray(filters[filterType]) && value) {
      const currentArray = filters[filterType] as string[];
      updateFilters({ [filterType]: currentArray.filter(v => v !== value) });
    } else if (filterType === 'availability') {
      updateFilters({ availability: 'all' });
    } else if (filterType === 'showNonPublic') {
      updateFilters({ showNonPublic: true });
    }
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, clearFilters, removeFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}
