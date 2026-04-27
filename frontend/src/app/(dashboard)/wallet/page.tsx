'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface Wallet {
  id: string;
  balance: number;
  currency: string;
  lastUpdated: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  status: string;
  timestamp: string;
  rideId?: string;
  paymentMethod?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  lastFourDigits: string;
  isDefault: boolean;
  expiryDate: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchWalletData();
  }, [user]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionRes, paymentRes] = await Promise.all([
        apiClient.publicApi.get('/wallet', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.publicApi.get('/wallet/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiClient.publicApi.get('/wallet/payment-methods', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setWallet(walletRes.data.wallet);
      setTransactions(transactionRes.data.transactions || []);
      setPaymentMethods(paymentRes.data.paymentMethods || []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async () => {
    if (!addMoneyAmount || parseFloat(addMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const response = await apiClient.publicApi.post(
        '/wallet/add-funds',
        { amount: parseFloat(addMoneyAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to payment gateway if payment URL provided
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        setAddMoneyAmount('');
        setShowAddMoney(false);
        fetchWalletData();
      }
    } catch (error) {
      console.error('Failed to add money:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        </div>

        {/* Wallet Balance Card */}
        {wallet && (
          <Card className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-blue-100 mb-2">Available Balance</p>
                  <p className="text-4xl font-bold">₹{wallet.balance.toFixed(2)}</p>
                </div>
                <CreditCard className="w-12 h-12 opacity-50" />
              </div>
              <p className="text-sm text-blue-100 mb-4">
                Last updated: {new Date(wallet.lastUpdated).toLocaleDateString()}
              </p>
              <Button
                onClick={() => setShowAddMoney(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Money to Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button variant="outline">Transaction History</Button>
          <Button variant="outline" onClick={() => setShowPaymentForm(!showPaymentForm)}>
            Payment Methods
          </Button>
        </div>

        {/* Transaction History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'debit' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {transaction.type === 'debit' ? (
                          <ArrowUp className={`w-4 h-4 text-red-600`} />
                        ) : (
                          <ArrowDown className={`w-4 h-4 text-green-600`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'debit' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No payment methods added</p>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-gray-600">
                        {method.type} ending in {method.lastFourDigits}
                      </p>
                      <p className="text-xs text-gray-500">Expires: {method.expiryDate}</p>
                    </div>
                    {method.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="w-full mt-4">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Add Money Modal */}
        {showAddMoney && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add Money to Wallet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Amount (₹)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                    className="mt-1"
                    min="1"
                    max="100000"
                  />
                  <p className="text-xs text-gray-500 mt-2">Minimum: ₹10 | Maximum: ₹1,00,000</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700">
                    Amount to be added: <span className="font-bold text-blue-600">
                      ₹{parseFloat(addMoneyAmount || '0').toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleAddMoney}
                    disabled={!addMoneyAmount || parseFloat(addMoneyAmount) <= 0}
                  >
                    Add Money
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddMoney(false);
                      setAddMoneyAmount('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
