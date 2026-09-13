'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLeaderboard } from '@/lib/api';
import { LeaderboardEntry } from '@/types';
import { Button } from '../ui/Button';
import { Trophy, ArrowRight, Volume2 } from 'lucide-react';

export const LeaderboardPreview: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard('all', 3, 'all')
      .then((data) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <section id="leaderboard" className="py-20 md:py-28 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-200/60 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Global Hall of Fame
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
          Global Leaf Pop Champions.
        </h2>
      </div>

      <div className="bg-white border border-border rounded-4xl p-6 sm:p-8 shadow-soft">
        {loading ? (
          <div className="py-12 text-center text-sm text-forest-muted">
            <span className="inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Finding the world's best poppers...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 text-center text-forest-muted">
            <Trophy size={40} className="mx-auto text-forest-subtle mb-3 opacity-40" />
            <p className="font-bold text-forest">No pops yet on the global board.</p>
            <p className="text-xs text-forest-subtle mt-1">Be the first to make some noise and claim rank #1!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, idx) => (
              <div
                key={entry.user_id ?? `${entry.username}-${idx}`}
                className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-surface-muted/60 hover:bg-surface-accent/60 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl">{medals[idx] || `#${idx + 1}`}</span>
                  <div className="min-w-0">
                    <span className="font-bold text-base text-forest block truncate">
                      {entry.username || 'Anonymous Popper'}
                    </span>
                    <span className="text-xs text-forest-subtle capitalize">
                      {entry.mode || 'real'} pop · {entry.source || 'uploaded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="text-right">
                    <span className="font-black text-2xl text-primary-700">
                      {entry.best_score}
                    </span>
                    <span className="text-xs text-forest-subtle block">pts</span>
                  </div>

                  {entry.audio_url ? (
                    <div className="flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 border border-border shadow-sm">
                      <Volume2 size={14} className="text-primary-600" />
                      <audio controls src={entry.audio_url} className="h-8 w-28 sm:w-32" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-subtle bg-white border border-border rounded-full px-2 py-1">
                      No audio
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/app/leaderboard">
            <Button variant="outline" size="md" icon={<ArrowRight size={16} />}>
              View Full Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
