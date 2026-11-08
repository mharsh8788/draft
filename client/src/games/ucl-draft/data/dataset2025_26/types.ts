import { TacticalPosition, PlayerCategory } from '../../types/draft';

/**
 * Clean, author-friendly schema for adding and editing players
 * in the UCL 2025-26 dataset without touching game logic or internal state mechanics.
 */
export interface PlayerEntry {
  /**
   * Unique kebab-case player identifier.
   * Shared across cards of the same player to prevent duplicate drafting in the same squad.
   * @example 'harry-kane'
   */
  playerId: string;

  /**
   * Full player name.
   * @example 'Harry Kane'
   */
  playerName: string;

  /**
   * Short / display name used on the tactical pitch and compact labels.
   * @example 'Kane'
   */
  shortName: string;

  /**
   * Official club name matching the club catalog.
   * @example 'Bayern Munich'
   */
  club: string;

  /**
   * Competition season for the unified dataset.
   * @example '2025-26'
   */
  season: string;

  /**
   * Primary tactical position on the pitch.
   * Must be one of: 'GK' | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB' | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM' | 'LW' | 'RW' | 'ST' | 'CF'
   * @example 'ST'
   */
  position: TacticalPosition;

  /**
   * Legitimate secondary/alternate positions where the player can also be deployed.
   * You can provide either just the alternates (e.g. ['CF']) or the full eligible array (e.g. ['ST', 'CF']).
   * The loader automatically unifies and ensures primary position is included.
   * @example ['CF']
   */
  alternatePositions?: TacticalPosition[];

  /**
   * Player campaign rating calibrated for the individual UCL performance (80-99).
   * @example 96
   */
  rating: number;

  /**
   * Player nationality.
   * @example 'England'
   */
  nationality: string;

  /**
   * ISO 3166-1 alpha-2 or standard football code for flag / silhouette circle.
   * @example 'GB-ENG', 'FR', 'DE', 'ES', 'BR'
   */
  countryCode: string;

  /**
   * Official squad shirt number.
   * @example 9
   */
  shirtNumber: number;

  /**
   * Player headshot / cutout image path.
   * Defaults to `/players/${playerId}.png`.
   * Optional: if omitted, the game automatically uses `/players/${playerId}.png`
   * and falls back to typographic jersey silhouette if the file is not yet added.
   * @example '/players/harry-kane.png'
   */
  image?: string;
}

/**
 * Squad structure for each of the 42 clubs.
 */
export interface ClubSquad {
  club: string;
  season: '2025-26';
  league?: string;
  country?: string;
  players: PlayerEntry[];
}
