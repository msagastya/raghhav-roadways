'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import StateCityMaster from '../../../components/masters/StateCityMaster';
import ConsignorConsigneeMaster from '../../../components/masters/ConsignorConsigneeMaster';
import InvoicePartyMaster from '../../../components/masters/InvoicePartyMaster';
import VehicleOwnerBrokerMaster from '../../../components/masters/VehicleOwnerBrokerMaster';

const tabs = [
  { id: 'state-city', label: 'State-City Master' },
  { id: 'consignor-consignee', label: 'Consignor/Consignee Master' },
  { id: 'party', label: 'Party Master' },
  { id: 'vehicle-owner', label: 'Vehicle Owner/Broker Master' },
];

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState('state-city');

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-1"
      >
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 drop-shadow-sm">Master Data Management</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage all master data for the system</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="border-b-2 border-gray-200 pb-2 sm:overflow-x-auto sm:pb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <nav className="grid grid-cols-2 gap-2 px-1 sm:-mb-0.5 sm:flex sm:min-w-max sm:gap-0 sm:space-x-6 lg:space-x-8">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative rounded-xl px-2 py-2.5 font-semibold text-xs transition-all sm:rounded-none sm:py-4 sm:text-sm lg:text-base
                ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 shadow-sm sm:bg-transparent sm:text-primary-600 sm:shadow-none'
                    : 'bg-white/50 text-gray-500 hover:bg-white hover:text-gray-700 sm:bg-transparent sm:hover:bg-transparent'
                }
              `}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full shadow-lg shadow-primary-500/50 sm:left-0 sm:right-0 sm:h-1"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        className="mt-4 sm:mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'state-city' && <StateCityMaster />}
        {activeTab === 'consignor-consignee' && <ConsignorConsigneeMaster />}
        {activeTab === 'party' && <InvoicePartyMaster />}
        {activeTab === 'vehicle-owner' && <VehicleOwnerBrokerMaster />}
      </motion.div>
    </div>
  );
}
