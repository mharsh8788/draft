/**
 * outcomes.js
 *
 * Predefined Bayern player trait profiles for Would You Rather?
 * Every possible result maps to a genuine Bayern legend or current star.
 * Local images match the assets in public/images/players/.
 *
 * Trait Architecture:
 * - 8 Shared Core Traits (evaluated across all 15 players)
 * - 3 Outfield Identity Dimensions (finishing, defensive_ability, directness)
 * - 1 Goalkeeper Identity Dimension (goalkeeper_command)
 */

export const ROLE_SUBSPACES = {
  OUTFIELD: 'OUTFIELD',
  GOALKEEPER: 'GOALKEEPER'
};

export const SUBSPACE_DIMENSIONS = {
  OUTFIELD: [
    'technical_ability',
    'creativity',
    'tactical_intelligence',
    'individual_brilliance',
    'consistency',
    'leadership',
    'work_rate',
    'big_game_mentality',
    'finishing',
    'defensive_ability',
    'directness'
  ],
  GOALKEEPER: [
    'technical_ability',
    'creativity',
    'tactical_intelligence',
    'individual_brilliance',
    'consistency',
    'leadership',
    'work_rate',
    'big_game_mentality',
    'goalkeeper_command',
    'directness'
  ]
};

export const BAYERN_PLAYERS = [
  {
    id: 'franz_beckenbauer',
    name: 'Franz Beckenbauer',
    image: '/images/players/beckenbauer.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Der Kaiser & Playmaking Libero',
    headline: 'Regal Composure & Deep Defensive Playmaking',
    bio: 'You view football with majestic composure, effortless technical elegance, and natural commanding authority. Like Franz Beckenbauer, you orchestrate play from deep with peerless vision.',
    traits: {
      technical_ability: 10,
      creativity: 9,
      tactical_intelligence: 10,
      individual_brilliance: 6,
      consistency: 9,
      leadership: 10,
      work_rate: 8,
      big_game_mentality: 9,
      finishing: 5,
      defensive_ability: 10,
      directness: 6,
      team_first: 10,
      goalkeeper_command: 0
    }
  },
  {
    id: 'manuel_neuer',
    name: 'Manuel Neuer',
    image: '/images/players/neuer.jpg',
    roleSubspace: ROLE_SUBSPACES.GOALKEEPER,
    role: 'Sweeper-Keeper Pioneer & Captain',
    headline: 'Ice-Cold Authority & Tactical Revolution',
    bio: 'You prioritize tactical composure, ice-cold decision-making, and modern football intelligence. Like Manuel Neuer, you believe defense and attack are a single connected system.',
    traits: {
      technical_ability: 9,
      creativity: 6,
      tactical_intelligence: 10,
      individual_brilliance: 9,
      consistency: 9,
      leadership: 9,
      work_rate: 7,
      big_game_mentality: 10,
      goalkeeper_command: 10,
      directness: 4,
      finishing: 0,
      defensive_ability: 0,
      team_first: 0
    }
  },
  {
    id: 'oliver_kahn',
    name: 'Oliver Kahn',
    image: '/images/players/kahn.jpg',
    roleSubspace: ROLE_SUBSPACES.GOALKEEPER,
    role: 'Der Titan & Uncompromising Warrior',
    headline: 'Ferocious Willpower & Big-Game Intimidation',
    bio: 'You value raw willpower, intimidating leadership, and unyielding big-game mentality. Like Oliver Kahn, you demand that every player leaves everything on the pitch.',
    traits: {
      technical_ability: 7,
      creativity: 3,
      tactical_intelligence: 8,
      individual_brilliance: 9,
      consistency: 10,
      leadership: 10,
      work_rate: 9,
      big_game_mentality: 10,
      goalkeeper_command: 10,
      directness: 4,
      finishing: 0,
      defensive_ability: 0,
      team_first: 0
    }
  },
  {
    id: 'philipp_lahm',
    name: 'Philipp Lahm',
    image: '/images/players/lahm.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'The Magic Dwarf & Cerebral Mastermind',
    headline: 'Flawless Consistency & Positional Perfection',
    bio: 'You view football through the lens of tactical discipline, balance, and selfless consistency. Like Philipp Lahm, you appreciate quiet mastery and perfection in execution.',
    traits: {
      technical_ability: 9,
      creativity: 8,
      tactical_intelligence: 10,
      individual_brilliance: 6,
      consistency: 9,
      leadership: 8,
      work_rate: 9,
      big_game_mentality: 8,
      finishing: 4,
      defensive_ability: 8,
      directness: 5,
      team_first: 8,
      goalkeeper_command: 0
    }
  },
  {
    id: 'thomas_muller',
    name: 'Thomas Müller',
    image: '/images/players/muller.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Der Raumdeuter & Living Bayern DNA',
    headline: 'Selfless Team Play & Instinctive Space Mastery',
    bio: 'You believe football is won through selfless work ethic, tactical space interpretation, and collective harmony. Like Thomas Müller, you are the voice and heartbeat of Mia San Mia.',
    traits: {
      technical_ability: 7,
      creativity: 8,
      tactical_intelligence: 10,
      individual_brilliance: 6,
      consistency: 9,
      leadership: 10,
      work_rate: 10,
      big_game_mentality: 10,
      finishing: 8,
      defensive_ability: 7,
      directness: 7,
      team_first: 8,
      goalkeeper_command: 0
    }
  },
  {
    id: 'arjen_robben',
    name: 'Arjen Robben',
    image: '/images/players/robben.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Wembley Hero & Clutch Match-Winner',
    headline: 'Ruthless Directness & Decisive Finishing',
    bio: 'You admire explosive directness, individual brilliance, and the courage to take the decisive shot under the floodlights. Like Arjen Robben, you are built for Wembley moments.',
    traits: {
      technical_ability: 9,
      creativity: 7,
      tactical_intelligence: 7,
      individual_brilliance: 10,
      consistency: 7,
      leadership: 6,
      work_rate: 7,
      big_game_mentality: 10,
      finishing: 9,
      defensive_ability: 5,
      directness: 10,
      team_first: 5,
      goalkeeper_command: 0
    }
  },
  {
    id: 'franck_ribery',
    name: 'Franck Ribéry',
    image: '/images/players/ribery.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'The Street Fighter & Creative Virtuoso',
    headline: 'Unscripted Dribbling & Fierce Fighting Spirit',
    bio: 'You cherish street-football artistry, 1v1 flair, and relentless passion for the badge. Like Franck Ribéry, you play with flair on the ball and fire in your heart.',
    traits: {
      technical_ability: 10,
      creativity: 10,
      tactical_intelligence: 7,
      individual_brilliance: 10,
      consistency: 7,
      leadership: 7,
      work_rate: 8,
      big_game_mentality: 9,
      finishing: 7,
      defensive_ability: 5,
      directness: 9,
      team_first: 5,
      goalkeeper_command: 0
    }
  },
  {
    id: 'bastian_schweinsteiger',
    name: 'Bastian Schweinsteiger',
    image: '/images/players/schweinsteiger.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Der Fußballgott & Beating Heart',
    headline: 'Visceral Resilience & Emotional Leadership',
    bio: 'You believe football is a battle of souls where leaders bleed for their teammates. Like Bastian Schweinsteiger, you embody visceral passion, loyalty, and unforgettable grit.',
    traits: {
      technical_ability: 8,
      creativity: 7,
      tactical_intelligence: 10,
      individual_brilliance: 7,
      consistency: 9,
      leadership: 10,
      work_rate: 10,
      big_game_mentality: 10,
      finishing: 6,
      defensive_ability: 9,
      directness: 5,
      team_first: 9,
      goalkeeper_command: 0
    }
  },
  {
    id: 'gerd_muller',
    name: 'Gerd Müller',
    image: '/images/players/gerd-muller.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Der Bomber & Instinctive Goal Machine',
    headline: 'Instinctive Finishing & Lethal Box Supremacy',
    bio: 'You thrive on lethal penalty-box instinct, lightning anticipation, and turning half-chances into historical goals. Like Gerd Müller, you believe goals are the ultimate currency in football.',
    traits: {
      technical_ability: 7,
      creativity: 4,
      tactical_intelligence: 8,
      individual_brilliance: 8,
      consistency: 10,
      leadership: 6,
      work_rate: 7,
      big_game_mentality: 10,
      finishing: 10,
      defensive_ability: 4,
      directness: 9,
      team_first: 4,
      goalkeeper_command: 0
    }
  },
  {
    id: 'robert_lewandowski',
    name: 'Robert Lewandowski',
    image: '/images/players/lewandowski.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'The 41-Goal Record-Breaking Predator',
    headline: 'Clinical Finishing & Relentless Productivity',
    bio: 'You prioritize cold, lethal finishing, physical box supremacy, and relentless goal output. Like Robert Lewandowski, you turn half-chances into historical records.',
    traits: {
      technical_ability: 8,
      creativity: 6,
      tactical_intelligence: 7,
      individual_brilliance: 8,
      consistency: 9,
      leadership: 6,
      work_rate: 7,
      big_game_mentality: 9,
      finishing: 10,
      defensive_ability: 5,
      directness: 9,
      team_first: 5,
      goalkeeper_command: 0
    }
  },
  {
    id: 'harry_kane',
    name: 'Harry Kane',
    image: '/images/players/kane.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Complete Forward & Playmaking Striker',
    headline: 'All-Round Finishing & Masterful Link-Up Play',
    bio: 'You value the complete modern center-forward: lethal finishing inside the box paired with world-class vision and unselfish team link-up. You match Harry Kane.',
    traits: {
      technical_ability: 10,
      creativity: 9,
      tactical_intelligence: 9,
      individual_brilliance: 7,
      consistency: 9,
      leadership: 8,
      work_rate: 7,
      big_game_mentality: 9,
      finishing: 10,
      defensive_ability: 5,
      directness: 6,
      team_first: 5,
      goalkeeper_command: 0
    }
  },
  {
    id: 'joshua_kimmich',
    name: 'Joshua Kimmich',
    image: '/images/players/kimmich.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'The Relentless Driver & Fierce Competitor',
    headline: 'Inexhaustible Work Ethic & Vocal Leadership',
    bio: 'You bring boundless energy, passionate leadership, and non-stop running to every match. Like Joshua Kimmich, you demand 100% commitment from every teammate.',
    traits: {
      technical_ability: 9,
      creativity: 8,
      tactical_intelligence: 10,
      individual_brilliance: 6,
      consistency: 9,
      leadership: 9,
      work_rate: 10,
      big_game_mentality: 8,
      finishing: 5,
      defensive_ability: 8,
      directness: 6,
      team_first: 8,
      goalkeeper_command: 0
    }
  },
  {
    id: 'jamal_musiala',
    name: 'Jamal Musiala',
    image: '/images/players/musiala.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Bambi & Generational Dribbling Magician',
    headline: 'Hypnotic Slalom Dribbling & Pure Imagination',
    bio: 'You celebrate uninhibited flair, dancing through crowded penalty boxes, and creating moments of jaw-dropping magic. Like Jamal Musiala, you play with infectious joy.',
    traits: {
      technical_ability: 10,
      creativity: 9,
      tactical_intelligence: 7,
      individual_brilliance: 10,
      consistency: 6,
      leadership: 4,
      work_rate: 6,
      big_game_mentality: 7,
      finishing: 7,
      defensive_ability: 4,
      directness: 7,
      team_first: 4,
      goalkeeper_command: 0
    }
  },
  {
    id: 'michael_olise',
    name: 'Michael Olise',
    image: '/images/players/olise.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'Left-Footed Virtuoso & Wing Playmaker',
    headline: 'Silky Playmaking & Deceptive Wing Danger',
    bio: 'You value effortless elegance, pinpoint crossing vision, and modern technical flair. Like Michael Olise, you cut inside with deadly creative precision.',
    traits: {
      technical_ability: 9,
      creativity: 10,
      tactical_intelligence: 7,
      individual_brilliance: 8,
      consistency: 6,
      leadership: 4,
      work_rate: 6,
      big_game_mentality: 6,
      finishing: 7,
      defensive_ability: 4,
      directness: 6,
      team_first: 4,
      goalkeeper_command: 0
    }
  },
  {
    id: 'alphonso_davies',
    name: 'Alphonso Davies',
    image: '/images/players/davies.jpg',
    roleSubspace: ROLE_SUBSPACES.OUTFIELD,
    role: 'The Roadrunner & Scintillating Wing-Back',
    headline: 'Blistering Directness & Unstoppable Recovery Pace',
    bio: 'You thrive on electric speed, recovery tackles that leave crowds stunned, and driving forward on the overlap. Like Alphonso Davies, you bring irresistible velocity.',
    traits: {
      technical_ability: 7,
      creativity: 6,
      tactical_intelligence: 6,
      individual_brilliance: 8,
      consistency: 6,
      leadership: 5,
      work_rate: 9,
      big_game_mentality: 8,
      finishing: 4,
      defensive_ability: 8,
      directness: 10,
      team_first: 8,
      goalkeeper_command: 0
    }
  }
];
