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
  if (/2\.\s*(?:fu[ßs]+ball-?)?\s*bundesliga|bl2/i.test(rawName)) return '2. Bundesliga';
  if (/bundesliga/i.test(rawName) || /bl1/i.test(rawName)) return 'Bundesliga';
  return rawName.replace(/\s*20\d\d(\/20?\d\d)?/g, '').trim();
}

function parseOpenLigaResult(matchResults, isTeam1) {
  if (!matchResults || matchResults.length === 0) {
    return { gf: 0, ga: 0, result: 'D', score: '0-0' };
  }

  const penRes = matchResults.find(r => /elfmeter|penalty/i.test(r.resultName || r.resultDescription || r.resultTypeKind || ''));
  const aetRes = matchResults.find(r => /verlängerung|extratime/i.test(r.resultName || r.resultDescription || r.resultTypeKind || ''));
  const endRes = matchResults.find(r => r.resultName === 'Endergebnis') || matchResults[0];

  if (penRes) {
    const pFor = isTeam1 ? (penRes.pointsTeam1 ?? 0) : (penRes.pointsTeam2 ?? 0);
    const pAgainst = isTeam1 ? (penRes.pointsTeam2 ?? 0) : (penRes.pointsTeam1 ?? 0);
    const baseRes = aetRes || endRes;
    const gf = isTeam1 ? (baseRes?.pointsTeam1 ?? 0) : (baseRes?.pointsTeam2 ?? 0);
    const ga = isTeam1 ? (baseRes?.pointsTeam2 ?? 0) : (baseRes?.pointsTeam1 ?? 0);
    const result = pFor > pAgainst ? 'W' : (pFor < pAgainst ? 'L' : 'D');
    return { gf, ga, result, score: `${gf}-${ga} (${pFor}-${pAgainst} p)` };
  }

  if (aetRes) {
    const gf = isTeam1 ? (aetRes.pointsTeam1 ?? 0) : (aetRes.pointsTeam2 ?? 0);
    const ga = isTeam1 ? (aetRes.pointsTeam2 ?? 0) : (aetRes.pointsTeam1 ?? 0);
    const result = gf > ga ? 'W' : (gf < ga ? 'L' : 'D');
    return { gf, ga, result, score: `${gf}-${ga} (AET)` };
  }

  const gf = isTeam1 ? (endRes?.pointsTeam1 ?? 0) : (endRes?.pointsTeam2 ?? 0);
  const ga = isTeam1 ? (endRes?.pointsTeam2 ?? 0) : (endRes?.pointsTeam1 ?? 0);
  const result = gf > ga ? 'W' : (gf < ga ? 'L' : 'D');
  return { gf, ga, result, score: `${gf}-${ga}` };
}

function resolveTeamLogo(teamName, rawLogoUrl) {
  const name = String(teamName || '').toLowerCase().trim();
  if (name.includes('bayern')) {
    return 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg';
  }
  if (name.includes('arsenal')) {
    return '/arsenal-logo.svg';
  }
  return rawLogoUrl || null;
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
      logo: resolveTeamLogo(oppName, opponentTeam.teamIconUrl)
    },
    homeTeam: {
      name: homeTeam.teamName || homeTeam.shortName,
      shortName: homeTeam.shortName || homeTeam.teamName,
      logo: isHome 
        ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg' 
        : resolveTeamLogo(homeTeam.teamName || homeTeam.shortName, homeTeam.teamIconUrl),
      isBayern: isHome
    },
    awayTeam: {
      name: awayTeam.teamName || awayTeam.shortName,
      shortName: awayTeam.shortName || awayTeam.teamName,
      logo: !isHome 
        ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg' 
        : resolveTeamLogo(awayTeam.teamName || awayTeam.shortName, awayTeam.teamIconUrl),
      isBayern: !isHome
    },
    score: finalScore,
    status
  };
}

