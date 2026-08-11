'use client';

import { useRef, useState, useCallback } from 'react';
import { Region, REGIONS } from '@/lib/playlist';
import { useWeather } from '@/hooks/useWeather';

interface ShopShutterProps {
  region: Region;
  onRegionChange: (r: Region) => void;
  onReveal: () => void;
}

const THEMES: Record<Region, {
  slatBase: string; slatAlt: string; rail: string; handleColor: string;
  signBg: string; signBorder: string; signTitle: string; signTitleEn: string;
  closedWord: string; tagline: string; accent: string; accentDim: string;
  graffiti: string; cityLabel: string;
}> = {
  mumbai: {
    slatBase: '#231c14', slatAlt: '#2e2418', rail: '#14100a', handleColor: '#ff6b35',
    signBg: 'linear-gradient(160deg,#6b1212 0%,#8a1a1a 60%,#5a1010 100%)',
    signBorder: '#ff6b35', signTitle: 'डीलक्स सलून', signTitleEn: 'DELUXE SALOON',
    closedWord: 'बंद आहे', tagline: 'मुंबई · मराठी', accent: '#ff6b35',
    accentDim: 'rgba(255,107,53,0.18)', graffiti: '🎬 BOLLYWOOD', cityLabel: 'MUMBAI',
  },
  delhi: {
    slatBase: '#141c10', slatAlt: '#1c2a14', rail: '#0a100a', handleColor: '#f7c948',
    signBg: 'linear-gradient(160deg,#0e3d1a 0%,#165e28 60%,#0a2e12 100%)',
    signBorder: '#f7c948', signTitle: 'डीलक्स सैलून', signTitleEn: 'DELUXE SALOON',
    closedWord: 'बंद है', tagline: 'दिल्ली · हिन्दी', accent: '#f7c948',
    accentDim: 'rgba(247,201,72,0.18)', graffiti: '❄ PURANI DELHI', cityLabel: 'DELHI',
  },
  chennai: {
    slatBase: '#14101c', slatAlt: '#1c1628', rail: '#0c0a12', handleColor: '#e8455a',
    signBg: 'linear-gradient(160deg,#6b0c16 0%,#8a1020 60%,#550a10 100%)',
    signBorder: '#e8455a', signTitle: 'டீலக்ஸ் சலூன்', signTitleEn: 'DELUXE SALOON',
    closedWord: 'மூடப்பட்டது', tagline: 'சென்னை · தமிழ்', accent: '#e8455a',
    accentDim: 'rgba(232,69,90,0.18)', graffiti: '🎵 KOLLYWOOD', cityLabel: 'CHENNAI',
  },
  kolkata: {
    slatBase: '#14100c', slatAlt: '#1e1810', rail: '#0a0806', handleColor: '#ffd700',
    signBg: 'linear-gradient(160deg,#0d1850 0%,#162870 60%,#0a1240 100%)',
    signBorder: '#ffd700', signTitle: 'ডিলক্স সেলুন', signTitleEn: 'DELUXE SALOON',
    closedWord: 'বন্ধ আছে', tagline: 'কলকাতা · বাংলা', accent: '#ffd700',
    accentDim: 'rgba(255,215,0,0.18)', graffiti: '🚋 TRAM CITY', cityLabel: 'KOLKATA',
  },
};

