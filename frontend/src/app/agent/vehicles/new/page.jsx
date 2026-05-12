'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { agentVehicleAPI } from '@/lib/agentApi';

const initialForm = {
  vehicleNo: '',
  vehicleType: '',
  vehicleCapacity: '',
  rcNumber: '',
  rcExpiry: '',
  insuranceNumber: '',
  insuranceExpiry: '',
  fitnessExpiry: '',
  pollutionExpiry: '',
  driverName: '',
  driverMobile: '',
  driverLicense: '',
  notes: '',
};

const fields = [
  ['vehicleNo', 'Vehicle Number', 'text', true],
  ['vehicleType', 'Vehicle Type', 'text'],
  ['vehicleCapacity', 'Capacity', 'number'],
  ['rcNumber', 'RC Number', 'text'],
  ['rcExpiry', 'RC Expiry', 'date'],
  ['insuranceNumber', 'Insurance Number', 'text'],
  ['insuranceExpiry', 'Insurance Expiry', 'date'],
  ['fitnessExpiry', 'Fitness Expiry', 'date'],
  ['pollutionExpiry', 'Pollution Expiry', 'date'],
  ['driverName', 'Driver Name', 'text'],
  ['driverMobile', 'Driver Mobile', 'tel'],
  ['driverLicense', 'Driver License', 'text'],
];

export default function NewAgentVehiclePage() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') payload[key] = value;
    });
    payload.vehicleNo = String(payload.vehicleNo || '').replace(/[\s-]/g, '').toUpperCase();
    if (payload.vehicleCapacity) payload.vehicleCapacity = Number(payload.vehicleCapacity);

    try {
      await agentVehicleAPI.create(payload);
      router.push('/agent/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/agent/vehicles" className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Vehicle</h1>
          <p className="mt-1 text-sm text-gray-500">Vehicle will be visible after office verification.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map(([field, label, type, required]) => (
            <label key={field} className="block">
              <span className="text-sm font-semibold text-gray-700">{label}{required ? ' *' : ''}</span>
              <input
                type={type}
                required={required}
                step={type === 'number' ? '0.01' : undefined}
                value={formData[field]}
                onChange={(e) => updateField(field, e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
          ))}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-gray-700">Notes</span>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>
        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60">
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
}
