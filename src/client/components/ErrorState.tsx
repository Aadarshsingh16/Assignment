import type { HotPostsError } from '../../shared/api';

type ErrorStateProps = {
  code: HotPostsError['code'];
  message: string;
  onRetry: () => void;
};

const ERROR_ICON: Record<HotPostsError['code'], string> = {
  NOT_FOUND: '🔍',
  INVALID: '⚠️',
  API_ERROR: '📡',
  EMPTY: '📭',
};

const ERROR_TITLE: Record<HotPostsError['code'], string> = {
  NOT_FOUND: "We couldn't find that subreddit.",
  INVALID: 'Invalid subreddit name.',
  API_ERROR: 'Reddit is temporarily unavailable.',
  EMPTY: 'No hot posts were returned.',
};

export function ErrorState({ code, message, onRetry }: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-icon">{ERROR_ICON[code]}</div>
      <h2 className="error-title">{ERROR_TITLE[code]}</h2>
      <p className="error-message">{message}</p>
      <button className="error-retry-btn" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}
