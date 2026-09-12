'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isDemoUser } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && !isDemoUser) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, isDemoUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8f7] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 mb-3 animate-bounce">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ilapottikal-logo.png" alt="IlaPottikal" className="w-full h-full object-contain" />
        </div>
        <p className="text-xs font-bold text-forest-subtle uppercase tracking-widest">
          Loading IlaPottikal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
