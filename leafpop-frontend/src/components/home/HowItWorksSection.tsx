import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'ANALYZE',
    description: 'Snap or upload a photo of your candidate leaf. Our AI model inspects vein density, moisture, and brittleness.',
  },
  {
    num: '02',
    title: 'POP',
    description: 'Position your microphone, apply maximum thumb pressure, and make the crispest leaf crack you possibly can.',
  },
  {
    num: '03',
    title: 'SCORE',
    description: 'Our backend decodes the transient acoustic frequencies and ranks your pop against thousands worldwide.',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 max-w-6xl mx-auto bg-surface-accent/30 rounded-5xl my-12 border border-primary-100/80">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-100/60 px-3 py-1 rounded-full inline-block mb-3">
          The Scientific Protocol
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-forest tracking-tight">
          How it works.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {STEPS.map((step) => (
          <div key={step.num} className="flex flex-col items-start p-4">
            <span className="text-6xl sm:text-7xl font-black text-primary-200 tracking-tighter block mb-4">
              {step.num}
            </span>
            <h3 className="text-xl font-black text-forest tracking-tight mb-2">
              {step.title}
            </h3>
            <p className="text-forest-muted text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
