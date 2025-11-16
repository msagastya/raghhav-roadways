'use client';

import { useState, useEffect } from 'react';
import { permissionAPI } from '@/lib/api';
import useToast from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/utils';
import { Shield, Save, X } from 'lucide-react';
import Button from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        permissionAPI.getRoles(),
        permissionAPI.getAll(),
      ]);

      const rolesData = rolesResponse.data?.data || [];
      const permissionsData = permissionsResponse.data?.data || [];

      setRoles(rolesData);
      setPermissions(permissionsData);

      // Auto-select first role if available
      if (rolesData.length > 0) {
        selectRole(rolesData[0]);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const selectRole = async (role) => {
    try {
      setSelectedRole(role);
      const response = await permissionAPI.getRoleWithPermissions(role.id);
      const roleData = response.data?.data;

      // Extract permission IDs from the role
      const permissionIds = roleData?.rolePermissions?.map(rp => rp.permission.id) || [];
      setSelectedPermissions(permissionIds);
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      await permissionAPI.updateRolePermissions(selectedRole.id, selectedPermissions);
      showSuccess('Role permissions updated successfully');

      // Refresh roles to show updated data
      fetchRolesAndPermissions();
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = (module) => {
    const modulePermissions = permissions.filter(p => p.module === module);
    const modulePermissionIds = modulePermissions.map(p => p.id);

    const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all module permissions
      setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
    } else {
      // Select all module permissions
      setSelectedPermissions(prev => {
        const newIds = modulePermissionIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
        <p className="text-gray-600 mt-1">Configure permissions for each role</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => selectRole(role)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedRole?.id === role.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">{role.roleName}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Grid */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Permissions for {selectedRole.roleName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedPermissions.length} of {permissions.length} permissions selected
                    </p>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => {
                    const allSelected = modulePermissions.every(p => selectedPermissions.includes(p.id));
                    const someSelected = modulePermissions.some(p => selectedPermissions.includes(p.id));

                    return (
                      <div key={module} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 capitalize">{module}</h4>
                          <button
                            onClick={() => handleSelectAll(module)}
                            className={`text-sm font-medium ${
                              allSelected
                                ? 'text-red-600 hover:text-red-800'
                                : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            {allSelected ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {modulePermissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            return (
                              <label
                                key={permission.id}
                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(permission.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 capitalize">
                                    {permission.action}
                                  </div>
                                  {permission.description && (
                                    <div className="text-xs text-gray-500 truncate">
                                      {permission.description}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a role to manage its permissions</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
