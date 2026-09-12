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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl animate-bounce mb-3">
          🍃
        </div>
        <p className="text-xs font-bold text-forest-subtle uppercase tracking-wider">
          Loading LeafPop...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
