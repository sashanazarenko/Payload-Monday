import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useFilters } from '../context/FilterContext';
import { getActiveFilterCount } from '../utils/filterProducts';

interface FilterGroup {
  title: string;
  type: 'checkbox' | 'color' | 'range' | 'radio' | 'toggle';
  options?: { label: string; value: string; color?: string }[];
  open: boolean;
}

const initialFilterGroups: FilterGroup[] = [
  {
    title: 'Category',
    type: 'checkbox',
    open: true,
    options: [
      { label: 'Bags', value: 'bags' },
      { label: 'Apparel', value: 'apparel' },
      { label: 'Drinkware', value: 'drinkware' },
      { label: 'Tech', value: 'tech' },
      { label: 'Writing', value: 'writing' },
      { label: 'Headwear', value: 'headwear' },
      { label: 'Other', value: 'other' },
    ]
  },
  {
    title: 'Supplier',
    type: 'checkbox',
    open: true,
    options: [
      { label: 'Balmain', value: 'balmain' },
      { label: 'Bullet', value: 'bullet' },
      { label: 'Avenue', value: 'avenue' },
      { label: 'Legend', value: 'legend' },
    ]
  },
  {
    title: 'Decoration Method',
    type: 'checkbox',
    open: true,
    options: [
      { label: 'Screen Print', value: 'screen' },
      { label: 'Embroidery', value: 'embroidery' },
      { label: 'Laser Engrave', value: 'laser' },
      { label: 'Digital Print', value: 'digital' },
    ]
  },
  {
    title: 'Colour',
    type: 'color',
    open: false,
    options: [
      { label: 'Black', value: 'black', color: '#000000' },
      { label: 'White', value: 'white', color: '#FFFFFF' },
      { label: 'Red', value: 'red', color: '#E53935' },
      { label: 'Blue', value: 'blue', color: '#1E88E5' },
      { label: 'Green', value: 'green', color: '#43A047' },
      { label: 'Yellow', value: 'yellow', color: '#FDD835' },
      { label: 'Orange', value: 'orange', color: '#FB8C00' },
      { label: 'Navy', value: 'navy', color: '#1A237E' },
    ]
  },
  {
    title: 'Price Range',
    type: 'range',
    open: false,
  },
  {
    title: 'Availability',
    type: 'radio',
    open: false,
    options: [
      { label: 'All', value: 'all' },
      { label: 'In Stock Only', value: 'in-stock' },
      { label: 'Made to Order', value: 'made-to-order' },
    ]
  }
];

export function FilterSidebar() {
  const { filters, updateFilters, clearFilters } = useFilters();
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(initialFilterGroups);
  const [minPrice, setMinPrice] = useState(filters.priceRange.min.toString());
  const [maxPrice, setMaxPrice] = useState(filters.priceRange.max.toString());

  const activeFilterCount = getActiveFilterCount(filters);

  const toggleGroup = (index: number) => {
    setFilterGroups(filterGroups.map((f, i) => i === index ? { ...f, open: !f.open } : f));
  };

  const toggleArrayFilter = (filterKey: keyof typeof filters, value: string) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    updateFilters({ [filterKey]: newArray });
  };

  const handlePriceChange = () => {
    const min = parseFloat(minPrice) || 0;
    const max = parseFloat(maxPrice) || 100;
    updateFilters({ priceRange: { min, max } });
  };

  return (
    <div className="w-56 h-full overflow-y-auto p-4" style={{ backgroundColor: 'var(--jolly-bg)' }}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: 'var(--jolly-text-body)' }}>Filters</span>
      </div>

      {/* Filter Groups */}
      <div className="space-y-2">
        {filterGroups.map((group, index) => (
          <div key={group.title} className="bg-white rounded p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)' }}>
            <button 
              onClick={() => toggleGroup(index)}
              className="w-full flex items-center justify-between mb-2"
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--jolly-text-body)' }}>
                {group.title}
              </span>
              {group.open ? 
                <ChevronDown size={16} style={{ color: 'var(--jolly-text-disabled)' }} /> : 
                <ChevronRight size={16} style={{ color: 'var(--jolly-text-disabled)' }} />
              }
            </button>
            
            {group.open && (
              <div className="space-y-2">
                {group.type === 'checkbox' && group.options?.map((option) => {
                  const filterKey = group.title === 'Category' ? 'categories' :
                                   group.title === 'Supplier' ? 'suppliers' :
                                   'decorationMethods';
                  const isChecked = (filters[filterKey] as string[]).includes(option.value);
                  
                  return (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => toggleArrayFilter(filterKey, option.value)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ 
                          accentColor: 'var(--jolly-primary)',
                          borderColor: 'var(--jolly-border)'
                        }}
                      />
                      <span className="text-sm group-hover:underline" style={{ color: 'var(--jolly-text-body)' }}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}

                {group.type === 'color' && (
                  <div className="grid grid-cols-4 gap-2">
                    {group.options?.map((option) => {
                      const isSelected = filters.colors.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayFilter('colors', option.value)}
                          className="w-8 h-8 rounded border-2 transition-all"
                          style={{
                            backgroundColor: option.color,
                            borderColor: isSelected ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                            boxShadow: isSelected ? '0 0 0 2px var(--jolly-surface)' : 'none'
                          }}
                          title={option.label}
                        />
                      );
                    })}
                  </div>
                )}

                {group.type === 'range' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs block mb-1" style={{ color: 'var(--jolly-text-secondary)' }}>Min</label>
                        <input 
                          type="number" 
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          onBlur={handlePriceChange}
                          placeholder="$0" 
                          className="w-full px-2 py-1 text-xs rounded border"
                          style={{ borderColor: 'var(--jolly-border)' }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs block mb-1" style={{ color: 'var(--jolly-text-secondary)' }}>Max</label>
                        <input 
                          type="number" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          onBlur={handlePriceChange}
                          placeholder="$100" 
                          className="w-full px-2 py-1 text-xs rounded border"
                          style={{ borderColor: 'var(--jolly-border)' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {group.type === 'radio' && group.options?.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="availability"
                      value={option.value}
                      checked={filters.availability === option.value}
                      onChange={() => updateFilters({ availability: option.value as any })}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--jolly-primary)' }}
                    />
                    <span className="text-sm group-hover:underline" style={{ color: 'var(--jolly-text-body)' }}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Show non-public toggle */}
        <div className="bg-white rounded p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)' }}>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-semibold" style={{ color: 'var(--jolly-text-body)' }}>
              Show non-public
            </span>
            <div className="relative">
              <input 
                type="checkbox"
                checked={filters.showNonPublic}
                onChange={(e) => updateFilters({ showNonPublic: e.target.checked })}
                className="sr-only peer"
              />
              <div 
                className="w-10 h-5 rounded-full peer transition-colors cursor-pointer"
                style={{
                  backgroundColor: filters.showNonPublic ? 'var(--jolly-primary)' : 'var(--jolly-border)',
                }}
                onClick={() => updateFilters({ showNonPublic: !filters.showNonPublic })}
              >
                <div 
                  className="absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all"
                  style={{
                    left: filters.showNonPublic ? 'calc(100% - 18px)' : '2px'
                  }}
                />
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}