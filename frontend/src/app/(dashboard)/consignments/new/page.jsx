'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import Select from '../../../../components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';
import { consignmentAPI, vehicleAPI, mastersAPI } from '../../../../lib/api';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

const initialFormData = {
  grDate: new Date().toISOString().split('T')[0],
  consignmentNo: '',
  issuingBranch: 'Surat',
  fromLocation: '',
  toLocation: '',
  deliveryOffice: '',

  // Vehicle Details
  vehicleId: '',
  vehicleNumber: '',
  vehicleSize: '',
  vehicleType: '',

  // E-way Bill Details
  ewayBillNo: '',
  ewayBillFromDate: '',
  ewayBillValidUpto: '',

  // Consignor/Consignee
  consignorId: '',
  consigneeId: '',

  // Package Details
  noOfPackages: '',
  description: '',
  actualWeight: '',
  chargedWeight: '',
  weightUnit: 'MT',
  shipmentValue: '',

  // Charges
  freightAmount: '',
  surcharge: '0',
  otherCharges: '0',
  grCharge: '0',
  totalAmount: '',
  amountInWords: '',

  // Payment
  paymentMode: 'To Pay',
  atRisk: 'Owner Risk',

  // Insurance
  policyNo: '',
  policyAmount: '',

  // Other
  rateType: 'Per MT',
  rateCalculationText: '',
  notes: ''
};

