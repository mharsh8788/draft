import { Player, PlayerCategory, Era, TacticalPosition } from '../types/draft';
import {
  UCL_PLAYER_SEASONS,
  UCL_CLUBS,
  UCL_SEASONS,
  UCL_DRAFT_SEASONS,
  UCL_2026_27_PLAYERS,
  UCL_2026_27_CLUBS,
  UCL_2026_27_CHALLENGES,
  get2026_27CardsForClub,
  getRandom2026_27Challenge,
  CLUB_SEASON_CHALLENGES,
  getCardsForChallenge,
  getRandomClubSeasonChallenge,
  isRealPlayerDrafted,
  ClubSeasonChallenge,
  UCLClub,
  UCLSeason,
  UCLDraftSeason,
} from './uclDraftData';

export {
  UCL_PLAYER_SEASONS,
  UCL_CLUBS,
  UCL_SEASONS,
  UCL_DRAFT_SEASONS,
  UCL_2026_27_PLAYERS,
  UCL_2026_27_CLUBS,
  UCL_2026_27_CHALLENGES,
  get2026_27CardsForClub,
  getRandom2026_27Challenge,
  CLUB_SEASON_CHALLENGES,
  getCardsForChallenge,
  getRandomClubSeasonChallenge,
  isRealPlayerDrafted,
};
export type { ClubSeasonChallenge, UCLClub, UCLSeason, UCLDraftSeason };

export const PLAYERS: Player[] = [...UCL_2026_27_PLAYERS, ...UCL_PLAYER_SEASONS];

export const EDITORIAL_DISCLAIMER =
  'Player ratings are provisional, season-specific Champions League estimates for gameplay testing, not official UEFA ratings.';

export const ALL_CLUBS = Array.from(new Set(PLAYERS.map((p) => p.club))).sort();

export const ALL_ERAS: (Era | string)[] = [...UCL_SEASONS];

export const ALL_CATEGORIES: PlayerCategory[] = ['GK', 'DEF', 'MID', 'FWD'];

export const CATEGORY_LABELS: Record<PlayerCategory, string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
};

export function getPlayerShirtNumber(player: Player): number {
  if (player.shirtNumber) return player.shirtNumber;
  return player.primaryCategory === 'GK' ? 1 : 10;
}

/**
 * Computes strictly the player's eligible positions:
 * 1. Primary position is always included first.
 * 2. Only explicit alternatePositions are additionally included.
 * 3. Never infers, broadens, or falls back to category defaults.
 * 4. If alternatePositions is missing or empty, returns only the primary position.
 */
export function getPlayerEligiblePositions(player: Player | undefined | null): TacticalPosition[] {
  if (!player) return [];
  const primaryPos = player.position || player.specificPosition;
  const alternates: TacticalPosition[] = player.alternatePositions || [];

  const positions: TacticalPosition[] = [];
  if (primaryPos) {
    positions.push(primaryPos);
  }
  for (const pos of alternates) {
    if (pos && !positions.includes(pos)) {
      positions.push(pos);
    }
  }

  // If player has eligiblePositions already populated and no positions were resolved yet, fallback safely
  if (positions.length === 0 && player.eligiblePositions && player.eligiblePositions.length > 0) {
    for (const pos of player.eligiblePositions) {
      if (pos && !positions.includes(pos)) {
        positions.push(pos);
      }
    }
  }

  return positions;
}

export function formatPlayerPositions(player: Player): string {
  const positions = getPlayerEligiblePositions(player);
  if (positions.length > 0) {
    return positions.join('/');
  }
  return player.position || player.specificPosition || '—';
}

export function getClubCode(club: string): string {
  switch (club) {
    case 'Bayern Munich':
      return 'BM';
    case 'Real Madrid':
      return 'RMA';
    case 'Barcelona':
      return 'FCB';
    case 'PSG':
    case 'Paris Saint-Germain':
      return 'PSG';
    case 'Arsenal':
      return 'ARS';
    case 'Liverpool':
      return 'LIV';
    case 'Manchester City':
      return 'MCI';
    case 'Chelsea':
      return 'CHE';
    case 'Manchester United':
      return 'MUN';
    case 'Tottenham Hotspur':
      return 'TOT';
    case 'Inter Milan':
      return 'INT';
    case 'AC Milan':
      return 'ACM';
    case 'Napoli':
      return 'NAP';
    case 'Borussia Dortmund':
      return 'BVB';
    case 'Atlético Madrid':
    case 'Atletico Madrid':
      return 'ATM';
    default:
      return club.slice(0, 3).toUpperCase();
  }
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id || p.playerId === id);
}

export function isPlayerEligibleForSlot(
  player: Player | undefined | null,
  allowedPositions: TacticalPosition[],
  _slotCategory?: PlayerCategory
): boolean {
  if (!player) return false;
  const eligible = getPlayerEligiblePositions(player);
  if (eligible.length === 0) return false;

  // Strict match: Only explicit primary position and explicit alternatePositions are eligible.
  // Broad category mappings (e.g. MID -> all midfield slots) are strictly excluded.
  return eligible.some((pos) => allowedPositions.includes(pos));
}
