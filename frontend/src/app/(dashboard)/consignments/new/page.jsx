'use client';

import { useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { consignmentAPI } from '../../../../lib/api';
import ConsignmentForm from '../../../../components/forms/ConsignmentForm';
import PageHeader from '../../../../components/ui/page-header';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewConsignmentPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await consignmentAPI.create(data);
      showSuccess('Consignment created successfully');
      router.push('/consignments');
    } catch (error) {
      showError(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="GR Builder" subtitle="Create new consignment" icon={Package} />
      <ConsignmentForm
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Create Consignment"
      />
    </div>
  );
}
