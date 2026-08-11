'use client';

import { useState, useEffect } from 'react';

export default function TimeOfDayOverlay() {
  const [hour, setHour] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHour(new Date().getHours());
    setMounted(true);
    
    // Check time every minute
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  let gradient = 'transparent';
  let blendMode: any = 'normal';
  let opacity = 1;

  if (hour >= 6 && hour < 10) {
    // Morning: Warm, soft sunrise
    gradient = 'linear-gradient(to bottom, rgba(255, 230, 180, 0.4), rgba(255, 200, 150, 0.2))';
    blendMode = 'overlay';
    opacity = 0.6;
  } else if (hour >= 10 && hour < 17) {
    // Day: Neutral/bright, minimal tint
    gradient = 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent)';
    blendMode = 'overlay';
    opacity = 0.3;
  } else if (hour >= 17 && hour < 20) {
    // Evening: Golden hour / orange tint
    gradient = 'linear-gradient(to bottom, rgba(255, 140, 0, 0.4), rgba(200, 80, 0, 0.5))';
    blendMode = 'multiply';
    opacity = 0.5;
  } else {
    // Night (20 to 6): Cool blue/dark tint
    gradient = 'linear-gradient(to bottom, rgba(10, 20, 60, 0.6), rgba(0, 5, 20, 0.8))';
    blendMode = 'multiply';
    opacity = 0.7;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: gradient,
        mixBlendMode: blendMode,
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: 4, // Below rain, above video
        transition: 'background 2s ease, opacity 2s ease',
      }}
    />
  );
}
