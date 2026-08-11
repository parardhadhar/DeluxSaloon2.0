'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

// Trigger by typing "ustara" anywhere (not in inputs)
const EASTER_EGG_WORD = 'ustara';

export function useKonamiEgg() {
  const bufferRef = useRef('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-EASTER_EGG_WORD.length);

      if (bufferRef.current === EASTER_EGG_WORD) {
        bufferRef.current = '';
        setActive(true);
        setTimeout(() => setActive(false), 4000);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return active;
}
