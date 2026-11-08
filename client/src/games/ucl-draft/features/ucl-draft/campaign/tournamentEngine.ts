import { Player } from '../../../types/draft';
import { ALL_2026_27_SQUADS, build2026_27PlayerCards } from '../../../data/dataset2026_27';
import { createSeededRNG, SeededRNG } from './seededRandom';
import { simulateCampaignMatch } from './matchEngine';
import {
  CampaignFixture,
  CampaignMatch,
  CampaignRoundName,
  CampaignSummary,
  CampaignTournament,
} from './types';

export const ROUND_NAMES_ORDER: CampaignRoundName[] = [
  'Round of 16',
  'Quarter-Final',
  'Semi-Final',
  'Final',
];

/**
 * Authoritative 36-club UEFA Champions League tier classification for AI opponents.
 */
export const OPPONENT_CLUBS_BY_TIER: Record<'S' | 'A' | 'B' | 'C' | 'D', readonly string[]> = {
  S: [
    'Paris Saint-Germain',
    'Real Madrid',
    'Bayern Munich',
    'Barcelona',
    'Arsenal',
  ],
  A: [
    'Manchester City',
    'Liverpool',
    'Inter Milan',
  ],
  B: [
    'Sporting CP',
    'Atlético Madrid',
    'Galatasaray',
    'Borussia Dortmund',
    'Lille',
    'Napoli',
    'Fenerbahçe',
    'RB Leipzig',
    'Porto',
    'Feyenoord',
  ],
  C: [
    'Shakhtar Donetsk',
    'Manchester United',
    'Slavia Praha',
    'VfB Stuttgart',
    'Lens',
    'Aston Villa',
    'Roma',
    'Slovan Bratislava',
    'Como',
    'Villarreal',
  ],
  D: [
    'LASK',
    'Viking',
    'PSV Eindhoven',
    'Real Betis',
    'Club Brugge',
    'AEK Athens',
    'Sabah',
    'Bodø/Glimt',
  ],
};

/**
 * Calibrated progressive AI opponent tier distribution by knockout stage.
 * Elite opponents become progressively more common; D-tier clubs are virtually absent
 * from late stages and strictly forbidden from appearing in the Final (0%).
 */
export const OPPONENT_STAGE_TIER_WEIGHTS: Record<
  CampaignRoundName,
  Record<'S' | 'A' | 'B' | 'C' | 'D', number>
> = {
  'Round of 16':   { S: 0.20, A: 0.40, B: 0.30, C: 0.08, D: 0.02 },
  'Quarter-Final': { S: 0.30, A: 0.45, B: 0.20, C: 0.04, D: 0.01 },
  'Semi-Final':    { S: 0.40, A: 0.45, B: 0.12, C: 0.02, D: 0.01 },
  'Final':         { S: 0.50, A: 0.40, B: 0.08, C: 0.02, D: 0.00 },
};

/**
 * Deterministically draws 4 distinct opponent clubs for the campaign knockout rounds
 * (Round of 16, Quarter-Final, Semi-Final, Final) using calibrated stage-by-stage
 * progressive tier weights without replacement.
 */
export function selectOpponentsForCampaign(rng: SeededRNG): string[] {
  const selected: string[] = [];
  const usedClubs = new Set<string>();

  for (const round of ROUND_NAMES_ORDER) {
    const weights = OPPONENT_STAGE_TIER_WEIGHTS[round];
    const items: Array<{ item: string; weight: number }> = [];

    for (const [tier, clubs] of Object.entries(OPPONENT_CLUBS_BY_TIER) as Array<
      ['S' | 'A' | 'B' | 'C' | 'D', readonly string[]]
    >) {
      const tierWeight = weights[tier] || 0;
      if (tierWeight <= 0) continue;
      const perClubWeight = tierWeight / clubs.length;

      for (const club of clubs) {
        if (!usedClubs.has(club)) {
          items.push({ item: club, weight: perClubWeight });
        }
      }
    }

    if (items.length === 0) {
      // Fallback if tier pool exhausted: pick any unused 2026-27 club
      const remaining = ALL_2026_27_SQUADS
        .filter((s) => s.players && s.players.length === 11)
        .map((s) => s.club)
        .filter((c) => !usedClubs.has(c));
      const fallbackClub = remaining.length > 0 ? rng.pick(remaining) : 'Real Madrid';
      selected.push(fallbackClub);
      usedClubs.add(fallbackClub);
    } else {
      const chosen = rng.weightedPick(items);
      selected.push(chosen);
      usedClubs.add(chosen);
    }
  }

  return selected;
}

