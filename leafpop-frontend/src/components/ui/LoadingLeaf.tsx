'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingLeafProps {
  messages?: string[];
  subtext?: string;
}

const DEFAULT_MESSAGES = [
  'Inspecting the leaf...',
  'Reading its shape & texture...',
  'Tracing primary veins...',
  'Estimating moisture and tension...',
  'Predicting the crack...',
];

export const LoadingLeaf: React.FC<LoadingLeafProps> = ({
  messages = DEFAULT_MESSAGES,
  subtext = 'Science is in progress',
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      {/* 3D-feeling Framer Motion Leaf */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-6">
        {/* Soft pulsing halo */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-primary-100 blur-xl"
        />

        {/* Orbiting scan line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-1 rounded-full border-2 border-dashed border-primary-300/80"
        />

        {/* Floating green leaf */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            rotate: [-4, 6, -4],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-16 h-16 bg-gradient-to-tr from-primary-600 to-lime-accent rounded-[32px_4px_32px_4px] shadow-float flex items-center justify-center"
        >
          {/* Internal leaf vein curve */}
          <svg
            className="w-10 h-10 text-white/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M2 22 C12 12, 12 12, 22 2" />
            <path d="M9 15 C13 14, 15 12, 17 9" />
            <path d="M7 17 C6 13, 8 11, 11 7" />
          </svg>
        </motion.div>
      </div>

      {/* Dynamic Animated Text */}
      <div className="h-8 mb-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-base md:text-lg font-bold text-forest tracking-tight"
          >
            {messages[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-forest-subtle font-medium">{subtext}</p>
    </div>
  );
};
