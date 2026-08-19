/**
 * Client-side Sentiment Analysis Utility
 *
 * Library: "sentiment" by Andrew Slatkin (AFINN-165 word list)
 * GitHub: https://github.com/thisandagain/sentiment
 *
 * How the library works:
 *   - Looks up each word in the AFINN-165 word list
 *   - Each word has a valence score from -5 (very negative) to +5 (very positive)
 *   - `result.score`       = sum of all matched word valences (unbounded int)
 *   - `result.comparative` = score / totalWordCount (range approx -5..+5 but usually -1..+1)
 *
 * Our classification thresholds (based on comparative output):
 *   comparative >= 0.05  → "positive"
 *   comparative <= -0.05 → "negative"
 *   else                 → "neutral"   (includes 0 / no recognized words)
 *
 * Overall vibe score formula (0–100):
 *   avgComparative = mean of all post comparatives
 *   vibeScore = clamp((avgComparative / 5 + 1) / 2 * 100, 0, 100)
 *   → maps [-5, +5] → [0, 100]; a neutral subreddit scores ~50
 *
 * Overall vibe label:
 *   score >= 55 → "positive"
 *   score <= 45 → "negative"
 *   else        → "neutral"
 */

import Sentiment from 'sentiment';
import type { RedditPost } from '../../shared/api';

const analyzer = new Sentiment();

// ─── Types ────────────────────────────────────────────────────────────────────

export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export type SentimentResult = {
  /** Raw AFINN score (sum of matched word valences) */
  score: number;
  /** Comparative score = score / wordCount (approx -5..+5) */
  comparative: number;
  /** Human-readable label */
  label: SentimentLabel;
};

export type AnalyzedPost = RedditPost & {
  sentiment: SentimentResult;
};

export type VibeResult = {
  subreddit: string;
  totalPosts: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
  /** 0–100 numeric vibe score */
  vibeScore: number;
  vibeLabel: SentimentLabel;
  analyzedPosts: AnalyzedPost[];
};

// ─── Classification ───────────────────────────────────────────────────────────

const POSITIVE_THRESHOLD = 0.05;
const NEGATIVE_THRESHOLD = -0.05;

function classifyComparative(comparative: number): SentimentLabel {
  if (comparative >= POSITIVE_THRESHOLD) return 'positive';
  if (comparative <= NEGATIVE_THRESHOLD) return 'negative';
  return 'neutral';
}

// ─── Per-post analysis ────────────────────────────────────────────────────────

/**
 * Analyze a single post title.
 * Only the `title` field is used — no body, no comments, no author.
 */
export function analyzeTitle(title: string): SentimentResult {
  const result = analyzer.analyze(title);
  const label = classifyComparative(result.comparative);
  return {
    score: result.score,
    comparative: result.comparative,
    label,
  };
}

// ─── Batch analysis + vibe calculation ───────────────────────────────────────

/**
 * Analyze all posts and compute the overall subreddit vibe.
 *
 * Vibe score formula:
 *   avgComparative = mean of all post comparatives
 *   vibeScore = clamp((avgComparative / 5 + 1) / 2 * 100, 0, 100)
 *
 * This maps the comparative range [-5, +5] → [0, 100].
 * A perfectly neutral subreddit (avg = 0) scores 50.
 */
export function analyzePostsVibe(
  subreddit: string,
  posts: RedditPost[]
): VibeResult {
  if (posts.length === 0) {
    return {
      subreddit,
      totalPosts: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      positivePercent: 0,
      neutralPercent: 0,
      negativePercent: 0,
      vibeScore: 50,
      vibeLabel: 'neutral',
      analyzedPosts: [],
    };
  }

  const analyzedPosts: AnalyzedPost[] = posts.map((post) => ({
    ...post,
    sentiment: analyzeTitle(post.title),
  }));

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let sumComparative = 0;

  for (const post of analyzedPosts) {
    sumComparative += post.sentiment.comparative;
    if (post.sentiment.label === 'positive') positiveCount++;
    else if (post.sentiment.label === 'negative') negativeCount++;
    else neutralCount++;
  }

  const total = analyzedPosts.length;
  const avgComparative = sumComparative / total;

  // Map avgComparative [-5, +5] → vibeScore [0, 100]
  // Formula: (comparative / 5 + 1) / 2 * 100
  const rawScore = ((avgComparative / 5 + 1) / 2) * 100;
  const vibeScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  const vibeLabel: SentimentLabel =
    vibeScore >= 55 ? 'positive' : vibeScore <= 45 ? 'negative' : 'neutral';

  // Compute integer percentages that deterministically sum to 100% using Largest Remainder Method
  const { positivePercent, neutralPercent, negativePercent } = computePercentages100(
    positiveCount,
    neutralCount,
    negativeCount,
    total
  );

  return {
    subreddit,
    totalPosts: total,
    positiveCount,
    neutralCount,
    negativeCount,
    positivePercent,
    neutralPercent,
    negativePercent,
    vibeScore,
    vibeLabel,
    analyzedPosts,
  };
}

/**
 * Largest Remainder Method (Hare-Niemeyer) to round counts into integer percentages
 * that always sum to exactly 100%.
 */
function computePercentages100(
  pos: number,
  neu: number,
  neg: number,
  total: number
): { positivePercent: number; neutralPercent: number; negativePercent: number } {
  if (total === 0) {
    return { positivePercent: 0, neutralPercent: 0, negativePercent: 0 };
  }

  const items = [
    { key: 'positivePercent' as const, exact: (pos / total) * 100 },
    { key: 'neutralPercent' as const, exact: (neu / total) * 100 },
    { key: 'negativePercent' as const, exact: (neg / total) * 100 },
  ];

  const withFloors = items.map((item) => ({
    ...item,
    floor: Math.floor(item.exact),
    rem: item.exact - Math.floor(item.exact),
  }));

  const currentSum = withFloors.reduce((acc, item) => acc + item.floor, 0);
  let remainderNeeded = 100 - currentSum;

  // Sort by remainder descending
  const sorted = [...withFloors].sort((a, b) => b.rem - a.rem);

  const res: Record<'positivePercent' | 'neutralPercent' | 'negativePercent', number> = {
    positivePercent: 0,
    neutralPercent: 0,
    negativePercent: 0,
  };

  for (const item of sorted) {
    if (remainderNeeded > 0) {
      res[item.key] = item.floor + 1;
      remainderNeeded--;
    } else {
      res[item.key] = item.floor;
    }
  }

  return res;
}

