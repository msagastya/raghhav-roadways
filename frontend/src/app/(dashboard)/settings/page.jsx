'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import { Users, Shield, Key, Building2, ChevronRight } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const hasAdminAccess = user?.permissions?.includes('settings.users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Admin Settings - Only visible to admins */}
      {hasAdminAccess && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/settings/users">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">User Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card className="opacity-50 cursor-not-allowed">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Role Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Configure roles and permissions (Coming Soon)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Personal Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Personal Settings</h2>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
            </div>
          </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
            </div>
          </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Company Name:</span>
              <span className="text-gray-600 ml-2">RAGHHAV ROADWAYS</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">GSTIN:</span>
              <span className="text-gray-600 ml-2">24BQCPP3322B1ZH</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="text-gray-600 ml-2">+91 9727-466-477</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="text-gray-600 ml-2">raghhavroadways@gmail.com</span>
            </div>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
