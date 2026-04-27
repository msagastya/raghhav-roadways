'use client';

import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { partyAPI } from '../../../../lib/api';
import PartyForm from '../../../../components/forms/PartyForm';
import PageHeader from '../../../../components/ui/page-header';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewPartyPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    await partyAPI.create(data);
    showSuccess('Party created');
    router.push('/parties');
  };

  const handleError = (error) => showError(getErrorMessage(error));

  return (
    <div className="space-y-6">
      <PageHeader title="Add Party" subtitle="Create new party / contact" icon={Users} />
      <PartyForm
        onSubmit={async (data) => { try { await onSubmit(data); } catch (e) { handleError(e); throw e; } }}
        onCancel={() => router.back()}
        submitLabel="Create Party"
      />
    </div>
  );
}
