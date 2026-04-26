'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
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

  useEffect(() => {
    const fetchPayments = async () => {
      try {
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
    fetchPayments();
  }, []);

  const columns = [
    { accessor: 'paymentNumber', label: 'Payment#', render: (v) => <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{v}</span> },
    { accessor: 'paymentDate', label: 'Date', render: (v) => formatDate(v, 'dd/MMM') },
    { accessor: 'partyName', label: 'Party', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'totalAmount', label: 'Amount', render: (v) => <span className="font-mono text-xs">{formatCurrency(v)}</span> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v?.toLowerCase()} size="xs" /> },
  ];

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
      <DataTable columns={columns} data={payments.filter((p) => p.paymentNumber?.includes(search) || p.partyName?.includes(search))} loading={loading} />
    </div>
  );
}
