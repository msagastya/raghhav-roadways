'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Truck } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageLoader from '@/components/ui/loading';
import { vehicleAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useToast from '@/hooks/useToast';

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value || '-'}</p>
  </div>
);

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '-');

export default function VehicleDetailPage() {
  const { id } = useParams();
  const { showError } = useToast();
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

  if (loading) return <PageLoader message="Loading vehicle..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/vehicles" className="rounded-lg p-2 text-gray-600 transition hover:bg-white/60 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">{vehicle?.vehicleNo || 'Vehicle'}</h1>
            </div>
            <p className="mt-1 text-gray-600">Vehicle profile and document status</p>
          </div>
        </div>
        <Link href={`/vehicles/${id}/edit`}>
          <Button>
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <Card animate={false}>
        <CardContent className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
          <Detail label="Status" value={<Badge variant={vehicle?.isActive ? 'success' : 'danger'}>{vehicle?.isActive ? 'Active' : 'Inactive'}</Badge>} />
          <Detail label="Type" value={vehicle?.vehicleType} />
          <Detail label="Capacity" value={vehicle?.vehicleCapacity} />
          <Detail label="Owner Type" value={vehicle?.ownerType} />
          <Detail label="Owner / Agent" value={vehicle?.ownerName} />
          <Detail label="Owner Mobile" value={vehicle?.ownerMobile} />
          <Detail label="Driver Name" value={vehicle?.driverName} />
          <Detail label="Driver Mobile" value={vehicle?.driverMobile} />
          <Detail label="Driver License" value={vehicle?.driverLicense} />
          <Detail label="RC Number" value={vehicle?.rcNumber} />
          <Detail label="RC Expiry" value={formatDate(vehicle?.rcExpiry)} />
          <Detail label="Insurance Expiry" value={formatDate(vehicle?.insuranceExpiry)} />
          <Detail label="Fitness Expiry" value={formatDate(vehicle?.fitnessExpiry)} />
          <Detail label="Pollution Expiry" value={formatDate(vehicle?.pollutionExpiry)} />
          <Detail label="Notes" value={vehicle?.notes} />
        </CardContent>
      </Card>
    </div>
  );
}
