import { Player } from '../../../types/draft';
import { SeededRNG } from './seededRandom';
import {
  CampaignMatch,
  CampaignRoundName,
  GoalEvent,
  PenaltyKick,
  PenaltyShootout,
  TwoLeggedTieResult,
} from './types';

/**
 * Knuth Poisson generator driven by our deterministic SeededRNG.
 * Standard mathematical model for association football goal generation.
 */
function samplePoissonGoals(expected: number, rng: SeededRNG): number {
  const boundedLambda = Math.max(0.2, Math.min(6.0, expected));
  const L = Math.exp(-boundedLambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > L && k < 12);
  return Math.min(8, Math.max(0, k - 1));
}

/**
 * Weights players for goal scoring likelihood based on position and rating.
 * FWDs have highest chance, MIDs moderate, DEFs occasional set-piece/long-range goals, GKs zero.
 */
function getScorerWeight(player: Player): number {
  const ratingFactor = Math.pow((player.editorialRating ?? player.rating ?? 80) / 80, 2);
  const cat = player.primaryCategory;
  if (cat === 'GK') return 0;
  if (cat === 'FWD') return 12 * ratingFactor;
  if (cat === 'MID') return 4.5 * ratingFactor;
  return 1.2 * ratingFactor; // DEF
}

/**
 * Resolves a drawn knockout match through a seeded penalty shootout.
 */
export function simulatePenaltyShootout(
  userPlayers: Player[],
  opponentPlayers: Player[],
  userGK: Player | undefined,
  oppGK: Player | undefined,
  rng: SeededRNG
): PenaltyShootout {
  const userOutfield = userPlayers
    .filter((p) => p.primaryCategory !== 'GK')
    .sort((a, b) => (b.editorialRating ?? b.rating ?? 0) - (a.editorialRating ?? a.rating ?? 0));

  const oppOutfield = opponentPlayers
    .filter((p) => p.primaryCategory !== 'GK')
    .sort((a, b) => (b.editorialRating ?? b.rating ?? 0) - (a.editorialRating ?? a.rating ?? 0));

  const userGKRating = userGK?.editorialRating ?? userGK?.rating ?? 85;
  const oppGKRating = oppGK?.editorialRating ?? oppGK?.rating ?? 85;

  const userKicks: PenaltyKick[] = [];
  const opponentKicks: PenaltyKick[] = [];

  let userScore = 0;
  let oppScore = 0;

  // Best of 5 rounds
  for (let round = 0; round < 5; round++) {
    const userTaker = userOutfield[round % userOutfield.length];
    const userRating = userTaker?.editorialRating ?? userTaker?.rating ?? 85;
    const userConvRate = Math.min(0.92, Math.max(0.55, 0.77 + (userRating - 85) * 0.012 - (oppGKRating - 85) * 0.008));
    const userScored = rng.next() < userConvRate;
    if (userScored) userScore++;
    userKicks.push({
      takerName: userTaker?.shortName || userTaker?.name || userTaker?.playerName || 'Player',
      scored: userScored,
    });

    const oppTaker = oppOutfield[round % oppOutfield.length];
    const oppRating = oppTaker?.editorialRating ?? oppTaker?.rating ?? 85;
    const oppConvRate = Math.min(0.92, Math.max(0.55, 0.77 + (oppRating - 85) * 0.012 - (userGKRating - 85) * 0.008));
    const oppScored = rng.next() < oppConvRate;
    if (oppScored) oppScore++;
    opponentKicks.push({
      takerName: oppTaker?.shortName || oppTaker?.playerName || oppTaker?.name || 'Opponent',
      scored: oppScored,
    });

    // Check early clinch if impossible to catch up
    const remainingUser = 4 - round;
    const remainingOpp = 4 - round;
    if (userScore > oppScore + remainingOpp || oppScore > userScore + remainingUser) {
      break;
    }
  }

  // Sudden death if tied after 5 kicks
  let suddenDeathRound = 5;
  while (userScore === oppScore && suddenDeathRound < 15) {
    const userTaker = userOutfield[suddenDeathRound % userOutfield.length];
    const userRating = userTaker?.editorialRating ?? userTaker?.rating ?? 85;
    const userConvRate = Math.min(0.92, Math.max(0.55, 0.75 + (userRating - 85) * 0.01 - (oppGKRating - 85) * 0.01));
    const userScored = rng.next() < userConvRate;
    if (userScored) userScore++;
    userKicks.push({
      takerName: userTaker?.shortName || userTaker?.name || userTaker?.playerName || 'Player',
      scored: userScored,
    });

    const oppTaker = oppOutfield[suddenDeathRound % oppOutfield.length];
    const oppRating = oppTaker?.editorialRating ?? oppTaker?.rating ?? 85;
    const oppConvRate = Math.min(0.92, Math.max(0.55, 0.75 + (oppRating - 85) * 0.01 - (userGKRating - 85) * 0.01));
    const oppScored = rng.next() < oppConvRate;
    if (oppScored) oppScore++;
    opponentKicks.push({
      takerName: oppTaker?.shortName || oppTaker?.playerName || oppTaker?.name || 'Opponent',
      scored: oppScored,
    });

    if (userScore !== oppScore) break;
    suddenDeathRound++;
  }

  // Safeguard: guaranteed resolution in knockout
  if (userScore === oppScore) {
    if (rng.next() < 0.5) {
      userScore++;
    } else {
      oppScore++;
    }
  }

  const userWon = userScore > oppScore;

  return {
    userScore,
    opponentScore: oppScore,
    userWon,
    userKicks,
    opponentKicks,
    roundsSummary: `${userScore} - ${oppScore}`,
  };
}

