import { ClubSquad2026_27, PlayerEntry2026_27 } from './types';
import { Player, PlayerCategory, TacticalPosition } from '../../types/draft';

// Import all 36 club squads from the dataset
import { aekAthens } from './clubs/aek-athens';
import { arsenal2026_27 } from './clubs/arsenal';
import { astonVillaPlayers } from './clubs/aston-villa';
import { atleticoMadridPlayers } from './clubs/atleticomadrid';
import { barcelona2026_27 } from './clubs/barcelona';
import { bayernMunich2026_27 } from './clubs/bayern-munich';
import { bodoGlimt } from './clubs/bodo-glimt';
import { borussiaDortmundPlayers } from './clubs/dortmund';
import { clubBrugge } from './clubs/club-brugge';
import { como } from './clubs/como';
import { fenerbahce } from './clubs/fenerbahce';
import { feyenoordPlayers } from './clubs/feyenoord';
import { galatasarayPlayers } from './clubs/galatasaray';
import { interMilanPlayers } from './clubs/inter';
import { laskPlayers } from './clubs/lask';
import { rbLeipzigPlayers } from './clubs/leipzig';
import { lensPlayers } from './clubs/lens';
import { lillePlayers } from './clubs/lille';
import { liverpoolPlayers } from './clubs/liverpool';
import { manchesterCityPlayers } from './clubs/manchester-city';
import { manchesterUnited } from './clubs/manchester-united';
import { napoli } from './clubs/napoli';
import { parisSaintGermainPlayers } from './clubs/psg';
import { porto } from './clubs/porto';
import { psv } from './clubs/psv-eindhoven';
import { realBetis } from './clubs/real-betis';
import { realMadrid2026_27 } from './clubs/real-madrid';
import { roma } from './clubs/roma';
import { sabahPlayers } from './clubs/sabah';
import { shakhtarDonetskPlayers } from './clubs/shakhtar-donetsk';
import { slaviaPrahaPlayers } from './clubs/slavia-praha';
import { slovanBratislavaPlayers } from './clubs/slovan-bratislava';
import { sportingCpPlayers } from './clubs/sporting-cp';
import { vfbStuttgartPlayers } from './clubs/vfb-stuttgart';
import { vikingPlayers } from './clubs/viking';
import { villarreal } from './clubs/villarreal';

// Re-export all 36 clubs for direct individual consumption
export {
  aekAthens,
  arsenal2026_27,
  astonVillaPlayers,
  atleticoMadridPlayers,
  barcelona2026_27,
  bayernMunich2026_27,
  bodoGlimt,
  borussiaDortmundPlayers,
  clubBrugge,
  como,
  fenerbahce,
  feyenoordPlayers,
  galatasarayPlayers,
  interMilanPlayers,
  laskPlayers,
  rbLeipzigPlayers,
  lensPlayers,
  lillePlayers,
  liverpoolPlayers,
  manchesterCityPlayers,
  manchesterUnited,
  napoli,
  parisSaintGermainPlayers,
  porto,
  psv,
  realBetis,
  realMadrid2026_27,
  roma,
  sabahPlayers,
  shakhtarDonetskPlayers,
  slaviaPrahaPlayers,
  slovanBratislavaPlayers,
  sportingCpPlayers,
  vfbStuttgartPlayers,
  vikingPlayers,
  villarreal,
};

/**
 * Complete 2026-27 UEFA Champions League 36-Club Registry.
 * Preserves exact calibrated player ratings, positions, nationalities, and shirt numbers.
 */
export const ALL_2026_27_SQUADS: ClubSquad2026_27[] = [
  { club: 'AEK Athens', season: '2026-27', country: 'Greece', players: aekAthens },
  { club: 'Arsenal', season: '2026-27', country: 'England', players: arsenal2026_27 },
  { club: 'Aston Villa', season: '2026-27', country: 'England', players: astonVillaPlayers },
  { club: 'Atlético Madrid', season: '2026-27', country: 'Spain', players: atleticoMadridPlayers },
  { club: 'Barcelona', season: '2026-27', country: 'Spain', players: barcelona2026_27 },
  { club: 'Bayern Munich', season: '2026-27', country: 'Germany', players: bayernMunich2026_27 },
  { club: 'Bodø/Glimt', season: '2026-27', country: 'Norway', players: bodoGlimt },
  { club: 'Borussia Dortmund', season: '2026-27', country: 'Germany', players: borussiaDortmundPlayers },
  { club: 'Club Brugge', season: '2026-27', country: 'Belgium', players: clubBrugge },
  { club: 'Como', season: '2026-27', country: 'Italy', players: como },
  { club: 'Fenerbahçe', season: '2026-27', country: 'Turkey', players: fenerbahce },
  { club: 'Feyenoord', season: '2026-27', country: 'Netherlands', players: feyenoordPlayers },
  { club: 'Galatasaray', season: '2026-27', country: 'Turkey', players: galatasarayPlayers },
  { club: 'Inter Milan', season: '2026-27', country: 'Italy', players: interMilanPlayers },
  { club: 'LASK', season: '2026-27', country: 'Austria', players: laskPlayers },
  { club: 'RB Leipzig', season: '2026-27', country: 'Germany', players: rbLeipzigPlayers },
  { club: 'Lens', season: '2026-27', country: 'France', players: lensPlayers },
  { club: 'Lille', season: '2026-27', country: 'France', players: lillePlayers },
  { club: 'Liverpool', season: '2026-27', country: 'England', players: liverpoolPlayers },
  { club: 'Manchester City', season: '2026-27', country: 'England', players: manchesterCityPlayers },
  { club: 'Manchester United', season: '2026-27', country: 'England', players: manchesterUnited },
  { club: 'Napoli', season: '2026-27', country: 'Italy', players: napoli },
  { club: 'Paris Saint-Germain', season: '2026-27', country: 'France', players: parisSaintGermainPlayers },
  { club: 'Porto', season: '2026-27', country: 'Portugal', players: porto },
  { club: 'PSV Eindhoven', season: '2026-27', country: 'Netherlands', players: psv },
  { club: 'Real Betis', season: '2026-27', country: 'Spain', players: realBetis },
  { club: 'Real Madrid', season: '2026-27', country: 'Spain', players: realMadrid2026_27 },
  { club: 'Roma', season: '2026-27', country: 'Italy', players: roma },
  { club: 'Sabah', season: '2026-27', country: 'Azerbaijan', players: sabahPlayers },
  { club: 'Shakhtar Donetsk', season: '2026-27', country: 'Ukraine', players: shakhtarDonetskPlayers },
  { club: 'Slavia Praha', season: '2026-27', country: 'Czechia', players: slaviaPrahaPlayers },
  { club: 'Slovan Bratislava', season: '2026-27', country: 'Slovakia', players: slovanBratislavaPlayers },
  { club: 'Sporting CP', season: '2026-27', country: 'Portugal', players: sportingCpPlayers },
  { club: 'VfB Stuttgart', season: '2026-27', country: 'Germany', players: vfbStuttgartPlayers },
  { club: 'Viking', season: '2026-27', country: 'Norway', players: vikingPlayers },
  { club: 'Villarreal', season: '2026-27', country: 'Spain', players: villarreal },
];

