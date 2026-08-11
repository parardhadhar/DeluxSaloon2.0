'use client';

import { useEffect, useRef } from 'react';

interface RainOverlayProps {
  isRaining: boolean;
}

export default function RainOverlay({ isRaining }: RainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isRaining) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: { x: number; y: number; length: number; speed: number; opacity: number; width: number }[] = [];
    const particleCount = 380;

    for (let i = 0; i < particleCount; i++) {
      // 55% of particles concentrated in the left/doorway area (0 - 45% width) where outside street is visible
      const isDoorway = Math.random() < 0.55;
      const x = isDoorway ? Math.random() * (width * 0.45) : Math.random() * width;

      particles.push({
        x,
        y: Math.random() * height,
        length: Math.random() * 28 + 14,
        speed: Math.random() * 18 + 12,
        opacity: isDoorway ? Math.random() * 0.5 + 0.35 : Math.random() * 0.4 + 0.25,
        width: Math.random() * 0.8 + 1.0,
      });
    }

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        ctx.lineWidth = p.width;
        ctx.strokeStyle = `rgba(220, 240, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length * 0.12, p.y + p.length); // realistic wind angle
        ctx.stroke();

        p.y += p.speed;
        p.x += p.speed * 0.12;

        if (p.y > height) {
          p.y = -30;
          const isDoorway = Math.random() < 0.55;
          p.x = isDoorway ? Math.random() * (width * 0.45) : Math.random() * width;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isRaining]);

  if (!isRaining) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
        mixBlendMode: 'screen', // Blends naturally into the video lighting
        opacity: 0.92,
      }}
    />
  );
}
