'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Region, playlist, Track, createShuffledPlaylists } from '@/lib/playlist';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useListenerCount } from '@/hooks/useListenerCount';
import { useSkipVote } from '@/hooks/useSkipVote';

import BarberPole from '@/components/BarberPole';
import RegionTabs from '@/components/RegionTabs';
import ProgressBar from '@/components/ProgressBar';
import NowPlayingTicker from '@/components/NowPlayingTicker';
import ToastComment from '@/components/ToastComment';
import WeatherBadge from '@/components/WeatherBadge';
import RainOverlay from '@/components/RainOverlay';
import TimeOfDayOverlay from '@/components/TimeOfDayOverlay';
import SceneBubble from '@/components/SceneBubble';
import EasterEggConfetti from '@/components/EasterEggConfetti';
import ShopShutter from '@/components/ShopShutter';
import { useWeather } from '@/hooks/useWeather';
import { useKonamiEgg } from '@/hooks/useKonamiEgg';
import { createStaticPlayer } from '@/lib/radioStatic';
import { BARBERS_PICK } from '@/lib/playlist';

// ── REGIONAL BACKGROUND VIDEOS (HD MP4) ───────────────────────────────────────
const REGION_VIDEOS: Record<Region, string> = {
  mumbai: '/videos/mumbai.mp4',
  delhi: '/videos/delhi.mp4',
  chennai: '/videos/chennai.mp4',
  kolkata: '/videos/kolkata.mp4',
};

// ── REGIONAL TITLE & SCRIPT DICTIONARY ────────────────────────────────────────
const REGION_TITLES: Record<Region, { title: string; subtitle: string; fontClass: string; scriptName: string }> = {
  mumbai: {
    title: 'डीलक्स सलून २.०',
    subtitle: 'MUMBAI SALOON 2.0',
    fontClass: 'font-devanagari',
    scriptName: 'मराठी',
  },
  delhi: {
    title: 'डीलक्स सैलून २.०',
    subtitle: 'DELHI SALOON 2.0',
    fontClass: 'font-devanagari',
    scriptName: 'हिंदी',
  },
  chennai: {
    title: 'டீலக்ஸ் சலூன் 2.0',
    subtitle: 'CHENNAI SALOON 2.0',
    fontClass: 'font-tamil',
    scriptName: 'தமிழ்',
  },
  kolkata: {
    title: 'ডিলক্স সেলুন ২.০',
    subtitle: 'KOLKATA SALOON 2.0',
    fontClass: 'font-bengali',
    scriptName: 'বাংলা',
  },
};

// ── REGIONAL SPLASH CARD POSITIONS (Off-center to unblock barber face) ────────
const SPLASH_CARD_POSITIONS: Record<Region, React.CSSProperties> = {
  mumbai: { bottom: '7%', left: '5%' },
  delhi: { bottom: '7%', left: '5%' },
  chennai: { bottom: '7%', right: '5%' },
  kolkata: { bottom: '7%', left: '5%' },
};

// ── MINIMALISTIC REGIONAL UI TRANSLATIONS ────────────────────────────────────
type RegionalUI = {
  eyebrow: string;
  selectCityPrompt: string;
  openShopCTA: string;
  headphonesHint: string;
  skipButton: string;
  upNextHeader: string;
  tickerPrefix: string;
  keyboardHint: string;
  greeting: string;
  returnGreeting: string;
  fontClass: string;
};

