import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';

export default function SessionFilters({ filters, onChange }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Sync external filter changes (like clear filters) back to local state
  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (filters.search !== localSearch) {
        onChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, filters, onChange]);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onChange({ search: '', category: '', ordering: '-date_time', page: 1 });
  };

  const hasActiveFilters = filters.search || filters.category;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
        />
        <input
          type="text"
          placeholder="Search sessions..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Category pills */}
      <div>
        <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleChange('category', '')}
            className={`badge border transition-all ${
              !filters.category
                ? 'bg-primary/20 text-primary-light border-primary/30'
                : 'bg-surface-light text-text-muted border-border hover:border-primary/20'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleChange('category', cat.value)}
              className={`badge border transition-all ${
                filters.category === cat.value
                  ? 'bg-primary/20 text-primary-light border-primary/30'
                  : 'bg-surface-light text-text-muted border-border hover:border-primary/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-3">
        <SlidersHorizontal size={14} className="text-text-dim" />
        <select
          value={filters.ordering || '-date_time'}
          onChange={(e) => handleChange('ordering', e.target.value)}
          className="input-field text-sm py-1.5 w-auto"
        >
          <option value="-date_time">Newest First</option>
          <option value="date_time">Oldest First</option>
          <option value="price">Price: Low → High</option>
          <option value="-price">Price: High → Low</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-danger hover:text-danger/80 transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
