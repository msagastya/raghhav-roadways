'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import { paymentAPI } from '../../../../lib/api';
import FormSection from '../../../../components/ui/form-section';
import PageHeader from '../../../../components/ui/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import useToast from '../../../../hooks/useToast';

export default function NewPaymentPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await paymentAPI.create(data);
      showSuccess('Payment recorded');
      router.push('/payments');
    } catch (error) {
      showError(error?.response?.data?.message || error?.userMessage || 'Error recording payment');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Record Payment" subtitle="Log new payment" icon={DollarSign} />

      <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Payment Details" defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Payment Date" type="date" {...register('paymentDate', { required: 'Payment date is required' })} error={errors.paymentDate?.message} />
            <Input label="Amount" type="number" {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be greater than 0' } })} error={errors.amount?.message} />
            <Input label="Party" {...register('partyId', { required: 'Party is required' })} error={errors.partyId?.message} />
            <Input label="Payment Mode" {...register('paymentMode')} />
            <Input label="Reference" {...register('reference', { maxLength: { value: 100, message: 'Max 100 characters' } })} error={errors.reference?.message} />
            <Input label="Bank" {...register('bankName')} />
          </div>
        </FormSection>

        <FormSection title="Remarks">
          <Input label="Notes" {...register('remarks', { maxLength: { value: 500, message: 'Max 500 characters' } })} error={errors.remarks?.message} />
        </FormSection>

        <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
