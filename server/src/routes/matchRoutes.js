import express from 'express';

const router = express.Router();

// Vercel Serverless Function: GET /api/next-match
// Unified fixture selection across ALL competitions (Bundesliga, UEFA Champions League, DFB-Pokal, etc.)
// 1. Primary: API-Football (queries team=157 across all competitions without restricting to Bundesliga)
// 2. Fallback: OpenLigaDB multi-competition feed (bl1/2026, ucl/2026, dfb/2026)
// 3. Selects the chronologically earliest valid upcoming fixture or active LIVE match
// 4. Multi-tier caching (6h form, 12h H2H, 15m upcoming, 25s live) with rate-limit cooldown

const VENUE_MAP = {
  // Bundesliga
  'FC Augsburg': 'WWK Arena, Augsburg',
  'Augsburg': 'WWK Arena, Augsburg',
  'FC Bayern München': 'Allianz Arena, München',
  'Bayern': 'Allianz Arena, München',
  'Borussia Dortmund': 'Signal Iduna Park, Dortmund',
  'Dortmund': 'Signal Iduna Park, Dortmund',
  'RB Leipzig': 'Red Bull Arena, Leipzig',
  'Leipzig': 'Red Bull Arena, Leipzig',
  'Bayer 04 Leverkusen': 'BayArena, Leverkusen',
  'Leverkusen': 'BayArena, Leverkusen',
  'Eintracht Frankfurt': 'Deutsche Bank Park, Frankfurt',
  'Frankfurt': 'Deutsche Bank Park, Frankfurt',
  'VfB Stuttgart': 'MHPArena, Stuttgart',
  'Stuttgart': 'MHPArena, Stuttgart',
  'SC Freiburg': 'Europa-Park Stadion, Freiburg',
  'Freiburg': 'Europa-Park Stadion, Freiburg',
  'VfL Wolfsburg': 'Volkswagen Arena, Wolfsburg',
  'Wolfsburg': 'Volkswagen Arena, Wolfsburg',
  'Borussia Mönchengladbach': 'Borussia-Park, Mönchengladbach',
  'Gladbach': 'Borussia-Park, Mönchengladbach',
  '1. FC Union Berlin': 'Stadion An der Alten Försterei, Berlin',
  'Union Berlin': 'Stadion An der Alten Försterei, Berlin',
  'SV Werder Bremen': 'Weserstadion, Bremen',
  'Bremen': 'Weserstadion, Bremen',
  'TSG 1899 Hoffenheim': 'PreZero Arena, Sinsheim',
  'Hoffenheim': 'PreZero Arena, Sinsheim',
  '1. FSV Mainz 05': 'Mewa Arena, Mainz',
  'Mainz': 'Mewa Arena, Mainz',
  '1. FC Heidenheim 1846': 'Voith-Arena, Heidenheim',
  'Heidenheim': 'Voith-Arena, Heidenheim',
  'FC St. Pauli': 'Millerntor-Stadion, Hamburg',
  'St. Pauli': 'Millerntor-Stadion, Hamburg',
  'Holstein Kiel': 'Holstein-Stadion, Kiel',
  'Kiel': 'Holstein-Stadion, Kiel',
  'VfL Bochum 1848': 'Vonovia Ruhrstadion, Bochum',
  'Bochum': 'Vonovia Ruhrstadion, Bochum',
  // UEFA Champions League & European Opponents
  'Viking': 'SR-Bank Arena, Stavanger',
  'Viking FK': 'SR-Bank Arena, Stavanger',
  'Arsenal': 'Emirates Stadium, London',
  'Arsenal FC': 'Emirates Stadium, London',
  'Bodö/Glimt': 'Aspmyra Stadion, Bodø',
  'FK Bodø/Glimt': 'Aspmyra Stadion, Bodø',
  'Lille': 'Decathlon Arena, Lille',
  'LOSC Lille': 'Decathlon Arena, Lille',
  'Slavia Prag': 'Fortuna Arena, Prague',
  'SK Slavia Prag': 'Fortuna Arena, Prague',
  'ManU': 'Old Trafford, Manchester',
  'Manchester United': 'Old Trafford, Manchester',
  'Real Betis': 'Estadio Benito Villamarín, Seville',
  'Aston Villa': 'Villa Park, Birmingham',
  'FC Barcelona': 'Estadi Olímpic Lluís Companys, Barcelona',
  'Barcelona': 'Estadi Olímpic Lluís Companys, Barcelona',
  'Real Madrid': 'Santiago Bernabéu, Madrid',
  'Paris Saint-Germain': 'Parc des Princes, Paris',
  'PSG': 'Parc des Princes, Paris',
  'Inter': 'San Siro, Milan',
  'Juventus': 'Allianz Stadium, Turin',
  'Benfica': 'Estádio da Luz, Lisbon',
  'Sporting CP': 'Estádio José Alvalade, Lisbon',
  'Feyenoord': 'De Kuip, Rotterdam',
  'PSV': 'Philips Stadion, Eindhoven',
  'Celtic': 'Celtic Park, Glasgow',
  // DFB-Pokal Opponents
  'Magdeburg': 'Avnet Arena, Magdeburg',
  '1. FC Magdeburg': 'Avnet Arena, Magdeburg',
  'Osnabrück': 'Bremer Brücke, Osnabrück',
  'VfL Osnabrück': 'Bremer Brücke, Osnabrück',
  'Ulm': 'Donaustadion, Ulm',
  'SSV Ulm 1846': 'Donaustadion, Ulm',
  'Preußen Münster': 'Preußenstadion, Münster',
  'Saarbrücken': 'Ludwigsparkstadion, Saarbrücken',
  '1. FC Saarbrücken': 'Ludwigsparkstadion, Saarbrücken'
};

