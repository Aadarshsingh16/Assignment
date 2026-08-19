# The Subreddit Vibe Check

An interactive Devvit Web application for Reddit that fetches the top 50 HOT posts from any subreddit, performs client-side sentiment analysis on post titles using AFINN-165, and presents a real-time sentiment analytics dashboard.

---

## Overview

**The Subreddit Vibe Check** gives Redditors an instant pulse on community mood. Built using **Devvit Web**, the app runs as an interactive custom post directly on Reddit.

Users enter or select any public subreddit. The app's secure Node.js serverless backend fetches the latest 50 hot posts via Reddit's official API, and the React client analyzes post titles in real-time to compute sentiment distributions, an overall 0–100 Vibe Score, and individual post breakdowns.

---

## Features

- 🔍 **Subreddit Search:** Search any public subreddit (supports inputs like `technology` or `r/technology`).
- 📡 **Official Reddit API:** Server-side retrieval of up to 50 hot posts via Devvit's authenticated `reddit.getHotPosts()` client.
- 🧠 **Client-Side Sentiment Analysis:** Real-time sentiment evaluation performed entirely in the browser using AFINN-165 (no external AI services, no third-party API dependencies).
- 📊 **Deterministic Percentages:** Employs the Largest Remainder Method (Hare-Niemeyer) so displayed sentiment distribution percentages always sum to exactly 100%.
- 📈 **Animated Analytics:** Smooth visual counter for Vibe Score (0–100), animated sentiment distribution bars, and per-post sentiment tags.
- 💬 **Detailed Post Cards:** Shows post title, sentiment classification, comparative score, upvotes, comment count, author, relative timestamp, and direct Reddit link.
- 🎨 **Dark Premium UI:** High-contrast responsive design optimized for desktop, tablet, and mobile views.
- 🛡️ **Robust Error Handling:** Gracefully handles invalid subreddits, private/non-existent subreddits, empty listings, and network timeouts without crashing.

---

## How It Works

```
User Input (e.g. "programming")
  │
  ▼
React Client (useVibeCheck hook)
  │  GET /api/hot-posts?subreddit=programming&limit=50
  ▼
Devvit Serverless Backend (Hono route in src/server/routes/api.ts)
  │  reddit.getHotPosts({ subredditName: "programming", limit: 50, pageSize: 50 })
  ▼
Official Reddit API (Authenticated via Devvit Platform)
  │  Returns Listing<Post> (up to 50 hot posts)
  ▼
Normalized Data Payload (id, title, author, score, comments, permalink, etc.)
  │  JSON Response
  ▼
React Client (src/client/utils/sentiment.ts)
  │  1. Run Sentiment.analyze(post.title) on each title (client-side)
  │  2. Classify titles: Positive (≥ +0.05), Negative (≤ -0.05), Neutral (else)
  │  3. Calculate exact % using Largest Remainder Method (sums to 100%)
  │  4. Compute overall Vibe Score & Vibe Label
  ▼
Interactive Dashboard Rendered (game.tsx)
```

---

## Sentiment Analysis

### Engine & Dictionary
- **Library:** [`sentiment`](https://github.com/thisandagain/sentiment) (AFINN-165 word list by Andrew Slatkin).
- **Execution:** 100% Client-Side inside the browser sandbox.
- **Scope:** Analyzes the **`title`** property of each post exclusively.

### Classification Logic
The AFINN-165 library produces a `comparative` score calculated as:
$$\text{comparative} = \frac{\text{score}}{\text{wordCount}}$$

For post titles, `comparative` typically ranges between $-1.0$ and $+1.0$.

Classification thresholds applied:
- **Positive:** $\text{comparative} \ge +0.05$
- **Negative:** $\text{comparative} \le -0.05$
- **Neutral:** $-0.05 < \text{comparative} < +0.05$ (includes titles with no dictionary-matched words)

---

## Vibe Score Calculation

The overall subreddit **Vibe Score** ($0$ to $100$) is computed by mapping the average comparative score of all analyzed posts:

1. **Average Comparative:**
   $$\bar{C} = \frac{1}{N} \sum_{i=1}^{N} \text{comparative}_i$$

2. **Vibe Score Formula:**
   $$\text{VibeScore} = \text{clamp}\left( \text{round}\left( \frac{\frac{\bar{C}}{5} + 1}{2} \times 100 \right), 0, 100 \right)$$

   *A perfectly neutral subreddit ($\bar{C} = 0$) evaluates to a score of **50**.*

3. **Vibe Label:**
   - **Positive:** $\text{VibeScore} \ge 55$
   - **Negative:** $\text{VibeScore} \le 45$
   - **Neutral:** $45 < \text{VibeScore} < 55$

---

## Tech Stack

- **Frontend:** React 19, TypeScript, CSS (Vanilla CSS + Tailwind CSS v4 tokens)
- **Backend:** Node.js v22 serverless environment, Hono web framework
- **Platform:** Reddit Devvit Web Framework (`@devvit/web`)
- **Reddit API:** Devvit Server SDK (`@devvit/web/server`)
- **Sentiment Analysis:** `sentiment` (AFINN-165 lexical sentiment engine)
- **Build Tooling:** Vite 8, TypeScript `tsc`, ESLint

---

## Development & Playtest

### Installation
```bash
npm install
```

### Local Devvit Playtest
```bash
npm run dev
```
Starts `devvit playtest`, building the client and server assets, uploading to the sandbox, and rendering the custom post inside the designated playtest subreddit (`r/hot_posts_dev`).

---

## Validation & Code Quality

The project maintains clean code standards with zero errors:

```bash
# 1. TypeScript compilation check
npm run test:types

# 2. ESLint linting check
npm run lint

# 3. Production Vite build validation
npm run build
```

### Manual Verification Completed
Tested and verified across key public subreddits:
- `r/programming` ✅
- `r/technology` ✅
- `r/gaming` ✅
- `r/artificial` ✅

---

## Technical Limitations

- **Platform Dependency:** Built specifically for Reddit's Devvit platform as a custom post application.
- **Lexical Scope:** AFINN-165 dictionary is English-only. Non-English titles or heavy domain slang default to neutral ($0.0$).
- **Listing Capping:** Reddit API listings return a maximum of 50 hot posts per query.
- **Subreddit Privacy:** Private, banned, or non-existent subreddits return clean 404/error states as dictated by Reddit API access policies.
