'use client';

import { useState, useEffect } from 'react';
import { Region } from '@/lib/playlist';

function getBaseCount(): number {
  const hour = new Date().getHours();
  const seeds = [24, 31, 18, 42, 37, 29, 55, 61, 44, 38, 22, 17, 26, 33, 48, 52, 41, 35, 28, 19, 23, 30, 47, 39];
  return seeds[hour % seeds.length];
}

const LISTENER_TEMPLATES: Record<Region, (count: number) => string> = {
  mumbai: count => `${count} लोक ऐकत आहेत`,
  delhi: count => `${count} लोग सुन रहे हैं`,
  chennai: count => `${count} பேர் கேட்கிறார்கள்`,
  kolkata: count => `${count} জন শুনছেন`,
};

export function useListenerCount(region: Region): string {
  const [count, setCount] = useState<number>(getBaseCount());

  useEffect(() => {
    let base = getBaseCount();
    const drift = () => {
      const delta = Math.floor(Math.random() * 3) - 1;
      base = Math.max(1, base + delta);
      setCount(base);
    };

    const interval = setInterval(drift, 8000 + Math.random() * 7000);
    return () => clearInterval(interval);
  }, [region]);

  const template = LISTENER_TEMPLATES[region] || LISTENER_TEMPLATES.mumbai;
  return template(count);
}
