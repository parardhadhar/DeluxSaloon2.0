'use client';

interface BarberPoleProps {
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { width: 36, height: 130, borderRadius: 18 },
  md: { width: 52, height: 170, borderRadius: 26 },
  lg: { width: 76, height: 240, borderRadius: 38 },
};

export default function BarberPole({ isPlaying, size = 'md' }: BarberPoleProps) {
  const { width, height, borderRadius } = sizes[size];

  return (
    <div
      className="barber-pole"
      style={{ width, height, borderRadius }}
      aria-label={isPlaying ? 'Now playing' : 'Paused'}
      aria-live="polite"
    >
      <div className={`barber-pole-stripes${isPlaying ? '' : ' paused'}`} />
      <div className="barber-pole-cap top" />
      <div className="barber-pole-cap bottom" />
      <div className="barber-pole-shine" />
    </div>
  );
}
