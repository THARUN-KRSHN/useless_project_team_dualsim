'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { getMyStats } from '@/lib/api';
import { UserStats } from '@/types';
import { Leaf, Volume2, Sparkles, Trophy, ArrowRight, TrendingUp } from 'lucide-react';

export default function AppDashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    getMyStats(token)
      .then((data) => setStats(data))
      .catch((err) => console.log('Stats note:', err.message));
  }, [token]);

  return (
    <AppShell
      category="Workspace"
      title={`Welcome, ${user?.username || 'Popper'}! 🍃`}
      description="Choose your scientific protocol. Analyze leaves, record microphone pops, or play the 3D virtual crack game."
    >
      {/* Stats Quick Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Best Pop Score
          </span>
          <div className="text-3xl font-black text-primary-700">
            {stats?.best_score || 0}
            <span className="text-xs font-semibold text-forest-subtle ml-1">/100</span>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Total Pops
          </span>
          <div className="text-3xl font-black text-forest">
            {stats?.total_pops || 0}
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Average Score
          </span>
          <div className="text-3xl font-black text-forest">
            {stats?.average_score?.toFixed(1) || '0.0'}
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Global Rank
          </span>
          <div className="text-3xl font-black text-primary-600">
            {stats?.rank ? `#${stats.rank}` : '#--'}
          </div>
        </div>
      </div>

      {/* Main Feature Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Portal 1 */}
        <Link href="/app/analyzer">
          <Card hoverable className="h-full flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Leaf size={24} />
              </div>
              <Pill variant="green" size="sm" className="mb-2">
                Predictive AI
              </Pill>
              <h2 className="text-xl font-bold text-forest mb-2">
                1. AI Leaf Analyzer
              </h2>
              <p className="text-forest-muted text-sm leading-relaxed">
                Take a photo of a leaf. Our computer vision network evaluates dryness, vein density, and predicted loudness.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-sm font-bold text-primary-700">
              <span>Launch Analyzer</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Portal 2 */}
        <Link href="/app/real-pop">
          <Card hoverable className="h-full flex flex-col justify-between group border-primary-300/40 bg-gradient-to-b from-white to-primary-50/20">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Volume2 size={24} />
              </div>
              <Pill variant="dark" size="sm" className="mb-2">
                Acoustic Science
              </Pill>
              <h2 className="text-xl font-bold text-forest mb-2">
                2. Real Leaf Pop
              </h2>
              <p className="text-forest-muted text-sm leading-relaxed">
                Record your real physical leaf pop or upload audio. Our backend decodes frequency transients and awards verified points.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-sm font-bold text-primary-700">
              <span>Start Recording</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Portal 3 */}
        <Link href="/app/virtual">
          <Card hoverable className="h-full flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-lime-100 text-lime-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <Pill variant="amber" size="sm" className="mb-2">
                3D WebGL Game
              </Pill>
              <h2 className="text-xl font-bold text-forest mb-2">
                3. Virtual Leaf Pop
              </h2>
              <p className="text-forest-muted text-sm leading-relaxed">
                No physical leaf handy? Tap and crack our digital 3D leaf with single-tap precision and instant sound synthesis.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex items-center gap-2 text-sm font-bold text-primary-700">
              <span>Play Virtual Pop</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}
