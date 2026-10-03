// Vercel Serverless Function: GET /api/next-match
// 1. Queries API-Football for FC Bayern München (Team ID 157) next fixture and last 4 fixtures if API key is present.
//    Supports passing `timezone` parameter to API-Football for visitor-local kickoff time.
// 2. Automatically falls back to the live official OpenLigaDB Bundesliga feed (https://api.openligadb.de/getmatchdata/bl1)
//    if API key is not present, invalid, rate-limited, or returns no upcoming fixture.
// Keeps all secret keys server-side and caches unified payload for 15 minutes per timezone.

const BUNDESLIGA_VENUES = {
  'FC Augsburg': 'WWK Arena, Augsburg',
  'Augsburg': 'WWK Arena, Augsburg',
  'FC Bayern München': 'Allianz Arena, München',
  'Bayern': 'Allianz Arena, München',
  'Borussia Dortmund': 'Signal Iduna Park, Dortmund',
  'Dortmund': 'Signal Iduna Park, Dortmund',
  'RB Leipzig': 'Red Bull Arena, Leipzig',
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
  '1. FC Union Berlin': 'Stadion An der Alten Försterei, Berlin',
  'SV Werder Bremen': 'Weserstadion, Bremen',
  'TSG 1899 Hoffenheim': 'PreZero Arena, Sinsheim',
  '1. FSV Mainz 05': 'Mewa Arena, Mainz',
  '1. FC Heidenheim 1846': 'Voith-Arena, Heidenheim',
  'FC St. Pauli': 'Millerntor-Stadion, Hamburg',
  'Holstein Kiel': 'Holstein-Stadion, Kiel',
  'VfL Bochum 1848': 'Vonovia Ruhrstadion, Bochum'
};

const cachedPayloads = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

async function fetchFromOpenLigaDB() {
  const [resNext, res2026, res2025] = await Promise.all([
    fetch('https://api.openligadb.de/getmatchdata/bl1'),
    fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
    fetch('https://api.openligadb.de/getmatchdata/bl1/2025/34')
  ]);

  if (!resNext.ok) throw new Error(`OpenLigaDB returned HTTP ${resNext.status}`);
  const matches = await resNext.json();
  if (!Array.isArray(matches) || matches.length === 0) return null;

  const bayernMatch = matches.find(m => 
    (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName) || /bayern/i.test(m.team1.teamName))) ||
    (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName) || /bayern/i.test(m.team2.teamName)))
  );

  if (!bayernMatch) return null;

  const isHome = bayernMatch.team1.teamId === 40 || 
                 /bayern/i.test(bayernMatch.team1.shortName) || 
                 /bayern/i.test(bayernMatch.team1.teamName);

  const homeTeam = bayernMatch.team1;
  const awayTeam = bayernMatch.team2;
  const opponentTeam = isHome ? awayTeam : homeTeam;
  const oppName = opponentTeam.teamName || opponentTeam.shortName || 'Opponent';

  const venue = isHome 
    ? 'Allianz Arena, München' 
    : (BUNDESLIGA_VENUES[oppName] || BUNDESLIGA_VENUES[opponentTeam.shortName] || (bayernMatch.location?.locationCity ? bayernMatch.location.locationCity : 'WWK Arena, Augsburg'));

  const match = {
    id: bayernMatch.matchID,
    date: bayernMatch.matchDateTimeUTC || bayernMatch.matchDateTime,
    timestamp: Math.floor(new Date(bayernMatch.matchDateTimeUTC || bayernMatch.matchDateTime).getTime() / 1000),
    isHome,
    venue,
    competition: {
      name: 'Bundesliga',
      round: bayernMatch.group?.groupName || '5. Spieltag',
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
    status: bayernMatch.matchIsFinished ? 'FT' : 'NS'
  };

  // Recent Form extraction (last 4 matches for Bayern & Opponent)
  let allFinished = [];
  try {
    const all2026 = res2026.ok ? await res2026.json() : [];
    const all2025 = res2025.ok ? await res2025.json() : [];
    const finished2026 = Array.isArray(all2026) ? all2026.filter(m => m.matchIsFinished) : [];
    const finished2025 = Array.isArray(all2025) ? all2025.filter(m => m.matchIsFinished) : [];
    allFinished = [...finished2025, ...finished2026];
  } catch (err) {
    console.warn('Could not parse OpenLigaDB past seasons:', err.message);
  }

  function extractLast4(teamCheck) {
    const teamMatches = allFinished.filter(m => teamCheck(m));
    const last4 = teamMatches.slice(-4);
    return last4.map(m => {
      const isTeam1 = teamCheck({ team1: m.team1, team2: { shortName: '' } });
      const endResult = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[m.matchResults.length - 1];
      const goalsFor = isTeam1 ? (endResult?.pointsTeam1 ?? 0) : (endResult?.pointsTeam2 ?? 0);
      const goalsAgainst = isTeam1 ? (endResult?.pointsTeam2 ?? 0) : (endResult?.pointsTeam1 ?? 0);
      const result = goalsFor > goalsAgainst ? 'W' : (goalsFor === goalsAgainst ? 'D' : 'L');
      const opp = isTeam1 ? m.team2 : m.team1;
      return {
        opponent: opp.shortName || opp.teamName,
        score: `${goalsFor}-${goalsAgainst}`,
        result,
        isHome: isTeam1,
        date: m.matchDateTimeUTC || m.matchDateTime
      };
    });
  }

  const bayernForm = extractLast4(m => 
    (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName))) ||
    (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName)))
  );

  const opponentForm = extractLast4(m =>
    (m.team1 && (m.team1.teamId === opponentTeam.teamId || m.team1.shortName?.toLowerCase().includes(opponentTeam.shortName?.toLowerCase()))) ||
    (m.team2 && (m.team2.teamId === opponentTeam.teamId || m.team2.shortName?.toLowerCase().includes(opponentTeam.shortName?.toLowerCase())))
  );

  return {
    match,
    form: {
      bayern: bayernForm,
      opponent: opponentForm
    }
  };
}

