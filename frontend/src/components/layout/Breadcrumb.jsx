'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const pathname = usePathname();

  // Remove leading slash and split
  const segments = pathname
    .slice(1)
    .split('/')
    .filter(Boolean)
    .filter((seg) => seg !== '(dashboard)' && seg !== '(auth)');

  // Format segment name
  const formatSegment = (segment) => {
    return segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Build breadcrumb path
  const breadcrumbs = [
    { name: 'Dashboard', href: '/' },
    ...segments.map((segment, idx) => ({
      name: formatSegment(segment),
      href: '/' + segments.slice(0, idx + 1).join('/'),
    })),
  ];

  // Only show if we have more than just dashboard
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-xs text-white/60 overflow-x-auto hide-scrollbar">
      {breadcrumbs.map((crumb, idx) => (
        <motion.div
          key={crumb.href}
          className="flex items-center gap-1 whitespace-nowrap flex-shrink-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          {idx === 0 ? (
            <Link href={crumb.href}>
              <motion.div
                className="flex items-center gap-1 hover:text-white transition-colors"
                whileHover={{ x: 2 }}
              >
                <Home className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <Link href={crumb.href}>
                <motion.span
                  className="hover:text-white transition-colors cursor-pointer"
                  whileHover={{ x: 2 }}
                >
                  {crumb.name}
                </motion.span>
              </Link>
            </>
          )}
        </motion.div>
      ))}
    </div>
  );
}
