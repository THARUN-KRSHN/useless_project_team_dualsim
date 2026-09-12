'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Volume2, Sparkles, Trophy, User } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { href: '/app/analyzer', label: 'Analyze', icon: Leaf },
  { href: '/app/real-pop', label: 'Pop', icon: Volume2 },
  { href: '/app/virtual', label: 'Virtual', icon: Sparkles },
  { href: '/app/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-4 inset-x-0 z-50 px-4 pointer-events-none flex justify-center pb-[env(safe-area-inset-bottom)]">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-md border border-border/80 rounded-full px-3 py-2 shadow-soft-lg flex items-center gap-1 sm:gap-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] sm:min-w-[64px] h-12 rounded-full transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-forest-muted hover:text-forest hover:bg-surface-muted'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-bold tracking-tight mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
