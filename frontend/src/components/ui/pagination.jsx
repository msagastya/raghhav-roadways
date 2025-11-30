'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const PageButton = ({ page, isActive = false, disabled = false, onClick }) => (
    <motion.button
      whileHover={!disabled && !isActive ? { scale: 1.05 } : {}}
      whileTap={!disabled && !isActive ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled || isActive}
      className={`
        min-w-[2.5rem] h-10 px-3 rounded-lg font-medium transition-all
        ${isActive
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
          : disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }
      `}
    >
      {page}
    </motion.button>
  );

  const NavButton = ({ Icon, onClick, disabled, label }) => (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        h-10 w-10 rounded-lg transition-all flex items-center justify-center
        ${disabled
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
        }
      `}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items Info */}
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-gray-900">{startItem}</span> to{' '}
        <span className="font-semibold text-gray-900">{endItem}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalItems}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* First Page */}
        <NavButton
          Icon={ChevronsLeft}
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          label="First page"
        />

        {/* Previous Page */}
        <NavButton
          Icon={ChevronLeft}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          label="Previous page"
        />

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            ) : (
              <PageButton
                key={page}
                page={page}
                isActive={page === currentPage}
                onClick={() => onPageChange(page)}
              />
            )
          )}
        </div>

        {/* Current Page (Mobile) */}
        <div className="sm:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
          {currentPage} / {totalPages}
        </div>

        {/* Next Page */}
        <NavButton
          Icon={ChevronRight}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          label="Next page"
        />

        {/* Last Page */}
        <NavButton
          Icon={ChevronsRight}
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          label="Last page"
        />

        {/* Items Per Page */}
        {showItemsPerPage && onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="ml-2 h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination;
