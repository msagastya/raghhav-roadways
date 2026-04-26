'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Lock, FileText, Building } from 'lucide-react';
import PageHeader from '../../../components/ui/page-header';
import GlassPanel from '../../../components/ui/glass-panel';

const settingsMenu = [
  { id: 'account', label: 'Account', icon: Users, href: '#' },
  { id: 'security', label: 'Security', icon: Lock, href: '#' },
  { id: 'users', label: 'Users', icon: Users, href: '/settings/users' },
  { id: 'roles', label: 'Roles', icon: Lock, href: '/settings/roles' },
  { id: 'audit', label: 'Audit Logs', icon: FileText, href: '/settings/audit-logs' },
  { id: 'company', label: 'Company', icon: Building, href: '#' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage system settings"
        icon={Settings}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`p-4 rounded-lg transition-all text-left ${
                activeSection === item.id
                  ? 'glass-accent text-gray-900 dark:text-white border-l-3 border-primary-500'
                  : 'glass-t2 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <Icon className="w-5 h-5 mb-2" />
              <p className="text-sm font-medium">{item.label}</p>
            </motion.button>
          );
        })}
      </div>

      <GlassPanel tier={2} className="p-6 min-h-96">
        <div className="text-center text-gray-500 dark:text-white/60 py-12">
          <p>Settings for {settingsMenu.find(s => s.id === activeSection)?.label}</p>
        </div>
      </GlassPanel>
    </div>
  );
}
