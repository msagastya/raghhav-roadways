'use client';

import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: How long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time: How long inactive data stays in cache (30 minutes)
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 1 time
      retry: 1,
      // Refetch on window focus
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect if data is still fresh
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Auth
  profile: ['auth', 'profile'],

  // Consignments
  consignments: ['consignments'],
  consignment: (id) => ['consignments', id],

  // Invoices
  invoices: ['invoices'],
  invoice: (id) => ['invoices', id],

  // Payments
  payments: ['payments'],
  payment: (id) => ['payments', id],

  // Parties
  parties: ['parties'],
  party: (id) => ['parties', id],

  // Vehicles
  vehicles: ['vehicles'],
  vehicle: (id) => ['vehicles', id],

  // Reports
  dashboard: ['reports', 'dashboard'],
  dailyReport: (date) => ['reports', 'daily', date],
  monthlyStatement: (params) => ['reports', 'monthly', params],
  vehicleSettlement: (params) => ['reports', 'vehicle-settlement', params],

  // Masters
  states: ['masters', 'states'],
  cities: (stateId) => ['masters', 'cities', stateId],
  consignorConsignees: ['masters', 'consignor-consignees'],
  invoiceParties: ['masters', 'invoice-parties'],
  vehicleOwners: ['masters', 'vehicle-owners'],

  // Users
  users: ['users'],
  roles: ['roles'],
  permissions: ['permissions'],
};
