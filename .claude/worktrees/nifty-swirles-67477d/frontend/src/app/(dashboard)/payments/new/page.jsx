'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Select from '../../../../components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { partyAPI, invoiceAPI, paymentAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewPaymentPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // Dropdown data
  const [parties, setParties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partiesRes, invoicesRes] = await Promise.all([
        partyAPI.getAll({ limit: 1000 }),
        invoiceAPI.getAll({ limit: 1000 })
      ]);

      setParties(partiesRes.data?.data?.parties || []);
      setInvoices(invoicesRes.data?.data?.invoices || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceChange = (e) => {
    const invoiceId = e.target.value;
    setSelectedInvoiceId(invoiceId);

    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === parseInt(invoiceId));
      if (invoice) {
        // Auto-fill party from invoice
        setSelectedPartyId(invoice.partyId?.toString() || '');
        // Auto-fill amount with balance amount
        setTotalAmount(invoice.balanceAmount || invoice.totalAmount || '');
        setDescription(`Payment for Invoice ${invoice.invoiceNumber}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentDate || !totalAmount) {
      showError('Please fill in required fields: Payment Date and Total Amount');
      return;
    }

    if (!selectedInvoiceId && !selectedPartyId) {
      showError('Please select either an Invoice or a Party');
      return;
    }

    if (parseFloat(totalAmount) <= 0) {
      showError('Total amount must be greater than 0');
      return;
    }

    setSaving(true);

    try {
      const paymentData = {
        paymentDate,
        invoiceId: selectedInvoiceId ? parseInt(selectedInvoiceId) : null,
        partyId: selectedPartyId ? parseInt(selectedPartyId) : null,
        description: description || null,
        totalAmount: parseFloat(totalAmount),
      };

      await paymentAPI.create(paymentData);
      showSuccess('Payment created successfully. You can now add transactions to this payment.');
      router.push('/payments');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Payment Record</h1>
            <p className="text-gray-600 mt-1">Record a planned payment amount (you can add actual payments later)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
            <p className="text-sm text-gray-600">This creates a payment record. After creating, you can add partial payments with different payment modes.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Date */}
              <Input
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />

              {/* Invoice Selection */}
              <Select
                label="Invoice (Optional)"
                value={selectedInvoiceId}
                onChange={handleInvoiceChange}
              >
                <option value="">Select Invoice...</option>
                {invoices
                  .filter(inv => inv.balanceAmount > 0)
                  .map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.partyName} - ₹{invoice.balanceAmount}
                    </option>
                  ))}
              </Select>

              {/* Party Selection */}
              <Select
                label="Party"
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                disabled={!!selectedInvoiceId}
                required={!selectedInvoiceId}
              >
                <option value="">Select Party...</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.partyName}
                  </option>
                ))}
              </Select>

              {/* Total Amount */}
              <Input
                label="Total Amount"
                type="number"
                step="0.01"
                min="0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="Enter total amount to pay"
                required
              />

              {/* Description */}
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Payment to vehicle owner for transport"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Link href="/payments">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : 'Create Payment Record'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Create a payment record with the total amount you plan to pay</li>
              <li>After creating, go to the payment details page to add actual payments</li>
              <li>You can pay in multiple installments (e.g., ₹4,000 today, ₹6,000 next week)</li>
              <li>Each payment can have different payment modes (Cash/UPI/Bank Transfer)</li>
              <li>Upload receipts for each payment transaction</li>
              <li>The system tracks: Total Amount, Paid Amount, and Balance</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
