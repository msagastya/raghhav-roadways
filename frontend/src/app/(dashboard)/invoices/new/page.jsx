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

  // Form state - Party (all editable)
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partyAddress, setPartyAddress] = useState('');
  const [partyGST, setPartyGST] = useState('');

  // GR state
  const [selectedGRs, setSelectedGRs] = useState([]);

  // Extra items state (multiple)
  const [extraItems, setExtraItems] = useState([]);

  // GR Charges
  const [grCharges, setGrCharges] = useState(150);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partiesRes, consignmentsRes] = await Promise.all([
        partyAPI.getAll({ limit: 1000 }),
        consignmentAPI.getAll({ limit: 1000 })
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
    if (party) {
      setPartyName(party.partyName);
      setPartyGST(party.gstin || '');

      // Build address
      const address = [
        party.address,
        party.city?.cityName,
        party.state?.stateName,
        party.pincode
      ].filter(Boolean).join(', ');

      setPartyAddress(address);
    } else {
      setPartyName('');
      setPartyAddress('');
      setPartyGST('');
    }
  };

  const handleGRSelection = (grNumber) => {
    const consignment = consignments.find(c => c.grNumber === grNumber);
    if (!consignment) return;

    const isSelected = selectedGRs.some(gr => gr.grNumber === grNumber);

    if (!isSelected) {
      // Add new GR with editable fields
      setSelectedGRs([...selectedGRs, {
        grNumber: consignment.grNumber,
        grDate: new Date(consignment.grDate).toISOString().split('T')[0],
        vehicleNo: consignment.vehicleNumber || '',
        contents: consignment.contents || '',
        from: consignment.fromLocation || '',
        to: consignment.toLocation || '',
        amount: consignment.totalAmount || 0
      }]);
    }
  };

  const updateGRField = (grNumber, field, value) => {
    setSelectedGRs(selectedGRs.map(gr =>
      gr.grNumber === grNumber ? { ...gr, [field]: value } : gr
    ));
  };

  const removeGR = (grNumber) => {
    setSelectedGRs(selectedGRs.filter(gr => gr.grNumber !== grNumber));
  };

  // Extra items functions
  const addExtraItem = () => {
    setExtraItems([...extraItems, { content: '', charge: 0 }]);
  };

  const updateExtraItem = (index, field, value) => {
    const newItems = [...extraItems];
    newItems[index][field] = value;
    setExtraItems(newItems);
  };

  const removeExtraItem = (index) => {
    setExtraItems(extraItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const grTotal = selectedGRs.reduce((sum, gr) => sum + (parseFloat(gr.amount) || 0), 0);
    const extraTotal = extraItems.reduce((sum, item) => sum + (parseFloat(item.charge) || 0), 0);
    return grTotal + extraTotal + (parseFloat(grCharges) || 0);
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
        // Party details (editable)
        partyId: parseInt(selectedPartyId),
        partyName: partyName,
        partyAddress: partyAddress,
        partyGST: partyGST,

        // GR items (all editable)
        grItems: selectedGRs,

        // Extra items
        extraItems: extraItems.filter(item => item.content || item.charge),

        // Charges
        grCharges: parseFloat(grCharges) || 0,

        // Total
        totalAmount: calculateTotal(),

        // Invoice date
        invoiceDate: new Date().toISOString()
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
        {/* Party Selection - All Editable */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Party Details (All Editable)</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Select Party (to auto-fill) *"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Party Name *"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                required
                placeholder="Enter party name"
              />

              <Input
                label="GST Number"
                value={partyGST}
                onChange={(e) => setPartyGST(e.target.value)}
                placeholder="Enter GST number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                value={partyAddress}
                onChange={(e) => setPartyAddress(e.target.value)}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter complete address"
              />
            </div>
          </CardContent>
        </Card>

        {/* GR Selection - All Editable */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Select Consignments (All Fields Editable)</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Add GR Number"
              value=""
              onChange={(e) => handleGRSelection(e.target.value)}
            >
              <option value="">-- Select GR Number to Add --</option>
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

            {/* Selected GRs Table - All Editable */}
            {selectedGRs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GR No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">GR Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle No</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contents</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount *</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedGRs.map(gr => (
                      <tr key={gr.grNumber}>
                        <td className="px-3 py-2 text-sm text-gray-900">{gr.grNumber}</td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={gr.grDate}
                            onChange={(e) => updateGRField(gr.grNumber, 'grDate', e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={gr.vehicleNo}
                            onChange={(e) => updateGRField(gr.grNumber, 'vehicleNo', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Vehicle No"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={gr.contents}
                            onChange={(e) => updateGRField(gr.grNumber, 'contents', e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Contents"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={gr.from}
                            onChange={(e) => updateGRField(gr.grNumber, 'from', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="From"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={gr.to}
                            onChange={(e) => updateGRField(gr.grNumber, 'to', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="To"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={gr.amount}
                            onChange={(e) => updateGRField(gr.grNumber, 'amount', e.target.value)}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Amount"
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

        {/* Extra Items - Multiple with Individual Charges */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Extra Items</h3>
              <Button type="button" onClick={addExtraItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Extra Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {extraItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    label="Extra Content"
                    value={item.content}
                    onChange={(e) => updateExtraItem(index, 'content', e.target.value)}
                    placeholder="Describe the extra item"
                  />
                </div>
                <div className="w-48">
                  <Input
                    label="Charge (₹)"
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.charge}
                    onChange={(e) => updateExtraItem(index, 'charge', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExtraItem(index)}
                  className="mt-8 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {extraItems.length === 0 && (
              <p className="text-gray-500 text-sm">No extra items added. Click "Add Extra Item" to add one.</p>
            )}

            <div className="pt-4 border-t">
              <Input
                label="GR Charges (₹) - Editable"
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
              <p>GR Charges Total: ₹ {selectedGRs.reduce((sum, gr) => sum + (parseFloat(gr.amount) || 0), 0).toFixed(2)}</p>
              <p>Extra Items Total: ₹ {extraItems.reduce((sum, item) => sum + (parseFloat(item.charge) || 0), 0).toFixed(2)}</p>
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
