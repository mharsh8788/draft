import { Formation, PitchSlot, Player, PlayerCategory, TacticalPosition, Era } from '../../types/draft';
import { CampaignTournament } from './campaign/types';

export type GameMode = 'classic' | 'almanac';

export type DraftChallenge = 'scout' | 'club-draw';

export type TacticalStyle = 'defensive' | 'balanced' | 'attacking' | 'control' | 'pressing' | 'counter';

export type GameStatus = 'setup' | 'drafting' | 'completed';

export interface SimulationMatch {
  round: 'Round of 16' | 'Quarter-Final' | 'Semi-Final' | 'Final';
  opponent: string;
  opponentRating: number;
  squadGoals: number;
  opponentGoals: number;
  won: boolean;
  cleanSheet: boolean;
  narrative: string;
}

export interface SimulationResult {
  champion: boolean;
  sevenNilAchievement: boolean; // 7-0 milestone / zero goals conceded
  matches: SimulationMatch[];
  trophyScore: number;
  summaryVerdict: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface DraftHistoryItem {
  slotId: string;
  previousPlayer: Player | null;
  newPlayer: Player | null;
  previousRollClub?: string | null;
  previousRollEra?: string | null;
}

export interface DraftState {
  status: GameStatus;
  isLocked: boolean;
  formationId: string;
  mode: GameMode;
  challenge: DraftChallenge;
  tacticalStyle: TacticalStyle;
  squad: Record<string, Player | null>;
  selectedSlotId: string | null;
  currentRollClub: string | null;
  currentRollEra: string | null;
  rerollsRemaining: number;
  awaitingNextRoll: boolean;
  history: DraftHistoryItem[];
  notification: { message: string; type: 'info' | 'error' | 'success' } | null;
  simulationResult: SimulationResult | null;
  campaignStep: number; // 0..4 for match-by-match reveal
  campaignSeed: string; // Deterministic campaign seed (e.g. #WC6XC4)
  campaignPlayMode: 'match-by-match' | 'automatic';
  campaignTournament: CampaignTournament | null;
  isResultsOpen: boolean;
  isDisclaimerOpen: boolean;
  isGameGuideOpen: boolean;
  isResetConfirmOpen: boolean;
}

export type DraftAction =
  | { type: 'START_GAME' }
  | { type: 'SET_FORMATION'; payload: string }
  | { type: 'SET_MODE'; payload: GameMode }
  | { type: 'SET_CHALLENGE'; payload: DraftChallenge }
  | { type: 'SET_TACTICAL_STYLE'; payload: TacticalStyle }
  | { type: 'SELECT_SLOT'; payload: string | null }
  | { type: 'DRAFT_PLAYER'; payload: { player: Player; targetSlotId?: string } }
  | { type: 'MOVE_PLAYER'; payload: { fromSlotId: string; toSlotId: string } }
  | { type: 'SWAP_PLAYERS'; payload: { slotIdA: string; slotIdB: string } }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'UNDO_DRAFT' }
  | { type: 'RESET_DRAFT' }
  | { type: 'ROLL_NEXT_CHALLENGE' }
  | { type: 'OPEN_RESET_CONFIRM' }
  | { type: 'CLOSE_RESET_CONFIRM' }
  | { type: 'REROLL_CLUB' }
  | { type: 'REROLL_ERA' }
  | { type: 'SET_NOTIFICATION'; payload: { message: string; type: 'info' | 'error' | 'success' } | null }
  | { type: 'RUN_SIMULATION' }
  | { type: 'SIMULATE_NEXT_MATCH' }
  | { type: 'SIMULATE_ALL_MATCHES' }
  | { type: 'REPLAY_CAMPAIGN' }
  | { type: 'NEW_CAMPAIGN_SEED' }
  | { type: 'SET_CAMPAIGN_PLAY_MODE'; payload: 'match-by-match' | 'automatic' }
  | { type: 'SET_RESULTS_OPEN'; payload: boolean }
  | { type: 'SET_DISCLAIMER_OPEN'; payload: boolean }
  | { type: 'SET_GAME_GUIDE_OPEN'; payload: boolean }
  | { type: 'RESTORE_SAVED_STATE'; payload: Partial<DraftState> };
