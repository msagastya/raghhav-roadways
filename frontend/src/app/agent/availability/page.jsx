'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, RefreshCw } from 'lucide-react';
import { agentAvailabilityAPI, agentVehicleAPI } from '@/lib/agentApi';

export default function AgentAvailabilityPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [vehicles, setVehicles] = useState([]);
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({ vehicleId: '', date: today, isAvailable: true, preferredRoutes: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [vehiclesRes, availabilityRes] = await Promise.all([
        agentVehicleAPI.getAll({ limit: 100 }),
        agentAvailabilityAPI.getAll({ startDate: today }),
      ]);
      const vehicleList = vehiclesRes.data?.data?.vehicles || [];
      setVehicles(vehicleList);
      setRecords(availabilityRes.data?.data || []);
      setFormData((current) => ({ ...current, vehicleId: current.vehicleId || vehicleList[0]?.id || '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await agentAvailabilityAPI.set({
        ...formData,
        vehicleId: Number(formData.vehicleId),
        isAvailable: formData.isAvailable === true || formData.isAvailable === 'true',
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">Tell the office which vehicle is free for loading.</p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={loadData} className="inline-flex items-center gap-1 font-semibold">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-5">
        <label className="block lg:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Vehicle</span>
          <select value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} required className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNo}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Date</span>
          <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-gray-700">Status</span>
          <select value={String(formData.isAvailable)} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20">
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </label>
        <button type="submit" disabled={saving || loading} className="self-end rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <label className="block md:col-span-2 lg:col-span-3">
          <span className="text-sm font-semibold text-gray-700">Preferred Routes</span>
          <input value={formData.preferredRoutes} onChange={(e) => setFormData({ ...formData, preferredRoutes: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
        </label>
        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Notes</span>
          <input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20" />
        </label>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading availability...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No availability records found.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {records.map((record) => (
              <div key={record.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="font-semibold text-gray-900">{record.vehicle?.vehicleNo || record.vehicleNo || 'Vehicle'}</p>
                  <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString('en-IN')} {record.preferredRoutes ? `| ${record.preferredRoutes}` : ''}</p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${record.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {record.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
