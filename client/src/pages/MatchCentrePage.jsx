import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Calendar, 
  Trophy, 
  Shield, 
  User, 
  Activity, 
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

import BayernCrest from '../components/BayernCrest';


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

function formatFormOpponent(opponentName) {
  if (!opponentName) return 'vs Opponent';
  const clean = String(opponentName).replace(/^(@|vs\.?)\s+/i, '').trim();
  return `vs ${clean}`;
}

function sortFormByDateDesc(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

function formatMatchKickoff(dateStr, timeZone, timeFormat = '24H') {
  if (!dateStr) return { date: 'DATE TBD', primaryKickoff: 'TIME TBD', secondaryKickoff: '15:30 CEST · MUNICH' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: 'DATE TBD', primaryKickoff: 'TIME TBD', secondaryKickoff: '15:30 CEST · MUNICH' };
    }

    const dateOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: timeZone || 'Europe/Berlin'
    };
    const dateFormatted = new Intl.DateTimeFormat('en-GB', dateOptions).format(d).toUpperCase();

    const is12Hour = timeFormat === '12H';
    const primaryTimeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: is12Hour,
      timeZone: timeZone || 'Europe/Berlin',
      timeZoneName: 'short'
    };
    const primaryKickoff = new Intl.DateTimeFormat('en-US', primaryTimeOptions).format(d).toUpperCase();

    const munichTimeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Berlin',
      timeZoneName: 'short'
    };
    const munichTimeStr = new Intl.DateTimeFormat('en-GB', munichTimeOptions).format(d).toUpperCase();
    const secondaryKickoff = `${munichTimeStr} · MUNICH`;

    return {
      date: dateFormatted,
      primaryKickoff,
      secondaryKickoff
    };
  } catch {
    return { date: 'DATE TBD', primaryKickoff: 'TIME TBD', secondaryKickoff: '15:30 CEST · MUNICH' };
  }
}

