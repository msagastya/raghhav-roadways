'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, Edit, ArrowLeft, AlertTriangle } from 'lucide-react';
import { vehicleAPI } from '../../../../lib/api';
import PageHeader from '../../../../components/ui/page-header';
import GlassPanel from '../../../../components/ui/glass-panel';
import Button from '../../../../components/ui/button';
import useToast from '../../../../hooks/useToast';
import { formatDate } from '../../../../lib/utils';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    vehicleAPI.getById(id)
      .then(res => setVehicle(res.data?.data))
      .catch(() => showError('Failed to load vehicle'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-64 glass-t1 rounded-lg animate-pulse" />;
  if (!vehicle) return <div className="text-gray-500 dark:text-white/60 text-center py-12">Vehicle not found</div>;

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const days = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 30;
  };

  const Field = ({ label, value, warn }) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-white/50 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${warn ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
        {value || '-'}
        {warn && <AlertTriangle className="inline w-3 h-3 ml-1" />}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={vehicle.vehicleNumber}
        subtitle={`${vehicle.vehicleType} · ${vehicle.ownerType}`}
        icon={Truck}
        stats={[
          { label: 'Owner', value: vehicle.ownerName },
          { label: 'Capacity', value: vehicle.capacity ? `${vehicle.capacity} ${vehicle.capacityUnit}` : null },
        ]}
      />

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="sm" onClick={() => router.push(`/vehicles/${id}/edit`)}>
          <Edit className="w-4 h-4" /> Edit
        </Button>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Vehicle Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" value={vehicle.vehicleType} />
            <Field label="Ownership" value={vehicle.ownerType} />
            <Field label="Capacity" value={vehicle.capacity ? `${vehicle.capacity} ${vehicle.capacityUnit}` : null} />
            <Field label="Chassis No." value={vehicle.chassisNumber} />
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Ownership</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Owner Name" value={vehicle.ownerName} />
            <Field label="Owner Phone" value={vehicle.ownerPhone} />
            <Field label="Driver Name" value={vehicle.driverName} />
            <Field label="Driver Phone" value={vehicle.driverPhone} />
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Documents</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="RC Expiry" value={formatDate(vehicle.rcExpiryDate, 'dd/MMM/yyyy')} warn={isExpiringSoon(vehicle.rcExpiryDate)} />
            <Field label="Insurance Expiry" value={formatDate(vehicle.insuranceExpiryDate, 'dd/MMM/yyyy')} warn={isExpiringSoon(vehicle.insuranceExpiryDate)} />
            <Field label="Permit Expiry" value={formatDate(vehicle.permitExpiryDate, 'dd/MMM/yyyy')} warn={isExpiringSoon(vehicle.permitExpiryDate)} />
            <Field label="Fitness Expiry" value={formatDate(vehicle.fitnessExpiryDate, 'dd/MMM/yyyy')} warn={isExpiringSoon(vehicle.fitnessExpiryDate)} />
          </div>
        </GlassPanel>

        {vehicle.notes && (
          <GlassPanel tier={2} className="p-6 space-y-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Notes</h3>
            <p className="text-sm text-gray-700 dark:text-white/70">{vehicle.notes}</p>
          </GlassPanel>
        )}
      </motion.div>
    </div>
  );
}
