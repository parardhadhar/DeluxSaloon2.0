'use client';

import { useState, useRef, useEffect } from 'react';
import { Region, REGIONS } from '@/lib/playlist';
import { useLiveChat } from '@/hooks/useLiveChat';

interface SaloonChatProps {
  currentRegion: Region;
  listenerCount: string;
}

const EMOJI_BAR = ['☕', '💈', '🎵', '🔥', '❤️', '✂️', '👏'];

export default function SaloonChat({ currentRegion, listenerCount }: SaloonChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<Region | 'all'>('all');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, handle, sendMessage, isRealtimeConnected } = useLiveChat(currentRegion);

  const filteredMessages = messages.filter(
    m => selectedFilter === 'all' || m.region === selectedFilter
  );

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages.length, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleEmojiClick = (emoji: string) => {
    sendMessage(emoji);
  };

  return (
    <>
      {/* ── Floating Chat Button (Bottom Right) ── */}
      {!isOpen && (
        <button
          id="saloon-live-chat-toggle"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(23, 27, 22, 0.96)',
            border: '2px solid var(--accent-brass)',
            borderRadius: '30px',
            padding: '12px 22px',
            color: 'var(--accent-brass)',
            fontFamily: 'Work Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 8px 32px rgba(0,0,0,0.85), 0 0 20px rgba(201,162,39,0.4)',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08) translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.9), 0 0 28px rgba(201,162,39,0.6)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1) translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.85), 0 0 20px rgba(201,162,39,0.4)';
          }}
        >
          <span style={{ fontSize: '18px' }}>💬</span>
          <span>Live Chat</span>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: '#4caf50',
              boxShadow: '0 0 10px #4caf50',
              display: 'inline-block',
              marginLeft: '2px',
            }}
          />
        </button>
      )}

      {/* ── Slide-out Chat Window ── */}
      {isOpen && (
        <div
          className="saloon-chat-window"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            width: 'clamp(300px, 90vw, 360px)',
            height: 'clamp(400px, 75vh, 520px)',
            background: 'rgba(20, 24, 19, 0.96)',
            border: '2px solid var(--accent-brass)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 28px rgba(201,162,39,0.3)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(30, 36, 28, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'Work Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--accent-brass)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>💬 Saloon Radio Chat</span>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#4caf50',
                    boxShadow: '0 0 6px #4caf50',
                    display: 'inline-block',
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: 'var(--muted)',
                  marginTop: '2px',
                }}
              >
                {isRealtimeConnected ? '⚡ Supabase Live Realtime' : listenerCount} · Anonymous Chat
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* User Handle Badge */}
          <div
            style={{
              padding: '6px 16px',
              background: 'rgba(201,162,39,0.08)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              fontSize: '11px',
              fontFamily: 'Work Sans, sans-serif',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'var(--muted)', fontSize: '10px' }}>Your Handle:</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-brass)' }}>{handle}</span>
          </div>

          {/* Region Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '8px 12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              overflowX: 'auto',
            }}
          >
            <button
              onClick={() => setSelectedFilter('all')}
              style={{
                background: selectedFilter === 'all' ? 'var(--accent-brass)' : 'transparent',
                color: selectedFilter === 'all' ? '#171b16' : 'var(--muted)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '10px',
                fontFamily: 'Work Sans, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              All
            </button>
            {REGIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedFilter(id)}
                style={{
                  background: selectedFilter === id ? 'var(--accent-brass)' : 'transparent',
                  color: selectedFilter === id ? '#171b16' : 'var(--muted)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  fontFamily: 'Work Sans, sans-serif',
                  fontWeight: selectedFilter === id ? 700 : 500,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div
            style={{
              flex: 1,
              padding: '12px 16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {filteredMessages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: 'var(--muted)',
                  fontSize: '12px',
                  fontFamily: 'Work Sans, sans-serif',
                  marginTop: '40px',
                  fontStyle: 'italic',
                }}
              >
                No messages yet in this room. Be the first to chat! 💈
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: msg.isSelf ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'var(--muted)',
                      fontFamily: 'Work Sans, sans-serif',
                      marginBottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: msg.isSelf ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <span>{msg.sender}</span>
                    <span
                      style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        background: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {msg.region}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    style={{
                      background: msg.isSelf ? 'rgba(201,162,39,0.22)' : 'rgba(255,255,255,0.08)',
                      border: msg.isSelf ? '1px solid rgba(201,162,39,0.4)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: msg.isSelf ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      padding: '8px 12px',
                      color: 'var(--text)',
                      fontSize: '12px',
                      fontFamily: 'Work Sans, sans-serif',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Reactions Bar */}
          <div
            style={{
              padding: '6px 12px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '6px',
              justifyContent: 'space-around',
              background: 'rgba(0,0,0,0.2)',
            }}
          >
            {EMOJI_BAR.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                title={`Send ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              gap: '8px',
              background: 'rgba(25, 30, 24, 0.9)',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Type anonymous message..."
              maxLength={120}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: '12px',
                fontFamily: 'Work Sans, sans-serif',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: 'var(--accent-brass)',
                color: '#171b16',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontFamily: 'Work Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