export default function NewConsignmentPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [consignors, setConsignors] = useState([]);
  const [consignees, setConsignees] = useState([]);
  const [selectedConsignor, setSelectedConsignor] = useState(null);
  const [selectedConsignee, setSelectedConsignee] = useState(null);
  const [challanFile, setChallanFile] = useState(null);
  const [ewayBillFile, setEwayBillFile] = useState(null);

  useEffect(() => {
    fetchVehicles();
    fetchConsignors();
    fetchConsignees();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [formData.freightAmount, formData.surcharge, formData.otherCharges, formData.grCharge]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll({ limit: 100, isActive: true });
      setVehicles(response.data.data.records || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchConsignors = async () => {
    try {
      const response = await mastersAPI.getConsignorConsignees({ limit: 100 });
      setConsignors(response.data.data.records || []);
    } catch (error) {
      console.error('Error fetching consignors:', error);
    }
  };

  const fetchConsignees = async () => {
    try {
      const response = await mastersAPI.getConsignorConsignees({ limit: 100 });
      setConsignees(response.data.data.records || []);
    } catch (error) {
      console.error('Error fetching consignees:', error);
    }
  };

  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      setFormData({
        ...formData,
        vehicleId,
        vehicleNumber: vehicle.vehicleNo,
        vehicleType: vehicle.vehicleType || '',
        vehicleSize: ''
      });
    } else {
      setFormData({ ...formData, vehicleId: '', vehicleNumber: '', vehicleType: '', vehicleSize: '' });
    }
  };

  const handleConsignorChange = (e) => {
    const consignorId = e.target.value;
    const consignor = consignors.find(c => c.id === parseInt(consignorId));
    setSelectedConsignor(consignor || null);
    setFormData({ ...formData, consignorId });
  };

  const handleConsigneeChange = (e) => {
    const consigneeId = e.target.value;
    const consignee = consignees.find(c => c.id === parseInt(consigneeId));
    setSelectedConsignee(consignee || null);
    setFormData({ ...formData, consigneeId });
  };

  const calculateTotal = () => {
    const freight = parseFloat(formData.freightAmount) || 0;
    const surcharge = parseFloat(formData.surcharge) || 0;
    const other = parseFloat(formData.otherCharges) || 0;
    const gr = parseFloat(formData.grCharge) || 0;
    const total = freight + surcharge + other + gr;
    setFormData(prev => ({ ...prev, totalAmount: total.toFixed(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.consignorId || !formData.consigneeId) {
      showError('Please select consignor and consignee');
      return;
    }
    if (!formData.vehicleId) {
      showError('Please select a vehicle');
      return;
    }
    if (!formData.fromLocation || !formData.toLocation) {
      showError('Please enter from and to locations');
      return;
    }
    if (!formData.freightAmount) {
      showError('Please enter freight amount');
      return;
    }

    setLoading(true);
    try {
      // Create consignment
      const consignmentData = {
        grDate: formData.grDate,
        consignmentNo: formData.consignmentNo || undefined,
        consignorId: parseInt(formData.consignorId),
        consigneeId: parseInt(formData.consigneeId),
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        issuingBranch: formData.issuingBranch,
        deliveryOffice: formData.deliveryOffice || undefined,
        vehicleId: parseInt(formData.vehicleId),
        vehicleNumber: formData.vehicleNumber,
        vehicleSize: formData.vehicleSize || undefined,
        vehicleType: formData.vehicleType || undefined,
        noOfPackages: formData.noOfPackages ? parseInt(formData.noOfPackages) : undefined,
        description: formData.description || undefined,
        actualWeight: formData.actualWeight ? parseFloat(formData.actualWeight) : undefined,
        chargedWeight: formData.chargedWeight ? parseFloat(formData.chargedWeight) : undefined,
        weightUnit: formData.weightUnit,
        shipmentValue: formData.shipmentValue ? parseFloat(formData.shipmentValue) : undefined,
        freightAmount: parseFloat(formData.freightAmount),
        surcharge: parseFloat(formData.surcharge) || 0,
        otherCharges: parseFloat(formData.otherCharges) || 0,
        grCharge: parseFloat(formData.grCharge) || 0,
        totalAmount: parseFloat(formData.totalAmount),
        amountInWords: formData.amountInWords || undefined,
        paymentMode: formData.paymentMode,
        atRisk: formData.atRisk || undefined,
        rateType: formData.rateType || undefined,
        rateCalculationText: formData.rateCalculationText || undefined,
        ewayBillNo: formData.ewayBillNo || undefined,
        ewayBillFromDate: formData.ewayBillFromDate || undefined,
        ewayBillValidUpto: formData.ewayBillValidUpto || undefined,
        policyNo: formData.policyNo || undefined,
        policyAmount: formData.policyAmount ? parseFloat(formData.policyAmount) : undefined,
        notes: formData.notes || undefined
      };

      const response = await consignmentAPI.create(consignmentData);
      const consignmentId = response.data.data.id;

      // Upload challan file if provided
      if (challanFile) {
        await consignmentAPI.uploadChallan(consignmentId, challanFile);
      }

      showSuccess('Consignment created successfully');
      router.push('/consignments');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/consignments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Consignment</h1>
          <p className="text-gray-600 mt-1">Create a new consignment record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.grDate}
                  onChange={(e) => setFormData({ ...formData, grDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consignment No
                </label>
                <Input
                  value={formData.consignmentNo}
                  onChange={(e) => setFormData({ ...formData, consignmentNo: e.target.value })}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuing Branch <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.issuingBranch}
                  onChange={(e) => setFormData({ ...formData, issuingBranch: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Office
                </label>
                <Input
                  value={formData.deliveryOffice}
                  onChange={(e) => setFormData({ ...formData, deliveryOffice: e.target.value })}
                  placeholder="Enter delivery office"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  placeholder="From location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  placeholder="To location"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck No <span className="text-red-500">*</span>
                </label>
                <Select value={formData.vehicleId} onChange={handleVehicleChange} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleNo}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Truck Size
                </label>
                <Input
                  value={formData.vehicleSize}
                  onChange={(e) => setFormData({ ...formData, vehicleSize: e.target.value })}
                  placeholder="e.g., 20 Feet, 10 MT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <Input
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  placeholder="Vehicle type"
                  disabled={formData.vehicleId}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* E-way Bill Details */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">E-way Bill & Documents</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-way Bill No
                </label>
                <Input
                  value={formData.ewayBillNo}
                  onChange={(e) => setFormData({ ...formData, ewayBillNo: e.target.value })}
                  placeholder="Enter E-way bill number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={formData.ewayBillFromDate}
                  onChange={(e) => setFormData({ ...formData, ewayBillFromDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid Upto
                </label>
                <Input
                  type="date"
                  value={formData.ewayBillValidUpto}
                  onChange={(e) => setFormData({ ...formData, ewayBillValidUpto: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-waybill File
                </label>
                <Input
                  type="file"
                  onChange={(e) => setEwayBillFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challan File
                </label>
                <Input
                  type="file"
                  onChange={(e) => setChallanFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consignor & Consignee */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Consignor & Consignee Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consignor */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Consignor</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Consignor <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.consignorId} onChange={handleConsignorChange} required>
                      <option value="">Select Consignor</option>
                      {consignors.map((consignor) => (
                        <option key={consignor.id} value={consignor.id}>
                          {consignor.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {selectedConsignor && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">{selectedConsignor.address || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City, State:</span>
                        <p className="text-gray-600">
                          {selectedConsignor.city?.cityName}, {selectedConsignor.state?.stateName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">GSTIN:</span>
                        <p className="text-gray-600">{selectedConsignor.gstin || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <p className="text-gray-600">{selectedConsignor.contact || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Consignee */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-3">Consignee</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Consignee <span className="text-red-500">*</span>
                    </label>
                    <Select value={formData.consigneeId} onChange={handleConsigneeChange} required>
                      <option value="">Select Consignee</option>
                      {consignees.map((consignee) => (
                        <option key={consignee.id} value={consignee.id}>
                          {consignee.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  {selectedConsignee && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">{selectedConsignee.address || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City, State:</span>
                        <p className="text-gray-600">
                          {selectedConsignee.city?.cityName}, {selectedConsignee.state?.stateName}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">GSTIN:</span>
                        <p className="text-gray-600">{selectedConsignee.gstin || '-'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <p className="text-gray-600">{selectedConsignee.contact || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Details */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Package & Weight Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. of Packages
                </label>
                <Input
                  type="number"
                  value={formData.noOfPackages}
                  onChange={(e) => setFormData({ ...formData, noOfPackages: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Weight
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.actualWeight}
                  onChange={(e) => setFormData({ ...formData, actualWeight: e.target.value })}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charged Weight
                </label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.chargedWeight}
                  onChange={(e) => setFormData({ ...formData, chargedWeight: e.target.value })}
                  placeholder="0.000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight Unit
                </label>
                <Select
                  value={formData.weightUnit}
                  onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                >
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="KG">KG (Kilogram)</option>
                  <option value="Quintal">Quintal</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Package description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Value
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.shipmentValue}
                  onChange={(e) => setFormData({ ...formData, shipmentValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charges & Payment */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Charges & Payment</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Freight Amount <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.freightAmount}
                  onChange={(e) => setFormData({ ...formData, freightAmount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surcharge
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.surcharge}
                  onChange={(e) => setFormData({ ...formData, surcharge: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Charges
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.otherCharges}
                  onChange={(e) => setFormData({ ...formData, otherCharges: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GR Charge
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.grCharge}
                  onChange={(e) => setFormData({ ...formData, grCharge: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <Input
                  type="number"
                  value={formData.totalAmount}
                  readOnly
                  className="bg-gray-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Mode
                </label>
                <Select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                >
                  <option value="To Pay">To Pay</option>
                  <option value="Paid">Paid</option>
                  <option value="TBB">TBB (To Be Billed)</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  At Risk
                </label>
                <Select
                  value={formData.atRisk}
                  onChange={(e) => setFormData({ ...formData, atRisk: e.target.value })}
                >
                  <option value="Owner Risk">Owner Risk</option>
                  <option value="Carrier Risk">Carrier Risk</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Details */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Insurance Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy No
                </label>
                <Input
                  value={formData.policyNo}
                  onChange={(e) => setFormData({ ...formData, policyNo: e.target.value })}
                  placeholder="Insurance policy number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.policyAmount}
                  onChange={(e) => setFormData({ ...formData, policyAmount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Type
                </label>
                <Select
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                >
                  <option value="Per MT">Per MT</option>
                  <option value="Per KG">Per KG</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Per Package">Per Package</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Calculation
                </label>
                <Input
                  value={formData.rateCalculationText}
                  onChange={(e) => setFormData({ ...formData, rateCalculationText: e.target.value })}
                  placeholder="e.g., 500 x 10 MT"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Enter any additional notes or remarks"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/consignments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Consignment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
