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

function BayernCrest({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#dc052d" />
      <circle cx="50" cy="50" r="43" fill="#0066b2" />
      <circle cx="50" cy="50" r="38" fill="#ffffff" />
      <circle cx="50" cy="50" r="34" fill="#dc052d" />
      {/* Bavaria Romb Pattern */}
      <g transform="rotate(-30 50 50)">
        <polygon points="50,20 60,35 50,50 40,35" fill="#0066b2" />
        <polygon points="60,35 70,50 60,65 50,50" fill="#ffffff" />
        <polygon points="40,35 50,50 40,65 30,50" fill="#ffffff" />
        <polygon points="50,50 60,65 50,80 40,65" fill="#0066b2" />
        <polygon points="30,50 40,65 30,80 20,65" fill="#0066b2" />
        <polygon points="70,50 80,65 70,80 60,65" fill="#0066b2" />
      </g>
      <circle cx="50" cy="50" r="48" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

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
      // 1. Query Server API / Proxy
      const res = await fetch(`/api/match?id=${fixtureId || ''}&timezone=${encodeURIComponent(visitorTimezone)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMatchData(json.data);
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
        const bl1Res = await fetch('https://api.openligadb.de/getmatchdata/bl1');
        if (bl1Res.ok) {
          const allMatches = await bl1Res.json();
          rawMatch = allMatches.find(m =>
            String(m.matchID) === String(matchLookupId) ||
            (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName))) ||
            (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName)))
          );
        }
      }

      if (rawMatch && rawMatch.team1 && rawMatch.team2) {
        const isHomeBayern = rawMatch.team1.teamId === 40 || /bayern/i.test(rawMatch.team1.shortName);
        const homeTeam = rawMatch.team1;
        const awayTeam = rawMatch.team2;
        const oppTeam = isHomeBayern ? awayTeam : homeTeam;
        const venue = isHomeBayern
          ? 'Allianz Arena, München'
          : (BUNDESLIGA_VENUES[oppTeam.teamName] || BUNDESLIGA_VENUES[oppTeam.shortName] || 'WWK Arena, Augsburg');

        const isFinished = rawMatch.matchIsFinished;
        const endResult = rawMatch.matchResults?.find(r => r.resultName === 'Endergebnis') || rawMatch.matchResults?.[0];
        const halfResult = rawMatch.matchResults?.find(r => r.resultName === 'Halbzeitergebnis');

        // Past matches for H2H
        let h2hList = [];
        let bayernForm = [];
        let oppForm = [];

        try {
          const [res2026, res2025] = await Promise.all([
            fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
            fetch('https://api.openligadb.de/getmatchdata/bl1/2025')
          ]);
          const all2026 = res2026.ok ? await res2026.json() : [];
          const all2025 = res2025.ok ? await res2025.json() : [];
          const combined = [...(Array.isArray(all2025) ? all2025 : []), ...(Array.isArray(all2026) ? all2026 : [])];

          const directClashes = combined.filter(m =>
            m.matchIsFinished && (
              (m.team1.teamId === homeTeam.teamId && m.team2.teamId === awayTeam.teamId) ||
              (m.team1.teamId === awayTeam.teamId && m.team2.teamId === homeTeam.teamId)
            )
          );

          h2hList = directClashes.slice(-6).map(m => {
            const r = m.matchResults?.find(x => x.resultName === 'Endergebnis') || m.matchResults?.[0];
            const p1 = r?.pointsTeam1 ?? 0;
            const p2 = r?.pointsTeam2 ?? 0;
            return {
              id: m.matchID,
              date: m.matchDateTimeUTC || m.matchDateTime,
              competition: 'Bundesliga',
              homeTeam: { name: m.team1.teamName, logo: m.team1.teamIconUrl, winner: p1 > p2 },
              awayTeam: { name: m.team2.teamName, logo: m.team2.teamIconUrl, winner: p2 > p1 },
              score: `${p1}:${p2}`
            };
          });

          function extractForm(teamId, tName) {
            return combined.filter(m =>
              m.matchIsFinished && (
                (m.team1 && (m.team1.teamId === teamId || m.team1.teamName?.includes(tName))) ||
                (m.team2 && (m.team2.teamId === teamId || m.team2.teamName?.includes(tName)))
              )
            ).slice(-5).map(m => {
              const isT1 = m.team1.teamId === teamId || m.team1.teamName?.includes(tName);
              const opp = isT1 ? m.team2 : m.team1;
              const r = m.matchResults?.find(x => x.resultName === 'Endergebnis') || m.matchResults?.[0];
              const gf = isT1 ? (r?.pointsTeam1 ?? 0) : (r?.pointsTeam2 ?? 0);
              const ga = isT1 ? (r?.pointsTeam2 ?? 0) : (r?.pointsTeam1 ?? 0);
              return {
                id: m.matchID,
                date: m.matchDateTimeUTC || m.matchDateTime,
                opponent: opp.shortName || opp.teamName,
                opponentLogo: opp.teamIconUrl,
                score: `${gf}-${ga}`,
                result: gf > ga ? 'W' : (gf === ga ? 'D' : 'L'),
                isHome: isT1,
                competition: 'Bundesliga'
              };
            });
          }

          bayernForm = extractForm(40, 'Bayern');
          oppForm = extractForm(oppTeam.teamId, oppTeam.shortName || oppTeam.teamName);
        } catch {}

        const parsed = {
          fixture: {
            id: rawMatch.matchID,
            date: rawMatch.matchDateTimeUTC || rawMatch.matchDateTime,
            timestamp: Math.floor(new Date(rawMatch.matchDateTimeUTC || rawMatch.matchDateTime).getTime() / 1000),
            timezone: 'Europe/Berlin',
            venue,
            status: {
              short: isFinished ? 'FT' : 'NS',
              long: isFinished ? 'Match Finished' : 'Not Started',
              elapsed: isFinished ? 90 : null
            }
          },
          competition: {
            id: rawMatch.leagueId || 78,
            name: 'Bundesliga',
            country: 'Germany',
            round: rawMatch.group?.groupName || '5. Spieltag',
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

        setMatchData(parsed);
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
  const statusShort = fixture.status?.short || 'NS';
  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(statusShort);
  const isFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
  const isUpcoming = !isLive && !isFinished;

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
                LIVE {fixture.status?.elapsed ? `${fixture.status.elapsed}'` : ''}
              </span>
            ) : isFinished ? (
              <span className="px-3 py-1 rounded bg-white/10 text-xs font-black uppercase tracking-widest text-gray-300 border border-white/15">
                FULL TIME
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-xs font-black uppercase tracking-widest text-[#dc052d]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                MATCH PREVIEW
              </span>
            )}
          </div>

          {/* Team vs Team Clash */}
          <div className="grid grid-cols-12 items-center gap-4 py-2 text-center">
            {/* Home Team */}
            <div className="col-span-4 sm:col-span-5 flex flex-col sm:flex-row items-center justify-end sm:gap-4 text-center sm:text-right">
              <div className="order-2 sm:order-1 mt-2 sm:mt-0">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block">HOME</span>
                <h3 className="font-black text-sm sm:text-2xl text-white uppercase tracking-tight leading-tight">
                  {teams.home.name}
                </h3>
              </div>
              <div className="order-1 sm:order-2 w-14 h-14 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                {teams.home.isBayern ? (
                  <BayernCrest className="w-full h-full drop-shadow-md" />
                ) : teams.home.logo ? (
                  <img src={teams.home.logo} alt={teams.home.name} className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                    HOM
                  </div>
                )}
              </div>
            </div>

            {/* Center Score / Kickoff Clash */}
            <div className="col-span-4 sm:col-span-2 flex flex-col items-center justify-center">
              {isUpcoming ? (
                <>
                  <div className="px-3.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-black text-gray-300 tracking-[0.2em] uppercase">
                    VS
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-200 uppercase tracking-wider mt-3 block whitespace-nowrap">
                    {formattedDate}
                  </span>
                  <div className="relative inline-flex items-center justify-center mt-1.5">
                    <button
                      type="button"
                      onClick={toggleTimeFormat}
                      className="absolute right-[calc(100%-5px)] top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-[#dc052d]/15 text-[#dc052d] cursor-pointer"
                      title="Switch time format"
                    >
                      <Clock size={14} />
                    </button>
                    <span 
                      onClick={toggleTimeFormat}
                      className="text-base sm:text-xl font-black text-white uppercase tracking-tight whitespace-nowrap cursor-pointer select-none hover:text-gray-200"
                      title="Switch time format"
                    >
                      {primaryKickoff}
                    </span>
                  </div>
                  <span className="text-[11px] sm:text-xs text-gray-400 uppercase tracking-wide mt-1 block whitespace-nowrap">
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
                  {isLive && fixture.status?.elapsed && (
                    <span className="text-xs font-bold text-[#dc052d] uppercase tracking-wider mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                      {fixture.status.elapsed}' MINUTE
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-4 sm:col-span-5 flex flex-col sm:flex-row items-center justify-start sm:gap-4 text-center sm:text-left">
              <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                {teams.away.isBayern ? (
                  <BayernCrest className="w-full h-full drop-shadow-md" />
                ) : teams.away.logo ? (
                  <img src={teams.away.logo} alt={teams.away.name} className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400">
                    AWY
                  </div>
                )}
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 block">AWAY</span>
                <h3 className="font-black text-sm sm:text-2xl text-white uppercase tracking-tight leading-tight">
                  {teams.away.name}
                </h3>
              </div>
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

          {(hasEvents || !isUpcoming) && (
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
          )}

          {hasLineups && (
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
          )}

          {hasStats && (
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
          )}
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
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">LAST 5 MATCHES</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(teams.home.isBayern ? form?.bayern : form?.opponent)?.map((m, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded flex items-center justify-center font-black text-xs text-white ${
                        m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                      }`}
                      title={`${m.opponent} (${m.score})`}
                    >
                      {m.result}
                    </div>
                  ))}
                </div>
              </div>

              {/* Away Team Form Snippet */}
              <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">{teams.away.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">LAST 5 MATCHES</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(teams.away.isBayern ? form?.bayern : form?.opponent)?.map((m, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded flex items-center justify-center font-black text-xs text-white ${
                        m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                      }`}
                      title={`${m.opponent} (${m.score})`}
                    >
                      {m.result}
                    </div>
                  ))}
                </div>
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
              <div className="space-y-3">
                {form?.bayern?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2535]/50">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] text-white ${
                        m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                      }`}>
                        {m.result}
                      </span>
                      <span className="text-gray-300 font-semibold">{m.isHome ? 'vs' : '@'} {m.opponent}</span>
                    </div>
                    <span className="font-black text-white tabular-nums">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Form */}
            <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 space-y-4">
              <div className="border-b border-[#1c2535] pb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                  {teams.home.isBayern ? teams.away.name : teams.home.name}
                </span>
                <h4 className="text-base font-black text-white uppercase tracking-tight">Recent Form Sequence</h4>
              </div>
              <div className="space-y-3">
                {form?.opponent?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#1c2535]/50">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded flex items-center justify-center font-black text-[11px] text-white ${
                        m.result === 'W' ? 'bg-[#15803d]' : m.result === 'L' ? 'bg-[#dc052d]' : 'bg-gray-600'
                      }`}>
                        {m.result}
                      </span>
                      <span className="text-gray-300 font-semibold">{m.isHome ? 'vs' : '@'} {m.opponent}</span>
                    </div>
                    <span className="font-black text-white tabular-nums">{m.score}</span>
                  </div>
                ))}
              </div>
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
                {events.map((e, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 text-xs">
                    <span className="px-2 py-0.5 rounded bg-black/60 font-black text-[#dc052d] tabular-nums text-xs">
                      {e.time}'
                    </span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-bold text-white">{e.player}</span>
                      <span className="text-gray-400 font-semibold">{e.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                No match events recorded yet for this fixture.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LINEUPS */}
        {activeTab === 'lineups' && hasLineups && (
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
        )}

        {/* TAB 6: STATISTICS */}
        {activeTab === 'stats' && hasStats && (
          <div className="bg-[#121824] border border-[#1c2535] rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#dc052d] block">MATCH NUMBERS</span>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">Head-to-Head Statistics</h4>
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
        )}
      </div>
    </div>
  );
}
