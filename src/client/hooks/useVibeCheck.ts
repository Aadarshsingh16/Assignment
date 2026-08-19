import { useCallback, useState } from 'react';
import type { HotPostsResponse, HotPostsError } from '../../shared/api';
import { analyzePostsVibe } from '../utils/sentiment';
import type { VibeResult } from '../utils/sentiment';

export type VibeCheckState =
  | { status: 'idle' }
  | { status: 'loading'; subreddit: string }
  | { status: 'success'; result: VibeResult }
  | { status: 'error'; code: HotPostsError['code']; message: string };

/**
 * useVibeCheck — manages the full Reddit fetch → sentiment analysis pipeline.
 *
 * Flow:
 *   1. Call checkVibe(subreddit)
 *   2. Fetches GET /api/hot-posts?subreddit=<name>&limit=50
 *   3. Runs client-side sentiment analysis on all returned post titles
 *   4. Exposes VibeResult with overall score + per-post analysis
 */
export function useVibeCheck() {
  const [state, setState] = useState<VibeCheckState>({ status: 'idle' });

  const checkVibe = useCallback(async (rawSubreddit: string) => {
    const subreddit = rawSubreddit.replace(/^r\//i, '').trim();
    if (!subreddit) return;

    setState({ status: 'loading', subreddit });

    try {
      const res = await fetch(
        `/api/hot-posts?subreddit=${encodeURIComponent(subreddit)}&limit=50`
      );

      const data: HotPostsResponse | HotPostsError = await res.json();

      if ('status' in data && data.status === 'error') {
        setState({
          status: 'error',
          code: data.code,
          message: data.message,
        });
        return;
      }

      const hotPosts = data as HotPostsResponse;

      // Run client-side sentiment analysis on all post titles
      const result = analyzePostsVibe(hotPosts.subreddit, hotPosts.posts);

      setState({ status: 'success', result });
    } catch (err) {
      console.error('useVibeCheck fetch error:', err);
      setState({
        status: 'error',
        code: 'API_ERROR',
        message: 'Reddit is temporarily unavailable. Please try again.',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  return { state, checkVibe, reset };
}
