'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Calculator, Search, ChevronDown, X, FileText
} from 'lucide-react';
import Link from 'next/link';
import { partyAPI, consignmentAPI, invoiceAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage, formatCurrency } from '../../../../lib/utils';

// These are datalist suggestions — fields are free text inputs
const QTY_SUGGESTIONS = ['FT L', 'FT S', 'FT M', 'LCL', 'Part Load', 'Half Load'];
const RATE_SUGGESTIONS = ['FIXED', 'Per MT', 'Per KG', 'Per Package'];

export default function NewInvoicePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [parties, setParties] = useState([]);
  const [allConsignments, setAllConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Party
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGST, setPartyGST] = useState('');
  const [partySearch, setPartySearch] = useState('');
  const [partyDropOpen, setPartyDropOpen] = useState(false);

  // Invoice date
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  // GR rows
  const [selectedGRs, setSelectedGRs] = useState([]);

  // Extra charge rows (detention, etc.)
  const [extraItems, setExtraItems] = useState([]);

  // GR Charge
  const [grCharges, setGrCharges] = useState(150);

  // Consignment search
  const [grSearch, setGrSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [partiesRes, consRes] = await Promise.all([
        partyAPI.getAll({ limit: 1000 }),
        consignmentAPI.getAll({ limit: 2000, isInvoiced: false }),
      ]);
      setParties(partiesRes.data?.data?.parties || []);
      // Filter only non-invoiced consignments
      const cons = (consRes.data?.data?.consignments || []).filter(c => !c.isInvoiced);
      setAllConsignments(cons);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Consignments filtered by selected party + search
  const filteredConsignments = useMemo(() => {
    let list = allConsignments;
    if (selectedPartyId) {
      const pid = parseInt(selectedPartyId);
      list = list.filter(c =>
        c.consignorId === pid || c.consigneeId === pid
      );
    }
    if (grSearch.trim()) {
      const q = grSearch.toLowerCase();
      list = list.filter(c =>
        c.grNumber?.toLowerCase().includes(q) ||
        c.fromLocation?.toLowerCase().includes(q) ||
        c.toLocation?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    // Exclude already selected
    const selectedNums = new Set(selectedGRs.map(g => g.grNumber));
    return list.filter(c => !selectedNums.has(c.grNumber));
  }, [allConsignments, selectedPartyId, grSearch, selectedGRs]);

  // Filtered parties for search dropdown
  const filteredParties = useMemo(() => {
    if (!partySearch.trim()) return parties.slice(0, 30);
    const q = partySearch.toLowerCase();
    return parties.filter(p =>
      p.partyName?.toLowerCase().includes(q) ||
      p.partyCode?.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [parties, partySearch]);

  const handlePartySelect = (party) => {
    setSelectedPartyId(String(party.id));
    setPartyName(party.partyName || '');
    setPartyGST(party.gstin || '');
    const addr = [
      party.addressLine1,
      party.addressLine2,
      party.city,
      party.state,
      party.pincode
    ].filter(Boolean).join(', ');
    setPartyAddress(addr);
    setPartyDropOpen(false);
    setPartySearch('');
  };

  const addGR = (consignment) => {
    setSelectedGRs(prev => [...prev, {
      grNumber: consignment.grNumber,
      grDate: consignment.grDate ? new Date(consignment.grDate).toISOString().split('T')[0] : '',
      vehicleNo: consignment.vehicleNumber || '',
      contents: consignment.description || '',
      from: consignment.fromLocation || '',
      to: consignment.toLocation || '',
      qty: consignment.vehicleSize || 'FT L',
      rate: consignment.rateType === 'Fixed' ? 'FIXED' : (consignment.rateType || 'FIXED'),
      amount: parseFloat(consignment.freightAmount) || 0,
    }]);
    setGrSearch('');
  };

  const updateGR = (grNumber, field, value) => {
    setSelectedGRs(prev => prev.map(g =>
      g.grNumber === grNumber ? { ...g, [field]: value } : g
    ));
  };

  const removeGR = (grNumber) => {
    setSelectedGRs(prev => prev.filter(g => g.grNumber !== grNumber));
  };

  const addExtra = () => setExtraItems(prev => [...prev, { content: '', charge: 0 }]);
  const updateExtra = (i, f, v) => setExtraItems(prev => prev.map((e, idx) => idx === i ? { ...e, [f]: v } : e));
  const removeExtra = (i) => setExtraItems(prev => prev.filter((_, idx) => idx !== i));

  const grTotal = useMemo(() =>
    selectedGRs.reduce((s, g) => s + (parseFloat(g.amount) || 0), 0),
    [selectedGRs]);
  const extraTotal = useMemo(() =>
    extraItems.reduce((s, e) => s + (parseFloat(e.charge) || 0), 0),
    [extraItems]);
  const grandTotal = grTotal + extraTotal + (parseFloat(grCharges) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartyId) return showError('Please select a party');
    if (selectedGRs.length === 0) return showError('Please add at least one GR');

    setSaving(true);
    try {
      await invoiceAPI.create({
        partyId: parseInt(selectedPartyId),
        partyName,
        partyAddress,
        partyGST,
        grItems: selectedGRs.map(g => ({
          grNumber: g.grNumber,
          grDate: g.grDate,
          vehicleNo: g.vehicleNo,
          contents: g.contents,
          from: g.from,
          to: g.to,
          qty: g.qty,
          rate: g.rate,
          amount: parseFloat(g.amount) || 0,
        })),
        extraItems: extraItems.filter(e => e.content || e.charge),
        grCharges: parseFloat(grCharges) || 0,
        totalAmount: grandTotal,
        invoiceDate: new Date(invoiceDate).toISOString(),
      });
      showSuccess('Invoice created successfully');
      router.push('/invoices');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link href="/invoices">
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-white/60 border border-transparent hover:border-black/8 transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Bill / Invoice</h1>
          <p className="text-sm text-gray-500 mt-0.5">Group GRs for a party into one bill</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Party + Date ─────────────────────────────────── */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">
            Party &amp; Invoice Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Party search dropdown */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Bill To (Party) <span className="text-red-500">*</span>
              </label>
              <div
                className="flex items-center justify-between border border-black/12 dark:border-white/12 rounded-xl bg-white/50 dark:bg-white/5 px-3 py-2.5 cursor-pointer hover:border-primary-400 transition-colors"
                onClick={() => setPartyDropOpen(o => !o)}
              >
                <span className={partyName ? 'text-gray-900 dark:text-white font-medium text-sm' : 'text-gray-400 text-sm'}>
                  {partyName || 'Select party…'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${partyDropOpen ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {partyDropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-2 border-b border-black/5">
                      <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <input
                          autoFocus
                          value={partySearch}
                          onChange={e => setPartySearch(e.target.value)}
                          placeholder="Search parties…"
                          className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {filteredParties.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">No parties found</div>
                      ) : filteredParties.map(p => (
                        <div
                          key={p.id}
                          onClick={() => handlePartySelect(p)}
                          className="px-4 py-2.5 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-900 dark:text-white transition-colors"
                        >
                          <span className="font-medium">{p.partyName}</span>
                          <span className="ml-2 text-xs text-gray-400">{p.partyCode}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                required
                className="w-full border border-black/12 dark:border-white/12 rounded-xl bg-white/50 dark:bg-white/5 px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 transition-all"
              />
            </div>
          </div>

          {/* Party detail chips */}
          {partyName && (
            <div className="mt-3 flex flex-wrap gap-2">
              {partyGST && (
                <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full border border-primary-200/50">
                  GST: {partyGST}
                </span>
              )}
              {partyAddress && (
                <span className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-gray-200/50">
                  {partyAddress}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* ── GR Selection ────────────────────────────────── */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Add GR / Consignments
            </h3>
            <span className="text-xs text-gray-400">
              {filteredConsignments.length} available{selectedPartyId ? ' for this party' : ''}
            </span>
          </div>

          {/* GR search */}
          <div className="flex items-center gap-2 border border-black/10 dark:border-white/10 rounded-xl bg-white/50 dark:bg-white/5 px-3 py-2 mb-3">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              value={grSearch}
              onChange={e => setGrSearch(e.target.value)}
              placeholder="Search by GR No, location, contents…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Available GRs chips */}
          {filteredConsignments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 max-h-40 overflow-y-auto">
              {filteredConsignments.slice(0, 50).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => addGR(c)}
                  className="flex items-center gap-1.5 text-xs bg-white dark:bg-gray-800 border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-gray-700 dark:text-gray-300"
                >
                  <Plus className="w-3 h-3" />
                  <span className="font-medium">{c.grNumber}</span>
                  <span className="text-gray-400">{c.fromLocation} → {c.toLocation}</span>
                  <span className="text-primary-600 font-medium">{formatCurrency(c.freightAmount)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected GRs table */}
          {selectedGRs.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-black/8 dark:border-white/8">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">GR No.</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">Vehicle</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">Contents</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">From</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-gray-600 dark:text-gray-400">To</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-400">QTY</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-600 dark:text-gray-400">Rate</th>
                    <th className="px-3 py-2.5 text-right font-semibold text-gray-600 dark:text-gray-400">Amount ₹</th>
                    <th className="px-3 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {selectedGRs.map((gr, i) => (
                    <motion.tr
                      key={gr.grNumber}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white dark:bg-gray-900/30"
                    >
                      <td className="px-3 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">{gr.grNumber}</td>
                      <td className="px-3 py-2">
                        <input type="date" value={gr.grDate}
                          onChange={e => updateGR(gr.grNumber, 'grDate', e.target.value)}
                          className="w-30 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={gr.vehicleNo}
                          onChange={e => updateGR(gr.grNumber, 'vehicleNo', e.target.value)}
                          placeholder="Vehicle No"
                          className="w-24 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={gr.contents}
                          onChange={e => updateGR(gr.grNumber, 'contents', e.target.value)}
                          placeholder="Contents"
                          className="w-28 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={gr.from}
                          onChange={e => updateGR(gr.grNumber, 'from', e.target.value)}
                          placeholder="From"
                          className="w-24 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={gr.to}
                          onChange={e => updateGR(gr.grNumber, 'to', e.target.value)}
                          placeholder="To"
                          className="w-24 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          list="qty-suggestions"
                          value={gr.qty}
                          onChange={e => updateGR(gr.grNumber, 'qty', e.target.value)}
                          placeholder="FT L"
                          className="w-20 border border-black/10 dark:border-white/10 rounded-lg px-1.5 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          list="rate-suggestions"
                          value={gr.rate}
                          onChange={e => updateGR(gr.grNumber, 'rate', e.target.value)}
                          placeholder="FIXED"
                          className="w-20 border border-black/10 dark:border-white/10 rounded-lg px-1.5 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0" value={gr.amount}
                          onChange={e => updateGR(gr.grNumber, 'amount', e.target.value)}
                          className="w-24 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 bg-transparent text-gray-900 dark:text-white outline-none focus:border-primary-400 text-xs text-right" />
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeGR(gr.grNumber)}
                          className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedGRs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No GRs added yet — select from above</p>
            </div>
          )}
        </motion.div>

        {/* ── Extra Charges ────────────────────────────────── */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Extra Charges
            </h3>
            <button type="button" onClick={addExtra}
              className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 border border-primary-200 hover:border-primary-400 px-3 py-1.5 rounded-lg transition-all bg-primary-50/50 hover:bg-primary-50">
              <Plus className="w-3.5 h-3.5" />
              Add Charge
            </button>
          </div>

          {extraItems.length === 0 ? (
            <p className="text-xs text-gray-400">e.g. Detention charges, Loading charges — add with button above</p>
          ) : (
            <div className="space-y-2">
              {extraItems.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={item.content}
                    onChange={e => updateExtra(i, 'content', e.target.value)}
                    placeholder="Charge description (e.g. One day detention @Unloading Point)"
                    className="flex-1 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-white/50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20" />
                  <input type="number" step="0.01" min="0" value={item.charge}
                    onChange={e => updateExtra(i, 'charge', e.target.value)}
                    placeholder="₹ Amount"
                    className="w-32 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-white/50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-right" />
                  <button type="button" onClick={() => removeExtra(i)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3 pt-4 border-t border-black/5 dark:border-white/5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              GR Charge (₹)
            </label>
            <input type="number" step="0.01" min="0" value={grCharges}
              onChange={e => setGrCharges(e.target.value)}
              className="w-32 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 bg-white/50 dark:bg-white/5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-right" />
            <span className="text-xs text-gray-400">Standard ₹150 per bill</span>
          </div>
        </motion.div>

        {/* ── Summary + Submit ─────────────────────────────── */}
        <motion.div
          className="bg-white/70 dark:bg-white/8 backdrop-blur-sm border border-black/8 dark:border-white/8 rounded-2xl p-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">Bill Summary</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Total Bill Amount</div>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-5 border-t border-b border-black/5 dark:border-white/5 py-3">
            <div className="flex justify-between">
              <span>GR Freight Total ({selectedGRs.length} GRs)</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{grTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {extraTotal > 0 && (
              <div className="flex justify-between">
                <span>Extra Charges ({extraItems.length})</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ₹{extraTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GR Charge</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{(parseFloat(grCharges) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || selectedGRs.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
            >
              {saving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Generating Bill…</>
              ) : (
                <><FileText className="w-4 h-4" /> Generate Bill</>
              )}
            </button>
            <Link href="/invoices">
              <button type="button"
                className="px-5 py-3 border border-black/10 dark:border-white/10 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-white/50 transition-all text-sm">
                Cancel
              </button>
            </Link>
          </div>
        </motion.div>
      </form>

      {/* Datalist suggestions for QTY and Rate free-text inputs */}
      <datalist id="qty-suggestions">
        {QTY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
      </datalist>
      <datalist id="rate-suggestions">
        {RATE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}
