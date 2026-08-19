import { useEffect, useRef, useState } from 'react';
import type { VibeResult } from '../utils/sentiment';

type SentimentChartProps = Pick<
  VibeResult,
  'positivePercent' | 'neutralPercent' | 'negativePercent'
>;

export function SentimentChart({
  positivePercent,
  neutralPercent,
  negativePercent,
}: SentimentChartProps) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Animate bars in when values change.
  // Defer the reset to setTimeout(0) to avoid calling setState
  // synchronously inside the effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    let animTimer: ReturnType<typeof setTimeout>;
    const resetTimer = setTimeout(() => {
      setAnimated(false);
      animTimer = setTimeout(() => setAnimated(true), 50);
    }, 0);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(animTimer);
    };
  }, [positivePercent, neutralPercent, negativePercent]);

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="chart-title">Sentiment Distribution</h3>
      <div className="chart-bars">
        <ChartBar
          label="Positive"
          emoji="😊"
          percent={positivePercent}
          kind="positive"
          animated={animated}
        />
        <ChartBar
          label="Neutral"
          emoji="😐"
          percent={neutralPercent}
          kind="neutral"
          animated={animated}
        />
        <ChartBar
          label="Negative"
          emoji="😟"
          percent={negativePercent}
          kind="negative"
          animated={animated}
        />
      </div>
    </div>
  );
}

type ChartBarProps = {
  label: string;
  emoji: string;
  percent: number;
  kind: 'positive' | 'neutral' | 'negative';
  animated: boolean;
};

function ChartBar({ label, emoji, percent, kind, animated }: ChartBarProps) {
  return (
    <div className="chart-row">
      <div className="chart-row-label">
        <span>{emoji}</span>
        <span>{label}</span>
      </div>
      <div className="chart-track">
        <div
          className={`chart-fill chart-fill-${kind}`}
          style={{
            width: animated ? `${percent}%` : '0%',
            transition: animated ? 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        />
      </div>
      <div className="chart-pct">{percent}%</div>
    </div>
  );
}
