'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * DataTable Component
 * Modern glass-styled table with:
 * - Glass-t1 rows with hover glow
 * - Expandable rows with smooth animation
 * - Skeleton loading support
 * - Empty state handling
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  expandable = false,
  renderExpandedRow = null,
  emptyState = null,
  onRowClick = null,
  className = '',
}) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpanded = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Skeleton row
  if (loading && data.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="glass-t1 h-16 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="glass-t2 rounded-lg p-8 text-center">
        {emptyState || (
          <div>
            <p className="text-gray-500 dark:text-white/50 text-sm mb-2">No data found</p>
            <p className="text-gray-400 dark:text-white/30 text-xs">Try adjusting your filters or add new items</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Table Rows */}
      {data.map((row, idx) => {
        const rowId = row.id || idx;
        const isExpanded = expandedRows[rowId];

        return (
          <motion.div
            key={rowId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {/* Main Row */}
            <motion.div
              className={cn(
                'glass-t1 rounded-lg px-4 py-3 h-16 flex items-center gap-4 cursor-pointer',
                'hover:bg-white/[0.60] hover:border-black/[0.08] dark:hover:bg-white/[0.08]',
                'transition-all duration-200'
              )}
              onClick={() => {
                if (expandable) {
                  toggleExpanded(rowId);
                }
                if (onRowClick) {
                  onRowClick(row);
                }
              }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Expand button */}
              {expandable && renderExpandedRow && (
                <motion.button
                  className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(rowId);
                  }}
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-white/60" />
                </motion.button>
              )}

              {/* Row Cells */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                {columns.map((col) => (
                  <div
                    key={col.accessor}
                    className={cn(
                      'text-sm text-gray-700 dark:text-white/80 truncate',
                      col.width && `flex-shrink-0 w-${col.width}`
                    )}
                    style={col.width ? { width: col.width } : {}}
                  >
                    {col.render
                      ? col.render(row[col.accessor], row)
                      : row[col.accessor]}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Expanded Row */}
            <AnimatePresence>
              {isExpanded && renderExpandedRow && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <motion.div className="glass-t2 rounded-lg mt-1 p-4 ml-6">
                    {renderExpandedRow(row)}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