function normalizeCompetitionName(rawName) {
  if (!rawName) return 'Bundesliga';
  if (/champions\s*league/i.test(rawName) || /ucl/i.test(rawName)) return 'UEFA Champions League';
  if (/pokal/i.test(rawName) || /dfb/i.test(rawName)) return 'DFB-Pokal';
  if (/supercup/i.test(rawName)) return 'DFL-Supercup';
  if (/europa\s*league/i.test(rawName) || /uel/i.test(rawName)) return 'UEFA Europa League';
  if (/conference\s*league/i.test(rawName) || /uecl/i.test(rawName)) return 'UEFA Conference League';
  if (/club\s*world\s*cup/i.test(rawName) || /klubwelt/i.test(rawName)) return 'FIFA Club World Cup';
  if (/bundesliga/i.test(rawName) || /bl1/i.test(rawName)) return 'Bundesliga';
  return rawName.replace(/\s*20\d\d(\/20?\d\d)?/g, '').trim();
}

const cachedPayloads = new Map();
const formCache = new Map();
const FORM_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Quota exhaustion cooldown tracker
let apiFootballQuotaExhaustedUntil = 0;
let lastKnownApiFootballFixtureId = null;

async function safeFetchOpenLiga(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'FCBayern/2.0' }
      });
      clearTimeout(timeout);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }
  return [];
}

