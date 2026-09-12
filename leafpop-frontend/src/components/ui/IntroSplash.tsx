'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playLeafPopSound } from '@/lib/audio';

interface IntroSplashProps {
  forceShow?: boolean;
  onComplete?: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ forceShow = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [useVideo, setUseVideo] = useState(true);
  const [popTriggered, setPopTriggered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show intro on initial page load / session or when forced
    const hasSeen = sessionStorage.getItem('ilapottikal_intro_seen');
    if (!hasSeen || forceShow) {
      setIsVisible(true);
      if (!forceShow) {
        sessionStorage.setItem('ilapottikal_intro_seen', 'true');
      }
    }

    // Register global trigger for "Replay Intro"
    const handleReplay = () => {
      setPopTriggered(false);
      setUseVideo(true);
      setIsVisible(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => setUseVideo(false));
          } else {
            setUseVideo(false);
          }
        });
      }
    };
    (window as any).replayIlaPottikalIntro = handleReplay;

    return () => {
      delete (window as any).replayIlaPottikalIntro;
    };
  }, [forceShow]);

  // Handle video autoplay, audio pop sound sync, and maximum safety timeout
  useEffect(() => {
    if (!isVisible) return;

    // Trigger video playback
    if (useVideo && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn('Video autoplay constrained on mobile, attempting muted retry:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => setUseVideo(false));
        } else {
          setUseVideo(false);
        }
      });
    }

    // Synchronize acoustic snap audio effect at the 4.8s crack mark in video (or 500ms for fallback)
    const popTimer = setTimeout(() => {
      setPopTriggered(true);
      playLeafPopSound(1.0);
    }, useVideo ? 4800 : 500);

    // Maximum safety timeout (10.2s max) to guarantee intro never hangs indefinitely
    const maxSafetyTimer = setTimeout(() => {
      handleComplete();
    }, useVideo ? 10200 : 3200);

    return () => {
      clearTimeout(popTimer);
      clearTimeout(maxSafetyTimer);
    };
  }, [isVisible, useVideo]);

  const handleComplete = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const handleVideoEnded = () => {
    handleComplete();
  };

  const handleVideoError = () => {
    setUseVideo(false);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.pause();
    }
    handleComplete();
  };

  const handleContainerTouch = () => {
    if (useVideo && videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="ilapottikal-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          onClick={handleContainerTouch}
          onTouchStart={handleContainerTouch}
          className="fixed inset-0 z-[9999] w-full h-[100dvh] min-h-[100vh] flex items-center justify-center bg-[#f7f8f7] overflow-hidden select-none"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[10000] px-4 py-2 rounded-full bg-forest/90 hover:bg-forest text-white text-xs font-bold shadow-lg backdrop-blur-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            <span>Skip Intro</span>
            <span>✕</span>
          </button>

          {useVideo ? (
            /* High Definition Rendered Fullscreen Intro Video Scene (Mobile & Desktop Responsive) */
            <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center bg-[#f7f8f7] overflow-hidden">
              <video
                ref={videoRef}
                src="/intro-video.mp4"
                autoPlay
                playsInline
                muted
                preload="auto"
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                className="w-full h-full object-cover min-w-full min-h-full bg-[#f7f8f7]"
              />
            </div>
          ) : (
            /* Fallback Animated Scene */
            <div className="relative flex flex-col items-center justify-center px-4 text-center">
              {popTriggered && (
                <motion.div
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 2.8, opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute w-48 h-48 rounded-full border-2 border-emerald-500/80 shadow-[0_0_40px_rgba(52,211,153,0.6)]"
                />
              )}

              {popTriggered && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const angle = (i / 14) * 360;
                    const distance = 140 + (i % 3) * 35;
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * distance;
                    const y = Math.sin(rad) * distance;
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0.6, opacity: 1, rotate: 0 }}
                        animate={{
                          x,
                          y,
                          scale: [0.6, 1.1, 0],
                          opacity: [1, 0.9, 0],
                          rotate: (i % 2 === 0 ? 1 : -1) * 360,
                        }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="absolute left-1/2 top-1/2 -ml-3 -mt-3 text-lg"
                      >
                        🍃
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <motion.div
                initial={{ scale: 0.1, rotate: -15, opacity: 0 }}
                animate={{
                  scale: popTriggered ? [0.1, 1.15, 1.0] : 0.4,
                  rotate: popTriggered ? [-15, 5, 0] : -15,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.75,
                  ease: [0.175, 0.885, 0.32, 1.275],
                }}
                className="relative mb-6 cursor-pointer group"
                onClick={() => {
                  setPopTriggered(false);
                  setTimeout(() => {
                    setPopTriggered(true);
                    playLeafPopSound(1.0);
                  }, 50);
                }}
              >
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/ilapottikal-logo.png"
                    alt="IlaPottikal Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{
                  y: popTriggered ? 0 : 20,
                  opacity: popTriggered ? 1 : 0,
                }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h1 className="text-4xl sm:text-5xl font-black text-forest tracking-tight drop-shadow-sm">
                  IlaPottikal
                </h1>
                <p className="text-xs sm:text-sm font-semibold tracking-widest text-primary-700 uppercase mt-2">
                  🍃 The Science of Popping Leaves
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
