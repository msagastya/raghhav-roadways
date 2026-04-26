'use client';

import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomInput = forwardRef(({ value, onClick, onChange, placeholder, label, error, onClear }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        ref={ref}
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        readOnly
        className={`
          w-full px-4 py-2.5 pr-20
          border rounded-lg
          transition-all duration-200
          cursor-pointer
          ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500/20'
          }
          focus:outline-none focus:ring-4
          disabled:bg-gray-100 disabled:cursor-not-allowed
        `}
      />
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
        {value && onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Calendar className="w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
    </div>
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-sm text-red-600"
      >
        {error}
      </motion.p>
    )}
  </div>
));

CustomInput.displayName = 'CustomInput';

const CustomDatePicker = ({
  selected,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  minDate,
  maxDate,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  dateFormat = 'dd/MM/yyyy',
  className = '',
  disabled = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className={className}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        customInput={
          <CustomInput
            label={label}
            placeholder={placeholder}
            error={error}
            onClear={selected ? handleClear : null}
          />
        }
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat}
        disabled={disabled}
        onCalendarOpen={() => setIsOpen(true)}
        onCalendarClose={() => setIsOpen(false)}
        calendarClassName="shadow-2xl border-2 border-primary-100"
        popperClassName="z-50"
        {...props}
      />
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border-radius: 0.75rem;
          border-color: #e5e7eb;
        }
        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding-top: 0.75rem;
        }
        .react-datepicker__current-month {
          font-weight: 600;
          color: #111827;
          font-size: 0.95rem;
        }
        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.8rem;
        }
        .react-datepicker__day {
          border-radius: 0.5rem;
          transition: all 0.15s;
          color: #374151;
        }
        .react-datepicker__day:hover {
          background-color: #22c55e;
          color: white;
        }
        .react-datepicker__day--selected {
          background-color: #16a34a !important;
          color: white !important;
          font-weight: 600;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #dcfce7;
          color: #166534;
        }
        .react-datepicker__day--today {
          font-weight: 600;
          color: #16a34a;
          background-color: #f0fdf4;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          cursor: not-allowed;
        }
        .react-datepicker__day--disabled:hover {
          background-color: transparent !important;
        }
        .react-datepicker__time-container {
          border-left: 1px solid #e5e7eb;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #16a34a !important;
          color: white !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #6b7280;
        }
        .react-datepicker__navigation:hover *::before {
          border-color: #111827;
        }
      `}</style>
    </div>
  );
};

// Date Range Picker Component
export const DateRangePicker = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <CustomDatePicker
        selected={startDate}
        onChange={onStartChange}
        label={startLabel}
        maxDate={endDate || new Date()}
        placeholder="Select start date"
      />
      <CustomDatePicker
        selected={endDate}
        onChange={onEndChange}
        label={endLabel}
        minDate={startDate}
        maxDate={new Date()}
        placeholder="Select end date"
      />
    </div>
  );
};

export default CustomDatePicker;