async function fetchOpenLigaRecentForm(bayernId, oppTarget) {
  const bayernFormKey = 'openliga-cross-form-40';
  const oppTargetKey = oppTarget ? `openliga-cross-form-${String(oppTarget).toLowerCase().replace(/\s+/g, '-')}` : null;
  const now = Date.now();

  let bayernForm = bayernId ? (formCache.get(bayernFormKey)?.data || []) : [];
  let oppForm = oppTargetKey ? (formCache.get(oppTargetKey)?.data || []) : [];

  if ((bayernId && bayernForm.length === 0) || (oppTarget && oppForm.length === 0)) {
    try {
      const [resBl1, resUcl, resDfb, resBl2, res2025, resBl2_2025] = await Promise.all([
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl1/2026'),
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/ucl/2026'),
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/dfb/2026'),
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl2/2026'),
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl1/2025'),
        safeFetchOpenLiga('https://api.openligadb.de/getmatchdata/bl2/2025')
      ]);

      const rawMatches = [
        ...(Array.isArray(res2025) ? res2025 : []),
        ...(Array.isArray(resBl2_2025) ? resBl2_2025 : []),
        ...(Array.isArray(resBl1) ? resBl1 : []),
        ...(Array.isArray(resBl2) ? resBl2 : []),
        ...(Array.isArray(resUcl) ? resUcl : []),
        ...(Array.isArray(resDfb) ? resDfb : [])
      ];

      const matchMap = new Map();
      for (const m of rawMatches) {
        if (m && m.matchID && !matchMap.has(m.matchID)) {
          matchMap.set(m.matchID, m);
        }
      }
      const allMatches = Array.from(matchMap.values());
      const finishedMatches = allMatches.filter(m => m.matchIsFinished);
      // Sort newest first
      finishedMatches.sort((a, b) => new Date(b.matchDateTimeUTC || b.matchDateTime).getTime() - new Date(a.matchDateTimeUTC || a.matchDateTime).getTime());

      function extractForm(teamId, teamName) {
        const sName = teamName ? String(teamName).toLowerCase() : '';
        const teamMatches = finishedMatches.filter(m => {
          const isT1 = m.team1 && (
            (teamId && m.team1.teamId === teamId) ||
            (sName && (m.team1.teamName?.toLowerCase().includes(sName) || m.team1.shortName?.toLowerCase() === sName))
          );
          const isT2 = m.team2 && (
            (teamId && m.team2.teamId === teamId) ||
            (sName && (m.team2.teamName?.toLowerCase().includes(sName) || m.team2.shortName?.toLowerCase() === sName))
          );
          return isT1 || isT2;
        });

        return teamMatches.slice(0, 5).map(m => {
          const isT1 = m.team1 && (
            (teamId && m.team1.teamId === teamId) ||
            (sName && (m.team1.teamName?.toLowerCase().includes(sName) || m.team1.shortName?.toLowerCase() === sName))
          );
          const opp = isT1 ? m.team2 : m.team1;
          const { score, result } = parseOpenLigaResult(m.matchResults, isT1);
          const rawOppName = opp?.shortName || opp?.teamName || 'Opponent';
          const cleanOppName = rawOppName.replace(/^(@|vs\.?)\s+/i, '').trim();
          return {
            id: m.matchID,
            date: m.matchDateTimeUTC || m.matchDateTime,
            opponent: cleanOppName,
            opponentLogo: resolveTeamLogo(cleanOppName, opp?.teamIconUrl),
            score,
            result,
            isHome: isT1,
            competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga')
          };
        });
      }

      if (bayernId && bayernForm.length === 0) {
        bayernForm = extractForm(40, 'Bayern');
        formCache.set(bayernFormKey, { data: bayernForm, time: now });
      }
      if (oppTarget && oppForm.length === 0) {
        const targetId = typeof oppTarget === 'number' ? oppTarget : null;
        const targetName = typeof oppTarget === 'string' ? oppTarget : null;
        oppForm = extractForm(targetId, targetName);
        if (oppTargetKey) formCache.set(oppTargetKey, { data: oppForm, time: now });
      }
    } catch {}
  }

  return { bayern: bayernForm, opponent: oppForm };
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
  if (followingRawMatch) {
    const isFollHome = followingRawMatch.team1.teamId === 40 ||
                       /bayern/i.test(followingRawMatch.team1.shortName || '') || 
                       /bayern/i.test(followingRawMatch.team1.teamName || '');
    followingOpponentTeam = isFollHome ? followingRawMatch.team2 : followingRawMatch.team1;
  }

  // Extract up to 5 completed matches across competitions to build form (newest first)
  const formResults = await fetchOpenLigaRecentForm(40, opp1Id);
  const bayernForm = formResults.bayern || [];
  const opponentForm = formResults.opponent || [];

  let followingOpponentForm = null;
  if (followingRawMatch && followingOpponentTeam) {
    const follOppId = followingOpponentTeam.teamId || followingOpponentTeam.shortName || followingOpponentTeam.teamName;
    const follResults = await fetchOpenLigaRecentForm(null, follOppId);
    followingOpponentForm = follResults.opponent || [];
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

  // Fetch latest 5 completed fixtures for Bayern and Opponents across all competitions (cached 6 hours)
  async function fetchRecentForm(teamId) {
    if (!teamId) return [];
    const formKey = `apifootball-cross-form-${teamId}-${timezone}`;
    const cachedForm = formCache.get(formKey);
    if (cachedForm && now - cachedForm.time < FORM_CACHE_TTL_MS) {
      return cachedForm.data;
    }

    try {
      const formEndpoint = `${baseUrl}/fixtures?team=${teamId}&last=10${tzParam}`;
      const res = await fetch(formEndpoint, { headers });
      if (!res.ok) return [];
      const resJson = await res.json();
      if (!resJson.response || !Array.isArray(resJson.response)) return [];

      const completed = resJson.response.filter(f => ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short));

      // Deduplicate by fixture ID
      const seen = new Set();
      const unique = [];
      for (const f of completed) {
        if (f.fixture?.id && !seen.has(f.fixture.id)) {
          seen.add(f.fixture.id);
          unique.push(f);
        }
      }

      // Sort descending (newest first)
      unique.sort((a, b) => new Date(b.fixture?.date).getTime() - new Date(a.fixture?.date).getTime());

      const formatted = unique.slice(0, 5).map(f => {
        const isTeamHome = f.teams.home.id === teamId;
        const teamObj = isTeamHome ? f.teams.home : f.teams.away;
        const opp = isTeamHome ? f.teams.away : f.teams.home;
        const goalsFor = isTeamHome ? f.goals.home : f.goals.away;
        const goalsAgainst = isTeamHome ? f.goals.away : f.goals.home;

        let result = 'D';
        if (teamObj.winner === true) {
          result = 'W';
        } else if (opp.winner === true) {
          result = 'L';
        } else if (goalsFor != null && goalsAgainst != null) {
          result = goalsFor > goalsAgainst ? 'W' : (goalsFor < goalsAgainst ? 'L' : 'D');
        }

        let scoreStr = `${goalsFor ?? 0}-${goalsAgainst ?? 0}`;
        if (f.fixture?.status?.short === 'PEN' && f.score?.penalty?.home != null && f.score?.penalty?.away != null) {
          const penFor = isTeamHome ? f.score.penalty.home : f.score.penalty.away;
          const penAgainst = isTeamHome ? f.score.penalty.away : f.score.penalty.home;
          scoreStr += ` (${penFor}-${penAgainst} p)`;
        }

        const oppName = opp.name ? opp.name.replace(/^(@|vs\.?)\s+/i, '').trim() : 'Opponent';
        return {
          id: f.fixture.id,
          opponent: oppName,
          opponentLogo: opp.logo,
          score: scoreStr,
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

  let [bayernForm, opponentForm, followingOppForm] = await Promise.all([
    fetchRecentForm(157),
    fetchRecentForm(opp1Id),
    opp2Id ? fetchRecentForm(opp2Id) : Promise.resolve([])
  ]);

  // Targeted fallback to OpenLigaDB if form is empty for any team (e.g. 2. Bundesliga / cup teams)
  if (bayernForm.length === 0 || opponentForm.length === 0 || (opp2Id && followingOppForm.length === 0)) {
    try {
      const opp1Target = selectedFixture.teams.home.id === 157 ? selectedFixture.teams.away.name : selectedFixture.teams.home.name;
      const opp2Target = secondFixture ? (secondFixture.teams.home.id === 157 ? secondFixture.teams.away.name : secondFixture.teams.home.name) : null;
      const openLigaData = await fetchOpenLigaRecentForm(
        bayernForm.length === 0 ? 40 : null,
        opponentForm.length === 0 ? opp1Target : null
      );
      if (bayernForm.length === 0 && openLigaData.bayern?.length > 0) {
        bayernForm = openLigaData.bayern;
      }
      if (opponentForm.length === 0 && openLigaData.opponent?.length > 0) {
        opponentForm = openLigaData.opponent;
      }
      if (opp2Id && followingOppForm.length === 0 && opp2Target) {
        const follData = await fetchOpenLigaRecentForm(null, opp2Target);
        if (follData.opponent?.length > 0) followingOppForm = follData.opponent;
      }
    } catch {}
  }

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

export default async function handler(req, res) {
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
              : 'public, s-maxage=120, max-age=60, stale-while-revalidate=180');
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
          : 'public, s-maxage=120, max-age=60, stale-while-revalidate=180');
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
}
