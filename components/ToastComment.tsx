'use client';

import { useEffect, useState, useRef } from 'react';
import { Region } from '@/lib/playlist';

interface ToastCommentProps {
  region: Region;
}

const REGIONAL_TOASTS: Record<Region, { label: string; lines: string[]; fontClass: string }> = {
  mumbai: {
    label: 'कोणाचा तरी आवाज आला —',
    fontClass: 'font-devanagari',
    lines: [
      'भाऊ थोडेच कापा',
      'अजून थोडे वरून कापा',
      'ऐकून खूप आनंद झाला',
      'पुढचे गाणे लावा ना',
      'काय भारी गाणे आहे',
      'चहा आणा भाऊ',
      'आरसा दाखवा भाऊ',
      'दोन्ही बाजूने सारखे करा',
    ],
  },
  delhi: {
    label: 'किसी की आवाज आई —',
    fontClass: 'font-devanagari',
    lines: [
      'भैया थोड़े ही काटना',
      'और थोड़ा ऊपर से',
      'सुनते ही मज़ा आ गया',
      'अगला गाना लगाओ यार',
      'क्या मस्त गाना है',
      'चाय पिलाओ भाई',
      'शीशा दिखाओ भाई',
      'दोनों तरफ से बराबर करो',
    ],
  },
  chennai: {
    label: 'யாரோ பேசும் குரல் —',
    fontClass: 'font-tamil',
    lines: [
      'அண்ணே கொஞ்சமா வெட்டுங்க',
      'இன்னும் கொஞ்சம் மேல வெட்டுங்க',
      'கேட்டு மனசு நிறைஞ்சிடுச்சு',
      'அடுத்த பாட்டு போடுங்க',
      'என்ன அருமையான பாட்டு',
      'டீ கொண்டு வாப்பா',
      'கண்ணாடி காட்டுங்கண்ணா',
      'ரெண்டு பக்கமும் சரியா வெட்டுங்க',
    ],
  },
  kolkata: {
    label: 'কারোর গলা পাওয়া গেল —',
    fontClass: 'font-bengali',
    lines: [
      'দাদা একটু কম কাটবেন',
      'আর একটু ওপর থেকে ছাঁটুন',
      'শুনে মন ভরে গেল',
      'পরের গানটা চালান না',
      'কী দারুণ গান',
      'এক কাপ চা দাও তো দাদা',
      'আয়নাটা দেখান দাদা',
      'দুই দিকে সমান করুন',
    ],
  },
};

export default function ToastComment({ region }: ToastCommentProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const currentLine = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const regionData = REGIONAL_TOASTS[region] || REGIONAL_TOASTS.mumbai;

  useEffect(() => {
    setVisible(false);
    setToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    const schedule = (delayMs: number) => {
      timerRef.current = setTimeout(() => {
        const lines = regionData.lines;
        const others = lines.filter(l => l !== currentLine.current);
        const line = others[Math.floor(Math.random() * others.length)];
        currentLine.current = line;
        setToast(line);
        setVisible(true);

        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          schedule(20000 + Math.random() * 20000);
        }, 4500);
      }, delayMs);
    };

    schedule(12000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [region, regionData]);

  if (!toast || !visible) return null;

  return (
    <div
      className="fixed bottom-16 left-6 z-50 pointer-events-none"
      aria-live="polite"
    >
      <div
        className={`toast-comment ${regionData.fontClass}`}
        style={{
          background: 'rgba(35, 42, 32, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--accent-brass)',
          color: 'var(--text)',
          padding: '10px 16px',
          borderRadius: '6px',
          fontSize: '13px',
          maxWidth: '240px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        }}
      >
        <span style={{ color: 'var(--muted)', fontSize: '10px', display: 'block', marginBottom: '2px' }}>
          {regionData.label}
        </span>
        "{toast}"
      </div>
    </div>
  );
}
