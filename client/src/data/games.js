// Extensible Games Registry for FC Bayern Games Platform
export const GAMES = [
  {
    id: "mystery-player",
    title: "MYSTERY PLAYER",
    category: "FEATURED CHALLENGE",
    tagline: "Identify the player. Build your Bayern XI.",
    badges: ["11 ROUNDS", "BUILD YOUR XI", "QUIZ"],
    status: "available",
    route: "/mystery-player",
    featured: true,
    actionText: "PLAY NOW →"
  },
  {
    id: "38-0",
    title: "38–0",
    category: "SEASON STRATEGY",
    tagline: "Can you guide Bayern through an unbeaten Bundesliga campaign?",
    badges: ["38 MATCHES", "STRATEGY"],
    status: "coming-soon",
    route: null,
    featured: false,
    actionText: "COMING SOON"
  },
  {
    id: "who-am-i",
    title: "WHO AM I?",
    category: "CAREER PUZZLE",
    tagline: "Trace a Bayern player's career from clues.",
    badges: ["CAREER", "PUZZLE", "DEDUCTION"],
    status: "available",
    route: "/guess-player",
    featured: false,
    actionText: "PLAY NOW →"
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
