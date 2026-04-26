'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Receipt, DollarSign } from 'lucide-react';
import { invoiceAPI } from '../../../../lib/api';
import FormSection from '../../../../components/ui/form-section';
import PageHeader from '../../../../components/ui/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import useToast from '../../../../hooks/useToast';

export default function NewInvoicePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await invoiceAPI.create(data);
      showSuccess('Invoice created');
      router.push('/invoices');
    } catch (error) {
      showError(error?.message || 'Error creating invoice');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Invoice" subtitle="Generate new invoice" icon={Receipt} />

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Invoice Details" icon={Receipt} defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Invoice Date" type="date" {...register('invoiceDate', { required: 'Invoice date is required' })} error={errors.invoiceDate?.message} />
            <Input label="Party" {...register('partyId', { required: 'Party is required' })} error={errors.partyId?.message} />
            <Input label="Due Date" type="date" {...register('dueDate')} />
          </div>
        </FormSection>

        <FormSection title="Financial">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Total Amount" type="number" {...register('totalAmount', { required: 'Total amount is required', min: { value: 0, message: 'Must be 0 or more' } })} error={errors.totalAmount?.message} />
            <Input label="Tax Amount" type="number" {...register('taxAmount', { required: 'Tax amount is required', min: { value: 0, message: 'Must be 0 or more' } })} error={errors.taxAmount?.message} />
            <Input label="Notes" {...register('notes')} />
          </div>
        </FormSection>

        <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Invoice'}</Button>
        </div>
      </motion.form>
    </div>
  );
}
