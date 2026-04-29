'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { invoiceAPI } from '../../../../../lib/api';
import InvoiceForm from '../../../../../components/forms/InvoiceForm';
import PageHeader from '../../../../../components/ui/page-header';
import useToast from '../../../../../hooks/useToast';
import { getErrorMessage } from '../../../../../lib/utils';

export default function EditInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    invoiceAPI.getById(id)
      .then(res => setDefaultValues(res.data?.data || {}))
      .catch(() => { showError('Failed to load invoice'); router.back(); });
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await invoiceAPI.update(id, data);
      showSuccess('Invoice updated');
      router.push(`/invoices/${id}`);
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
      <PageHeader title="Edit Invoice" subtitle={`Invoice# ${defaultValues.invoiceNumber || id}`} icon={Receipt} />
      <InvoiceForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
