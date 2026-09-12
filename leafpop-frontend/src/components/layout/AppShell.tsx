'use client';

import React from 'react';
import Link from 'next/link';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  category?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  category,
  title,
  description,
  action,
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-forest flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/70 px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 select-none">
            <span className="text-2xl">🍃</span>
            <span className="font-black text-lg text-forest tracking-tight">
              LeafPop<span className="text-primary-600 font-medium text-xs ml-1">AI</span>
            </span>
          </Link>
          <Link
            href="/app/profile"
            className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-xs font-bold text-forest"
          >
            {user?.username?.charAt(0).toUpperCase() || 'L'}
          </Link>
        </header>

        {/* Dynamic Workspace */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto w-full pb-28 lg:pb-12">
          {(category || title || description) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
              <div>
                {category && (
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-200/50 px-3 py-1 rounded-full inline-block mb-2">
                    {category}
                  </span>
                )}
                {title && (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-forest tracking-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-sm sm:text-base text-forest-muted mt-1 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </motion.div>
          )}

          {/* Page Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Floating Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};
