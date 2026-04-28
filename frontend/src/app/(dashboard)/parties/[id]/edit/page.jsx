'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { partyAPI } from '../../../../../lib/api';
import PartyForm from '../../../../../components/forms/PartyForm';
import PageHeader from '../../../../../components/ui/page-header';
import useToast from '../../../../../hooks/useToast';
import { getErrorMessage } from '../../../../../lib/utils';

export default function EditPartyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [defaultValues, setDefaultValues] = useState(null);

  useEffect(() => {
    partyAPI.getById(id)
      .then(res => setDefaultValues(res.data?.data || {}))
      .catch(() => { showError('Failed to load party'); router.back(); });
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await partyAPI.update(id, data);
      showSuccess('Party updated');
      router.push(`/parties/${id}`);
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
      <PageHeader title="Edit Party" subtitle={defaultValues.partyName || id} icon={Users} />
      <PartyForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        onCancel={() => router.back()}
        submitLabel="Save Changes"
      />
    </div>
  );
}
