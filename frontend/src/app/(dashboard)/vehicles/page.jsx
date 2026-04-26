'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Truck, AlertTriangle } from 'lucide-react';
import { vehicleAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import FilterBar from '../../../components/ui/filter-bar';
import DataTable from '../../../components/ui/data-table';
import GlassPanel from '../../../components/ui/glass-panel';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, getErrorMessage } from '../../../lib/utils';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, owned: 0, expiring: 0 });
  const { showError } = useToast();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleAPI.getAll({ limit: 100 });
        const data = response.data?.data?.data || [];
        setVehicles(data);
        setStats({
          total: data.length,
          owned: data.filter((v) => v.ownerType === 'OWNED').length,
          expiring: data.filter((v) => v.documentsExpiringDays <= 30).length,
        });
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const expiringDocs = vehicles.filter((v) => v.documentsExpiringDays <= 30);

  const columns = [
    { accessor: 'vehicleNumber', label: 'Vehicle#', render: (v) => <span className="font-mono font-bold">{v}</span> },
    { accessor: 'vehicleType', label: 'Type', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'ownerName', label: 'Owner', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'rcExpiryDate', label: 'RC Expiry', render: (v) => <span className="text-xs">{formatDate(v, 'dd/MMM/yy')}</span> },
    { accessor: 'insuranceExpiryDate', label: 'Insurance', render: (v) => <span className="text-xs">{formatDate(v, 'dd/MMM/yy')}</span> },
  ];

  return (
    <div className="space-y-6">
      {expiringDocs.length > 0 && (
        <GlassPanel tier={2} className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{expiringDocs.length}</strong> vehicles have documents expiring within 30 days
            </p>
          </div>
        </GlassPanel>
      )}

      <PageHeader
        title="Fleet Command"
        subtitle="Manage vehicles and fleet"
        icon={Truck}
        stats={[
          { label: 'Total', value: stats.total },
          { label: 'Owned', value: stats.owned },
          { label: 'Expiring Soon', value: stats.expiring },
        ]}
        actionLabel="Register Vehicle"
        onAction={() => router.push('/vehicles/new')}
      />
      <FilterBar placeholder="Search vehicle#, owner..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable columns={columns} data={vehicles.filter((v) => v.vehicleNumber?.includes(search) || v.ownerName?.includes(search))} loading={loading} />
    </div>
  );
}
