const googleSheetsService = require('../services/googleSheets.service');
const logger = require('../utils/logger');

// Map of Prisma model names to Google Sheet worksheet names
const MODEL_TO_SHEET = {
  user: 'users',
  role: 'roles',
  permission: 'permissions',
  rolepermission: 'role_permissions',
  party: 'parties',
  vehicle: 'vehicles',
  consignment: 'consignments',
  invoice: 'invoices',
  invoiceitem: 'invoice_items',
  payment: 'payments',
  paymenttransaction: 'payment_transactions',
  paymentamendment: 'payment_amendments',
  auditlog: 'audit_logs',
  statushistory: 'status_history',
  dailysummary: 'daily_summary',
  state: 'states',
  city: 'cities',
  consignorconsignee: 'consignor_consignees',
  invoiceparty: 'invoice_parties',
  vehicleownerbroker: 'vehicle_owner_brokers',
  ownervehicle: 'owner_vehicles',
  agent: 'agents',
  agentvehicle: 'agent_vehicles',
  agentavailability: 'agent_availability'
};

const SPECIAL_CAMEL_TO_SNAKE = {
  createdById: 'created_by',
  updatedById: 'updated_by',
};

const SPECIAL_SNAKE_TO_CAMEL = {
  created_by: 'createdById',
  updated_by: 'updatedById',
};

