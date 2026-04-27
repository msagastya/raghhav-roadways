'use client';

import { useRouter } from 'next/navigation';
import { Receipt } from 'lucide-react';
import { invoiceAPI } from '../../../../lib/api';
import InvoiceForm from '../../../../components/forms/InvoiceForm';
import PageHeader from '../../../../components/ui/page-header';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewInvoicePage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await invoiceAPI.create(data);
      showSuccess('Invoice created');
      router.push('/invoices');
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Invoice" subtitle="Generate new invoice" icon={Receipt} />
      <InvoiceForm
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Create Invoice"
      />
    </div>
  );
}
