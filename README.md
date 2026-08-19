# 🔴 The Subreddit Vibe Check

An interactive Reddit Devvit Web application that analyzes the sentiment of a community's latest 50 HOT posts and presents the results through an interactive sentiment analytics dashboard.

The user enters a public subreddit, the server retrieves up to 50 HOT posts through Reddit's official API via Devvit, and the client analyzes the post titles using AFINN-165 to generate sentiment classifications, distribution percentages, and an overall Vibe Score.

---

## 🚀 Features

- 🔍 **Subreddit Search:** Flexible search for any public subreddit.
- ⚡ **Flexible Input Handling:** Full support for both plain name (`technology`) and prefixed (`r/technology`) inputs.
- 💡 **Quick Subreddit Suggestions:** One-click instant analysis buttons for popular communities.
- 📡 **Official Reddit HOT Post Retrieval:** Server-side fetching of up to 50 HOT posts using Reddit's authenticated Devvit API.
- 🧠 **Client-Side AFINN-165 Sentiment Analysis:** Real-time lexical sentiment scoring performed 100% inside the browser.
- 🏷️ **Three-Tier Sentiment Classification:** Automatic categorization into **Positive**, **Neutral**, and **Negative** states based on comparative scores.
- 📊 **Deterministic 100% Distribution:** Uses the Largest Remainder Method (Hare-Niemeyer) so distribution percentages always sum to exactly 100%.
- 🎯 **Overall 0–100 Vibe Score:** Normalized score reflecting the collective tone of the analyzed posts.
- 🏷️ **Vibe Label:** Dynamic community label (**Positive**, **Neutral**, or **Negative**) derived from the Vibe Score.
- 🎴 **Individual Post Sentiment Cards:** Detailed breakdown for every post, displaying title, sentiment badge, upvotes, comment count, author, relative timestamp, and Reddit link.
- ⏳ **Loading States:** Elegant loading skeleton UI during API fetches.
- ⚠️ **Error States:** Informative error cards for invalid names, private/non-existent subreddits, empty feeds, or network failures.
- 📱 **Responsive UI:** Dynamic layout optimized across desktop, tablet, and mobile views.
- ♿ **Accessibility Improvements:** Semantic HTML markup, keyboard accessibility, high contrast color coding, and ARIA labels.
- 🎨 **Dark Premium Visual Design:** Sleek modern aesthetics featuring dark gradients and responsive micro-animations.

---

## 🛠️ How It Works

The architecture follows a decoupled flow where server-side operations interact with Reddit's backend APIs while sentiment computations are executed client-side inside the iframe sandbox:

```mermaid
flowchart TD
    A[User Input r/subreddit] --> B[React Client useVibeCheck]
    B -->|GET /api/hot-posts?subreddit=...&limit=50| C[Hono Server Route src/server/routes/api.ts]
    C -->|Devvit Context reddit.getHotPosts| D[Reddit Platform API]
    D -->|Raw Post Listings| C
    C -->|Normalized Post Data| B
    B -->|Post Titles| E[AFINN-165 Sentiment Engine src/client/utils/sentiment.ts]
    E --> F[Classify Posts Positive / Neutral / Negative]
    F --> G[Largest Remainder Method 100% Distribution]
    F --> H[Compute Normalized 0-100 Vibe Score & Vibe Label]
    G --> I[Render Interactive Dashboard game.tsx]
    H --> I
```

### Key Execution Highlights

- **Server-Side Reddit API Access:** Handled securely via Devvit's serverless Node.js environment (`@devvit/web/server`).
- **Client-Side Sentiment Engine:** Executed entirely inside the React iframe browser context (`src/client/utils/sentiment.ts`).
- **No External AI Service:** Sentiment analysis requires zero external API keys, machine learning models, or LLM endpoints.
- **Title-Based Analysis:** Post **TITLES** are the single source of input for sentiment calculation.

---

## 🏗️ Architecture

### Client (`src/client`)

A React 19 + TypeScript dashboard rendered inside the Devvit Web iframe sandbox:

