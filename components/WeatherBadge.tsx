'use client';

import { Region } from '@/lib/playlist';
import { WeatherInfo } from '@/lib/weather';

interface WeatherBadgeProps {
  region: Region;
  weather: WeatherInfo;
  variant?: 'header' | 'splash' | 'card';
}

export default function WeatherBadge({ region, weather, variant = 'header' }: WeatherBadgeProps) {

  if (variant === 'splash') {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '20px',
          background: 'rgba(35, 42, 32, 0.85)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span style={{ fontSize: '15px' }}>{weather.icon}</span>
        <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--accent-brass)' }}>
          {weather.condition}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--accent-poster)', fontWeight: 600 }}>
          ({weather.temp})
        </span>
        {weather.isLive && (
          <span
            title="Live Weather API"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '8px',
              color: '#4caf50',
              border: '1px solid #4caf50',
              padding: '1px 4px',
              borderRadius: '3px',
              letterSpacing: '0.05em',
            }}
          >
            LIVE
          </span>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '6px',
          background: 'rgba(35, 42, 32, 0.85)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent-brass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>{weather.icon}</span>
          <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '12px', color: 'var(--text)', fontWeight: 500 }}>
            {weather.condition}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: 'var(--accent-brass)', fontWeight: 600 }}>
            {weather.temp}
          </span>
          {weather.isLive && (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '8px',
                color: '#4caf50',
                border: '1px solid #4caf50',
                padding: '0 4px',
                borderRadius: '3px',
              }}
            >
              LIVE
            </span>
          )}
        </div>
        <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '11px', color: 'var(--muted)', fontStyle: 'italic' }}>
          "{weather.flavor}"
        </span>
      </div>
    );
  }

  // Header variant
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
        color: 'var(--text)',
        padding: '4px 10px',
        borderRadius: '12px',
        background: 'rgba(44, 52, 40, 0.9)',
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: '12px' }}>{weather.icon}</span>
      <span style={{ color: 'var(--accent-brass)', fontWeight: 500 }}>{weather.condition}</span>
      <span style={{ color: 'var(--accent-poster)', fontWeight: 600 }}>· {weather.temp}</span>
      {weather.isLive && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} title="Live weather connected" />
      )}
    </div>
  );
}