function toSnake(key) {
  if (SPECIAL_CAMEL_TO_SNAKE[key]) return SPECIAL_CAMEL_TO_SNAKE[key];
  return key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamel(key) {
  if (SPECIAL_SNAKE_TO_CAMEL[key]) return SPECIAL_SNAKE_TO_CAMEL[key];
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function mapKeys(obj, fn) {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(item => mapKeys(item, fn));
  
  return Object.keys(obj).reduce((acc, key) => {
    const mappedKey = fn(key);
    acc[mappedKey] = mapKeys(obj[key], fn);
    return acc;
  }, {});
}

function matchRecord(record, where) {
  if (!where || Object.keys(where).length === 0) return true;
  
  return Object.entries(where).every(([key, val]) => {
    if (key === 'OR') {
      if (!Array.isArray(val)) return true;
      return val.some(subWhere => matchRecord(record, subWhere));
    }
    if (key === 'AND') {
      if (!Array.isArray(val)) return true;
      return val.every(subWhere => matchRecord(record, subWhere));
    }
    if (key === 'NOT') {
      if (!Array.isArray(val) && typeof val === 'object') {
        return !matchRecord(record, val);
      }
      if (Array.isArray(val)) {
        return val.every(subWhere => !matchRecord(record, subWhere));
      }
      return true;
    }
    
    const snakeKey = toSnake(key);
    const recordVal = record[snakeKey];
    
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      return Object.entries(val).every(([op, opVal]) => {
        if (op === 'equals') return String(recordVal) === String(opVal);
        if (op === 'in') {
          return Array.isArray(opVal) && opVal.map(String).includes(String(recordVal));
        }
        if (op === 'not') return String(recordVal) !== String(opVal);
        if (op === 'notIn') {
          return Array.isArray(opVal) && !opVal.map(String).includes(String(recordVal));
        }
        if (op === 'lt') return Number(recordVal) < Number(opVal);
        if (op === 'lte') return Number(recordVal) <= Number(opVal);
        if (op === 'gt') return Number(recordVal) > Number(opVal);
        if (op === 'gte') return Number(recordVal) >= Number(opVal);
        if (op === 'contains') {
          return String(recordVal).toLowerCase().includes(String(opVal).toLowerCase());
        }
        if (op === 'startsWith') {
          return String(recordVal).toLowerCase().startsWith(String(opVal).toLowerCase());
        }
        if (op === 'endsWith') {
          return String(recordVal).toLowerCase().endsWith(String(opVal).toLowerCase());
        }
        return true;
      });
    }
    
    if (val === undefined || val === null) return true;
    
    if (typeof val === 'boolean') {
      return String(recordVal).toUpperCase() === String(val).toUpperCase();
    }
    
    return String(recordVal) === String(val);
  });
}

async function resolveRelations(sheetName, record, include) {
  if (!record || !include) return record;
  const result = { ...record };
  
  if (include.consignor && result.consignorId) {
    const raw = await googleSheetsService.findFirst('parties', { id: result.consignorId });
    result.consignor = raw ? mapKeys(raw, toCamel) : null;
  }
  if (include.consignee && result.consigneeId) {
    const raw = await googleSheetsService.findFirst('parties', { id: result.consigneeId });
    result.consignee = raw ? mapKeys(raw, toCamel) : null;
  }
  if (include.vehicle && result.vehicleId) {
    const raw = await googleSheetsService.findFirst('vehicles', { id: result.vehicleId });
    result.vehicle = raw ? mapKeys(raw, toCamel) : null;
  }
  if (include.party && result.partyId) {
    const raw = await googleSheetsService.findFirst('parties', { id: result.partyId });
    result.party = raw ? mapKeys(raw, toCamel) : null;
  }
  if (include.role && result.roleId) {
    const raw = await googleSheetsService.findFirst('roles', { id: result.roleId });
    if (raw) {
      result.role = mapKeys(raw, toCamel);
      const rolePermissions = await googleSheetsService.findMany('role_permissions', { role_id: result.roleId });
      result.role.rolePermissions = await Promise.all(rolePermissions.map(async (rp) => {
        const p = await googleSheetsService.findFirst('permissions', { id: rp.permission_id });
        return {
          permission: p ? mapKeys(p, toCamel) : null
        };
      }));
    } else {
      result.role = null;
    }
  }
  if (include.items && result.id) {
    const rawItems = await googleSheetsService.findMany('invoice_items', { invoice_id: result.id });
    result.items = rawItems.map(item => mapKeys(item, toCamel));
  }
  if (include.transactions && result.id) {
    const rawTx = await googleSheetsService.findMany('payment_transactions', { payment_id: result.id });
    result.transactions = rawTx.map(tx => mapKeys(tx, toCamel));
  }
  if (include.consignments && result.id) {
    const rawCons = await googleSheetsService.findMany('consignments', { invoice_id: result.id });
    result.consignments = rawCons.map(c => mapKeys(c, toCamel));
  }
  if (include.cities && result.id) {
    const rawCities = await googleSheetsService.findMany('cities', { state_id: result.id });
    result.cities = rawCities.map(c => mapKeys(c, toCamel));
  }
  if (include.state && result.stateId) {
    const rawState = await googleSheetsService.findFirst('states', { id: result.stateId });
    result.state = rawState ? mapKeys(rawState, toCamel) : null;
  }
  if (include.city && result.cityId) {
    const raw = await googleSheetsService.findFirst('cities', { id: result.cityId });
    result.city = raw ? mapKeys(raw, toCamel) : null;
  }
  if (include.vehicles) {
    if (sheetName === 'vehicle_owner_brokers' && result.id) {
      const raw = await googleSheetsService.findMany('owner_vehicles', { owner_id: result.id });
      result.vehicles = raw.map(v => mapKeys(v, toCamel));
    } else if (sheetName === 'agents' && result.id) {
      const raw = await googleSheetsService.findMany('agent_vehicles', { agent_id: result.id });
      result.vehicles = raw.map(v => mapKeys(v, toCamel));
    }
  }
  if (include.availability) {
    if (sheetName === 'agents' && result.id) {
      const raw = await googleSheetsService.findMany('agent_availability', { agent_id: result.id });
      result.availability = raw.map(a => mapKeys(a, toCamel));
    } else if (sheetName === 'agent_vehicles' && result.id) {
      const raw = await googleSheetsService.findMany('agent_availability', { vehicle_id: result.id });
      result.availability = raw.map(a => mapKeys(a, toCamel));
    }
  }
  
  return result;
}

const createPrismaMock = () => {
  const prismaMock = new Proxy({}, {
    get(target, prop) {
      if (prop === '$connect') {
        return async () => {
          logger.info('🔌 Mock Prisma Database (Google Sheets Proxy) connected');
          return true;
        };
      }
      if (prop === '$disconnect') {
        return async () => {
          logger.info('🔌 Mock Prisma Database (Google Sheets Proxy) disconnected');
          return true;
        };
      }
      if (prop === '$transaction') {
        return async (callback) => {
          if (typeof callback === 'function') {
            return await callback(prismaMock);
          }
          if (Array.isArray(callback)) {
            return await Promise.all(callback);
          }
          return callback;
        };
      }
      if (prop === '$queryRaw') {
        return async (queryParts, ...values) => {
          const queryStr = typeof queryParts === 'string' ? queryParts : queryParts.join('?');
          
          if (queryStr.includes('consignments') && queryStr.includes('GROUP BY DATE(gr_date)')) {
            const consignments = await googleSheetsService.readAll('consignments');
            const thirtyDaysAgo = values[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const trendMap = {};
            consignments.forEach(c => {
              if (c.is_deleted === 'true' || c.is_deleted === true) return;
              const grDate = new Date(c.gr_date);
              if (grDate >= thirtyDaysAgo) {
                const dateStr = grDate.toISOString().split('T')[0];
                trendMap[dateStr] = (trendMap[dateStr] || 0) + Number(c.total_amount || 0);
              }
            });
            return Object.entries(trendMap).map(([date, amount]) => ({ date, amount })).sort((a, b) => a.date.localeCompare(b.date));
          }
          
          if (queryStr.includes('consignments') && queryStr.includes('from_location') && queryStr.includes('to_location')) {
            const consignments = await googleSheetsService.readAll('consignments');
            const thirtyDaysAgo = values[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const routeMap = {};
            consignments.forEach(c => {
              if (c.is_deleted === 'true' || c.is_deleted === true) return;
              const grDate = new Date(c.gr_date);
              if (grDate >= thirtyDaysAgo) {
                const route = `${c.from_location} → ${c.to_location}`;
                if (!routeMap[route]) {
                  routeMap[route] = { route, count: 0, amount: 0 };
                }
                routeMap[route].count += 1;
                routeMap[route].amount += Number(c.total_amount || 0);
              }
            });
            return Object.values(routeMap).sort((a, b) => b.count - a.count).slice(0, 5);
          }
          
          if (queryStr.includes('consignments') && queryStr.includes("status = 'Delivered'")) {
            const consignments = await googleSheetsService.readAll('consignments');
            const thirtyDaysAgo = values[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            let total_delivered = 0;
            let on_time_count = 0;
            consignments.forEach(c => {
              if (c.is_deleted === 'true' || c.is_deleted === true) return;
              if (c.status !== 'Delivered') return;
              const grDate = new Date(c.gr_date);
              if (grDate >= thirtyDaysAgo) {
                total_delivered++;
                if (c.delivered_at) {
                  on_time_count++;
                }
              }
            });
            return [{ total_delivered, on_time_count }];
          }
          
          if (queryStr.includes('consignments') && queryStr.includes('AVG(EXTRACT(EPOCH FROM')) {
            const consignments = await googleSheetsService.readAll('consignments');
            const thirtyDaysAgo = values[0] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            let totalDays = 0;
            let count = 0;
            consignments.forEach(c => {
              if (c.is_deleted === 'true' || c.is_deleted === true) return;
              if (c.status !== 'Delivered') return;
              if (!c.delivered_at || !c.gr_date) return;
              const grDate = new Date(c.gr_date);
              if (grDate >= thirtyDaysAgo) {
                const diffTime = Math.abs(new Date(c.delivered_at) - grDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                totalDays += diffDays;
                count++;
              }
            });
            return [{ avg_days: count > 0 ? totalDays / count : 0 }];
          }
          
          return [];
        };
      }

      const sheetName = MODEL_TO_SHEET[prop.toLowerCase()];
      if (!sheetName) return undefined;

      return {
        findUnique: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          if (matched.length === 0) return null;
          
          let result = mapKeys(matched[0], toCamel);
          result = await resolveRelations(sheetName, result, args.include);
          return result;
        },
        findFirst: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          if (matched.length === 0) return null;
          
          let result = mapKeys(matched[0], toCamel);
          result = await resolveRelations(sheetName, result, args.include);
          return result;
        },
        findMany: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          let matched = records.filter(r => matchRecord(r, args?.where));
          
          let results = matched.map(r => mapKeys(r, toCamel));
          
          if (args?.include) {
            results = await Promise.all(results.map(r => resolveRelations(sheetName, r, args.include)));
          }
          
          if (args?.orderBy) {
            const orderBy = args.orderBy;
            const sortKey = Object.keys(orderBy)[0];
            const sortDir = orderBy[sortKey];
            results = results.sort((a, b) => {
              const valA = a[sortKey];
              const valB = b[sortKey];
              if (valA === valB) return 0;
              if (sortDir === 'desc') {
                return valA > valB ? -1 : 1;
              } else {
                return valA > valB ? 1 : -1;
              }
            });
          }
          
          if (args?.skip !== undefined) {
            results = results.slice(args.skip);
          }
          if (args?.take !== undefined) {
            results = results.slice(0, args.take);
          }
          
          return results;
        },
        create: async (args) => {
          const dataSnake = mapKeys(args.data, toSnake);
          
          // Generate timestamps
          if (!dataSnake.created_at) dataSnake.created_at = new Date().toISOString();
          if (!dataSnake.updated_at) dataSnake.updated_at = new Date().toISOString();
          
          const inserted = await googleSheetsService.insert(sheetName, dataSnake);
          let result = mapKeys(inserted, toCamel);
          result = await resolveRelations(sheetName, result, args.include);
          return result;
        },
        update: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          if (matched.length === 0) {
            throw new Error(`Record not found to update in ${sheetName}`);
          }
          
          const target = matched[0];
          const dataSnake = mapKeys(args.data, toSnake);
          dataSnake.updated_at = new Date().toISOString();
          
          await googleSheetsService.update(sheetName, 'id', target.id, dataSnake);
          
          const updatedRecord = { ...target, ...dataSnake };
          let result = mapKeys(updatedRecord, toCamel);
          result = await resolveRelations(sheetName, result, args.include);
          return result;
        },
        delete: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          if (matched.length === 0) {
            throw new Error(`Record not found to delete in ${sheetName}`);
          }
          
          const target = matched[0];
          await googleSheetsService.deleteRecord(sheetName, 'id', target.id);
          return mapKeys(target, toCamel);
        },
        count: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args?.where));
          return matched.length;
        },
        updateMany: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          
          const dataSnake = mapKeys(args.data, toSnake);
          dataSnake.updated_at = new Date().toISOString();
          
          const updatePromises = matched.map(r => {
            return googleSheetsService.update(sheetName, 'id', r.id, dataSnake);
          });
          await Promise.all(updatePromises);
          return { count: matched.length };
        },
        deleteMany: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const matched = records.filter(r => matchRecord(r, args.where));
          
          const deletePromises = matched.map(r => {
            return googleSheetsService.deleteRecord(sheetName, 'id', r.id);
          });
          await Promise.all(deletePromises);
          return { count: matched.length };
        },
        aggregate: async (args) => {
          const records = await googleSheetsService.readAll(sheetName);
          const result = {};
          if (args._sum) {
            result._sum = {};
            Object.keys(args._sum).forEach(field => {
              const snakeField = toSnake(field);
              const sum = records.reduce((acc, r) => acc + Number(r[snakeField] || 0), 0);
              result._sum[field] = sum;
            });
          }
          if (args._avg) {
            result._avg = {};
            Object.keys(args._avg).forEach(field => {
              const snakeField = toSnake(field);
              const nonZero = records.filter(r => r[snakeField] !== undefined && r[snakeField] !== null);
              const sum = nonZero.reduce((acc, r) => acc + Number(r[snakeField] || 0), 0);
              result._avg[field] = nonZero.length > 0 ? sum / nonZero.length : 0;
            });
          }
          return result;
        }
      };
    }
  });
  return prismaMock;
};

const prisma = createPrismaMock();

module.exports = prisma;