export default function MatchCentrePage({ fixtureId, onBack, onNavigate }) {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview', 'h2h', 'form', 'lineups', 'events', 'stats'

  const [visitorTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    } catch {
      return 'Europe/Berlin';
    }
  });

  const [timeFormat, setTimeFormat] = useState(() => {
    try {
      return localStorage.getItem('fcb_kickoff_time_format') === '12H' ? '12H' : '24H';
    } catch {
      return '24H';
    }
  });

  const toggleTimeFormat = () => {
    setTimeFormat(prev => {
      const next = prev === '24H' ? '12H' : '24H';
      try {
        localStorage.setItem('fcb_kickoff_time_format', next);
      } catch {}
      return next;
    });
  };

  // Fetch match details
  const fetchMatchDetails = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // 1. Query Server API / Proxy (pass &live=true during live polling to save quota)
      const liveParam = isSilent ? '&live=true' : '';
      const res = await fetch(`/api/match?id=${fixtureId || ''}&timezone=${encodeURIComponent(visitorTimezone)}${liveParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const sortedBayernForm = sortFormByDateDesc(json.data.form?.bayern);
          const sortedOppForm = sortFormByDateDesc(json.data.form?.opponent);
          setMatchData(prev => ({
            ...json.data,
            h2h: (json.data.h2h && json.data.h2h.length > 0) ? json.data.h2h : (prev?.h2h || []),
            form: (json.data.form && (sortedBayernForm.length > 0 || sortedOppForm.length > 0))
              ? { bayern: sortedBayernForm, opponent: sortedOppForm }
              : (prev?.form || null)
          }));
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // 2. Direct OpenLigaDB fallback for standalone client dev
      const matchLookupId = fixtureId || '83196';
      let rawMatch = null;
      try {
        const directRes = await fetch(`https://api.openligadb.de/getmatchdata/${matchLookupId}`);
        if (directRes.ok) rawMatch = await directRes.json();
      } catch {}

      if (!rawMatch || !rawMatch.team1) {
        try {
          const [resBl1, resUcl, resDfb] = await Promise.all([
            fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
            fetch('https://api.openligadb.de/getmatchdata/ucl/2026'),
            fetch('https://api.openligadb.de/getmatchdata/dfb/2026')
          ]);
          const bl1Matches = resBl1.ok ? await resBl1.json() : [];
          const uclMatches = resUcl.ok ? await resUcl.json() : [];
          const dfbMatches = resDfb.ok ? await resDfb.json() : [];
          const allMatches = [
            ...(Array.isArray(bl1Matches) ? bl1Matches : []),
            ...(Array.isArray(uclMatches) ? uclMatches : []),
            ...(Array.isArray(dfbMatches) ? dfbMatches : [])
          ];
          rawMatch = allMatches.find(m =>
            String(m.matchID) === String(matchLookupId) ||
            (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName || '') || /bayern/i.test(m.team1.teamName || ''))) ||
            (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName || '') || /bayern/i.test(m.team2.teamName || '')))
          );
        } catch {}
      }

      if (rawMatch && rawMatch.team1 && rawMatch.team2) {
        const isHomeBayern = rawMatch.team1.teamId === 40 || /bayern/i.test(rawMatch.team1.shortName || '') || /bayern/i.test(rawMatch.team1.teamName || '');
        const homeTeam = rawMatch.team1;
        const awayTeam = rawMatch.team2;
        const oppTeam = isHomeBayern ? awayTeam : homeTeam;
        const venue = isHomeBayern
          ? 'Allianz Arena, München'
          : (VENUE_MAP[oppTeam.teamName] || VENUE_MAP[oppTeam.shortName] || (rawMatch.location?.locationCity ? rawMatch.location.locationCity : `${oppTeam.teamName || oppTeam.shortName} Stadium`));

        const isFinished = rawMatch.matchIsFinished;
        const nowMs = Date.now();
        const kickoffMs = new Date(rawMatch.matchDateTimeUTC || rawMatch.matchDateTime).getTime();
        const elapsedMinutes = !isNaN(kickoffMs) ? Math.floor((nowMs - kickoffMs) / 60000) : null;
        let dynamicStatus = isFinished ? 'FT' : 'NS';
        let statusLong = isFinished ? 'Match Finished' : 'Not Started';

        if (!isFinished && elapsedMinutes !== null && elapsedMinutes >= 0 && elapsedMinutes <= 160) {
          if (elapsedMinutes >= 45 && elapsedMinutes <= 60 && !rawMatch.goals?.some(g => g.matchMinute > 45)) {
            dynamicStatus = 'HT';
            statusLong = 'Half Time';
          } else {
            dynamicStatus = 'LIVE';
            statusLong = 'In Progress';
          }
        }

        const endResult = rawMatch.matchResults?.find(r => r.resultName === 'Endergebnis') || rawMatch.matchResults?.[0];
        const halfResult = rawMatch.matchResults?.find(r => /halbzeit/i.test(r.resultName));

        // Past matches for H2H (skip during silent polling to save quota/bandwidth)
        let h2hList = [];
        let bayernForm = [];
        let oppForm = [];

        if (!isSilent) {
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
            const combined = [
              ...(Array.isArray(all2025) ? all2025 : []),
              ...(Array.isArray(allBl1) ? allBl1 : []),
              ...(Array.isArray(allUcl) ? allUcl : []),
              ...(Array.isArray(allDfb) ? allDfb : [])
            ];

            const directClashes = combined.filter(m =>
              m.matchIsFinished && (
                (m.team1?.teamId === homeTeam.teamId && m.team2?.teamId === awayTeam.teamId) ||
                (m.team1?.teamId === awayTeam.teamId && m.team2?.teamId === homeTeam.teamId)
              )
            );

            h2hList = directClashes.slice(-6).map(m => {
              const r = m.matchResults?.find(x => x.resultName === 'Endergebnis') || m.matchResults?.[0];
              const p1 = r?.pointsTeam1 ?? 0;
              const p2 = r?.pointsTeam2 ?? 0;
              return {
                id: m.matchID,
                date: m.matchDateTimeUTC || m.matchDateTime,
                competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga'),
                homeTeam: { name: m.team1.teamName, logo: m.team1.teamIconUrl, winner: p1 > p2 },
                awayTeam: { name: m.team2.teamName, logo: m.team2.teamIconUrl, winner: p2 > p1 },
                score: `${p1}:${p2}`
              };
            });

            const finishedMatches = combined.filter(m => m.matchIsFinished);
            finishedMatches.sort((a, b) => new Date(b.matchDateTimeUTC || b.matchDateTime).getTime() - new Date(a.matchDateTimeUTC || a.matchDateTime).getTime());

            function extractForm(teamId, tName) {
              const teamMatches = finishedMatches.filter(m => {
                const sName = tName ? String(tName).toLowerCase() : '';
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
                const sName = tName ? String(tName).toLowerCase() : '';
                const isT1 = m.team1 && (
                  (teamId && m.team1.teamId === teamId) ||
                  (sName && (m.team1.teamName?.toLowerCase().includes(sName) || m.team1.shortName?.toLowerCase() === sName))
                );
                const opp = isT1 ? m.team2 : m.team1;
                const r = m.matchResults?.find(x => x.resultName === 'Endergebnis') || m.matchResults?.[0];
                const gf = isT1 ? (r?.pointsTeam1 ?? 0) : (r?.pointsTeam2 ?? 0);
                const ga = isT1 ? (r?.pointsTeam2 ?? 0) : (r?.pointsTeam1 ?? 0);
                const result = gf > ga ? 'W' : (gf === ga ? 'D' : 'L');
                const rawOpp = opp?.shortName || opp?.teamName || 'Opponent';
                const cleanOpp = rawOpp.replace(/^(@|vs\.?)\s+/i, '').trim();
                return {
                  id: m.matchID,
                  date: m.matchDateTimeUTC || m.matchDateTime,
                  opponent: cleanOpp,
                  opponentLogo: opp?.teamIconUrl,
                  score: `${gf}-${ga}`,
                  result: gf > ga ? 'W' : (gf === ga ? 'D' : 'L'),
                  isHome: isT1,
                  competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga')
                };
              });
            }

            bayernForm = extractForm(40, 'Bayern');
            oppForm = extractForm(oppTeam.teamId, oppTeam.shortName || oppTeam.teamName);
          } catch {}
        }

        const parsed = {
          fixture: {
            id: rawMatch.matchID,
            date: rawMatch.matchDateTimeUTC || rawMatch.matchDateTime,
            timestamp: Math.floor(new Date(rawMatch.matchDateTimeUTC || rawMatch.matchDateTime).getTime() / 1000),
            timezone: 'Europe/Berlin',
            venue,
            status: {
              short: dynamicStatus,
              long: statusLong,
              elapsed: isFinished ? 90 : (dynamicStatus === 'LIVE' || dynamicStatus === 'HT') ? Math.min(Math.max(elapsedMinutes, 1), 90) : null
            }
          },
          competition: {
            id: rawMatch.leagueId || 78,
            name: normalizeCompetitionName(rawMatch.leagueName || rawMatch.group?.groupName),
            country: (/ucl|champions/i.test(rawMatch.leagueName || '') ? 'Europe' : 'Germany'),
            round: rawMatch.group?.groupName || 'Match',
            season: rawMatch.leagueSeason || 2026
          },
        teams: {
          home: {
            id: homeTeam.teamId,
            name: homeTeam.teamName,
            logo: isHomeBayern ? null : homeTeam.teamIconUrl,
            isBayern: isHomeBayern
          },
          away: {
            id: awayTeam.teamId,
            name: awayTeam.teamName,
            logo: !isHomeBayern ? null : awayTeam.teamIconUrl,
            isBayern: !isHomeBayern
          }
        },
        score: {
          current: {
            home: endResult ? endResult.pointsTeam1 : null,
            away: endResult ? endResult.pointsTeam2 : null
          },
          halftime: {
            home: halfResult?.pointsTeam1 ?? null,
            away: halfResult?.pointsTeam2 ?? null
          },
          fulltime: {
            home: endResult ? endResult.pointsTeam1 : null,
            away: endResult ? endResult.pointsTeam2 : null
          }
        },
        events: (rawMatch.goals || []).map(g => ({
          time: g.matchMinute || 0,
          player: g.goalGetterName || 'Goal',
          type: 'Goal',
          detail: `${g.scoreTeam1}:${g.scoreTeam2}${g.isPenalty ? ' (Pen)' : ''}`
        })),
        lineups: [],
        statistics: [],
        h2h: h2hList,
        form: {
          bayern: bayernForm,
          opponent: oppForm
        }
      };

      setMatchData(prev => ({
        ...parsed,
        h2h: h2hList.length > 0 ? h2hList : (prev?.h2h || []),
        form: (bayernForm.length > 0 || oppForm.length > 0)
          ? { bayern: bayernForm, opponent: oppForm }
          : (prev?.form || null)
      }));
        setLoading(false);
        setRefreshing(false);
        return;
      }

      throw new Error('Unable to find fixture information.');
    } catch (err) {
      setError(err.message || 'Failed to load match details.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [fixtureId, visitorTimezone]);

  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  // Polling: Only refresh live match data every 60s when match is active
  useEffect(() => {
    const status = matchData?.fixture?.status?.short;
    const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(status);

    if (!isLive) return;

    const timer = setInterval(() => {
      fetchMatchDetails(true);
    }, 60000);

    return () => clearInterval(timer);
  }, [matchData?.fixture?.status?.short, fetchMatchDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white font-display py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-6 w-36 bg-white/10 rounded animate-pulse" />
          <div className="h-64 w-full bg-[#121824] border border-[#1c2535] rounded-xl animate-pulse" />
          <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-80 w-full bg-[#121824] border border-[#1c2535] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen bg-[#070b12] text-white font-display py-12 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4 bg-[#121824] border border-[#1c2535] p-8 rounded-xl">
          <AlertCircle size={36} className="text-[#dc052d] mx-auto" />
          <h2 className="text-xl font-bold uppercase tracking-tight">Match Details Unavailable</h2>
          <p className="text-sm text-gray-400">{error || 'Fixture information could not be retrieved at this time.'}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => onBack ? onBack() : onNavigate?.('/')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-xs font-bold uppercase tracking-wider"
            >
              ← Back to Home
            </button>
            <button
              onClick={() => fetchMatchDetails()}
              className="px-4 py-2 bg-[#dc052d] hover:bg-[#b80425] text-white rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { fixture, competition, teams, score, events, lineups, statistics, h2h, form } = matchData;
  const isHomeBayern = Boolean(
    teams?.home?.isBayern || 
    /bayern/i.test(teams?.home?.name || '') || 
    teams?.home?.id === 157 || 
    teams?.home?.id === 40
  );
  const isAwayBayern = Boolean(
    teams?.away?.isBayern || 
    /bayern/i.test(teams?.away?.name || '') || 
    teams?.away?.id === 157 || 
    teams?.away?.id === 40
  );
  const statusShort = fixture.status?.short?.toUpperCase() || 'NS';
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(statusShort);
  const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
  const isPostponed = ['PST', 'POST', 'CANC', 'ABD', 'SUSP', 'INT'].includes(statusShort);
  const isUpcoming = !isLive && !isFinished && !isPostponed;

  const { date: formattedDate, primaryKickoff, secondaryKickoff } = formatMatchKickoff(fixture.date, visitorTimezone, timeFormat);

  // Available tabs depending on match status
  const hasLineups = Array.isArray(lineups) && lineups.length > 0;
  const hasEvents = Array.isArray(events) && events.length > 0;
  const hasStats = Array.isArray(statistics) && statistics.length > 0;
  const hasH2H = Array.isArray(h2h) && h2h.length > 0;

  return (
    <div className="min-h-screen bg-[#070b12] text-white font-display flex flex-col selection:bg-[#dc052d] selection:text-white">
      {/* Top Header Bar / Navigation */}
      <div className="w-full bg-[#0a0f18] border-b border-[#1c2535]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onBack ? onBack() : onNavigate?.('/')}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>BACK TO HOME</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">
              FC BAYERN MATCH CENTRE
            </span>
            <button
              onClick={() => fetchMatchDetails(true)}
              disabled={refreshing}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Refresh match data"
              aria-label="Refresh match data"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#dc052d]' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* =========================================================
            1. MATCH CLASH HERO BANNER
            ========================================================= */}
        <div className="w-full bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Top Metadata: Competition & Status Badge */}
          <div className="flex items-center justify-between border-b border-[#1c2535]/80 pb-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span className="text-white">{competition.name || 'BUNDESLIGA'}</span>
              {competition.round && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-400">{competition.round}</span>
                </>
              )}
            </div>

            {/* Match Status Badge */}
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/20 border border-[#dc052d]/40 text-xs font-black uppercase tracking-widest text-[#dc052d]">
                <span className="w-2 h-2 rounded-full bg-[#dc052d] animate-pulse" />
                {statusShort === 'HT' ? 'HALF TIME' :
                 statusShort === 'ET' ? 'EXTRA TIME' :
                 statusShort === 'P' ? 'PENALTIES' :
                 `LIVE ${fixture.status?.elapsed ? `${fixture.status.elapsed}'` : ''}`}
              </span>
            ) : isFinished ? (
              <span className="px-3 py-1 rounded bg-white/10 text-xs font-black uppercase tracking-widest text-gray-300 border border-white/15">
                {statusShort === 'AET' ? 'AFTER EXTRA TIME' : statusShort === 'PEN' ? 'AFTER PENALTIES' : 'FULL TIME'}
              </span>
            ) : isPostponed ? (
              <span className="px-3 py-1 rounded bg-amber-500/20 text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-500/30">
                {statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-xs font-black uppercase tracking-widest text-[#dc052d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                MATCH PREVIEW
              </span>
            )}
          </div>

          {/* =========================================================
              MATCHUP CLASH: RESPONSIVE DESKTOP & MOBILE VIEWS
              ========================================================= */}
          {/* Desktop & Tablet View (>= sm) */}
          <div className="hidden sm:grid sm:grid-cols-12 sm:items-center sm:gap-4 py-2 text-center">
            {/* Home Team */}
            <div className="sm:col-span-4 flex flex-row items-center justify-end sm:gap-3 md:gap-4 text-right min-w-0">
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block">HOME</span>
                <h3 className="font-black sm:text-lg md:text-2xl text-white uppercase tracking-tight leading-tight">
                  {teams.home.name}
                </h3>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center">
                {isHomeBayern ? (
                  <BayernCrest className="w-full h-full drop-shadow-md" />
                ) : teams.home.logo ? (
                  <img 
                    src={teams.home.logo} 
                    alt={teams.home.name} 
                    className="w-full h-full object-contain drop-shadow-md" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                    HOM
                  </div>
                )}
              </div>
            </div>

            {/* Center Score / Kickoff Clash */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center min-w-0 px-2 text-center">
              {isPostponed ? (
                <div className="flex flex-col items-center">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-1.5 border border-amber-500/30">
                    {statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED'}
                  </span>
                  <span className="text-xs text-gray-300 font-bold uppercase tracking-wider mt-1">
                    DATE TO BE CONFIRMED
                  </span>
                </div>
              ) : isUpcoming ? (
                <>
                  <div className="px-3.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-black text-gray-300 tracking-[0.2em] uppercase">
                    VS
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-200 uppercase tracking-wider mt-2.5 sm:mt-3 block text-center leading-snug">
                    {formattedDate}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTimeFormat}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5 px-2 py-0.5 rounded text-white hover:text-gray-200 group/time cursor-pointer select-none transition-colors"
                    title="Switch time format (12H / 24H)"
                  >
                    <Clock size={15} className="text-[#dc052d] shrink-0 group-hover/time:scale-110 transition-transform" />
                    <span className="text-sm sm:text-xl font-black uppercase tracking-tight whitespace-nowrap">
                      {primaryKickoff}
                    </span>
                  </button>
                  <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wide mt-0.5 sm:mt-1 block text-center leading-tight">
                    {secondaryKickoff}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    {score.current?.home ?? 0} – {score.current?.away ?? 0}
                  </div>
                  {score.halftime?.home !== null && score.halftime?.home !== undefined && (
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                      HT: {score.halftime.home}–{score.halftime.away}
                    </span>
                  )}
                  {isLive && (
                    <span className="text-xs font-bold text-[#dc052d] uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                      {statusShort === 'HT' ? 'HALF TIME' :
                       statusShort === 'ET' ? 'EXTRA TIME' :
                       statusShort === 'P' ? 'PENALTIES' :
                       fixture.status?.elapsed ? `${fixture.status.elapsed}' MINUTE` : 'IN PROGRESS'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="sm:col-span-4 flex flex-row items-center justify-start sm:gap-3 md:gap-4 text-left min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center">
                {isAwayBayern ? (
                  <BayernCrest className="w-full h-full drop-shadow-md" />
                ) : teams.away.logo ? (
                  <img 
                    src={teams.away.logo} 
                    alt={teams.away.name} 
                    className="w-full h-full object-contain drop-shadow-md" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                    AWY
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block">AWAY</span>
                <h3 className="font-black sm:text-lg md:text-2xl text-white uppercase tracking-tight leading-tight">
                  {teams.away.name}
                </h3>
              </div>
            </div>
          </div>

          {/* Mobile View (< sm) */}
          <div className="sm:hidden flex flex-col items-center space-y-4 py-2 text-center">
            <div className="w-full grid grid-cols-2 items-center gap-4">
              {/* Mobile Home Team */}
              <div className="flex flex-col items-center space-y-1.5 min-w-0">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {isHomeBayern ? (
                    <BayernCrest className="w-full h-full drop-shadow-md" />
                  ) : teams.home.logo ? (
                    <img 
                      src={teams.home.logo} 
                      alt={teams.home.name} 
                      className="w-full h-full object-contain drop-shadow-md" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                      HOM
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">HOME</span>
                <h4 className="font-black text-base text-white uppercase tracking-tight leading-tight">
                  {teams.home.name}
                </h4>
              </div>

              {/* Mobile Away Team */}
              <div className="flex flex-col items-center space-y-1.5 min-w-0">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {isAwayBayern ? (
                    <BayernCrest className="w-full h-full drop-shadow-md" />
                  ) : teams.away.logo ? (
                    <img 
                      src={teams.away.logo} 
                      alt={teams.away.name} 
                      className="w-full h-full object-contain drop-shadow-md" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                      AWY
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">AWAY</span>
                <h4 className="font-black text-base text-white uppercase tracking-tight leading-tight">
                  {teams.away.name}
                </h4>
              </div>
            </div>

            {/* Mobile Center Kickoff / Score Details */}
            <div className="w-full pt-3 border-t border-[#1c2535]/60 flex flex-col items-center justify-center">
              {isPostponed ? (
                <div className="flex flex-col items-center">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider mb-1.5 border border-amber-500/30">
                    {statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED'}
                  </span>
                  <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                    DATE TO BE CONFIRMED
                  </span>
                </div>
              ) : isUpcoming ? (
                <>
                  <div className="px-3 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-black text-gray-300 tracking-[0.2em] uppercase">
                    VS
                  </div>
                  <span className="text-xs font-bold text-gray-200 uppercase tracking-wider mt-2 block">
                    {formattedDate}
                  </span>
                  <button
                    type="button"
                    onClick={toggleTimeFormat}
                    className="inline-flex items-center justify-center gap-1.5 mt-1 px-2 py-0.5 rounded text-white hover:text-gray-200 group/time cursor-pointer select-none transition-colors"
                    title="Switch time format (12H / 24H)"
                  >
                    <Clock size={15} className="text-[#dc052d] shrink-0 group-hover/time:scale-110 transition-transform" />
                    <span className="text-lg font-black uppercase tracking-tight whitespace-nowrap">
                      {primaryKickoff}
                    </span>
                  </button>
                  <span className="text-[11px] text-gray-400 uppercase tracking-wide mt-0.5 block">
                    {secondaryKickoff}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-black text-white tabular-nums tracking-tight">
                    {score.current?.home ?? 0} – {score.current?.away ?? 0}
                  </div>
                  {score.halftime?.home !== null && score.halftime?.home !== undefined && (
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
                      HT: {score.halftime.home}–{score.halftime.away}
                    </span>
                  )}
                  {isLive && (
                    <span className="text-xs font-bold text-[#dc052d] uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                      {statusShort === 'HT' ? 'HALF TIME' :
                       statusShort === 'ET' ? 'EXTRA TIME' :
                       statusShort === 'P' ? 'PENALTIES' :
                       fixture.status?.elapsed ? `${fixture.status.elapsed}' MINUTE` : 'IN PROGRESS'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Venue Strip */}
          <div className="mt-6 pt-4 border-t border-[#1c2535]/80 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#dc052d] shrink-0" />
              <span className="uppercase tracking-wider font-semibold text-gray-300">{fixture.venue}</span>
            </div>
            {fixture.referee && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <User size={13} className="text-gray-500" />
                <span>REFEREE: {fixture.referee}</span>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            2. EDITORIAL TAB NAVIGATION
            ========================================================= */}
        <div className="flex items-center gap-2 border-b border-[#1c2535] overflow-x-auto pb-1 text-xs font-bold uppercase tracking-wider select-none">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Match Preview
          </button>

          {hasH2H && (
            <button
              onClick={() => setActiveTab('h2h')}
              className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
                activeTab === 'h2h'
                  ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Head-to-Head
            </button>
          )}

          <button
            onClick={() => setActiveTab('form')}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Recent Form
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Events {events?.length ? `(${events.length})` : ''}
          </button>

          <button
            onClick={() => setActiveTab('lineups')}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'lineups'
                ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Lineups
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-[#121824] text-white border-t-2 border-[#dc052d]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* =========================================================
            3. TAB CONTENT
            ========================================================= */}
        {/* TAB 1: PREVIEW */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Match Preview Editorial Notes */}
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#dc052d] block">
                OFFICIAL MATCHDAY PREVIEW
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                {teams.home.name} vs {teams.away.name}
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed font-sans">
                FC Bayern prepares for an intense clash against {teams.home.isBayern ? teams.away.name : teams.home.name} in {competition.name} action at {fixture.venue}. 
                Both squads look to secure vital points in their championship campaign.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1c2535]/80">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">COMPETITION</span>
                  <span className="text-xs sm:text-sm text-white font-bold block">{competition.name}</span>
                  <span className="text-[11px] text-gray-400">{competition.round || 'Matchday'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">LOCAL KICKOFF</span>
                  <span className="text-xs sm:text-sm text-white font-bold block">{primaryKickoff}</span>
                  <span className="text-[11px] text-gray-400">{formattedDate}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">MUNICH TIME</span>
                  <span className="text-xs sm:text-sm text-white font-bold block">{secondaryKickoff}</span>
                  <span className="text-[11px] text-gray-400">Germany Standard</span>
                </div>
              </div>
            </div>

            {/* Quick Form Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Form Snippet */}
              <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{teams.home.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {((isHomeBayern ? form?.bayern : form?.opponent) || []).length === 1
                      ? '1 RECENT MATCH'
                      : ((isHomeBayern ? form?.bayern : form?.opponent) || []).length > 1
                      ? `LAST ${((isHomeBayern ? form?.bayern : form?.opponent) || []).length} MATCHES`
                      : 'NO RECENT MATCHES'}
                  </span>
                </div>
                {((isHomeBayern ? form?.bayern : form?.opponent) || []).length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {(isHomeBayern ? form?.bayern : form?.opponent)?.map((m, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded flex items-center justify-center font-black text-xs text-white ${
                          m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                        }`}
                        title={`${formatFormOpponent(m.opponent)} (${m.score})`}
                      >
                        {m.result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">No recent matches recorded</span>
                )}
              </div>

              {/* Away Team Form Snippet */}
              <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{teams.away.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {((isAwayBayern ? form?.bayern : form?.opponent) || []).length === 1
                      ? '1 RECENT MATCH'
                      : ((isAwayBayern ? form?.bayern : form?.opponent) || []).length > 1
                      ? `LAST ${((isAwayBayern ? form?.bayern : form?.opponent) || []).length} MATCHES`
                      : 'NO RECENT MATCHES'}
                  </span>
                </div>
                {((isAwayBayern ? form?.bayern : form?.opponent) || []).length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {(isAwayBayern ? form?.bayern : form?.opponent)?.map((m, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded flex items-center justify-center font-black text-xs text-white ${
                          m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                        }`}
                        title={`${formatFormOpponent(m.opponent)} (${m.score})`}
                      >
                        {m.result}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">No recent matches recorded</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEAD-TO-HEAD */}
        {activeTab === 'h2h' && (
          <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#dc052d] block">HISTORICAL ENCOUNTERS</span>
              <h4 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Previous Head-to-Head Meetings</h4>
            </div>

            <div className="divide-y divide-[#1c2535]">
              {h2h?.map((m, idx) => (
                <div key={idx} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={13} className="text-gray-500 shrink-0" />
                    <span>{m.date ? new Date(m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Previous'}</span>
                    <span>•</span>
                    <span className="text-gray-300 font-semibold">{m.competition || 'Bundesliga'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-bold">
                    <span className={`text-right ${m.homeTeam.winner ? 'text-white font-black' : 'text-gray-300'}`}>
                      {m.homeTeam.name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-white font-black tabular-nums text-xs">
                      {m.score}
                    </span>
                    <span className={`text-left ${m.awayTeam.winner ? 'text-white font-black' : 'text-gray-300'}`}>
                      {m.awayTeam.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RECENT FORM */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bayern Form */}
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-4">
              <div className="border-b border-[#1c2535] pb-3">
                <span className="text-[10px] font-bold text-[#dc052d] uppercase tracking-widest block">FC BAYERN MÜNCHEN</span>
                <h4 className="text-base font-black text-white uppercase tracking-tight">Recent Form Sequence</h4>
              </div>
              {form?.bayern && form.bayern.length > 0 ? (
                <div className="space-y-3">
                  {form.bayern.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2535]/50">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] text-white ${
                          m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                        }`}>
                          {m.result}
                        </span>
                        <span className="text-gray-300 font-semibold">{formatFormOpponent(m.opponent)}</span>
                      </div>
                      <span className="font-black text-white tabular-nums">{m.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-xs text-gray-500 uppercase tracking-wider">No completed matches recorded this season.</div>
              )}
            </div>

            {/* Opponent Form */}
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-4">
              <div className="border-b border-[#1c2535] pb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  {teams.home.isBayern ? teams.away.name : teams.home.name}
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-tight">Recent Form Sequence</h4>
              </div>
              {form?.opponent && form.opponent.length > 0 ? (
                <div className="space-y-3">
                  {form.opponent.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2535]/50">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] text-white ${
                          m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                        }`}>
                          {m.result}
                        </span>
                        <span className="text-gray-300 font-semibold">{formatFormOpponent(m.opponent)}</span>
                      </div>
                      <span className="font-black text-white tabular-nums">{m.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-xs text-gray-500 uppercase tracking-wider">No completed matches recorded this season.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EVENTS */}
        {activeTab === 'events' && (
          <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#dc052d] block">MATCH TIMELINE</span>
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Goals & Key Match Events</h4>

            {events && events.length > 0 ? (
              <div className="space-y-3 pt-2">
                {events.map((e, idx) => {
                  const isGoal = /goal/i.test(e.type || '');
                  const isCard = /card/i.test(e.type || '');
                  const isYellow = isCard && /yellow/i.test(e.detail || '');
                  const isRed = isCard && /red/i.test(e.detail || '');
                  const isSub = /subst/i.test(e.type || '');
                  const isVar = /var/i.test(e.type || '');

                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                      <span className="px-2 py-0.5 rounded bg-black/60 font-black text-[#dc052d] tabular-nums text-xs shrink-0">
                        {e.time}'{e.extraTime ? `+${e.extraTime}` : ''}
                      </span>
                      <div className="flex-1 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {isGoal && <span className="text-sm select-none" title="Goal">⚽</span>}
                          {isYellow && <span className="w-3 h-4 rounded-xs bg-amber-400 inline-block shadow-sm shrink-0" title="Yellow Card" />}
                          {isRed && <span className="w-3 h-4 rounded-xs bg-[#dc052d] inline-block shadow-sm shrink-0" title="Red Card" />}
                          {isSub && <span className="text-xs text-emerald-400 font-bold select-none shrink-0" title="Substitution">🔄</span>}
                          {isVar && <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider shrink-0">VAR</span>}

                          <div className="flex flex-col">
                            {isSub ? (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">▲ {e.player}</span>
                                {e.assist && <span className="text-gray-400 font-medium">▼ {e.assist}</span>}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white">{e.player}</span>
                                {e.assist && (
                                  <span className="text-gray-400 font-medium">(Assist: {e.assist})</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-gray-400 font-semibold text-right shrink-0">
                          {e.detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                No match events recorded yet for this fixture.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LINEUPS */}
        {activeTab === 'lineups' && (
          hasLineups ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lineups.map((l, idx) => (
                <div key={idx} className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-4">
                  <div className="border-b border-[#1c2535] pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-black text-white uppercase tracking-tight">{l.teamName}</h4>
                      {l.formation && <span className="text-xs text-[#dc052d] font-bold tracking-wider">FORMATION: {l.formation}</span>}
                    </div>
                    {l.coach && <span className="text-xs text-gray-400">COACH: {l.coach}</span>}
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">STARTING XI</span>
                    <div className="space-y-1.5">
                      {l.startXI?.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-white/5">
                          <span className="text-gray-400 font-bold tabular-nums w-6">{p.number}</span>
                          <span className="flex-1 font-semibold text-white">{p.name}</span>
                          <span className="text-gray-500 font-bold uppercase">{p.pos}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {l.substitutes && l.substitutes.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">SUBSTITUTES</span>
                      <div className="space-y-1">
                        {l.substitutes.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-0.5 px-2 text-gray-400">
                            <span className="tabular-nums w-6">{s.number}</span>
                            <span className="flex-1">{s.name}</span>
                            <span className="uppercase">{s.pos}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-8 sm:p-12 text-center space-y-3">
              <Shield className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-base font-black text-white uppercase tracking-tight">Official Lineups Pending</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Confirmed starting lineups and tactical formations are published approximately 60 minutes prior to kickoff once officially submitted by both clubs.
              </p>
            </div>
          )
        )}

        {/* TAB 6: STATISTICS */}
        {activeTab === 'stats' && (
          hasStats ? (
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#dc052d] block">MATCH NUMBERS</span>
                <h4 className="text-lg font-black text-white uppercase tracking-tight">Match Statistics</h4>
              </div>

              <div className="space-y-4">
                {statistics[0]?.stats?.map((stat, i) => {
                  const stat2 = statistics[1]?.stats?.[i];
                  const val1 = stat.value ?? 0;
                  const val2 = stat2?.value ?? 0;
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-gray-300">
                        <span className="text-white font-black">{val1}</span>
                        <span className="uppercase tracking-wider text-gray-400">{stat.type}</span>
                        <span className="text-white font-black">{val2}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-8 sm:p-12 text-center space-y-3">
              <Activity className="w-10 h-10 text-gray-500 mx-auto" />
              <h4 className="text-base font-black text-white uppercase tracking-tight">Match Statistics Available Live</h4>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Possession, shots on target, passes, and tactical match metrics will appear live as the fixture progresses.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
