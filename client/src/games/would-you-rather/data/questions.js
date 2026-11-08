/**
 * questions.js
 *
 * Complete 40-question bank for Would You Rather? (FC Bayern Fan Website).
 * Structured into 5 distinct categories (8 questions each) with weighted football traits.
 */

export const TRAIT_KEYS = {
  TECHNICAL_ABILITY: 'technical_ability',
  TACTICAL_INTELLIGENCE: 'tactical_intelligence',
  CREATIVITY: 'creativity',
  LEADERSHIP: 'leadership',
  CONSISTENCY: 'consistency',
  BIG_GAME_MENTALITY: 'big_game_mentality',
  DIRECTNESS: 'directness',
  FINISHING: 'finishing',
  WORK_RATE: 'work_rate',
  TEAM_FIRST: 'team_first',
  INDIVIDUAL_BRILLIANCE: 'individual_brilliance',
  DEFENSIVE_ABILITY: 'defensive_ability',
  GOALKEEPER_COMMAND: 'goalkeeper_command',
  LONG_TERM_DEV: 'long_term_dev'
};

export const TRAIT_LABELS = {
  technical_ability: 'Technical Ability',
  tactical_intelligence: 'Tactical Intelligence',
  creativity: 'Creativity',
  leadership: 'Leadership',
  consistency: 'Consistency',
  big_game_mentality: 'Big-Game Mentality',
  directness: 'Directness',
  finishing: 'Finishing',
  work_rate: 'Work Rate',
  team_first: 'Team-First Mentality',
  individual_brilliance: 'Individual Brilliance',
  defensive_ability: 'Defensive Ability',
  goalkeeper_command: 'Goalkeeper Command',
  long_term_dev: 'Long-Term Development'
};

export const QUESTION_CATEGORIES = {
  PHILOSOPHY: {
    id: 'philosophy',
    label: 'Football Philosophy',
    quota: 2
  },
  MATCH_SITUATIONS: {
    id: 'match_situations',
    label: 'Match Situations and Decision-making',
    quota: 2
  },
  BAYERN_IDENTITY: {
    id: 'bayern_identity',
    label: 'Bayern Munich Identity and History',
    quota: 2
  },
  PLAYER_COMPARISONS: {
    id: 'player_comparisons',
    label: 'Player Comparisons',
    quota: 2
  },
  TEAM_BUILDING: {
    id: 'team_building',
    label: 'Team Building, Legacy and Player Priorities',
    quota: 2
  }
};

