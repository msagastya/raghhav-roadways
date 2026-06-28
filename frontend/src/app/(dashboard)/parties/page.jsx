'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Building2, Edit, Trash2, Download, FileText, Search, Info } from 'lucide-react';
import { partyAPI, mastersAPI } from '../../../lib/api';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { TableSkeleton } from '../../../components/ui/skeleton';
import Modal from '../../../components/ui/modal';
import useToast from '../../../hooks/useToast';
import { getErrorMessage, cn } from '../../../lib/utils';

const initialFormData = {
  partyName: '',
  partyCode: '',
  partyType: 'Both',
  address: '',
  cityId: '',
  stateId: '',
  pincode: '',
  gstin: '',
  mobile: '',
  email: '',
  contactPerson: '',
  isActive: true,
  isVehicleOwner: false,
  isBroker: false,
  isReceivable: false,
  isPayable: false,
};

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, withGSTIN: 0 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchParties();
    fetchStates();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll({ limit: 100 });
      const partiesData = response.data?.data?.parties || [];
      setParties(partiesData);

      // Calculate stats
      const activeParties = partiesData.filter(p => p.isActive).length;
      const inactiveParties = partiesData.filter(p => !p.isActive).length;
      const withGSTIN = partiesData.filter(p => p.gstin && p.gstin.trim() !== '').length;

      setStats({
        total: partiesData.length,
        active: activeParties,
        inactive: inactiveParties,
        withGSTIN
      });
    } catch (error) {
      showError(getErrorMessage(error));
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await mastersAPI.getStates();
      setStates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCitiesByState = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      const response = await mastersAPI.getCitiesByState(stateId);
      setCities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData({ ...formData, stateId, cityId: '' });
    fetchCitiesByState(stateId);
  };

  const openAddModal = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setCities([]);
    setShowModal(true);
  };

  const openEditModal = async (party) => {
    try {
      const response = await partyAPI.getById(party.id);
      const partyData = response.data.data;

      setFormData({
        partyName: partyData.partyName || '',
        partyCode: partyData.partyCode || '',
        partyType: partyData.partyType || 'Both',
        address: partyData.address || '',
        cityId: partyData.cityId || '',
        stateId: partyData.stateId || '',
        pincode: partyData.pincode || '',
        gstin: partyData.gstin || '',
        mobile: partyData.mobile || '',
        email: partyData.email || '',
        contactPerson: partyData.contactPerson || '',
        isActive: partyData.isActive !== false,
        isVehicleOwner: partyData.isVehicleOwner || false,
        isBroker: partyData.isBroker || false,
        isReceivable: partyData.isReceivable || false,
        isPayable: partyData.isPayable || false,
      });

      if (partyData.stateId) {
        await fetchCitiesByState(partyData.stateId);
      }

      setEditingId(party.id);
      setShowModal(true);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleSubmit = async () => {
    if (!formData.partyName || !formData.partyType) {
      showError('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await partyAPI.update(editingId, formData);
        showSuccess('Party updated successfully');
      } else {
        await partyAPI.create(formData);
        showSuccess('Party created successfully');
      }
      setShowModal(false);
      setFormData(initialFormData);
      setEditingId(null);
      fetchParties();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDelete = async (party) => {
    if (!confirm(`Are you sure you want to delete ${party.partyName}?`)) return;

    try {
      await partyAPI.delete(party.id);
      showSuccess('Party deleted successfully');
      fetchParties();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDownloadLedger = async (party) => {
    setDownloadingId(party.id);
    try {
      // By default, let's just get the full ledger. We could add date pickers later.
      const response = await partyAPI.downloadLedger(party.id);
      const url = response.data?.data?.url;
      if (url) {
        window.open(url, '_blank');
        showSuccess('Ledger downloaded successfully');
      } else {
        showError('Could not generate ledger');
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter parties based on selected filter and search
  const filteredParties = parties.filter(party => {
    let matchFilter = true;
    if (filter === 'active') matchFilter = party.isActive;
    if (filter === 'inactive') matchFilter = !party.isActive;
    if (filter === 'withGSTIN') matchFilter = party.gstin && party.gstin.trim() !== '';

    let matchSearch = true;
    if (search.trim()) {
      const q = search.toLowerCase();
      matchSearch = (party.partyName?.toLowerCase() || '').includes(q) ||
                    (party.partyCode?.toLowerCase() || '').includes(q) ||
                    (party.gstin?.toLowerCase() || '').includes(q) ||
                    (party.mobile?.toLowerCase() || '').includes(q);
    }

    return matchFilter && matchSearch;
  });

  const getFilterTitle = () => {
    if (filter === 'all') return 'ALL PARTIES';
    if (filter === 'active') return 'ACTIVE PARTIES';
    if (filter === 'inactive') return 'INACTIVE PARTIES';
    if (filter === 'withGSTIN') return 'PARTIES WITH GSTIN';
    return 'ALL PARTIES';
  };

  return (
    <div className="space-y-6 pb-10 animate-warp-in">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 backdrop-blur-md rounded-2xl border border-brand-500/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <Users className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              PARTY <span className="text-brand-500">DIRECTORY</span>
            </h1>
            <p className="text-brand-500/70 font-orbitron mt-1 text-xs tracking-[0.3em] uppercase">
              Manage Consignors & Consignees
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/masters" className="flex-1 sm:flex-none">
            <button className="neon-button-outline w-full justify-center">
              <Building2 className="w-4 h-4" />
              MASTERS
            </button>
          </Link>
          <button onClick={openAddModal} className="neon-button flex-1 sm:flex-none justify-center border-brand-500/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <Plus className="w-4 h-4" />
            NEW PARTY
          </button>
        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div
        className="glass-panel p-4 border-brand-500/30 flex items-start gap-3 relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="absolute inset-0 bg-brand-500/5 pointer-events-none" />
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(0,212,255,0.2)]">
          <Info className="w-3.5 h-3.5 text-brand-500" />
        </div>
        <p className="text-xs sm:text-sm text-slate-300 flex-1 font-sans leading-relaxed relative z-10">
          <strong className="text-white font-semibold">Party Type:</strong> A party can be marked as <strong className="text-brand-400 font-semibold">Consignor</strong> (sender),
          <strong className="text-brand-400 font-semibold"> Consignee</strong> (receiver), or <strong className="text-brand-400 font-semibold">Both</strong>. The same party can send and receive goods
          at different times.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL DIRECTORY', value: stats.total, icon: Users, color: 'text-brand-500', bg: 'bg-brand-500/10 border-brand-500/30', glow: 'shadow-[0_0_15px_rgba(0,212,255,0.15)]', filterKey: 'all' },
          { label: 'ACTIVE PARTIES', value: stats.active, icon: Building2, color: 'text-primary-500', bg: 'bg-primary-500/10 border-primary-500/30', glow: 'shadow-[0_0_15px_rgba(0,255,136,0.15)]', filterKey: 'active' },
          { label: 'INACTIVE', value: stats.inactive, icon: Building2, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/30', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]', filterKey: 'inactive' },
          { label: 'WITH GSTIN', value: stats.withGSTIN, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', filterKey: 'withGSTIN' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          const isActive = filter === stat.filterKey;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              onClick={() => setFilter(stat.filterKey)}
              className={cn(
                "glass-panel relative overflow-hidden group cursor-pointer border transition-all",
                isActive ? cn(stat.bg, stat.glow, "ring-1 ring-white/20") : "border-slate-800 hover:border-slate-600"
              )}
            >
              <div className="p-4 relative z-10">
                {!isActive && <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300", stat.bg)} />}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-orbitron text-slate-400 uppercase tracking-widest truncate">{stat.label}</p>
                    <p className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-2 tracking-wider">{stat.value}</p>
                  </div>
                  <motion.div
                    className={cn("p-2 sm:p-3 rounded-xl border flex-shrink-0 backdrop-blur-md", isActive ? stat.bg : "bg-slate-900 border-slate-700")}
                    whileHover={{ scale: 1.15, rotate: 360 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? stat.color : "text-slate-400")} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar & Search */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <div className="flex items-center gap-2 glass-panel border-slate-700 rounded-xl px-4 py-2.5 flex-1 focus-within:border-brand-500/50 focus-within:shadow-[0_0_10px_rgba(0,212,255,0.1)] transition-all">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search party by name, code, GSTIN, mobile..."
            className="flex-1 bg-transparent text-sm font-sans outline-none text-white placeholder:text-slate-500 placeholder:font-orbitron placeholder:tracking-widest placeholder:text-xs"
          />
        </div>
      </motion.div>

      {/* Parties Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-panel overflow-hidden border-slate-800"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-sm font-orbitron font-bold text-slate-300 tracking-widest">{getFilterTitle()}</h3>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin mb-4" />
            <p className="text-xs font-orbitron text-brand-500 tracking-widest uppercase animate-pulse">Scanning Records...</p>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-orbitron font-bold text-slate-400 tracking-widest uppercase">No Parties Found</p>
            <Button onClick={openAddModal} className="mt-4 neon-button border-brand-500/50">
              <Plus className="w-4 h-4" />
              ADD PARTY
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Code</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest hidden md:table-cell">Type</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">GSTIN</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest hidden sm:table-cell">Mobile</th>
                  <th className="px-5 py-4 text-center text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
                <AnimatePresence>
                  {filteredParties.map((party, index) => (
                    <motion.tr
                      key={party.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-5 py-4 font-orbitron font-bold text-brand-500 whitespace-nowrap">
                        {party.partyCode}
                      </td>
                      <td className="px-5 py-4 text-white font-sans font-medium whitespace-nowrap">
                        {party.partyName}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border bg-slate-800 text-slate-300 border-slate-700">
                          {party.partyType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-orbitron tracking-wider hidden lg:table-cell">
                        {party.gstin || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-400 font-orbitron tracking-wider hidden sm:table-cell">
                        {party.mobile || '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border",
                          party.isActive 
                            ? 'bg-primary-500/10 text-primary-500 border-primary-500/30' 
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        )}>
                          {party.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleDownloadLedger(party)}
                            disabled={downloadingId === party.id}
                            className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 hover:border-primary-500/30 border border-transparent rounded-lg transition-all disabled:opacity-50"
                            title="Download Ledger PDF"
                          >
                            {downloadingId === party.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(party)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/30 border border-transparent rounded-lg transition-all"
                            title="Edit party"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(party)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all"
                            title="Delete party"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Party Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'EDIT RECORD' : 'NEW RECORD'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                Party Name <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                placeholder="Enter party name"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                Party Code
              </label>
              <input
                value={formData.partyCode}
                onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
                placeholder="Enter party code"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
              Party Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.partyType}
              onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
            >
              <option value="Consignor" className="bg-slate-900 text-white">Consignor (Sender)</option>
              <option value="Consignee" className="bg-slate-900 text-white">Consignee (Receiver)</option>
              <option value="Both" className="bg-slate-900 text-white">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
              Address
            </label>
            <input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                State
              </label>
              <select 
                value={formData.stateId} 
                onChange={handleStateChange}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all"
              >
                <option value="" className="bg-slate-900 text-slate-500">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id} className="bg-slate-900 text-white">
                    {state.stateName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                City
              </label>
              <select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                disabled={!formData.stateId}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-slate-900 text-slate-500">{!formData.stateId ? 'Select State First' : 'Select City'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="bg-slate-900 text-white">
                    {city.cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                Pincode
              </label>
              <input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                GSTIN
              </label>
              <input
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="Enter GSTIN"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                Mobile
              </label>
              <input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">
              Contact Person
            </label>
            <input
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Enter contact person name"
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white font-sans text-sm outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded-md checked:bg-brand-500 checked:border-brand-500 transition-all bg-slate-900/50"
                />
                <div className="absolute inset-0 opacity-0 peer-checked:opacity-100 flex items-center justify-center text-slate-900 pointer-events-none transition-opacity">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
                    <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <span className="text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-300 group-hover:text-white transition-colors">Record Active</span>
            </label>
          </div>

          {/* Party Categories */}
          <div className="border-t border-slate-800 pt-5 mt-2">
            <h3 className="text-[10px] font-orbitron font-bold tracking-widest uppercase text-brand-500 mb-4">Functional Roles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.isVehicleOwner}
                    onChange={(e) => setFormData({ ...formData, isVehicleOwner: e.target.checked })}
                    className="peer appearance-none w-4 h-4 border-2 border-slate-600 rounded-sm checked:bg-brand-500 checked:border-brand-500 transition-all bg-slate-900/50"
                  />
                  <div className="absolute inset-0 opacity-0 peer-checked:opacity-100 flex items-center justify-center text-slate-900 pointer-events-none transition-opacity">
                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-xs font-sans text-slate-300 group-hover:text-white transition-colors">Vehicle Owner</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.isBroker}
                    onChange={(e) => setFormData({ ...formData, isBroker: e.target.checked })}
                    className="peer appearance-none w-4 h-4 border-2 border-slate-600 rounded-sm checked:bg-brand-500 checked:border-brand-500 transition-all bg-slate-900/50"
                  />
                  <div className="absolute inset-0 opacity-0 peer-checked:opacity-100 flex items-center justify-center text-slate-900 pointer-events-none transition-opacity">
                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-xs font-sans text-slate-300 group-hover:text-white transition-colors">Broker</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.isReceivable}
                    onChange={(e) => setFormData({ ...formData, isReceivable: e.target.checked })}
                    className="peer appearance-none w-4 h-4 border-2 border-slate-600 rounded-sm checked:bg-brand-500 checked:border-brand-500 transition-all bg-slate-900/50"
                  />
                  <div className="absolute inset-0 opacity-0 peer-checked:opacity-100 flex items-center justify-center text-slate-900 pointer-events-none transition-opacity">
                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-xs font-sans text-slate-300 group-hover:text-white transition-colors">Receivable <span className="text-slate-500 text-[10px] ml-1">(Income)</span></span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={formData.isPayable}
                    onChange={(e) => setFormData({ ...formData, isPayable: e.target.checked })}
                    className="peer appearance-none w-4 h-4 border-2 border-slate-600 rounded-sm checked:bg-brand-500 checked:border-brand-500 transition-all bg-slate-900/50"
                  />
                  <div className="absolute inset-0 opacity-0 peer-checked:opacity-100 flex items-center justify-center text-slate-900 pointer-events-none transition-opacity">
                    <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none">
                      <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-xs font-sans text-slate-300 group-hover:text-white transition-colors">Payable <span className="text-slate-500 text-[10px] ml-1">(Expense)</span></span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-800">
            <button 
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-orbitron font-bold text-[10px] tracking-widest uppercase hover:bg-slate-800 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="neon-button border-brand-500/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
            >
              {editingId ? 'UPDATE RECORD' : 'SAVE RECORD'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
