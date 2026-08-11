'use client';

import { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  size: number;
}

const EMOJIS = ['✂️', '💈', '🪒', '💇', '🎶', '✂️', '💈', '🪒'];

export default function EasterEggConfetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: -40 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 5 + 3,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      size: 24 + Math.random() * 20,
    }));

    let animId: number;
    let elapsed = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed += 16;
      const fade = Math.max(0, 1 - elapsed / 3500);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.rotation += p.rotationSpeed;
        p.opacity = fade;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillText(p.emoji, -p.size / 2, p.size / 2);
        ctx.restore();
      }

      if (elapsed < 4000) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        display: active ? 'block' : 'none',
      }}
    />
  );
}
