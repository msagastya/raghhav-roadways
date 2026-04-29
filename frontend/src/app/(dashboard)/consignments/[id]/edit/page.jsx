'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package } from 'lucide-react';
import { consignmentAPI } from '../../../../../lib/api';
import ConsignmentForm from '../../../../../components/forms/ConsignmentForm';
import PageHeader from '../../../../../components/ui/page-header';
import useToast from '../../../../../hooks/useToast';
import { getErrorMessage } from '../../../../../lib/utils';

export default function EditConsignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    consignmentAPI.getById(id)
      .then(res => setDefaultValues(res.data?.data || {}))
      .catch(() => { showError('Failed to load consignment'); router.back(); });
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await consignmentAPI.update(id, data);
      showSuccess('Consignment updated');
      router.push(`/consignments/${id}`);
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
      <PageHeader title="Edit Consignment" subtitle={`GR# ${defaultValues.grNumber || id}`} icon={Package} />
      <ConsignmentForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Save Changes"
        isEdit
      />
    </div>
  );
}
