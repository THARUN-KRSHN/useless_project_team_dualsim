'use client';

import React, { useEffect, useState } from 'react';

interface LeafParticle {
  id: number;
  left: number; // percentage 0-100
  size: number; // in pixels
  duration: number; // seconds
  delay: number; // seconds
  swayDuration: number; // seconds
  color: string;
  opacity: number;
  rotateDir: number; // 1 or -1
  leafType: number; // 0, 1, or 2 for shape variety
}

const LEAF_COLORS = [
  '#22c55e', // emerald green
  '#16a34a', // forest green
  '#86efac', // light green
  '#a3e635', // lime green
  '#65a30d', // olive green
  '#f59e0b', // autumn amber
  '#bef264', // soft lime
];

export const FallingLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeafParticle[]>([]);

  useEffect(() => {
    // Generate 28 distributed falling leaves across full screen width
    const particleCount = 28;
    const generated: LeafParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.floor(Math.random() * 16) + 14, // 14px to 30px
      duration: Math.random() * 8 + 8, // 8s to 16s
      delay: Math.random() * 8, // 0s to 8s
      swayDuration: Math.random() * 3 + 2.5, // 2.5s to 5.5s
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      opacity: Math.random() * 0.45 + 0.35, // 0.35 to 0.80
      rotateDir: Math.random() > 0.5 ? 1 : -1,
      leafType: Math.floor(Math.random() * 3),
    }));

    setLeaves(generated);
  }, []);

  if (leaves.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-30 select-none"
      aria-hidden="true"
    >
      <style jsx global>{`
        @keyframes fallLeaf {
          0% {
            transform: translateY(-50px) rotate(0deg) rotateY(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--leaf-opacity);
          }
          90% {
            opacity: var(--leaf-opacity);
          }
          100% {
            transform: translateY(108vh) rotate(calc(var(--leaf-rotate-dir) * 360deg)) rotateY(180deg);
            opacity: 0;
          }
        }

        @keyframes swayLeaf {
          0%, 100% {
            margin-left: 0px;
          }
          50% {
            margin-left: 45px;
          }
        }

        .falling-leaf {
          position: absolute;
          top: 0;
          will-change: transform, opacity;
          animation-name: fallLeaf;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .falling-leaf-inner {
          animation-name: swayLeaf;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
        }
      `}</style>

      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="falling-leaf"
          style={
            {
              left: `${leaf.left}%`,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`,
              '--leaf-opacity': leaf.opacity,
              '--leaf-rotate-dir': leaf.rotateDir,
            } as React.CSSProperties
          }
        >
          <div
            className="falling-leaf-inner"
            style={{
              animationDuration: `${leaf.swayDuration}s`,
            }}
          >
            {leaf.leafType === 0 && (
              /* Oval Leaf */
              <svg
                width={leaf.size}
                height={leaf.size * 1.4}
                viewBox="0 0 24 34"
                fill="none"
                style={{ color: leaf.color, opacity: leaf.opacity }}
              >
                <path
                  d="M12 2C12 2 22 10 22 20C22 26.6274 17.5228 30 12 30C6.47715 30 2 26.6274 2 20C2 10 12 2 12 2Z"
                  fill="currentColor"
                />
                <path
                  d="M12 2V32M12 12L17 8M12 18L18 14M12 24L16 21M12 12L7 8M12 18L6 14M12 24L8 21"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {leaf.leafType === 1 && (
              /* Maple-style Serrated Leaf */
              <svg
                width={leaf.size * 1.2}
                height={leaf.size * 1.2}
                viewBox="0 0 30 30"
                fill="none"
                style={{ color: leaf.color, opacity: leaf.opacity }}
              >
                <path
                  d="M15 2L18 9L25 6L22 13L28 17L21 19L23 26L16 22L15 29L14 22L7 26L9 19L2 17L8 13L5 6L12 9L15 2Z"
                  fill="currentColor"
                />
                <path
                  d="M15 2V29M15 11L21 8M15 16L24 14M15 11L9 8M15 16L6 14"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {leaf.leafType === 2 && (
              /* Gingko / Fan-style Leaf */
              <svg
                width={leaf.size * 1.1}
                height={leaf.size * 1.3}
                viewBox="0 0 26 32"
                fill="none"
                style={{ color: leaf.color, opacity: leaf.opacity }}
              >
                <path
                  d="M13 28C13 28 2 20 2 12C2 5 7 2 13 4C19 2 24 5 24 12C24 20 13 28 13 28Z"
                  fill="currentColor"
                />
                <path
                  d="M13 28V4M13 14L19 9M13 20L21 15M13 14L7 9M13 20L5 15"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
