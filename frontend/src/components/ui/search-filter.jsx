'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import Button from './button';
import Badge from './badge';

// Search Component
export const SearchBar = ({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',
  className = '',
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        {value && (
          <button
            onClick={() => {
              onChange('');
              if (onClear) onClear();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Filter Panel Component
export const FilterPanel = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  filters,
  activeFilters = 0,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col lg:relative lg:shadow-lg lg:rounded-lg"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {activeFilters > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {activeFilters}
                  </Badge>
                )}
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <Button onClick={onReset} variant="outline" className="flex-1">
                Reset
              </Button>
              <Button onClick={onApply} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Filter Button Component
export const FilterButton = ({ onClick, activeCount = 0 }) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="relative flex items-center gap-2"
    >
      <Filter className="w-4 h-4" />
      <span className="hidden sm:inline">Filters</span>
      {activeCount > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
          {activeCount}
        </span>
      )}
    </Button>
  );
};

// Filter Select Component
export const FilterSelect = ({ label, value, onChange, options, placeholder = 'Select...' }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

// Filter Checkbox Component
export const FilterCheckbox = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 mb-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
};

// Filter Radio Component
export const FilterRadio = ({ name, label, value, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 mb-3 cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
        {label}
      </span>
    </label>
  );
};

// Active Filters Display
export const ActiveFilters = ({ filters, onRemove, onClearAll }) => {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-600">Active filters:</span>
      {filters.map((filter) => (
        <motion.div
          key={filter.key}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
        >
          <span className="font-medium">{filter.label}:</span>
          <span>{filter.value}</span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};

export default SearchBar;
