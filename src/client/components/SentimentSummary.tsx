import type { VibeResult } from '../utils/sentiment';

type SentimentSummaryProps = Pick<
  VibeResult,
  | 'positiveCount'
  | 'neutralCount'
  | 'negativeCount'
  | 'positivePercent'
  | 'neutralPercent'
  | 'negativePercent'
  | 'totalPosts'
>;

export function SentimentSummary({
  positiveCount,
  neutralCount,
  negativeCount,
  positivePercent,
  neutralPercent,
  negativePercent,
}: SentimentSummaryProps) {
  return (
    <div className="sentiment-summary">
      <SentimentPill
        label="Positive"
        emoji="😊"
        count={positiveCount}
        percent={positivePercent}
        kind="positive"
      />
      <SentimentPill
        label="Neutral"
        emoji="😐"
        count={neutralCount}
        percent={neutralPercent}
        kind="neutral"
      />
      <SentimentPill
        label="Negative"
        emoji="😟"
        count={negativeCount}
        percent={negativePercent}
        kind="negative"
      />
    </div>
  );
}

type PillProps = {
  label: string;
  emoji: string;
  count: number;
  percent: number;
  kind: 'positive' | 'neutral' | 'negative';
};

function SentimentPill({ label, emoji, count, percent, kind }: PillProps) {
  return (
    <div className={`sentiment-pill sentiment-pill-${kind}`}>
      <div className="pill-emoji">{emoji}</div>
      <div className="pill-label">{label}</div>
      <div className="pill-percent">{percent}%</div>
      <div className="pill-count">{count} posts</div>
    </div>
  );
}
