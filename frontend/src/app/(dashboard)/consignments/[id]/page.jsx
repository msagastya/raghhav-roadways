'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Truck, DollarSign, Calendar } from 'lucide-react';
import { consignmentAPI } from '../../../../lib/api';
import PageHeader from '../../../../components/ui/page-header';
import GlassPanel from '../../../../components/ui/glass-panel';
import StatusBadge from '../../../../components/ui/status-badge';
import useToast from '../../../../hooks/useToast';

export default function ConsignmentDetailPage() {
  const params = useParams();
  const [consignment, setConsignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await consignmentAPI.getById(params.id);
        setConsignment(res.data?.data);
      } catch (error) {
        showError('Failed to load consignment');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="h-64 bg-white/60 dark:bg-white/10 rounded-lg animate-pulse" />;

  if (!consignment) return <div className="text-gray-500 dark:text-white/60 text-center py-12">Consignment not found</div>;

  const stats = [
    { label: 'GR#', value: consignment.grNumber },
    { label: 'Status', value: <StatusBadge status={consignment.status?.toLowerCase()} size="xs" /> },
    { label: 'Vehicle', value: consignment.vehicleNumber },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`GR #${consignment.grNumber}`}
        subtitle="Consignment Details"
        icon={MapPin}
        stats={stats}
      />

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Route</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">From</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{consignment.fromLocation}</p>
            </div>
            <div className="text-gray-400 dark:text-white/40">&rarr;</div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">To</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{consignment.toLocation}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financial</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60 text-sm">Total Amount:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">&#8377;{consignment.totalAmount || 0}</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Parties</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Consignor</p>
              <p className="text-sm text-gray-900 dark:text-white">{consignment.consignor?.partyName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Consignee</p>
              <p className="text-sm text-gray-900 dark:text-white">{consignment.consignee?.partyName}</p>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cargo Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-white/60">Weight:</span>
              <span className="text-gray-900 dark:text-white">{consignment.actualWeight} {consignment.weightUnit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-white/60">Packages:</span>
              <span className="text-gray-900 dark:text-white">{consignment.noOfPackages}</span>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
