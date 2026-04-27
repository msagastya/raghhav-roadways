'use client';

import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Package, Calendar, MapPin, Truck, IndianRupee, FileText } from 'lucide-react';
import FormSection from '../ui/form-section';
import Button from '../ui/button';
import Input from '../ui/input';

const PAYMENT_MODES = ['To Pay', 'Paid', 'To Be Billed'];
const WEIGHT_UNITS = ['MT', 'KG', 'LT'];
const STATUSES = ['Booked', 'Loaded', 'In Transit', 'Delivered', 'Settled'];

export default function ConsignmentForm({ defaultValues = {}, onSubmit, onCancel, submitLabel = 'Save Consignment', isEdit = false }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormSection title="Booking Details" icon={Calendar} defaultOpen required>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="GR Date"
            type="date"
            required
            {...register('grDate', { required: 'GR Date is required' })}
            error={errors.grDate?.message}
          />
          <Input
            label="GR Number"
            required
            {...register('grNumber', { required: 'GR Number is required' })}
            error={errors.grNumber?.message}
            disabled={isEdit}
          />
          <Input
            label="Issuing Branch"
            required
            {...register('issuingBranch', { required: 'Issuing Branch is required' })}
            error={errors.issuingBranch?.message}
            placeholder="Surat"
          />
          <Input label="Delivery Office" {...register('deliveryOffice')} />
        </div>
        {isEdit && (
          <div className="mt-3">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select
              {...register('status')}
              className="px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </FormSection>

      <FormSection title="Route" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="From Location"
            required
            {...register('fromLocation', { required: 'From location is required' })}
            error={errors.fromLocation?.message}
          />
          <Input
            label="To Location"
            required
            {...register('toLocation', { required: 'To location is required' })}
            error={errors.toLocation?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Vehicle & Parties" icon={Truck}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input
            label="Vehicle Number"
            required
            {...register('vehicleNumber', {
              required: 'Vehicle number is required',
              pattern: { value: /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i, message: 'Invalid format (e.g. GJ05AB1234)' },
            })}
            error={errors.vehicleNumber?.message}
            placeholder="GJ05AB1234"
          />
          <Input label="Vehicle Type" {...register('vehicleType')} />
          <Input
            label="Consignor ID"
            type="number"
            required
            {...register('consignorId', { required: 'Consignor is required', valueAsNumber: true })}
            error={errors.consignorId?.message}
          />
          <Input
            label="Consignee ID"
            type="number"
            required
            {...register('consigneeId', { required: 'Consignee is required', valueAsNumber: true })}
            error={errors.consigneeId?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Cargo Details" icon={Package}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="No. of Packages" type="number" {...register('noOfPackages', { valueAsNumber: true })} />
          <Input label="Actual Weight" type="number" step="0.001" {...register('actualWeight', { valueAsNumber: true })} />
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Weight Unit</label>
            <select
              {...register('weightUnit')}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              {WEIGHT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <Input label="Shipment Value" type="number" step="0.01" {...register('shipmentValue', { valueAsNumber: true })} />
          <Input label="Description" {...register('description')} containerClassName="col-span-2 md:col-span-4" />
        </div>
      </FormSection>

      <FormSection title="Freight & Charges" icon={IndianRupee}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            label="Freight Amount (₹)"
            type="number"
            step="0.01"
            required
            {...register('freightAmount', { required: 'Freight amount is required', min: { value: 0, message: 'Must be 0 or more' }, valueAsNumber: true })}
            error={errors.freightAmount?.message}
          />
          <Input label="Surcharge (₹)" type="number" step="0.01" {...register('surcharge', { valueAsNumber: true })} />
          <Input label="Other Charges (₹)" type="number" step="0.01" {...register('otherCharges', { valueAsNumber: true })} />
          <Input label="GR Charge (₹)" type="number" step="0.01" {...register('grCharge', { valueAsNumber: true })} />
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Payment Mode</label>
            <select
              {...register('paymentMode')}
              className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
            >
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="atRisk" {...register('atRisk')} className="rounded" />
            <label htmlFor="atRisk" className="text-sm text-gray-700 dark:text-white/80">At Owner&apos;s Risk</label>
          </div>
        </div>
      </FormSection>

      <FormSection title="E-way Bill" icon={FileText}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input label="E-way Bill No." {...register('ewayBillNo')} />
          <Input label="From Date" type="date" {...register('ewayBillFromDate')} />
          <Input label="Valid Upto" type="date" {...register('ewayBillValidUpto')} />
          <Input label="Policy No." {...register('policyNo')} />
        </div>
      </FormSection>

      <FormSection title="Notes">
        <textarea
          placeholder="Additional notes..."
          rows={3}
          {...register('notes')}
          className="w-full px-3 py-2 text-sm border-2 border-white/25 dark:border-white/10 rounded-lg bg-white/35 dark:bg-white/10 text-gray-800 dark:text-white/90 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/40"
        />
      </FormSection>

      <div className="flex gap-3 pt-6 border-t border-black/8 dark:border-white/10">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </motion.form>
  );
}
