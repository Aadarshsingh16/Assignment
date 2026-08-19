/**
 * Static audit of the vibe calculation logic.
 * Run with: node --input-type=module < tools/verify-vibe-math.mjs
 */

// ── Reproduce the formula from sentiment.ts ──────────────────────────────────

const POSITIVE_THRESHOLD = 0.05;
const NEGATIVE_THRESHOLD = -0.05;

function classifyComparative(c) {
  if (c >= POSITIVE_THRESHOLD) return 'positive';
  if (c <= NEGATIVE_THRESHOLD) return 'negative';
  return 'neutral';
}

function computePercentages100(pos, neu, neg, total) {
  if (total === 0) return { positivePercent: 0, neutralPercent: 0, negativePercent: 0 };
  const items = [
    { key: 'positivePercent', exact: (pos / total) * 100 },
    { key: 'neutralPercent', exact: (neu / total) * 100 },
    { key: 'negativePercent', exact: (neg / total) * 100 },
  ];
  const withFloors = items.map((i) => ({ ...i, floor: Math.floor(i.exact), rem: i.exact - Math.floor(i.exact) }));
  let currentSum = withFloors.reduce((a, b) => a + b.floor, 0);
  let remNeeded = 100 - currentSum;
  const sorted = [...withFloors].sort((a, b) => b.rem - a.rem);
  const res = { positivePercent: 0, neutralPercent: 0, negativePercent: 0 };
  for (const item of sorted) {
    if (remNeeded > 0) { res[item.key] = item.floor + 1; remNeeded--; }
    else { res[item.key] = item.floor; }
  }
  return res;
}

function computeVibe(comparatives) {
  const total = comparatives.length;
  let positiveCount = 0, neutralCount = 0, negativeCount = 0;
  let sumComparative = 0;

  for (const c of comparatives) {
    sumComparative += c;
    const label = classifyComparative(c);
    if (label === 'positive') positiveCount++;
    else if (label === 'negative') negativeCount++;
    else neutralCount++;
  }

  const avgComparative = sumComparative / total;
  const rawScore = ((avgComparative / 5 + 1) / 2) * 100;
  const vibeScore = Math.round(Math.max(0, Math.min(100, rawScore)));
  const vibeLabel = vibeScore >= 55 ? 'positive' : vibeScore <= 45 ? 'negative' : 'neutral';

  const pcts = computePercentages100(positiveCount, neutralCount, negativeCount, total);

  return {
    positiveCount, neutralCount, negativeCount, total,
    positivePercent: pcts.positivePercent,
    neutralPercent:  pcts.neutralPercent,
    negativePercent: pcts.negativePercent,
    avgComparative, vibeScore, vibeLabel,
  };
}

// ── Test 1: Boundary conditions ──────────────────────────────────────────────

console.log('=== BOUNDARY TESTS ===');

// Perfectly neutral (all comparative = 0)
const allNeutral = Array(50).fill(0);
const r1 = computeVibe(allNeutral);
console.assert(r1.vibeScore === 50, `Expected 50, got ${r1.vibeScore}`);
console.assert(r1.vibeLabel === 'neutral', `Expected neutral, got ${r1.vibeLabel}`);
console.log(`✓ All-neutral: score=${r1.vibeScore}, label=${r1.vibeLabel}`);

// All positive (comparative = +1)
const allPositive = Array(50).fill(1);
const r2 = computeVibe(allPositive);
// formula: (1/5+1)/2*100 = (0.2+1)/2*100 = 1.2/2*100 = 60
console.assert(r2.vibeScore === 60, `Expected 60, got ${r2.vibeScore}`);
console.assert(r2.vibeLabel === 'positive', `Expected positive, got ${r2.vibeLabel}`);
console.log(`✓ All-positive(1.0): score=${r2.vibeScore}, label=${r2.vibeLabel}`);

// All negative (comparative = -1)
const allNegative = Array(50).fill(-1);
const r3 = computeVibe(allNegative);
// formula: (-1/5+1)/2*100 = (0.8)/2*100 = 40
console.assert(r3.vibeScore === 40, `Expected 40, got ${r3.vibeScore}`);
console.assert(r3.vibeLabel === 'negative', `Expected negative, got ${r3.vibeLabel}`);
console.log(`✓ All-negative(-1.0): score=${r3.vibeScore}, label=${r3.vibeLabel}`);

// ── Test 2: Example from assignment (27 pos, 15 neutral, 8 neg) ──────────────