export const ALL_QUESTIONS = [
  // ==========================================
  // Category 1: Football Philosophy (Q1 - Q8)
  // ==========================================
  {
    id: 'q1',
    number: 1,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'What kind of football would you rather build your team around?',
    optionA: {
      key: 'A',
      label: 'Patient Possession',
      sublabel: '',
      description: 'Patient possession, positional rotations and controlling the rhythm of matches.',
      traits: { tactical_intelligence: 3, technical_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Aggressive Pressing',
      sublabel: '',
      description: 'Aggressive pressing, quick transitions and attacking space immediately after winning the ball.',
      traits: { work_rate: 3, directness: 3 }
    }
  },
  {
    id: 'q2',
    number: 2,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'How would you prefer your defence to operate?',
    optionA: {
      key: 'A',
      label: 'High Defensive Line',
      sublabel: '',
      description: 'A high defensive line that compresses the pitch and keeps the team close together.',
      traits: { goalkeeper_command: 3, work_rate: 3, tactical_intelligence: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Deep Defensive Block',
      sublabel: '',
      description: 'A deeper defensive block that protects space and invites opponents forward.',
      traits: { defensive_ability: 3, consistency: 3, leadership: 2 }
    }
  },
  {
    id: 'q3',
    number: 3,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'What should define your ideal midfield?',
    optionA: {
      key: 'A',
      label: 'Tempo Dictator',
      sublabel: '',
      description: 'A player who controls tempo, dictates possession and determines where the game is played.',
      traits: { technical_ability: 3, consistency: 2, tactical_intelligence: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Progressive Line-Breaker',
      sublabel: '',
      description: 'A player who breaks lines, takes risks and moves the game forward through progressive actions.',
      traits: { creativity: 3, directness: 3 }
    }
  },
  {
    id: 'q4',
    number: 4,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'Which attacking approach do you prefer?',
    optionA: {
      key: 'A',
      label: 'Coordinated Combinations',
      sublabel: '',
      description: 'Creating chances through combinations, movement and coordinated attacking patterns.',
      traits: { technical_ability: 3, defensive_ability: 2, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Individual Dribbling & 1v1 Flair',
      sublabel: '',
      description: 'Creating chances through individual dribbling, unpredictability and one-versus-one situations.',
      traits: { individual_brilliance: 3, creativity: 3 }
    }
  },
  {
    id: 'q5',
    number: 5,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'Which quality would you prioritise in a modern footballer?',
    optionA: {
      key: 'A',
      label: 'Technical Security',
      sublabel: '',
      description: 'Exceptional technical security and the ability to retain possession under pressure.',
      traits: { technical_ability: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Physical Intensity',
      sublabel: '',
      description: 'Exceptional physical intensity and the ability to influence every phase of the game.',
      traits: { work_rate: 3, leadership: 3 }
    }
  },
  {
    id: 'q6',
    number: 6,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'What would you rather have in a title-winning team?',
    optionA: {
      key: 'A',
      label: 'Consistent Elite Core',
      sublabel: '',
      description: 'Several players who consistently perform at an elite level.',
      traits: { consistency: 3, defensive_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Decisive Match-Winners',
      sublabel: '',
      description: 'A few extraordinary players capable of deciding matches individually.',
      traits: { big_game_mentality: 3, finishing: 3 }
    }
  },
  {
    id: 'q7',
    number: 7,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'Your team has possession against a compact defence. What would you prefer?',
    optionA: {
      key: 'A',
      label: 'Patient Positional Movement',
      sublabel: '',
      description: 'Patiently move the opposition around until a positional opening appears.',
      traits: { tactical_intelligence: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Ambitious Penetration',
      sublabel: '',
      description: 'Attempt ambitious passes, dribbles and combinations to break the defensive structure.',
      traits: { creativity: 3, directness: 3 }
    }
  },
  {
    id: 'q8',
    number: 8,
    category: 'philosophy',
    categoryLabel: 'Football Philosophy',
    title: 'Which football identity appeals to you more?',
    optionA: {
      key: 'A',
      label: 'Tactically Organised System',
      sublabel: '',
      description: 'A tactically organised team where every player understands and executes a specific role.',
      traits: { tactical_intelligence: 3, defensive_ability: 3 }
    },
    optionB: {
      key: 'B',
      label: 'Fluid & Improvisational Freedom',
      sublabel: '',
      description: 'A flexible team where players have greater freedom to interpret situations and improvise.',
      traits: { creativity: 3, individual_brilliance: 3 }
    }
  },

  // ==========================================
  // Category 2: Match Situations and Decision-making (Q9 - Q16)
  // ==========================================
  {
    id: 'q9',
    number: 9,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'Your team leads 1–0 in a Champions League semi-final with 15 minutes remaining.',
    optionA: {
      key: 'A',
      label: 'Continue Attacking',
      sublabel: '',
      description: 'Continue attacking and try to secure the result with another goal.',
      traits: { directness: 3, finishing: 3, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Protect the Lead',
      sublabel: '',
      description: 'Reduce attacking risks, maintain possession selectively and protect the lead.',
      traits: { defensive_ability: 3, goalkeeper_command: 3, consistency: 2 }
    }
  },
  {
    id: 'q10',
    number: 10,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'Your team needs a goal in the final 15 minutes. Who would you rather rely on?',
    optionA: {
      key: 'A',
      label: 'Creative Opening Creator',
      sublabel: '',
      description: 'A creative player capable of producing an unexpected opening.',
      traits: { creativity: 3, technical_ability: 2, individual_brilliance: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Clinical Decisive Finisher',
      sublabel: '',
      description: 'A forward with a strong record of converting chances in decisive situations.',
      traits: { finishing: 3, consistency: 2, big_game_mentality: 2 }
    }
  },
  {
    id: 'q11',
    number: 11,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'Your opponent dominates the midfield. How would you respond?',
    optionA: {
      key: 'A',
      label: 'Reinforce Midfield Control',
      sublabel: '',
      description: 'Match their midfield numbers and compete for control of possession.',
      traits: { tactical_intelligence: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Bypass the Midfield',
      sublabel: '',
      description: 'Bypass their midfield with quicker forward passes and transitions.',
      traits: { directness: 3, work_rate: 2 }
    }
  },
  {
    id: 'q12',
    number: 12,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'You are selecting a player for a Champions League away match. What matters more?',
    optionA: {
      key: 'A',
      label: 'Composure & Decision-Making',
      sublabel: '',
      description: 'Composure, ball retention and the ability to make good decisions under pressure.',
      traits: { technical_ability: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Physical Duels & Disruption',
      sublabel: '',
      description: 'Physical coverage, defensive duels and the ability to disrupt the opposition.',
      traits: { work_rate: 3, leadership: 3 }
    }
  },
  {
    id: 'q13',
    number: 13,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'Your team has struggled to create chances for most of the match. What substitution would you prefer?',
    optionA: {
      key: 'A',
      label: 'Technical Playmaker',
      sublabel: '',
      description: 'A technically gifted playmaker who can unlock the defence.',
      traits: { creativity: 3, technical_ability: 3 }
    },
    optionB: {
      key: 'B',
      label: 'Dynamic Space-Stretcher',
      sublabel: '',
      description: 'A dynamic forward who can stretch the defence and attack space behind it.',
      traits: { directness: 3, work_rate: 3 }
    }
  },
  {
    id: 'q14',
    number: 14,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'You have to choose one quality for your captain during a difficult season.',
    optionA: {
      key: 'A',
      label: 'Tactical Authority',
      sublabel: '',
      description: 'Tactical authority and the ability to organise teammates.',
      traits: { tactical_intelligence: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Emotional Leadership',
      sublabel: '',
      description: 'Emotional leadership and the ability to raise the team\'s intensity.',
      traits: { leadership: 3, big_game_mentality: 3 }
    }
  },
  {
    id: 'q15',
    number: 15,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'You are building a team for a long tournament. Which approach do you prefer?',
    optionA: {
      key: 'A',
      label: 'Settled Starting Eleven',
      sublabel: '',
      description: 'A settled starting eleven with clearly defined roles and responsibilities.',
      traits: { consistency: 3, defensive_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Versatile Squad Rotation',
      sublabel: '',
      description: 'A versatile squad where players can rotate and adapt to different opponents.',
      traits: { work_rate: 3, leadership: 2 }
    }
  },
  {
    id: 'q16',
    number: 16,
    category: 'match_situations',
    categoryLabel: 'Match Situations and Decision-making',
    title: 'Your team has a chance to sign a player who can transform its attack.',
    optionA: {
      key: 'A',
      label: 'Solo Match-Winner',
      sublabel: '',
      description: 'A forward who creates and scores through individual actions.',
      traits: { individual_brilliance: 3, finishing: 3 }
    },
    optionB: {
      key: 'B',
      label: 'Collective Multiplier',
      sublabel: '',
      description: 'A forward who improves collective movement, combinations and the involvement of teammates.',
      traits: { work_rate: 3, leadership: 2, technical_ability: 2 }
    }
  },

  // ==========================================
  // Category 3: Bayern Munich Identity and History (Q17 - Q24)
  // ==========================================
  {
    id: 'q17',
    number: 17,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which Bayern team would you rather have watched throughout its peak season?',
    optionA: {
      key: 'A',
      label: '2012–13 Heynckes Treble Team',
      sublabel: '',
      description: 'The 2012–13 Heynckes team, built around balance, control and physical dominance.',
      traits: { work_rate: 3, directness: 3, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: '2019–20 Flick Sextuple Team',
      sublabel: '',
      description: 'The 2019–20 Flick team, built around pressing, intensity and attacking aggression.',
      traits: { technical_ability: 3, leadership: 3, defensive_ability: 2 }
    }
  },
  {
    id: 'q18',
    number: 18,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which Bayern European achievement would you rather relive?',
    optionA: {
      key: 'A',
      label: 'Wembley 2013 Final',
      sublabel: '',
      description: 'Winning the 2013 Champions League final against Borussia Dortmund at Wembley.',
      traits: { goalkeeper_command: 3, big_game_mentality: 3, leadership: 3 }
    },
    optionB: {
      key: 'B',
      label: 'Lisbon 2020 Unbeaten Campaign',
      sublabel: '',
      description: 'Completing the 2020 Champions League campaign unbeaten and lifting the trophy in Lisbon.',
      traits: { finishing: 3, work_rate: 3, directness: 2 }
    }
  },
  {
    id: 'q19',
    number: 19,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which hypothetical Bayern achievement would mean more to you?',
    optionA: {
      key: 'A',
      label: 'Beat Barcelona 5–0 in Knockout',
      sublabel: '',
      description: 'Beating Barcelona 5–0 in a major European knockout match, but subsequently losing the final.',
      traits: { individual_brilliance: 3, finishing: 3, creativity: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Beat Real Madrid 1–0 in Final',
      sublabel: '',
      description: 'Beating Real Madrid 1–0 in the Champions League final and lifting the trophy.',
      traits: { defensive_ability: 3, goalkeeper_command: 3, leadership: 2 }
    }
  },
  {
    id: 'q20',
    number: 20,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which Bayern rivalry victory would you rather experience?',
    optionA: {
      key: 'A',
      label: 'Eliminate Barcelona in Semi-Final',
      sublabel: '',
      description: 'Eliminating Barcelona in a Champions League semi-final with a dominant aggregate performance.',
      traits: { tactical_intelligence: 3, technical_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Defeat Real Madrid in Final',
      sublabel: '',
      description: 'Defeating Real Madrid in a Champions League final to win the trophy.',
      traits: { big_game_mentality: 3, directness: 3 }
    }
  },
  {
    id: 'q21',
    number: 21,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'You have the choice between two different Bayern transfer strategies.',
    optionA: {
      key: 'A',
      label: 'Develop Aleksandar Pavlović',
      sublabel: '',
      description: 'Continue developing Aleksandar Pavlović into a central figure in midfield.',
      traits: { work_rate: 3, directness: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Sign Declan Rice',
      sublabel: '',
      description: 'Sign Declan Rice to strengthen the midfield immediately.',
      traits: { tactical_intelligence: 3, technical_ability: 2 }
    }
  },
  {
    id: 'q22',
    number: 22,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which type of Bayern squad would you rather build?',
    optionA: {
      key: 'A',
      label: 'Established World-Class Stars',
      sublabel: '',
      description: 'A squad dominated by established world-class players acquired through transfers.',
      traits: { individual_brilliance: 3, finishing: 2, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Academy Graduates & Youth',
      sublabel: '',
      description: 'A squad that gives greater responsibility to academy graduates and developing young players.',
      traits: { work_rate: 3, leadership: 2, consistency: 2 }
    }
  },
  {
    id: 'q23',
    number: 23,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which Bayern achievement would you rather guarantee for the next decade?',
    optionA: {
      key: 'A',
      label: '10 Consecutive Bundesliga Titles',
      sublabel: '',
      description: 'Ten consecutive Bundesliga titles, but no Champions League trophy.',
      traits: { consistency: 3, defensive_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Two Champions League Titles',
      sublabel: '',
      description: 'Two Champions League titles, but several seasons without domestic dominance.',
      traits: { big_game_mentality: 3, individual_brilliance: 3 }
    }
  },
  {
    id: 'q24',
    number: 24,
    category: 'bayern_identity',
    categoryLabel: 'Bayern Munich Identity and History',
    title: 'Which Bayern legacy would you rather be responsible for?',
    optionA: {
      key: 'A',
      label: 'German Era Dominance',
      sublabel: '',
      description: 'Building a team remembered for dominating German football for an entire era.',
      traits: { consistency: 3, tactical_intelligence: 2 }
    },
    optionB: {
      key: 'B',
      label: 'European Conquest',
      sublabel: '',
      description: 'Building a team remembered for repeatedly conquering Europe against the strongest opponents.',
      traits: { big_game_mentality: 3, leadership: 3 }
    }
  },

  // ==========================================
  // Category 4: Player Comparisons (Q25 - Q32)
  // ==========================================
  {
    id: 'q25',
    number: 25,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'At their respective peaks, who would you rather have on your right wing?',
    optionA: {
      key: 'A',
      label: 'Arjen Robben',
      sublabel: '',
      description: 'Direct attacking runs, cutting inside and decisive finishing.',
      traits: { directness: 3, finishing: 3, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Michael Olise',
      sublabel: '',
      description: 'Creative passing, technical combinations and varied final-third delivery.',
      traits: { creativity: 3, technical_ability: 3, consistency: 2 }
    }
  },
  {
    id: 'q26',
    number: 26,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'At their respective peaks, who would you rather have on your left wing?',
    optionA: {
      key: 'A',
      label: 'Franck Ribéry',
      sublabel: '',
      description: 'Close control, dribbling and combination play.',
      traits: { creativity: 3, individual_brilliance: 3, technical_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Alphonso Davies',
      sublabel: '',
      description: 'Acceleration, direct running and attacking space.',
      traits: { directness: 3, work_rate: 3, defensive_ability: 2 }
    }
  },
  {
    id: 'q27',
    number: 27,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Who would you rather have as your goalkeeper at their peak?',
    optionA: {
      key: 'A',
      label: 'Manuel Neuer',
      sublabel: '',
      description: 'Sweeping, distribution and involvement in building attacks.',
      traits: { goalkeeper_command: 3, tactical_intelligence: 3, technical_ability: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Oliver Kahn',
      sublabel: '',
      description: 'Commanding presence, shot-stopping and competitive mentality.',
      traits: { goalkeeper_command: 3, leadership: 3, big_game_mentality: 2 }
    }
  },
  {
    id: 'q28',
    number: 28,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Who would you rather have leading your midfield?',
    optionA: {
      key: 'A',
      label: 'Bastian Schweinsteiger',
      sublabel: '',
      description: 'Physical presence, positional control and leadership.',
      traits: { leadership: 3, big_game_mentality: 3, work_rate: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Joshua Kimmich',
      sublabel: '',
      description: 'Distribution, tactical involvement and control of possession.',
      traits: { work_rate: 3, tactical_intelligence: 3, directness: 2 }
    }
  },
  {
    id: 'q29',
    number: 29,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Which centre-forward would you rather build your attack around?',
    optionA: {
      key: 'A',
      label: 'Gerd Müller',
      sublabel: '',
      description: 'Exceptional positioning, anticipation and instinctive finishing.',
      traits: { finishing: 3, consistency: 3, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Robert Lewandowski',
      sublabel: '',
      description: 'Movement, technical ability and a broader range of attacking contributions.',
      traits: { finishing: 3, directness: 3, technical_ability: 2 }
    }
  },
  {
    id: 'q30',
    number: 30,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Which type of attacking midfielder would you rather have?',
    optionA: {
      key: 'A',
      label: 'Thomas Müller',
      sublabel: '',
      description: 'Intelligent movement, space interpretation and off-ball influence.',
      traits: { work_rate: 3, leadership: 3, finishing: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Jamal Musiala',
      sublabel: '',
      description: 'Close control, dribbling and individual chance creation.',
      traits: { individual_brilliance: 3, technical_ability: 3, creativity: 2 }
    }
  },
  {
    id: 'q31',
    number: 31,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Which defensive leader would you rather have at his peak?',
    optionA: {
      key: 'A',
      label: 'Franz Beckenbauer',
      sublabel: '',
      description: 'Defensive organisation, composure and playmaking from deep.',
      traits: { defensive_ability: 3, technical_ability: 3, leadership: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Philipp Lahm',
      sublabel: '',
      description: 'Positional intelligence, versatility and consistent decision-making.',
      traits: { tactical_intelligence: 3, consistency: 3, work_rate: 2 }
    }
  },
  {
    id: 'q32',
    number: 32,
    category: 'player_comparisons',
    categoryLabel: 'Player Comparisons',
    title: 'Which type of forward would you rather have leading your attack?',
    optionA: {
      key: 'A',
      label: 'Harry Kane',
      sublabel: '',
      description: 'Link-up play, chance creation and goalscoring.',
      traits: { technical_ability: 3, creativity: 3, finishing: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Robert Lewandowski',
      sublabel: '',
      description: 'Penalty-box movement, positioning and finishing.',
      traits: { finishing: 3, directness: 3, consistency: 2 }
    }
  },

  // ==========================================
  // Category 5: Team Building, Legacy and Player Priorities (Q33 - Q40)
  // ==========================================
  {
    id: 'q33',
    number: 33,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'You have the same transfer budget for two players. Which would you sign?',
    optionA: {
      key: 'A',
      label: 'Established World-Class Star',
      sublabel: '',
      description: 'An established world-class player who improves your starting eleven immediately.',
      traits: { big_game_mentality: 3, finishing: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Young Elite Prospect',
      sublabel: '',
      description: 'A young elite prospect who could become world-class but needs time to develop.',
      traits: { work_rate: 3, technical_ability: 2 }
    }
  },
  {
    id: 'q34',
    number: 34,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'You can build your club around one type of player. Which do you choose?',
    optionA: {
      key: 'A',
      label: 'Technical Play Dictator',
      sublabel: '',
      description: 'A technically exceptional player who dictates the team\'s attacking play.',
      traits: { technical_ability: 3, creativity: 3 }
    },
    optionB: {
      key: 'B',
      label: 'Tactical Team Organiser',
      sublabel: '',
      description: 'A tactically intelligent player who improves the organisation of the entire team.',
      traits: { tactical_intelligence: 3, defensive_ability: 2 }
    }
  },
  {
    id: 'q35',
    number: 35,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'Which career would you consider more impressive?',
    optionA: {
      key: 'A',
      label: 'Extraordinary Peak',
      sublabel: '',
      description: 'A player who reaches an extraordinary peak and wins several major individual awards.',
      traits: { individual_brilliance: 3, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Enduring Consistency',
      sublabel: '',
      description: 'A player who remains world-class for a much longer period and wins consistently with their team.',
      traits: { consistency: 3, work_rate: 2 }
    }
  },
  {
    id: 'q36',
    number: 36,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'Which achievement would you value more?',
    optionA: {
      key: 'A',
      label: 'One-Club Icon (15 Years)',
      sublabel: '',
      description: 'Becoming the defining player of a club for 15 years.',
      traits: { leadership: 3, consistency: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Multi-Club Conquest',
      sublabel: '',
      description: 'Reaching the highest individual level and winning major trophies across several clubs.',
      traits: { individual_brilliance: 3, big_game_mentality: 2 }
    }
  },
  {
    id: 'q37',
    number: 37,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'Your team can retain only one of two players.',
    optionA: {
      key: 'A',
      label: 'Decisive Match-Winner',
      sublabel: '',
      description: 'A technically gifted match-winner who can produce decisive moments.',
      traits: { individual_brilliance: 3, finishing: 2, big_game_mentality: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Systemic Team Multiplier',
      sublabel: '',
      description: 'A tactically disciplined player who makes the entire team function better.',
      traits: { tactical_intelligence: 3, leadership: 2, defensive_ability: 2 }
    }
  },
  {
    id: 'q38',
    number: 38,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'Which type of player would you rather have in your squad?',
    optionA: {
      key: 'A',
      label: 'Specialised Role Master',
      sublabel: '',
      description: 'A specialist who is exceptional in one position and role.',
      traits: { finishing: 3, directness: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Versatile Multi-Role Utility',
      sublabel: '',
      description: 'A versatile player who can perform at a high level across several positions.',
      traits: { work_rate: 3, tactical_intelligence: 2, defensive_ability: 2 }
    }
  },
  {
    id: 'q39',
    number: 39,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'Which legacy would you rather leave as a footballer?',
    optionA: {
      key: 'A',
      label: 'Iconic Decisive Moments',
      sublabel: '',
      description: 'Being remembered for extraordinary performances and moments that defined matches.',
      traits: { big_game_mentality: 3, goalkeeper_command: 3, individual_brilliance: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Sustained Team Excellence',
      sublabel: '',
      description: 'Being remembered for consistency, longevity and influence on successful teams.',
      traits: { consistency: 3, defensive_ability: 2, leadership: 2 }
    }
  },
  {
    id: 'q40',
    number: 40,
    category: 'team_building',
    categoryLabel: 'Team Building, Legacy and Player Priorities',
    title: 'You can guarantee one quality across your entire squad. Which do you choose?',
    optionA: {
      key: 'A',
      label: 'Exceptional Technical Ability',
      sublabel: '',
      description: 'Every player has exceptional technical ability and comfort on the ball.',
      traits: { technical_ability: 3, creativity: 2 }
    },
    optionB: {
      key: 'B',
      label: 'Exceptional Tactical Discipline',
      sublabel: '',
      description: 'Every player has exceptional tactical understanding and positional discipline.',
      traits: { tactical_intelligence: 3, consistency: 2 }
    }
  }
];
