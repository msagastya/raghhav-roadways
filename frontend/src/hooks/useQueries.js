'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  consignmentAPI,
  invoiceAPI,
  paymentAPI,
  partyAPI,
  vehicleAPI,
  reportAPI,
  mastersAPI,
  userAPI,
  permissionAPI,
  authAPI,
} from '../lib/api';

// ============================================
// CONSIGNMENT HOOKS
// ============================================

export function useConsignments(params) {
  return useQuery({
    queryKey: [...queryKeys.consignments, params],
    queryFn: () => consignmentAPI.getAll(params).then(res => res.data),
  });
}

export function useConsignment(id) {
  return useQuery({
    queryKey: queryKeys.consignment(id),
    queryFn: () => consignmentAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => consignmentAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => consignmentAPI.update(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
      queryClient.invalidateQueries({ queryKey: queryKeys.consignment(id) });
    },
  });
}

export function useUpdateConsignmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => consignmentAPI.updateStatus(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
      queryClient.invalidateQueries({ queryKey: queryKeys.consignment(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteConsignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => consignmentAPI.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

// ============================================
// INVOICE HOOKS
// ============================================

export function useInvoices(params) {
  return useQuery({
    queryKey: [...queryKeys.invoices, params],
    queryFn: () => invoiceAPI.getAll(params).then(res => res.data),
  });
}

export function useInvoice(id) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: () => invoiceAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => invoiceAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => invoiceAPI.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.consignments });
    },
  });
}

// ============================================
// PAYMENT HOOKS
// ============================================

export function usePayments(params) {
  return useQuery({
    queryKey: [...queryKeys.payments, params],
    queryFn: () => paymentAPI.getAll(params).then(res => res.data),
  });
}

export function usePayment(id) {
  return useQuery({
    queryKey: queryKeys.payment(id),
    queryFn: () => paymentAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => paymentAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAddPaymentTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, data }) => paymentAPI.addTransaction(paymentId, data).then(res => res.data),
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.payment(paymentId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
    },
  });
}

// ============================================
// PARTY HOOKS
// ============================================

export function useParties(params) {
  return useQuery({
    queryKey: [...queryKeys.parties, params],
    queryFn: () => partyAPI.getAll(params).then(res => res.data),
  });
}

export function useParty(id) {
  return useQuery({
    queryKey: queryKeys.party(id),
    queryFn: () => partyAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => partyAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties });
    },
  });
}

export function useUpdateParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => partyAPI.update(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties });
      queryClient.invalidateQueries({ queryKey: queryKeys.party(id) });
    },
  });
}

export function useDeleteParty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => partyAPI.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parties });
    },
  });
}

// ============================================
// VEHICLE HOOKS
// ============================================

export function useVehicles(params) {
  return useQuery({
    queryKey: [...queryKeys.vehicles, params],
    queryFn: () => vehicleAPI.getAll(params).then(res => res.data),
  });
}

export function useVehicle(id) {
  return useQuery({
    queryKey: queryKeys.vehicle(id),
    queryFn: () => vehicleAPI.getById(id).then(res => res.data),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => vehicleAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => vehicleAPI.update(id, data).then(res => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicle(id) });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => vehicleAPI.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });
}

// ============================================
// REPORT HOOKS
// ============================================

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => reportAPI.getDashboard().then(res => res.data),
    staleTime: 2 * 60 * 1000, // Dashboard data is fresh for 2 minutes
  });
}

export function useDailyReport(date) {
  return useQuery({
    queryKey: queryKeys.dailyReport(date),
    queryFn: () => reportAPI.getDaily(date).then(res => res.data),
    enabled: !!date,
  });
}

export function useMonthlyStatement(params) {
  return useQuery({
    queryKey: queryKeys.monthlyStatement(params),
    queryFn: () => reportAPI.getMonthlyStatement(params).then(res => res.data),
    enabled: !!params?.month && !!params?.year,
  });
}

// ============================================
// MASTERS HOOKS
// ============================================

export function useStates() {
  return useQuery({
    queryKey: queryKeys.states,
    queryFn: () => mastersAPI.getStates().then(res => res.data),
    staleTime: 60 * 60 * 1000, // States rarely change, cache for 1 hour
  });
}

export function useCities(stateId) {
  return useQuery({
    queryKey: queryKeys.cities(stateId),
    queryFn: () => mastersAPI.getCitiesByState(stateId).then(res => res.data),
    enabled: !!stateId,
    staleTime: 60 * 60 * 1000,
  });
}

export function useConsignorConsignees(params) {
  return useQuery({
    queryKey: [...queryKeys.consignorConsignees, params],
    queryFn: () => mastersAPI.getConsignorConsignees(params).then(res => res.data),
  });
}

export function useInvoiceParties(params) {
  return useQuery({
    queryKey: [...queryKeys.invoiceParties, params],
    queryFn: () => mastersAPI.getInvoiceParties(params).then(res => res.data),
  });
}

export function useVehicleOwners(params) {
  return useQuery({
    queryKey: [...queryKeys.vehicleOwners, params],
    queryFn: () => mastersAPI.getVehicleOwners(params).then(res => res.data),
  });
}

// ============================================
// USER & PERMISSION HOOKS
// ============================================

export function useUsers(params) {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => userAPI.getAll(params).then(res => res.data),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => permissionAPI.getRoles().then(res => res.data),
    staleTime: 30 * 60 * 1000, // Roles don't change often
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: () => permissionAPI.getAll().then(res => res.data),
    staleTime: 30 * 60 * 1000,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => authAPI.getProfile().then(res => res.data),
    staleTime: 10 * 60 * 1000,
  });
}
