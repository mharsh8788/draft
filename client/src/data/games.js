// Extensible Games Registry for FC Bayern Games Platform
export const GAMES = [
  {
    id: "mystery-player",
    title: "BLIND PICK",
    category: "TACTICAL DRAFT",
    tagline: "One player revealed. One player hidden. Can you make the right choice?",
    description: "One player revealed. One player hidden. Can you make the right choice?",
    badges: ["11 PLAYERS", "4-3-3 FORMATION", "BLIND SELECTION"],
    status: "available",
    route: "/mystery-player",
    featured: true,
    actionText: "PLAY NOW →"
  },
  {
    id: "who-am-i",
    title: "WHO AM I?",
    image: "/images/bg4.png",
    category: "CAREER PUZZLE",
    tagline: "Trace a Bayern player's career from clues.",
    description: "Decode a Bayern icon's secret identity round by round using transfer history, career honours, appearances, and tactical clues.",
    badges: ["CAREER PATH", "DEDUCTION", "AVAILABLE"],
    status: "available",
    route: "/guess-player",
    featured: false,
    actionText: "PLAY NOW →"
  },
  {
    id: "would-you-rather",
    title: "WOULD YOU RATHER",
    image: "/images/bg2.png",
    category: "BAYERN DILEMMA",
    tagline: "Make your football choices and discover which Bayern legend matches your preferences.",
    description: "Make your football choices and discover which Bayern legend matches your preferences.",
    badges: ["LEGENDS", "PREFERENCES", "AVAILABLE"],
    status: "available",
    route: "/would-you-rather",
    featured: false,
    actionText: "PLAY NOW →"
  },
  {
    id: "road-to-immortality",
    title: "ROAD TO IMMORTALITY",
    image: "/images/bg3.png",
    category: "EUROPEAN DRAFT",
    tagline: "Build your all-time Champions League XI and compete for European glory.",
    description: "Build your all-time Champions League XI and compete for European glory.",
    badges: ["CHAMPIONS LEAGUE", "11 ROUNDS", "AVAILABLE"],
    status: "available",
    route: "/road-to-immortality",
    featured: false,
    actionText: "PLAY NOW →"
  },
  {
    id: "higher-or-lower",
    title: "HIGHER OR LOWER",
    category: "STATISTICAL SHOWDOWN",
    tagline: "Compare football statistics and guess which player has the higher value.",
    description: "Head-to-head metric duels. Guess whether the contender has higher or lower goals, appearances, career trophies, or market valuations.",
    badges: ["STATS BATTLE", "VALUATIONS", "COMING SOON"],
    status: "coming_soon",
    statusLabel: "Coming Soon",
    route: null,
    featured: false,
    actionText: "COMING SOON"
  },
  {
    id: "fake-transfer",
    title: "FAKE TRANSFER",
    category: "TRANSFER DETECTIVE",
    tagline: "A football transfer-themed guessing game.",
    description: "Spot the authentic multi-million euro transfers from fabricated rumours and viral spoof contracts throughout modern football history.",
    badges: ["TRANSFERS", "RUMOUR BUSTER", "COMING SOON"],
    status: "coming_soon",
    statusLabel: "Coming Soon",
    route: null,
    featured: false,
    actionText: "COMING SOON"
  },
  {
    id: "road-to-glory",
    title: "ROAD TO GLORY",
    category: "HISTORICAL CAMPAIGN",
    tagline: "Relive Bayern's unforgettable run to European glory in 2020.",
    description: "Follow Bayern's immaculate 11-match winning streak through London, Lisbon, and the European pinnacle.",
    badges: ["CHAMPIONS LEAGUE", "LISBON 2020", "TREBLE"],
    status: "available",
    route: "/timeline#timeline-event-2020-the-sextuple",
    featured: false,
    actionText: "EXPLORE THE JOURNEY →"
  }
];

export const USER_RECORD = [
  { label: "GAMES PLAYED", value: "—" },
  { label: "CORRECT", value: "—" },
  { label: "BEST STREAK", value: "—" },
  { label: "XP", value: "—" }
];

export const ARCHIVE_CATEGORIES = [
  { name: "PLAYERS", count: "55 Profiles" },
  { name: "SEASONS", count: "1965 – Modern" },
  { name: "TROPHIES", count: "33x Bundesliga • 6x UCL" },
  { name: "RECORDS", count: "All-Time Records" },
  { name: "MANAGERS", count: "Historic Tacticians" },
  { name: "TACTICS", count: "Tactical Systems" }
];

export const FEATURED_MOMENT = {
  kicker: "BAYERN MOMENT",
  year: "2013",
  title: "The Treble",
  description: "Jupp Heynckes leads Bayern to an unprecedented treble — Bundesliga, DFB-Pokal, and Champions League glory at Wembley."
};

export const ROAD_TO_GLORY_MILESTONES = [
  {
    id: "2013-the-treble",
    label: "2013 — The Treble",
    status: "coming_soon",
    statusLabel: "Coming Soon",
    title: "ROAD TO GLORY",
    subtitle: "WEMBLEY GLORY",
    kicker: "CONTINENTAL TREBLE",
    description: "Jupp Heynckes leads Bayern to an unprecedented treble — Bundesliga, DFB-Pokal, and Champions League glory at Wembley.",
    stats: "ALL-GERMAN FINAL · WEMBLEY 2–1",
    statPrimary: "WEMBLEY",
    statSecondary: "2-1 WIN",
    route: "/timeline#timeline-event-2013-the-treble"
  },
  {
    id: "2020-the-sextuple",
    label: "2020 — Lisbon Sextuple",
    status: "available",
    statusLabel: "Available Now",
    title: "ROAD TO GLORY",
    subtitle: "PERFECT CAMPAIGN",
    kicker: "HISTORIC SEXTUPLE",
    description: "Hansi Flick's ruthless Bayern storm through Europe, winning all 11 Champions League matches and concluding with Kingsley Coman's header in Lisbon.",
    stats: "11 CONSECUTIVE UCL VICTORIES",
    statPrimary: "11 WINS",
    statSecondary: "43 GOALS",
    route: "/timeline#timeline-event-2020-the-sextuple"
  },
  {
    id: "2026-ballon-dor",
    label: "2026 — Kane Ballon d'Or",
    status: "coming_soon",
    statusLabel: "Coming Soon",
    title: "ROAD TO GLORY",
    subtitle: "WORLD'S BEST",
    kicker: "HISTORIC CROWN",
    description: "Harry Kane lifts football's greatest individual honour after a record-shattering 53-goal European campaign, becoming Bayern's first Ballon d'Or victor in 45 years.",
    stats: "53 GOALS · EUROPEAN GOLDEN SHOE",
    statPrimary: "BALLON D'OR",
    statSecondary: "53 GOALS",
    route: "/timeline#timeline-event-2026-ballon-dor"
  }
];
