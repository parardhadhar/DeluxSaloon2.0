'use client';

import { useState, useCallback } from 'react';

const SKIP_THRESHOLD = 5;

// v1: local skip votes (no Supabase)
// v2: replace with Supabase skip_votes table + realtime subscription
// Table: skip_votes(region text, track_id text, voter_session text, created_at timestamptz)

export function useSkipVote(
  region: string,
  trackId: string,
  listenerCount: number,
  onSkip: () => void
) {
  const [votes, setVotes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  const vote = useCallback(() => {
    if (hasVoted) return;
    setHasVoted(true);
    setVotes(prev => {
      const next = prev + 1;
      const threshold = Math.max(SKIP_THRESHOLD, Math.floor(listenerCount * 0.30));
      if (next >= threshold) {
        setTimeout(() => {
          onSkip();
          setVotes(0);
          setHasVoted(false);
        }, 500);
      }
      return next;
    });
  }, [hasVoted, listenerCount, onSkip]);

  // Reset when track changes
  const reset = useCallback(() => {
    setVotes(0);
    setHasVoted(false);
  }, []);

  return { votes, hasVoted, vote, reset };
}
