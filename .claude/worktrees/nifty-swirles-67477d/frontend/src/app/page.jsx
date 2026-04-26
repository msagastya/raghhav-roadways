'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to login - let login page handle auth
    router.replace('/login');
  }, [router]);

  // Minimal loading screen
  return null;
}
