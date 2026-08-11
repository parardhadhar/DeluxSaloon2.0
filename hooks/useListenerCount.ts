'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Region } from '@/lib/playlist';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const LISTENER_TEMPLATES: Record<Region, (count: number) => string> = {
  mumbai: count => `${count} लोक ऐकत आहेत`,
  delhi: count => `${count} लोग सुन रहे हैं`,
  chennai: count => `${count} பேர் கேட்கிறார்கள்`,
  kolkata: count => `${count} জন শুনছেন`,
};

function getFallbackCount(): number {
  const hour = new Date().getHours();
  const seeds = [14, 21, 18, 22, 17, 19, 25, 31, 24, 28, 15, 12, 16, 23, 28, 32, 21, 15, 18, 14, 13, 20, 27, 19];
  return seeds[hour % seeds.length];
}

export function useListenerCount(region: Region): string {
  const [realCount, setRealCount] = useState<number | null>(null);
  const [fallbackCount, setFallbackCount] = useState<number>(getFallbackCount());

  // ── Realtime Supabase Presence Counter ──
  useEffect(() => {
    if (!supabase) {
      const interval = setInterval(() => {
        const delta = Math.floor(Math.random() * 3) - 1;
        setFallbackCount(prev => Math.max(1, prev + delta));
      }, 9000);
      return () => clearInterval(interval);
    }

    const myPresenceId = `presence-${Math.random().toString(36).substr(2, 6)}`;
    const channel = supabase.channel('saloon-presence-global', {
      config: { presence: { key: myPresenceId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        let activeCount = 0;
        Object.values(state).forEach(presences => {
          activeCount += presences.length;
        });
        setRealCount(Math.max(1, activeCount));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ region, onlineAt: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [region]);

  const activeCount = realCount !== null ? realCount : fallbackCount;
  const template = LISTENER_TEMPLATES[region] || LISTENER_TEMPLATES.mumbai;
  return template(activeCount);
}