- **`splash.html` / `splash.tsx`:** The initial lightweight inline view entry point displayed in the Reddit feed. Provides a quick CTA to launch the main app.
- **`game.html` / `game.tsx`:** The full expanded dashboard view rendering the search interface, vibe metrics, charts, and post breakdowns.
- **`hooks/useVibeCheck.ts`:** Custom React hook orchestrating API request lifecycle, loading/error state management, and triggering sentiment analysis.
- **`utils/sentiment.ts`:** Core sentiment engine wrapper, classification threshold logic, Vibe Score formula, and Hare-Niemeyer percentage calculator.
- **`components/Navbar.tsx`:** Top brand header with reset action.
- **`components/SearchBar.tsx`:** Input control with validation, submit handling, loading state, and quick suggestion pills.
- **`components/VibeScore.tsx`:** Hero component showcasing the 0–100 Vibe Score gauge, vibe badge label, and total post count.
- **`components/SentimentSummary.tsx`:** Breakdown cards showing exact post counts and distribution percentages.
- **`components/SentimentChart.tsx`:** Visual distribution bar chart visualizing Positive, Neutral, and Negative proportions.
- **`components/PostList.tsx`:** Scrollable list of analyzed posts.
- **`components/PostCard.tsx`:** Individual card component displaying post metadata, sentiment tag, score, upvotes, comments, author, timestamp, and direct permalink.
- **`components/LoadingState.tsx`:** Animated skeleton loader.
- **`components/ErrorState.tsx`:** Context-aware error message card with retry action.

### Server (`src/server`)

A Hono serverless application running in the Devvit backend environment:

- **`index.ts`:** Main entry point mounting API routes.
- **`routes/api.ts`:** Contains the primary endpoint `GET /api/hot-posts`:
  - Validates and normalizes the `subreddit` query parameter (strips `r/` prefix, verifies 3–21 character alphanumeric regex).
  - Enforces fetch limit parameters (default 5, capped at up to 50 posts).
  - Calls Devvit's authenticated `reddit.getHotPosts()` API.
  - Catches 404, private, forbidden, or empty subreddit exceptions.
  - Normalizes raw Reddit posts into sanitized, type-safe JSON objects containing `id`, `title`, `author`, `score`, `comments`, `url`, `permalink`, `createdAt`, and `thumbnail`.

### Shared Types (`src/shared/api.ts`)

Central TypeScript definitions shared between client and server:
- `RedditPost`: Schema for normalized post metadata.
- `HotPostsResponse`: API response payload for successful fetches.
- `HotPostsError`: Standardized error contract containing status, message, and error code (`NOT_FOUND`, `INVALID`, `API_ERROR`, `EMPTY`).

---

## 🧪 Sentiment Analysis

### Methodology & Engine

