'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Leaf, Volume2, Sparkles, Trophy, User, LogOut, ExternalLink } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/app/analyzer', label: 'AI Leaf Analyzer', icon: Leaf, badge: 'AI' },
  { href: '/app/real-pop', label: 'Real Leaf Pop', icon: Volume2, badge: 'Mic' },
  { href: '/app/virtual', label: 'Virtual Leaf', icon: Sparkles, badge: 'Game' },
];

export const DesktopSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, signOut, isDemoUser } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-border h-screen sticky top-0 px-5 py-6 select-none z-30">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-2 mb-8 group">
        <span className="text-2xl transition-transform duration-300 group-hover:rotate-12">
          🍃
        </span>
        <div>
          <span className="font-black text-xl tracking-tight text-forest block leading-none">
            LeafPop<span className="text-primary-600 font-medium text-xs ml-1">AI</span>
          </span>
          <span className="text-[10px] text-forest-subtle font-medium uppercase tracking-wider block mt-1">
            Crack Lab
          </span>
        </div>
      </Link>

      {/* Primary Navigation */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-subtle px-3 mb-2 block">
          Play & Experiment
        </span>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100/80 text-primary-900 shadow-sm'
                  : 'text-forest-muted hover:text-forest hover:bg-surface-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-primary-600' : 'text-forest-muted'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-primary-200 text-primary-900'
                      : 'bg-surface-muted text-forest-subtle'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-border/70" />

      {/* Global / Compete */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-forest-subtle px-3 mb-2 block">
          Competition
        </span>
        <Link
          href="/app/leaderboard"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            pathname === '/app/leaderboard'
              ? 'bg-primary-100/80 text-primary-900 shadow-sm'
              : 'text-forest-muted hover:text-forest hover:bg-surface-muted'
          }`}
        >
          <Trophy
            size={18}
            className={
              pathname === '/app/leaderboard'
                ? 'text-primary-600'
                : 'text-forest-muted'
            }
          />
          <span>Leaderboard</span>
        </Link>
      </div>

      <div className="mt-auto pt-6 border-t border-border/70">
        {/* User Card */}
        <Link
          href="/app/profile"
          className={`flex items-center gap-3 p-2 rounded-2xl transition-all duration-200 mb-2 ${
            pathname === '/app/profile'
              ? 'bg-primary-50 text-forest'
              : 'hover:bg-surface-muted text-forest'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-forest font-bold text-sm shrink-0">
            {user?.username?.charAt(0).toUpperCase() || 'L'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm text-forest block truncate">
              {user?.username || 'Leaf Popper'}
            </span>
            <span className="text-xs text-forest-subtle block truncate">
              {isDemoUser ? 'Demo Mode' : user?.email}
            </span>
          </div>
        </Link>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-forest-subtle hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