async function fetchFromApiFootball(apiKey, timezone = 'Europe/Berlin') {
  const tzParam = timezone ? `&timezone=${encodeURIComponent(timezone)}` : '';
  let endpoint = `https://v3.football.api-sports.io/fixtures?team=157&next=1${tzParam}`;
  let headers = { 'x-apisports-key': apiKey };

  if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
    endpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=157&next=1${tzParam}`;
    headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    };
  }

  let response = await fetch(endpoint, { headers });
  let json = await response.json();

  if ((!response.ok || (json.errors && Object.keys(json.errors).length > 0)) && !endpoint.includes('rapidapi')) {
    const rapidResponse = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?team=157&next=1${tzParam}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });
    if (rapidResponse.ok) {
      const rapidJson = await rapidResponse.json();
      if (rapidJson.response && rapidJson.response.length > 0) {
        json = rapidJson;
        response = rapidResponse;
      }
    }
  }

  if (!response.ok || !json.response || json.response.length === 0) {
    return null;
  }

  const fixtureData = json.response[0];
  const { fixture, league, teams } = fixtureData;

  const isHome = teams.home.id === 157;
  const opponentTeam = isHome ? teams.away : teams.home;
  const opponentId = opponentTeam.id;

  const match = {
    id: fixture.id,
    date: fixture.date,
    timestamp: fixture.timestamp,
    timezone: fixture.timezone || timezone,
    isHome,
    venue: fixture.venue?.name 
      ? `${fixture.venue.name}${fixture.venue.city ? `, ${fixture.venue.city}` : ''}`
      : (isHome ? 'Allianz Arena, München' : null),
    competition: {
      name: league.name || 'Bundesliga',
      round: league.round || null,
      logo: league.logo || null
    },
    bayern: {
      name: 'FC Bayern München',
      shortName: 'FC Bayern',
      logo: isHome ? teams.home.logo : teams.away.logo
    },
    opponent: {
      name: opponentTeam.name || 'Opponent',
      shortName: opponentTeam.name || 'Opponent',
      logo: opponentTeam.logo || null
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
    status: fixture.status?.short || 'NS'
  };

  // Fetch last 4 fixtures for Bayern and Opponent from API-Football
  async function fetchLast4(teamId) {
    try {
      let formEndpoint = `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=4${tzParam}`;
      let formHeaders = { 'x-apisports-key': apiKey };

      if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
        formEndpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&last=4${tzParam}`;
        formHeaders = {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
        };
      }

      const res = await fetch(formEndpoint, { headers: formHeaders });
      if (!res.ok) return [];
      const resJson = await res.json();
      if (!resJson.response || !Array.isArray(resJson.response)) return [];

      return resJson.response.map(f => {
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
          date: f.fixture.date
        };
      });
    } catch {
      return [];
    }
  }

  const [bayernForm, opponentForm] = await Promise.all([
    fetchLast4(157),
    fetchLast4(opponentId)
  ]);

  return {
    match,
    form: {
      bayern: bayernForm,
      opponent: opponentForm
    }
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
    if (now - cached.time < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
      return res.status(200).json({ 
        success: true, 
        match: cached.data.match, 
        form: cached.data.form, 
        source: 'cache' 
      });
    }
  }

  let result = null;
  let source = 'none';

  // 2. Try API-Football if key configured
  const apiKey = process.env.API_FOOTBALL_KEY ||
                 process.env.FOOTBALL_API_KEY ||
                 process.env.APISPORTS_KEY ||
                 process.env.RAPIDAPI_KEY;

  if (apiKey) {
    try {
      result = await fetchFromApiFootball(apiKey, timezone);
      if (result) source = 'api-football';
    } catch (err) {
      console.warn('API-Football request error, trying OpenLigaDB fallback:', err.message);
    }
  }

  // 3. Fallback to OpenLigaDB if API-Football returned no match
  if (!result) {
    try {
      result = await fetchFromOpenLigaDB();
      if (result) source = 'openligadb';
    } catch (err) {
      console.error('OpenLigaDB request error:', err.message);
    }
  }

  if (result && result.match) {
    cachedPayloads.set(cacheKey, { data: result, time: now });
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800');
    return res.status(200).json({ 
      success: true, 
      match: result.match, 
      form: result.form || null, 
      source 
    });
  }

  return res.status(200).json({
    success: false,
    match: null,
    form: null,
    error: 'No upcoming match data available.'
  });
}