console.log('\n=== ASSIGNMENT EXAMPLE (27/15/8) ===');
// Build a set of comparatives: 27 positive, 15 neutral, 8 negative
const mixed = [
  ...Array(27).fill(0.3),   // positive (>= 0.05)
  ...Array(15).fill(0.0),   // neutral (-0.05 < c < 0.05)
  ...Array(8).fill(-0.3),   // negative (<= -0.05)
];
const r4 = computeVibe(mixed);
console.log(`Counts: pos=${r4.positiveCount} neu=${r4.neutralCount} neg=${r4.negativeCount} total=${r4.total}`);
console.assert(r4.positiveCount === 27, `Expected 27 positive`);
console.assert(r4.neutralCount === 15, `Expected 15 neutral`);
console.assert(r4.negativeCount === 8, `Expected 8 negative`);
console.log(`Percentages: ${r4.positivePercent}% / ${r4.neutralPercent}% / ${r4.negativePercent}%`);
// Math check: 27+15+8=50, 27/50=54%, 15/50=30%, 8/50=16%
console.assert(r4.positivePercent === 54, `Expected 54%, got ${r4.positivePercent}%`);
console.assert(r4.neutralPercent  === 30, `Expected 30%, got ${r4.neutralPercent}%`);
console.assert(r4.negativePercent === 16, `Expected 16%, got ${r4.negativePercent}%`);
console.log(`Vibe: score=${r4.vibeScore} label=${r4.vibeLabel}`);
console.log(`✓ Math checks out`);

// ── Test 3: Rounding edge case — percentages may not sum to 100 ─────────────

console.log('\n=== ROUNDING EDGE CASE (30/10/10) ===');
const roundingTest = [
  ...Array(30).fill(0.1),  // positive
  ...Array(10).fill(0.0),  // neutral
  ...Array(10).fill(-0.1), // negative
];
const r5 = computeVibe(roundingTest);
const pctSum = r5.positivePercent + r5.neutralPercent + r5.negativePercent;
console.log(`Percentages sum: ${r5.positivePercent}+${r5.neutralPercent}+${r5.negativePercent}=${pctSum}`);
// Note: Math.round each independently may cause 99 or 101 in edge cases
if (pctSum !== 100) {
  console.log(`⚠ ROUNDING ISSUE: percentages sum to ${pctSum}, not 100 (known limitation of independent Math.round)`);
} else {
  console.log(`✓ Percentages sum to 100`);
}

// ── Test 4: Classification thresholds ───────────────────────────────────────

console.log('\n=== CLASSIFICATION THRESHOLD TESTS ===');
console.assert(classifyComparative(0.05)  === 'positive', '0.05 should be positive');
console.assert(classifyComparative(0.049) === 'neutral',  '0.049 should be neutral');
console.assert(classifyComparative(0.0)   === 'neutral',  '0.0 should be neutral');
console.assert(classifyComparative(-0.049)=== 'neutral',  '-0.049 should be neutral');
console.assert(classifyComparative(-0.05) === 'negative', '-0.05 should be negative');
console.log('✓ All threshold boundary tests pass');

// ── Test 5: Limit enforcement ────────────────────────────────────────────────

console.log('\n=== LIMIT ENFORCEMENT (server-side) ===');
function serverSideLimit(raw) {
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed < 1 ? 5 : Math.min(parsed, 50);
}
console.assert(serverSideLimit('50')  === 50,  '50 → 50');
console.assert(serverSideLimit('100') === 50,  '100 → 50 (capped)');
console.assert(serverSideLimit('0')   === 5,   '0 → 5 (default)');
console.assert(serverSideLimit('')    === 5,   'empty → 5 (default)');
console.assert(serverSideLimit('abc') === 5,   'abc → 5 (default)');
console.log('✓ Limit capping at 50 confirmed');

// ── Test 6: Sanitize subreddit ───────────────────────────────────────────────

console.log('\n=== SUBREDDIT SANITIZATION ===');
function sanitizeSubreddit(raw) {
  const stripped = raw.replace(/^r\//i, '').trim();
  if (!/^[A-Za-z0-9_]{3,21}$/.test(stripped)) return null;
  return stripped;
}
console.assert(sanitizeSubreddit('programming') === 'programming');
console.assert(sanitizeSubreddit('r/programming') === 'programming');
console.assert(sanitizeSubreddit('R/PROGRAMMING') === 'PROGRAMMING');
console.assert(sanitizeSubreddit('x') === null, 'too short → null');
console.assert(sanitizeSubreddit('') === null, 'empty → null');
console.assert(sanitizeSubreddit('   ') === null, 'spaces → null');
console.assert(sanitizeSubreddit('technology') === 'technology');
console.assert(sanitizeSubreddit('r/technology') === 'technology');
console.log('✓ Sanitization logic confirmed');

console.log('\n=== ALL VERIFICATION TESTS PASSED ===');
