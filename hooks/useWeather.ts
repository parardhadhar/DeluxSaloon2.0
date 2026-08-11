'use client';

import { useState, useEffect } from 'react';
import { Region } from '@/lib/playlist';
import { fetchLiveWeather, getFallbackWeather, WeatherInfo } from '@/lib/weather';

export function useWeather(region: Region) {
  const [weather, setWeather] = useState<WeatherInfo>(() => getFallbackWeather(region));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchLiveWeather(region).then(data => {
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [region]);

  return { weather, loading };
}
