import { useState, type FormEvent } from 'react';

type SearchBarProps = {
  onSearch: (subreddit: string) => void;
  loading: boolean;
};

const SUGGESTIONS = ['technology', 'programming', 'gaming', 'artificial'];

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !loading) {
      onSearch(trimmed);
    }
  };

  const handleSuggestion = (sub: string) => {
    if (!loading) {
      setValue(sub);
      onSearch(sub);
    }
  };

  return (
    <div className="search-section">
      <div className="search-hero">
        <h1 className="search-headline">What's the internet feeling?</h1>
        <p className="search-sub">
          Analyze the latest hot conversations from any subreddit.
        </p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <div className="search-input-wrap">
          <span className="search-prefix">r/</span>
          <input
            id="subreddit-input"
            className="search-input"
            type="text"
            placeholder="technology"
            aria-label="Subreddit name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            id="check-vibe-btn"
            className="search-btn"
            type="submit"
            disabled={loading || !value.trim()}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Analyzing…
              </span>
            ) : (
              'CHECK VIBE'
            )}
          </button>
        </div>
      </form>

      <div className="suggestions">
        <span className="suggestions-label">Try:</span>
        {SUGGESTIONS.map((sub) => (
          <button
            key={sub}
            id={`suggest-${sub}`}
            className="suggestion-chip"
            onClick={() => handleSuggestion(sub)}
            disabled={loading}
          >
            r/{sub}
          </button>
        ))}
      </div>
    </div>
  );
}
