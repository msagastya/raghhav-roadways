'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Users, MapPin, Phone, Banknote } from 'lucide-react';
import FormSection from '../ui/form-section';
import Button from '../ui/button';
import Input from '../ui/input';

const PARTY_TYPES = [
  { value: 'consignor', label: 'Consignor' },
  { value: 'consignee', label: 'Consignee' },
  { value: 'both', label: 'Both' },
  { value: 'broker', label: 'Broker' },
];

export default function PartyForm({ defaultValues = {}, onSubmit, onCancel, submitLabel = 'Save Party' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormSection title="Basic Info" icon={Users} defaultOpen required>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Party Name"
            required
            {...register('partyName', { required: 'Party name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
            error={errors.partyName?.message}
          />
          <Input label="Party Code" {...register('partyCode')} />
          <div className="col-span-full">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Party Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('partyType', { required: 'Party type is required', validate: v => !!v || 'Please select a type' })}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="">Select Type</option>
              {PARTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {errors.partyType && <p className="mt-1 text-xs text-red-500">{errors.partyType.message}</p>}
          </div>
          <Input
            label="GSTIN"
            {...register('gstin', { pattern: { value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i, message: 'Invalid GSTIN format' } })}
            error={errors.gstin?.message}
            placeholder="22AAAAA0000A1Z5"
          />
          <Input
            label="PAN"
            {...register('pan', { pattern: { value: /^[A-Z]{5}\d{4}[A-Z]{1}$/i, message: 'Invalid PAN format' } })}
            error={errors.pan?.message}
            placeholder="AAAAA0000A"
          />
        </div>
      </FormSection>

      <FormSection title="Address" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Address Line 1" {...register('addressLine1')} className="col-span-full" containerClassName="md:col-span-2" />
          <Input label="Address Line 2" {...register('addressLine2')} />
          <Input label="City" {...register('city')} />
          <Input label="State" {...register('state')} />
          <Input
            label="Pincode"
            {...register('pincode', { pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' } })}
            error={errors.pincode?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Contact" icon={Phone}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Contact Person" {...register('contactPerson')} />
          <Input
            label="Mobile"
            {...register('mobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })}
            error={errors.mobile?.message}
            placeholder="9876543210"
          />
          <Input
            label="Email"
            type="email"
            {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
            error={errors.email?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Banking & Credit" icon={Banknote}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Bank Name" {...register('bankName')} />
          <Input label="Account Number" {...register('bankAccountNo')} />
          <Input
            label="IFSC Code"
            {...register('bankIfsc', { pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC' } })}
            error={errors.bankIfsc?.message}
          />
          <Input label="Branch" {...register('bankBranch')} />
          <Input
            label="Credit Limit (₹)"
            type="number"
            {...register('creditLimit', { min: { value: 0, message: 'Must be 0 or more' } })}
            error={errors.creditLimit?.message}
          />
          <Input
            label="Credit Days"
            type="number"
            {...register('creditDays', { min: { value: 0, message: 'Min 0' }, max: { value: 365, message: 'Max 365' } })}
            error={errors.creditDays?.message}
          />
        </div>
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
