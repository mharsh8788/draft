import { ClubSquad, PlayerEntry } from './types';

/**
 * UCL DRAFT 2025-26 DATASET TEMPLATE
 *
 * Use this template to provide squad lists for each of the 42 clubs.
 * Ratings follow the individual UCL campaign calibration:
 *   - 96: Exceptional campaigns (e.g. Kane, Vinicius, Benzema tier)
 *   - 94-95: Outstanding campaigns
 *   - 91-93: Elite campaigns
 *   - 88-90: Very good campaigns
 *   - 85-87: Good contributions
 *   - 80-84: Solid squad contributors
 */

export const EXAMPLE_CLUB_TEMPLATE: ClubSquad = {
  club: 'Bayern Munich',
  season: '2025-26',
  country: 'Germany',
  players: [
    {
      playerId: 'harry-kane',
      playerName: 'Harry Kane',
      shortName: 'Kane',
      club: 'Bayern Munich',
      season: '2025-26',
      position: 'ST',
      alternatePositions: ['CF'],
      rating: 96,
      nationality: 'England',
      countryCode: 'GB-ENG',
      shirtNumber: 9,
      image: '/players/harry-kane.png',
    },
    {
      playerId: 'michael-olise',
      playerName: 'Michael Olise',
      shortName: 'Olise',
      club: 'Bayern Munich',
      season: '2025-26',
      position: 'RW',
      alternatePositions: ['RM', 'CAM'],
      rating: 93,
      nationality: 'France',
      countryCode: 'FR',
      shirtNumber: 17,
      image: '/players/michael-olise.png',
    },
    {
      playerId: 'joshua-kimmich',
      playerName: 'Joshua Kimmich',
      shortName: 'Kimmich',
      club: 'Bayern Munich',
      season: '2025-26',
      position: 'RB',
      alternatePositions: ['CM', 'CDM'],
      rating: 92,
      nationality: 'Germany',
      countryCode: 'DE',
      shirtNumber: 6,
      image: '/players/joshua-kimmich.png',
    },
  ],
};
