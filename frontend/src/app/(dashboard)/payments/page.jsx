'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { paymentAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import StatusBadge from '../../../components/ui/status-badge';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const { showError, showSuccess } = useToast();

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getAll({ limit: 100 });
      const data = response.data?.data?.data || [];
      setPayments(data);
      setStats({
        total: data.length,
        pending: data.filter((p) => p.status === 'PENDING').length,
        completed: data.filter((p) => p.status === 'COMPLETED').length,
      });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Delete payment ${payment.paymentNumber}?`)) return;
    try {
      await paymentAPI.delete(payment.id);
      showSuccess('Payment deleted');
      fetchPayments();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const columns = [
    { accessor: 'paymentNumber', label: 'Payment#', render: (v) => <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{v}</span> },
    { accessor: 'paymentDate', label: 'Date', render: (v) => formatDate(v, 'dd/MMM') },
    { accessor: 'partyName', label: 'Party', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'totalAmount', label: 'Amount', render: (v) => <span className="font-mono text-xs">{formatCurrency(v)}</span> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v?.toLowerCase()} size="xs" /> },
  ];

  const filtered = payments.filter(
    (p) => p.paymentNumber?.toLowerCase().includes(search.toLowerCase()) ||
           p.partyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Money Flow"
        subtitle="Track payments and collections"
        icon={DollarSign}
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Completed', value: stats.completed },
        ]}
        actionLabel="Record Payment"
        onAction={() => router.push('/payments/new')}
      />
      <FilterBar placeholder="Search payment#, party..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        expandable
        onRowClick={(row) => router.push(`/payments/${row.id}`)}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Mode</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.paymentMode || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Reference</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.reference || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Invoice</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.invoiceNumber || '-'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/payments/${row.id}/edit`}>
                <Button variant="secondary" size="sm" className="w-full">
                  <Edit className="w-3 h-3" /> Edit
                </Button>
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                className="flex-1 px-2 py-1 text-xs rounded-lg bg-red-500/20 text-red-600 dark:text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-3 h-3 inline mr-1" /> Delete
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
