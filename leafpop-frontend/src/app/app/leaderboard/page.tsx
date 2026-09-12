'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardEntry } from '@/types';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, RefreshCw, Volume2, Sparkles, Layers } from 'lucide-react';

type LeaderboardMode = 'all' | 'real' | 'virtual';
type LeaderboardSource = 'all' | 'uploaded' | 'recorded';

const TABS: { label: string; value: LeaderboardMode; icon: React.ReactNode; pill: string }[] = [
  { label: 'All Time', value: 'all', icon: <Layers size={14} />, pill: 'Overall' },
  { label: 'Real Pop', value: 'real', icon: <Volume2 size={14} />, pill: 'Microphone' },
  { label: 'Virtual', value: 'virtual', icon: <Sparkles size={14} />, pill: 'Game' },
];

const REAL_SOURCE_TABS: { label: string; value: LeaderboardSource }[] = [
  { label: 'All', value: 'all' },
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Recorded', value: 'recorded' },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="w-8 h-8 rounded-full bg-surface-muted text-forest-subtle text-sm font-bold flex items-center justify-center">
      {rank}
    </span>
  );
}

function getScoreGradient(score: number) {
  if (score >= 90) return 'from-emerald-600 to-lime-500';
  if (score >= 70) return 'from-primary-600 to-emerald-500';
  if (score >= 50) return 'from-primary-500 to-sky-500';
  return 'from-amber-500 to-orange-400';
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<LeaderboardMode>('all');
  const [source, setSource] = useState<LeaderboardSource>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLeaderboard = async (m: LeaderboardMode, s: LeaderboardSource = 'all') => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(m, 25, s);
      setEntries(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(mode, mode === 'real' ? source : 'all');
  }, [mode, source]);

  const myEntry = user ? entries.find((e) => e.username === user.username) : null;

  return (
    <AppShell
      category="Competition"
      title="Who pops hardest? 🏆"
      description="Live global rankings. Every real pop and virtual crack updates your position immediately."
      action={
        <button
          onClick={() => { void fetchLeaderboard(mode, mode === 'real' ? source : 'all'); }}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold text-forest-muted hover:text-primary-600 transition-colors disabled:opacity-50"
          id="refresh-leaderboard-btn"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Refresh'}
        </button>
      }
    >
      {/* Mode Tabs */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-2 p-1 bg-surface-muted rounded-full w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setMode(tab.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                mode === tab.value
                  ? 'bg-white text-forest shadow-soft'
                  : 'text-forest-muted hover:text-forest'
              }`}
              id={`leaderboard-tab-${tab.value}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'real' && (
          <div className="flex gap-2 flex-wrap">
            {REAL_SOURCE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSource(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  source === tab.value
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-white text-forest-muted border border-border hover:text-forest'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* My Rank Banner (if found on board) */}
      <AnimatePresence>
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-200 rounded-3xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Award size={20} className="text-primary-600" />
              <span className="text-sm font-bold text-forest">
                You are ranked <span className="text-primary-600">#{myEntry.rank}</span> globally
              </span>
            </div>
            <Pill variant="green" size="sm">
              Best: {myEntry.best_score}
            </Pill>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 3 Podium (only when not loading and there are entries) */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-2xl">
          {/* 2nd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center justify-end"
          >
            <div className="w-10 h-10 rounded-full bg-surface-muted border-2 border-border flex items-center justify-center mb-2 text-lg font-bold text-forest-subtle">
              {entries[1].username.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-bold text-forest truncate max-w-full text-center">
              {entries[1].username}
            </p>
            <p className="text-sm font-black text-forest-muted mb-1">{entries[1].best_score}</p>
            <div className="w-full bg-slate-200 rounded-t-xl h-16 flex items-center justify-center">
              <span className="text-xl">🥈</span>
            </div>
          </motion.div>

          {/* 1st place — taller */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="flex flex-col items-center justify-end"
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mb-2 text-xl font-bold text-amber-700">
              {entries[0].username.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-bold text-forest truncate max-w-full text-center">
              {entries[0].username}
            </p>
            <p className="text-lg font-black text-primary-600 mb-1">{entries[0].best_score}</p>
            <div className="w-full bg-gradient-to-b from-amber-200 to-amber-100 rounded-t-xl h-24 flex items-center justify-center">
              <span className="text-2xl">🥇</span>
            </div>
          </motion.div>

          {/* 3rd place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-end"
          >
            <div className="w-10 h-10 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center mb-2 text-lg font-bold text-orange-700">
              {entries[2].username.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-bold text-forest truncate max-w-full text-center">
              {entries[2].username}
            </p>
            <p className="text-sm font-black text-forest-muted mb-1">{entries[2].best_score}</p>
            <div className="w-full bg-orange-100 rounded-t-xl h-10 flex items-center justify-center">
              <span className="text-xl">🥉</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card className="overflow-hidden p-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-4 sm:px-6 py-3 border-b border-border bg-surface-muted/60 text-[10px] font-bold uppercase tracking-widest text-forest-subtle">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-4">Popper</div>
          <div className="col-span-3 text-center">Best Score</div>
          <div className="col-span-3 sm:col-span-4 text-center">Total Pops</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 flex flex-col items-center gap-4 text-forest-muted">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-3xl block"
            >
              🍃
            </motion.span>
            <span className="text-sm font-semibold">Loading live rankings...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-16 text-center text-forest-muted">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && entries.length === 0 && (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🍃</div>
            <p className="text-sm font-bold text-forest">No pops recorded yet.</p>
            <p className="text-xs text-forest-muted mt-1">Be the first to claim the top spot!</p>
          </div>
        )}

        {/* Entries */}
        {!loading && !error && entries.length > 0 && (
          <AnimatePresence>
            <div className="divide-y divide-border/60">
              {entries.map((entry, idx) => {
                const isMe = user && entry.username === user.username;
                const isTop3 = entry.rank <= 3;

                return (
                  <motion.div
                    key={`${entry.username}-${entry.rank}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`grid grid-cols-12 items-center px-4 sm:px-6 py-3.5 transition-colors ${
                      isMe ? 'bg-primary-50/60' : 'hover:bg-surface-muted/40'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Username */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isTop3
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-primary-100 text-primary-700 border border-primary-200'
                        }`}
                      >
                        {entry.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`text-sm font-bold block truncate ${
                            isMe ? 'text-primary-700' : 'text-forest'
                          }`}
                        >
                          {entry.username}
                          {isMe && (
                            <span className="ml-1.5 text-[10px] font-bold text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-3 flex justify-center">
                      <div
                        className={`bg-gradient-to-r ${getScoreGradient(
                          entry.best_score
                        )} text-white text-sm font-black px-3 py-1 rounded-full shadow-sm`}
                      >
                        {entry.best_score}
                      </div>
                    </div>

                    {/* Total Pops / Playback */}
                    <div className="col-span-3 sm:col-span-4 text-center">
                      {entry.audio_url ? (
                        <audio controls src={entry.audio_url} className="w-full max-w-[140px] h-8 mx-auto" />
                      ) : (
                        <span className="text-sm font-semibold text-forest-muted">
                          {entry.total_pops}
                          <span className="text-xs font-normal ml-1 hidden sm:inline">pops</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </Card>

      {/* Footer Note */}
      {!loading && entries.length > 0 && (
        <p className="text-xs text-center text-forest-subtle mt-4">
          Showing top {entries.length} poppers · Updated in real-time
        </p>
      )}
    </AppShell>
  );
}
