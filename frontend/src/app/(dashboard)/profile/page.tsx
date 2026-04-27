'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth?: string;
  gender?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  profilePicture?: string;
  verified: boolean;
  verificationStatus: string;
  createdAt: string;
  totalRides: number;
  averageRating: number;
  stats: {
    totalDistance: number;
    totalSpent: number;
    favoriteDriver?: string;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, updateProfile, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.publicApi.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data.profile);
      setFormData({
        name: response.data.profile.name,
        phone: response.data.profile.phone,
        address: response.data.profile.address,
        city: response.data.profile.city,
        state: response.data.profile.state,
        zipCode: response.data.profile.zipCode,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await apiClient.publicApi.put(
        '/users/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await updateProfile?.(formData);
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout?.();
      router.push('/auth/login');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p>Profile not found</p>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={profile.verified ? 'default' : 'outline'}>
                    {profile.verified ? '✓ Verified' : 'Unverified'}
                  </Badge>
                  {profile.averageRating > 0 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      ★ {profile.averageRating.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </div>
              {!editing && (
                <Button onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <>
                <div>
                  <label className="text-sm text-gray-600">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <Input value={profile.email} disabled className="mt-1 bg-gray-100" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <>
                <div>
                  <label className="text-sm text-gray-600">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">City</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Zip Code</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{profile.address}</p>
                    <p className="text-sm text-gray-600">
                      {profile.city}, {profile.state} {profile.zipCode}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ride Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ride Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{profile.totalRides}</p>
                <p className="text-sm text-gray-600">Total Rides</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {profile.stats.totalDistance.toFixed(0)} km
                </p>
                <p className="text-sm text-gray-600">Total Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ₹{profile.stats.totalSpent.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {editing ? (
            <>
              <Button className="flex-1" onClick={handleUpdateProfile}>
                Save Changes
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push('/security')}
              >
                Security Settings
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
