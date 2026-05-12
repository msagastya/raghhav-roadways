'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck } from 'lucide-react';
import VehicleForm from '@/components/forms/VehicleForm';
import { Card, CardContent } from '@/components/ui/card';
import { vehicleAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useToast from '@/hooks/useToast';

export default function CreateVehiclePage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (payload) => {
    try {
      const response = await vehicleAPI.create(payload);
      showSuccess('Vehicle created successfully');
      router.push(`/vehicles/${response.data.data.id}`);
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/vehicles" className="rounded-lg p-2 text-gray-600 transition hover:bg-white/60 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Register Vehicle</h1>
          </div>
          <p className="mt-1 text-gray-600">Add vehicle, owner, driver, and document details.</p>
        </div>
      </div>

      <Card animate={false}>
        <CardContent className="p-4 sm:p-6">
          <VehicleForm onSubmit={handleSubmit} submitLabel="Create Vehicle" />
        </CardContent>
      </Card>
    </div>
  );
}
