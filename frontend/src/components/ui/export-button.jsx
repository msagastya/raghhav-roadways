'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, File } from 'lucide-react';
import Button from './button';
import { downloadCSV, downloadExcel, generateFilename } from '../../lib/export';

const ExportButton = ({
  data,
  columns,
  filename = 'export',
  disabled = false,
  variant = 'outline',
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExportCSV = () => {
    const fullFilename = generateFilename(filename, 'csv');
    downloadCSV(data, fullFilename, columns);
    setShowMenu(false);
  };

  const handleExportExcel = () => {
    const fullFilename = generateFilename(filename, 'xls');
    downloadExcel(data, fullFilename, columns);
    setShowMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant={variant}
        disabled={disabled || !data || data.length === 0}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <button
              onClick={handleExportCSV}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Export as CSV</div>
                <div className="text-xs text-gray-500">Comma-separated values</div>
              </div>
            </button>

            <button
              onClick={handleExportExcel}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
            >
              <File className="w-4 h-4 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">Export as Excel</div>
                <div className="text-xs text-gray-500">Microsoft Excel format</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
};

export default ExportButton;
