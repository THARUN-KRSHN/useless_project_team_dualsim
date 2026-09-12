'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, enterDemoMode, isDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      router.push('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    enterDemoMode();
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <Link href="/" className="flex items-center gap-3 mb-8 group select-none">
        <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ilapottikal-logo.png" alt="IlaPottikal Logo" className="w-full h-full object-contain" />
        </div>
        <span className="font-black text-2xl tracking-tight text-forest">
          IlaPottikal
        </span>
      </Link>

      <Card className="w-full max-w-md shadow-soft-lg">
        <div className="text-center mb-8">
          <Pill variant="green" size="sm" className="mb-2">
            Welcome Back
          </Pill>
          <h1 className="text-2xl sm:text-3xl font-black text-forest tracking-tight">
            Ready to pop?
          </h1>
          <p className="text-forest-muted text-xs sm:text-sm mt-1">
            Sign in to track your scores, rankings, and analyzed leaves.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-subtle mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@leafpop.ai"
              className="w-full px-4 py-3 rounded-2xl bg-surface-muted border border-border text-forest text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest-subtle mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-surface-muted border border-border text-forest text-sm font-medium focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs font-bold transition-colors border border-primary-200/60"
          >
            <Sparkles size={14} /> Continue with Hackathon Demo Mode
          </button>

          <p className="text-xs text-forest-muted">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-bold text-primary-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
