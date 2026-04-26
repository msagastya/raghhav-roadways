'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import useThemeStore from '../../store/themeStore';

export default function BackgroundCanvas() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Fixed background canvas */}
      <div
        className="fixed inset-0 z-0"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #060D0A 0%, #0A1510 50%, #060D0A 100%)'
            : 'linear-gradient(135deg, #F0F4F1 0%, #EDF5EE 50%, #EEF3F0 100%)',
        }}
      />

      {/* Subtle radial highlight at top-center */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.03) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Logo watermark — centered, breathing animation */}
      <div
        className="logo-watermark animate fixed inset-0 flex items-center justify-center z-0 pointer-events-none"
      >
        <div
          className="relative w-[min(70vw,800px)] md:w-[min(70vw,800px)] aspect-square"
        >
          <Image
            src="/logo.png"
            alt=""
            fill
            priority
            className="object-contain"
            style={{
              filter: theme === 'dark'
                ? 'grayscale(100%) contrast(0.5) brightness(0.8)'
                : 'grayscale(100%) contrast(0.5)',
              opacity: theme === 'dark' ? 0.03 : 0.045,
            }}
          />
        </div>
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
          backgroundSize: '100px 100px',
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  );
}
