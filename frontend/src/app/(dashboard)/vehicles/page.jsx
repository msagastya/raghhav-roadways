'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { vehicleAPI } from '../../../lib/api';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import Button from '../../../components/ui/button';
import Badge from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll({ limit: 100 });
      setVehicles(response.data.data.records);
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage all vehicle records</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Owner Type</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.vehicleNo}</TableCell>
                    <TableCell>{vehicle.vehicleType || '-'}</TableCell>
                    <TableCell>{vehicle.ownerType}</TableCell>
                    <TableCell>{vehicle.ownerName || '-'}</TableCell>
                    <TableCell>{vehicle.driverName || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.isActive ? 'success' : 'danger'}>
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