function formatOpenLigaMatch(rawMatch, status = 'NS', liveScore = null) {
  if (!rawMatch) return null;
  const isHome = rawMatch.team1.teamId === 40 || 
                 /bayern/i.test(rawMatch.team1.shortName || '') || 
                 /bayern/i.test(rawMatch.team1.teamName || '');

  const homeTeam = rawMatch.team1;
  const awayTeam = rawMatch.team2;
  const opponentTeam = isHome ? awayTeam : homeTeam;
  const oppName = opponentTeam.teamName || opponentTeam.shortName || 'Opponent';

  const venue = isHome 
    ? 'Allianz Arena, München' 
    : (VENUE_MAP[oppName] || VENUE_MAP[opponentTeam.shortName] || (rawMatch.location?.locationCity ? rawMatch.location.locationCity : `${oppName} Stadium`));

  let finalScore = liveScore;
  if (status === 'LIVE' && !finalScore) {
    const endResult = rawMatch.matchResults?.find(r => r.resultName === 'Endergebnis') ||
                      rawMatch.matchResults?.[rawMatch.matchResults.length - 1];
    if (endResult) {
      finalScore = {
        home: isHome ? (endResult.pointsTeam1 ?? 0) : (endResult.pointsTeam2 ?? 0),
        away: isHome ? (endResult.pointsTeam2 ?? 0) : (endResult.pointsTeam1 ?? 0)
      };
    } else if (rawMatch.goals && rawMatch.goals.length > 0) {
      const lastGoal = rawMatch.goals[rawMatch.goals.length - 1];
      finalScore = {
        home: isHome ? lastGoal.scoreTeam1 : lastGoal.scoreTeam2,
        away: isHome ? lastGoal.scoreTeam2 : lastGoal.scoreTeam1
      };
    }
  }

  const compName = normalizeCompetitionName(rawMatch.rawComp || rawMatch.leagueName);

  return {
    id: rawMatch.matchID,
    date: rawMatch.matchDateTimeUTC || rawMatch.matchDateTime,
    timestamp: Math.floor(new Date(rawMatch.matchDateTimeUTC || rawMatch.matchDateTime).getTime() / 1000),
    isHome,
    venue,
    competition: {
      id: rawMatch.leagueId || null,
      name: compName,
      round: rawMatch.group?.groupName || 'Regular Season',
      logo: null
    },
    bayern: {
      name: 'FC Bayern München',
      shortName: 'FC Bayern',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg'
    },
    opponent: {
      name: oppName,
      shortName: opponentTeam.shortName || oppName,
      logo: opponentTeam.teamIconUrl || null
    },
    homeTeam: {
      name: homeTeam.teamName || homeTeam.shortName,
      shortName: homeTeam.shortName || homeTeam.teamName,
      logo: isHome ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg' : homeTeam.teamIconUrl,
      isBayern: isHome
    },
    awayTeam: {
      name: awayTeam.teamName || awayTeam.shortName,
      shortName: awayTeam.shortName || awayTeam.teamName,
      logo: !isHome ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg' : awayTeam.teamIconUrl,
      isBayern: !isHome
    },
    score: finalScore,
    status
  };
}

