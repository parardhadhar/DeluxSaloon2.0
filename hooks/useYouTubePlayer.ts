'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Track, playlist, Region, getNextIndex, getPrevIndex } from '@/lib/playlist';

declare namespace YT {
  class Player {
    constructor(elementId: string | HTMLElement, options: any);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getDuration(): number;
    getCurrentTime(): number;
    loadVideoById(id: string): void;
    cueVideoById(id: string): void;
    destroy(): void;
  }
  interface OnStateChangeEvent {
    data: number;
  }
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type PlayerState = 'unstarted' | 'playing' | 'paused' | 'ended' | 'buffering';

export interface UseYouTubePlayerReturn {
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  currentTrack: Track | null;
  currentIndex: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekTo: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number) => void;
  isReady: boolean;
}

interface UseYouTubePlayerOptions {
  region: Region;
  playlists?: Record<Region, Track[]>;
  enabled?: boolean;  // false = don't init player (shutter still closed)
  onTrackEnd?: (track: Track) => void;
  onTrackStart?: (track: Track) => void;
  containerId?: string;
}

export function useYouTubePlayer({
  region,
  playlists = playlist,
  enabled = true,
  onTrackEnd,
  onTrackStart,
  containerId = 'yt-hidden-player',
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>('unstarted');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentRegionRef = useRef<Region>(region);
  const playlistsRef = useRef<Record<Region, Track[]>>(playlists);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep refs in sync
  useEffect(() => { currentRegionRef.current = region; }, [region]);
  useEffect(() => { playlistsRef.current = playlists; }, [playlists]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const tracks = (playlists ?? playlist)[region];
  const currentTrack = tracks[currentIndex] ?? null;

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const ct = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;
          setCurrentTime(ct);
          setDuration(dur);
        } catch { /* player not yet ready */ }
      }
    }, 250);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Load YT API script once — only when enabled
  useEffect(() => {
    if (!enabled) return; // Shutter not yet opened
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = initPlayer;

    return () => {
      stopPolling();
      window.onYouTubeIframeAPIReady = () => {};
      try {
        playerRef.current?.destroy();
      } catch {}
      const container = document.getElementById(containerId);
      if (container && container.parentNode) {
        try {
          container.parentNode.removeChild(container);
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  function initPlayer() {
    // Dynamically manage container element outside React DOM tree
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);
    }

    playerRef.current = new window.YT.Player(containerId, {
      width: 200,
      height: 200,
      videoId: playlistsRef.current[currentRegionRef.current][0].id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          setIsReady(true);
          setDuration(playerRef.current?.getDuration() || 0);
          if (onTrackStart) {
            onTrackStart(playlistsRef.current[currentRegionRef.current][currentIndexRef.current]);
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          const stateMap: Record<number, PlayerState> = {
            [-1]: 'unstarted',
            [0]:  'ended',
            [1]:  'playing',
            [2]:  'paused',
            [3]:  'buffering',
          };
          const newState = stateMap[event.data] ?? 'unstarted';
          setPlayerState(newState);

          if (newState === 'playing') {
            startPolling();
          } else {
            stopPolling();
          }

          if (event.data === 0) {
            // Track ended — auto advance
            const tracks = playlistsRef.current[currentRegionRef.current];
            const prevTrack = tracks[currentIndexRef.current];
            if (onTrackEnd) onTrackEnd(prevTrack);
            const nextIdx = getNextIndex(currentIndexRef.current, tracks.length);
            currentIndexRef.current = nextIdx;
            setCurrentIndex(nextIdx);
            setCurrentTime(0);
            playerRef.current?.loadVideoById(tracks[nextIdx].id);
            if (onTrackStart) onTrackStart(tracks[nextIdx]);
          }
        },
        onError: (event: { data: number }) => {
          console.warn('YouTube Player Error:', event.data, 'Auto-skipping to next playable track...');
          const tracks = playlistsRef.current[currentRegionRef.current];
          const nextIdx = getNextIndex(currentIndexRef.current, tracks.length);
          currentIndexRef.current = nextIdx;
          setCurrentIndex(nextIdx);
          setCurrentTime(0);
          playerRef.current?.loadVideoById(tracks[nextIdx].id);
          if (onTrackStart) onTrackStart(tracks[nextIdx]);
        },
      },
    });
  }

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (playerState === 'playing') {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.playVideo();
    }
  }, [playerState]);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true);
  }, []);

  const setTrack = useCallback((index: number) => {
    const tracks = playlistsRef.current[currentRegionRef.current];
    if (index < 0 || index >= tracks.length) return;
    currentIndexRef.current = index;
    setCurrentIndex(index);
    setCurrentTime(0);
    playerRef.current?.loadVideoById(tracks[index].id);
    if (onTrackStart) onTrackStart(tracks[index]);
  }, [onTrackStart]);

  const nextTrack = useCallback(() => {
    const tracks = playlistsRef.current[currentRegionRef.current];
    const next = getNextIndex(currentIndexRef.current, tracks.length);
    const prevTrack = tracks[currentIndexRef.current];
    if (onTrackEnd) onTrackEnd(prevTrack);
    setTrack(next);
  }, [setTrack, onTrackEnd]);

  const prevTrack = useCallback(() => {
    const tracks = playlistsRef.current[currentRegionRef.current];
    const prev = getPrevIndex(currentIndexRef.current, tracks.length);
    setTrack(prev);
  }, [setTrack]);

  // When region changes — switch to first track of new region
  useEffect(() => {
    if (!isReady) return;
    const tracks = playlistsRef.current[region];
    const firstTrack = tracks[0];
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setCurrentTime(0);
    playerRef.current?.loadVideoById(firstTrack.id);
    if (onTrackStart) onTrackStart(firstTrack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, isReady]);

  return {
    playerState,
    currentTime,
    duration,
    currentTrack,
    currentIndex,
    play,
    pause,
    togglePlay,
    seekTo,
    nextTrack,
    prevTrack,
    setTrack,
    isReady,
  };
}
