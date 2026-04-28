'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, Truck, AlertTriangle } from 'lucide-react';
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
  const { showError, showSuccess } = useToast();

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
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

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete vehicle ${vehicle.vehicleNumber}?`)) return;
    try {
      await vehicleAPI.delete(vehicle.id);
      showSuccess('Vehicle deleted');
      fetchVehicles();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const expiringDocs = vehicles.filter((v) => v.documentsExpiringDays <= 30);

  const columns = [
    { accessor: 'vehicleNumber', label: 'Vehicle#', render: (v) => <span className="font-mono font-bold">{v}</span> },
    { accessor: 'vehicleType', label: 'Type', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'ownerName', label: 'Owner', render: (v) => <span className="text-xs">{v}</span> },
    { accessor: 'rcExpiryDate', label: 'RC Expiry', render: (v) => <span className="text-xs">{formatDate(v, 'dd/MMM/yy')}</span> },
    { accessor: 'insuranceExpiryDate', label: 'Insurance', render: (v) => <span className="text-xs">{formatDate(v, 'dd/MMM/yy')}</span> },
  ];

  const filtered = vehicles.filter(
    (v) => v.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
           v.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
           v.vehicleType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {expiringDocs.length > 0 && (
        <GlassPanel tier={2} className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>{expiringDocs.length}</strong> vehicle{expiringDocs.length > 1 ? 's have' : ' has'} documents expiring within 30 days
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
      <FilterBar placeholder="Search vehicle#, owner, type..." onSearch={setSearch} activeFilterCount={search ? 1 : 0} />
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        expandable
        onRowClick={(row) => router.push(`/vehicles/${row.id}`)}
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Driver</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.driverName || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Capacity</p>
              <p className="text-sm text-gray-900 dark:text-white">{row.capacity ? `${row.capacity} ${row.capacityUnit}` : '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60 mb-1">Permit Expiry</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatDate(row.permitExpiryDate, 'dd/MMM/yy')}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/vehicles/${row.id}/edit`}>
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
