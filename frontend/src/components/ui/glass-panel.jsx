'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * GlassPanel Component
 * Tier system for glass-morphic panels:
 * - Tier 1: Surface (table rows, list items)
 * - Tier 2: Panel (cards, sections)
 * - Tier 3: Elevated (modals, dropdowns)
 * - Tier 4: Navigation (sidebar, header)
 */
export default function GlassPanel({
  children,
  tier = 2,
  accent = false,
  className = '',
  animated = true,
  hover = true,
  ...props
}) {
  const tierClasses = {
    1: 'glass-t1',
    2: 'glass-t2',
    3: 'glass-t3',
    4: 'glass-t4',
  };

  const hoverEffects = {
    1: 'hover:bg-white/[0.60] hover:border-black/[0.08] dark:hover:bg-white/[0.06] dark:hover:border-white/[0.08]',
    2: 'hover:bg-white/[0.72] hover:border-black/[0.10] dark:hover:bg-white/[0.08]',
    3: 'hover:bg-white/[0.85] dark:hover:bg-white/[0.12]',
    4: '',
  };

  const accentClass = accent ? 'glass-accent' : '';

  return (
    <motion.div
      className={cn(
        'rounded-lg transition-all duration-200',
        tierClasses[tier],
        accentClass,
        hover && hoverEffects[tier],
        className
      )}
      initial={animated ? { opacity: 0, y: 10 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={animated ? { duration: 0.3 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Export tier-specific variants for convenience
 */
export const GlassT1 = (props) => <GlassPanel tier={1} {...props} />;
export const GlassT2 = (props) => <GlassPanel tier={2} {...props} />;
export const GlassT3 = (props) => <GlassPanel tier={3} {...props} />;
export const GlassT4 = (props) => <GlassPanel tier={4} {...props} />;
