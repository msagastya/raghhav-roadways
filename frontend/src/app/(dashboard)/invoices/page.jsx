'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Receipt } from 'lucide-react';
import { invoiceAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import StatusBadge from '../../../components/ui/status-badge';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, partial: 0, paid: 0 });
  const { showError, showSuccess } = useToast();

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceAPI.getAll({ limit: 100 });
      const data = response.data?.data?.data || [];
      setInvoices(data);
      setStats({
        total: data.length,
        pending: data.filter((i) => i.status === 'PENDING').length,
        partial: data.filter((i) => i.status === 'PARTIAL').length,
        paid: data.filter((i) => i.status === 'PAID').length,
      });
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete ${invoice.invoiceNumber}?`)) return;
    try {
      await invoiceAPI.delete(invoice.id);
      showSuccess('Invoice deleted');
      fetchInvoices();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const columns = [
    { accessor: 'invoiceNumber', label: 'Invoice#', render: (v) => <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{v}</span> },
    { accessor: 'invoiceDate', label: 'Date', render: (v) => formatDate(v, 'dd/MMM') },
    { accessor: 'partyName', label: 'Party', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'totalAmount', label: 'Total', render: (v) => <span className="font-mono text-xs">{formatCurrency(v)}</span> },
    { accessor: 'paidAmount', label: 'Paid', render: (v) => <span className="font-mono text-xs text-green-600 dark:text-green-400">{formatCurrency(v)}</span> },
    { accessor: 'status', label: 'Status', render: (v) => <StatusBadge status={v?.toLowerCase()} size="xs" /> },
  ];

  const filtered = invoices.filter(
    (i) => i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
           i.partyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Hub"
        subtitle="Manage invoices and billing"
        icon={Receipt}
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Pending', value: stats.pending },
          { label: 'Paid', value: stats.paid },
        ]}
        actionLabel="New Invoice"
        onAction={() => router.push('/invoices/new')}
      />
      <FilterBar placeholder="Search invoice#, party..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        expandable
        onRowClick={(row) => router.push(`/invoices/${row.id}`)}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">GR Count</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.consignmentCount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Balance</p>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{formatCurrency((row.totalAmount || 0) - (row.paidAmount || 0))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Due Date</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatDate(row.dueDate, 'dd/MMM/yy') || '-'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/invoices/${row.id}/edit`}>
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
