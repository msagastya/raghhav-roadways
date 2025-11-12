import { FileText, Receipt, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../../lib/utils';

export default function StatsCards({ data }) {
  const stats = [
    {
      name: 'Total Consignments',
      value: data?.totalConsignments || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      name: 'Pending Invoices',
      value: data?.pendingInvoices || 0,
      icon: Receipt,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      name: 'Pending Deliveries',
      value: data?.pendingDeliveries || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