- **Library:** [`sentiment`](https://github.com/thisandagain/sentiment)
- **Lexicon:** AFINN-165 (rule-based lexical dictionary containing 3,382 English words scored from -5 to +5).
- **Execution Location:** 100% client-side in the browser.
- **Analyzed Input:** Reddit post **titles** only (excludes body text, comments, and author handles).

### Scoring Metrics

For each post title, the engine computes a raw valence `score` and a `comparative` score:

$$\text{comparative} = \frac{\text{score}}{\text{totalWordCount}}$$

### Classification Thresholds

Each post title is categorized using the comparative score:

- **Positive:** $\text{comparative} \ge +0.05$
- **Negative:** $\text{comparative} \le -0.05$
- **Neutral:** $-0.05 < \text{comparative} < +0.05$

> ℹ️ **Note on Neutral Sentiment:** Post titles containing neutral vocabulary or terms outside the AFINN-165 dictionary score `0.0` comparative sentiment and fall into the **Neutral** classification.

---

## 📐 Vibe Score Calculation

The overall subreddit **Vibe Score** ($0$–$100$) represents the aggregated emotional tone of the analyzed posts.

### Step-by-Step Formula

1. **Calculate Average Comparative Sentiment:**
   Compute the arithmetic mean of comparative scores across all $N$ analyzed posts ($N \le 50$):

   $$\bar{C} = \frac{1}{N} \sum_{i=1}^{N} \text{comparative}_i$$

2. **Normalize to 0–100 Scale:**
   Map the comparative range $[-5, +5]$ to $[0, 100]$:

   $$\text{rawScore} = \left( \frac{\frac{\bar{C}}{5} + 1}{2} \right) \times 100$$

3. **Round and Clamp:**
   Ensure the score is an integer bounded strictly between $0$ and $100$:

   $$\text{VibeScore} = \text{clamp}\left( \text{round}(\text{rawScore}), 0, 100 \right)$$

   *A comparative average of $\bar{C} = 0$ evaluates to an exact Vibe Score of **50** (Neutral baseline).*

4. **Determine Vibe Label:**
   - **Positive:** $\text{VibeScore} \ge 55$
   - **Negative:** $\text{VibeScore} \le 45$
   - **Neutral:** $45 < \text{VibeScore} < 55$

---

## 🧮 Percentage Calculation (Hare-Niemeyer Method)

To guarantee that the Positive %, Neutral %, and Negative % distribution values displayed on the dashboard always sum to **exactly 100%**, the project uses the **Largest Remainder Method** (Hare-Niemeyer method).

### The Rounding Problem

When calculating independent percentages for 3 categories, standard rounding (`Math.round`) can produce totals of 99% or 101%:

$$\text{e.g., } \frac{1}{3} = 33.333\% \xrightarrow{\text{round}} 33\% \implies 33\% + 33\% + 33\% = 99\%$$

### Hare-Niemeyer Solution (`computePercentages100`)

1. Calculate exact floating-point percentages for positive, neutral, and negative counts.
2. Truncate each percentage down to its floor integer value.
3. Calculate the remaining percentage points required to reach 100: $\text{remainderNeeded} = 100 - \sum \text{floor}$.
4. Sort categories by their fractional remainders in descending order.
5. Distribute $+1\%$ to the top categories until $\text{remainderNeeded} = 0$.

---

## 💻 Tech Stack

### Frontend
- **React 19:** UI component library.
- **TypeScript:** Type-safe development.
- **CSS:** Vanilla CSS styled with custom design tokens.

### Backend
- **Hono (v4):** Lightweight, ultra-fast web framework.
- **Devvit Web Server:** `@devvit/web/server` integration.

### Platform & API
- **Reddit Devvit:** `@devvit/web` framework for Reddit embedded apps.
- **Devvit Reddit Client:** `reddit.getHotPosts()` server SDK for fetching subreddit data.

### Sentiment Analysis
- **`sentiment` (v5):** AFINN-165 lexical dictionary engine.

### Tooling & Environment
- **Vite (v8):** Fast frontend module bundler and watch server.
- **ESLint (v10):** Code quality and linting rules.
- **npm:** Package management.

> 💡 **Node.js Environment:** Node.js 24+ is recommended for local development (matches project engine specification `>=24.0.0`).

---

## 📁 Project Structure

```
hot-posts/
├── devvit.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── .prettierrc
├── AGENTS.md
├── LICENSE
├── README.md
├── public/
│   └── snoo.png
├── src/
│   ├── client/
│   │   ├── components/
│   │   │   ├── ErrorState.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SentimentChart.tsx
│   │   │   ├── SentimentSummary.tsx
│   │   │   └── VibeScore.tsx
│   │   ├── hooks/
│   │   │   ├── useCounter.ts
│   │   │   └── useVibeCheck.ts
│   │   ├── utils/
│   │   │   └── sentiment.ts
│   │   ├── game.html
│   │   ├── game.tsx
│   │   ├── global.ts
│   │   ├── index.css
│   │   ├── module.d.ts
│   │   ├── splash.html
│   │   └── splash.tsx
│   ├── server/
│   │   ├── core/
│   │   │   └── post.ts
│   │   ├── routes/
│   │   │   ├── api.ts
│   │   │   ├── forms.ts
│   │   │   ├── menu.ts
│   │   │   └── triggers.ts
│   │   └── index.ts
│   └── shared/
│       └── api.ts
└── tools/
    ├── tsconfig.base.json
    ├── tsconfig.client.json
    ├── tsconfig.server.json
    ├── tsconfig.shared.json
    ├── tsconfig.vite.json
    └── verify-vibe-math.mjs
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 24+ recommended (`npm` v10+)
- Devvit CLI (`npm install -g devvit`)

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Local Development & Playtest

Start the Devvit playtest environment:

```bash
npm run dev
```

`npm run dev` starts the Devvit playtest environment by executing `devvit playtest`. It compiles client and server assets, watches for file changes, uploads the app build to the Devvit sandbox, and renders the custom post inside the designated playtest subreddit (`r/hot_posts_dev`).

---

## 🧪 Validation

The project maintains code quality with automated type checks, linting, production build verification, and math test suites:

```bash
# 1. Type-check TypeScript codebase
npm run test:types

# 2. Run ESLint checks
npm run lint

# 3. Verify static math & algorithm logic
node tools/verify-vibe-math.mjs

# 4. Production build test
npm run build
```

### Validation Command Descriptions

- **`npm run test:types`:** Executes `tsc --build` to ensure strict TypeScript type safety across client, server, and shared code without emitting output.
- **`npm run lint`:** Runs `eslint` across the codebase to enforce code formatting, quality rules, and React hooks best practices.
- **`node tools/verify-vibe-math.mjs`:** Runs a standalone verification script testing edge cases, boundary conditions, comparative thresholds, and percentage calculations.
- **`npm run build`:** Runs `vite build` to compile production assets for the client iframe and server entry points.

### Validation Status Summary

| Check | Status |
| :--- | :---: |
| TypeScript | ✅ |
| ESLint | ✅ |
| Production build | ✅ |
| Vibe math verification | ✅ |

---

## 🧪 Manual Testing

The application has been manually tested across active public communities and edge cases:

### Subreddits Tested
- `r/programming` ✅
- `r/technology` ✅
- `r/gaming` ✅
- `r/artificial` ✅

### Edge Cases Tested
- **Input formatting:** Plain name (`technology`) vs prefixed (`r/technology`) — both sanitize and resolve correctly.
- **Empty input:** Submitting empty query triggers client-side validation without sending network requests.
- **Invalid subreddit name:** Inputs with invalid characters or out of range lengths (e.g. `a!b`) return structured `INVALID` error states.
- **Non-existent / private subreddit:** Non-existent subreddits (e.g. `r/this_subreddit_does_not_exist_12345`) trigger clean 404 `NOT_FOUND` error messages.

---

## ♿ Accessibility & UX

The user interface incorporates accessibility and user experience best practices:

- **ARIA Labels:** Explicit aria-labels attached to subreddit search input fields.
- **Descriptive External Links:** External links to Reddit posts feature descriptive text and `target="_blank" rel="noopener noreferrer"`.
- **Keyboard Focus States:** Clear outline and contrast indicators for interactive search inputs and buttons.
- **High-Contrast Typography:** Modern typography tailored against dark backgrounds for optimal readability.
- **Responsive Layouts:** Flexible CSS Grid and Flexbox layouts accommodating desktop, tablet, and mobile viewports.
- **No Horizontal Overflow:** Containers use bounded overflow controls to eliminate unwanted horizontal scrollbars.

---

## 🔒 Security & Data Handling

- **Server-Side API Authentication:** All Reddit API calls occur server-side through Devvit's authenticated context.
- **No Hardcoded Credentials:** Zero API keys, OAuth tokens, or client secrets are exposed in client-side bundles or source code.
- **Client-Side Processing:** Sentiment analysis executes entirely in the user's browser, preventing post titles from being transmitted to third-party services.
- **No External Dependencies:** No external AI or third-party sentiment APIs are queried.
- **Clean Repository:** `.gitignore` excludes build artifacts (`dist/`), `node_modules/`, and local environment files.

---

## 📌 Technical Limitations

- **Platform Dependency:** Built specifically as an embedded app for Reddit's Devvit platform.
- **Lexical Sentiment Scope:** AFINN-165 evaluates literal dictionary word valences; it cannot detect sarcasm, irony, subtle context, or domain-specific slang.
- **Language Scope:** AFINN-165 dictionary is primarily English-oriented. Non-English titles default to neutral ($0.0$).
- **Reddit Listing Limit:** Fetches up to 50 HOT posts per request as constrained by the application and Reddit API pagination limits.
- **Subreddit Access Control:** Private, banned, or restricted subreddits are subject to Reddit API authorization policies.

---

## ✅ Assignment Compliance

| Requirement | Implementation | Status |
| :--- | :--- | :---: |
| Subreddit input/selection | Search bar with plain and `r/` prefix support + quick suggestions | [x] |
| HOT post retrieval | Server-side fetching via Devvit `reddit.getHotPosts()` | [x] |
| Up to 50 posts | Configured limit parameter returning up to 50 posts | [x] |
| Client-side sentiment analysis | Executed locally via AFINN-165 `sentiment` npm package | [x] |
| Positive/Neutral/Negative classification | Comparative thresholds ($\ge +0.05$, $\le -0.05$, else neutral) | [x] |
| Sentiment distribution | Calculated via Largest Remainder Method (guaranteed 100%) | [x] |
| Vibe Score | Bounded 0–100 scale derived from average comparative score | [x] |
| Individual post analysis | Post cards displaying score, badge, metadata, and link | [x] |
| Responsive dashboard | CSS-driven dark design optimized for desktop and mobile | [x] |
| Error handling | Context-aware UI for invalid, private, empty, or network errors | [x] |
| Real Reddit API data | Authenticated live post fetch via Devvit platform | [x] |
| Devvit Web implementation | React 19 + Hono architecture on `@devvit/web` | [x] |

---

## 🔗 Live Demo & Source Code

- **Live Demo:** [https://www.reddit.com/r/hot_posts_dev/?playtest=hot-posts](https://www.reddit.com/r/hot_posts_dev/?playtest=hot-posts)
- **Source Code:** [https://github.com/Aadarshsingh16/Assignment](https://github.com/Aadarshsingh16/Assignment)

---

## 👤 Author

**Adarsh Singh**  
B.Tech — Computer Science (Artificial Intelligence)  
ABESIT, Ghaziabad
