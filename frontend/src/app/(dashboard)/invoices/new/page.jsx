'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Select from '../../../../components/ui/select';
import { ArrowLeft, Plus, Trash2, Calculator } from 'lucide-react';
import Link from 'next/link';
import { partyAPI, consignmentAPI, invoiceAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewInvoicePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  // State for parties and consignments
  const [parties, setParties] = useState([]);
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedGRs, setSelectedGRs] = useState([]);
  const [grAmounts, setGrAmounts] = useState({});
  const [extraContents, setExtraContents] = useState('');
  const [extraCharges, setExtraCharges] = useState(0);
  const [grCharges, setGrCharges] = useState(150);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partiesRes, consignmentsRes] = await Promise.all([
        partyAPI.getAll({ limit: 1000 }),
        consignmentAPI.getAll({ limit: 1000, status: 'Delivered' })
      ]);

      setParties(partiesRes.data?.data?.parties || []);
      setConsignments(consignmentsRes.data?.data?.consignments || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePartyChange = (e) => {
    const partyId = e.target.value;
    setSelectedPartyId(partyId);

    const party = parties.find(p => p.id === parseInt(partyId));
    setSelectedParty(party || null);
  };

  const handleGRSelection = (grNumber) => {
    const consignment = consignments.find(c => c.grNumber === grNumber);
    if (!consignment) return;

    const isSelected = selectedGRs.some(gr => gr.grNumber === grNumber);

    if (isSelected) {
      setSelectedGRs(selectedGRs.filter(gr => gr.grNumber !== grNumber));
      const newAmounts = { ...grAmounts };
      delete newAmounts[grNumber];
      setGrAmounts(newAmounts);
    } else {
      setSelectedGRs([...selectedGRs, consignment]);
    }
  };

  const handleAmountChange = (grNumber, amount) => {
    setGrAmounts({
      ...grAmounts,
      [grNumber]: parseFloat(amount) || 0
    });
  };

  const removeGR = (grNumber) => {
    setSelectedGRs(selectedGRs.filter(gr => gr.grNumber !== grNumber));
    const newAmounts = { ...grAmounts };
    delete newAmounts[grNumber];
    setGrAmounts(newAmounts);
  };

  const calculateTotal = () => {
    const grTotal = Object.values(grAmounts).reduce((sum, amount) => sum + amount, 0);
    return grTotal + (parseFloat(extraCharges) || 0) + (parseFloat(grCharges) || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPartyId) {
      showError('Please select a party');
      return;
    }

    if (selectedGRs.length === 0) {
      showError('Please select at least one GR/Consignment');
      return;
    }

    setSaving(true);
    try {
      const invoiceData = {
        partyId: parseInt(selectedPartyId),
        consignmentIds: selectedGRs.map(gr => gr.id),
        grAmounts: grAmounts,
        extraContents: extraContents,
        extraCharges: parseFloat(extraCharges) || 0,
        grCharges: parseFloat(grCharges) || 0,
        totalAmount: calculateTotal()
      };

      await invoiceAPI.create(invoiceData);
      showSuccess('Invoice created successfully');
      router.push('/invoices');
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
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-600 mt-1">Generate a new invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Party Selection */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Party Details</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Select Party *"
              value={selectedPartyId}
              onChange={handlePartyChange}
              required
            >
              <option value="">-- Select Party --</option>
              {parties.map(party => (
                <option key={party.id} value={party.id}>
                  {party.partyName} ({party.partyCode})
                </option>
              ))}
            </Select>

            {selectedParty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-gray-700">Party Name</label>
                  <p className="text-gray-900">{selectedParty.partyName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">GST No</label>
                  <p className="text-gray-900">{selectedParty.gstin || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">
                    {selectedParty.address && `${selectedParty.address}, `}
                    {selectedParty.city?.cityName}, {selectedParty.state?.stateName} - {selectedParty.pincode}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GR Selection */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Select Consignments (GR Numbers)</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Add GR Number"
              value=""
              onChange={(e) => handleGRSelection(e.target.value)}
            >
              <option value="">-- Select GR Number --</option>
              {consignments.map(consignment => (
                <option
                  key={consignment.id}
                  value={consignment.grNumber}
                  disabled={selectedGRs.some(gr => gr.grNumber === consignment.grNumber)}
                >
                  {consignment.grNumber} - {consignment.fromLocation} to {consignment.toLocation}
                </option>
              ))}
            </Select>

            {/* Selected GRs Table */}
            {selectedGRs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GR No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GR Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contents</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">From - To</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount *</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGRs.map(gr => (
                      <tr key={gr.grNumber}>
                        <td className="px-3 py-2 text-sm text-gray-900">{gr.grNumber}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {new Date(gr.grDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">{gr.vehicleNumber}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{gr.contents || 'N/A'}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {gr.fromLocation} - {gr.toLocation}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={grAmounts[gr.grNumber] || ''}
                            onChange={(e) => handleAmountChange(gr.grNumber, e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Enter amount"
                            required
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeGR(gr.grNumber)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Charges */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Extra Contents
              </label>
              <textarea
                value={extraContents}
                onChange={(e) => setExtraContents(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter any extra contents or notes"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Extra Charges (₹)"
                type="number"
                step="0.01"
                min="0"
                value={extraCharges}
                onChange={(e) => setExtraCharges(e.target.value)}
                placeholder="0.00"
              />

              <Input
                label="GR Charges (₹)"
                type="number"
                step="0.01"
                min="0"
                value={grCharges}
                onChange={(e) => setGrCharges(e.target.value)}
                placeholder="150.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Total and Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
              </div>
              <span className="text-2xl font-bold text-primary-600">
                ₹ {calculateTotal().toFixed(2)}
              </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-6">
              <p>GR Charges Total: ₹ {Object.values(grAmounts).reduce((sum, amount) => sum + amount, 0).toFixed(2)}</p>
              <p>Extra Charges: ₹ {(parseFloat(extraCharges) || 0).toFixed(2)}</p>
              <p>GR Charges: ₹ {(parseFloat(grCharges) || 0).toFixed(2)}</p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving || selectedGRs.length === 0}
                className="flex-1"
              >
                {saving ? 'Creating Invoice...' : 'Create Invoice'}
              </Button>
              <Link href="/invoices">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
