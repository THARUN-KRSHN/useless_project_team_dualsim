'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Pill } from '../ui/Pill';
import { LeafCanvas } from '../3d/LeafCanvas';
import { Sparkles, ArrowRight, Volume2, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const [leafPopping, setLeafPopping] = useState(false);

  const handleHeroLeafClick = () => {
    setLeafPopping(true);
    setTimeout(() => setLeafPopping(false), 600);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Copy & CTA */}
        <div className="lg:col-span-7 text-center lg:text-left">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Pill variant="green" size="md" className="mb-6 shadow-sm">
              <Sparkles size={12} className="text-primary-600 animate-pulse-slow" />
              THE WORLD'S MOST UNNECESSARY AI GAME
            </Pill>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-forest tracking-tight leading-[1.05] mb-6"
          >
            How hard can <br className="hidden sm:inline" />
            you <span className="text-primary-600 relative inline-block">
              pop a leaf?
              <svg
                className="absolute -bottom-2 left-0 w-full text-lime-accent/50 -z-10"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path d="M0,12 Q50,22 100,10" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-forest-muted max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-normal"
          >
            Analyze it. Pop it. Measure the crack. Compete for the loudest leaf on the global leaderboard.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link href="/app/analyzer">
              <Button size="lg" variant="primary" icon={<Sparkles size={18} />}>
                Analyze a Leaf
              </Button>
            </Link>
            <Link href="/app/real-pop">
              <Button size="lg" variant="outline" icon={<Volume2 size={18} />}>
                Pop a Leaf
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof / Fun Stat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-xs text-forest-subtle font-medium"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
              <span>Real-time Audio Acoustics</span>
            </div>
            <span>•</span>
            <div>99.4% Pop Verification Accuracy</div>
          </motion.div>
        </div>

        {/* Right 3D Leaf Canvas with Orbiting Badges */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-[380px] h-[380px] sm:h-[440px] flex items-center justify-center">
            {/* Background glowing organic circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary-100/70 via-surface-accent to-lime-50 blur-2xl -z-10" />

            {/* 3D Leaf Canvas */}
            <LeafCanvas
              scale={1.25}
              popping={leafPopping}
              onClick={handleHeroLeafClick}
              className="w-full h-full cursor-pointer"
            />

            {/* Floating Pill: AI Prediction */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -left-4 sm:left-0 z-20"
            >
              <Pill variant="dark" size="md" icon={<Zap size={14} className="text-lime-accent" />}>
                AI Potential: 84/100
              </Pill>
            </motion.div>

            {/* Floating Pill: Pop Score */}
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute bottom-6 -right-2 sm:right-2 z-20"
            >
              <Pill variant="green" size="md" icon={<Volume2 size={14} className="text-primary-700" />}>
                Crack: 94.2 dB
              </Pill>
            </motion.div>

            {/* Floating Pill: Global Champion */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 left-6 z-20"
            >
              <Pill variant="amber" size="sm" icon={<Award size={13} className="text-amber-600" />}>
                Global #1 Record: 99.8
              </Pill>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
