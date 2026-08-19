import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { VibeScore } from './components/VibeScore';
import { SentimentSummary } from './components/SentimentSummary';
import { SentimentChart } from './components/SentimentChart';
import { PostList } from './components/PostList';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { useVibeCheck } from './hooks/useVibeCheck';

export const App = () => {
  const { state, checkVibe, reset } = useVibeCheck();

  const isLoading = state.status === 'loading';

  return (
    <div className="app-shell">
      {/* ── Sticky navbar ── */}
      <Navbar onLogoClick={reset} />

      <div className="page-content">
        {/* ── Hero + Search ── */}
        <SearchBar onSearch={checkVibe} loading={isLoading} />

        {/* ── States ── */}
        {state.status === 'idle' && (
          <p className="idle-state">Choose a subreddit to check its vibe.</p>
        )}

        {state.status === 'loading' && (
          <LoadingState subreddit={state.subreddit} />
        )}

        {state.status === 'error' && (
          <ErrorState
            code={state.code}
            message={state.message}
            onRetry={reset}
          />
        )}

        {state.status === 'success' && (
          <div className="results-section">
            {/* ── Vibe score ── */}
            <VibeScore
              score={state.result.vibeScore}
              label={state.result.vibeLabel}
              subreddit={state.result.subreddit}
              totalPosts={state.result.totalPosts}
            />

            {/* ── Sentiment breakdown ── */}
            <SentimentSummary
              positiveCount={state.result.positiveCount}
              neutralCount={state.result.neutralCount}
              negativeCount={state.result.negativeCount}
              positivePercent={state.result.positivePercent}
              neutralPercent={state.result.neutralPercent}
              negativePercent={state.result.negativePercent}
              totalPosts={state.result.totalPosts}
            />

            {/* ── Chart ── */}
            <SentimentChart
              positivePercent={state.result.positivePercent}
              neutralPercent={state.result.neutralPercent}
              negativePercent={state.result.negativePercent}
            />

            {/* ── Post list ── */}
            <PostList posts={state.result.analyzedPosts} />
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
