import { Player } from '../../../types/draft';

export type CampaignRoundName = 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Final';

export interface GoalEvent {
  id: string;
  minute: number; // 1 - 90 (or 91-120)
  scorerName: string;
  scorerPlayerId?: string;
  isUserTeam: boolean;
  isPenalty?: boolean;
}

export interface PenaltyKick {
  takerName: string;
  scored: boolean;
}

export interface PenaltyShootout {
  userScore: number;
  opponentScore: number;
  userWon: boolean;
  userKicks: PenaltyKick[];
  opponentKicks: PenaltyKick[];
  roundsSummary: string; // e.g. "4 - 3"
}

export interface CampaignMatch {
  id: string;
  roundIndex: number;
  roundName: CampaignRoundName;
  roundLabel: string; // "ROUND OF 16"
  opponentClub: string;
  opponentCountry?: string;
  opponentSquad: Player[];
  userStrength: number;
  opponentStrength: number;
  squadGoals: number;
  opponentGoals: number;
  goals: GoalEvent[];
  won: boolean;
  isDrawAtFullTime: boolean;
  penalties?: PenaltyShootout;
  narrative: string;
  cleanSheet: boolean;
}

export interface CampaignSummary {
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  isChampion: boolean;
  isEliminated: boolean;
  eliminatedRound?: CampaignRoundName;
  statusHeadline?: string;
  sevenNilAchievement: boolean;
  reachedRound: CampaignRoundName;
  scoreBanner: string; // e.g. "2-1" or "4-0" (total wins - losses)
}

export interface TwoLeggedTieResult {
  leg1: { squadGoals: number; opponentGoals: number };
  leg2: { squadGoals: number; opponentGoals: number };
  aggregateSquadGoals: number;
  aggregateOpponentGoals: number;
  isDrawOnAggregate: boolean;
  penalties?: PenaltyShootout;
  userWon: boolean;
  userEliminated: boolean;
  summary: string;
}

export interface CampaignFixture {
  roundIndex: number;
  roundName: CampaignRoundName;
  roundLabel: string; // "ROUND OF 16"
  opponentClub: string;
  opponentCountry?: string;
}

export interface CampaignTournament {
  seed: string;
  mode: '4-club-test' | '36-club-full';
  totalRounds: number;
  fixtures: CampaignFixture[];
  matches: CampaignMatch[];
  revealedCount: number; // 0..matches.length for match-by-match reveal
  isCompleted: boolean;
  isEliminated: boolean;
  eliminatedRound?: CampaignRoundName;
  summary: CampaignSummary;
}
