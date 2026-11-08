export type PlayerCategory = 'GK' | 'DEF' | 'MID' | 'FWD';

export type TacticalPosition =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'LWB'
  | 'RWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST'
  | 'CF';

export type Era = '1970s-80s' | '1990s' | '2000s' | '2010s' | '2020s';

export interface UCLStats {
  titles: number;
  appearances: number;
  goals?: number;
  cleanSheets?: number;
  assists?: number;
}

export interface Player {
  id: string;
  playerId: string;
  playerName: string;
  club: string;
  season: string;
  position: TacticalPosition;
  rating: number;
  image?: string;
  name: string;
  shortName: string;
  nationality: string;
  countryCode: string;
  primaryCategory: PlayerCategory;
  specificPosition: TacticalPosition;
  alternatePositions?: TacticalPosition[];
  eligiblePositions: TacticalPosition[];
  uclClubs: string[];
  primaryClub: string;
  era: Era | string;
  editorialRating: number; // 1 to 100
  ratingRationale?: string;
  keyHighlight?: string;
  shirtNumber?: number;
  uclStats: UCLStats;
  clubColors?: {
    primary: string;
    secondary: string;
  };
}

export interface PitchSlot {
  id: string;
  label: string;
  category: PlayerCategory;
  allowedPositions: TacticalPosition[];
  x: number; // 0 to 100 percentage from left
  y: number; // 0 to 100 percentage from top
}

export interface Formation {
  id: string;
  name: string;
  description: string;
  slots: PitchSlot[];
}

export type SquadPicks = Record<string, Player | null>;

export interface DraftHistoryItem {
  slotId: string;
  previousPlayer: Player | null;
  newPlayer: Player | null;
}

export interface SquadMetrics {
  totalDrafted: number;
  isComplete: boolean;
  baseRating: number;
  chemistryBonus: number;
  overallRating: number;
  attackRating: number;
  midfieldRating: number;
  defenseRating: number;
  goalkeeperRating: number;
  clubCounts: Record<string, number>;
  eraCounts: Record<string, number>;
  nationCounts: Record<string, number>;
  activeSynergies: string[];
}
