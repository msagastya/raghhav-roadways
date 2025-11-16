'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Truck } from 'lucide-react';
import { mastersAPI } from '../../lib/api';
import { Card, CardContent } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import Button from '../ui/button';
import Input from '../ui/input';
import Select from '../ui/select';
import Modal from '../ui/modal';
import Badge from '../ui/badge';
import useToast from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/utils';

const initialOwnerFormData = {
  name: '',
  type: 'owner',
  address: '',
  cityId: '',
  stateId: '',
  pincode: '',
  contact: '',
  remarks: ''
};

const initialVehicleFormData = {
  vehicleNo: '',
  vehicleSize: '',
  vehicleType: '',
  customVehicleType: '',
  noOfTrips: '0',
  remarks: ''
};

const VEHICLE_TYPES = [
  'Open Body Truck',
  'Closed Container',
  'Trailer',
  'Flatbed Truck',
  'Mini Truck',
  'Refrigerated Truck',
  'Tanker',
  'LCV (Light Commercial Vehicle)',
  'HCV (Heavy Commercial Vehicle)',
  'ICV (Intermediate Commercial Vehicle)',
  'Pickup Truck',
  'Tipper',
  'Other (Custom)'
];

export default function VehicleOwnerBrokerMaster() {
  const [records, setRecords] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingOwnerId, setEditingOwnerId] = useState(null);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  const [ownerFormData, setOwnerFormData] = useState(initialOwnerFormData);
  const [vehicleFormData, setVehicleFormData] = useState(initialVehicleFormData);
  const [expandedRows, setExpandedRows] = useState({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchRecords();
    fetchStates();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await mastersAPI.getVehicleOwners({ limit: 100 });
      setRecords(response.data?.data?.vehicleOwners || []);
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
    setOwnerFormData({ ...ownerFormData, stateId, cityId: '' });
    fetchCitiesByState(stateId);
  };

  const handleOwnerSubmit = async () => {
    if (!ownerFormData.name || !ownerFormData.cityId || !ownerFormData.stateId) {
      showError('Please fill all required fields');
      return;
    }

    try {
      if (editingOwnerId) {
        await mastersAPI.updateVehicleOwner(editingOwnerId, ownerFormData);
        showSuccess('Updated successfully');
      } else {
        await mastersAPI.createVehicleOwner(ownerFormData);
        showSuccess('Created successfully');
      }

      setShowOwnerModal(false);
      setOwnerFormData(initialOwnerFormData);
      setEditingOwnerId(null);
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleEditOwner = async (e, id) => {
    e.stopPropagation(); // Prevent row expansion
    try {
      const response = await mastersAPI.getVehicleOwnerById(id);
      const record = response.data.data;
      setOwnerFormData({
        name: record.name,
        type: record.type,
        address: record.address || '',
        cityId: record.cityId,
        stateId: record.stateId,
        pincode: record.pincode || '',
        contact: record.contact || '',
        remarks: record.remarks || ''
      });
      fetchCitiesByState(record.stateId);
      setEditingOwnerId(id);
      setShowOwnerModal(true);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDeleteOwner = async (e, id) => {
    e.stopPropagation(); // Prevent row expansion
    if (!confirm('Are you sure you want to delete this owner/broker and all their vehicles?')) return;

    try {
      await mastersAPI.deleteVehicleOwner(id);
      showSuccess('Deleted successfully');
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openNewOwnerForm = () => {
    setOwnerFormData(initialOwnerFormData);
    setEditingOwnerId(null);
    setCities([]);
    setShowOwnerModal(true);
  };

  // Vehicle management
  const handleVehicleSubmit = async () => {
    if (!vehicleFormData.vehicleNo) {
      showError('Please enter vehicle number');
      return;
    }

    if (vehicleFormData.vehicleType === 'Other (Custom)' && !vehicleFormData.customVehicleType) {
      showError('Please enter custom vehicle type');
      return;
    }

    try {
      const submitData = {
        ...vehicleFormData,
        vehicleType: vehicleFormData.vehicleType === 'Other (Custom)'
          ? vehicleFormData.customVehicleType
          : vehicleFormData.vehicleType
      };
      delete submitData.customVehicleType;

      if (editingVehicleId) {
        await mastersAPI.updateOwnerVehicle(selectedOwnerId, editingVehicleId, submitData);
        showSuccess('Vehicle updated successfully');
      } else {
        await mastersAPI.addVehicleToOwner(selectedOwnerId, submitData);
        showSuccess('Vehicle added successfully');
      }

      setShowVehicleModal(false);
      setVehicleFormData(initialVehicleFormData);
      setEditingVehicleId(null);
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openAddVehicleForm = (e, ownerId) => {
    e.stopPropagation(); // Prevent row expansion
    setSelectedOwnerId(ownerId);
    setVehicleFormData(initialVehicleFormData);
    setEditingVehicleId(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (ownerId, vehicle) => {
    setSelectedOwnerId(ownerId);
    const isCustomType = vehicle.vehicleType && !VEHICLE_TYPES.slice(0, -1).includes(vehicle.vehicleType);
    setVehicleFormData({
      vehicleNo: vehicle.vehicleNo,
      vehicleSize: vehicle.vehicleSize || '',
      vehicleType: isCustomType ? 'Other (Custom)' : (vehicle.vehicleType || ''),
      customVehicleType: isCustomType ? vehicle.vehicleType : '',
      noOfTrips: vehicle.noOfTrips?.toString() || '0',
      remarks: vehicle.remarks || ''
    });
    setEditingVehicleId(vehicle.id);
    setShowVehicleModal(true);
  };

  const handleDeleteVehicle = async (ownerId, vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    try {
      await mastersAPI.deleteOwnerVehicle(ownerId, vehicleId);
      showSuccess('Vehicle deleted successfully');
      fetchRecords();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
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
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Vehicle Owner/Broker Master</h3>
          <p className="text-xs sm:text-sm text-gray-600">Manage vehicle owners, brokers, and their vehicles</p>
        </div>
        <Button onClick={openNewOwnerForm} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Add Owner/Broker</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 sm:w-10"></TableHead>
                  <TableHead className="text-xs sm:text-sm">Name</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Address</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden xl:table-cell">State</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">City</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden 2xl:table-cell">Pincode</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Vehicles</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Contact</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm sm:text-base">No owners/brokers found</p>
                        <Button onClick={openNewOwnerForm} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Owner/Broker
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, index) => (
                    <>
                      <TableRow
                        key={record.id}
                        animate={true}
                        index={index}
                        onClick={() => toggleRow(record.id)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <TableCell>
                          {expandedRows[record.id] ? (
                            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium text-xs sm:text-sm">{record.name}</span>
                            <Badge variant={record.type === 'owner' ? 'success' : 'default'} className="text-xs w-fit">
                              {record.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs sm:text-sm hidden lg:table-cell">{record.address || '-'}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden xl:table-cell">{record.state?.stateName}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{record.city?.cityName}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden 2xl:table-cell">{record.pincode || '-'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {record._count?.vehicles || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{record.contact || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <button
                              onClick={(e) => openAddVehicleForm(e, record.id)}
                              className="p-1.5 sm:p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                              title="Add Vehicle"
                            >
                              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => handleEditOwner(e, record.id)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteOwner(e, record.id)}
                              className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows[record.id] && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-gray-50 p-0">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-sm font-semibold text-gray-900">Vehicle Details</h4>
                              <Button
                                size="sm"
                                onClick={(e) => openAddVehicleForm(e, record.id)}
                                className="flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Add Vehicle
                              </Button>
                            </div>

                            {record.vehicles && record.vehicles.length > 0 ? (
                              <div className="bg-white rounded border">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Size</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle Type</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No of Trips</th>
                                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {record.vehicles.map((vehicle) => (
                                      <tr key={vehicle.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{vehicle.vehicleNo}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleSize || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{vehicle.vehicleType || '-'}</td>
                                        <td className="px-4 py-3 text-sm">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {vehicle.noOfTrips || 0} trips
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                          <div className="flex justify-end gap-2">
                                            <button
                                              onClick={() => handleEditVehicle(record.id, vehicle)}
                                              className="text-blue-600 hover:text-blue-800"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteVehicle(record.id, vehicle.id)}
                                              className="text-red-600 hover:text-red-800"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white rounded border border-dashed">
                                <Truck className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">No vehicles added yet</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => openAddVehicleForm(e, record.id)}
                                  className="mt-3"
                                >
                                  Add First Vehicle
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        </CardContent>
      </Card>

      {/* Owner/Broker Form Modal */}
      <Modal
        isOpen={showOwnerModal}
        onClose={() => setShowOwnerModal(false)}
        title={editingOwnerId ? 'Edit Owner/Broker' : 'Add New Owner/Broker'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={ownerFormData.name}
              onChange={(e) => setOwnerFormData({ ...ownerFormData, name: e.target.value })}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={ownerFormData.type}
              onChange={(e) => setOwnerFormData({ ...ownerFormData, type: e.target.value })}
            >
              <option value="owner">Owner</option>
              <option value="broker">Broker</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              value={ownerFormData.address}
              onChange={(e) => setOwnerFormData({ ...ownerFormData, address: e.target.value })}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Select value={ownerFormData.stateId} onChange={handleStateChange}>
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
                City <span className="text-red-500">*</span>
              </label>
              <Select
                value={ownerFormData.cityId}
                onChange={(e) => setOwnerFormData({ ...ownerFormData, cityId: e.target.value })}
                disabled={!ownerFormData.stateId}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <Input
                value={ownerFormData.pincode}
                onChange={(e) => setOwnerFormData({ ...ownerFormData, pincode: e.target.value })}
                placeholder="Enter pincode"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact
              </label>
              <Input
                value={ownerFormData.contact}
                onChange={(e) => setOwnerFormData({ ...ownerFormData, contact: e.target.value })}
                placeholder="Enter contact number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <Input
              value={ownerFormData.remarks}
              onChange={(e) => setOwnerFormData({ ...ownerFormData, remarks: e.target.value })}
              placeholder="Enter remarks"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowOwnerModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleOwnerSubmit}>
              {editingOwnerId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Vehicle Form Modal */}
      <Modal
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        title={editingVehicleId ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <Input
              value={vehicleFormData.vehicleNo}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleNo: e.target.value })}
              placeholder="e.g., GJ01AB1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Size
              </label>
              <Input
                value={vehicleFormData.vehicleSize}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleSize: e.target.value })}
                placeholder="e.g., 10 MT, 20 Feet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <Select
                value={vehicleFormData.vehicleType}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleType: e.target.value, customVehicleType: '' })}
              >
                <option value="">Select Vehicle Type</option>
                {VEHICLE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {vehicleFormData.vehicleType === 'Other (Custom)' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Vehicle Type <span className="text-red-500">*</span>
              </label>
              <Input
                value={vehicleFormData.customVehicleType}
                onChange={(e) => setVehicleFormData({ ...vehicleFormData, customVehicleType: e.target.value })}
                placeholder="Enter custom vehicle type"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No of Trips
            </label>
            <Input
              type="number"
              value={vehicleFormData.noOfTrips}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, noOfTrips: e.target.value })}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">This can be updated later as trips are completed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks
            </label>
            <Input
              value={vehicleFormData.remarks}
              onChange={(e) => setVehicleFormData({ ...vehicleFormData, remarks: e.target.value })}
              placeholder="Enter remarks"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowVehicleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleVehicleSubmit}>
              {editingVehicleId ? 'Update' : 'Add Vehicle'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
