'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mastersAPI } from '../../lib/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Button from '../ui/button';
import Input from '../ui/input';
import Select from '../ui/select';
import Modal from '../ui/modal';
import useToast from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/utils';

const initialFormData = {
  name: '',
  address: '',
  cityId: '',
  stateId: '',
  pincode: '',
  gstin: '',
  contact: '',
  remarks: ''
};

export default function InvoicePartyMaster() {
  const [records, setRecords] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchRecords();
    fetchStates();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await mastersAPI.getInvoiceParties({ limit: 100 });
      setRecords(response.data.data.records || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      console.log('Fetching states...');
      const response = await mastersAPI.getStates();
      console.log('States response:', response.data);
      const statesData = response.data.data || [];
      console.log('States data:', statesData.length, 'states loaded');
      setStates(statesData);
    } catch (error) {
      console.error('Error fetching states:', error);
      showError(getErrorMessage(error));
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
      showError(getErrorMessage(error));
    }
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setFormData({ ...formData, stateId, cityId: '' });
    fetchCitiesByState(stateId);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.cityId || !formData.stateId) {
      showError('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await mastersAPI.updateInvoiceParty(editingId, formData);
        showSuccess('Updated successfully');
      } else {
        await mastersAPI.createInvoiceParty(formData);
        showSuccess('Created successfully');
      }

      setShowModal(false);
      setFormData(initialFormData);
      setEditingId(null);
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await mastersAPI.getInvoicePartyById(id);
      const record = response.data.data;
      setFormData({
        name: record.name,
        address: record.address || '',
        cityId: record.cityId,
        stateId: record.stateId,
        pincode: record.pincode || '',
        gstin: record.gstin || '',
        contact: record.contact || '',
        remarks: record.remarks || ''
      });
      fetchCitiesByState(record.stateId);
      setEditingId(id);
      setShowModal(true);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this party?')) return;

    try {
      await mastersAPI.deleteInvoiceParty(id);
      showSuccess('Deleted successfully');
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openNewForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setCities([]);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Party Master (for Invoices)</h3>
          <p className="text-xs sm:text-sm text-gray-600">Manage party information for billing and invoices</p>
        </div>
        <Button onClick={openNewForm} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Add New Party</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-xs sm:text-sm">City</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">State</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden xl:table-cell">GSTIN</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm sm:text-base">No parties found</p>
                        <Button onClick={openNewForm} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Party
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, index) => (
                    <TableRow key={record.id} animate={true} index={index}>
                      <TableCell className="font-medium text-xs sm:text-sm">{record.name}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden md:table-cell">{record.address || '-'}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{record.city?.cityName}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{record.state?.stateName}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden xl:table-cell">{record.gstin || '-'}</TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{record.contact || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(record.id)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Party' : 'Add New Party'}
      >
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter party name"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                disabled={!formData.stateId}
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityName}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <Input
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                GSTIN
              </label>
              <Input
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="Enter GSTIN"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <Input
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <Input
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Enter remarks"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
