'use client';

import { useState, useEffect } from 'react';
import { userAPI, permissionAPI } from '@/lib/api';
import useToast from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/utils';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [resetPasswordModal, setResetPasswordModal] = useState({ open: false, userId: null, username: '' });
  const [newPassword, setNewPassword] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      const params = {};
      if (filter === 'pending') params.approvalStatus = 'pending';
      else if (filter === 'approved') params.approvalStatus = 'approved';
      else if (filter === 'rejected') params.approvalStatus = 'rejected';

      const response = await userAPI.getAll(params);
      setUsers(response.data?.data?.users || []);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await permissionAPI.getRoles();
      setRoles(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await userAPI.updateApprovalStatus(userId, 'approved');
      showSuccess('User approved successfully');
      fetchUsers();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleReject = async (userId) => {
    try {
      await userAPI.updateApprovalStatus(userId, 'rejected');
      showSuccess('User rejected');
      fetchUsers();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      await userAPI.updateUserRole(userId, roleId);
      showSuccess('User role updated successfully');
      fetchUsers();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userAPI.delete(userId);
      showSuccess('User deleted successfully');
      fetchUsers();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const openResetPasswordModal = (userId, username) => {
    setResetPasswordModal({ open: true, userId, username });
    setNewPassword('');
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModal({ open: false, userId: null, username: '' });
    setNewPassword('');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    try {
      await userAPI.resetPassword(resetPasswordModal.userId, newPassword);
      showSuccess('Password reset successfully');
      closeResetPasswordModal();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage user access and permissions</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['all', 'pending', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${filter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.mobile || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      disabled={user.approvalStatus !== 'approved'}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.roleName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.approvalStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {user.approvalStatus === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {user.approvalStatus === 'approved' && (
                      <button
                        onClick={() => openResetPasswordModal(user.id, user.username)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Reset Password
                      </button>
                    )}
                    {user.username !== 'msagastya' && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal.open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for @{resetPasswordModal.username}
              </h3>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleResetPassword();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset Password
                </button>
                <button
                  onClick={closeResetPasswordModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