/**
 * Simulates a single knockout fixture between the user's drafted XI and an opponent club's real 11 players.
 */
export function simulateCampaignMatch(
  userSquad: Record<string, Player | null>,
  opponentClub: string,
  opponentCountry: string | undefined,
  opponentSquad: Player[],
  roundName: CampaignRoundName,
  roundIndex: number,
  rng: SeededRNG
): CampaignMatch {
  const userPlayers = Object.values(userSquad).filter((p): p is Player => p !== null);
  if (userPlayers.length !== 11) {
    throw new Error(`Cannot simulate match: user XI has ${userPlayers.length} players (11 required).`);
  }

  if (opponentSquad.length === 0) {
    throw new Error(`Cannot simulate match: opponent squad for ${opponentClub} has 0 players.`);
  }

  // Exact team strengths from player ratings (no artificial scaling)
  const userStrength =
    Math.round(
      (userPlayers.reduce((sum, p) => sum + (p.editorialRating ?? p.rating ?? 0), 0) / userPlayers.length) * 10
    ) / 10;

  const opponentStrength =
    Math.round(
      (opponentSquad.reduce((sum, p) => sum + (p.editorialRating ?? p.rating ?? 0), 0) / opponentSquad.length) * 10
    ) / 10;

  const ratingDiff = userStrength - opponentStrength;

  // Expected goals calibrated for European knockout football
  // Stronger teams are favoured, but upsets and draws occur naturally
  const userExpectedGoals = Math.min(3.8, Math.max(0.6, 1.45 + ratingDiff * 0.22));
  const oppExpectedGoals = Math.min(3.4, Math.max(0.4, 1.25 - ratingDiff * 0.18));

  let squadGoals = samplePoissonGoals(userExpectedGoals, rng);
  let opponentGoals = samplePoissonGoals(oppExpectedGoals, rng);

  // Generate Goal Events with minutes and scorers
  const goals: GoalEvent[] = [];
  const usedMinutes = new Set<number>();

  const getDistinctMinute = (): number => {
    let min = rng.nextInt(3, 89);
    while (usedMinutes.has(min)) {
      min = (min % 89) + 1;
    }
    usedMinutes.add(min);
    return min;
  };

  // User Goal Scorers
  const userOutfield = userPlayers.filter((p) => p.primaryCategory !== 'GK');
  const userScorerCandidates = userOutfield.map((p) => ({
    item: p,
    weight: getScorerWeight(p),
  }));

  for (let i = 0; i < squadGoals; i++) {
    const scorer = rng.weightedPick(userScorerCandidates);
    goals.push({
      id: `user-goal-${roundIndex}-${i}`,
      minute: getDistinctMinute(),
      scorerName: scorer.shortName || scorer.name || scorer.playerName,
      scorerPlayerId: scorer.id,
      isUserTeam: true,
    });
  }

  // Opponent Goal Scorers
  const oppOutfield = opponentSquad.filter((p) => p.primaryCategory !== 'GK');
  const oppScorerCandidates = oppOutfield.map((p) => ({
    item: p,
    weight: getScorerWeight(p),
  }));

  for (let i = 0; i < opponentGoals; i++) {
    const scorer = rng.weightedPick(oppScorerCandidates);
    goals.push({
      id: `opp-goal-${roundIndex}-${i}`,
      minute: getDistinctMinute(),
      scorerName: scorer.shortName || scorer.playerName || scorer.name,
      scorerPlayerId: scorer.id,
      isUserTeam: false,
    });
  }

  // Chronologically sort all goals by match minute
  goals.sort((a, b) => a.minute - b.minute);

  // Knockout Draw Resolution
  const isDrawAtFullTime = squadGoals === opponentGoals;
  let won = squadGoals > opponentGoals;
  let penalties: PenaltyShootout | undefined = undefined;

  if (isDrawAtFullTime) {
    const userGK = userPlayers.find((p) => p.primaryCategory === 'GK');
    const oppGK = opponentSquad.find((p) => p.primaryCategory === 'GK');
    penalties = simulatePenaltyShootout(userPlayers, opponentSquad, userGK, oppGK, rng);
    won = penalties.userWon;
  }

  // Tactical narrative
  let narrative = '';
  if (won) {
    if (penalties) {
      narrative = `Dramatic shootout victory! After a tense ${squadGoals}-${opponentGoals} deadlock, your squad prevailed ${penalties.roundsSummary} on penalties.`;
    } else if (opponentGoals === 0) {
      narrative = `Flawless defensive masterclass. Your backline shut down ${opponentClub} while converting decisive chances.`;
    } else {
      narrative = `Electric knockout performance. Your attacking quality dismantled ${opponentClub} at key junctures.`;
    }
  } else {
    if (penalties) {
      narrative = `Heartbreak in the shootout. After battling to ${squadGoals}-${opponentGoals}, ${opponentClub} advanced ${penalties.roundsSummary} on penalties.`;
    } else {
      narrative = `Knocked out by ${opponentClub}. Positional lapses allowed the opposition to secure a ${opponentGoals}-${squadGoals} victory.`;
    }
  }

  const roundLabels: Record<CampaignRoundName, string> = {
    'Round of 16': 'ROUND OF 16',
    'Quarter-Final': 'QUARTER-FINAL',
    'Semi-Final': 'SEMI-FINAL',
    Final: 'FINAL',
  };

  return {
    id: `campaign-match-${roundIndex}-${opponentClub.toLowerCase().replace(/\s+/g, '-')}`,
    roundIndex,
    roundName,
    roundLabel: roundLabels[roundName],
    opponentClub,
    opponentCountry,
    opponentSquad,
    userStrength,
    opponentStrength,
    squadGoals,
    opponentGoals,
    goals,
    won,
    isDrawAtFullTime,
    penalties,
    narrative,
    cleanSheet: opponentGoals === 0 && (!penalties || penalties.opponentScore === 0),
  };
}

