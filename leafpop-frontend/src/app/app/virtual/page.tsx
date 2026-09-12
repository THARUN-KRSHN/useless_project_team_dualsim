'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { submitVirtualPop } from '@/lib/api';
import { VirtualPopResponse } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Pill';
import { Score } from '@/components/ui/Score';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Trophy, Zap, Target, Timer, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type GamePhase = 'ready' | 'countdown' | 'go' | 'popped' | 'result' | 'error';

interface PopParticle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  opacity: number;
}

const LEAF_COLORS = [
  '#22c55e', '#16a34a', '#4ade80', '#86efac',
  '#a3e635', '#65a30d', '#bef264',
];

export default function VirtualPopPage() {
  const { token } = useAuth();

  const [phase, setPhase] = useState<GamePhase>('ready');
  const [countdown, setCountdown] = useState(3);
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);
  const [particles, setParticles] = useState<PopParticle[]>([]);
  const [result, setResult] = useState<VirtualPopResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reactionStartTime, setReactionStartTime] = useState<number>(0);
  const [clickStartTime, setClickStartTime] = useState<number>(0);
  const [totalPops, setTotalPops] = useState(0);
  const [sessionBest, setSessionBest] = useState(0);
  const leafRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crackAudioRef = useRef<HTMLAudioElement | null>(null);

  const playCrackSound = useCallback((score: number) => {
    const safeScore = Math.max(0, Math.min(100, score));
    const volume = 0.2 + (safeScore / 100) * 0.8;

    if (!crackAudioRef.current) {
      const audio = new Audio('/pop.mp3');
      audio.preload = 'auto';
      audio.volume = volume;
      crackAudioRef.current = audio;
    }

    const audio = crackAudioRef.current;
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
      if (crackAudioRef.current) {
        crackAudioRef.current.pause();
        crackAudioRef.current.src = '';
      }
    };
  }, []);

  const startGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setClickPos(null);
    setParticles([]);
    setResult(null);
    setError(null);

    let count = 3;
    const tick = () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        setPhase('go');
        setReactionStartTime(Date.now());
        setClickStartTime(Date.now());
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  };

  const generateParticles = (x: number, y: number): PopParticle[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x,
      y,
      dx: (Math.random() - 0.5) * 180,
      dy: (Math.random() - 0.5) * 180,
      size: Math.random() * 12 + 4,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      opacity: 1,
    }));
  };

  const handleLeafClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'go') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = x / rect.width;
    const relY = y / rect.height;
    const now = Date.now();
    const reactionMs = now - reactionStartTime;
    const durationMs = now - clickStartTime;

    setClickPos({ x: relX * 100, y: relY * 100 });
    setParticles(generateParticles(x, y));

    // Velocity based on how fast they clicked (closer to center = better)
    const distFromCenter = Math.sqrt(
      Math.pow(relX - 0.5, 2) + Math.pow(relY - 0.5, 2)
    );
    const velocity = Math.max(0.1, 1 - distFromCenter * 1.5);
    const estimatedScore = Math.round(Math.max(10, Math.min(100, velocity * 100)));

    setPhase('popped');
    playCrackSound(estimatedScore);

    try {
      const res = await submitVirtualPop(
        {
          click_x: relX,
          click_y: relY,
          velocity,
          duration_ms: durationMs,
          reaction_time_ms: reactionMs,
        },
        token
      );
      setResult(res);

      if (res.score >= 70) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#4ade80', '#a3e635', '#86efac', '#bef264'],
        });
      }

      setTotalPops((p) => p + 1);
      setSessionBest((prev) => Math.max(prev, res.score));
      setPhase('result');
    } catch (err: any) {
      setError(err.message || 'Pop submission failed.');
      setPhase('error');
    }
  }, [phase, playCrackSound, token, reactionStartTime, clickStartTime]);

  const reset = () => {
    setPhase('ready');
    setClickPos(null);
    setParticles([]);
    setResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-lime-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '🔥 Legendary Pop!';
    if (score >= 75) return '⚡ Perfect Crack!';
    if (score >= 55) return '✅ Solid Pop!';
    if (score >= 35) return '🌿 Gentle Crunch';
    return '💨 Barely a Rustle';
  };

  return (
    <AppShell
      category="Phase 3"
      title="No leaf? No problem."
      description="Pop the virtual leaf. Tap at the right moment and position — the AI measures your impact and awards a real score."
    >
      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl">
        <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Session Pops
          </span>
          <span className="text-2xl font-black text-forest">{totalPops}</span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Best Score
          </span>
          <span className="text-2xl font-black text-primary-600">
            {sessionBest > 0 ? sessionBest : '--'}
          </span>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 text-center shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
            Last Score
          </span>
          <span className="text-2xl font-black text-forest">
            {result?.score ?? '--'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Card className="relative overflow-hidden p-0 min-h-[420px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/60 via-white to-lime-50/40 border-primary-200/60 select-none">

            {/* READY */}
            <AnimatePresence mode="wait">
              {phase === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-6 p-10 text-center"
                >
                  <div className="text-7xl select-none" style={{ filter: 'drop-shadow(0 8px 24px rgba(34,197,94,0.35))' }}>
                    🍃
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-forest mb-1.5">Ready to Pop?</h2>
                    <p className="text-sm text-forest-muted max-w-xs">
                      Tap the leaf when it appears. The closer to center and faster you click — the higher your score.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={startGame}
                    icon={<Zap size={18} />}
                    id="start-game-btn"
                  >
                    Start Game
                  </Button>
                </motion.div>
              )}

              {/* COUNTDOWN */}
              {phase === 'countdown' && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4 p-10"
                >
                  <p className="text-sm font-bold uppercase tracking-wider text-forest-subtle">
                    Get Ready...
                  </p>
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-8xl font-black text-primary-600"
                  >
                    {countdown}
                  </motion.div>
                </motion.div>
              )}

              {/* GO — Interactive Leaf */}
              {(phase === 'go' || phase === 'popped') && (
                <motion.div
                  key="go"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="relative flex items-center justify-center w-full h-full min-h-[320px]"
                >
                  <div
                    ref={leafRef}
                    onClick={handleLeafClick}
                    className="relative cursor-pointer group"
                    id="virtual-leaf-target"
                  >
                    {phase === 'go' && (
                      <>
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute inset-[-24px] rounded-full border-2 border-primary-400/40"
                        />

                        <motion.img
                          src="/leaf.png"
                          alt="Leaf"
                          animate={{ rotate: [-8, 8, -6], x: [-10, 10, -6], scale: [1, 1.04, 1] }}
                          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          className="relative w-[190px] h-[190px] object-contain drop-shadow-[0_18px_28px_rgba(34,197,94,0.35)]"
                        />

                        <p className="text-center text-xs font-bold text-primary-600 mt-3 uppercase tracking-wider">
                          TAP NOW!
                        </p>
                      </>
                    )}

                    {phase === 'popped' && (
                      <motion.div
                        initial={{ opacity: 0.5, scale: 0.82 }}
                        animate={{ opacity: 1, scale: 1, rotate: [0, 2, -2, 0] }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="relative"
                      >
                        <motion.img
                          src="/leaf.png"
                          alt="Leaf"
                          initial={{ opacity: 1, scale: 1, rotate: 0 }}
                          animate={{ opacity: 0, scale: 0.72, rotate: -18, x: -10 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="absolute inset-0 w-[190px] h-[190px] object-contain"
                        />

                        <motion.img
                          src="/cracked.png"
                          alt="Cracked leaf"
                          initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
                          animate={{ opacity: 1, scale: 1.08, rotate: [0, 2, -2, 0], x: [0, 4, -2, 0] }}
                          transition={{ duration: 0.38, ease: 'easeOut' }}
                          className="relative w-[190px] h-[190px] object-contain drop-shadow-[0_18px_28px_rgba(34,197,94,0.35)]"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Particles burst on pop */}
                  {phase === 'popped' && particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: p.x - 160, y: p.y - 160, opacity: 1, scale: 1 }}
                      animate={{ x: p.x + p.dx - 160, y: p.y + p.dy - 160, opacity: 0, scale: 0 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        zIndex: 10,
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* RESULT */}
              {phase === 'result' && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-5 p-8 sm:p-10 text-center w-full"
                >
                  <Pill variant="green" size="md">
                    Pop Registered ✓
                  </Pill>

                  <div>
                    <div className={`text-6xl font-black ${getScoreColor(result.score)} mb-1`}>
                      {result.score}
                      <span className="text-lg font-semibold text-forest-subtle ml-1">/100</span>
                    </div>
                    <p className="text-lg font-bold text-forest">
                      {getScoreLabel(result.score)}
                    </p>
                    <p className="text-sm text-forest-muted mt-1">{result.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                    <div className="bg-white border border-border rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-subtle block">
                        Impact
                      </span>
                      <span className="text-xl font-black text-forest">{result.impact}</span>
                    </div>
                    <div className="bg-white border border-border rounded-2xl p-3 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-forest-subtle block">
                        Pop Strength
                      </span>
                      <span className="text-xl font-black text-primary-600">
                        {(result.pop_strength || result.score || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full max-w-xs">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={startGame}
                      icon={<RotateCcw size={16} />}
                      className="flex-1"
                      id="play-again-btn"
                    >
                      Pop Again
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={reset}
                      className="flex-1"
                    >
                      Reset
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ERROR */}
              {phase === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-5 p-10 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-forest mb-1">Submission Failed</h3>
                    <p className="text-sm text-forest-muted">{error}</p>
                  </div>
                  <Button variant="primary" size="md" onClick={reset} icon={<RotateCcw size={16} />}>
                    Try Again
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        {/* Side Panel: How to Play + Tips */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-forest-subtle">
              How Scoring Works
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: <Target size={16} />,
                  label: 'Precision',
                  desc: 'Click closer to the leaf center',
                  color: 'text-emerald-600 bg-emerald-50',
                },
                {
                  icon: <Timer size={16} />,
                  label: 'Reaction Time',
                  desc: 'Faster reaction = higher multiplier',
                  color: 'text-primary-600 bg-primary-50',
                },
                {
                  icon: <Zap size={16} />,
                  label: 'Pop Strength',
                  desc: 'Combines velocity and impact force',
                  color: 'text-amber-600 bg-amber-50',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-forest block">{item.label}</span>
                    <span className="text-xs text-forest-muted">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-forest-subtle">
              Score Grades
            </h3>
            {[
              { min: 90, label: '🔥 Legendary', color: 'text-emerald-700' },
              { min: 75, label: '⚡ Perfect', color: 'text-lime-700' },
              { min: 55, label: '✅ Solid', color: 'text-primary-700' },
              { min: 35, label: '🌿 Gentle', color: 'text-amber-700' },
              { min: 0, label: '💨 Rustler', color: 'text-rose-600' },
            ].map((grade) => (
              <div key={grade.label} className="flex items-center justify-between">
                <span className={`text-sm font-bold ${grade.color}`}>{grade.label}</span>
                <span className="text-xs font-mono text-forest-subtle">{grade.min}+</span>
              </div>
            ))}
          </Card>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-primary-50/80 to-emerald-50/60 border-primary-200">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-primary-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
                    Last Result
                  </span>
                </div>
                <Score value={result.score} size="lg" label="Score" />
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
