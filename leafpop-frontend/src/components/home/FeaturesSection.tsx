'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: Leaf,
    title: 'AI Leaf Analyzer',
    description: 'Upload a leaf and let our computer vision model inspect veins, dryness, and geometry to predict its pop potential.',
    href: '/app/analyzer',
    accentColor: 'from-emerald-500 to-green-600',
    tag: 'Computer Vision',
  },
  {
    icon: Volume2,
    title: 'Real Leaf Pop',
    description: 'Record your actual pop via microphone or audio file. Our backend measures acoustic sharpness, loudness, and impact.',
    href: '/app/real-pop',
    accentColor: 'from-green-600 to-lime-600',
    tag: 'Audio Acoustics',
  },
  {
    icon: Sparkles,
    title: 'Virtual Leaf Game',
    description: 'No physical leaf within reach? Pop our interactive 3D digital leaf. Tap timing and velocity determine your score.',
    href: '/app/virtual',
    accentColor: 'from-lime-500 to-emerald-500',
    tag: '3D Physics',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 border border-primary-200/60 px-3.5 py-1.5 rounded-full inline-block mb-3">
          The Scientific Suite
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
          Three ways to crack a leaf.
        </h2>
        <p className="text-forest-muted text-base sm:text-lg mt-3">
          Designed with serious engineering for a delightfully absurd objective.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href} className="group">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="h-full bg-white border border-border rounded-3xl p-8 shadow-soft transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-soft-md group-hover:border-primary-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-200/50 flex items-center justify-center text-primary-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                      <Icon size={26} />
                    </div>
                    <span className="text-xs font-bold text-forest-subtle bg-surface-muted px-2.5 py-1 rounded-full">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-forest mb-2.5 tracking-tight group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-forest-muted text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-border/50 flex items-center gap-2 text-sm font-bold text-primary-700">
                  <span>Explore Experience</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
