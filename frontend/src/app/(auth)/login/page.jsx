'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import Input from '../../../components/ui/input';
import Button from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { authAPI } from '../../../lib/api';
import useAuthStore from '../../../store/authStore';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data.data;

      setTokens(accessToken, refreshToken);
      setUser(user);

      showSuccess('Login successful!');
      router.push('/');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-600 p-3 rounded-full">
            <Truck className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Raghhav Roadways</h1>
        <p className="text-gray-600 mt-1">Transport Management System</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default credentials:</p>
          <p className="mt-1 font-mono text-xs">Username: admin1 | Password: admin123</p>
        </div>
      </CardContent>
    </Card>
  );
}
