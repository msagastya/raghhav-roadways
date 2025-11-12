'use client';

import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import Button from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage({ params }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
          <p className="text-gray-600 mt-1">ID: {params.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Invoice Information</h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Detail view under development</p>
        </CardContent>
      </Card>
    </div>
  );
}
