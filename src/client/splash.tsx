import './index.css';

import { navigateTo, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        fontFamily: "'Inter', system-ui, sans-serif",
        background:
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,69,0,0.18) 0%, #0a0a0f 60%)',
        color: '#f0f0f8',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      {/* Icon */}
      <div style={{ fontSize: '48px', lineHeight: 1 }}>📡</div>

      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '0.12em',
            marginBottom: '4px',
          }}
        >
          VIBE CHECK
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#55556a',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          Reddit Sentiment Analytics
        </div>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: '14px',
          color: '#8888aa',
          margin: 0,
          textAlign: 'center',
          maxWidth: '240px',
        }}
      >
        Analyze what any subreddit is feeling.
      </p>

      {/* CTA */}
      <button
        style={{
          background: '#ff4500',
          color: '#fff',
          border: 'none',
          borderRadius: '24px',
          padding: '12px 28px',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s',
        }}
        onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#e63d00';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#ff4500';
        }}
      >
        CHECK THE VIBE →
      </button>

      {/* Footer */}
      <footer
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#55556a',
          whiteSpace: 'nowrap',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
          onClick={() => navigateTo('https://developers.reddit.com/docs')}
        >
          Docs
        </button>
        <span>|</span>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
        >
          r/Devvit
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
