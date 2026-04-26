'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Info, CheckCircle, X } from 'lucide-react';
import Button from './button';

const iconMap = {
  danger: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  delete: { icon: Trash2, color: 'text-red-600', bg: 'bg-red-100' },
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const { icon: Icon, color, bg } = iconMap[variant] || iconMap.info;

  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) {
      onClose();
    }
  };

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Icon */}
              <div className="relative p-6 pb-4">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="flex justify-center mb-4"
                >
                  <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-gray-900 text-center"
                >
                  {title}
                </motion.h3>
              </div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="px-6 pb-6"
              >
                <p className="text-gray-600 text-center">{message}</p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="px-6 pb-6 flex gap-3"
              >
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={handleConfirm}
                  variant={variant === 'danger' || variant === 'delete' ? 'danger' : 'primary'}
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Processing...
                    </div>
                  ) : (
                    confirmLabel
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Preset Confirmation Dialogs
export const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirm Delete"
    message={`Are you sure you want to delete ${itemName || 'this item'}? This action cannot be undone.`}
    confirmLabel="Delete"
    cancelLabel="Cancel"
    variant="delete"
    loading={loading}
  />
);

export const CancelConfirmDialog = ({ isOpen, onClose, onConfirm, message, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirm Cancellation"
    message={message || 'Are you sure you want to cancel? Any unsaved changes will be lost.'}
    confirmLabel="Yes, Cancel"
    cancelLabel="No, Go Back"
    variant="warning"
    loading={loading}
  />
);

export const ApproveConfirmDialog = ({ isOpen, onClose, onConfirm, itemName, loading }) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Confirm Approval"
    message={`Are you sure you want to approve ${itemName || 'this item'}?`}
    confirmLabel="Approve"
    cancelLabel="Cancel"
    variant="success"
    loading={loading}
  />
);

export default ConfirmDialog;
