'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { vehicleAPI } from '../../../../lib/api';
import FormSection from '../../../../components/ui/form-section';
import PageHeader from '../../../../components/ui/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import useToast from '../../../../hooks/useToast';

export default function NewVehiclePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await vehicleAPI.create(data);
      showSuccess('Vehicle registered');
      router.push('/vehicles');
    } catch (error) {
      showError(error?.response?.data?.message || error?.userMessage || 'Error registering vehicle');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Register Vehicle" subtitle="Add vehicle to fleet" icon={Truck} />

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Vehicle Details" defaultOpen required>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Vehicle Number" required {...register('vehicleNumber', { required: 'Vehicle number is required', pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'Invalid format (e.g. GJ05AB1234)' } })} error={errors.vehicleNumber?.message} />
            <select {...register('vehicleType', { required: 'Vehicle type is required', validate: v => v !== 'Select Type' || 'Please select a type' })} className="glass-t1 rounded px-3 py-2 text-gray-800 dark:text-white/90 text-sm">
              <option>Select Type</option>
              <option value="4W">4-Wheeler</option>
              <option value="2W">2-Wheeler</option>
              <option value="HCV">HCV</option>
            </select>
            <Input label="Capacity (Tons)" type="number" {...register('capacity', { min: { value: 0, message: 'Must be 0 or more' } })} error={errors.capacity?.message} />
          </div>
          {errors.vehicleType && <p className="text-red-500 text-xs mt-1">{errors.vehicleType.message}</p>}
        </FormSection>

        <FormSection title="Ownership">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select {...register('ownerType', { required: 'Owner type is required', validate: v => v !== 'Select Owner Type' || 'Please select owner type' })} className="glass-t1 rounded px-3 py-2 text-gray-800 dark:text-white/90 text-sm">
              <option>Select Owner Type</option>
              <option value="OWNED">Owned</option>
              <option value="BROKER">Broker</option>
            </select>
            <Input label="Owner Name" {...register('ownerName')} />
            <Input label="Mobile" {...register('ownerMobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })} error={errors.ownerMobile?.message} />
            <Input label="Address" {...register('ownerAddress')} />
          </div>
          {errors.ownerType && <p className="text-red-500 text-xs mt-1">{errors.ownerType.message}</p>}
        </FormSection>

        <FormSection title="Driver">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Driver Name" {...register('driverName')} />
            <Input label="Mobile" {...register('driverMobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })} error={errors.driverMobile?.message} />
            <Input label="License Number" {...register('licenseNumber')} />
          </div>
        </FormSection>

        <FormSection title="Documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="RC Number" {...register('rcNumber')} />
            <Input label="RC Expiry" type="date" {...register('rcExpiryDate')} />
            <Input label="Insurance Number" {...register('insuranceNumber')} />
            <Input label="Insurance Expiry" type="date" {...register('insuranceExpiryDate')} />
            <Input label="Fitness Expiry" type="date" {...register('fitnessExpiryDate')} />
            <Input label="Pollution Expiry" type="date" {...register('pollutionExpiryDate')} />
          </div>
        </FormSection>

        <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register Vehicle'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
