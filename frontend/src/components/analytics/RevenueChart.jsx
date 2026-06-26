'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, IndianRupee } from 'lucide-react';
import { cn } from '../../lib/utils';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-primary-500/30 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
        <p className="text-[10px] font-orbitron font-bold tracking-widest uppercase text-slate-400 mb-2">{label}</p>
        <p className="text-xl font-orbitron font-bold text-primary-500 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)] flex items-center gap-1">
          <IndianRupee className="w-4 h-4" />
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ data = [], title = "Revenue Overview", trend = 0 }) {
  // Use provided data or show empty state
  const chartData = data.length > 0 ? data : [];
  const hasData = chartData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="glass-panel h-full flex flex-col">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/30">
                <BarChart3 className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-orbitron font-bold text-white tracking-widest uppercase">{title}</h3>
                <p className="text-[10px] font-orbitron text-primary-500/70 tracking-widest uppercase mt-0.5">Last 30 Days Telemetry</p>
              </div>
            </div>
            {trend !== 0 && (
              <div className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-md border text-[10px] font-orbitron font-bold tracking-widest uppercase",
                trend > 0
                  ? 'bg-primary-500/10 text-primary-500 border-primary-500/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]'
                  : 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
              )}>
                {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 relative">
          {/* Subtle grid background pattern */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
          
          {hasData ? (
            <>
              <div className="h-64 sm:h-72 lg:h-80 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.5} />
                        <stop offset="50%" stopColor="#00ff88" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Orbitron' }} 
                      stroke="#334155" 
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'Orbitron' }} 
                      stroke="#334155" 
                      tickFormatter={(v) => `₹${v >= 1000 ? v / 1000 + 'k' : v}`}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00ff88', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#00ff88"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 6, fill: "#000", stroke: "#00ff88", strokeWidth: 3, filter: "url(#glow)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]"></div>
                  <span className="text-[9px] font-orbitron font-bold tracking-widest text-slate-400 uppercase">Gross Revenue Signal</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 sm:h-72 lg:h-80 flex flex-col items-center justify-center relative z-10">
              <div className="w-16 h-16 rounded-full border border-slate-700 flex items-center justify-center mb-4 bg-slate-900/50">
                <BarChart3 className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-sm font-orbitron font-bold text-slate-400 tracking-widest uppercase">No Telemetry Signal</p>
              <p className="text-[10px] font-orbitron text-slate-500 mt-2 tracking-widest uppercase">
                Awaiting Data Stream
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
