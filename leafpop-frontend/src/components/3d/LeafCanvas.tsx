'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { LeafModel } from './LeafModel';

interface LeafCanvasProps {
  scale?: number;
  interactive?: boolean;
  popping?: boolean;
  onClick?: (e?: any) => void;
  className?: string;
}

export const LeafCanvas: React.FC<LeafCanvasProps> = ({
  scale = 1.0,
  interactive = true,
  popping = false,
  onClick,
  className = 'w-full h-full min-h-[300px]',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-24 h-24 rounded-full bg-primary-100/60 animate-pulse-slow flex items-center justify-center text-4xl">
          🍃
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
        <directionalLight position={[-4, -3, -2]} intensity={0.4} color="#86efac" />
        <pointLight position={[0, 0, 3]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <LeafModel
            scale={scale}
            interactive={interactive}
            popping={popping}
            onClick={onClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