/**
 * Computes campaign summary metrics for a given subset of played matches.
 */
export function computeCampaignSummary(
  playedMatches: CampaignMatch[],
  totalRounds: number = ROUND_NAMES_ORDER.length
): CampaignSummary {
  const wins = playedMatches.filter((m) => m.won).length;
  const losses = playedMatches.filter((m) => !m.won).length;
  const goalsFor = playedMatches.reduce((sum, m) => sum + m.squadGoals, 0);
  const goalsAgainst = playedMatches.reduce((sum, m) => sum + m.opponentGoals, 0);
  const hasLost = playedMatches.some((m) => !m.won);
  const isChampion = playedMatches.length === totalRounds && !hasLost;
  const isEliminated = hasLost;

  const lostMatch = playedMatches.find((m) => !m.won);
  const eliminatedRound = lostMatch?.roundName;

  let statusHeadline = 'CAMPAIGN IN PROGRESS';
  if (isChampion) {
    statusHeadline = 'CHAMPIONS OF EUROPE';
  } else if (isEliminated && eliminatedRound) {
    if (eliminatedRound === 'Final') {
      statusHeadline = 'RUNNER-UP • LOST IN THE FINAL';
    } else {
      statusHeadline = `ELIMINATED IN THE ${eliminatedRound.toUpperCase()}`;
    }
  }

  const sevenNilAchievement = isChampion && goalsAgainst === 0;
  const reachedRound: CampaignRoundName =
    playedMatches.length > 0 ? playedMatches[playedMatches.length - 1].roundName : 'Round of 16';
  const scoreBanner = `${wins}-${losses}`;

  return {
    wins,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    isChampion,
    isEliminated,
    eliminatedRound,
    statusHeadline,
    sevenNilAchievement,
    reachedRound,
    scoreBanner,
  };
}

/**
 * Retrieves the full 11-player squad for a 2026-27 club.
 * Preserves the author's calibrated ratings, positions, and details.
 */
export function getOpponentSquadForClub(clubName: string): {
  squad: Player[];
  country: string;
} {
  const clubData = ALL_2026_27_SQUADS.find(
    (s) => s.club.toLowerCase() === clubName.toLowerCase()
  );

  const country = clubData?.country || 'Europe';
  const allCards = build2026_27PlayerCards();
  const squad = allCards.filter(
    (p) => p.club.toLowerCase() === clubName.toLowerCase()
  );

  return { squad, country };
}

/**
 * Builds the complete knockout tournament for the given seed and user squad.
 *
 * In 4-Club Test Mode:
 * - Opponents are drawn without replacement from the 4 integrated 2026-27 clubs:
 *   Arsenal, Barcelona, Bayern Munich, Real Madrid.
 * - 4 distinct rounds: Round of 16, Quarter-Final, Semi-Final, Final.
 * - No artificial clubs, no dummy clubs, and no duplicate clubs.
 * - Single-elimination: if the user loses a round, the tournament concludes at that stage.
 */
