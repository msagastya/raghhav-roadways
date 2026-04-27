'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Receipt, IndianRupee, FileText } from 'lucide-react';
import FormSection from '../ui/form-section';
import Button from '../ui/button';
import Input from '../ui/input';

export default function InvoiceForm({ defaultValues = {}, onSubmit, onCancel, submitLabel = 'Save Invoice' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, setValue } = useForm({ defaultValues });

  const subtotal = useWatch({ control, name: 'subtotal', defaultValue: 0 });
  const grCharge = useWatch({ control, name: 'grCharge', defaultValue: 0 });

  useEffect(() => {
    const total = (parseFloat(subtotal) || 0) + (parseFloat(grCharge) || 0);
    setValue('totalAmount', total.toFixed(2));
    setValue('balanceAmount', total.toFixed(2));
  }, [subtotal, grCharge, setValue]);

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormSection title="Invoice Details" icon={Receipt} defaultOpen required>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Invoice Date"
            type="date"
            required
            {...register('invoiceDate', { required: 'Invoice date is required' })}
            error={errors.invoiceDate?.message}
          />
          <Input label="Due Date" type="date" {...register('dueDate')} />
          <Input label="Branch" {...register('branch')} placeholder="Surat" />
          <Input
            label="Party ID"
            type="number"
            required
            {...register('partyId', { required: 'Party is required', valueAsNumber: true })}
            error={errors.partyId?.message}
          />
          <Input
            label="Party Name"
            required
            {...register('partyName', { required: 'Party name is required' })}
            error={errors.partyName?.message}
            containerClassName="md:col-span-2"
          />
          <Input label="Party Address" {...register('partyAddress')} containerClassName="md:col-span-2" />
          <Input label="Party GSTIN" {...register('partyGstin', { pattern: { value: /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i, message: 'Invalid GSTIN' } })} error={errors.partyGstin?.message} />
        </div>
      </FormSection>

      <FormSection title="Amounts" icon={IndianRupee}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Subtotal (₹)"
            type="number"
            step="0.01"
            required
            {...register('subtotal', { required: 'Subtotal is required', min: { value: 0, message: 'Must be 0 or more' } })}
            error={errors.subtotal?.message}
          />
          <Input
            label="GR Charge (₹)"
            type="number"
            step="0.01"
            {...register('grCharge')}
          />
          <Input
            label="Total Amount (₹)"
            type="number"
            step="0.01"
            {...register('totalAmount')}
            disabled
          />
          <Input
            label="Balance Amount (₹)"
            type="number"
            step="0.01"
            {...register('balanceAmount')}
            disabled
          />
        </div>
      </FormSection>

      <FormSection title="Notes" icon={FileText}>
        <Input label="Amount in Words" {...register('amountInWords')} placeholder="e.g. Rupees Fifty Thousand Only" />
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
