'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { vehicleAPI } from '../../../../../lib/api';
import VehicleForm from '../../../../../components/forms/VehicleForm';
import PageHeader from '../../../../../components/ui/page-header';
import useToast from '../../../../../hooks/useToast';
import { getErrorMessage } from '../../../../../lib/utils';

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    vehicleAPI.getById(id)
      .then(res => setDefaultValues(res.data?.data || {}))
      .catch(() => { showError('Failed to load vehicle'); router.back(); });
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await vehicleAPI.update(id, data);
      showSuccess('Vehicle updated');
      router.push(`/vehicles/${id}`);
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  if (!defaultValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Vehicle" subtitle={defaultValues.vehicleNumber || id} icon={Truck} />
      <VehicleForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
