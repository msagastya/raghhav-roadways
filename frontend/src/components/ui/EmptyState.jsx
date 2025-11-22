'use client';

import { motion } from 'framer-motion';
import { FileX, Search, Package, Truck, Users, FileText, CreditCard, Plus } from 'lucide-react';
import Button from './button';

const ICONS = {
  default: FileX,
  search: Search,
  package: Package,
  truck: Truck,
  users: Users,
  invoice: FileText,
  payment: CreditCard,
};

export default function EmptyState({
  icon = 'default',
  title = 'No data found',
  description = 'There are no items to display.',
  actionLabel,
  onAction,
  actionIcon = Plus,
  className = '',
}) {
  const Icon = ICONS[icon] || ICONS.default;
  const ActionIcon = actionIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4"
      >
        <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} className="flex items-center gap-2">
            <ActionIcon className="w-4 h-4" />
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

// Pre-configured empty states for common scenarios
export const ConsignmentEmptyState = ({ onAction }) => (
  <EmptyState
    icon="truck"
    title="No consignments yet"
    description="Start by creating your first consignment to track shipments."
    actionLabel="Create Consignment"
    onAction={onAction}
  />
);

export const InvoiceEmptyState = ({ onAction }) => (
  <EmptyState
    icon="invoice"
    title="No invoices found"
    description="Create invoices from delivered consignments."
    actionLabel="Create Invoice"
    onAction={onAction}
  />
);

export const PaymentEmptyState = ({ onAction }) => (
  <EmptyState
    icon="payment"
    title="No payments recorded"
    description="Record payments against invoices to track collections."
    actionLabel="Record Payment"
    onAction={onAction}
  />
);

export const SearchEmptyState = ({ query }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description={`No items match "${query}". Try a different search term.`}
  />
);

export const PartyEmptyState = ({ onAction }) => (
  <EmptyState
    icon="users"
    title="No parties added"
    description="Add consignors, consignees, and other parties to get started."
    actionLabel="Add Party"
    onAction={onAction}
  />
);
