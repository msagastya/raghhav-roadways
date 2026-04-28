'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Users } from 'lucide-react';
import { partyAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

export default function PartiesPage() {
  const router = useRouter();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, consignors: 0, consignees: 0 });
  const { showError, showSuccess } = useToast();

  useEffect(() => { fetchParties(); }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
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

  const handleDelete = async (party) => {
    if (!window.confirm(`Delete "${party.partyName}"?`)) return;
    try {
      await partyAPI.delete(party.id);
      showSuccess('Party deleted');
      fetchParties();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const columns = [
    { accessor: 'partyCode', label: 'Code', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { accessor: 'partyName', label: 'Name', render: (v) => <span className="text-xs font-medium">{v}</span> },
    { accessor: 'city', label: 'City', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'gstin', label: 'GSTIN', render: (v) => <span className="font-mono text-xs text-gray-500 dark:text-white/60">{v || '-'}</span> },
    { accessor: 'phone', label: 'Phone', render: (v) => <span className="text-xs">{v || '-'}</span> },
  ];

  const filtered = parties.filter(
    (p) => p.partyName?.toLowerCase().includes(search.toLowerCase()) ||
           p.partyCode?.toLowerCase().includes(search.toLowerCase()) ||
           p.city?.toLowerCase().includes(search.toLowerCase())
  );

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
      <FilterBar placeholder="Search party name, code, city..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        expandable
        onRowClick={(row) => router.push(`/parties/${row.id}`)}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Contact Person</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.contactPerson || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Email</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">State</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.state || '-'}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/parties/${row.id}/edit`}>
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
