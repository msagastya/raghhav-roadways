'use client';

import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
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
  );
}
