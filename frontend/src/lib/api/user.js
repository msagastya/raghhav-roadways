import apiClient from './client';

export const userAPI = {
  // Get all users
  getAll: (params = {}) => apiClient.get('/users', { params }),

  // Approve/reject user
  updateApprovalStatus: (userId, status) =>
    apiClient.put(`/users/${userId}/approval`, { status }),

  // Update user role
  updateUserRole: (userId, roleId) =>
    apiClient.put(`/users/${userId}/role`, { roleId }),

  // Delete user
  delete: (userId) => apiClient.delete(`/users/${userId}`),
};

export const permissionAPI = {
  // Get all permissions
  getAll: () => apiClient.get('/permissions'),

  // Get all roles
  getRoles: () => apiClient.get('/permissions/roles'),

  // Get role with permissions
  getRoleWithPermissions: (roleId) => apiClient.get(`/permissions/roles/${roleId}`),

  // Update role permissions
  updateRolePermissions: (roleId, permissionIds) =>
    apiClient.put(`/permissions/roles/${roleId}/permissions`, { permissionIds }),
};
