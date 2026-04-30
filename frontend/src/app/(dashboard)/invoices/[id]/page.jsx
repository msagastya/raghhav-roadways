'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, Plus, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { invoiceAPI, paymentAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../../lib/utils';

const statusColor = {
  Paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-700/30', icon: CheckCircle },
  Partial: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-700/30', icon: Clock },
  Unpaid: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-700/30', icon: AlertCircle },
};

const PAYMENT_MODES = ['Cash', 'Cheque', 'NEFT', 'RTGS', 'UPI', 'Bank Transfer'];

export default function InvoiceDetailPage({ params }) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Payment form
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('NEFT');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => { fetchInvoice(); }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const res = await invoiceAPI.getById(params.id);
      setInvoice(res.data?.data?.invoice || res.data?.data || null);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await invoiceAPI.download(params.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return showError('Enter a valid amount');
    setPaying(true);
    try {
      // Find or create payment record for this invoice
      await paymentAPI.create({
        invoiceId: parseInt(params.id),
        amount: parseFloat(payAmount),
        paymentMode: payMode,
        paymentDate: new Date(payDate).toISOString(),
        referenceNumber: payRef || undefined,
      });
      showSuccess('Payment recorded');
      setShowPayForm(false);
      setPayAmount('');
      setPayRef('');
      fetchInvoice();
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>Invoice not found.</p>
        <Link href="/invoices" className="text-primary-500 text-sm mt-2 inline-block hover:underline">Back to list</Link>
      </div>
    );
  }

  const status = invoice.paymentStatus || 'Unpaid';
  const sc = statusColor[status] || statusColor.Unpaid;
  const StatusIcon = sc.icon;
  const balance = Number(invoice.balanceAmount || 0);
  const paid = Number(invoice.paidAmount || 0);
  const total = Number(invoice.totalAmount || 0);

  return (
    <div className="space-y-5 pb-10 max-w-4xl">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <button className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-white/60 border border-transparent hover:border-black/8 transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bill {invoice.invoiceNumber}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                <StatusIcon className="w-3 h-3" />
                {status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{invoice.partyName} · {formatDate(invoice.invoiceDate)}</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 bg-white/60 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl hover:border-primary-400 hover:text-primary-600 transition-all disabled:opacity-50"
        >
          {downloading
            ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            : <Download className="w-4 h-4" />}
          Download PDF
        </button>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06 }}
      >
        {[
          { label: 'Total Bill', value: total, color: 'text-gray-900 dark:text-white' },
          { label: 'Amount Paid', value: paid, color: 'text-green-600 dark:text-green-400' },
          { label: 'Balance Due', value: balance, color: balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </motion.div>

      {/* Party info */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Party Details</h3>
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Name: </span>
            <span className="font-medium text-gray-900 dark:text-white">{invoice.partyName}</span>
          </div>
          {invoice.partyGstin && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">GST: </span>
              <span className="font-medium text-gray-900 dark:text-white">{invoice.partyGstin}</span>
            </div>
          )}
          {invoice.partyAddress && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">Address: </span>
              <span className="text-gray-700 dark:text-gray-300">{invoice.partyAddress}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* GR Items table */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.14 }}
      >
        <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Consignment Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-white/3 border-b border-black/5 dark:border-white/5">
                <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">GR No.</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">Vehicle</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">Route</th>
                <th className="px-4 py-2.5 text-left font-semibold text-gray-500 dark:text-gray-400">Contents</th>
                <th className="px-4 py-2.5 text-center font-semibold text-gray-500 dark:text-gray-400">QTY</th>
                <th className="px-4 py-2.5 text-center font-semibold text-gray-500 dark:text-gray-400">Rate</th>
                <th className="px-4 py-2.5 text-right font-semibold text-gray-500 dark:text-gray-400">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {(invoice.items || []).map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/3">
                  <td className="px-4 py-2.5 font-medium text-primary-600 dark:text-primary-400">{item.grNumber || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.grDate ? formatDate(item.grDate) : '—'}</td>
                  <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300">{item.vehicleNumber || '—'}</td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {item.fromLocation && item.toLocation ? `${item.fromLocation} → ${item.toLocation}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.contents || '—'}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-400">{item.qtyInMt || '—'}</td>
                  <td className="px-4 py-2.5 text-center text-gray-600 dark:text-gray-400">{item.rateMt || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-black/8 dark:border-white/8">
              {Number(invoice.grCharge) > 0 && (
                <tr className="bg-gray-50/60 dark:bg-white/3">
                  <td colSpan={7} className="px-4 py-2.5 text-right text-xs text-gray-500 dark:text-gray-400 font-medium">GR Charge</td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-700 dark:text-gray-300">{formatCurrency(invoice.grCharge)}</td>
                </tr>
              )}
              <tr className="bg-gray-50/80 dark:bg-white/5">
                <td colSpan={7} className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">TOTAL</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-primary-600 dark:text-primary-400">{formatCurrency(invoice.totalAmount)}</td>
              </tr>
              {invoice.amountInWords && (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-xs italic text-gray-500 dark:text-gray-400">
                    Rupees: {invoice.amountInWords}
                  </td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Payment section */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment History</h3>
          {balance > 0 && (
            <button
              onClick={() => setShowPayForm(v => !v)}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-all bg-primary-50/50 hover:bg-primary-50 dark:bg-primary-900/10 dark:border-primary-700/30"
            >
              {showPayForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showPayForm ? 'Cancel' : 'Record Payment'}
            </button>
          )}
        </div>

        {/* Payment form */}
        <AnimatePresence>
          {showPayForm && (
            <motion.form
              onSubmit={handleRecordPayment}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="bg-primary-50/50 dark:bg-primary-900/10 border border-primary-200/50 dark:border-primary-700/30 rounded-xl p-4">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-3">
                  Balance due: {formatCurrency(balance)}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Amount ₹ *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance}
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      placeholder={balance.toFixed(2)}
                      required
                      className="w-full border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Mode *</label>
                    <select
                      value={payMode}
                      onChange={e => setPayMode(e.target.value)}
                      className="w-full border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400"
                    >
                      {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Date *</label>
                    <input
                      type="date"
                      value={payDate}
                      onChange={e => setPayDate(e.target.value)}
                      required
                      className="w-full border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Reference No.</label>
                    <input
                      value={payRef}
                      onChange={e => setPayRef(e.target.value)}
                      placeholder="Cheque / UTR No."
                      className="w-full border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={paying}
                  className="mt-3 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all"
                >
                  {paying ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <CheckCircle className="w-4 h-4" />}
                  Save Payment
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Payment transactions */}
        {(invoice.payments || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No payments recorded yet</p>
        ) : (
          <div className="space-y-2">
            {(invoice.payments || []).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-gray-50/60 dark:bg-white/3 rounded-xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.paymentMode} · {formatDate(p.paymentDate)}{p.referenceNumber ? ` · Ref: ${p.referenceNumber}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
