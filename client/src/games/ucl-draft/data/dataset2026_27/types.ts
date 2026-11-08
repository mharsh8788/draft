import { TacticalPosition, PlayerCategory } from '../../types/draft';

/**
 * UEFA Champions League 2026-27 Season
 * Single-season dedicated scope.
 */
export const UCL_2026_27_SEASON = '2026-27' as const;
export type UCLSeason2026_27 = typeof UCL_2026_27_SEASON;

/**
 * Clean, author-friendly schema for adding and maintaining players
 * for the 36 clubs in the 2026-27 UEFA Champions League dataset.
 */
export interface PlayerEntry2026_27 {
  /**
   * Unique kebab-case player identifier (e.g. 'harry-kane', 'vinicius-junior').
   * Prevents duplicate drafting in the same starting XI.
   */
  playerId: string;

  /**
   * Full formal player name (e.g. 'Harry Kane').
   */
  playerName: string;

  /**
   * Short display name used on the pitch and compact list views (e.g. 'Kane').
   */
  shortName: string;

  /**
   * Club name matching one of the 36 participating clubs (e.g. 'Bayern Munich').
   */
  club: string;

  /**
   * Fixed season: '2026-27'.
   */
  season: UCLSeason2026_27;

  /**
   * Primary tactical position on the pitch.
   * 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF'
   */
  position: TacticalPosition;

  /**
   * Legitimate secondary/alternate positions where the player can also play.
   * Example: ['CF'] or ['RM', 'CAM'].
   */
  alternatePositions?: TacticalPosition[];

  /**
   * Player rating calibrated for the 2026-27 UCL campaign (1 to 99).
   * Fully supports ratings below 80, 80s, and 90s.
   */
  rating: number;

  /**
   * Nationality name (e.g. 'England', 'France', 'Germany', 'Brazil').
   */
  nationality: string;

  /**
   * ISO 3166-1 alpha-2 or FIFA code for the round nation circle (e.g. 'GB-ENG', 'FR', 'DE').
   */
  countryCode: string;

  /**
   * Squad shirt number (e.g. 9).
   */
  shirtNumber: number;

  /**
   * Optional image headshot path. Defaults to `/players/${playerId}.png`.
   */
  image?: string;
}

/**
 * Squad structure for each of the 36 participating clubs.
 * Each club will feature 11 players initially.
 */
export interface ClubSquad2026_27 {
  club: string;
  season: UCLSeason2026_27;
  country: string;
  players: PlayerEntry2026_27[];
}
