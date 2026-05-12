'use client';

import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';

const emptyVehicle = {
  vehicleNo: '',
  vehicleType: '',
  vehicleCapacity: '',
  ownerType: 'owned',
  ownerName: '',
  ownerMobile: '',
  ownerAddress: '',
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

const toDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const normalizeVehicle = (vehicle) => ({
  ...emptyVehicle,
  ...vehicle,
  vehicleCapacity: vehicle?.vehicleCapacity ? String(vehicle.vehicleCapacity) : '',
  rcExpiry: toDateInput(vehicle?.rcExpiry),
  insuranceExpiry: toDateInput(vehicle?.insuranceExpiry),
  fitnessExpiry: toDateInput(vehicle?.fitnessExpiry),
  pollutionExpiry: toDateInput(vehicle?.pollutionExpiry),
});

export default function VehicleForm({ initialData, onSubmit, submitLabel = 'Save Vehicle' }) {
  const [formData, setFormData] = useState(() => normalizeVehicle(initialData));
  const [submitting, setSubmitting] = useState(false);

  const ownerTypeOptions = useMemo(() => [
    { value: 'owned', label: 'Owned' },
    { value: 'broker', label: 'Broker / Agent' },
  ], []);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
    );

    payload.vehicleNo = String(payload.vehicleNo || '').replace(/[\s-]/g, '').toUpperCase();
    payload.vehicleCapacity = payload.vehicleCapacity ? Number(payload.vehicleCapacity) : null;

    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Vehicle Number" required placeholder="GJ01AB1234" value={formData.vehicleNo} onChange={(e) => updateField('vehicleNo', e.target.value)} />
        <Input label="Vehicle Type" placeholder="Truck / Trailer / Container" value={formData.vehicleType} onChange={(e) => updateField('vehicleType', e.target.value)} />
        <Input label="Capacity" type="number" step="0.01" placeholder="20.00" value={formData.vehicleCapacity} onChange={(e) => updateField('vehicleCapacity', e.target.value)} />
        <Select label="Owner Type" required options={ownerTypeOptions} value={formData.ownerType} onChange={(e) => updateField('ownerType', e.target.value)} />
        <Input label="Owner / Agent Name" value={formData.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} />
        <Input label="Owner Mobile" value={formData.ownerMobile} onChange={(e) => updateField('ownerMobile', e.target.value)} />
      </div>

      <Input label="Owner Address" value={formData.ownerAddress} onChange={(e) => updateField('ownerAddress', e.target.value)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="RC Number" value={formData.rcNumber} onChange={(e) => updateField('rcNumber', e.target.value)} />
        <Input label="RC Expiry" type="date" value={formData.rcExpiry} onChange={(e) => updateField('rcExpiry', e.target.value)} />
        <Input label="Insurance Number" value={formData.insuranceNumber} onChange={(e) => updateField('insuranceNumber', e.target.value)} />
        <Input label="Insurance Expiry" type="date" value={formData.insuranceExpiry} onChange={(e) => updateField('insuranceExpiry', e.target.value)} />
        <Input label="Fitness Expiry" type="date" value={formData.fitnessExpiry} onChange={(e) => updateField('fitnessExpiry', e.target.value)} />
        <Input label="Pollution Expiry" type="date" value={formData.pollutionExpiry} onChange={(e) => updateField('pollutionExpiry', e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Driver Name" value={formData.driverName} onChange={(e) => updateField('driverName', e.target.value)} />
        <Input label="Driver Mobile" value={formData.driverMobile} onChange={(e) => updateField('driverMobile', e.target.value)} />
        <Input label="Driver License" value={formData.driverLicense} onChange={(e) => updateField('driverLicense', e.target.value)} />
      </div>

      <Input label="Notes" value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} />

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          <Save className="w-4 h-4" />
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
