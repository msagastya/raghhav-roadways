'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DollarSign } from 'lucide-react';
import { paymentAPI } from '../../../../../lib/api';
import PaymentForm from '../../../../../components/forms/PaymentForm';
import PageHeader from '../../../../../components/ui/page-header';
import useToast from '../../../../../hooks/useToast';
import { getErrorMessage } from '../../../../../lib/utils';

export default function EditPaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    paymentAPI.getById(id)
      .then(res => setDefaultValues(res.data?.data || {}))
      .catch(() => { showError('Failed to load payment'); router.back(); });
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await paymentAPI.update(id, data);
      showSuccess('Payment updated');
      router.push(`/payments/${id}`);
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  if (!defaultValues) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Payment" subtitle={`Payment# ${defaultValues.paymentNumber || id}`} icon={DollarSign} />
      <PaymentForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
