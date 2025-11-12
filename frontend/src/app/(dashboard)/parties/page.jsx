'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { partyAPI } from '../../../lib/api';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import Button from '../../../components/ui/button';
import Badge from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll({ limit: 100 });
      setParties(response.data.data.records);
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
          <h1 className="text-2xl font-bold text-gray-900">Parties</h1>
          <p className="text-gray-600 mt-1">Manage consignors and consignees</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Party
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Party Code</TableHead>
                <TableHead>Party Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No parties found
                  </TableCell>
                </TableRow>
              ) : (
                parties.map((party) => (
                  <TableRow key={party.id}>
                    <TableCell className="font-medium">{party.partyCode}</TableCell>
                    <TableCell>{party.partyName}</TableCell>
                    <TableCell>{party.partyType}</TableCell>
                    <TableCell>{party.gstin || '-'}</TableCell>
                    <TableCell>{party.mobile || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={party.isActive ? 'success' : 'danger'}>
                        {party.isActive ? 'Active' : 'Inactive'}
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
