'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { DollarSign, Banknote } from 'lucide-react';
import FormSection from '../ui/form-section';
import Button from '../ui/button';
import Input from '../ui/input';

const PAYMENT_MODES = ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'Cash', 'UPI', 'Other'];

export default function PaymentForm({ defaultValues = {}, onSubmit, onCancel, submitLabel = 'Save Payment' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormSection title="Payment Details" icon={DollarSign} defaultOpen required>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Payment Date"
            type="date"
            required
            {...register('paymentDate', { required: 'Payment date is required' })}
            error={errors.paymentDate?.message}
          />
          <Input
            label="Total Amount (₹)"
            type="number"
            step="0.01"
            required
            {...register('totalAmount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Must be greater than 0' },
              valueAsNumber: true,
            })}
            error={errors.totalAmount?.message}
          />
          <Input
            label="Party ID"
            type="number"
            required
            {...register('partyId', { required: 'Party is required', valueAsNumber: true })}
            error={errors.partyId?.message}
          />
          <Input
            label="Invoice ID"
            type="number"
            {...register('invoiceId', { valueAsNumber: true })}
          />
          <Input label="Payment Number" {...register('paymentNumber')} placeholder="Auto-generated if blank" />
        </div>
      </FormSection>

      <FormSection title="Transaction Details" icon={Banknote}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Payment Mode</label>
            <select
              {...register('paymentMode')}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              <option value="">Select Mode</option>
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <Input label="Reference / UTR" {...register('paymentReference', { maxLength: { value: 100, message: 'Max 100 chars' } })} error={errors.paymentReference?.message} />
          <Input label="Bank Name" {...register('bankName')} />
          <Input label="Account No." {...register('bankAccountNo')} />
          <Input label="IFSC" {...register('bankIfsc', { pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/i, message: 'Invalid IFSC' } })} error={errors.bankIfsc?.message} />
          <Input label="UPI ID" {...register('upiId')} />
        </div>
        <div className="mt-3">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Remarks</label>
          <textarea
            rows={2}
            {...register('description', { maxLength: { value: 500, message: 'Max 500 chars' } })}
            className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
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
