'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, TrendingUp, Download } from 'lucide-react';
import { reportAPI } from '../../../lib/api';
import PageHeader from '../../../components/ui/page-header';
import GlassPanel from '../../../components/ui/glass-panel';
import Button from '../../../components/ui/button';
import useToast from '../../../hooks/useToast';

export default function ReportsPage() {
  const [generating, setGenerating] = useState(null);
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().toISOString().slice(0, 7));
  const [vehicleFrom, setVehicleFrom] = useState('');
  const [vehicleTo, setVehicleTo] = useState('');
  const { showError, showSuccess } = useToast();

  const downloadBlob = (data, filename) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDaily = async () => {
    setGenerating('daily');
    try {
      const res = await reportAPI.getDaily(dailyDate);
      downloadBlob(res.data, `daily-report-${dailyDate}.pdf`);
      showSuccess('Daily report downloaded');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to generate daily report');
    } finally {
      setGenerating(null);
    }
  };

  const handleMonthly = async () => {
    setGenerating('monthly');
    try {
      const res = await reportAPI.getMonthlyStatement({ month: monthlyMonth });
      downloadBlob(res.data, `monthly-statement-${monthlyMonth}.pdf`);
      showSuccess('Monthly statement downloaded');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to generate monthly statement');
    } finally {
      setGenerating(null);
    }
  };

  const handleVehicle = async () => {
    setGenerating('vehicle');
    try {
      const res = await reportAPI.getVehicleSettlement({ fromDate: vehicleFrom, toDate: vehicleTo });
      downloadBlob(res.data, `vehicle-settlement.pdf`);
      showSuccess('Vehicle settlement downloaded');
    } catch (error) {
      showError(error?.response?.data?.message || 'Failed to generate vehicle settlement');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate and analyze reports"
        icon={BarChart3}
      />

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Daily Report */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <GlassPanel tier={2} className="p-6 h-full flex flex-col">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Daily Report</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4 flex-1">View daily transaction summary</p>
            <input
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
              className="mb-3 w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm"
            />
            <Button className="w-full" onClick={handleDaily} disabled={generating === 'daily'}>
              <Download className="w-4 h-4 mr-2" />
              {generating === 'daily' ? 'Generating...' : 'Generate'}
            </Button>
          </GlassPanel>
        </motion.div>

        {/* Monthly Statement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassPanel tier={2} className="p-6 h-full flex flex-col">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Monthly Statement</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4 flex-1">Party-wise monthly statement</p>
            <input
              type="month"
              value={monthlyMonth}
              onChange={(e) => setMonthlyMonth(e.target.value)}
              className="mb-3 w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm"
            />
            <Button className="w-full" onClick={handleMonthly} disabled={generating === 'monthly'}>
              <Download className="w-4 h-4 mr-2" />
              {generating === 'monthly' ? 'Generating...' : 'Generate'}
            </Button>
          </GlassPanel>
        </motion.div>

        {/* Vehicle Settlement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassPanel tier={2} className="p-6 h-full flex flex-col">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Vehicle Settlement</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mb-4 flex-1">Trip-wise settlement report</p>
            <div className="space-y-2 mb-3">
              <input
                type="date"
                value={vehicleFrom}
                onChange={(e) => setVehicleFrom(e.target.value)}
                placeholder="From"
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm"
              />
              <input
                type="date"
                value={vehicleTo}
                onChange={(e) => setVehicleTo(e.target.value)}
                placeholder="To"
                className="w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-white/5 border border-black/6 dark:border-white/8 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <Button className="w-full" onClick={handleVehicle} disabled={generating === 'vehicle'}>
              <Download className="w-4 h-4 mr-2" />
              {generating === 'vehicle' ? 'Generating...' : 'Generate'}
            </Button>
          </GlassPanel>
        </motion.div>
      </motion.div>
    </div>
  );
}