async function fetchFromOpenLigaDB() {
  // Query all active competitions and current rounds for cross-competition coverage
  const [bl1, ucl, dfb, curBl1, curUcl, curDfb, prev2025] = await Promise.all([
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl1/2026'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/ucl/2026'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/dfb/2026'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl1'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/ucl'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/dfb'),
    safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl1/2025/34')
  ]);

  const isBayern = m =>
    (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName || '') || /bayern/i.test(m.team1.teamName || ''))) ||
    (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName || '') || /bayern/i.test(m.team2.teamName || '')));

  const now = Date.now();
  let selectedMatch = null;
  let matchStatus = 'NS';
  let liveScore = null;

  // 1. Check if Bayern has an in-progress LIVE match in any current round across competitions
  const currentMatches = [
    ...(Array.isArray(curBl1) ? curBl1.map(m => ({ ...m, rawComp: m.leagueName || 'Bundesliga' })) : []),
    ...(Array.isArray(curUcl) ? curUcl.map(m => ({ ...m, rawComp: m.leagueName || 'UEFA Champions League' })) : []),
    ...(Array.isArray(curDfb) ? curDfb.map(m => ({ ...m, rawComp: m.leagueName || 'DFB-Pokal' })) : [])
  ];

  for (const m of currentMatches) {
    if (isBayern(m) && !m.matchIsFinished) {
      const kickoffMs = new Date(m.matchDateTimeUTC || m.matchDateTime).getTime();
      if (!isNaN(kickoffMs)) {
        const elapsedMs = now - kickoffMs;
        const hasLiveResults = m.matchResults && m.matchResults.length > 0;
        if (elapsedMs >= 0 && (elapsedMs <= 160 * 60 * 1000 || hasLiveResults)) {
          selectedMatch = m;
          matchStatus = 'LIVE';
          break;
        }
      }
    }
  }

  // 2. Build sorted upcoming candidate list across ALL competitions
  const allBayernMatches = [
    ...(Array.isArray(bl1) ? bl1.filter(isBayern).map(m => ({ ...m, rawComp: m.leagueName || 'Bundesliga' })) : []),
    ...(Array.isArray(ucl) ? ucl.filter(isBayern).map(m => ({ ...m, rawComp: m.leagueName || 'UEFA Champions League' })) : []),
    ...(Array.isArray(dfb) ? dfb.filter(isBayern).map(m => ({ ...m, rawComp: m.leagueName || 'DFB-Pokal' })) : [])
  ];

  allBayernMatches.sort((a, b) =>
    new Date(a.matchDateTimeUTC || a.matchDateTime).getTime() - new Date(b.matchDateTimeUTC || b.matchDateTime).getTime()
  );

  const upcomingCandidates = allBayernMatches.filter(m => {
    if (m.matchIsFinished) return false;
    // Exclude cancelled / abandoned matches
    if (m.isCancelled || m.status === 'CANC' || m.status === 'ABD') return false;
    const kickoffMs = new Date(m.matchDateTimeUTC || m.matchDateTime).getTime();
    if (isNaN(kickoffMs)) return false;
    // Exclude unconfirmed / past postponed matches
    if (m.isPostponed && kickoffMs <= now) return false;
    // Exclude overdue matches that passed kickoff beyond the live window without starting
    if (now - kickoffMs > 160 * 60 * 1000) return false;
    return true;
  });

  let followingRawMatch = null;
  if (!selectedMatch) {
    selectedMatch = upcomingCandidates[0] || null;
    followingRawMatch = upcomingCandidates[1] || null;
    if (selectedMatch) {
      const kMs = new Date(selectedMatch.matchDateTimeUTC || selectedMatch.matchDateTime).getTime();
      if (!isNaN(kMs) && now >= kMs && now - kMs <= 160 * 60 * 1000) {
        matchStatus = 'LIVE';
      } else {
        matchStatus = 'NS';
      }
    }
  } else {
    followingRawMatch = upcomingCandidates.find(m => m.matchID !== selectedMatch.matchID) || null;
  }

  if (!selectedMatch) return null;

  const match = formatOpenLigaMatch(selectedMatch, matchStatus, liveScore);
  const followingMatch = followingRawMatch ? formatOpenLigaMatch(followingRawMatch, 'NS', null) : null;

  // Recent Form extraction across all competitions
  const isMatch1Home = selectedMatch.team1.teamId === 40 || 
                       /bayern/i.test(selectedMatch.team1.shortName || '') || 
                       /bayern/i.test(selectedMatch.team1.teamName || '');
  const opponent1Team = isMatch1Home ? selectedMatch.team2 : selectedMatch.team1;
  const opp1Id = opponent1Team.teamId || opponent1Team.shortName || opponent1Team.teamName;

  let followingOpponentTeam = null;
  let followingOppFormKey = null;

  if (followingRawMatch) {
    const isFollHome = followingRawMatch.team1.teamId === 40 ||
                       /bayern/i.test(followingRawMatch.team1.shortName || '') || 
                       /bayern/i.test(followingRawMatch.team1.teamName || '');
    followingOpponentTeam = isFollHome ? followingRawMatch.team2 : followingRawMatch.team1;
    const follOppId = followingOpponentTeam.teamId || followingOpponentTeam.shortName || followingOpponentTeam.teamName;
    followingOppFormKey = `openliga-cross-form-${follOppId}`;
  }

  // Extract all completed matches across competitions to build form
  let allFinished = [];
  try {
    const finishedBl1 = Array.isArray(bl1) ? bl1.filter(m => m.matchIsFinished) : [];
    const finishedUcl = Array.isArray(ucl) ? ucl.filter(m => m.matchIsFinished) : [];
    const finishedDfb = Array.isArray(dfb) ? dfb.filter(m => m.matchIsFinished) : [];
    const finished2025 = Array.isArray(prev2025) ? prev2025.filter(m => m.matchIsFinished) : [];
    allFinished = [...finished2025, ...finishedBl1, ...finishedUcl, ...finishedDfb];
    allFinished.sort((a, b) => new Date(a.matchDateTimeUTC || a.matchDateTime).getTime() - new Date(b.matchDateTimeUTC || b.matchDateTime).getTime());
  } catch (err) {
    console.warn('Could not parse OpenLigaDB past matches for form:', err.message);
  }

  function extractLast4(teamCheck) {
    const teamMatches = allFinished.filter(m => teamCheck(m));
    const last4 = teamMatches.slice(-4);
    return last4.map(m => {
      const isTeam1 = teamCheck({ team1: m.team1, team2: { shortName: '', teamName: '' } });
      const endResult = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[m.matchResults.length - 1];
      const goalsFor = isTeam1 ? (endResult?.pointsTeam1 ?? 0) : (endResult?.pointsTeam2 ?? 0);
      const goalsAgainst = isTeam1 ? (endResult?.pointsTeam2 ?? 0) : (endResult?.pointsTeam1 ?? 0);
      const result = goalsFor > goalsAgainst ? 'W' : (goalsFor === goalsAgainst ? 'D' : 'L');
      const opp = isTeam1 ? m.team2 : m.team1;
      return {
        opponent: opp?.shortName || opp?.teamName || 'Opponent',
        score: `${goalsFor}-${goalsAgainst}`,
        result,
        isHome: isTeam1,
        date: m.matchDateTimeUTC || m.matchDateTime
      };
    });
  }

  function getOpponentFilter(team) {
    const oppShort = (team?.shortName || team?.teamName || '').trim().toLowerCase();
    const oppFull = (team?.teamName || team?.shortName || '').trim().toLowerCase();
    return m => {
      const matchesT1 = m.team1 && (
        (team?.teamId && m.team1.teamId === team.teamId) ||
        (oppShort && m.team1.shortName?.toLowerCase().includes(oppShort)) ||
        (oppFull && m.team1.teamName?.toLowerCase().includes(oppFull))
      );
      const matchesT2 = m.team2 && (
        (team?.teamId && m.team2.teamId === team.teamId) ||
        (oppShort && m.team2.shortName?.toLowerCase().includes(oppShort)) ||
        (oppFull && m.team2.teamName?.toLowerCase().includes(oppFull))
      );
      return matchesT1 || matchesT2;
    };
  }

  // Track latest completed match ID to automatically invalidate form cache when a match finishes
  const bayernFinished = allFinished.filter(isBayern);
  const latestBayernFinishedId = bayernFinished[bayernFinished.length - 1]?.matchID || null;

  const bayernFormKey = 'openliga-cross-form-40';
  const cachedBayernForm = formCache.get(bayernFormKey);
  let bayernForm = null;

  if (cachedBayernForm && cachedBayernForm.latestFinishedId === latestBayernFinishedId && (now - cachedBayernForm.time < FORM_CACHE_TTL_MS)) {
    bayernForm = cachedBayernForm.data;
  } else {
    bayernForm = extractLast4(isBayern);
    formCache.set(bayernFormKey, { data: bayernForm, time: now, latestFinishedId: latestBayernFinishedId });
  }

  const opp1Filter = getOpponentFilter(opponent1Team);
  const opp1Finished = allFinished.filter(opp1Filter);
  const latestOpp1FinishedId = opp1Finished[opp1Finished.length - 1]?.matchID || null;
  const opp1FormKey = `openliga-cross-form-${opp1Id}`;
  const cachedOpp1Form = formCache.get(opp1FormKey);
  let opponentForm = null;

  if (cachedOpp1Form && cachedOpp1Form.latestFinishedId === latestOpp1FinishedId && (now - cachedOpp1Form.time < FORM_CACHE_TTL_MS)) {
    opponentForm = cachedOpp1Form.data;
  } else {
    opponentForm = extractLast4(opp1Filter);
    formCache.set(opp1FormKey, { data: opponentForm, time: now, latestFinishedId: latestOpp1FinishedId });
  }

  let followingOpponentForm = null;
  if (followingRawMatch && followingOpponentTeam) {
    const follOppFilter = getOpponentFilter(followingOpponentTeam);
    const follOppFinished = allFinished.filter(follOppFilter);
    const latestFollOppFinishedId = follOppFinished[follOppFinished.length - 1]?.matchID || null;
    const cachedFollOppForm = formCache.get(followingOppFormKey);

    if (cachedFollOppForm && cachedFollOppForm.latestFinishedId === latestFollOppFinishedId && (now - cachedFollOppForm.time < FORM_CACHE_TTL_MS)) {
      followingOpponentForm = cachedFollOppForm.data;
    } else {
      followingOpponentForm = extractLast4(follOppFilter);
      formCache.set(followingOppFormKey, { data: followingOpponentForm, time: now, latestFinishedId: latestFollOppFinishedId });
    }
  }

  return {
    match,
    form: {
      bayern: bayernForm || [],
      opponent: opponentForm || []
    },
    followingMatch,
    followingForm: followingMatch ? {
      bayern: bayernForm || [],
      opponent: followingOpponentForm || []
    } : null
  };
}