export const UCL_2026_27_SQUADS = ALL_2026_27_SQUADS;

// All 36 club names registered for the 2026-27 UEFA Champions League
export const UCL_2026_27_CLUBS = ALL_2026_27_SQUADS.map((s) => s.club);

// Eligible challenges for draft rolling (clubs with full 11-player squads available)
export const UCL_2026_27_CHALLENGES = ALL_2026_27_SQUADS
  .filter((s) => s.players && s.players.length === 11)
  .map((s) => ({
    club: s.club,
    season: '2026-27' as const,
  }));

/**
 * Automatically infers general category (GK, DEF, MID, FWD) from tactical position.
 */
export function inferCategory(pos: TacticalPosition): PlayerCategory {
  if (pos === 'GK') return 'GK';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(pos)) return 'DEF';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(pos)) return 'MID';
  return 'FWD';
}

/**
 * Converts author-friendly 2026-27 player entries into canonical game-engine Player objects.
 * Preserves user ratings, positions, alternate positions, and shirt numbers with 100% integrity.
 */
export function build2026_27PlayerCards(): Player[] {
  const cards: Player[] = [];

  for (const squad of ALL_2026_27_SQUADS) {
    if (!squad.players || squad.players.length === 0) continue;
    for (const p of squad.players) {
      const alternates = p.alternatePositions || [];
      const eligiblePositions: TacticalPosition[] = Array.from(
        new Set([p.position, ...alternates])
      );
      const cardId = `${p.playerId}-${p.club.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2026-27`;

      cards.push({
        id: cardId,
        playerId: p.playerId,
        playerName: p.playerName,
        club: p.club,
        season: '2026-27',
        position: p.position,
        rating: p.rating,
        image: p.image || `/players/${p.playerId}.png`,

        // Compatibility fields for tactical pitch and scoring engine
        name: p.playerName,
        shortName: p.shortName,
        nationality: p.nationality,
        countryCode: p.countryCode,
        primaryCategory: inferCategory(p.position),
        specificPosition: p.position,
        alternatePositions: p.alternatePositions || [],
        eligiblePositions,
        uclClubs: [p.club],
        primaryClub: p.club,
        era: '2026-27',
        editorialRating: p.rating,
        ratingRationale: `Provisional 2026-27 Champions League rating based on individual campaign performance.`,
        keyHighlight: `${p.club} 2026-27 Champions League Campaign`,
        shirtNumber: p.shirtNumber,
        uclStats: {
          titles: [
            'Real Madrid',
            'Bayern Munich',
            'Barcelona',
            'Liverpool',
            'Inter Milan',
            'Manchester City',
            'Chelsea',
            'Porto',
            'Borussia Dortmund',
            'Manchester United',
          ].includes(p.club)
            ? 1
            : 0,
          appearances: 10,
        },
      });
    }
  }

  return cards;
}

export const UCL_2026_27_PLAYERS: Player[] = build2026_27PlayerCards();

/**
 * Fetch all cards for a specific 2026-27 club challenge.
 * Returns exactly 11 player cards for populated clubs.
 */
export function get2026_27CardsForClub(club: string): Player[] {
  const norm = club.trim().toLowerCase();
  return UCL_2026_27_PLAYERS.filter(
    (c) => c.club.trim().toLowerCase() === norm
  );
}

/**
 * Randomly rolls an eligible 2026-27 club challenge among the currently available clubs.
 */
export function getRandom2026_27Challenge(currentClub?: string): { club: string; season: '2026-27' } {
  const available = UCL_2026_27_CHALLENGES.filter(
    (c) => !currentClub || c.club.toLowerCase() !== currentClub.toLowerCase()
  );
  return available[Math.floor(Math.random() * available.length)] || UCL_2026_27_CHALLENGES[0];
}

export type { ClubSquad2026_27, PlayerEntry2026_27 };
