'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Edit, ArrowLeft } from 'lucide-react';
import { partyAPI } from '../../../../lib/api';
import PageHeader from '../../../../components/ui/page-header';
import GlassPanel from '../../../../components/ui/glass-panel';
import Button from '../../../../components/ui/button';
import useToast from '../../../../hooks/useToast';

export default function PartyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    partyAPI.getById(id)
      .then(res => setParty(res.data?.data))
      .catch(() => showError('Failed to load party'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="h-64 glass-t1 rounded-lg animate-pulse" />;
  if (!party) return <div className="text-gray-500 dark:text-white/60 text-center py-12">Party not found</div>;

  const Field = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-white/50 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={party.partyName}
        subtitle={party.partyCode}
        icon={Users}
        stats={[
          { label: 'Type', value: [party.isConsignor && 'Consignor', party.isConsignee && 'Consignee'].filter(Boolean).join(' / ') || 'Party' },
          { label: 'City', value: party.city },
        ]}
      />

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button size="sm" onClick={() => router.push(`/parties/${id}/edit`)}>
          <Edit className="w-4 h-4" /> Edit
        </Button>
      </div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Party Code" value={party.partyCode} />
            <Field label="GSTIN" value={party.gstin} />
            <Field label="PAN" value={party.pan} />
            <Field label="Credit Limit" value={party.creditLimit ? `₹${party.creditLimit}` : null} />
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" value={party.phone} />
            <Field label="Email" value={party.email} />
            <Field label="Contact Person" value={party.contactPerson} />
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Address</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Address" value={party.address} />
            <Field label="City" value={party.city} />
            <Field label="State" value={party.state} />
            <Field label="Pincode" value={party.pincode} />
          </div>
        </GlassPanel>

        <GlassPanel tier={2} className="p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Banking</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bank Name" value={party.bankName} />
            <Field label="Account No." value={party.bankAccount} />
            <Field label="IFSC" value={party.ifscCode} />
            <Field label="Branch" value={party.bankBranch} />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
