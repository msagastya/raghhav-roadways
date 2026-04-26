'use client';

import { useState, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Building, Truck } from 'lucide-react';
import PageHeader from '../../../components/ui/page-header';
import StateCityMaster from '../../../components/masters/StateCityMaster';
import ConsignorConsigneeMaster from '../../../components/masters/ConsignorConsigneeMaster';
import InvoicePartyMaster from '../../../components/masters/InvoicePartyMaster';
import VehicleOwnerBrokerMaster from '../../../components/masters/VehicleOwnerBrokerMaster';

const tabs = [
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'consignors', label: 'Consignors/Consignees', icon: Users },
  { id: 'invoice-parties', label: 'Invoice Parties', icon: Building },
  { id: 'vehicle-owners', label: 'Vehicle Owners', icon: Truck },
];

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'locations':
      return <StateCityMaster />;
    case 'consignors':
      return <ConsignorConsigneeMaster />;
    case 'invoice-parties':
      return <InvoicePartyMaster />;
    case 'vehicle-owners':
      return <VehicleOwnerBrokerMaster />;
    default:
      return null;
  }
};

export default function MastersPage() {
  const [activeTab, setActiveTab] = useState('locations');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Foundation"
        subtitle="Manage master data"
        icon={Building}
      />

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'glass-accent text-gray-900 dark:text-white'
                  : 'glass-t1 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      <TabContent activeTab={activeTab} />
    </div>
  );
}
