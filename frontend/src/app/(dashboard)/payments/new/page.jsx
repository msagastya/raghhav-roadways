'use client';

import { useRouter } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { paymentAPI } from '../../../../lib/api';
import PaymentForm from '../../../../components/forms/PaymentForm';
import PageHeader from '../../../../components/ui/page-header';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewPaymentPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await paymentAPI.create(data);
      showSuccess('Payment recorded');
      router.push('/payments');
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Record Payment" subtitle="Log new payment" icon={DollarSign} />
      <PaymentForm
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Record Payment"
      />
    </div>
  );
}
