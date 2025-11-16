'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Users, Building2, ArrowRight, Edit, Trash2, X } from 'lucide-react';
import { partyAPI, mastersAPI } from '../../../lib/api';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { TableSkeleton } from '../../../components/ui/skeleton';
import Button from '../../../components/ui/button';
import Badge from '../../../components/ui/badge';
import Modal from '../../../components/ui/modal';
import Input from '../../../components/ui/input';
import Select from '../../../components/ui/select';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

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
};

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, withGSTIN: 0 });
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
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

  // Filter parties based on selected filter
  const filteredParties = parties.filter(party => {
    if (filter === 'all') return true;
    if (filter === 'active') return party.isActive;
    if (filter === 'inactive') return !party.isActive;
    if (filter === 'withGSTIN') return party.gstin && party.gstin.trim() !== '';
    return true;
  });

  const getFilterTitle = () => {
    if (filter === 'all') return 'All Parties';
    if (filter === 'active') return 'Active Parties';
    if (filter === 'inactive') return 'Inactive Parties';
    if (filter === 'withGSTIN') return 'Parties with GSTIN';
    return 'All Parties';
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <Card animate={false}>
          <CardContent className="p-4 sm:p-6">
            <TableSkeleton rows={10} columns={7} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        className="space-y-3 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-sm">Parties</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage consignors and consignees</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/masters" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Manage Masters</span>
              </Button>
            </Link>
            <Button onClick={openAddModal} className="flex-1 sm:flex-none flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Add Party</span>
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs sm:text-sm font-bold">i</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 flex-1">
              <strong className="font-semibold">Party Type:</strong> A party can be marked as <strong>Consignor</strong> (sender),
              <strong> Consignee</strong> (receiver), or <strong>Both</strong>. The same party can send and receive goods
              at different times.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Parties', value: stats.total, icon: Users, bg: 'bg-blue-100', iconColor: 'text-blue-600', filterKey: 'all' },
          { label: 'Active', value: stats.active, icon: Building2, bg: 'bg-green-100', iconColor: 'text-green-600', filterKey: 'active' },
          { label: 'Inactive', value: stats.inactive, icon: Building2, bg: 'bg-red-100', iconColor: 'text-red-600', filterKey: 'inactive' },
          { label: 'With GSTIN', value: stats.withGSTIN, icon: Users, bg: 'bg-purple-100', iconColor: 'text-purple-600', filterKey: 'withGSTIN' }
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
            >
              <Card animate={false} hover3d={true} className={`group cursor-pointer transition-all ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <motion.div
                      className={`p-2 sm:p-2.5 rounded-xl ${stat.bg} flex-shrink-0 shadow-md`}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.6, type: 'spring' }}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Parties Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card animate={false} hover3d={true}>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{getFilterTitle()}</h3>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Code</TableHead>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">GSTIN</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Mobile</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-sm">No parties found</p>
                          <Button onClick={openAddModal} size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add First Party
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParties.map((party, index) => (
                      <TableRow key={party.id} animate={true} index={index}>
                        <TableCell className="font-medium text-xs sm:text-sm">{party.partyCode}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{party.partyName}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          <Badge variant="secondary">{party.partyType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{party.gstin || '-'}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{party.mobile || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={party.isActive ? 'success' : 'danger'} className="text-xs">
                            {party.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(party)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit party"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(party)}
                              className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete party"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add/Edit Party Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Party' : 'Add New Party'}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.partyName}
                onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                placeholder="Enter party name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Party Code
              </label>
              <Input
                value={formData.partyCode}
                onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
                placeholder="Enter party code"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Party Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.partyType}
              onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
            >
              <option value="Consignor">Consignor (Sender)</option>
              <option value="Consignee">Consignee (Receiver)</option>
              <option value="Both">Both</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Select value={formData.stateId} onChange={handleStateChange}>
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.stateName}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                disabled={!formData.stateId}
              >
                <option value="">{!formData.stateId ? 'Select State First' : 'Select City'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <Input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <Input
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="Enter GSTIN"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <Input
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <Input
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Enter contact person name"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Update Party' : 'Create Party'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