const REGION_UI: Record<Region, RegionalUI> = {
  mumbai: {
    eyebrow: 'आजची प्लेलिस्ट',
    selectCityPrompt: 'शहर निवडा —',
    openShopCTA: 'दुकान उघडा ▶',
    headphonesHint: 'हेडफोन लावा',
    skipButton: 'बदला',
    upNextHeader: 'पुढे —',
    tickerPrefix: 'वाजले:',
    keyboardHint: 'स्पेस: प्ले/पॉज · ← → : बदला',
    greeting: 'सकाळी सकाळी मुंबईत चहा लावा, मस्त गाणी ऐका',
    returnGreeting: 'परत आलात भावा, बसा',
    fontClass: 'font-devanagari',
  },
  delhi: {
    eyebrow: 'आज की प्लेलिस्ट',
    selectCityPrompt: 'शहर चुनें —',
    openShopCTA: 'दुकान खोलें ▶',
    headphonesHint: 'हेडफोन लगाएं',
    skipButton: 'बदलें',
    upNextHeader: 'आगे —',
    tickerPrefix: 'अब तक:',
    keyboardHint: 'स्पेस: चलाएं/रोकें · ← → : बदलें',
    greeting: 'दिल्ली की ठंड में चाय और पुराने नगमे',
    returnGreeting: 'वापस आ गए भाई, बैठो',
    fontClass: 'font-devanagari',
  },
  chennai: {
    eyebrow: 'இன்றைய பிளேலிஸ்ட்',
    selectCityPrompt: 'நகரம் —',
    openShopCTA: 'கடையைத் திறக்கவும் ▶',
    headphonesHint: 'ஹெட்போன் அணியுங்கள்',
    skipButton: 'மாற்று',
    upNextHeader: 'அடுத்து —',
    tickerPrefix: 'ஒலித்தவை:',
    keyboardHint: 'ஸ்பேஸ்: இயக்கு/நிறுத்து · ← → : மாற்று',
    greeting: 'சென்னையில் வெயில், வந்து பாட்டு கேளுங்கள்',
    returnGreeting: 'திரும்பி வந்திட்டீங்களா நண்பா, உக்காருங்க',
    fontClass: 'font-tamil',
  },
  kolkata: {
    eyebrow: 'আজকের প্লেলিস্ট',
    selectCityPrompt: 'শহর বাছুন —',
    openShopCTA: 'দোকান খুলুন ▶',
    headphonesHint: 'হেডফোন লাগান',
    skipButton: 'গান বদল',
    upNextHeader: 'পরবর্তী —',
    tickerPrefix: 'বাজল:',
    keyboardHint: 'স্পেস: চালান/থামান · ← → : পরিবর্তন',
    greeting: 'কলকাতার এক কাপ চা আর সাথে পছন্দের গান',
    returnGreeting: 'আবার এলেন দাদা, বসুন',
    fontClass: 'font-bengali',
  },
};