// ── CITY ARTWORK SVG ──────────────────────────────────────────────────────────
function CityArt({ region }: { region: Region }) {
  if (region === 'mumbai') return (
    <g opacity="0.09">
      <path d="M5 82 Q30 75 55 78 Q75 80 95 75" stroke="#ff6b35" strokeWidth="0.9" fill="none"/>
      <path d="M5 85 Q30 78 55 82 Q75 84 95 79" stroke="#ff6b35" strokeWidth="0.5" fill="none"/>
      <polygon points="15,75 18,60 21,75" fill="#ff6b35"/>
      <line x1="18" y1="75" x2="18" y2="61" stroke="#ff6b35" strokeWidth="0.4"/>
      <circle cx="85" cy="18" r="6" stroke="#ff6b35" strokeWidth="0.7" fill="none"/>
      <circle cx="85" cy="18" r="2" fill="#ff6b35"/>
      {[0,90,180,270].map((a,i)=>{const r=a*Math.PI/180,x1=85+6*Math.cos(r),y1=18+6*Math.sin(r);return<line key={i} x1={x1} y1={y1} x2={85+9*Math.cos(r)} y2={18+9*Math.sin(r)} stroke="#ff6b35" strokeWidth="0.5"/>})}
    </g>
  );
  if (region === 'delhi') return (
    <g opacity="0.09">
      <rect x="10" y="60" width="6" height="25" fill="#f7c948" rx="1"/>
      <rect x="11" y="55" width="4" height="7" fill="#f7c948" rx="0.5"/>
      <rect x="11.5" y="50" width="3" height="6" fill="#f7c948" rx="0.5"/>
      <polygon points="13,44 11.5,50 14.5,50" fill="#f7c948"/>
      <path d="M70 85 L70 70 Q78 62 86 70 L86 85" stroke="#f7c948" strokeWidth="0.8" fill="none"/>
      <line x1="65" y1="85" x2="91" y2="85" stroke="#f7c948" strokeWidth="0.9"/>
      <text x="82" y="22" fontSize="9" fill="#f7c948" textAnchor="middle" opacity="0.5">❄</text>
    </g>
  );
  if (region === 'chennai') return (
    <g opacity="0.09">
      <polygon points="50,8 44,28 56,28" fill="#e8455a"/>
      <rect x="44" y="28" width="12" height="20" fill="#e8455a"/>
      <rect x="43" y="48" width="14" height="3" fill="#e8455a"/>
      <rect x="46" y="31" width="2" height="4" fill="#14101c"/>
      <rect x="50" y="31" width="2" height="4" fill="#14101c"/>
      <circle cx="82" cy="18" r="5" fill="none" stroke="#e8455a" strokeWidth="0.7"/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>{const r=a*Math.PI/180;return<line key={i} x1={82+6*Math.cos(r)} y1={18+6*Math.sin(r)} x2={82+9*Math.cos(r)} y2={18+9*Math.sin(r)} stroke="#e8455a" strokeWidth="0.5"/>})}
    </g>
  );
  if (region === 'kolkata') return (
    <g opacity="0.09">
      <rect x="8" y="72" width="22" height="10" fill="#ffd700" rx="1"/>
      <rect x="9" y="68" width="20" height="5" fill="#ffd700" rx="0.5"/>
      <rect x="11" y="69" width="3" height="3" fill="#14100c"/>
      <rect x="15" y="69" width="3" height="3" fill="#14100c"/>
      <rect x="19" y="69" width="3" height="3" fill="#14100c"/>
      <circle cx="13" cy="83" r="2" fill="#ffd700" stroke="#14100c" strokeWidth="0.5"/>
      <circle cx="25" cy="83" r="2" fill="#ffd700" stroke="#14100c" strokeWidth="0.5"/>
      <line x1="6" y1="82" x2="35" y2="82" stroke="#ffd700" strokeWidth="0.5"/>
      <line x1="62" y1="20" x2="62" y2="85" stroke="#ffd700" strokeWidth="0.9"/>
      <line x1="90" y1="20" x2="90" y2="85" stroke="#ffd700" strokeWidth="0.9"/>
      <line x1="62" y1="85" x2="90" y2="85" stroke="#ffd700" strokeWidth="0.9"/>
      <line x1="62" y1="20" x2="90" y2="85" stroke="#ffd700" strokeWidth="0.4"/>
      <line x1="90" y1="20" x2="62" y2="85" stroke="#ffd700" strokeWidth="0.4"/>
      <line x1="76" y1="20" x2="62" y2="85" stroke="#ffd700" strokeWidth="0.35"/>
      <line x1="76" y1="20" x2="90" y2="85" stroke="#ffd700" strokeWidth="0.35"/>
    </g>
  );
  return null;
}

