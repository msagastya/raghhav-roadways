'use client';

import { motion } from 'framer-motion';
import {
  Package,
  FileText,
  CreditCard,
  Users,
  Truck,
  Database,
  Search,
  Filter,
  PlusCircle,
} from 'lucide-react';
import Button from './button';

const iconMap = {
  consignments: Package,
  invoices: FileText,
  payments: CreditCard,
  parties: Users,
  vehicles: Truck,
  search: Search,
  filter: Filter,
  default: Database,
};

const EmptyState = ({
  icon = 'default',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}) => {
  const Icon = iconMap[icon] || iconMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
        {/* Animated Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-primary-200 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2 text-center"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 text-center max-w-md mb-6"
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

// Preset Empty States
export const EmptyConsignments = ({ onCreateClick }) => (
  <EmptyState
    icon="consignments"
    title="No consignments found"
    description="Get started by creating your first consignment. Track shipments from booking to delivery."
    actionLabel="Create Consignment"
    onAction={onCreateClick}
  />
);

export const EmptyInvoices = ({ onCreateClick }) => (
  <EmptyState
    icon="invoices"
    title="No invoices yet"
    description="Generate invoices from your consignments to bill your customers."
    actionLabel="Generate Invoice"
    onAction={onCreateClick}
  />
);

export const EmptyPayments = ({ onCreateClick }) => (
  <EmptyState
    icon="payments"
    title="No payments recorded"
    description="Start recording payments to track your revenue and outstanding amounts."
    actionLabel="Record Payment"
    onAction={onCreateClick}
  />
);

export const EmptyParties = ({ onCreateClick }) => (
  <EmptyState
    icon="parties"
    title="No parties added"
    description="Add consignors and consignees to manage your customer and supplier relationships."
    actionLabel="Add Party"
    onAction={onCreateClick}
  />
);

export const EmptyVehicles = ({ onCreateClick }) => (
  <EmptyState
    icon="vehicles"
    title="No vehicles registered"
    description="Register your vehicles to assign them to consignments and track their assignments."
    actionLabel="Add Vehicle"
    onAction={onCreateClick}
  />
);

export const EmptySearchResults = ({ onClearSearch }) => (
  <EmptyState
    icon="search"
    title="No results found"
    description="We couldn't find any results matching your search. Try adjusting your search terms or filters."
    actionLabel="Clear Search"
    onAction={onClearSearch}
  />
);

export const EmptyFilterResults = ({ onClearFilters }) => (
  <EmptyState
    icon="filter"
    title="No results match your filters"
    description="Try adjusting or clearing your filters to see more results."
    actionLabel="Clear Filters"
    onAction={onClearFilters}
  />
);

export default EmptyState;
