'use client';

import { useCallback, useRef } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

function formatTime(s: number): string {
  if (!isFinite(s) || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current || duration <= 0) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  return (
    <div className="w-full flex items-center gap-3">
      <span
        className="font-mono shrink-0"
        style={{ fontSize: '11px', color: 'var(--muted)', minWidth: '32px', textAlign: 'right' }}
      >
        {formatTime(currentTime)}
      </span>

      <div
        ref={trackRef}
        className="progress-bar-track"
        onClick={handleClick}
        aria-label="Seek bar"
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
      >
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        <div className="progress-bar-thumb" style={{ left: `${pct}%` }} />
      </div>

      <span
        className="font-mono shrink-0"
        style={{ fontSize: '11px', color: 'var(--muted)', minWidth: '32px' }}
      >
        {formatTime(duration)}
      </span>
    </div>
  );
}
