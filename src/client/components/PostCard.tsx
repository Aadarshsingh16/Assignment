import { navigateTo } from '@devvit/web/client';
import type { AnalyzedPost } from '../utils/sentiment';

type PostCardProps = {
  post: AnalyzedPost;
  index: number;
};

const SENTIMENT_BADGE: Record<string, { label: string; emoji: string }> = {
  positive: { label: 'Positive', emoji: '😊' },
  neutral: { label: 'Neutral', emoji: '😐' },
  negative: { label: 'Negative', emoji: '😟' },
};

/** Format a number with K/M suffix */
function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

/** Return relative time string from ISO string */
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function PostCard({ post, index }: PostCardProps) {
  const badge = SENTIMENT_BADGE[post.sentiment.label] ?? { label: 'Neutral', emoji: '😐' };
  const scoreSign = post.sentiment.comparative >= 0 ? '+' : '';
  const comparative = post.sentiment.comparative.toFixed(2);

  return (
    <article
      className={`post-card post-card-${post.sentiment.label}`}
      style={{
        animationDelay: `${Math.min(index * 30, 600)}ms`,
      }}
    >
      <div className="post-card-header">
        <span className={`post-badge post-badge-${post.sentiment.label}`}>
          {badge.emoji} {badge.label}
        </span>
        <span className={`post-score-badge post-score-${post.sentiment.label}`}>
          {scoreSign}{comparative}
        </span>
      </div>

      <h3 className="post-title">{post.title}</h3>

      <div className="post-meta">
        <span className="post-stat">
          <span className="post-stat-icon">↑</span>
          {formatNum(post.score)}
        </span>
        <span className="post-stat">
          <span className="post-stat-icon">💬</span>
          {formatNum(post.comments)}
        </span>
        <span className="post-author">u/{post.author}</span>
        <span className="post-time">{relativeTime(post.createdAt)}</span>
        <button
          className="post-link-btn"
          onClick={() => navigateTo(post.permalink)}
          aria-label={`View "${post.title}" on Reddit`}
        >
          View ↗
        </button>
      </div>
    </article>
  );
}
