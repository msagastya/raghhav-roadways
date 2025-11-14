'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';
import { consignmentAPI } from '../../../lib/api';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { TableSkeleton } from '../../../components/ui/skeleton';
import Button from '../../../components/ui/button';
import Input from '../../../components/ui/input';
import Badge from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

export default function ConsignmentsPage() {
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showError } = useToast();

  useEffect(() => {
    fetchConsignments();
  }, []);

  const fetchConsignments = async () => {
    try {
      const response = await consignmentAPI.getAll({ limit: 50 });
      setConsignments(response.data?.data?.records || []);
    } catch (error) {
      showError(getErrorMessage(error));
      setConsignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsignments = (consignments || []).filter((c) =>
    c?.grNumber?.toLowerCase().includes(search.toLowerCase()) ||
    c?.vehicleNumber?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card animate={false}>
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="h-10 max-w-md bg-gray-200 rounded animate-pulse"></div>
            </div>
            <TableSkeleton rows={10} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consignments</h1>
          <p className="text-gray-600 mt-1">Manage all consignment records</p>
        </div>
        <Link href="/consignments/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Consignment
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card animate={false}>
          <CardContent className="p-6">
            <motion.div
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Input
                placeholder="Search by GR Number or Vehicle Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-md"
              />
            </motion.div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GR Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vehicle No</TableHead>
                  <TableHead>From - To</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No consignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsignments.map((consignment, index) => (
                    <TableRow key={consignment.id} animate={true} index={index}>
                      <TableCell className="font-medium">{consignment.grNumber}</TableCell>
                      <TableCell>{formatDate(consignment.grDate)}</TableCell>
                      <TableCell>{consignment.vehicleNumber}</TableCell>
                      <TableCell>{consignment.fromLocation} - {consignment.toLocation}</TableCell>
                      <TableCell>{formatCurrency(consignment.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={consignment.status}>{consignment.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
