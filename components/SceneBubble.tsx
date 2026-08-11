'use client';

import { useState, useEffect, useRef } from 'react';
import { Region } from '@/lib/playlist';

const BUBBLES: Record<Region, string[]> = {
  mumbai: [
    'बस थोडाच वेळ',
    'एकदम तकड्या गाणी',
    'आज खूप गर्दी आहे',
    'चहा आणतो भाऊ',
    'हे गाणं पुन्हा लाव',
    'मस्त हवा आहे',
  ],
  delhi: [
    'बस थोड़ा ऊपर',
    'आज भीड़ बहुत है',
    'एकदम झकास',
    'ये वाला गाना फिर लगा',
    'चाय पिलाओ भाई',
    'यार कमाल है',
  ],
  chennai: [
    'இன்னும் கொஞ்சம்',
    'இன்று நிறைய பேர்',
    'அருமையான பாடல்',
    'இதை மீண்டும் போடு',
    'டீ வேணும்',
    'சூப்பரா இருக்கு',
  ],
  kolkata: [
    'আর একটু',
    'আজ অনেক ভিড়',
    'গানটা দারুণ',
    'আবার বাজাও',
    'চা আনো ভাই',
    'অসাধারণ',
  ],
};

export default function SceneBubble({ region }: { region: Region }) {
  const [text, setText] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Immediately hide and kill previous timers on region change
    setVisible(false);
    setText('');
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    const schedule = (delayMs: number) => {
      timerRef.current = setTimeout(() => {
        const lines = BUBBLES[region];
        setText(lines[Math.floor(Math.random() * lines.length)]);
        setVisible(true);

        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          schedule(20000 + Math.random() * 20000);
        }, 5000);
      }, delayMs);
    };

    schedule(15000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [region]);

  if (!visible || !text) return null;

  return (
    <div
      className="scene-bubble-container"
      style={{
        position: 'fixed',
        top: '22%',
        right: '18%',
        zIndex: 35,
        pointerEvents: 'none',
        animation: 'bubble-in-out 5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div
        style={{
          background: 'rgba(23, 27, 22, 0.92)',
          border: '1.5px solid var(--accent-brass)',
          borderRadius: '16px',
          padding: '10px 18px',
          color: 'var(--text)',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          position: 'relative',
        }}
      >
        "{text}"
        <div
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: '24px',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid var(--accent-brass)',
          }}
        />
      </div>
    </div>
  );
}
