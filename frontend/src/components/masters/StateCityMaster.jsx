'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { mastersAPI } from '../../lib/api';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table';
import { TableSkeleton } from '../ui/skeleton';
import Button from '../ui/button';
import Input from '../ui/input';
import Select from '../ui/select';
import Modal from '../ui/modal';
import useToast from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/utils';

export default function StateCityMaster() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState({ cityName: '', stateId: '' });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await mastersAPI.getStates();
      setStates(response.data.data || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchCitiesByState = async (stateId) => {
    try {
      const response = await mastersAPI.getCitiesByState(stateId);
      setCities(response.data.data || []);
    } catch (error) {
      showError(getErrorMessage(error));
      setCities([]);
    }
  };

  const handleStateClick = (state) => {
    setSelectedState(state);
    fetchCitiesByState(state.id);
  };

  const handleAddCity = async () => {
    if (!newCity.cityName || !newCity.stateId) {
      showError('Please fill all required fields');
      return;
    }

    try {
      await mastersAPI.addCity(newCity);
      showSuccess('City added successfully');
      setShowAddCity(false);
      setNewCity({ cityName: '', stateId: '' });

      // Refresh cities if viewing the same state
      if (selectedState && selectedState.id === parseInt(newCity.stateId)) {
        fetchCitiesByState(selectedState.id);
      }

      // Refresh states to update city count
      fetchStates();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openAddCityModal = () => {
    if (selectedState) {
      setNewCity({ cityName: '', stateId: selectedState.id.toString() });
    } else {
      setNewCity({ cityName: '', stateId: '' });
    }
    setShowAddCity(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5">
            <Card animate={false}>
              <CardContent className="p-4 sm:p-6">
                <TableSkeleton rows={10} columns={3} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-7">
            <Card animate={false}>
              <CardContent className="p-4 sm:p-6">
                <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">State & City Master</h3>
          <p className="text-xs sm:text-sm text-gray-600">
            {selectedState
              ? `Viewing cities in ${selectedState.stateName}`
              : 'Select a state to view cities'}
          </p>
        </div>
        <Button onClick={openAddCityModal} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="text-xs sm:text-sm">Add City</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column - States List (More space on desktop) */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">States of India</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Code</TableHead>
                      <TableHead className="text-xs sm:text-sm">State</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Cities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {states.map((state, index) => (
                      <TableRow
                        key={state.id}
                        animate={true}
                        index={index}
                        onClick={() => handleStateClick(state)}
                        className={`cursor-pointer transition-colors ${
                          selectedState?.id === state.id
                            ? 'bg-primary-50 hover:bg-primary-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <TableCell className="font-mono text-xs sm:text-sm">{state.stateCode}</TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">{state.stateName}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {state._count?.cities || 0}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cities for Selected State */}
        <div className="lg:col-span-7">
          {selectedState ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                      Cities in {selectedState.stateName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      State Code: {selectedState.stateCode}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total: <span className="font-semibold">{cities.length}</span> cities
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                {cities.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <p className="text-sm sm:text-base text-gray-500">No cities found for this state</p>
                    <Button
                      onClick={openAddCityModal}
                      className="mt-4"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First City
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {cities.map((city, index) => (
                      <motion.div
                        key={city.id}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md transition-all cursor-pointer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02, duration: 0.2 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{city.cityName}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 sm:p-12">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary-100 mb-3 sm:mb-4">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a State</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Click on any state from the list to view its cities
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add City Modal */}
      <Modal isOpen={showAddCity} onClose={() => setShowAddCity(false)} title="Add New City">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State <span className="text-red-500">*</span>
            </label>
            <Select
              value={newCity.stateId}
              onChange={(e) => setNewCity({ ...newCity, stateId: e.target.value })}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.stateName} ({state.stateCode})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={newCity.cityName}
              onChange={(e) => setNewCity({ ...newCity, cityName: e.target.value })}
              placeholder="Enter city name"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAddCity(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCity}>Add City</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