/**
 * Evaluates a two-legged knockout tie according to modern competition rules:
 * 1. Calculates aggregate score across Leg 1 and Leg 2.
 * 2. If aggregate is tied, applies penalty shootout resolution.
 * 3. Returns definitive winner, elimination status, and aggregate summary.
 */
export function evaluateTwoLeggedTie(
  leg1: { squadGoals: number; opponentGoals: number },
  leg2: { squadGoals: number; opponentGoals: number },
  userPlayers?: Player[],
  opponentSquad?: Player[],
  userGK?: Player,
  oppGK?: Player,
  rng?: SeededRNG
): TwoLeggedTieResult {
  const aggregateSquadGoals = leg1.squadGoals + leg2.squadGoals;
  const aggregateOpponentGoals = leg1.opponentGoals + leg2.opponentGoals;

  if (aggregateSquadGoals > aggregateOpponentGoals) {
    return {
      leg1,
      leg2,
      aggregateSquadGoals,
      aggregateOpponentGoals,
      isDrawOnAggregate: false,
      userWon: true,
      userEliminated: false,
      summary: `Won ${aggregateSquadGoals}-${aggregateOpponentGoals} on aggregate`,
    };
  }

  if (aggregateSquadGoals < aggregateOpponentGoals) {
    return {
      leg1,
      leg2,
      aggregateSquadGoals,
      aggregateOpponentGoals,
      isDrawOnAggregate: false,
      userWon: false,
      userEliminated: true,
      summary: `Lost ${aggregateSquadGoals}-${aggregateOpponentGoals} on aggregate`,
    };
  }

  // Draw on aggregate -> extra time and penalties
  let penalties: PenaltyShootout | undefined = undefined;
  let userWon = false;

  if (userPlayers && opponentSquad && rng) {
    penalties = simulatePenaltyShootout(userPlayers, opponentSquad, userGK, oppGK, rng);
    userWon = penalties.userWon;
  } else {
    // If shootout components are not supplied (e.g. lightweight score evaluation),
    // default to false (user eliminated unless shootout is specifically won)
    userWon = false;
  }

  return {
    leg1,
    leg2,
    aggregateSquadGoals,
    aggregateOpponentGoals,
    isDrawOnAggregate: true,
    penalties,
    userWon,
    userEliminated: !userWon,
    summary: userWon
      ? `Tied ${aggregateSquadGoals}-${aggregateOpponentGoals} on aggregate; won shootout${penalties ? ` (${penalties.roundsSummary})` : ''}`
      : `Tied ${aggregateSquadGoals}-${aggregateOpponentGoals} on aggregate; lost shootout${penalties ? ` (${penalties.roundsSummary})` : ''}`,
  };
}

/**
 * Validates whether the user's team is eligible to advance to the next round.
 * Only a confirmed win (in single-match or two-legged tie) allows advancement. Any defeat eliminates the team immediately.
 */
export function canAdvanceToNextRound(
  matchResult: { won?: boolean; userWon?: boolean } | null | undefined
): boolean {
  if (!matchResult) return false;
  return matchResult.won === true || matchResult.userWon === true;
}
