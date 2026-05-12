'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Truck } from 'lucide-react';
import VehicleForm from '@/components/forms/VehicleForm';
import { Card, CardContent } from '@/components/ui/card';
import PageLoader from '@/components/ui/loading';
import { vehicleAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useToast from '@/hooks/useToast';

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const response = await vehicleAPI.getById(id);
        setVehicle(response.data.data);
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [id, showError]);

  const handleSubmit = async (payload) => {
    try {
      await vehicleAPI.update(id, payload);
      showSuccess('Vehicle updated successfully');
      router.push(`/vehicles/${id}`);
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  if (loading) return <PageLoader message="Loading vehicle..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/vehicles/${id}`} className="rounded-lg p-2 text-gray-600 transition hover:bg-white/60 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle</h1>
          </div>
          <p className="mt-1 text-gray-600">{vehicle?.vehicleNo}</p>
        </div>
      </div>

      <Card animate={false}>
        <CardContent className="p-4 sm:p-6">
          {vehicle ? <VehicleForm initialData={vehicle} onSubmit={handleSubmit} submitLabel="Update Vehicle" /> : null}
        </CardContent>
      </Card>
    </div>
  );
}
