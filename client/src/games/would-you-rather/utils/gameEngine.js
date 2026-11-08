/**
 * gameEngine.js
 *
 * Core engine for Would You Rather? (FC Bayern Edition).
 * Features:
 * - 10-question session selection with category variety and previous-session deduplication.
 * - Multi-dimensional football preference accumulation.
 * - Semi-centered role-subspace cosine similarity matching.
 * - Outfield vs Goalkeeper role-subspace dimension isolation.
 * - Explicit zero-variance profile exclusion and zero-vector guardrails.
 * - Monotonic affine preference alignment index (0–100%).
 * - Deterministic tie-breaking (exact similarity, raw dot product, alphabetical ID).
 * - Dynamic trait-based explanation generation.
 */

import { ALL_QUESTIONS, QUESTION_CATEGORIES, TRAIT_LABELS } from '../data/questions.js';
import { BAYERN_PLAYERS, ROLE_SUBSPACES, SUBSPACE_DIMENSIONS } from '../data/outcomes.js';

export const STORAGE_PREV_QUESTIONS_KEY = 'bayern_wyr_previous_questions';

/**
 * Shuffles an array immutably using Fisher-Yates algorithm.
 *
 * @param {Array} arr
 * @param {() => number} [rng=Math.random]
 * @returns {Array} Shuffled copy
 */
