'use client';

import { Track } from '@/lib/playlist';

interface NowPlayingTickerProps {
  history: Track[];
  prefix?: string;
  fontClass?: string;
}

export default function NowPlayingTicker({ history, prefix = 'ab tak baja:', fontClass = '' }: NowPlayingTickerProps) {
  if (history.length === 0) return null;

  const items = [...history, ...history];

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'rgba(35, 42, 32, 0.9)',
        backdropFilter: 'blur(8px)',
        paddingTop: '8px',
        paddingBottom: '8px',
      }}
    >
      <div className="ticker-track" style={{ paddingLeft: '20px' }}>
        {items.map((track, i) => (
          <span
            key={`${track.id}-${i}`}
            className="chalk-item"
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '4px',
              marginRight: '48px',
              fontFamily: 'Work Sans, sans-serif',
              fontSize: '12px',
            }}
          >
            {i === 0 && (
              <span
                className={fontClass}
                style={{
                  fontSize: '11px',
                  color: 'var(--accent-brass)',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                  marginRight: '8px',
                }}
              >
                {prefix}
              </span>
            )}
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{track.title}</span>
            <span style={{ color: 'var(--muted)', fontSize: '11px' }}>·</span>
            <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{track.artist}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
