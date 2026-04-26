'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { partyAPI } from '../../../../lib/api';
import FormSection from '../../../../components/ui/form-section';
import PageHeader from '../../../../components/ui/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import useToast from '../../../../hooks/useToast';

export default function NewPartyPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await partyAPI.create(data);
      showSuccess('Party created');
      router.push('/parties');
    } catch (error) {
      showError(error?.response?.data?.message || error?.userMessage || 'Error creating party');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Add Party" subtitle="Create new party/contact" icon={Users} />

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Basic Info" defaultOpen required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" required {...register('partyName', { required: 'Party name is required', minLength: { value: 2, message: 'Min 2 characters' } })} error={errors.partyName?.message} />
            <Input label="Code" {...register('partyCode')} />
            <select {...register('partyType', { required: 'Party type is required', validate: v => v !== 'Select Type' || 'Please select a type' })} className="col-span-full glass-t1 rounded px-3 py-2 text-gray-800 dark:text-white/90 text-sm">
              <option>Select Type</option>
              <option value="CONSIGNOR">Consignor</option>
              <option value="CONSIGNEE">Consignee</option>
              <option value="BOTH">Both</option>
            </select>
            {errors.partyType && <p className="text-red-500 text-xs col-span-full">{errors.partyType.message}</p>}
          </div>
        </FormSection>

        <FormSection title="Address">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Address" {...register('address')} />
            <Input label="City" {...register('city')} />
            <Input label="State" {...register('state')} />
            <Input label="Pincode" {...register('pincode', { pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' } })} error={errors.pincode?.message} />
          </div>
        </FormSection>

        <FormSection title="Contact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Contact Person" {...register('contactPerson')} />
            <Input label="Mobile" {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })} error={errors.mobile?.message} />
            <Input label="Email" type="email" {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })} error={errors.email?.message} />
            <Input label="Phone" {...register('phone')} />
          </div>
        </FormSection>

        <FormSection title="Financial">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="GSTIN" {...register('gstin', { pattern: { value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, message: 'Invalid GSTIN format' } })} error={errors.gstin?.message} />
            <Input label="PAN" {...register('pan', { pattern: { value: /^[A-Z]{5}\d{4}[A-Z]{1}$/, message: 'Invalid PAN format' } })} error={errors.pan?.message} />
            <Input label="Credit Limit" type="number" {...register('creditLimit', { min: { value: 0, message: 'Must be 0 or more' } })} error={errors.creditLimit?.message} />
            <Input label="Credit Days" type="number" {...register('creditDays', { min: { value: 0, message: 'Must be 0 or more' }, max: { value: 365, message: 'Max 365 days' } })} error={errors.creditDays?.message} />
          </div>
        </FormSection>

        <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Party'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
