import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { AiVsRealitySection } from '@/components/home/AiVsRealitySection';
import { LeaderboardPreview } from '@/components/home/LeaderboardPreview';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col justify-between">
      {/* Floating Pill Sticky Header */}
      <Header />

      {/* Main Landing Flow */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AiVsRealitySection />
        <LeaderboardPreview />
        <FinalCtaSection />
      </main>

      {/* Minimal Apple-nature Footer */}
      <footer className="border-t border-border/80 bg-white/70 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-subtle font-medium">
          <div className="flex items-center gap-2">
            <span className="text-base">🍃</span>
            <span className="font-bold text-forest">LeafPop AI</span>
            <span>— Hackathon Protocol Edition</span>
          </div>
          <div>
            "Because someone had to scientifically determine which leaf pops best."
          </div>
        </div>
      </footer>
    </div>
  );
}
