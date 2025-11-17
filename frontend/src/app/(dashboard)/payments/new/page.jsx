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
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [remarks, setRemarks] = useState('');

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
        setAmount(invoice.balanceAmount || invoice.totalAmount || '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentDate || !amount) {
      showError('Please fill in required fields: Payment Date and Amount');
      return;
    }

    if (!selectedInvoiceId && !selectedPartyId) {
      showError('Please select either an Invoice or a Party');
      return;
    }

    setSaving(true);

    try {
      const paymentData = {
        paymentDate,
        invoiceId: selectedInvoiceId ? parseInt(selectedInvoiceId) : null,
        partyId: selectedPartyId ? parseInt(selectedPartyId) : null,
        paymentMode: paymentMode || null,
        paymentReference: paymentReference || null,
        amount: parseFloat(amount),
        bankName: bankName || null,
        bankAccountNo: bankAccountNo || null,
        bankIfsc: bankIfsc || null,
        remarks: remarks || null,
      };

      await paymentAPI.create(paymentData);
      showSuccess('Payment recorded successfully');
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
            <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600 mt-1">Record a new payment transaction</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
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
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} - {invoice.partyName} - ₹{invoice.balanceAmount || invoice.totalAmount}
                  </option>
                ))}
              </Select>

              {/* Party Selection */}
              <Select
                label="Party (Optional if Invoice selected)"
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                disabled={!!selectedInvoiceId}
              >
                <option value="">Select Party...</option>
                {parties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.partyName}
                  </option>
                ))}
              </Select>

              {/* Amount */}
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
              />

              {/* Payment Mode */}
              <Select
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="">Select Payment Mode...</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="IMPS">IMPS</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Demand Draft">Demand Draft</option>
              </Select>

              {/* Payment Reference */}
              <Input
                label="Payment Reference"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Cheque number, Transaction ID, etc."
              />

              {/* Bank Details (Optional) */}
              <Input
                label="Bank Name"
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Bank name (optional)"
              />

              <Input
                label="Bank Account Number"
                type="text"
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
                placeholder="Account number (optional)"
              />

              <Input
                label="Bank IFSC Code"
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                placeholder="IFSC code (optional)"
              />

              {/* Remarks */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional notes or remarks..."
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
                {saving ? 'Saving...' : 'Record Payment'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