async function fetchFromApiFootball(apiKey, timezone = 'Europe/Berlin') {
  const now = Date.now();
  if (now < apiFootballQuotaExhaustedUntil) {
    return null; // Quota cooldown active
  }

  const tzParam = timezone ? `&timezone=${encodeURIComponent(timezone)}` : '';
  let headers = { 'x-apisports-key': apiKey };
  let isRapid = false;

  if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
    isRapid = true;
    headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    };
  }

  const baseUrl = isRapid 
    ? 'https://api-football-v1.p.rapidapi.com/v3'
    : 'https://v3.football.api-sports.io';

  // Retrieve upcoming fixtures across ALL competitions (next=10)
  let endpoint = `${baseUrl}/fixtures?team=157&next=10${tzParam}`;
  let response = await fetch(endpoint, { headers });
  let json = await response.json();

  if (response.status === 429 || json.errors?.rateLimit || json.errors?.requests) {
    console.warn('API-Football quota exhausted or rate limit reached:', json.errors);
    apiFootballQuotaExhaustedUntil = now + 60 * 60 * 1000; // 1h cooldown
    return null;
  }

  if ((!response.ok || (json.errors && Object.keys(json.errors).length > 0)) && !isRapid) {
    // Retry with RapidAPI headers if direct failed
    const rapidRes = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?team=157&next=10${tzParam}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });
    if (rapidRes.ok) {
      const rapidJson = await rapidRes.json();
      if (rapidJson.response && rapidJson.response.length > 0) {
        json = rapidJson;
        response = rapidRes;
      }
    }
  }

  const candidateList = Array.isArray(json.response) ? json.response : [];

  // Filter out completed, cancelled, abandoned, suspended fixtures
  const validFixtures = candidateList.filter(f => {
    const s = f.fixture?.status?.short;
    if (['FT', 'AET', 'PEN', 'CANC', 'ABD', 'AWD', 'WO', 'SUSP', 'INT'].includes(s)) return false;
    // Skip unconfirmed postponed fixtures
    if (s === 'PST' && (!f.fixture?.timestamp || f.fixture.timestamp * 1000 < now)) return false;
    return true;
  });

  validFixtures.sort((a, b) => a.fixture.timestamp - b.fixture.timestamp);

  let selectedFixture = validFixtures[0] || null;
  let secondFixture = validFixtures[1] || null;

  // Check if candidate match is currently live (within active match window)
  if (selectedFixture) {
    const kickoffMs = selectedFixture.fixture.timestamp * 1000;
    const elapsed = now - kickoffMs;
    if (elapsed >= 0 && elapsed <= 180 * 60 * 1000) {
      try {
        const liveRes = await fetch(`${baseUrl}/fixtures?id=${selectedFixture.fixture.id}${tzParam}`, { headers });
        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          if (liveJson.response?.[0]) {
            selectedFixture = liveJson.response[0];
          }
        }
      } catch {}
    }
  }

  if (selectedFixture) {
    const s = selectedFixture.fixture?.status?.short;
    if (['FT', 'AET', 'PEN'].includes(s)) {
      // Just reached full-time! Promote secondFixture to selectedFixture
      selectedFixture = secondFixture;
      secondFixture = validFixtures[2] || null;
      formCache.delete(`apifootball-cross-form-157-${timezone}`);
    }
  }

  if (lastKnownApiFootballFixtureId && selectedFixture && selectedFixture.fixture?.id !== lastKnownApiFootballFixtureId) {
    // Fixture transitioned! Bust Bayern form cache so new result appears
    formCache.delete(`apifootball-cross-form-157-${timezone}`);
  }
  if (selectedFixture) {
    lastKnownApiFootballFixtureId = selectedFixture.fixture?.id;
  }

  if (!selectedFixture) {
    return null;
  }

  function formatApiFootballFixture(f, forceStatus = null) {
    if (!f) return null;
    const { fixture, league, teams, goals } = f;
    const statusShort = forceStatus || fixture.status?.short || 'NS';
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(statusShort);
    const isHome = teams.home.id === 157;
    const oppTeam = isHome ? teams.away : teams.home;

    return {
      id: fixture.id,
      date: fixture.date,
      timestamp: fixture.timestamp,
      timezone: fixture.timezone || timezone,
      isHome,
      venue: fixture.venue?.name 
        ? `${fixture.venue.name}${fixture.venue.city ? `, ${fixture.venue.city}` : ''}`
        : (isHome ? 'Allianz Arena, München' : (VENUE_MAP[oppTeam.name] || `${oppTeam.name} Stadium`)),
      competition: {
        id: league.id || null,
        name: normalizeCompetitionName(league.name),
        round: league.round || null,
        logo: league.logo || null
      },
      bayern: {
        name: 'FC Bayern München',
        shortName: 'FC Bayern',
        logo: isHome ? teams.home.logo : teams.away.logo
      },
      opponent: {
        name: oppTeam.name || 'Opponent',
        shortName: oppTeam.name || 'Opponent',
        logo: oppTeam.logo || null
      },
      homeTeam: {
        name: teams.home.name,
        shortName: teams.home.name,
        logo: teams.home.logo,
        isBayern: isHome
      },
      awayTeam: {
        name: teams.away.name,
        shortName: teams.away.name,
        logo: teams.away.logo,
        isBayern: !isHome
      },
      score: isLive ? {
        home: goals?.home ?? 0,
        away: goals?.away ?? 0
      } : null,
      status: isLive ? (statusShort === 'HT' ? 'HT' : statusShort === 'ET' ? 'ET' : 'LIVE') : statusShort
    };
  }

  const match = formatApiFootballFixture(selectedFixture);
  const followingMatch = secondFixture ? formatApiFootballFixture(secondFixture, 'NS') : null;

  // Fetch last 4 fixtures for Bayern and Opponents from API-Football across all competitions (cached 6 hours)
  async function fetchLast4(teamId) {
    if (!teamId) return [];
    const formKey = `apifootball-cross-form-${teamId}-${timezone}`;
    const cachedForm = formCache.get(formKey);
    if (cachedForm && now - cachedForm.time < FORM_CACHE_TTL_MS) {
      return cachedForm.data;
    }

    try {
      const formEndpoint = `${baseUrl}/fixtures?team=${teamId}&last=4${tzParam}`;
      const res = await fetch(formEndpoint, { headers });
      if (!res.ok) return [];
      const resJson = await res.json();
      if (!resJson.response || !Array.isArray(resJson.response)) return [];

      const finished = resJson.response.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short));
      finished.sort((a, b) => (a.fixture?.timestamp || 0) - (b.fixture?.timestamp || 0));

      const formatted = finished.slice(-4).map(f => {
        const isTeamHome = f.teams.home.id === teamId;
        const opp = isTeamHome ? f.teams.away : f.teams.home;
        const goalsFor = isTeamHome ? f.goals.home : f.goals.away;
        const goalsAgainst = isTeamHome ? f.goals.away : f.goals.home;
        const result = goalsFor > goalsAgainst ? 'W' : (goalsFor === goalsAgainst ? 'D' : 'L');
        return {
          opponent: opp.name,
          score: `${goalsFor}-${goalsAgainst}`,
          result,
          isHome: isTeamHome,
          date: f.fixture.date,
          competition: normalizeCompetitionName(f.league?.name)
        };
      });

      formCache.set(formKey, { data: formatted, time: now });
      return formatted;
    } catch {
      return [];
    }
  }

  const opp1Id = selectedFixture.teams.home.id === 157 ? selectedFixture.teams.away.id : selectedFixture.teams.home.id;
  const opp2Id = secondFixture ? (secondFixture.teams.home.id === 157 ? secondFixture.teams.away.id : secondFixture.teams.home.id) : null;

  const [bayernForm, opponentForm, followingOppForm] = await Promise.all([
    fetchLast4(157),
    fetchLast4(opp1Id),
    opp2Id ? fetchLast4(opp2Id) : Promise.resolve([])
  ]);

  return {
    match,
    form: {
      bayern: bayernForm,
      opponent: opponentForm
    },
    followingMatch,
    followingForm: followingMatch ? {
      bayern: bayernForm,
      opponent: followingOppForm
    } : null
  };
}

