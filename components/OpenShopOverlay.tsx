'use client';

interface OpenShopOverlayProps {
  onOpen: () => void;
  region: string;
}

const REGION_GREETINGS: Record<string, string> = {
  mumbai: 'Mumbai mein subah ho gayi, chai lagao',
  delhi:  'Delhi mein sardi hai, gaana sun lo',
  chennai: 'Chennai mein dhoop hai, andar aao',
  kolkata: 'Kolkata ki chai ke saath sunna zaroori hai',
};

export default function OpenShopOverlay({ onOpen, region }: OpenShopOverlayProps) {
  const greeting = REGION_GREETINGS[region] ?? 'Sun lo, baal katao';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'rgba(23, 27, 22, 0.96)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Barber pole decorative mini */}
      <div style={{ marginBottom: '32px', opacity: 0.7 }}>
        <div
          style={{
            width: 48,
            height: 160,
            borderRadius: 24,
            border: '3px solid var(--accent-brass)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            className="barber-pole-stripes"
            style={{ position: 'absolute', inset: 0 }}
          />
          <div className="barber-pole-cap top" />
          <div className="barber-pole-cap bottom" />
        </div>
      </div>

      {/* Shop name */}
      <div
        className="font-display"
        style={{
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          color: 'var(--accent-brass)',
          letterSpacing: '0.02em',
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: '8px',
        }}
      >
        Deluxe Saloon
      </div>

      <div
        style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '13px',
          color: 'var(--muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        Aaj Ka Playlist
      </div>

      {/* Region greeting */}
      <div
        style={{
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '14px',
          color: 'var(--text)',
          fontStyle: 'italic',
          marginBottom: '48px',
          textAlign: 'center',
          maxWidth: '260px',
          lineHeight: 1.5,
        }}
      >
        "{greeting}"
      </div>

      {/* CTA button */}
      <button
        id="open-shop-btn"
        className="open-shop-btn"
        onClick={onOpen}
        style={{
          background: 'var(--accent-brass)',
          color: '#171b16',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 36px',
          fontFamily: 'Work Sans, sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(201,162,39,0.4)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
        }}
      >
        Dukaan Kholo
      </button>

      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: 'var(--muted)',
          marginTop: '20px',
          letterSpacing: '0.06em',
        }}
      >
        headphones lagao
      </div>
    </div>
  );
}
