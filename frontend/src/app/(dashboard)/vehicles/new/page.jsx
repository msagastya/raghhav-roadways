'use client';

import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { vehicleAPI } from '../../../../lib/api';
import VehicleForm from '../../../../components/forms/VehicleForm';
import PageHeader from '../../../../components/ui/page-header';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewVehiclePage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await vehicleAPI.create(data);
      showSuccess('Vehicle registered');
      router.push('/vehicles');
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Register Vehicle" subtitle="Add vehicle to fleet" icon={Truck} />
      <VehicleForm
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Register Vehicle"
      />
    </div>
  );
}
