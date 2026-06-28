'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Plus, Trash2, Truck } from 'lucide-react';
import { vehicleAPI } from '../../../lib/api';
import useToast from '../../../hooks/useToast';
import { getErrorMessage, cn } from '../../../lib/utils';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slowLoading, setSlowLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setSlowLoading(false);
    const slowTimer = window.setTimeout(() => setSlowLoading(true), 3500);

    try {
      const response = await vehicleAPI.getAll({ limit: 100 });
      setVehicles(response.data?.data?.vehicles || []);
    } catch (error) {
      showError(getErrorMessage(error));
      setVehicles([]);
    } finally {
      window.clearTimeout(slowTimer);
      setLoading(false);
      setSlowLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    router.push(`/vehicles/${vehicle.id}/edit`);
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to delete vehicle ${vehicle.vehicleNo}?`)) {
      return;
    }

    try {
      await vehicleAPI.delete(vehicle.id);
      showSuccess('Vehicle deleted successfully');
      fetchVehicles();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-warp-in">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-500/10 backdrop-blur-md rounded-2xl border border-brand-500/30 shadow-[0_0_15px_rgba(0,212,255,0.2)]">
            <Truck className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-orbitron font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              VEHICLE <span className="text-brand-500">FLEET</span>
            </h1>
            <p className="text-brand-500/70 font-orbitron mt-1 text-xs tracking-[0.3em] uppercase">
              {vehicles.length} Total Vehicles
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/vehicles/new')}
          className="neon-button border-brand-500/50 shadow-[0_0_15px_rgba(0,212,255,0.2)] w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          NEW VEHICLE
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="glass-panel overflow-hidden border-slate-800"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <h3 className="text-sm font-orbitron font-bold text-slate-300 tracking-widest">ALL VEHICLES</h3>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin mb-4" />
            <p className="text-xs font-orbitron text-brand-500 tracking-widest uppercase animate-pulse">Initializing Data Stream...</p>
            {slowLoading && (
              <p className="text-[10px] font-orbitron text-slate-500 mt-2 tracking-widest uppercase animate-pulse text-center max-w-sm">
                Server cluster waking up. Link will establish shortly.
              </p>
            )}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4">
              <Truck className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-sm font-orbitron font-bold text-slate-400 tracking-widest uppercase">No Vehicles Found</p>
            <button
              onClick={() => router.push('/vehicles/new')}
              className="mt-4 neon-button border-brand-500/50 shadow-[0_0_15px_rgba(0,212,255,0.2)]"
            >
              <Plus className="w-4 h-4" />
              REGISTER VEHICLE
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Vehicle No</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Owner Type</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Owner Name</th>
                  <th className="px-5 py-4 text-left text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Driver Name</th>
                  <th className="px-5 py-4 text-center text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 text-right text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-950/20">
                <AnimatePresence>
                  {vehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-5 py-4 font-orbitron font-bold text-brand-500 whitespace-nowrap">
                        {vehicle.vehicleNo}
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-sans whitespace-nowrap">
                        {vehicle.vehicleType || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-sans whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border bg-slate-800 text-slate-300 border-slate-700">
                          {vehicle.ownerType}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-sans font-medium whitespace-nowrap">
                        {vehicle.ownerName || '-'}
                      </td>
                      <td className="px-5 py-4 text-white font-sans font-medium whitespace-nowrap">
                        {vehicle.driverName || '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-sm text-[9px] font-orbitron font-bold tracking-widest uppercase border",
                          vehicle.isActive
                            ? 'bg-primary-500/10 text-primary-500 border-primary-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30'
                        )}>
                          {vehicle.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-500/10 hover:border-brand-500/30 border border-transparent rounded-lg transition-all"
                            title="Edit vehicle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-lg transition-all"
                            title="Delete vehicle"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
