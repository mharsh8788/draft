// Vercel Serverless Function: GET /api/match?id={fixtureId}&timezone={timezone}
// Proxy for API-Football match details, events, statistics, lineups, H2H, and recent form
// Falls back to OpenLigaDB when API key is missing or request fails

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

const cachedDetails = new Map();

async function fetchFromApiFootball(fixtureId, apiKey, timezone = 'Europe/Berlin') {
  const tzParam = timezone ? `&timezone=${encodeURIComponent(timezone)}` : '';
  let endpoint = `https://v3.football.api-sports.io/fixtures?id=${fixtureId}${tzParam}`;
  let headers = { 'x-apisports-key': apiKey };

  if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
    endpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}${tzParam}`;
    headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
    };
  }

  let response = await fetch(endpoint, { headers });
  let json = await response.json();

  if ((!response.ok || (json.errors && Object.keys(json.errors).length > 0)) && !endpoint.includes('rapidapi')) {
    const rapidRes = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?id=${fixtureId}${tzParam}`, {
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

  if (!response.ok || !json.response || json.response.length === 0) {
    return null;
  }

  const fData = json.response[0];
  const { fixture, league, teams, goals, score, events, lineups, statistics } = fData;

  const isHomeBayern = teams.home.id === 157;
  const opponentTeam = isHomeBayern ? teams.away : teams.home;
  const homeTeam = teams.home;
  const awayTeam = teams.away;

  const formattedEvents = (events || []).map(e => ({
    time: e.time?.elapsed || 0,
    extraTime: e.time?.extra || null,
    teamId: e.team?.id,
    teamName: e.team?.name,
    teamLogo: e.team?.logo,
    player: e.player?.name,
    assist: e.assist?.name || null,
    type: e.type,
    detail: e.detail
  }));

  const formattedLineups = (lineups || []).map(l => ({
    teamId: l.team?.id,
    teamName: l.team?.name,
    teamLogo: l.team?.logo,
    formation: l.formation || null,
    coach: l.coach?.name || null,
    coachPhoto: l.coach?.photo || null,
    startXI: (l.startXI || []).map(p => ({
      id: p.player?.id,
      name: p.player?.name,
      number: p.player?.number,
      pos: p.player?.pos,
      grid: p.player?.grid
    })),
    substitutes: (l.substitutes || []).map(p => ({
      id: p.player?.id,
      name: p.player?.name,
      number: p.player?.number,
      pos: p.player?.pos
    }))
  }));

  const formattedStats = (statistics || []).map(s => ({
    teamId: s.team?.id,
    teamName: s.team?.name,
    teamLogo: s.team?.logo,
    stats: (s.statistics || []).map(st => ({
      type: st.type,
      value: st.value
    }))
  }));

  let h2hMatches = [];
  try {
    let h2hEndpoint = `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeTeam.id}-${awayTeam.id}&last=6${tzParam}`;
    let h2hHeaders = { 'x-apisports-key': apiKey };
    if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
      h2hEndpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures/headtohead?h2h=${homeTeam.id}-${awayTeam.id}&last=6${tzParam}`;
      h2hHeaders = {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      };
    }
    const h2hRes = await fetch(h2hEndpoint, { headers: h2hHeaders });
    if (h2hRes.ok) {
      const h2hJson = await h2hRes.json();
      if (h2hJson.response && Array.isArray(h2hJson.response)) {
        h2hMatches = h2hJson.response.map(m => ({
          id: m.fixture.id,
          date: m.fixture.date,
          competition: m.league.name,
          homeTeam: { name: m.teams.home.name, logo: m.teams.home.logo, winner: m.teams.home.winner },
          awayTeam: { name: m.teams.away.name, logo: m.teams.away.logo, winner: m.teams.away.winner },
          score: `${m.goals.home ?? '-'}:${m.goals.away ?? '-'}`
        }));
      }
    }
  } catch {}

  async function fetchRecentForm(teamId) {
    try {
      let formEndpoint = `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=5${tzParam}`;
      let formHeaders = { 'x-apisports-key': apiKey };
      if (process.env.RAPIDAPI_KEY || apiKey.length > 35) {
        formEndpoint = `https://api-football-v1.p.rapidapi.com/v3/fixtures?team=${teamId}&last=5${tzParam}`;
        formHeaders = {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
        };
      }
      const fRes = await fetch(formEndpoint, { headers: formHeaders });
      if (!fRes.ok) return [];
      const fJson = await fRes.json();
      if (!fJson.response || !Array.isArray(fJson.response)) return [];
      return fJson.response.map(f => {
        const isTeamHome = f.teams.home.id === teamId;
        const opp = isTeamHome ? f.teams.away : f.teams.home;
        const goalsFor = isTeamHome ? f.goals.home : f.goals.away;
        const goalsAgainst = isTeamHome ? f.goals.away : f.goals.home;
        const result = goalsFor > goalsAgainst ? 'W' : (goalsFor === goalsAgainst ? 'D' : 'L');
        return {
          id: f.fixture.id,
          date: f.fixture.date,
          opponent: opp.name,
          opponentLogo: opp.logo,
          score: `${goalsFor}-${goalsAgainst}`,
          result,
          isHome: isTeamHome,
          competition: f.league.name
        };
      });
    } catch {
      return [];
    }
  }

  const [bayernRecentForm, oppRecentForm] = await Promise.all([
    fetchRecentForm(157),
    fetchRecentForm(opponentTeam.id)
  ]);

  return {
    fixture: {
      id: fixture.id,
      referee: fixture.referee || null,
      timezone: fixture.timezone || timezone,
      date: fixture.date,
      timestamp: fixture.timestamp,
      venue: fixture.venue?.name
        ? `${fixture.venue.name}${fixture.venue.city ? `, ${fixture.venue.city}` : ''}`
        : (isHomeBayern ? 'Allianz Arena, München' : 'WWK Arena, Augsburg'),
      status: {
        short: fixture.status?.short || 'NS',
        long: fixture.status?.long || 'Not Started',
        elapsed: fixture.status?.elapsed || null,
        extra: fixture.status?.extra || null
      }
    },
    competition: {
      id: league.id,
      name: league.name || 'Bundesliga',
      country: league.country || 'Germany',
      logo: league.logo || null,
      round: league.round || null,
      season: league.season || null
    },
    teams: {
      home: {
        id: homeTeam.id,
        name: homeTeam.name,
        logo: homeTeam.logo,
        isBayern: isHomeBayern
      },
      away: {
        id: awayTeam.id,
        name: awayTeam.name,
        logo: awayTeam.logo,
        isBayern: !isHomeBayern
      }
    },
    score: {
      current: {
        home: goals.home,
        away: goals.away
      },
      halftime: {
        home: score.halftime?.home,
        away: score.halftime?.away
      },
      fulltime: {
        home: score.fulltime?.home,
        away: score.fulltime?.away
      }
    },
    events: formattedEvents,
    lineups: formattedLineups,
    statistics: formattedStats,
    h2h: h2hMatches,
    form: {
      bayern: bayernRecentForm,
      opponent: oppRecentForm
    }
  };
}