export function generateCampaignTournament(
  userSquad: Record<string, Player | null>,
  seed: string
): CampaignTournament {
  const rng = createSeededRNG(seed);

  // Select progressive stage-weighted opponent clubs without replacement
  const drawnOpponentClubs = selectOpponentsForCampaign(rng);

  const roundLabels: Record<CampaignRoundName, string> = {
    'Round of 16': 'ROUND OF 16',
    'Quarter-Final': 'QUARTER-FINAL',
    'Semi-Final': 'SEMI-FINAL',
    Final: 'FINAL',
  };

  const fixtures: CampaignFixture[] = [];
  const matches: CampaignMatch[] = [];
  let isEliminated = false;
  let eliminatedRound: CampaignRoundName | undefined = undefined;

  for (let i = 0; i < ROUND_NAMES_ORDER.length; i++) {
    const roundName = ROUND_NAMES_ORDER[i];
    const opponentClub = drawnOpponentClubs[i];
    const { squad: oppSquad, country: oppCountry } = getOpponentSquadForClub(opponentClub);

    fixtures.push({
      roundIndex: i,
      roundName,
      roundLabel: roundLabels[roundName],
      opponentClub,
      opponentCountry: oppCountry,
    });

    // Simulate match deterministically
    const match = simulateCampaignMatch(
      userSquad,
      opponentClub,
      oppCountry,
      oppSquad,
      roundName,
      i,
      rng
    );

    matches.push(match);

    if (!match.won) {
      isEliminated = true;
      eliminatedRound = roundName;
      break; // Single-elimination: if user loses or is knocked out on penalties, halt immediately!
    }
  }

  const summary = computeCampaignSummary(matches);

  return {
    seed,
    mode: '36-club-full',
    totalRounds: ROUND_NAMES_ORDER.length,
    fixtures,
    matches,
    revealedCount: matches.length, // default all revealed if fully simulated
    isCompleted: true,
    isEliminated,
    eliminatedRound,
    summary,
  };
}

/**
 * Creates an initial unplayed campaign tournament state for step-by-step match-by-match execution.
 */
export function createPendingCampaignTournament(
  userSquad: Record<string, Player | null>,
  seed: string
): CampaignTournament {
  const tournament = generateCampaignTournament(userSquad, seed);
  return {
    ...tournament,
    revealedCount: 0,
    isCompleted: false,
    summary: computeCampaignSummary([]),
  };
}

/**
 * Maps rich CampaignTournament to legacy SimulationResult for backwards compatibility.
 */
export function createSimulationResultFromTournament(tournament: CampaignTournament) {
  const currentSummary = tournament.isCompleted
    ? tournament.summary
    : computeCampaignSummary(tournament.matches.slice(0, tournament.revealedCount));

  const mappedMatches = tournament.matches.map((m) => ({
    round: m.roundName,
    opponent: m.opponentClub,
    opponentRating: m.opponentStrength,
    squadGoals: m.squadGoals,
    opponentGoals: m.opponentGoals,
    won: m.won,
    cleanSheet: m.cleanSheet,
    narrative: m.narrative,
  }));

  // Ensure all 4 stages are represented in the legacy SimulationResult for UI slots & tests
  const roundNames: CampaignRoundName[] = ['Round of 16', 'Quarter-Final', 'Semi-Final', 'Final'];
  for (let i = mappedMatches.length; i < 4; i++) {
    mappedMatches.push({
      round: roundNames[i],
      opponent: tournament.fixtures?.[i]?.opponentClub || 'TBD',
      opponentRating: 90,
      squadGoals: 0,
      opponentGoals: 0,
      won: false,
      cleanSheet: false,
      narrative: 'Did not advance to this stage.',
    });
  }

  return {
    champion: currentSummary.isChampion,
    sevenNilAchievement: currentSummary.sevenNilAchievement,
    matches: mappedMatches,
    trophyScore: currentSummary.wins * 25 + (currentSummary.isChampion ? 50 : 0),
    summaryVerdict: currentSummary.isChampion
      ? 'European Champions! A historic tournament run.'
      : tournament.isCompleted || currentSummary.isEliminated
      ? currentSummary.eliminatedRound === 'Final'
        ? 'Runner-up. Lost in the Final.'
        : `Knocked out in ${currentSummary.eliminatedRound || currentSummary.reachedRound}.`
      : 'Tournament in progress.',
    wins: currentSummary.wins,
    draws: 0,
    losses: currentSummary.losses,
    goalsFor: currentSummary.goalsFor,
    goalsAgainst: currentSummary.goalsAgainst,
    goalDifference: currentSummary.goalDifference,
  };
}
