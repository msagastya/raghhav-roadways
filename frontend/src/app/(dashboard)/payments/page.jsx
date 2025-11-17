'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { paymentAPI } from '../../../lib/api';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';
import { formatDate, formatCurrency, getErrorMessage } from '../../../lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getAll({ limit: 50 });
      setPayments(response.data?.data?.payments || []);
    } catch (error) {
      showError(getErrorMessage(error));
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Are you sure you want to delete payment ${payment.paymentNumber}?`)) {
      return;
    }

    try {
      await paymentAPI.delete(payment.id);
      showSuccess('Payment deleted successfully');
      fetchPayments();
    } catch (error) {
      showError(getErrorMessage(error));
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Manage all payment records</p>
        </div>
        <Link href="/payments/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => {
                  const getStatusBadge = (status) => {
                    const styles = {
                      Pending: 'bg-yellow-100 text-yellow-800',
                      Partial: 'bg-blue-100 text-blue-800',
                      Completed: 'bg-green-100 text-green-800',
                    };
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                        {status}
                      </span>
                    );
                  };

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                      <TableCell>{payment.partyName || '-'}</TableCell>
                      <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                      <TableCell>{formatCurrency(payment.totalAmount)}</TableCell>
                      <TableCell className="text-green-600 font-medium">{formatCurrency(payment.paidAmount)}</TableCell>
                      <TableCell className="text-orange-600 font-medium">{formatCurrency(payment.balanceAmount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(payment)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View payment details"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(payment)}
                            className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete payment"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