async function fetchFromOpenLigaDB(matchId) {
  let matchData = null;

  try {
    const res = await fetch(`https://api.openligadb.de/getmatchdata/${matchId}`);
    if (res.ok) matchData = await res.json();
  } catch {}

  if (!matchData || !matchData.team1) {
    try {
      const resNext = await fetch('https://api.openligadb.de/getmatchdata/bl1');
      if (resNext.ok) {
        const matches = await resNext.json();
        if (Array.isArray(matches)) {
          matchData = matches.find(m =>
            String(m.matchID) === String(matchId) ||
            (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName))) ||
            (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName)))
          );
        }
      }
    } catch {}
  }

  if (!matchData || !matchData.team1 || !matchData.team2) {
    return null;
  }

  const isHomeBayern = matchData.team1.teamId === 40 || /bayern/i.test(matchData.team1.shortName);
  const homeTeam = matchData.team1;
  const awayTeam = matchData.team2;
  const oppTeam = isHomeBayern ? awayTeam : homeTeam;

  const venue = isHomeBayern
    ? 'Allianz Arena, München'
    : (BUNDESLIGA_VENUES[oppTeam.teamName] || BUNDESLIGA_VENUES[oppTeam.shortName] || 'WWK Arena, Augsburg');

  const isFinished = matchData.matchIsFinished;
  const statusShort = isFinished ? 'FT' : 'NS';
  const statusLong = isFinished ? 'Match Finished' : 'Not Started';

  const endResult = matchData.matchResults?.find(r => r.resultName === 'Endergebnis') || matchData.matchResults?.[matchData.matchResults.length - 1];
  const halfResult = matchData.matchResults?.find(r => r.resultName === 'Halbzeitergebnis');

  const homeGoals = endResult ? endResult.pointsTeam1 : null;
  const awayGoals = endResult ? endResult.pointsTeam2 : null;

  const events = (matchData.goals || []).map(g => ({
    time: g.matchMinute || 0,
    extraTime: null,
    teamId: null,
    teamName: g.scoreTeam1 > (g.scoreTeam2 || 0) ? homeTeam.teamName : awayTeam.teamName,
    player: g.goalGetterName || 'Goal',
    assist: null,
    type: 'Goal',
    detail: `${g.scoreTeam1}:${g.scoreTeam2}${g.isPenalty ? ' (Pen)' : ''}${g.isOwnGoal ? ' (OG)' : ''}`
  }));

  let h2hMatches = [];
  let bayernRecent = [];
  let oppRecent = [];

  try {
    const [res2026, res2025] = await Promise.all([
      fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
      fetch('https://api.openligadb.de/getmatchdata/bl1/2025')
    ]);

    const all2026 = res2026.ok ? await res2026.json() : [];
    const all2025 = res2025.ok ? await res2025.json() : [];
    const allMatches = [...(Array.isArray(all2025) ? all2025 : []), ...(Array.isArray(all2026) ? all2026 : [])];

    const directClashes = allMatches.filter(m =>
      m.matchIsFinished && (
        (m.team1.teamId === homeTeam.teamId && m.team2.teamId === awayTeam.teamId) ||
        (m.team1.teamId === awayTeam.teamId && m.team2.teamId === homeTeam.teamId)
      )
    );

    h2hMatches = directClashes.slice(-6).map(m => {
      const resObj = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[0];
      const p1 = resObj?.pointsTeam1 ?? 0;
      const p2 = resObj?.pointsTeam2 ?? 0;
      return {
        id: m.matchID,
        date: m.matchDateTimeUTC || m.matchDateTime,
        competition: 'Bundesliga',
        homeTeam: { name: m.team1.teamName, logo: m.team1.teamIconUrl, winner: p1 > p2 },
        awayTeam: { name: m.team2.teamName, logo: m.team2.teamIconUrl, winner: p2 > p1 },
        score: `${p1}:${p2}`
      };
    });

    function getRecentForm(teamId, teamName) {
      const teamMatches = allMatches.filter(m =>
        m.matchIsFinished && (
          (m.team1 && (m.team1.teamId === teamId || m.team1.teamName?.includes(teamName))) ||
          (m.team2 && (m.team2.teamId === teamId || m.team2.teamName?.includes(teamName)))
        )
      );
      return teamMatches.slice(-5).map(m => {
        const isTeam1 = m.team1.teamId === teamId || m.team1.teamName?.includes(teamName);
        const opp = isTeam1 ? m.team2 : m.team1;
        const resObj = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[0];
        const gf = isTeam1 ? (resObj?.pointsTeam1 ?? 0) : (resObj?.pointsTeam2 ?? 0);
        const ga = isTeam1 ? (resObj?.pointsTeam2 ?? 0) : (resObj?.pointsTeam1 ?? 0);
        const result = gf > ga ? 'W' : (gf === ga ? 'D' : 'L');
        return {
          id: m.matchID,
          date: m.matchDateTimeUTC || m.matchDateTime,
          opponent: opp.shortName || opp.teamName,
          opponentLogo: opp.teamIconUrl,
          score: `${gf}-${ga}`,
          result,
          isHome: isTeam1,
          competition: 'Bundesliga'
        };
      });
    }

    bayernRecent = getRecentForm(40, 'Bayern');
    oppRecent = getRecentForm(oppTeam.teamId, oppTeam.shortName || oppTeam.teamName);
  } catch {}

  return {
    fixture: {
      id: matchData.matchID,
      referee: null,
      timezone: 'Europe/Berlin',
      date: matchData.matchDateTimeUTC || matchData.matchDateTime,
      timestamp: Math.floor(new Date(matchData.matchDateTimeUTC || matchData.matchDateTime).getTime() / 1000),
      venue,
      status: {
        short: statusShort,
        long: statusLong,
        elapsed: isFinished ? 90 : null,
        extra: null
      }
    },
    competition: {
      id: matchData.leagueId || 78,
      name: 'Bundesliga',
      country: 'Germany',
      logo: null,
      round: matchData.group?.groupName || '5. Spieltag',
      season: matchData.leagueSeason || 2026
    },
    teams: {
      home: {
        id: homeTeam.teamId,
        name: homeTeam.teamName,
        logo: isHomeBayern
          ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg'
          : homeTeam.teamIconUrl,
        isBayern: isHomeBayern
      },
      away: {
        id: awayTeam.teamId,
        name: awayTeam.teamName,
        logo: !isHomeBayern
          ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg'
          : awayTeam.teamIconUrl,
        isBayern: !isHomeBayern
      }
    },
    score: {
      current: {
        home: homeGoals,
        away: awayGoals
      },
      halftime: {
        home: halfResult?.pointsTeam1 ?? null,
        away: halfResult?.pointsTeam2 ?? null
      },
      fulltime: {
        home: homeGoals,
        away: awayGoals
      }
    },
    events,
    lineups: [],
    statistics: [],
    h2h: h2hMatches,
    form: {
      bayern: bayernRecent,
      opponent: oppRecent
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

  const fixtureId = req.query?.id || req.query?.fixtureId;
  const timezone = req.query?.timezone || 'Europe/Berlin';

  if (!fixtureId) {
    return res.status(400).json({ success: false, error: 'fixtureId parameter is required' });
  }

  const cacheKey = `match-${fixtureId}-${timezone}`;
  const now = Date.now();

  if (cachedDetails.has(cacheKey)) {
    const cached = cachedDetails.get(cacheKey);
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(cached.data?.fixture?.status?.short);
    const ttl = isLive ? 30 * 1000 : 10 * 60 * 1000;
    if (now - cached.time < ttl) {
      return res.json({ success: true, data: cached.data, source: 'cache' });
    }
  }

  const apiKey = process.env.API_FOOTBALL_KEY ||
                 process.env.FOOTBALL_API_KEY ||
                 process.env.APISPORTS_KEY ||
                 process.env.RAPIDAPI_KEY;

  let detail = null;
  let source = 'none';

  if (apiKey) {
    try {
      detail = await fetchFromApiFootball(fixtureId, apiKey, timezone);
      if (detail) source = 'api-football';
    } catch (err) {
      console.warn('API-Football error:', err.message);
    }
  }

  if (!detail) {
    try {
      detail = await fetchFromOpenLigaDB(fixtureId);
      if (detail) source = 'openligadb';
    } catch (err) {
      console.error('OpenLigaDB error:', err.message);
    }
  }

  if (detail) {
    cachedDetails.set(cacheKey, { data: detail, time: now });
    return res.json({ success: true, data: detail, source });
  }

  return res.status(404).json({
    success: false,
    error: 'Match detail could not be retrieved.'
  });
}
