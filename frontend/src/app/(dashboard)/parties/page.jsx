'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, Grid, List } from 'lucide-react';
import { partyAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, getErrorMessage } from '../../../lib/utils';

export default function PartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({ total: 0, consignors: 0, consignees: 0 });
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await partyAPI.getAll({ limit: 100 });
        const data = response.data?.data?.data || [];
        setParties(data);
        setStats({
          total: data.length,
          consignors: data.filter((p) => p.isConsignor).length,
          consignees: data.filter((p) => p.isConsignee).length,
        });
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchParties();
  }, []);

  const columns = [
    { accessor: 'partyCode', label: 'Code', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { accessor: 'partyName', label: 'Name', render: (v) => <span className="text-xs font-medium">{v}</span> },
    { accessor: 'city', label: 'City', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'gstin', label: 'GSTIN', render: (v) => <span className="font-mono text-xs text-gray-500 dark:text-white/60">{v || '-'}</span> },
    { accessor: 'creditLimit', label: 'Credit Limit', render: (v) => <span className="text-xs">{v || '-'}</span> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Network Hub"
        subtitle="Manage parties and contacts"
        icon={Users}
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Consignors', value: stats.consignors },
          { label: 'Consignees', value: stats.consignees },
        ]}
        actionLabel="Add Party"
        onAction={() => router.push('/parties/new')}
      />
      <FilterBar placeholder="Search party name, code..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable columns={columns} data={parties.filter((p) => p.partyName?.includes(search) || p.partyCode?.includes(search))} loading={loading} />
    </div>
  );
}
