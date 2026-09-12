'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { Sparkles, Menu, X, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 max-w-5xl mx-auto">
      <nav className="bg-white/90 backdrop-blur-md border border-border/70 rounded-full px-5 py-3 shadow-soft flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <span className="text-2xl transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            🍃
          </span>
          <span className="font-extrabold text-xl tracking-tight text-forest">
            LeafPop<span className="text-primary-600 font-medium text-sm ml-1">AI</span>
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <a
            href="#features"
            className="px-4 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-4 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            How It Works
          </a>
          <a
            href="#leaderboard"
            className="px-4 py-1.5 text-sm font-medium text-forest-muted hover:text-forest hover:bg-surface-muted rounded-full transition-colors"
          >
            Leaderboard
          </a>
        </div>

        {/* Right CTA */}
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
      </nav>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 bg-white border border-border rounded-3xl p-4 shadow-soft-md flex flex-col gap-2">
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
