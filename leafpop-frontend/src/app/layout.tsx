import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FallingLeaves } from '@/components/ui/FallingLeaves';
import { IntroSplash } from '@/components/ui/IntroSplash';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'IlaPottikal — The Science of Popping Leaves',
  description: 'Because someone had to scientifically determine which leaf pops best. AI Analyzer, Audio Acoustics, and Virtual Pop Game.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍃</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen selection:bg-primary-200 selection:text-forest relative overflow-x-hidden`}>
        <IntroSplash />
        <FallingLeaves />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
