'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, RefreshCw, Truck } from 'lucide-react';
import { agentVehicleAPI } from '@/lib/agentApi';

export default function AgentVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await agentVehicleAPI.getAll({ limit: 100 });
      setVehicles(response.data?.data?.vehicles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="mt-1 text-sm text-gray-500">Manage vehicles registered under your agent profile.</p>
        </div>
        <Link href="/agent/vehicles/new" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={loadVehicles} className="inline-flex items-center gap-1 font-semibold">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Truck className="h-10 w-10 text-gray-300" />
            <div>
              <p className="font-semibold text-gray-900">No vehicles added yet</p>
              <p className="text-sm text-gray-500">Add your first vehicle for verification.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-semibold text-gray-900">{vehicle.vehicleNo}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {[vehicle.vehicleType, vehicle.vehicleCapacity && `${vehicle.vehicleCapacity} MT`, vehicle.driverName].filter(Boolean).join(' | ') || 'Details pending'}
                  </p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${vehicle.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {vehicle.isVerified ? 'Verified' : 'Pending verification'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
