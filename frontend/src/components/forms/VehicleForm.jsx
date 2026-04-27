'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Truck, User, FileText } from 'lucide-react';
import FormSection from '../ui/form-section';
import Button from '../ui/button';
import Input from '../ui/input';

const VEHICLE_TYPES = ['4W', '2W', 'HCV', 'LCV', 'Trailer', 'Container'];
const OWNER_TYPES = [
  { value: 'owned', label: 'Owned' },
  { value: 'broker', label: 'Broker' },
  { value: 'market', label: 'Market' },
];

export default function VehicleForm({ defaultValues = {}, onSubmit, onCancel, submitLabel = 'Save Vehicle' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormSection title="Vehicle Details" icon={Truck} defaultOpen required>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Vehicle Number"
            required
            {...register('vehicleNo', {
              required: 'Vehicle number is required',
              pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'Invalid format (e.g. GJ05AB1234)' },
            })}
            error={errors.vehicleNo?.message}
            placeholder="GJ05AB1234"
          />
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Vehicle Type
            </label>
            <select
              {...register('vehicleType')}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="">Select Type</option>
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input
            label="Capacity (MT)"
            type="number"
            step="0.01"
            {...register('vehicleCapacity', { min: { value: 0, message: 'Must be 0 or more' } })}
            error={errors.vehicleCapacity?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Ownership">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Owner Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('ownerType', { required: 'Owner type is required' })}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="">Select Owner Type</option>
              {OWNER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.ownerType && <p className="mt-1 text-xs text-red-500">{errors.ownerType.message}</p>}
          </div>
          <Input label="Owner Name" {...register('ownerName')} />
          <Input
            label="Owner Mobile"
            {...register('ownerMobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })}
            error={errors.ownerMobile?.message}
          />
          <Input label="Owner Address" {...register('ownerAddress')} />
        </div>
      </FormSection>

      <FormSection title="Driver" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Driver Name" {...register('driverName')} />
          <Input
            label="Driver Mobile"
            {...register('driverMobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })}
            error={errors.driverMobile?.message}
          />
          <Input label="License Number" {...register('driverLicense')} />
        </div>
      </FormSection>

      <FormSection title="Documents" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="RC Number" {...register('rcNumber')} />
          <Input label="RC Expiry" type="date" {...register('rcExpiry')} />
          <Input label="Insurance Number" {...register('insuranceNumber')} />
          <Input label="Insurance Expiry" type="date" {...register('insuranceExpiry')} />
          <Input label="Fitness Expiry" type="date" {...register('fitnessExpiry')} />
          <Input label="Pollution Expiry" type="date" {...register('pollutionExpiry')} />
        </div>
      </FormSection>

      <FormSection title="Notes">
        <textarea
          placeholder="Additional notes..."
          rows={3}
          {...register('notes')}
          className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </FormSection>

      <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </motion.form>
  );
}
