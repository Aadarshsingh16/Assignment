import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
  HotPostsResponse,
  HotPostsError,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});

// ─── Vibe Check — GET /api/hot-posts ────────────────────────────────────────
//
// Query params:
//   subreddit  string  required  subreddit name (with or without r/ prefix)
//   limit      number  optional  max posts to fetch (default 5 for PoC, 50 for production)
//
// Returns: HotPostsResponse | HotPostsError

/** Sanitize subreddit name: strip r/ prefix, lowercase, keep alphanumeric + underscore */
function sanitizeSubreddit(raw: string): string | null {
  const stripped = raw.replace(/^r\//i, '').trim();
  // Reddit subreddit names: 3-21 chars, alphanumeric + underscore
  if (!/^[A-Za-z0-9_]{3,21}$/.test(stripped)) {
    return null;
  }
  return stripped;
}

api.get('/hot-posts', async (c) => {
  const rawSubreddit = c.req.query('subreddit') ?? '';
  const limitParam = parseInt(c.req.query('limit') ?? '5', 10);
  const limit = isNaN(limitParam) || limitParam < 1 ? 5 : Math.min(limitParam, 50);

  // 1. Validate subreddit name
  const subreddit = sanitizeSubreddit(rawSubreddit);
  if (!subreddit) {
    return c.json<HotPostsError>(
      {
        status: 'error',
        message: `"${rawSubreddit}" is not a valid subreddit name.`,
        code: 'INVALID',
      },
      400
    );
  }

  // 2. Fetch hot posts via Devvit Reddit API
  try {
    const listing = reddit.getHotPosts({
      subredditName: subreddit,
      limit,
      pageSize: limit,
    });

    let posts: Awaited<ReturnType<typeof listing.all>>;
    try {
      posts = await listing.all();
    } catch (fetchErr) {
      // Devvit throws for non-existent or private subreddits
      const errMsg =
        fetchErr instanceof Error ? fetchErr.message.toLowerCase() : '';
      const isNotFound =
        errMsg.includes('not found') ||
        errMsg.includes('404') ||
        errMsg.includes('forbidden') ||
        errMsg.includes('private') ||
        errMsg.includes('banned');

      console.error(`hot-posts fetch error for r/${subreddit}:`, fetchErr);

      if (isNotFound) {
        return c.json<HotPostsError>(
          {
            status: 'error',
            message: `r/${subreddit} doesn't exist or is private.`,
            code: 'NOT_FOUND',
          },
          404
        );
      }

      return c.json<HotPostsError>(
        {
          status: 'error',
          message: 'Reddit API is temporarily unavailable. Please try again.',
          code: 'API_ERROR',
        },
        502
      );
    }

    // 3. Handle empty result
    if (!posts || posts.length === 0) {
      return c.json<HotPostsError>(
        {
          status: 'error',
          message: `No hot posts found in r/${subreddit}.`,
          code: 'EMPTY',
        },
        200
      );
    }

    // 4. Normalize: only expose safe, serializable fields
    const normalized = posts.map((post) => ({
      id: post.id,
      title: post.title,
      author: post.authorName,
      score: post.score,
      comments: post.numberOfComments,
      url: post.url,
      permalink: `https://reddit.com${post.permalink}`,
      createdAt: post.createdAt.toISOString(),
      thumbnail:
        post.thumbnail && post.thumbnail.url ? post.thumbnail.url : undefined,
    }));

    return c.json<HotPostsResponse>({
      type: 'hot-posts',
      subreddit,
      posts: normalized,
    });
  } catch (error) {
    console.error(`hot-posts unexpected error for r/${subreddit}:`, error);
    return c.json<HotPostsError>(
      {
        status: 'error',
        message: 'An unexpected error occurred. Please try again.',
        code: 'API_ERROR',
      },
      500
    );
  }
});
