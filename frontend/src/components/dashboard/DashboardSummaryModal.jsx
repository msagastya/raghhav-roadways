'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { vehicleAPI, consignmentAPI, partyAPI, invoiceAPI } from '../../lib/api';
import Modal from '../ui/modal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Truck, Package, Users, FileText, Receipt, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import useToast from '../../hooks/useToast';

export default function DashboardSummaryModal({ isOpen, onClose, type }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  useEffect(() => {
    if (isOpen && type) {
      fetchData(type);
    } else {
      setData([]);
    }
  }, [isOpen, type]);

  const fetchData = async (fetchType) => {
    try {
      setLoading(true);
      let res;
      switch (fetchType) {
        case 'active-vehicles':
          res = await vehicleAPI.getAll(); 
          setData(res.data?.data?.vehicles?.filter(v => v.isActive) || []);
          break;
        case 'pending-deliveries':
          res = await consignmentAPI.getAll({ limit: 100 });
          setData(res.data?.data?.consignments?.filter(c => c.status !== 'Delivered') || []);
          break;
        case 'completed-orders':
        case 'on-time-delivery':
          res = await consignmentAPI.getAll({ status: 'Delivered', limit: 100 });
          setData(res.data?.data?.consignments?.filter(c => c.status === 'Delivered') || []);
          break;
        case 'total-parties':
          res = await partyAPI.getAll({ limit: 100 });
          setData(res.data?.data?.parties || []);
          break;
        case 'pending-invoices':
          res = await invoiceAPI.getAll({ limit: 100 });
          setData(res.data?.data?.invoices?.filter(i => i.paymentStatus !== 'Paid') || []);
          break;
        case 'consignments':
        case 'revenue':
          res = await consignmentAPI.getAll({ limit: 100 });
          setData(res.data?.data?.consignments || []);
          break;
        default:
          setData([]);
      }
    } catch (err) {
      console.error('Error fetching summary data:', err);
      showError('Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  const getModalConfig = () => {
    switch (type) {
      case 'active-vehicles': return { title: 'Active Vehicles', icon: Truck, color: 'text-purple-500' };
      case 'pending-deliveries': return { title: 'Pending Deliveries', icon: AlertTriangle, color: 'text-red-500' };
      case 'completed-orders': return { title: 'Completed Orders', icon: CheckCircle2, color: 'text-brand-500' };
      case 'on-time-delivery': return { title: 'On-Time Deliveries', icon: CheckCircle2, color: 'text-brand-500' };
      case 'total-parties': return { title: 'Parties Directory', icon: Users, color: 'text-purple-500' };
      case 'pending-invoices': return { title: 'Pending Invoices', icon: Receipt, color: 'text-yellow-500' };
      case 'consignments': return { title: 'Recent Consignments', icon: FileText, color: 'text-primary-500' };
      case 'revenue': return { title: 'Recent Bookings (Revenue)', icon: Package, color: 'text-brand-500' };
      default: return { title: 'Details', icon: FileText, color: 'text-white' };
    }
  };

  const config = getModalConfig();
  const Icon = config.icon;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
          <p className="text-sm font-orbitron tracking-widest text-slate-400 uppercase">Fetching Data...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Icon className="w-12 h-12 text-slate-600 mb-4 opacity-50" />
          <p className="text-sm font-orbitron tracking-widest text-slate-400 uppercase">No records found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.slice(0, 50).map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-primary-500/30 hover:bg-slate-800/80 transition-all"
          >
            <div className="flex-1 min-w-0">
              {type === 'active-vehicles' && (
                <>
                  <p className="text-sm font-bold text-white font-orbitron tracking-wider">{item.vehicleNo}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.vehicleType} • {item.ownerName}</p>
                </>
              )}
              {(type === 'pending-deliveries' || type === 'completed-orders' || type === 'on-time-delivery' || type === 'consignments' || type === 'revenue') && (
                <>
                  <p className="text-sm font-bold text-white font-orbitron tracking-wider">{item.grNumber}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{item.fromLocation} → {item.toLocation}</p>
                </>
              )}
              {type === 'total-parties' && (
                <>
                  <p className="text-sm font-bold text-white font-orbitron tracking-wider truncate">{item.partyName}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.city || 'No City'} • {item.partyType}</p>
                </>
              )}
              {type === 'pending-invoices' && (
                <>
                  <p className="text-sm font-bold text-white font-orbitron tracking-wider">{item.invoiceNumber}</p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{item.party?.partyName || 'Unknown Party'}</p>
                </>
              )}
            </div>
            
            <div className="text-right ml-4">
              {type === 'active-vehicles' && (
                <span className="text-xs px-2 py-1 rounded bg-primary-500/10 text-primary-500 border border-primary-500/30 uppercase font-orbitron">Active</span>
              )}
              {(type === 'pending-deliveries' || type === 'completed-orders' || type === 'on-time-delivery' || type === 'consignments' || type === 'revenue') && (
                <>
                  <p className="text-sm font-bold text-brand-500">{formatCurrency(item.totalAmount)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{item.status}</p>
                </>
              )}
              {type === 'total-parties' && (
                <p className="text-xs text-slate-400">{item.mobile || 'No Mobile'}</p>
              )}
              {type === 'pending-invoices' && (
                <>
                  <p className="text-sm font-bold text-yellow-500">{formatCurrency(item.balanceAmount)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Due: {item.dueDate ? formatDate(item.dueDate) : 'N/A'}</p>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-900 border border-slate-700 ${config.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-orbitron tracking-widest uppercase text-white drop-shadow-md">
            {config.title}
          </span>
        </div>
      }
      size="lg"
    >
      {renderContent()}
    </Modal>
  );
}
