'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, MapPin, Truck } from 'lucide-react';
import { consignmentAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import StatusBadge from '../../../components/ui/status-badge';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

export default function ConsignmentsPage() {
  const router = useRouter();
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, booked: 0, transit: 0, delivered: 0 });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchConsignments();
  }, []);

  const fetchConsignments = async () => {
    try {
      setLoading(true);
      const response = await consignmentAPI.getAll({ limit: 100 });
      const data = response.data?.data?.data || [];
      setConsignments(data);

      // Calculate stats
      setStats({
        total: data.length,
        booked: data.filter((c) => c.status === 'BOOKED').length,
        transit: data.filter((c) => c.status === 'IN_TRANSIT').length,
        delivered: data.filter((c) => c.status === 'DELIVERED').length,
      });
    } catch (error) {
      showError(getErrorMessage(error));
      setConsignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (consignment) => {
    if (!window.confirm(`Delete GR #${consignment.grNumber}?`)) return;

    try {
      await consignmentAPI.delete(consignment.id);
      showSuccess('Deleted');
      fetchConsignments();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const filteredConsignments = (consignments || []).filter((c) =>
    c?.grNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c?.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c?.fromLocation?.toLowerCase().includes(search.toLowerCase()) ||
    c?.toLocation?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      accessor: 'grNumber',
      label: 'GR#',
      render: (value) => (
        <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{value}</span>
      ),
    },
    {
      accessor: 'consignmentDate',
      label: 'Date',
      render: (value) => formatDate(value, 'dd/MMM'),
    },
    {
      accessor: 'route',
      label: 'Route',
      render: (value, row) => (
        <div className="flex items-center gap-1 text-xs">
          <span>{row.fromLocation}</span>
          <span className="text-gray-400 dark:text-white/40">&rarr;</span>
          <span>{row.toLocation}</span>
        </div>
      ),
    },
    {
      accessor: 'vehicleNumber',
      label: 'Vehicle',
      render: (value) => <span className="text-xs">{value}</span>,
    },
    {
      accessor: 'consignorName',
      label: 'Party',
      render: (value) => <span className="text-xs truncate">{value}</span>,
    },
    {
      accessor: 'amount',
      label: 'Amount',
      render: (value) => <span className="font-mono text-xs">{formatCurrency(value)}</span>,
    },
    {
      accessor: 'status',
      label: 'Status',
      render: (value) => (
        <StatusBadge status={value?.toLowerCase() || 'booked'} size="xs" />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Shipment Tracker"
        subtitle="Track and manage all consignments"
        icon={MapPin}
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Booked', value: stats.booked },
          { label: 'Transit', value: stats.transit },
          { label: 'Delivered', value: stats.delivered },
        ]}
        action={<Plus className="w-4 h-4" />}
        actionLabel="New Consignment"
        onAction={() => router.push('/consignments/new')}
      />

      {/* Filter Bar */}
      <FilterBar
        placeholder="Search GR#, vehicle, location..."
        onSearch={setSearch}
        activeFilterCount={search ? 1 : 0}
        filters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Booked', value: 'BOOKED' },
              { label: 'In Transit', value: 'IN_TRANSIT' },
              { label: 'Delivered', value: 'DELIVERED' },
            ],
            onChange: (value) => {
              // Handle filter change
            },
          },
          {
            key: 'dateFrom',
            label: 'From Date',
            type: 'date',
          },
          {
            key: 'dateTo',
            label: 'To Date',
            type: 'date',
          },
        ]}
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredConsignments}
        loading={loading}
        expandable={true}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Consignee</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.consigneeName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Weight</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.weight} {row.weightUnit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Description</p>
              <p className="text-sm text-gray-900 dark:text-white truncate">{row.description}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/consignments/${row.id}/edit`}>
                <Button variant="secondary" size="sm" className="w-full">
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
              </Link>
              <button
                onClick={() => handleDelete(row)}
                className="flex-1 px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}
        emptyState={
          <div className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-300 dark:text-white/10 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-white/60">No consignments found</p>
            <Link href="/consignments/new">
              <Button className="mt-4" size="sm">
                Create First Consignment
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
