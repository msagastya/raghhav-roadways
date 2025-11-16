'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Users, Building2, ArrowRight } from 'lucide-react';
import { partyAPI } from '../../../lib/api';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { TableSkeleton } from '../../../components/ui/skeleton';
import Button from '../../../components/ui/button';
import Badge from '../../../components/ui/badge';
import useToast from '../../../hooks/useToast';
import { getErrorMessage } from '../../../lib/utils';

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, withGSTIN: 0 });
  const [filter, setFilter] = useState('all'); // all, active, inactive, withGSTIN
  const { showError } = useToast();

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll({ limit: 100 });
      const partiesData = response.data?.data?.parties || [];
      setParties(partiesData);

      // Calculate stats
      const activeParties = partiesData.filter(p => p.isActive).length;
      const inactiveParties = partiesData.filter(p => !p.isActive).length;
      const withGSTIN = partiesData.filter(p => p.gstin && p.gstin.trim() !== '').length;

      setStats({
        total: partiesData.length,
        active: activeParties,
        inactive: inactiveParties,
        withGSTIN
      });
    } catch (error) {
      showError(getErrorMessage(error));
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter parties based on selected filter
  const filteredParties = parties.filter(party => {
    if (filter === 'all') return true;
    if (filter === 'active') return party.isActive;
    if (filter === 'inactive') return !party.isActive;
    if (filter === 'withGSTIN') return party.gstin && party.gstin.trim() !== '';
    return true;
  });

  const getFilterTitle = () => {
    if (filter === 'all') return 'All Parties';
    if (filter === 'active') return 'Active Parties';
    if (filter === 'inactive') return 'Inactive Parties';
    if (filter === 'withGSTIN') return 'Parties with GSTIN';
    return 'All Parties';
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-56 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
        <Card animate={false}>
          <CardContent className="p-4 sm:p-6">
            <TableSkeleton rows={10} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        className="space-y-3 px-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-sm">Parties</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage consignors and consignees</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/masters" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Manage Masters</span>
              </Button>
            </Link>
            <Button className="flex-1 sm:flex-none flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Add Party</span>
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
              <span className="text-blue-600 text-xs sm:text-sm font-bold">i</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-800 flex-1">
              <strong className="font-semibold">Party Type:</strong> A party can be marked as <strong>Consignor</strong> (sender),
              <strong> Consignee</strong> (receiver), or <strong>Both</strong>. The same party can send and receive goods
              at different times. Manage all party types in the <strong>Masters</strong> section.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Parties', value: stats.total, icon: Users, bg: 'bg-blue-100', iconColor: 'text-blue-600', filterKey: 'all' },
          { label: 'Active', value: stats.active, icon: Building2, bg: 'bg-green-100', iconColor: 'text-green-600', filterKey: 'active' },
          { label: 'Inactive', value: stats.inactive, icon: Building2, bg: 'bg-red-100', iconColor: 'text-red-600', filterKey: 'inactive' },
          { label: 'With GSTIN', value: stats.withGSTIN, icon: Users, bg: 'bg-purple-100', iconColor: 'text-purple-600', filterKey: 'withGSTIN' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          const isActive = filter === stat.filterKey;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              onClick={() => setFilter(stat.filterKey)}
            >
              <Card animate={false} hover3d={true} className={`group cursor-pointer transition-all ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <motion.div
                      className={`p-2 sm:p-2.5 rounded-xl ${stat.bg} flex-shrink-0 shadow-md`}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.6, type: 'spring' }}
                    >
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.iconColor}`} />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Parties Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card animate={false} hover3d={true}>
          <CardHeader>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{getFilterTitle()}</h3>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Code</TableHead>
                    <TableHead className="text-xs sm:text-sm">Name</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">GSTIN</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Mobile</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredParties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-sm">No parties found</p>
                          <Link href="/masters">
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                              Go to Masters
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParties.map((party, index) => (
                      <TableRow key={party.id} animate={true} index={index}>
                        <TableCell className="font-medium text-xs sm:text-sm">{party.partyCode}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{party.partyName}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          <Badge variant="secondary">{party.partyType}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{party.gstin || '-'}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{party.mobile || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={party.isActive ? 'success' : 'danger'} className="text-xs">
                            {party.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
