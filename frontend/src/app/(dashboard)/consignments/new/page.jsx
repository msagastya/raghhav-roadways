'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, Truck } from 'lucide-react';
import { consignmentAPI } from '../../../../lib/api';
import FormSection from '../../../../components/ui/form-section';
import PageHeader from '../../../../components/ui/page-header';
import Button from '../../../../components/ui/button';
import Input from '../../../../components/ui/input';
import useToast from '../../../../hooks/useToast';
import { getErrorMessage } from '../../../../lib/utils';

export default function NewConsignmentPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const { showError, showSuccess } = useToast();

  const onSubmit = async (data) => {
    try {
      await consignmentAPI.create(data);
      showSuccess('Consignment created successfully');
      router.push('/consignments');
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="GR Builder"
        subtitle="Create new consignment"
        icon={Package}
      />

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FormSection title="Booking Details" icon={Calendar} defaultOpen>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="GR Date" type="date" {...register('consignmentDate', { required: 'GR Date is required' })} error={errors.consignmentDate?.message} />
            <Input label="GR Number" {...register('grNumber', { required: 'GR Number is required' })} error={errors.grNumber?.message} />
            <Input label="Issuing Branch" {...register('issuingBranch', { required: 'Issuing Branch is required' })} error={errors.issuingBranch?.message} />
            <Input label="Delivery Office" {...register('deliveryOffice')} />
          </div>
        </FormSection>

        <FormSection title="Route" icon={MapPin}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="From Location" {...register('fromLocation', { required: 'From location is required' })} error={errors.fromLocation?.message} />
            <Input label="To Location" {...register('toLocation', { required: 'To location is required' })} error={errors.toLocation?.message} />
          </div>
        </FormSection>

        <FormSection title="Vehicle" icon={Truck}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Vehicle Number" {...register('vehicleNumber', { required: 'Vehicle number is required', pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'Invalid format (e.g. GJ05AB1234)' } })} error={errors.vehicleNumber?.message} />
            <Input label="Vehicle Type" {...register('vehicleType')} />
            <Input label="Driver Name" {...register('driverName')} />
            <Input label="Driver Mobile" {...register('driverMobile', { pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' } })} error={errors.driverMobile?.message} />
          </div>
        </FormSection>

        <FormSection title="Parties">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Consignor" {...register('consignorName')} />
            <Input label="Consignee" {...register('consigneeName')} />
          </div>
        </FormSection>

        <FormSection title="Cargo Details">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="Packages" type="number" {...register('numberOfPackages')} />
            <Input label="Weight" type="number" {...register('weight')} />
            <Input label="Weight Unit" {...register('weightUnit')} />
            <Input label="Shipment Value" type="number" {...register('shipmentValue')} />
          </div>
          <Input label="Description" className="mt-4" {...register('description')} />
        </FormSection>

        <FormSection title="Financial">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Input label="Freight (₹)" type="number" {...register('freight', { required: 'Freight amount is required', min: { value: 0, message: 'Must be 0 or more' } })} error={errors.freight?.message} />
            <Input label="Surcharge (₹)" type="number" {...register('surcharge')} />
            <Input label="Other Charges (₹)" type="number" {...register('otherCharges')} />
            <Input label="Payment Mode" {...register('paymentMode')} />
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('atRisk')} />
              <span className="text-sm text-gray-600 dark:text-white/70">At Risk</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Documents">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Eway Bill Number" {...register('ewayBillNumber')} />
            <Input label="Valid Upto" type="date" {...register('ewayBillValidUpto')} />
            <Input label="Challan Upload" type="file" {...register('challanFile')} />
            <Input label="POD Upload" type="file" {...register('podFile')} />
          </div>
        </FormSection>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Consignment'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