// ── SHUTTER SVG ───────────────────────────────────────────────────────────────
function ShutterSVG({ region }: { region: Region }) {
  const t = THEMES[region];
  const N = 16, SH = 100 / N;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"
      preserveAspectRatio="none" style={{ display:'block', position:'absolute', inset:0 }}>
      <rect x="0" y="0" width="100" height="100" fill={t.slatBase}/>
      {Array.from({length:N}).map((_,i)=>{
        const y=i*SH, even=i%2===0;
        return (
          <g key={i}>
            <rect x="0" y={y} width="100" height={SH} fill={even?t.slatBase:t.slatAlt}/>
            <rect x="0" y={y} width="100" height="0.35" fill="rgba(255,255,255,0.09)"/>
            <rect x="0" y={y+SH-0.8} width="100" height="0.8" fill="rgba(0,0,0,0.45)"/>
            <rect x="0" y={y+SH*0.25} width="100" height={SH*0.3} fill="rgba(255,255,255,0.025)"/>
          </g>
        );
      })}
      <CityArt region={region}/>
      <line x1="20" y1="0" x2="22" y2="100" stroke="rgba(0,0,0,0.1)" strokeWidth="0.25"/>
      <line x1="60" y1="0" x2="62" y2="100" stroke="rgba(0,0,0,0.07)" strokeWidth="0.2"/>
      <rect x="0" y="0" width="2" height="100" fill={t.rail}/>
      <rect x="2" y="0" width="0.7" height="100" fill="rgba(255,255,255,0.07)"/>
      <rect x="97.3" y="0" width="2" height="100" fill={t.rail}/>
      <rect x="97.3" y="0" width="0.7" height="100" fill="rgba(255,255,255,0.07)"/>
      {/* Handle */}
      <rect x="33" y="48.2" width="34" height="3.6" rx="1.8" fill={t.handleColor} opacity="0.75"/>
      <rect x="42" y="46.5" width="16" height="7" rx="3" fill={t.handleColor} opacity="0.5"/>
      <rect x="43.5" y="47.5" width="13" height="5" rx="2.5" fill="rgba(0,0,0,0.4)"/>
      <rect x="49.5" y="47" width="1" height="6" rx="0.5" fill="rgba(255,255,255,0.18)"/>
      <text x="5" y="28" fontFamily="monospace" fontSize="3" fill={t.handleColor} opacity="0.13" transform="rotate(-1.5,5,28)">{t.graffiti}</text>
      <text x="4" y="88" fontFamily="monospace" fontSize="2.2" fill="rgba(255,255,255,0.05)" transform="rotate(-0.5,4,88)">{t.cityLabel} SALOON</text>
    </svg>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const DRAG_THRESHOLD = 0.28;

export default function ShopShutter({ region, onRegionChange, onReveal }: ShopShutterProps) {
  const [completed, setCompleted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const { weather, loading } = useWeather(region);

  const panelRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const currentPctRef = useRef(0);

  const t = THEMES[region];

  const triggerOpen = useCallback(() => {
    setCompleted(true);
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.55s cubic-bezier(0.4,0,0.2,1)';
      panelRef.current.style.transform = 'translateY(-100%)';
    }
    setTimeout(() => {
      setHidden(true);
      onReveal();
    }, 600);
  }, [onReveal]);

  const snapBack = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      panelRef.current.style.transform = 'translateY(0)';
    }
    setDragProgress(0);
    currentPctRef.current = 0;
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (completed) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.no-drag')) return;
    startYRef.current = e.clientY;
    try { (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId); } catch {}
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (completed || startYRef.current === null) return;
    const delta = startYRef.current - e.clientY;
    const pct = Math.max(0, Math.min(100, (delta / window.innerHeight) * 100));
    currentPctRef.current = pct;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
      panelRef.current.style.transform = `translateY(-${pct}%)`;
    }
    setDragProgress(Math.min(1, pct / (DRAG_THRESHOLD * 100)));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (completed || startYRef.current === null) return;
    const clickDistance = Math.abs(startYRef.current - e.clientY);
    startYRef.current = null;
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {}
    if (clickDistance < 10 || currentPctRef.current >= DRAG_THRESHOLD * 100) {
      triggerOpen();
    } else {
      snapBack();
    }
  };

  if (hidden) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60, overflow: 'hidden',
        cursor: completed ? 'default' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* The shutter panel that slides up */}
      <div
        ref={panelRef}
        style={{ position: 'absolute', inset: 0, transform: 'translateY(0)', willChange: 'transform' }}
      >
        <ShutterSVG region={region}/>
      </div>

      {/* ── Full-screen flex column layout — no conflicting absolute positioning ── */}
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5vh 16px 4vh',
          opacity: completed ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: completed ? 'none' : 'auto',
          // Vignette overlay
          background: 'radial-gradient(ellipse at center 30%, rgba(0,0,0,0) 15%, rgba(0,0,0,0.65) 100%)',
        }}
      >

        {/* ─── TOP: Shop Sign ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', width: '100%', maxWidth: 360 }}>
          {/* Chain links */}
          <div style={{ display: 'flex', gap: 22, marginBottom: 2 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {[0,1,2].map(j => (
                  <div key={j} style={{ width: 3, height: 6, borderRadius: 3, background: '#777', boxShadow: '0 1px 3px rgba(0,0,0,0.7)', border: '1px solid #555' }}/>
                ))}
              </div>
            ))}
          </div>
          {/* Sign board */}
          <div style={{
            background: t.signBg, border: `3px solid ${t.signBorder}`, borderRadius: 14,
            padding: '12px 18px 10px', textAlign: 'center',
            boxShadow: `0 14px 48px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,255,255,0.08)`,
            width: '100%',
          }}>
            <div style={{ fontSize: 'clamp(20px, 5vw, 26px)', marginBottom: 4, animation: 'spin 2s linear infinite', display: 'inline-block' }}>💈</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(16px, 4.5vw, 26px)', fontWeight: 700,
              color: t.signBorder, letterSpacing: '0.03em', textShadow: '0 2px 12px rgba(0,0,0,0.95)', lineHeight: 1.2, marginBottom: 2 }}>
              {t.signTitle}
            </div>
            <div style={{ fontFamily: 'Work Sans,sans-serif', fontSize: 'clamp(8px, 2.2vw, 9px)', color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
              {t.signTitleEn}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.55)',
              border: `1px solid ${t.signBorder}`, borderRadius: 6, padding: '4px 14px', marginBottom: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', display: 'inline-block', boxShadow: '0 0 6px #ff4444' }}/>
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700, color: t.signBorder, letterSpacing: '0.18em' }}>
                {t.closedWord}
              </span>
            </div>
            {!loading && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.45)',
                  border: '1px solid rgba(255,255,255,0.14)', borderRadius: 20, padding: '4px 10px', maxWidth: '100%' }}>
                  <span style={{ fontSize: 14 }}>{weather.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 'clamp(11px, 2.8vw, 12px)', fontWeight: 700, color: '#fff' }}>{weather.temp}</span>
                  <span style={{ fontFamily: 'Work Sans,sans-serif', fontSize: 'clamp(9px, 2.4vw, 10px)', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{weather.condition}</span>
                </div>
              </div>
            )}
            <div style={{ fontFamily: 'Work Sans,sans-serif', fontSize: 'clamp(9.5px, 2.5vw, 11px)', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
              {t.tagline}
            </div>
          </div>
        </div>

        {/* ─── MIDDLE SPACER (flex grows here) ─── */}
        <div style={{ flex: 1 }}/>

        {/* ─── BOTTOM: City Tabs + CTA button + Hints ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%', maxWidth: 380 }}>

          {/* ▶ CLICK TO START MUSIC — prominent CTA */}
          <button
            className="no-drag"
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); triggerOpen(); }}
            style={{
              background: t.accent,
              color: '#171b16',
              border: 'none',
              borderRadius: '30px',
              padding: 'clamp(10px, 2.5vw, 13px) clamp(20px, 5vw, 32px)',
              fontFamily: 'Work Sans, sans-serif',
              fontSize: 'clamp(12px, 3.2vw, 14px)',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: `0 6px 28px ${t.accent}90`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            ▶ TAP TO START MUSIC
          </button>

          {/* City Selector Tabs */}
          <div
            className="no-drag"
            onPointerDown={e => e.stopPropagation()}
            style={{
              display: 'flex',
              gap: 6,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: '5px 6px',
              width: '100%',
              justifyContent: 'space-around',
            }}
          >
            {REGIONS.map(({ id, label }) => {
              const isA = id === region;
              const th = THEMES[id];
              return (
                <button
                  key={id}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); onRegionChange(id); }}
                  style={{
                    flex: 1,
                    background: isA ? th.accentDim : 'transparent',
                    border: `1px solid ${isA ? th.accent : 'rgba(255,255,255,0.15)'}`,
                    borderRadius: 6,
                    padding: 'clamp(5px, 1.5vw, 8px) 4px',
                    fontFamily: 'Work Sans,sans-serif',
                    fontSize: 'clamp(9px, 2.8vw, 11px)',
                    fontWeight: isA ? 700 : 500,
                    color: isA ? th.accent : 'rgba(255,255,255,0.55)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: isA ? `0 0 8px ${th.accentDim}` : 'none',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Drag up arrows hint */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: 0.5 + dragProgress * 0.5 }}>
              {[0.4, 0.65, 0.9].map((op, i) => (
                <div key={i} style={{
                  width: 0, height: 0,
                  borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                  borderBottom: `7px solid ${t.accent}`, opacity: op,
                  animation: `shutter-hint-bob ${1.8 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.12}s`,
                }}/>
              ))}
            </div>
            <div style={{ fontFamily: 'Work Sans,sans-serif', fontSize: 'clamp(8px, 2.2vw, 9.5px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              or swipe up
            </div>
          </div>

          {/* Footer credits */}
          <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(8.5px, 2.2vw, 10px)', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.04em' }}>
              Made with ❤️ by Parardha Dhar
            </div>
            <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 'clamp(7px, 1.8vw, 8px)', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.02em', marginTop: 1 }}>
              Streamed via official YouTube Music API · Non-commercial project
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
