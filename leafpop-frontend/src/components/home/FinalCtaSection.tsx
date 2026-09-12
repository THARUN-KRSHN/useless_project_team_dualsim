import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Zap } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="relative py-24 px-4 sm:px-6 max-w-5xl mx-auto my-12 text-center overflow-hidden">
      <div className="relative bg-gradient-to-b from-primary-900 to-forest rounded-5xl p-10 sm:p-16 text-white shadow-soft-lg overflow-hidden">
        {/* Subtle decorative leaf silhouette */}
        <div className="absolute -right-12 -bottom-12 text-white/5 text-9xl select-none pointer-events-none text-[220px]">
          🍃
        </div>
        <div className="absolute -left-12 -top-12 text-white/5 text-9xl select-none pointer-events-none text-[180px]">
          🍃
        </div>

        <div className="relative z-10 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-lime-bright bg-white/10 px-3.5 py-1.5 rounded-full inline-block mb-4">
            Join The Pop Protocol
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 text-white">
            Think your leaf has what it takes?
          </h2>
          <p className="text-emerald-100/80 text-base sm:text-lg mb-8 leading-relaxed">
            Snap your candidate. Record the crack. Claim your rightful place among acoustic champions.
          </p>

          <Link href="/app">
            <Button
              size="xl"
              variant="primary"
              className="bg-lime-accent text-forest hover:bg-lime-bright shadow-float font-black tracking-wide"
              icon={<Zap size={20} className="fill-current" />}
            >
              POP IT NOW
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
