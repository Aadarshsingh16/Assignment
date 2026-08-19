export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// ─── Vibe Check types ───────────────────────────────────────────────────────

/** A normalized Reddit post returned by the server (only safe fields). */
export type RedditPost = {
  id: string;
  title: string;
  author: string;
  score: number;
  comments: number;
  url: string;
  permalink: string;
  createdAt: string; // ISO 8601 string (Date serializes over JSON)
  thumbnail?: string;
};

/** Successful response from GET /api/hot-posts */
export type HotPostsResponse = {
  type: 'hot-posts';
  subreddit: string;
  posts: RedditPost[];
};

/** Error codes for GET /api/hot-posts */
export type HotPostsErrorCode =
  | 'NOT_FOUND'
  | 'INVALID'
  | 'API_ERROR'
  | 'EMPTY';

/** Error response from GET /api/hot-posts */
export type HotPostsError = {
  status: 'error';
  message: string;
  code: HotPostsErrorCode;
};
