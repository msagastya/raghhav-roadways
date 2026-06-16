const googleSheetsService = require('../services/googleSheets.service');

// Map of Prisma model names to Google Sheet worksheet names
const MODEL_TO_SHEET = {
  user: 'users',
  party: 'parties',
  vehicle: 'vehicles',
  consignment: 'consignments',
  invoice: 'invoices',
  payment: 'payments',
};

const createPrismaMock = () => {
  return new Proxy({}, {
    get(target, modelName) {
      const sheetName = MODEL_TO_SHEET[modelName.toLowerCase()];
      if (!sheetName) {
        return {};
      }

      return {
        $connect: async () => {
          // No-op for Google Sheets
          return true;
        },
        $disconnect: async () => {
          // No-op for Google Sheets
          return true;
        },
        findUnique: async (args) => {
          const key = Object.keys(args.where)[0];
          const val = args.where[key];
          const record = await googleSheetsService.findFirst(sheetName, { [key]: val });
          if (!record) return null;
          
          // Resolve basic relations if requested
          if (args.include) {
            if (args.include.consignor && record.consignorId) {
              record.consignor = await googleSheetsService.findFirst('parties', { id: record.consignorId }) || {};
            }
            if (args.include.consignee && record.consigneeId) {
              record.consignee = await googleSheetsService.findFirst('parties', { id: record.consigneeId }) || {};
            }
            if (args.include.vehicle && record.vehicleId) {
              record.vehicle = await googleSheetsService.findFirst('vehicles', { id: record.vehicleId }) || {};
            }
            if (args.include.party && record.partyId) {
              record.party = await googleSheetsService.findFirst('parties', { id: record.partyId }) || {};
            }
            if (args.include.role) {
              record.role = { roleName: 'Admin', rolePermissions: [] };
            }
          }
          return record;
        },
        findFirst: async (args) => {
          const where = args?.where || {};
          const filters = {};
          Object.entries(where).forEach(([k, v]) => {
            if (typeof v !== 'object') filters[k] = v;
          });
          const record = await googleSheetsService.findFirst(sheetName, filters);
          if (record && args.include && args.include.role) {
            record.role = { roleName: 'Admin', rolePermissions: [] };
          }
          return record;
        },
        findMany: async (args) => {
          const where = args?.where || {};
          const filters = {};
          Object.entries(where).forEach(([k, v]) => {
            if (typeof v !== 'object') filters[k] = v;
          });
          const records = await googleSheetsService.findMany(sheetName, filters);
          
          // Basic sorting or slicing (simulating prisma options)
          let results = records;
          if (args.orderBy) {
            // Simple sort by id descending by default if requested
            results = results.sort((a, b) => b.id - a.id);
          }
          return results;
        },
        create: async (args) => {
          return await googleSheetsService.insert(sheetName, args.data);
        },
        update: async (args) => {
          const key = Object.keys(args.where)[0];
          const val = args.where[key];
          await googleSheetsService.update(sheetName, key, val, args.data);
          return { success: true };
        },
        delete: async (args) => {
          const key = Object.keys(args.where)[0];
          const val = args.where[key];
          await googleSheetsService.deleteRecord(sheetName, key, val);
          return { success: true };
        },
        count: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          return records.length;
        }
      };
    }
  });
};

const prisma = createPrismaMock();

module.exports = prisma;
