'use client';

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Button from './button';
import { DeleteConfirmDialog } from './confirm-dialog';

// Sortable Table Header
export const SortableHeader = ({ column, currentSort, onSort, children }) => {
  const isActive = currentSort?.column === column;
  const direction = currentSort?.direction;

  const handleClick = () => {
    if (isActive) {
      // Cycle through: asc -> desc -> none
      if (direction === 'asc') {
        onSort({ column, direction: 'desc' });
      } else {
        onSort(null);
      }
    } else {
      onSort({ column, direction: 'asc' });
    }
  };

  return (
    <th
      onClick={handleClick}
      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <div className="flex flex-col">
          {isActive ? (
            direction === 'asc' ? (
              <ChevronUp className="w-4 h-4 text-primary-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-primary-600" />
            )
          ) : (
            <ChevronsUpDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
    </th>
  );
};

// Checkbox Cell for Bulk Selection
export const SelectCell = ({ checked, onChange, disabled = false }) => {
  return (
    <td className="px-6 py-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      />
    </td>
  );
};

// Bulk Actions Toolbar
export const BulkActionsBar = ({ selectedCount, onDelete, onCancel, customActions = [] }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    setShowDeleteConfirm(false);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-primary-50 border border-primary-200 rounded-lg px-6 py-4 mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-primary-900">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Custom Actions */}
          {customActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant="outline"
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* Delete Button */}
          {onDelete && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="danger"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          )}

          {/* Cancel Button */}
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
        </div>
      </motion.div>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={`${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}`}
        loading={deleting}
      />
    </>
  );
};

// Enhanced Table Component with Sorting and Selection
export const EnhancedTable = ({
  columns,
  data,
  sortable = false,
  selectable = false,
  onSort,
  currentSort,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  onBulkDelete,
  loading = false,
  emptyState,
  className = '',
}) => {
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  return (
    <div className={className}>
      {/* Bulk Actions Bar */}
      {selectable && selectedRows.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedRows.length}
          onDelete={onBulkDelete}
          onCancel={() => onSelectAll([])}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected)}
                    onChange={(e) =>
                      e.target.checked
                        ? onSelectAll(data.map((row) => row.id))
                        : onSelectAll([])
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((column) =>
                sortable && column.sortable !== false ? (
                  <SortableHeader
                    key={column.key}
                    column={column.key}
                    currentSort={currentSort}
                    onSort={onSort}
                  >
                    {column.label}
                  </SortableHeader>
                ) : (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {column.label}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      <p className="mt-2 text-sm text-gray-600">Loading...</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-12">
                  {emptyState}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <motion.tr
                  key={row.id || rowIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedRows.includes(row.id) ? 'bg-primary-50' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  {selectable && (
                    <SelectCell
                      checked={selectedRows.includes(row.id)}
                      onChange={() => onSelectRow(row.id)}
                    />
                  )}

                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnhancedTable;
