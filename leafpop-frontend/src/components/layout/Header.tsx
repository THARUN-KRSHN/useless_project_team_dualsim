'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleReplayIntro = () => {
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined' && (window as any).replayIlaPottikalIntro) {
      (window as any).replayIlaPottikalIntro();
    }
  };

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-5xl mx-auto">
      <nav className="bg-white/90 backdrop-blur-md border border-border/70 rounded-full px-4 sm:px-5 py-3 shadow-soft flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center group-hover:scale-110 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ilapottikal-logo.png" alt="IlaPottikal Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-forest">
            IlaPottikal
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={handleReplayIntro}
            className="px-3.5 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-full transition-colors flex items-center gap-1 border border-primary-200/60"
          >
            <Sparkles size={12} /> Replay Intro
          </button>
          <a
            href="#features"
            className="px-3.5 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-3.5 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            How It Works
          </a>
          <a
            href="#leaderboard"
            className="px-3.5 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            Leaderboard
          </a>
        </div>

        {/* Right Actions / Mobile Intro Replay & CTA */}
        <div className="flex items-center gap-2">
          {/* Quick Replay Intro button visible on small mobile screens */}
          <button
            onClick={handleReplayIntro}
            className="flex md:hidden items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/80 rounded-full transition-all active:scale-95"
            title="Replay Intro Video"
          >
            <Sparkles size={12} className="text-primary-600 animate-pulse" />
            <span className="text-[11px]">Intro</span>
          </button>

          {/* Desktop Right CTA */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <Link href="/app">
                <Button size="sm" variant="primary" icon={<ArrowRight size={14} />}>
                  Open App
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button size="sm" variant="ghost">
                    Sign In
                  </Button>
                </Link>
                <Link href="/app">
                  <Button size="sm" variant="primary">
                    Try Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-1.5 text-forest hover:bg-surface-muted rounded-full"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 bg-white/95 backdrop-blur-lg border border-border rounded-3xl p-4 shadow-soft-md flex flex-col gap-2">
          <button
            onClick={handleReplayIntro}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-primary-700 bg-primary-50/90 hover:bg-primary-100 rounded-2xl border border-primary-200/70"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary-600" />
              <span>Replay Intro Scene</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-primary-200 text-primary-900 rounded-full">
              Video
            </span>
          </button>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-sm font-medium text-forest hover:bg-surface-muted rounded-xl"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-sm font-medium text-forest hover:bg-surface-muted rounded-xl"
          >
            How It Works
          </a>
          <a
            href="#leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="px-4 py-2 text-sm font-medium text-forest hover:bg-surface-muted rounded-xl"
          >
            Leaderboard
          </a>
          <div className="pt-2 border-t border-border flex flex-col gap-2">
            <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/app" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" size="sm" className="w-full">
                Enter LeafPop App
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