router.get('/next-match', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const now = Date.now();
  let timezone = 'Europe/Berlin';
  try {
    const urlObj = new URL(req.url, 'http://localhost');
    timezone = req.query?.timezone || urlObj.searchParams?.get('timezone') || 'Europe/Berlin';
  } catch {}

  const cacheKey = `next-match-${timezone}`;

  // 1. Return from in-memory cache if fresh
  if (cachedPayloads.has(cacheKey)) {
    const cached = cachedPayloads.get(cacheKey);
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(cached.data?.match?.status);
    const isFinished = ['FT', 'AET', 'PEN'].includes(cached.data?.match?.status);

    if (isFinished) {
      // Never serve a finished fixture from upcoming cache
      cachedPayloads.delete(cacheKey);
    } else {
      const matchKickoffMs = cached.data?.match?.timestamp ? cached.data.match.timestamp * 1000 : 0;
      let ttl = 15 * 60 * 1000;
      if (isLive) {
        ttl = 25 * 1000;
      } else if (matchKickoffMs > 0) {
        const timeToKickoff = matchKickoffMs - now;
        if (timeToKickoff <= 0) {
          // Kickoff reached or passed! Rapid 25s polling to detect LIVE or FT transition
          ttl = 25 * 1000;
        } else if (timeToKickoff < 15 * 60 * 1000) {
          // Shrink TTL so pre-match is not served past kickoff
          ttl = Math.max(10 * 1000, timeToKickoff);
        }
      }

      if (now - cached.time < ttl) {
        const cacheHeader = isLive 
          ? 'public, s-maxage=25, max-age=15, stale-while-revalidate=30'
          : (matchKickoffMs > 0 && matchKickoffMs - now < 15 * 60 * 1000
              ? 'public, s-maxage=30, max-age=20, stale-while-revalidate=60'
              : 'public, s-maxage=900, max-age=300, stale-while-revalidate=1800');
        res.setHeader('Cache-Control', cacheHeader);
        return res.status(200).json({ 
          success: true, 
          match: cached.data.match, 
          form: cached.data.form,
          followingMatch: cached.data.followingMatch || null,
          followingForm: cached.data.followingForm || null,
          matches: cached.data.matches || [cached.data.match, cached.data.followingMatch].filter(Boolean),
          source: 'cache' 
        });
      }
    }
  }

  let result = null;
  let source = 'none';

  // 2. Try API-Football if key configured and not in quota cooldown
  const apiKey = process.env.API_FOOTBALL_KEY ||
                 process.env.FOOTBALL_API_KEY ||
                 process.env.APISPORTS_KEY ||
                 process.env.RAPIDAPI_KEY;

  if (apiKey && now >= apiFootballQuotaExhaustedUntil) {
    try {
      result = await fetchFromApiFootball(apiKey, timezone);
      if (result) source = 'api-football';
    } catch (err) {
      console.warn('API-Football request error, trying OpenLigaDB fallback:', err.message);
    }
  }

  // 3. Fallback to OpenLigaDB across all supported competitions
  if (!result) {
    try {
      result = await fetchFromOpenLigaDB();
      if (result) source = 'openligadb';
    } catch (err) {
      console.error('OpenLigaDB request error:', err.message);
    }
  }

  if (result && result.match) {
    const payload = {
      match: result.match,
      form: result.form || null,
      followingMatch: result.followingMatch || null,
      followingForm: result.followingForm || null,
      matches: [result.match, result.followingMatch].filter(Boolean)
    };
    cachedPayloads.set(cacheKey, { data: payload, time: now });
    const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(result.match.status);
    const matchKickoffMs = result.match.timestamp ? result.match.timestamp * 1000 : 0;
    const cacheHeader = isLive 
      ? 'public, s-maxage=25, max-age=15, stale-while-revalidate=30'
      : (matchKickoffMs > 0 && matchKickoffMs - now < 15 * 60 * 1000
          ? 'public, s-maxage=30, max-age=20, stale-while-revalidate=60'
          : 'public, s-maxage=900, max-age=300, stale-while-revalidate=1800');
    res.setHeader('Cache-Control', cacheHeader);
    return res.status(200).json({ 
      success: true, 
      ...payload,
      source 
    });
  }

  return res.status(200).json({
    success: false,
    match: null,
    form: null,
    followingMatch: null,
    followingForm: null,
    matches: [],
    error: 'No upcoming match data available.'
  });
});

export default router;
