'use client';

import { useEffect, useState } from 'react';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import Input from '../../../components/ui/input';
import Select from '../../../components/ui/select';
import { partyAPI, reportAPI } from '../../../lib/api';
import { getErrorMessage } from '../../../lib/utils';
import useToast from '../../../hooks/useToast';

const today = new Date().toISOString().slice(0, 10);
const month = new Date().toISOString().slice(0, 7);

function SummaryBlock({ data }) {
  if (!data) return null;

  return (
    <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap font-sans">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function ReportsPage() {
  const { showError, showSuccess } = useToast();
  const [parties, setParties] = useState([]);
  const [dailyDate, setDailyDate] = useState(today);
  const [statementMonth, setStatementMonth] = useState(month);
  const [statementPartyId, setStatementPartyId] = useState('');
  const [settlementOwnerId, setSettlementOwnerId] = useState('');
  const [settlementFrom, setSettlementFrom] = useState(today);
  const [settlementTo, setSettlementTo] = useState(today);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState('');

  useEffect(() => {
    const loadParties = async () => {
      try {
        const response = await partyAPI.getAll({ limit: 1000 });
        const partyList = response.data?.data?.parties || [];
        setParties(partyList);
        setStatementPartyId((current) => current || partyList[0]?.id || '');
        setSettlementOwnerId((current) => current || partyList[0]?.id || '');
      } catch (error) {
        showError(getErrorMessage(error));
      }
    };

    loadParties();
  }, [showError]);

  const runReport = async (key, request) => {
    setLoading(key);
    try {
      const response = await request();
      setResults((current) => ({ ...current, [key]: response.data.data }));
      showSuccess('Report generated');
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading('');
    }
  };

  const partyOptions = parties.map((party) => ({ value: party.id, label: party.partyName }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-gray-600">Generate daily, monthly, and vehicle settlement reports.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Report</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Date" type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" disabled={loading === 'daily'} onClick={() => runReport('daily', () => reportAPI.getDaily(dailyDate))}>
                {loading === 'daily' ? 'Generating...' : 'Generate Report'}
              </Button>
              <SummaryBlock data={results.daily?.summary} />
            </div>
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Monthly Statement</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select label="Party" options={partyOptions} value={statementPartyId} onChange={(e) => setStatementPartyId(e.target.value)} />
              <Input label="Month" type="month" value={statementMonth} onChange={(e) => setStatementMonth(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" disabled={loading === 'monthly' || !statementPartyId} onClick={() => runReport('monthly', () => reportAPI.getMonthlyStatement({ partyId: statementPartyId, month: statementMonth }))}>
                {loading === 'monthly' ? 'Generating...' : 'Generate Report'}
              </Button>
              <SummaryBlock data={results.monthly?.summary || results.monthly} />
            </div>
          </CardContent>
        </Card>

        <Card animate={false}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Vehicle Settlement</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select label="Owner / Broker" options={partyOptions} value={settlementOwnerId} onChange={(e) => setSettlementOwnerId(e.target.value)} />
              <Input label="From" type="date" value={settlementFrom} onChange={(e) => setSettlementFrom(e.target.value)} />
              <Input label="To" type="date" value={settlementTo} onChange={(e) => setSettlementTo(e.target.value)} />
              <Button variant="outline" size="sm" className="w-full" disabled={loading === 'settlement' || !settlementOwnerId} onClick={() => runReport('settlement', () => reportAPI.getVehicleSettlement({ ownerId: settlementOwnerId, fromDate: settlementFrom, toDate: settlementTo }))}>
                {loading === 'settlement' ? 'Generating...' : 'Generate Report'}
              </Button>
              <SummaryBlock data={results.settlement?.summary || results.settlement} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
