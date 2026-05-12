'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Save } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/input';
import PageLoader from '@/components/ui/loading';
import Select from '@/components/ui/select';
import { consignmentAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import useToast from '@/hooks/useToast';

const statusOptions = ['Booked', 'Loaded', 'In Transit', 'Delivered', 'Settled', 'Cancelled'];

const toInput = (value) => (value === null || value === undefined ? '' : String(value));

export default function EditConsignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [originalStatus, setOriginalStatus] = useState('');
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadConsignment = async () => {
      try {
        const response = await consignmentAPI.getById(id);
        const c = response.data.data;
        setOriginalStatus(c.status || 'Booked');
        setFormData({
          grNumber: c.grNumber || '',
          status: c.status || 'Booked',
          fromLocation: c.fromLocation || '',
          toLocation: c.toLocation || '',
          vehicleNumber: c.vehicleNumber || '',
          vehicleSize: c.vehicleSize || '',
          description: c.description || '',
          freightAmount: toInput(c.freightAmount),
          surcharge: toInput(c.surcharge),
          otherCharges: toInput(c.otherCharges),
          grCharge: toInput(c.grCharge),
          actualWeight: toInput(c.actualWeight),
          noOfPackages: toInput(c.noOfPackages),
          paymentMode: c.paymentMode || 'To Pay',
          notes: c.notes || '',
        });
      } catch (error) {
        showError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadConsignment();
  }, [id, showError]);

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toNumberOrNull = (value) => (value === '' ? null : Number(value));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        vehicleNumber: formData.vehicleNumber,
        vehicleSize: formData.vehicleSize,
        description: formData.description,
        freightAmount: toNumberOrNull(formData.freightAmount),
        surcharge: toNumberOrNull(formData.surcharge),
        otherCharges: toNumberOrNull(formData.otherCharges),
        grCharge: toNumberOrNull(formData.grCharge),
        actualWeight: toNumberOrNull(formData.actualWeight),
        noOfPackages: formData.noOfPackages === '' ? null : Number(formData.noOfPackages),
        paymentMode: formData.paymentMode,
        notes: formData.notes,
      };

      await consignmentAPI.update(id, payload);

      if (formData.status && formData.status !== originalStatus) {
        await consignmentAPI.updateStatus(id, { status: formData.status, remarks: 'Updated from consignment edit page' });
      }

      showSuccess('Consignment updated successfully');
      router.push(`/consignments/${id}`);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) return <PageLoader message="Loading consignment..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/consignments/${id}`} className="rounded-lg p-2 text-gray-600 transition hover:bg-white/60 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">Edit Consignment</h1>
          </div>
          <p className="mt-1 text-gray-600">{formData.grNumber}</p>
        </div>
      </div>

      <Card animate={false}>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="GR Number" value={formData.grNumber} disabled />
              <Select label="Status" value={formData.status} onChange={(e) => updateField('status', e.target.value)}>
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </Select>
              <Input label="From" value={formData.fromLocation} onChange={(e) => updateField('fromLocation', e.target.value)} />
              <Input label="To" value={formData.toLocation} onChange={(e) => updateField('toLocation', e.target.value)} />
              <Input label="Vehicle Number" value={formData.vehicleNumber} onChange={(e) => updateField('vehicleNumber', e.target.value)} />
              <Input label="Vehicle Size / Qty" placeholder="FTL, FIXED, 20, 10.5" value={formData.vehicleSize} onChange={(e) => updateField('vehicleSize', e.target.value)} />
              <Input label="Freight Amount" type="number" step="0.01" value={formData.freightAmount} onChange={(e) => updateField('freightAmount', e.target.value)} />
              <Input label="Surcharge" type="number" step="0.01" value={formData.surcharge} onChange={(e) => updateField('surcharge', e.target.value)} />
              <Input label="Other Charges" type="number" step="0.01" value={formData.otherCharges} onChange={(e) => updateField('otherCharges', e.target.value)} />
              <Input label="GR Charge" type="number" step="0.01" value={formData.grCharge} onChange={(e) => updateField('grCharge', e.target.value)} />
              <Input label="Actual Weight" type="number" step="0.01" value={formData.actualWeight} onChange={(e) => updateField('actualWeight', e.target.value)} />
              <Input label="Packages" type="number" step="1" value={formData.noOfPackages} onChange={(e) => updateField('noOfPackages', e.target.value)} />
              <Select label="Payment Mode" value={formData.paymentMode} onChange={(e) => updateField('paymentMode', e.target.value)}>
                <option value="To Pay">To Pay</option>
                <option value="Paid">Paid</option>
                <option value="Party Paid">Party Paid</option>
              </Select>
            </div>

            <Input label="Description" value={formData.description} onChange={(e) => updateField('description', e.target.value)} />
            <Input label="Notes" value={formData.notes} onChange={(e) => updateField('notes', e.target.value)} />

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
