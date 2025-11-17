'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Select from '../../../../components/ui/select';
import { ArrowLeft, Save, Plus, Trash2, Edit2, Download } from 'lucide-react';
import Link from 'next/link';
import { paymentAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage, formatDate, formatCurrency } from '../../../../lib/utils';

const PAYMENT_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'IMPS', label: 'IMPS' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Cheque', label: 'Cheque' },
];

export default function PaymentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id;
  const { showSuccess, showError } = useToast();

  // Payment data
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit total amount mode
  const [editingTotal, setEditingTotal] = useState(false);
  const [newTotalAmount, setNewTotalAmount] = useState('');

  // Transaction form state
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [savingTransaction, setSavingTransaction] = useState(false);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [remarks, setRemarks] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await paymentAPI.getById(paymentId);
      setPayment(response.data?.data || null);
      setNewTotalAmount(response.data?.data?.totalAmount || '');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTotalAmount = async () => {
    if (!newTotalAmount || parseFloat(newTotalAmount) <= 0) {
      showError('Total amount must be greater than 0');
      return;
    }

    if (parseFloat(newTotalAmount) < parseFloat(payment.paidAmount)) {
      showError('Total amount cannot be less than paid amount');
      return;
    }

    try {
      await paymentAPI.update(paymentId, { totalAmount: parseFloat(newTotalAmount) });
      showSuccess('Total amount updated successfully');
      setEditingTotal(false);
      fetchPayment();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const resetTransactionForm = () => {
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setPaymentMode('Cash');
    setPaymentReference('');
    setUpiId('');
    setBankName('');
    setBankAccountNo('');
    setBankIfsc('');
    setRemarks('');
    setReceiptFile(null);
    setShowTransactionForm(false);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showError('Amount must be greater than 0');
      return;
    }

    if (parseFloat(amount) > parseFloat(payment.balanceAmount)) {
      showError('Amount cannot exceed balance amount');
      return;
    }

    // Validate conditional fields
    if (paymentMode === 'UPI' && !upiId) {
      showError('UPI ID is required for UPI payment');
      return;
    }

    if (['NEFT', 'RTGS', 'IMPS', 'Bank Transfer', 'Cheque'].includes(paymentMode)) {
      if (!bankName || !bankAccountNo || !bankIfsc) {
        showError('Bank details (Name, Account Number, IFSC) are required for bank payments');
        return;
      }
    }

    setSavingTransaction(true);

    try {
      const transactionData = {
        transactionDate,
        amount: parseFloat(amount),
        paymentMode,
        paymentReference: paymentReference || null,
        remarks: remarks || null,
      };

      // Add conditional fields
      if (paymentMode === 'UPI') {
        transactionData.upiId = upiId;
      } else if (['NEFT', 'RTGS', 'IMPS', 'Bank Transfer', 'Cheque'].includes(paymentMode)) {
        transactionData.bankName = bankName;
        transactionData.bankAccountNo = bankAccountNo;
        transactionData.bankIfsc = bankIfsc;
      }

      // Add receipt file if present
      if (receiptFile) {
        transactionData.receipt = receiptFile;
      }

      await paymentAPI.addTransaction(paymentId, transactionData);
      showSuccess('Payment transaction added successfully');
      resetTransactionForm();
      fetchPayment();
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSavingTransaction(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await paymentAPI.deleteTransaction(transactionId);
      showSuccess('Transaction deleted successfully');
      fetchPayment();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Partial: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
        <Link href="/payments">
          <Button variant="outline">Back to Payments</Button>
        </Link>
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
            <h1 className="text-2xl font-bold text-gray-900">Payment Details</h1>
            <p className="text-gray-600 mt-1">{payment.paymentNumber}</p>
          </div>
        </div>
        {getStatusBadge(payment.paymentStatus)}
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Payment Summary</h2>
            {!editingTotal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTotal(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Total Amount
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Payment Date</label>
              <p className="mt-1 text-gray-900">{formatDate(payment.paymentDate)}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Party</label>
              <p className="mt-1 text-gray-900">{payment.partyName || '-'}</p>
            </div>

            {payment.invoiceNumber && (
              <div>
                <label className="text-sm font-medium text-gray-700">Invoice</label>
                <p className="mt-1 text-gray-900">{payment.invoiceNumber}</p>
              </div>
            )}

            {payment.description && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{payment.description}</p>
              </div>
            )}

            <div className="md:col-span-2 border-t pt-4">
              {editingTotal ? (
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="Total Amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newTotalAmount}
                      onChange={(e) => setNewTotalAmount(e.target.value)}
                      required
                    />
                  </div>
                  <Button onClick={handleUpdateTotalAmount}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setEditingTotal(false);
                    setNewTotalAmount(payment.totalAmount);
                  }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-blue-700">Total Amount</label>
                    <p className="mt-1 text-2xl font-bold text-blue-900">{formatCurrency(payment.totalAmount)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-green-700">Paid Amount</label>
                    <p className="mt-1 text-2xl font-bold text-green-900">{formatCurrency(payment.paidAmount)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-orange-700">Balance Amount</label>
                    <p className="mt-1 text-2xl font-bold text-orange-900">{formatCurrency(payment.balanceAmount)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Payment Transactions</h2>
            {!showTransactionForm && parseFloat(payment.balanceAmount) > 0 && (
              <Button
                onClick={() => setShowTransactionForm(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Payment
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showTransactionForm && (
            <form onSubmit={handleAddTransaction} className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-primary-200">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Payment Transaction</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Transaction Date"
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />

                <Input
                  label={`Amount (Max: ${formatCurrency(payment.balanceAmount)})`}
                  type="number"
                  step="0.01"
                  min="0"
                  max={payment.balanceAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />

                <Select
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </Select>

                {/* Conditional Fields - UPI */}
                {paymentMode === 'UPI' && (
                  <Input
                    label="UPI ID"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID"
                    required
                  />
                )}

                {/* Conditional Fields - Bank Modes */}
                {['NEFT', 'RTGS', 'IMPS', 'Bank Transfer', 'Cheque'].includes(paymentMode) && (
                  <>
                    <Input
                      label="Bank Name"
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                      required
                    />
                    <Input
                      label="Account Number"
                      type="text"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      placeholder="Enter account number"
                      required
                    />
                    <Input
                      label="IFSC Code"
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value)}
                      placeholder="Enter IFSC code"
                      required
                    />
                  </>
                )}

                <Input
                  label="Payment Reference (Optional)"
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., Transaction ID, Cheque Number"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Upload (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setReceiptFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">JPG, PNG or PDF (Max 5MB)</p>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Remarks (Optional)"
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any additional notes"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetTransactionForm}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={savingTransaction}>
                  <Save className="w-4 h-4 mr-2" />
                  {savingTransaction ? 'Saving...' : 'Save Payment'}
                </Button>
              </div>
            </form>
          )}

          {/* Transactions Table */}
          {payment.transactions && payment.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payment.transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {transaction.paymentMode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.paymentMode === 'UPI' && transaction.upiId && (
                          <div>UPI: {transaction.upiId}</div>
                        )}
                        {['NEFT', 'RTGS', 'IMPS', 'Bank Transfer', 'Cheque'].includes(transaction.paymentMode) && (
                          <div className="text-xs">
                            {transaction.bankName && <div>{transaction.bankName}</div>}
                            {transaction.bankAccountNo && <div>A/C: {transaction.bankAccountNo}</div>}
                            {transaction.bankIfsc && <div>IFSC: {transaction.bankIfsc}</div>}
                          </div>
                        )}
                        {transaction.remarks && (
                          <div className="text-xs text-gray-500 mt-1">{transaction.remarks}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.paymentReference || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {transaction.receiptFilePath ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${transaction.receiptFilePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No payment transactions yet. {parseFloat(payment.balanceAmount) > 0 && 'Add your first payment above.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
