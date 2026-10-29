import express from 'express';

const router = express.Router();

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

const BUNDESLIGA_VENUES = VENUE_MAP;

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

const cachedDetails = new Map();
const h2hCache = new Map();
const formCache = new Map();

const H2H_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const FORM_CACHE_TTL_MS = 6 * 60 * 60 * 1000;  // 6 hours

let apiFootballQuotaExhaustedUntil = 0;

async function fetchMatchDetailsFromApiFootball(fixtureId, apiKey, timezone = 'Europe/Berlin', isLiveOnly = false) {
  const now = Date.now();
  if (now < apiFootballQuotaExhaustedUntil) {
    return null; // Quota cooldown active
  }

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

  if (response.status === 429 || json.errors?.rateLimit || json.errors?.requests) {
    console.warn('API-Football quota exhausted or rate limit reached:', json.errors);
    apiFootballQuotaExhaustedUntil = now + 60 * 60 * 1000;
    return null;
  }

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

  // H2H handling (cached 12 hours)
  const h2hKey = `apifootball-h2h-${homeTeam.id}-${awayTeam.id}`;
  let h2hMatches = h2hCache.get(h2hKey)?.data || [];

  if (!isLiveOnly && h2hMatches.length === 0) {
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
          h2hCache.set(h2hKey, { data: h2hMatches, time: now });
        }
      }
    } catch {}
  }

  // Recent Form handling (cached 6 hours)
  async function fetchRecentForm(teamId) {
    const formKey = `apifootball-detail-form-${teamId}-${timezone}`;
    const cachedForm = formCache.get(formKey);
    if (cachedForm && now - cachedForm.time < FORM_CACHE_TTL_MS) {
      return cachedForm.data;
    }

    if (isLiveOnly) {
      return cachedForm?.data || [];
    }

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
      const completedFixtures = fJson.response.filter(f =>
        ['FT', 'AET', 'PEN'].includes(f.fixture?.status?.short)
      );
      // Sort by actual kickoff timestamp descending (most recent completed match first, oldest last)
      completedFixtures.sort((a, b) => new Date(b.fixture?.date).getTime() - new Date(a.fixture?.date).getTime());
      const formatted = completedFixtures.slice(0, 5).map(f => {
        const isTeamHome = f.teams.home.id === teamId;
        const opp = isTeamHome ? f.teams.away : f.teams.home;
        const goalsFor = isTeamHome ? f.goals.home : f.goals.away;
        const goalsAgainst = isTeamHome ? f.goals.away : f.goals.home;
        const result = goalsFor > goalsAgainst ? 'W' : (goalsFor === goalsAgainst ? 'D' : 'L');
        const oppName = opp.name ? opp.name.replace(/^(@|vs\.?)\s+/i, '').trim() : 'Opponent';
        return {
          id: f.fixture.id,
          date: f.fixture.date,
          opponent: oppName,
          opponentLogo: opp.logo,
          score: `${goalsFor}-${goalsAgainst}`,
          result,
          isHome: isTeamHome,
          competition: f.league.name
        };
      });
      formCache.set(formKey, { data: formatted, time: now });
      return formatted;
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
        : (isHomeBayern ? 'Allianz Arena, München' : (VENUE_MAP[opponentTeam.name] || 'Away Ground')),
      status: {
        short: fixture.status?.short || 'NS',
        long: fixture.status?.long || 'Not Started',
        elapsed: fixture.status?.elapsed || null,
        extra: fixture.status?.extra || null
      }
    },
    competition: {
      id: league.id,
      name: normalizeCompetitionName(league.name),
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

async function fetchMatchDetailsFromOpenLigaDB(matchId, isLiveOnly = false) {
  let matchData = null;

  try {
    const res = await fetch(`https://api.openligadb.de/getmatchdata/${matchId}`);
    if (res.ok) matchData = await res.json();
  } catch {}

  if (!matchData || !matchData.team1) {
    try {
      const [resBl1, resUcl, resDfb] = await Promise.all([
        fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
        fetch('https://api.openligadb.de/getmatchdata/ucl/2026'),
        fetch('https://api.openligadb.de/getmatchdata/dfb/2026')
      ]);

      const listBl1 = resBl1.ok ? await resBl1.json() : [];
      const listUcl = resUcl.ok ? await resUcl.json() : [];
      const listDfb = resDfb.ok ? await resDfb.json() : [];
      const combined = [
        ...(Array.isArray(listBl1) ? listBl1 : []),
        ...(Array.isArray(listUcl) ? listUcl : []),
        ...(Array.isArray(listDfb) ? listDfb : [])
      ];

      matchData = combined.find(m =>
        String(m.matchID) === String(matchId) ||
        (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName || '') || /bayern/i.test(m.team1.teamName || ''))) ||
        (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName || '') || /bayern/i.test(m.team2.teamName || '')))
      );
    } catch {}
  }

  if (!matchData || !matchData.team1 || !matchData.team2) {
    return null;
  }

  const isHomeBayern = matchData.team1.teamId === 40 || /bayern/i.test(matchData.team1.shortName || '') || /bayern/i.test(matchData.team1.teamName || '');
  const homeTeam = matchData.team1;
  const awayTeam = matchData.team2;
  const oppTeam = isHomeBayern ? awayTeam : homeTeam;

  const venue = isHomeBayern
    ? 'Allianz Arena, München'
    : (VENUE_MAP[oppTeam.teamName] || VENUE_MAP[oppTeam.shortName] || (matchData.location?.locationCity ? matchData.location.locationCity : `${oppTeam.teamName || oppTeam.shortName} Stadium`));

  const nowTime = Date.now();
  const kickoffMs = new Date(matchData.matchDateTimeUTC || matchData.matchDateTime).getTime();
  const elapsedMinutes = Math.floor((nowTime - kickoffMs) / 60000);
  const isWithinLiveWindow = elapsedMinutes >= 0 && elapsedMinutes <= 160;
  const hasLiveResults = matchData.matchResults && matchData.matchResults.length > 0;

  const isFinished = matchData.matchIsFinished;
  let statusShort = isFinished ? 'FT' : 'NS';
  let statusLong = isFinished ? 'Match Finished' : 'Not Started';

  if (!isFinished && (isWithinLiveWindow || (hasLiveResults && elapsedMinutes < 180))) {
    statusShort = (elapsedMinutes >= 45 && elapsedMinutes <= 60 && !matchData.goals?.some(g => g.matchMinute > 45)) ? 'HT' : 'LIVE';
    statusLong = statusShort === 'HT' ? 'Half Time' : 'In Play';
  }

  const endResult = matchData.matchResults?.find(r => r.resultName === 'Endergebnis') || matchData.matchResults?.[matchData.matchResults.length - 1];
  const halfResult = matchData.matchResults?.find(r => /halbzeit/i.test(r.resultName || ''));

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

  const now = Date.now();
  const h2hKey = `openliga-h2h-${homeTeam.teamId}-${awayTeam.teamId}`;
  const bayernFormKey = 'openliga-detail-form-40';
  const oppFormKey = `openliga-detail-form-${oppTeam.teamId}`;

  let h2hMatches = h2hCache.get(h2hKey)?.data || [];
  let bayernRecent = formCache.get(bayernFormKey)?.data || [];
  let oppRecent = formCache.get(oppFormKey)?.data || [];

  if (!isLiveOnly && (h2hMatches.length === 0 || bayernRecent.length === 0 || oppRecent.length === 0)) {
    try {
      const [resBl1, resUcl, resDfb, res2025] = await Promise.all([
        fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
        fetch('https://api.openligadb.de/getmatchdata/ucl/2026'),
        fetch('https://api.openligadb.de/getmatchdata/dfb/2026'),
        fetch('https://api.openligadb.de/getmatchdata/bl1/2025')
      ]);

      const allBl1 = resBl1.ok ? await resBl1.json() : [];
      const allUcl = resUcl.ok ? await resUcl.json() : [];
      const allDfb = resDfb.ok ? await resDfb.json() : [];
      const all2025 = res2025.ok ? await res2025.json() : [];
      const allMatches = [
        ...(Array.isArray(all2025) ? all2025 : []),
        ...(Array.isArray(allBl1) ? allBl1 : []),
        ...(Array.isArray(allUcl) ? allUcl : []),
        ...(Array.isArray(allDfb) ? allDfb : [])
      ];

      if (h2hMatches.length === 0) {
        const directClashes = allMatches.filter(m =>
          m.matchIsFinished && (
            (m.team1?.teamId === homeTeam.teamId && m.team2?.teamId === awayTeam.teamId) ||
            (m.team1?.teamId === awayTeam.teamId && m.team2?.teamId === homeTeam.teamId)
          )
        );

        h2hMatches = directClashes.slice(-6).map(m => {
          const resObj = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[0];
          const p1 = resObj?.pointsTeam1 ?? 0;
          const p2 = resObj?.pointsTeam2 ?? 0;
          return {
            id: m.matchID,
            date: m.matchDateTimeUTC || m.matchDateTime,
            competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga'),
            homeTeam: { name: m.team1.teamName, logo: resolveTeamLogo(m.team1.teamName, m.team1.teamIconUrl), winner: p1 > p2 },
            awayTeam: { name: m.team2.teamName, logo: resolveTeamLogo(m.team2.teamName, m.team2.teamIconUrl), winner: p2 > p1 },
            score: `${p1}:${p2}`
          };
        });
        h2hCache.set(h2hKey, { data: h2hMatches, time: now });
      }

      const finishedMatches = allMatches.filter(m => m.matchIsFinished);
      // Sort by actual kickoff timestamp descending (most recent completed match first, oldest last)
      finishedMatches.sort((a, b) => new Date(b.matchDateTimeUTC || b.matchDateTime).getTime() - new Date(a.matchDateTimeUTC || a.matchDateTime).getTime());

      function getRecentForm(teamId, teamName) {
        const teamMatches = finishedMatches.filter(m =>
          (m.team1 && (m.team1.teamId === teamId || (teamName && m.team1.teamName?.includes(teamName)) || (teamName && m.team1.shortName?.toLowerCase() === String(teamName).toLowerCase()))) ||
          (m.team2 && (m.team2.teamId === teamId || (teamName && m.team2.teamName?.includes(teamName)) || (teamName && m.team2.shortName?.toLowerCase() === String(teamName).toLowerCase())))
        );
        return teamMatches.slice(0, 4).map(m => {
          const isTeam1 = m.team1 && (m.team1.teamId === teamId || (teamName && m.team1.teamName?.includes(teamName)) || (teamName && m.team1.shortName?.toLowerCase() === String(teamName).toLowerCase()));
          const opp = isTeam1 ? m.team2 : m.team1;
          const resObj = m.matchResults?.find(r => r.resultName === 'Endergebnis') || m.matchResults?.[0];
          const gf = isTeam1 ? (resObj?.pointsTeam1 ?? 0) : (resObj?.pointsTeam2 ?? 0);
          const ga = isTeam1 ? (resObj?.pointsTeam2 ?? 0) : (resObj?.pointsTeam1 ?? 0);
          const result = gf > ga ? 'W' : (gf === ga ? 'D' : 'L');
          const rawOppName = opp?.shortName || opp?.teamName || 'Opponent';
          const cleanOppName = rawOppName.replace(/^(@|vs\.?)\s+/i, '').trim();
          return {
            id: m.matchID,
            date: m.matchDateTimeUTC || m.matchDateTime,
            opponent: cleanOppName,
            opponentLogo: resolveTeamLogo(cleanOppName, opp?.teamIconUrl),
            score: `${gf}-${ga}`,
            result,
            isHome: isTeam1,
            competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga')
          };
        });
      }

      if (bayernRecent.length === 0) {
        bayernRecent = getRecentForm(40, 'Bayern');
        formCache.set(bayernFormKey, { data: bayernRecent, time: now });
      }
      if (oppRecent.length === 0) {
        oppRecent = getRecentForm(oppTeam.teamId, oppTeam.shortName || oppTeam.teamName);
        formCache.set(oppFormKey, { data: oppRecent, time: now });
      }
    } catch {}
  }

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
      name: normalizeCompetitionName(matchData.leagueName || matchData.group?.groupName),
      country: (/ucl|champions/i.test(matchData.leagueName || '') ? 'Europe' : 'Germany'),
      logo: null,
      round: matchData.group?.groupName || 'Match',
      season: matchData.leagueSeason || 2026
    },
    teams: {
      home: {
        id: homeTeam.teamId,
        name: homeTeam.teamName,
        logo: isHomeBayern
          ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg'
          : resolveTeamLogo(homeTeam.teamName, homeTeam.teamIconUrl),
        isBayern: isHomeBayern
      },
      away: {
        id: awayTeam.teamId,
        name: awayTeam.teamName,
        logo: !isHomeBayern
          ? 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg'
          : resolveTeamLogo(awayTeam.teamName, awayTeam.teamIconUrl),
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

// Route Handler
async function handleMatchDetailRequest(req, res) {
  let fixtureId = req.params?.id || req.query?.id || req.query?.fixtureId;
  let timezone = req.query?.timezone || 'Europe/Berlin';
  let isLiveOnly = req.query?.live === 'true' || req.query?.live === true;

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    if (!fixtureId) fixtureId = urlObj.searchParams.get('id') || urlObj.searchParams.get('fixtureId');
    if (!req.query?.timezone && urlObj.searchParams.has('timezone')) timezone = urlObj.searchParams.get('timezone');
    if (!req.query?.live && urlObj.searchParams.has('live')) isLiveOnly = urlObj.searchParams.get('live') === 'true';
  } catch {}

  if (!fixtureId) {
    return res.status(400).json({ success: false, error: 'Match fixture ID is required' });
  }

  const cacheKey = `match-${fixtureId}-${timezone}`;
  const now = Date.now();

  if (cachedDetails.has(cacheKey)) {
    const cached = cachedDetails.get(cacheKey);
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(cached.data?.fixture?.status?.short);
    const isFinished = ['FT', 'AET', 'PEN'].includes(cached.data?.fixture?.status?.short);
    const ttl = isLive ? 25 * 1000 : (isFinished ? 2 * 60 * 60 * 1000 : 15 * 60 * 1000);

    if (now - cached.time < ttl) {
      const cacheHeader = isLive 
        ? 'public, s-maxage=25, max-age=15, stale-while-revalidate=30'
        : (isFinished ? 'public, s-maxage=7200, max-age=3600' : 'public, s-maxage=900, max-age=300, stale-while-revalidate=1800');
      res.setHeader('Cache-Control', cacheHeader);
      return res.json({ success: true, data: cached.data, source: 'cache' });
    }
  }

  const apiKey = process.env.API_FOOTBALL_KEY ||
                 process.env.FOOTBALL_API_KEY ||
                 process.env.APISPORTS_KEY ||
                 process.env.RAPIDAPI_KEY;

  let detail = null;
  let source = 'none';

  if (apiKey && now >= apiFootballQuotaExhaustedUntil) {
    try {
      detail = await fetchMatchDetailsFromApiFootball(fixtureId, apiKey, timezone, isLiveOnly);
      if (detail) source = 'api-football';
    } catch (err) {
      console.warn('API-Football match details fetch error, falling back to OpenLigaDB:', err.message);
    }
  }

  if (!detail) {
    try {
      detail = await fetchMatchDetailsFromOpenLigaDB(fixtureId, isLiveOnly);
      if (detail) source = 'openligadb';
    } catch (err) {
      console.error('OpenLigaDB match detail error:', err.message);
    }
  }

  if (detail) {
    cachedDetails.set(cacheKey, { data: detail, time: now });
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(detail.fixture?.status?.short);
    const isFinished = ['FT', 'AET', 'PEN'].includes(detail.fixture?.status?.short);
    const cacheHeader = isLive 
      ? 'public, s-maxage=25, max-age=15, stale-while-revalidate=30'
      : (isFinished ? 'public, s-maxage=7200, max-age=3600' : 'public, s-maxage=900, max-age=300, stale-while-revalidate=1800');
    res.setHeader('Cache-Control', cacheHeader);
    return res.json({ success: true, data: detail, source });
  }

  return res.status(404).json({
    success: false,
    error: 'Match detail could not be retrieved.'
  });
}

router.get('/:id', handleMatchDetailRequest);
router.get('/', handleMatchDetailRequest);

export default router;
