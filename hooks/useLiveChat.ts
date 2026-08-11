'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Region } from '@/lib/playlist';

export interface ChatMessage {
  id: string;
  sender: string;
  region: Region;
  text: string;
  timestamp: string;
  isSelf?: boolean;
}

const HANDLES: Record<Region, string[]> = {
  mumbai: ['Bambaiwaala', 'Chai Lover', 'Marine Drive Fan', 'Radio Listener', 'Grahak', 'Dukaan Regular'],
  delhi: ['Dilliwaala', 'Purani Delhi', 'Winter Chiller', 'Radio Buff', 'Saloon VIP', 'CP Wanderer'],
  chennai: ['Chennai Machan', 'Filter Kapi', 'Kollywood Music', 'Marina Fan', 'Saloon Friend', 'Isai Lover'],
  kolkata: ['Kolkata Dada', 'Chai Adda', 'Tram Traveller', 'Babu', 'Sangeet Premi', 'Saloon Regular'],
};

function getAnonymousHandle(region: Region): string {
  if (typeof window === 'undefined') return 'Radio Fan #01';
  let stored = sessionStorage.getItem(`saloon-anonymous-handle-${region}`);
  if (!stored) {
    const list = HANDLES[region] || HANDLES.mumbai;
    const prefix = list[Math.floor(Math.random() * list.length)];
    const num = Math.floor(10 + Math.random() * 90);
    stored = `${prefix} #${num}`;
    sessionStorage.setItem(`saloon-anonymous-handle-${region}`, stored);
  }
  return stored;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: 'init-1', sender: 'Bambaiwaala #42', region: 'mumbai', text: 'Chai ke saath ye wala gaana mast lag raha hai! ☕', timestamp: '12:01 PM' },
  { id: 'init-2', sender: 'Dilliwaala #18', region: 'delhi', text: 'Delhi mein thand aur ye retro vibes 🔥', timestamp: '12:03 PM' },
  { id: 'init-3', sender: 'Kolkata Dada #07', region: 'kolkata', text: 'Ekbaar abar bajao dada 🎵', timestamp: '12:04 PM' },
  { id: 'init-4', sender: 'Chennai Machan #99', region: 'chennai', text: 'Semma song brother! 💈', timestamp: '12:05 PM' },
];

// Supabase Realtime client (optional zero-config live backend across all devices)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function useLiveChat(currentRegion: Region) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_MESSAGES;
    try {
      const saved = localStorage.getItem('deluxe-saloon-chat-messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MESSAGES;
  });

  const [handle, setHandle] = useState<string>('Radio Fan #01');
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  useEffect(() => {
    setHandle(getAnonymousHandle(currentRegion));
  }, [currentRegion]);

  useEffect(() => {
    try {
      localStorage.setItem('deluxe-saloon-chat-messages', JSON.stringify(messages.slice(-50)));
    } catch {}
  }, [messages]);

  // ── Setup Realtime Backend (Supabase Broadcast + Local BroadcastChannel) ──
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Browser Tab-to-Tab BroadcastChannel
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel('deluxe-saloon-chat-channel');
      broadcastChannelRef.current = bc;
      bc.onmessage = (event: MessageEvent<ChatMessage>) => {
        if (event.data && event.data.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === event.data.id)) return prev;
            return [...prev, event.data].slice(-50);
          });
        }
      };
    }

    // 2. Supabase Realtime Broadcast across different devices over Internet
    if (supabase) {
      const channel = supabase.channel('saloon-live-room');
      supabaseChannelRef.current = channel;

      channel.on('broadcast', { event: 'new_chat_msg' }, ({ payload }: { payload: ChatMessage }) => {
        if (payload && payload.id) {
          setMessages(prev => {
            if (prev.some(m => m.id === payload.id)) return prev;
            return [...prev, { ...payload, isSelf: false }].slice(-50);
          });
        }
      }).subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    return () => {
      broadcastChannelRef.current?.close();
    };
  }, []);

  const sendMessage = useCallback((text: string, regionOverride?: Region) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender: handle,
      region: regionOverride || currentRegion,
      text: trimmed,
      timestamp: timeStr,
      isSelf: true,
    };

    setMessages(prev => [...prev, newMsg].slice(-50));

    // Send to local browser tabs
    try {
      broadcastChannelRef.current?.postMessage(newMsg);
    } catch {}

    // Send to Supabase Realtime backend for internet users
    if (supabaseChannelRef.current) {
      try {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'new_chat_msg',
          payload: newMsg,
        });
      } catch {}
    }
  }, [handle, currentRegion]);

  return {
    messages,
    handle,
    sendMessage,
    isRealtimeConnected: !!supabase,
  };
}