export function shuffleArray(arr, rng = Math.random) {
  if (!Array.isArray(arr)) return [];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selects exactly 10 questions from the 40-question bank for a session.
 * Ensures balanced category variety (2 questions from each of the 5 categories)
 * and minimizes repetition from the previous session.
 *
 * @param {Array<Object>} [allQuestions=ALL_QUESTIONS]
 * @param {Array<string>} [previousIds=[]]
 * @param {number} [count=10]
 * @param {() => number} [rng=Math.random]
 * @returns {Array<Object>} Exactly 10 selected questions in randomized order
 */
export function selectSessionQuestions(
  allQuestions = ALL_QUESTIONS,
  previousIds = [],
  count = 10,
  rng = Math.random
) {
  if (!Array.isArray(allQuestions) || allQuestions.length === 0) {
    return [];
  }

  // Quotas across the 5 categories to reach exactly 10 questions (2 from each category)
  const quotas = {
    philosophy: QUESTION_CATEGORIES.PHILOSOPHY?.quota || 2,
    match_situations: QUESTION_CATEGORIES.MATCH_SITUATIONS?.quota || 2,
    bayern_identity: QUESTION_CATEGORIES.BAYERN_IDENTITY?.quota || 2,
    player_comparisons: QUESTION_CATEGORIES.PLAYER_COMPARISONS?.quota || 2,
    team_building: QUESTION_CATEGORIES.TEAM_BUILDING?.quota || 2
  };

  const selectedQuestions = [];

  for (const [categoryKey, quota] of Object.entries(quotas)) {
    const categoryQuestions = allQuestions.filter(q => q.category === categoryKey);
    if (categoryQuestions.length === 0) continue;

    // Partition into fresh (not in previous session) and recently used
    const fresh = categoryQuestions.filter(q => !previousIds.includes(q.id));
    const used = categoryQuestions.filter(q => previousIds.includes(q.id));

    // Shuffle both pools
    const shuffledFresh = shuffleArray(fresh, rng);
    const shuffledUsed = shuffleArray(used, rng);

    // Prefer fresh questions, fall back to used if quota exceeds fresh count
    const pool = [...shuffledFresh, ...shuffledUsed];
    const picked = pool.slice(0, quota);
    selectedQuestions.push(...picked);
  }

  // If total falls short of count (e.g. edge cases), fill from remaining pool
  if (selectedQuestions.length < count) {
    const selectedIds = new Set(selectedQuestions.map(q => q.id));
    const remaining = allQuestions.filter(q => !selectedIds.has(q.id));
    const extra = shuffleArray(remaining, rng).slice(0, count - selectedQuestions.length);
    selectedQuestions.push(...extra);
  }

  // Final randomized order so categories are interleaved throughout the session
  return shuffleArray(selectedQuestions.slice(0, count), rng);
}

/**
 * Accumulates weighted trait points from user answers.
 * Supports the 8 core traits, outfield identity dimensions, and goalkeeper command.
 *
 * @param {Array<string>} answers - ['A', 'B', ...]
 * @param {Array<Object>} sessionQuestions
 * @returns {Object} Accumulated score per trait
 */
export function accumulateTraitScores(answers, sessionQuestions) {
  const rawScores = {
    technical_ability: 0,
    tactical_intelligence: 0,
    creativity: 0,
    leadership: 0,
    consistency: 0,
    big_game_mentality: 0,
    directness: 0,
    finishing: 0,
    work_rate: 0,
    team_first: 0,
    defensive_ability: 0,
    goalkeeper_command: 0,
    individual_brilliance: 0,
    long_term_dev: 0
  };

  if (!Array.isArray(answers) || !Array.isArray(sessionQuestions)) {
    return rawScores;
  }

  const opportunities = {};
  Object.keys(rawScores).forEach(k => { opportunities[k] = 0; });

  const length = Math.min(answers.length, sessionQuestions.length);
  for (let i = 0; i < length; i++) {
    const choice = answers[i];
    const q = sessionQuestions[i];
    if (!q) continue;

    const selectedOption = choice === 'A' ? q.optionA : (choice === 'B' ? q.optionB : null);
    if (!selectedOption || !selectedOption.traits) continue;

    // Track total offered weight for each trait across both options in this question
    const aTraits = q.optionA?.traits || {};
    const bTraits = q.optionB?.traits || {};
    const questionTraits = new Set([...Object.keys(aTraits), ...Object.keys(bTraits)]);
    questionTraits.forEach(t => {
      const maxOffered = Math.max(aTraits[t] || 0, bTraits[t] || 0);
      opportunities[t] = (opportunities[t] || 0) + maxOffered;
    });

    for (const [traitKey, weight] of Object.entries(selectedOption.traits)) {
      if (typeof weight === 'number') {
        rawScores[traitKey] = (rawScores[traitKey] || 0) + weight;
        if (traitKey === 'team_first') {
          rawScores.defensive_ability = (rawScores.defensive_ability || 0) + weight;
          opportunities.defensive_ability = (opportunities.defensive_ability || 0) + weight;
        }
      }
    }
  }

  // Trait contribution normalization:
  // Balances trait representation across the 10-question session so that traits
  // that appeared on many questions cannot drown out traits that appeared on fewer questions.
  // Uses Bayesian smoothing prior (rate = raw / (opportunity + 2.0) * 10.0).
  const normalizedScores = { ...rawScores };
  for (const [t, r] of Object.entries(rawScores)) {
    const o = opportunities[t] || 0;
    if (o > 0) {
      normalizedScores[t] = (r / (o + 2.0)) * 10.0;
    } else {
      normalizedScores[t] = r;
    }
  }

  return normalizedScores;
}

/**
 * Calculates semi-centered cosine similarity between user traits and player traits
 * within the player's active role subspace.
 *
 * Detects and excludes zero-variance player profiles (returns null if ||p_tilde|| <= 1e-6).
 *
 * @param {Object} userTraits - User accumulated trait scores
 * @param {Object} playerTraits - Player trait profile
 * @param {string} [roleSubspace='OUTFIELD'] - 'OUTFIELD' or 'GOALKEEPER'
 * @returns {number|null} Exact similarity in [-1.0, 1.0], or null if player profile is invalid/zero-variance
 */
export function calculateCosineSimilarity(
  userTraits,
  playerTraits,
  roleSubspace = ROLE_SUBSPACES.OUTFIELD
) {
  if (!userTraits || !playerTraits) return 0;

  const dims = SUBSPACE_DIMENSIONS[roleSubspace] || SUBSPACE_DIMENSIONS.OUTFIELD;

  // 1. Calculate player mean and centered norm across active subspace
  const pVals = dims.map(d => (typeof playerTraits[d] === 'number' ? playerTraits[d] : 0));
  const pMean = pVals.reduce((a, b) => a + b, 0) / pVals.length;

  let pCenteredNormSq = 0;
  for (const v of pVals) {
    const diff = v - pMean;
    pCenteredNormSq += diff * diff;
  }

  // Explicit guard against zero-variance player profiles (e.g. flat profiles)
  if (pCenteredNormSq <= 1e-12) {
    return null; // Exclude invalid zero-variance profile
  }
  const pNorm = Math.sqrt(pCenteredNormSq);

  // 2. Calculate user norm and semi-centered dot product across active subspace
  let dotProduct = 0;
  let uSubspaceNormSq = 0;

  for (const d of dims) {
    const u = typeof userTraits[d] === 'number' ? userTraits[d] : 0;
    const pCentered = (typeof playerTraits[d] === 'number' ? playerTraits[d] : 0) - pMean;

    dotProduct += u * pCentered;
    uSubspaceNormSq += u * u;
  }

  if (uSubspaceNormSq <= 1e-12) {
    return 0; // User has no active points in this subspace
  }

  const uNorm = Math.sqrt(uSubspaceNormSq);
  const similarity = dotProduct / (uNorm * pNorm);

  if (isNaN(similarity) || !isFinite(similarity)) {
    return 0;
  }

  return similarity;
}

/**
 * Finds the Bayern player whose trait profile most closely aligns with the user's scores
 * using semi-centered role-subspace cosine similarity.
 *
 * Zero-variance player profiles are excluded from evaluation.
 * Empty/zero user vectors return a clean NO_DATA state.
 * Ties are resolved deterministically (highest exact similarity, then highest raw dot product, then alphabetical ID).
 *
 * @param {Object} userTraits
 * @param {Array<Object>} [players=BAYERN_PLAYERS]
 * @returns {{ player: Object|null, similarityScore: number, similarityExact: number, status: string }}
 */
export function findClosestPlayer(userTraits, players = BAYERN_PLAYERS) {
  if (!Array.isArray(players) || players.length === 0) {
    return {
      player: null,
      similarityScore: 0,
      similarityExact: 0,
      status: 'NO_PLAYERS'
    };
  }

  // Explicit guard: zero/empty user vector returns NO_DATA
  if (!userTraits || typeof userTraits !== 'object') {
    return {
      player: null,
      similarityScore: 0,
      similarityExact: 0,
      status: 'NO_DATA'
    };
  }

  const hasUserScore = Object.values(userTraits).some(v => typeof v === 'number' && v > 0);
  if (!hasUserScore) {
    return {
      player: null,
      similarityScore: 0,
      similarityExact: 0,
      status: 'NO_DATA'
    };
  }

  let bestPlayer = null;
  let highestSim = -Infinity;
  let bestDot = -Infinity;

  for (const player of players) {
    const subspace = player.roleSubspace || ROLE_SUBSPACES.OUTFIELD;
    const sim = calculateCosineSimilarity(userTraits, player.traits, subspace);

    // If profile is zero-variance or undefined, exclude from matching
    if (sim === null || isNaN(sim) || !isFinite(sim)) {
      continue;
    }

    // Compute raw centered dot product for secondary tie-breaking
    const dims = SUBSPACE_DIMENSIONS[subspace] || SUBSPACE_DIMENSIONS.OUTFIELD;
    const pVals = dims.map(d => (player.traits?.[d] || 0));
    const pMean = pVals.reduce((a, b) => a + b, 0) / pVals.length;
    let dot = 0;
    for (const d of dims) {
      const u = userTraits[d] || 0;
      const pCentered = (player.traits?.[d] || 0) - pMean;
      dot += u * pCentered;
    }

    // Deterministic tie-breaker:
    // 1. Highest exact similarity
    // 2. Highest raw dot product
    // 3. Alphabetical player ID
    const isTie = Math.abs(sim - highestSim) < 1e-9;
    if (
      sim > highestSim ||
      (isTie && dot > bestDot) ||
      (isTie && Math.abs(dot - bestDot) < 1e-9 && bestPlayer && player.id.localeCompare(bestPlayer.id) < 0)
    ) {
      highestSim = sim;
      bestDot = dot;
      bestPlayer = player;
    }
  }

  if (!bestPlayer) {
    return {
      player: null,
      similarityScore: 0,
      similarityExact: 0,
      status: 'NO_VALID_MATCH'
    };
  }

  // Monotonic Affine Rescaling: maps [-1.0, 1.0] -> [0, 100] Preference Alignment Index
  const normalizedPercentage = ((highestSim + 1) / 2) * 100;
  const displayScore = Math.max(0, Math.min(100, Math.round(normalizedPercentage)));

  return {
    player: bestPlayer,
    similarityScore: displayScore,
    similarityExact: highestSim,
    status: 'MATCH_FOUND'
  };
}

/**
 * Generates an engaging, fun description synthesizing the matched player and top traits.
 *
 * @param {Object} matchedPlayer
 * @param {Object} userTraits
 * @param {Array<{ trait: string, label: string, score: number }>} topTraits
 * @returns {string} Engaging football comparison description
 */
export function generatePlayerDescription(matchedPlayer, userTraits, topTraits) {
  if (!matchedPlayer) return '';
  const trait1 = topTraits[0]?.label || 'tactical acumen';
  const trait2 = topTraits[1]?.label || 'big-game composure';

  return `Your choices across the ten dilemmas show an overwhelming preference for ${trait1} and ${trait2}. You see the pitch the same way ${matchedPlayer.name} does: ${matchedPlayer.headline.toLowerCase()}. Whether in a Champions League final or a domestic grind, your instincts embody ${matchedPlayer.name}’s distinctive football philosophy.`;
}

/**
 * Builds decision breakdown of the session's answered questions.
 *
 * @param {Array<string>} answers
 * @param {Array<Object>} sessionQuestions
 * @returns {Array<Object>}
 */
export function buildAnswersBreakdown(answers, sessionQuestions) {
  if (!Array.isArray(answers) || !Array.isArray(sessionQuestions)) return [];

  const length = Math.min(answers.length, sessionQuestions.length);
  const result = [];

  for (let idx = 0; idx < length; idx++) {
    const q = sessionQuestions[idx];
    const choiceKey = answers[idx];
    const selectedOption = choiceKey === 'A' ? q.optionA : (choiceKey === 'B' ? q.optionB : null);
    const rivalOption = choiceKey === 'A' ? q.optionB : (choiceKey === 'B' ? q.optionA : null);

    result.push({
      questionId: q.id,
      questionNumber: idx + 1,
      category: q.categoryLabel,
      title: q.title,
      selectedKey: choiceKey,
      selectedLabel: selectedOption ? selectedOption.label : 'None',
      selectedSublabel: selectedOption ? selectedOption.sublabel : '',
      selectedDescription: selectedOption ? selectedOption.description : '',
      rivalLabel: rivalOption ? rivalOption.label : ''
    });
  }

  return result;
}

/**
 * Main calculation: computes accumulated traits, matches closest Bayern player,
 * extracts top traits, and generates user result.
 *
 * Incomplete sessions (< 10 answers or sessionQuestions empty) return null.
 *
 * @param {Array<string>} answers
 * @param {Array<Object>} sessionQuestions
 * @param {Array<Object>} [players=BAYERN_PLAYERS]
 * @returns {Object|null} Complete outcome object for the result screen or null if incomplete
 */
export function calculateGameOutcome(
  answers,
  sessionQuestions,
  players = BAYERN_PLAYERS
) {
  // Incomplete session guard: return null
  if (
    !Array.isArray(answers) ||
    !Array.isArray(sessionQuestions) ||
    sessionQuestions.length === 0 ||
    answers.length < sessionQuestions.length
  ) {
    return null;
  }

  // 1. Accumulate user trait points
  const traitScores = accumulateTraitScores(answers, sessionQuestions);

  // 2. Find closest Bayern player via semi-centered role-subspace cosine
  const matchResult = findClosestPlayer(traitScores, players);
  const matchedPlayer = matchResult.player;
  const similarityScore = matchResult.similarityScore;

  if (!matchedPlayer) {
    return null;
  }

  // 3. Extract top 3 matching traits (avoiding duplicate display of defensive_ability and team_first)
  const sortedTraits = Object.entries(traitScores)
    .filter(([t]) => t !== 'defensive_ability' || !traitScores.team_first)
    .map(([trait, score]) => ({
      trait,
      label: TRAIT_LABELS[trait] || trait,
      score: typeof score === 'number' ? score : 0
    }))
    .sort((a, b) => b.score - a.score || a.trait.localeCompare(b.trait));

  const topTraits = sortedTraits.slice(0, 3);

  // 4. Generate engaging description
  const description = generatePlayerDescription(matchedPlayer, traitScores, topTraits);

  // 5. Build question-by-question breakdown
  const breakdown = buildAnswersBreakdown(answers, sessionQuestions);

  const countA = answers.filter(a => a === 'A').length;
  const countB = answers.filter(a => a === 'B').length;

  return {
    matchedPlayer,
    similarityScore,
    description,
    topTraits,
    traitScores,
    breakdown,
    summary: {
      totalQuestions: sessionQuestions.length,
      optionACount: countA,
      optionBCount: countB,
      preferenceTendency: countA > countB ? 'Direct / Clinical' : countB > countA ? 'Collective / Tactical' : 'Balanced Visionary'
    }
  };
}

/**
 * Safely reads the previous session's question IDs from storage.
 *
 * @returns {Array<string>}
 */
export function getStoredPreviousQuestionIds() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(STORAGE_PREV_QUESTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (e) {}
  return [];
}

/**
 * Safely saves current session question IDs to storage.
 *
 * @param {Array<string>} ids
 */
export function saveStoredPreviousQuestionIds(ids) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage && Array.isArray(ids)) {
      window.sessionStorage.setItem(STORAGE_PREV_QUESTIONS_KEY, JSON.stringify(ids));
    }
  } catch (e) {}
}
