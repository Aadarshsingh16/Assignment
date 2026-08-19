import { useEffect, useState } from 'react';
import type { SentimentLabel } from '../utils/sentiment';

type VibeScoreProps = {
  score: number;
  label: SentimentLabel;
  subreddit: string;
  totalPosts: number;
};

const VIBE_EMOJI: Record<SentimentLabel, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😟',
};

const VIBE_LABEL: Record<SentimentLabel, string> = {
  positive: 'POSITIVE',
  neutral: 'NEUTRAL',
  negative: 'NEGATIVE',
};

const VIBE_COLOR: Record<SentimentLabel, string> = {
  positive: 'vibe-positive',
  neutral: 'vibe-neutral',
  negative: 'vibe-negative',
};

export function VibeScore({ score, label, subreddit, totalPosts }: VibeScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score from 0 → final value.
  // We defer the reset to setTimeout(0) to avoid calling setState
  // synchronously inside the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let frame: ReturnType<typeof requestAnimationFrame>;
    // Defer reset so it is not a synchronous setState inside the effect
    const resetTimer = setTimeout(() => {
      setDisplayScore(0);

      const duration = 1200; // ms
      const start = performance.now();

      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(eased * score));
        if (progress < 1) {
          frame = requestAnimationFrame(animate);
        }
      };

      frame = requestAnimationFrame(animate);
    }, 0);

    return () => {
      clearTimeout(resetTimer);
      cancelAnimationFrame(frame);
    };
  }, [score]);

  return (
    <div className={`vibe-score-card ${VIBE_COLOR[label]}`}>
      <div className="vibe-meta">
        <div className="vibe-sub">
          <span className="vibe-sub-label">SUBREDDIT</span>
          <span className="vibe-sub-name">r/{subreddit}</span>
        </div>
        <div className="vibe-posts-count">
          <span className="vibe-posts-num">{totalPosts}</span>
          <span className="vibe-posts-label">HOT POSTS ANALYZED</span>
        </div>
      </div>

      <div className="vibe-main">
        <div className="vibe-current-label">CURRENT VIBE</div>
        <div className="vibe-emoji-label">
          <span className="vibe-emoji">{VIBE_EMOJI[label]}</span>
          <span className="vibe-label">{VIBE_LABEL[label]}</span>
        </div>
        <div className="vibe-numeric">
          <span className="vibe-num">{displayScore}</span>
          <span className="vibe-denom"> / 100</span>
        </div>
      </div>
    </div>
  );
}
