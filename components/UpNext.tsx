'use client';

import { Track } from '@/lib/playlist';

interface UpNextProps {
  tracks: Track[];
  currentIndex: number;
}

export default function UpNext({ tracks, currentIndex }: UpNextProps) {
  const upNext = [1, 2, 3].map(offset => {
    const idx = (currentIndex + offset) % tracks.length;
    return { track: tracks[idx], idx };
  });

  return (
    <div
      className="surface-card"
      style={{ padding: '12px 16px', minWidth: '200px' }}
    >
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--accent-brass)',
          marginBottom: '10px',
        }}
      >
        Aage aane wale —
      </div>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {upNext.map(({ track, idx }, i) => (
          <li
            key={`${track.id}-${idx}`}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: 'var(--muted)',
                minWidth: '16px',
                paddingTop: '1px',
              }}
            >
              {i + 1}.
            </span>
            <div>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                }}
              >
                {track.title}
              </div>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  marginTop: '1px',
                }}
              >
                {track.artist}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
