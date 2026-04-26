'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * FilterBar Component
 * Standardized filter panel for list pages
 */
export default function FilterBar({
  onSearch = null,
  onFilter = null,
  filters = [],
  activeFilterCount = 0,
  placeholder = 'Search...',
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <motion.div
      className={cn('glass-t2 rounded-lg p-4 mb-6', className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/10 rounded-lg">
          <Search className="w-4 h-4 text-gray-400 dark:text-white/50 flex-shrink-0" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40"
          />
          {searchTerm && (
            <motion.button
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
              onClick={handleClearSearch}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-4 h-4 text-gray-500 dark:text-white/60" />
            </motion.button>
          )}
        </div>

        {/* Filter Button */}
        {filters.length > 0 && (
          <motion.button
            className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white"
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-5 h-5" />
            {activeFilterCount > 0 && (
              <motion.span
                className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full text-xs font-bold text-white flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {activeFilterCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <motion.div
            className="mt-4 pt-4 border-t border-black/6 dark:border-white/10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filters.map((filter) => (
              <div key={filter.key} className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-white/70">
                  {filter.label}
                </label>
                {filter.type === 'select' ? (
                  <select
                    onChange={(e) => filter.onChange?.(e.target.value)}
                    className="bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/10 rounded text-xs text-gray-900 dark:text-white px-2 py-1.5"
                  >
                    <option value="">All</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    onChange={(e) => filter.onChange?.(e.target.value)}
                    className="bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/10 rounded text-xs text-gray-900 dark:text-white px-2 py-1.5"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder={filter.label}
                    onChange={(e) => filter.onChange?.(e.target.value)}
                    className="bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/10 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 px-2 py-1.5"
                  />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
