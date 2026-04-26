module.exports = {
  // Consignment Status
  CONSIGNMENT_STATUS: {
    BOOKED: 'Booked',
    LOADED: 'Loaded',
    IN_TRANSIT: 'In Transit',
    DELIVERED: 'Delivered',
    SETTLED: 'Settled',
    CANCELLED: 'Cancelled',
  },

  // Valid status transitions
  STATUS_TRANSITIONS: {
    'Booked': ['Loaded', 'Cancelled'],
    'Loaded': ['In Transit', 'Cancelled'],
    'In Transit': ['Delivered', 'Cancelled'],
    'Delivered': ['Settled'],
    'Settled': [],
    'Cancelled': [],
  },

  // Invoice Payment Status
  PAYMENT_STATUS: {
    PENDING: 'Pending',
    PARTIAL: 'Partial',
    PAID: 'Paid',
    OVERDUE: 'Overdue',
  },

  // Payment Mode
  PAYMENT_MODE: {
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
    CHEQUE: 'Cheque',
    UPI: 'UPI',
  },

  // Party Types
  PARTY_TYPE: {
    CONSIGNOR: 'consignor',
    CONSIGNEE: 'consignee',
    BOTH: 'both',
  },

  // Vehicle Owner Type
  OWNER_TYPE: {
    OWNED: 'owned',
    BROKER: 'broker',
  },

  // Amendment Types
  AMENDMENT_TYPE: {
    ADDITIONAL_CHARGE: 'Additional Charge',
    DISCOUNT: 'Discount',
    CORRECTION: 'Correction',
  },

  // Risk Types
  RISK_TYPE: {
    OWNER_RISK: "Owner's Risk",
    CARRIER_RISK: "Carrier's Risk",
    COMPANY_RISK: "Company Risk",
  },

  // Weight Units
  WEIGHT_UNIT: {
    MT: 'MT',
    KG: 'KG',
    TONS: 'Tons',
  },

  // Rate Types
  RATE_TYPE: {
    FIXED: 'Fixed',
    PER_MT: 'Per MT',
    PER_KM: 'Per KM',
    CUSTOM: 'Custom',
  },

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png'],
    PDF: ['application/pdf'],
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Company Details
  COMPANY: {
    NAME: process.env.COMPANY_NAME || 'RAGHHAV ROADWAYS',
    GSTIN: process.env.COMPANY_GSTIN || '24BQCPP3322B1ZH',
    ADDRESS: process.env.COMPANY_ADDRESS || 'PLOT NO. D-407, BLD. NO. D-1, 4TH FLOOR, UMANG RESIDENCY NR. SACHIN RAILWAY STATION, SACHIN, SURAT - 394230',
    PHONE: process.env.COMPANY_PHONE || '+91 9727-466-477',
    EMAIL: process.env.COMPANY_EMAIL || 'raghhavroadways@gmail.com',
    BANK_NAME: process.env.COMPANY_BANK_NAME || 'AXIS BANK',
    BANK_ACCOUNT: process.env.COMPANY_BANK_ACCOUNT || '924020013795444',
    BANK_IFSC: process.env.COMPANY_BANK_IFSC || 'UTIB0005605',
    BANK_BRANCH: process.env.COMPANY_BANK_BRANCH || 'STATION ROAD SACHIN',
  },

  // Audit Actions
  AUDIT_ACTION: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    STATUS_CHANGE: 'STATUS_CHANGE',
  },
};
