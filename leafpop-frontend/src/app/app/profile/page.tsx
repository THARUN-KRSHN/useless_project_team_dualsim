'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getMyStats, getMyPopHistory } from '@/lib/api';
import { UserStats, PopHistoryItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Score } from '@/components/ui/Score';
import { motion } from 'framer-motion';
import {
  User,
  LogOut,
  Trophy,
  Leaf,
  Volume2,
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
  Star,
} from 'lucide-react';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: 'Legendary', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score >= 75) return { label: 'Perfect', color: 'text-lime-700', bg: 'bg-lime-50' };
  if (score >= 55) return { label: 'Solid', color: 'text-primary-700', bg: 'bg-primary-50' };
  if (score >= 35) return { label: 'Gentle', color: 'text-amber-700', bg: 'bg-amber-50' };
  return { label: 'Rustle', color: 'text-rose-600', bg: 'bg-rose-50' };
}

export default function ProfilePage() {
  const { user, signOut, isDemoUser, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<PopHistoryItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    getMyStats(token)
      .then(setStats)
      .catch((e) => console.warn('Stats:', e.message))
      .finally(() => setStatsLoading(false));

    getMyPopHistory(token)
      .then((pops) => setHistory(pops.slice(0, 15))) // latest 15
      .catch((e) => console.warn('History:', e.message))
      .finally(() => setHistoryLoading(false));
  }, [token]);

  const handleSignOut = () => {
    signOut();
    router.push('/auth/signin');
  };

  const avatarLetter = user?.username?.charAt(0).toUpperCase() || 'L';

  return (
    <AppShell
      category="Account"
      title="My Profile"
      description="Your leaf popping record and personal statistics."
    >
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Profile Hero Card */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-white via-primary-50/20 to-emerald-50/30 border-primary-200/60 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center text-3xl font-black text-white shadow-soft-md">
                {avatarLetter}
              </div>
              {isDemoUser && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  DEMO
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-forest">
                  {user?.username || 'Leaf Popper'}
                </h2>
                {stats?.rank && (
                  <Pill variant="green" size="sm" icon={<Trophy size={11} />}>
                    Rank #{stats.rank}
                  </Pill>
                )}
              </div>
              <p className="text-sm text-forest-muted">{user?.email || (isDemoUser ? 'demo@leafpop.ai' : '')}</p>
              {isDemoUser && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 inline-block">
                  🌿 You are in Demo Mode — scores are live but not persisted to an account.{' '}
                  <Link href="/auth/signup" className="underline font-bold">
                    Create a free account
                  </Link>
                </div>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-xs font-bold text-forest-subtle hover:text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-full transition-colors border border-border"
              id="sign-out-btn"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Best Score',
              value: statsLoading ? '...' : `${stats?.best_score ?? 0}`,
              icon: <Star size={18} />,
              color: 'text-primary-600',
              bg: 'bg-primary-50 border-primary-200',
            },
            {
              label: 'Total Pops',
              value: statsLoading ? '...' : `${stats?.total_pops ?? 0}`,
              icon: <Leaf size={18} />,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50 border-emerald-200',
            },
            {
              label: 'Average Score',
              value: statsLoading ? '...' : `${stats?.average_score?.toFixed(1) ?? '0.0'}`,
              icon: <TrendingUp size={18} />,
              color: 'text-lime-700',
              bg: 'bg-lime-50 border-lime-200',
            },
            {
              label: 'Leaves Analyzed',
              value: statsLoading ? '...' : `${stats?.leaves_analyzed ?? 0}`,
              icon: <Sparkles size={18} />,
              color: 'text-amber-600',
              bg: 'bg-amber-50 border-amber-200',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white border rounded-3xl p-5 shadow-soft ${stat.bg}`}
            >
              <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
              <div className={`text-2xl sm:text-3xl font-black ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs font-bold text-forest-subtle mt-1 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Best Score Visual */}
        {stats?.best_score && stats.best_score > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-primary-50/80 via-white to-emerald-50/50 border-primary-200/60 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-4">
                Your Personal Best
              </p>
              <Score value={stats.best_score} size="hero" label="All-Time Best Score" />
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/app/analyzer', icon: <Leaf size={16} />, label: 'Analyze a Leaf', desc: 'Upload leaf photo' },
            { href: '/app/real-pop', icon: <Volume2 size={16} />, label: 'Real Leaf Pop', desc: 'Record your pop' },
            { href: '/app/virtual', icon: <Sparkles size={16} />, label: 'Virtual Pop', desc: 'Play the game' },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card
                hoverable
                className="flex items-center gap-4 py-4 px-5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 border border-primary-200 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                  {action.icon}
                </div>
                <div>
                  <span className="text-sm font-bold text-forest block">{action.label}</span>
                  <span className="text-xs text-forest-muted">{action.desc}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pop History */}
        <Card className="overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-forest-subtle" />
              <h3 className="text-sm font-bold text-forest">Recent Pop History</h3>
            </div>
            {history.length > 0 && (
              <span className="text-xs text-forest-subtle">Latest {history.length}</span>
            )}
          </div>

          {historyLoading && (
            <div className="py-14 text-center">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-3xl block mb-3"
              >
                🍃
              </motion.span>
              <p className="text-sm text-forest-muted">Loading your pop history...</p>
            </div>
          )}

          {!historyLoading && history.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🌿</div>
              <p className="text-sm font-bold text-forest">No pops recorded yet.</p>
              <p className="text-xs text-forest-muted mt-1 mb-5">
                Start with a real or virtual leaf pop!
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/app/real-pop">
                  <Button size="sm" variant="primary" icon={<Volume2 size={14} />}>
                    Real Pop
                  </Button>
                </Link>
                <Link href="/app/virtual">
                  <Button size="sm" variant="secondary" icon={<Sparkles size={14} />}>
                    Virtual Pop
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {!historyLoading && history.length > 0 && (
            <>
              {/* History Header Row */}
              <div className="grid grid-cols-12 px-4 sm:px-6 py-2.5 bg-surface-muted/60 border-b border-border/60 text-[10px] font-bold uppercase tracking-widest text-forest-subtle">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Score</div>
                <div className="col-span-3">Mode</div>
                <div className="col-span-4">Date</div>
              </div>

              <div className="divide-y divide-border/50">
                {history.map((pop, i) => {
                  const { label, color, bg } = getScoreLabel(pop.score);
                  return (
                    <motion.div
                      key={pop.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="grid grid-cols-12 items-center px-4 sm:px-6 py-3.5 hover:bg-surface-muted/30 transition-colors"
                    >
                      <div className="col-span-1 text-xs font-bold text-forest-subtle">{i + 1}</div>
                      <div className="col-span-4 flex items-center gap-2">
                        <span className={`text-sm font-black ${color}`}>{pop.score}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline-block ${color} ${bg}`}
                        >
                          {label}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-xs text-forest-muted font-semibold capitalize">
                          {pop.mode || 'real'}
                        </span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-xs text-forest-subtle">
                          {formatDate(pop.created_at)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
