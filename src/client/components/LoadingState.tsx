type LoadingStateProps = {
  subreddit: string;
};

export function LoadingState({ subreddit }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <div className="loading-pulse">
        <div className="loading-icon">📡</div>
        <div className="loading-rings">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
        </div>
      </div>
      <p className="loading-text">
        Analyzing <strong>r/{subreddit}</strong>…
      </p>
      <p className="loading-sub">Fetching hot posts and running sentiment analysis</p>

      {/* Skeleton cards */}
      <div className="skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skeleton-line skeleton-short" />
            <div className="skeleton-line skeleton-long" />
            <div className="skeleton-line skeleton-medium" />
          </div>
        ))}
      </div>
    </div>
  );
}