// ── ULTRA-MINIMAL INLINE UP NEXT (1 LINE PREVIEW) ────────────────────────────
function InlineUpNext({ tracks, currentIndex, ui, barbersPickId }: { tracks: Track[]; currentIndex: number; ui: RegionalUI; barbersPickId: string }) {
  const nextTrackItem = tracks[(currentIndex + 1) % tracks.length];
  const isPick = nextTrackItem?.id === barbersPickId;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
      <span className={ui.fontClass} style={{ fontSize: '10px', color: 'var(--accent-brass)', fontWeight: 600, flexShrink: 0 }}>
        {ui.upNextHeader}
      </span>
      {isPick && (
        <span style={{
          fontSize: '8px', fontFamily: 'Work Sans, sans-serif', fontWeight: 700,
          background: 'rgba(201,162,39,0.18)', color: 'var(--accent-brass)',
          border: '1px solid rgba(201,162,39,0.35)',
          padding: '1px 5px', borderRadius: '3px', flexShrink: 0, letterSpacing: '0.05em',
        }}>
          💈 PICK
        </span>
      )}
      <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '11px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {nextTrackItem?.title ?? ''}
      </span>
      <span style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '10px', color: 'var(--muted)', flexShrink: 0 }}>
        · {nextTrackItem?.artist ?? ''}
      </span>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [shopOpen, setShopOpen] = useState(false);
  const [shutterDone, setShutterDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [region, setRegion] = useState<Region>('mumbai');
  const [playlists, setPlaylists] = useState<Record<Region, Track[]>>(() => createShuffledPlaylists());
  const [history, setHistory] = useState<Track[]>([]);
  const [hasVisited, setHasVisited] = useState(false);
  const [shutterState, setShutterState] = useState<'idle' | 'closing' | 'opening'>('idle');
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const skipVoteResetRef = useRef<(() => void) | null>(null);
  const staticPlayerRef = useRef<ReturnType<typeof createStaticPlayer> | null>(null);

  const { weather, loading: weatherLoading } = useWeather(region);
  const easterEggActive = useKonamiEgg();
  const listenerLabel = useListenerCount(region);
  const listenerCount = parseInt(listenerLabel) || 0;

  const ui = REGION_UI[region];
  const currentRegTitle = REGION_TITLES[region];

  const handleTrackEnd = useCallback((track: Track) => {
    setHistory(prev => [track, ...prev].slice(0, 8));
    setTotalPlayed(n => n + 1);
  }, []);

  const handleTrackStart = useCallback(() => {
    skipVoteResetRef.current?.();
  }, []);

  const { playerState, currentTime, duration, currentTrack, currentIndex, play, togglePlay, seekTo, nextTrack, prevTrack, isReady } =
    useYouTubePlayer({ region, playlists, enabled: shutterDone, onTrackEnd: handleTrackEnd, onTrackStart: handleTrackStart });

  const { votes, hasVoted, vote, reset: resetVotes } = useSkipVote(
    region, currentTrack?.id ?? '', listenerCount, nextTrack
  );

  useEffect(() => { skipVoteResetRef.current = resetVotes; }, [resetVotes]);

  const openShop = useCallback(() => {
    if (!staticPlayerRef.current) {
      staticPlayerRef.current = createStaticPlayer();
    }
    play();
    setFadingOut(true);
    document.cookie = `saloon-visited=true;max-age=${60 * 60 * 24 * 365};path=/`;
    setTimeout(() => setShopOpen(true), 550);
  }, [play]);

  // Called when shutter rolls up — skip splash card, go straight to player
  const onShutterReveal = useCallback(() => {
    setShutterDone(true);    // enables YouTube player init
    document.cookie = `saloon-visited=true;max-age=${60 * 60 * 24 * 365};path=/`;
    // Give player a moment to initialize then auto-play
    setTimeout(() => {
      if (!staticPlayerRef.current) staticPlayerRef.current = createStaticPlayer();
      play();
    }, 350);
    setShopOpen(true); // go directly to player screen
  }, [play]);

  const handleRegionChange = useCallback((r: Region) => {
    if (r === region || shutterState !== 'idle') return;
    // Play radio static burst
    staticPlayerRef.current?.();
    setShutterState('closing');
    
    setTimeout(() => {
      setRegion(r);
      setHistory([]);
      resetVotes();
      setShutterState('opening');
      setTimeout(() => setShutterState('idle'), 400);
    }, 400);
  }, [region, shutterState, resetVotes]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      else if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shopOpen, togglePlay, nextTrack, prevTrack]);

  // Region memory and returning visitor check via cookie
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const saved = cookies.find(c => c.startsWith('saloon-region='))?.split('=')[1] as Region | undefined;
    if (saved && ['mumbai', 'delhi', 'chennai', 'kolkata'].includes(saved)) setRegion(saved);
    
    const visited = cookies.find(c => c.startsWith('saloon-visited='))?.split('=')[1];
    if (visited === 'true') setHasVisited(true);
  }, []);
  useEffect(() => {
    document.cookie = `saloon-region=${region};max-age=${60 * 60 * 24 * 30};path=/`;
  }, [region]);

  const isPlaying = playerState === 'playing';
  const tracks = playlists[region] ?? playlist[region];
  const isRaining = weather.icon === '🌧️';
  const barbersPickId = BARBERS_PICK[region];

  return (
    <>
      {/* ── Easter egg confetti ── */}
      <EasterEggConfetti active={easterEggActive} />

      {/* ── Shop Shutter (fullscreen entry — drag up to open) ── */}
      {!shutterDone && (
        <ShopShutter
          region={region}
          onRegionChange={setRegion}
          onReveal={onShutterReveal}
        />
      )}

      {/* ── Shutter Transition Layer ── */}
      <div className={`shutter ${shutterState !== 'idle' ? shutterState : ''}`} />

      {/* ── Fullscreen Background Saloon HD Video Cover ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <video
          key={region}
          src={REGION_VIDEOS[region]}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            opacity: 1,
            transition: 'opacity 0.4s ease-in-out',
          }}
        />
      </div>

      {/* ── Dynamic Lighting Tint (Time of Day) ── */}
      <TimeOfDayOverlay />

      {/* ── Soft Dark Radial Vignette for Contrast ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.68) 100%)',
        }}
      />

      {/* ── Rain Overlay ── */}
      <RainOverlay isRaining={isRaining} />

      {/* ── Ambient toasts ── */}
      {shopOpen && <ToastComment region={region} />}

      {/* ── Diegetic scene speech bubbles ── */}
      {shopOpen && <SceneBubble region={region} />}

      {/* ── Customer Card Share Modal ── */}
      {showCard && (
        <div
          onClick={() => setShowCard(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,14,10,0.75)', backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(35, 42, 32, 0.97)',
              border: '1px solid var(--accent-brass)',
              borderRadius: '16px',
              padding: '28px 32px',
              maxWidth: '360px',
              width: '90vw',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <BarberPole isPlaying={false} size="sm" />
            </div>
            <div className={ui.fontClass} style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-brass)', marginBottom: 6 }}>
              {currentRegTitle.title}
            </div>
            <div style={{ fontFamily: 'Work Sans', fontSize: '13px', color: 'var(--muted)', marginBottom: 20 }}>
              Deluxe Saloon 2.0 · Customer Card
            </div>
            <div
              style={{
                background: 'rgba(201,162,39,0.08)',
                border: '1px solid rgba(201,162,39,0.2)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: 20,
              }}
            >
              <div style={{ fontFamily: 'Work Sans', fontSize: '38px', fontWeight: 800, color: 'var(--text)' }}>
                {totalPlayed}
              </div>
              <div className={ui.fontClass} style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {region === 'mumbai' ? 'गाणी ऐकली' : region === 'delhi' ? 'गाने सुने' : region === 'chennai' ? 'பாடல்கள் கேட்டவை' : 'গান শুনেছেন'}
              </div>
            </div>
            <div style={{ fontFamily: 'Work Sans', fontSize: '12px', color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
              {region === 'mumbai' ? `तुम्ही मुंबई सलूनमध्ये ${totalPlayed} गाणी ऐकलीत` :
               region === 'delhi' ? `आपने दिल्ली सैलून में ${totalPlayed} गाने सुने` :
               region === 'chennai' ? `நீங்கள் சென்னை சலூனில் ${totalPlayed} பாடல்கள் கேட்டீர்கள்` :
               `আপনি কলকাতা সেলুনে ${totalPlayed}টি গান শুনেছেন`}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const text = `🪒 ${currentRegTitle.subtitle} — ${totalPlayed} tracks listened · Deluxe Saloon 2.0`;
                  if (navigator.share) {
                    navigator.share({ title: 'Deluxe Saloon 2.0', text });
                  } else {
                    navigator.clipboard.writeText(text);
                  }
                }}
                style={{
                  background: 'var(--accent-brass)', color: '#171b16',
                  border: 'none', borderRadius: 8, padding: '10px 20px',
                  fontFamily: 'Work Sans', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Share ✂️
              </button>
              <button
                onClick={() => setShowCard(false)}
                style={{
                  background: 'transparent', color: 'var(--muted)',
                  border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px',
                  fontFamily: 'Work Sans', fontSize: 13, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          SPLASH SCREEN
      ══════════════════════════════════════════ */}
      {!shopOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            padding: '32px',
            opacity: fadingOut ? 0 : 1,
            transition: 'opacity 0.5s ease',
            pointerEvents: fadingOut ? 'none' : 'auto',
            ...SPLASH_CARD_POSITIONS[region],
          }}
        >
          <div
            className="splash-card splash-card-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              padding: '28px 36px',
              background: 'rgba(23, 27, 22, 0.88)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05)',
              maxWidth: '560px',
              zIndex: 2,
            }}
          >
            {/* Left — barber pole (Always spinning continuously) */}
            <div style={{ flexShrink: 0 }}>
              <BarberPole isPlaying={true} size="lg" />
            </div>

            {/* Right — branding + CTA with staggered entrance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: 0 }}>
              <div className={`stagger-1 ${ui.fontClass}`} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent-poster)' }}>
                {ui.eyebrow} · {currentRegTitle.scriptName}
              </div>

              <div className="stagger-2">
                <div
                  className={ui.fontClass}
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    color: 'var(--accent-brass)',
                    lineHeight: 1.1,
                    letterSpacing: '0.01em',
                    textShadow: '0 4px 16px rgba(0,0,0,0.7)',
                  }}
                >
                  {currentRegTitle.title}
                </div>
                <div
                  style={{
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '11px',
                    color: 'var(--muted)',
                    letterSpacing: '0.06em',
                    marginTop: '2px',
                  }}
                >
                  Deluxe Saloon 2.0
                </div>
              </div>

              <div className="stagger-3">
                <WeatherBadge region={region} weather={weather} variant="splash" />
              </div>

              <div className={`stagger-4 ${ui.fontClass}`} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>
                "{hasVisited ? ui.returnGreeting : ui.greeting}"
              </div>

              <div className="stagger-5">
                <div className={ui.fontClass} style={{ fontSize: '10px', fontWeight: 500, color: 'var(--muted)', marginBottom: '6px' }}>
                  {ui.selectCityPrompt}
                </div>
                <RegionTabs active={region} onChange={setRegion} />
              </div>

              <div className="stagger-6">
                <button
                  id="open-shop-btn"
                  onClick={openShop}
                  className={`open-shop-btn ${ui.fontClass}`}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'var(--accent-brass)',
                    color: '#171b16',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  {ui.openShopCTA}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PLAYER SCREEN
          ULTRA-MINIMALIST, HIGHLY STREAMLINED WIDGET
      ══════════════════════════════════════════ */}
      {shopOpen && (
        <main
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10,
            overflow: 'hidden',
            animation: 'fadeIn 0.5s ease forwards',
          }}
        >
          {/* ── HEADER BAR ── */}
          <div className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'rgba(35, 42, 32, 0.88)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className={`header-title ${ui.fontClass}`} style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-brass)', lineHeight: 1 }}>
                {currentRegTitle.title}
              </span>
              <WeatherBadge region={region} weather={weather} variant="header" />
            </div>

            <div
              className={`header-badge ${ui.fontClass}`}
              style={{ 
                fontSize: '11px', 
                color: 'var(--text)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'rgba(23, 27, 22, 0.8)',
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                fontWeight: 500,
              }}
              aria-live="polite"
            >
              <span className="live-dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: isPlaying ? '#4caf50' : 'var(--muted)', display: 'inline-block' }} />
              {listenerLabel}
            </div>

            {/* My Card button */}
            <button
              id="my-card-btn"
              onClick={() => setShowCard(true)}
              title="Your Customer Card"
              style={{
                background: 'rgba(23, 27, 22, 0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                padding: '5px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-brass)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}
            >
              🪒 Card
            </button>
          </div>

          {/* ── BODY: ANCHORED BOTTOM-LEFT, HIGHLY MINIMALIST ── */}
          <div
            className="player-bottom-container"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
              padding: '0 0 32px 32px',
              minHeight: 0,
            }}
          >
            <div className="player-row" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', maxWidth: '100%' }}>
              {/* DETACHED BARBER POLE */}
              <div
                className="surface-card detached-barber-pole"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 12px',
                  background: 'rgba(35, 42, 32, 0.92)',
                  backdropFilter: 'blur(16px)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 32px rgba(0,0,0,0.7)',
                  border: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <BarberPole isPlaying={isPlaying} size="sm" />
              </div>

              {/* MINIMALIST PLAYER CARD */}
              <div
                className="surface-card player-card-widget"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  width: '350px',
                  maxWidth: 'calc(100vw - 120px)', /* Prevent horizontal overflow */
                  background: 'rgba(35, 42, 32, 0.92)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 32px rgba(0,0,0,0.7)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* TIGHT CARD CONTENTS */}
                <div>
                  <div
                    className="font-display"
                    style={{
                      fontSize: '1.15rem',
                      color: 'var(--text)',
                      lineHeight: 1.2,
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentTrack?.title ?? 'Loading…'}
                  </div>
                  <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '11px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack?.artist ?? ''}</span>
                    {currentTrack?.year && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--accent-poster)', background: 'rgba(179,58,58,0.14)', padding: '0 4px', borderRadius: '3px', flexShrink: 0 }}>
                        {currentTrack.year}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar currentTime={currentTime} duration={duration} onSeek={seekTo} />

                {/* Playback Controls & Skip Button Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Prev */}
                  <CtrlBtn id="prev-btn" onClick={prevTrack} title="Previous (←)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
                  </CtrlBtn>

                  {/* Play/Pause */}
                  <button
                    id="play-pause-btn"
                    onClick={togglePlay}
                    title="Play / Pause (Space)"
                    disabled={!isReady}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'var(--accent-brass)',
                      border: 'none',
                      cursor: isReady ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#171b16',
                      opacity: isReady ? 1 : 0.5,
                      transition: 'transform 0.15s',
                      boxShadow: '0 3px 10px rgba(201,162,39,0.3)',
                      flexShrink: 0,
                    }}
                  >
                    {isPlaying
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
                    }
                  </button>

                  {/* Next */}
                  <CtrlBtn id="next-btn" onClick={nextTrack} title="Next (→)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14 4.5 3.14-4.5 3.14V9.86zM16 6h2v12h-2z"/></svg>
                  </CtrlBtn>

                  <div style={{ flex: 1 }} />

                  {/* Minimalist Skip Button */}
                  <button
                    id="skip-vote-btn"
                    className={ui.fontClass}
                    onClick={vote}
                    title={ui.skipButton}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${hasVoted ? 'var(--accent-poster)' : 'var(--border)'}`,
                      background: hasVoted ? 'rgba(179,58,58,0.12)' : 'transparent',
                      color: hasVoted ? 'var(--accent-poster)' : 'var(--muted)',
                      fontSize: '10px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                    </svg>
                    <span>{ui.skipButton}</span>
                    {votes > 0 && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', background: 'rgba(179,58,58,0.2)', color: 'var(--accent-poster)', padding: '0 4px', borderRadius: '4px' }}>
                        {votes}
                      </span>
                    )}
                  </button>
                </div>

                {/* 1-Line Up Next Preview */}
                <InlineUpNext tracks={tracks} currentIndex={currentIndex} ui={ui} barbersPickId={barbersPickId} />

                {/* Region tabs */}
                <RegionTabs active={region} onChange={handleRegionChange} />
              </div>
            </div>
          </div>

          {/* ── TICKER ── */}
          <NowPlayingTicker history={history} prefix={ui.tickerPrefix} fontClass={ui.fontClass} />

          {/* ── KEYBOARD HINTS & CREDIT ── */}
          <div style={{ textAlign: 'center', padding: '4px', fontSize: '10px', color: 'var(--muted)', flexShrink: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span className={ui.fontClass}>{ui.keyboardHint}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ color: 'var(--accent-brass)', fontWeight: 600 }}>Made with ❤️ by Parardha Dhar</span>
          </div>
        </main>
      )}
    </>
  );
}

// ── SMALL CONTROL BUTTON ──────────────────────────────────────────────────────
function CtrlBtn({ id, onClick, title, children }: { id: string; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={title}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, transition: 'color 0.18s', display: 'flex', alignItems: 'center' }}
      onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text)')}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)')}
    >
      {children}
    </button>
  );
}
