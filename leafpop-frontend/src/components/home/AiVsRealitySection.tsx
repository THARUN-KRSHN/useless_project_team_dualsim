'use client';

import React, { useState } from 'react';
import { Pill } from '../ui/Pill';
import { ArrowDown, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const AiVsRealitySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-16">
        <Pill variant="green" size="md" className="mb-3">
          AI vs. Acoustic Reality
        </Pill>
        <h2 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
          Prediction vs. The Crack.
        </h2>
        <p className="text-forest-muted text-base mt-2">
          Did the AI estimate your leaf accurately, or did your thumb deliver an unexpectedly explosive pop?
        </p>
      </div>

      <div className="bg-white border border-border rounded-4xl p-6 sm:p-12 shadow-soft-md max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center">
          {/* Predicted */}
          <div className="bg-surface-muted/70 rounded-3xl p-6 border border-border/60">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-subtle block mb-1">
              AI Prediction
            </span>
            <div className="text-5xl font-black text-forest">84</div>
            <span className="text-xs font-semibold text-primary-700 bg-primary-100/60 px-2.5 py-0.5 rounded-full inline-block mt-2">
              High Potential
            </span>
          </div>

          {/* Transition arrow / action */}
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-pill animate-bounce">
              <ArrowDown size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-700">
              User Pops It!
            </span>
          </div>

          {/* Actual Pop Result */}
          <div className="bg-primary-50 rounded-3xl p-6 border border-primary-200/80">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-800 block mb-1">
              Actual Audio Pop
            </span>
            <div className="text-5xl font-black text-primary-700">94</div>
            <span className="text-xs font-semibold text-white bg-primary-600 px-2.5 py-0.5 rounded-full inline-block mt-2">
              Verified Crack
            </span>
          </div>
        </div>

        {/* Storytelling outcome card */}
        <div className="mt-8 bg-surface-muted/50 rounded-2xl p-5 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="text-sm font-bold text-forest block">
                AI underestimated this leaf by +10 points!
              </span>
              <span className="text-xs text-forest-muted">
                Acoustic transient sharpness exceeded computer vision predictions.
              </span>
            </div>
          </div>
          <div className="text-xs font-mono font-bold text-primary-700 bg-white border border-primary-200 px-3 py-1 rounded-full shadow-sm">
            Error: 11.9%
          </div>
        </div>
      </div>
    </section>
  );
};
