import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import BayernCrest from './BayernCrest';

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

function getTimezoneAbbr(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date);
    const tzPart = parts.find(p => p.type === 'timeZoneName')?.value;
    if (tzPart && !tzPart.startsWith('GMT') && !tzPart.startsWith('UTC')) {
      return tzPart;
    }
  } catch {}

  try {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const loc = new Date(date.toLocaleString('en-US', { timeZone }));
    const diffHours = (loc - utc) / 36e5;
    
    if (timeZone.startsWith('Asia/Kolkata') || timeZone.startsWith('Asia/Calcutta') || timeZone === 'Asia/Colombo') return 'IST';
    if (timeZone === 'Asia/Tokyo') return 'JST';
    if (timeZone === 'Asia/Seoul') return 'KST';
    if (timeZone === 'Asia/Shanghai' || timeZone === 'Asia/Hong_Kong' || timeZone === 'Asia/Taipei') return 'CST';
    if (timeZone === 'Asia/Singapore') return 'SGT';
    if (timeZone === 'Asia/Dubai') return 'GST';
    if (timeZone === 'Asia/Bangkok' || timeZone === 'Asia/Jakarta' || timeZone === 'Asia/Ho_Chi_Minh') return 'ICT';
    if (timeZone === 'Asia/Manila') return 'PHT';
    if (timeZone === 'Asia/Karachi') return 'PKT';
    if (timeZone === 'Africa/Johannesburg') return 'SAST';
    if (timeZone === 'Africa/Cairo') return diffHours === 3 ? 'EEST' : 'EET';
    
    if (timeZone.startsWith('Europe/')) {
      if (diffHours === 2) return 'CEST';
      if (diffHours === 1) return (timeZone === 'Europe/London' || timeZone === 'Europe/Dublin' || timeZone === 'Europe/Lisbon') ? 'BST' : 'CET';
      if (diffHours === 0) return 'GMT';
      if (diffHours === 3) return 'EEST';
    }
    
    if (timeZone.startsWith('Australia/')) {
      if (diffHours === 11) return 'AEDT';
      if (diffHours === 10) return 'AEST';
      if (diffHours === 10.5) return 'ACDT';
      if (diffHours === 9.5) return 'ACST';
      if (diffHours === 8) return 'AWST';
    }
    
    if (timeZone.startsWith('Pacific/Auckland')) {
      return diffHours === 13 ? 'NZDT' : 'NZST';
    }

    const sign = diffHours >= 0 ? '+' : '-';
    const absH = Math.floor(Math.abs(diffHours));
    const absM = Math.round((Math.abs(diffHours) - absH) * 60);
    return absM > 0 ? ('GMT' + sign + absH + ':' + absM.toString().padStart(2, '0')) : ('GMT' + sign + absH);
  } catch {
    return 'UTC';
  }
}

function formatKickoff(isoString, userTimezone, timeFormat = '24H') {
  if (!isoString) {
    return {
      date: 'DATE TO BE CONFIRMED',
      primaryKickoff: 'TBD',
      secondaryKickoff: 'TBD'
    };
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return {
        date: 'DATE TO BE CONFIRMED',
        primaryKickoff: 'TBD',
        secondaryKickoff: 'TBD'
      };
    }

    const is12H = timeFormat === '12H';

    let effectiveTz = 'Europe/Berlin';
    try {
      effectiveTz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    } catch {}

    const dateStr = d.toLocaleDateString('en-GB', {
      timeZone: effectiveTz,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();

    // 1. Primary: visitor's local kickoff time (24H: 15:30 IST, 12H: 3:30 PM IST)
    let localTime;
    if (is12H) {
      localTime = d.toLocaleTimeString('en-US', {
        timeZone: effectiveTz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/\u202f/g, ' ');
    } else {
      localTime = d.toLocaleTimeString('en-GB', {
        timeZone: effectiveTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    const localAbbr = getTimezoneAbbr(d, effectiveTz);
    const primaryKickoff = `${localTime} ${localAbbr}`.trim();

    // 2. Secondary: Munich/Germany kickoff time (24H: 15:30 CEST · Munich, 12H: 3:30 PM CEST · Munich)
    let munichTime;
    if (is12H) {
      munichTime = d.toLocaleTimeString('en-US', {
        timeZone: 'Europe/Berlin',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).replace(/\u202f/g, ' ');
    } else {
      munichTime = d.toLocaleTimeString('de-DE', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    const munichAbbr = getTimezoneAbbr(d, 'Europe/Berlin');
    const secondaryKickoff = `${munichTime} ${munichAbbr} · Munich`;

    return {
      date: dateStr,
      primaryKickoff,
      secondaryKickoff
    };
  } catch {
    return {
      date: 'DATE TO BE CONFIRMED',
      primaryKickoff: 'TBD',
      secondaryKickoff: 'TBD'
    };
  }
}

function parseOpenLigaDBMatch(matches) {
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

  return {
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
      logo: isHome ? null : homeTeam.teamIconUrl,
      isBayern: isHome
    },
    awayTeam: {
      name: awayTeam.teamName || awayTeam.shortName,
      shortName: awayTeam.shortName || awayTeam.teamName,
      logo: !isHome ? null : awayTeam.teamIconUrl,
      isBayern: !isHome
    },
    status: bayernMatch.matchIsFinished ? 'FT' : 'NS'
  };
}

function useKickoffCountdown(match) {
  const targetMs = match?.timestamp
    ? match.timestamp * 1000
    : (match?.date ? new Date(match.date).getTime() : null);

  const calculate = () => {
    if (!targetMs || isNaN(targetMs)) return null;
    const now = Date.now();
    const diff = targetMs - now;

    if (diff <= 0) {
      return { isMatchday: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      isMatchday: false,
      days,
      hours,
      minutes,
      seconds
    };
  };

  const [countdown, setCountdown] = useState(calculate);

  useEffect(() => {
    if (!targetMs || isNaN(targetMs)) {
      setCountdown(null);
      return;
    }

    setCountdown(calculate());

    const timer = setInterval(() => {
      setCountdown(calculate());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetMs]);

  return countdown;
}

export default function NextMatchBanner({ onNavigate }) {
  const [match, setMatch] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [oppImgError, setOppImgError] = useState(false);
  const [notice, setNotice] = useState(false);
  const countdown = useKickoffCountdown(match);

  const [visitorTimezone, setVisitorTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    } catch {
      return 'Europe/Berlin';
    }
  });

  const [timeFormat, setTimeFormat] = useState(() => {
    try {
      const saved = localStorage.getItem('fcb_kickoff_time_format');
      return saved === '12H' ? '12H' : '24H';
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

  useEffect(() => {
    let isMounted = true;

    async function fetchNextMatchAndForm() {
      setLoading(true);

      let detectedTz = 'Europe/Berlin';
      try {
        detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
        setVisitorTimezone(detectedTz);
      } catch {}

      try {
        // 1. Fetch from backend proxy/serverless function with visitor timezone
        const res = await fetch(`/api/next-match?timezone=${encodeURIComponent(detectedTz)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.success && data.match) {
            setMatch(data.match);
            if (data.form) setForm(data.form);
            setLoading(false);
            return;
          }
        }

        // 2. Direct fallback for local dev when backend server is offline
        const [resNext, res2026, res2025] = await Promise.all([
          fetch('https://api.openligadb.de/getmatchdata/bl1'),
          fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
          fetch('https://api.openligadb.de/getmatchdata/bl1/2025/34')
        ]);

        if (resNext.ok) {
          const rawMatches = await resNext.json();
          const parsed = parseOpenLigaDBMatch(rawMatches);
          if (isMounted && parsed) {
            setMatch(parsed);

            // Extract form (last 4 matches)
            let allFinished = [];
            try {
              const all2026 = res2026.ok ? await res2026.json() : [];
              const all2025 = res2025.ok ? await res2025.json() : [];
              const f2026 = Array.isArray(all2026) ? all2026.filter(m => m.matchIsFinished) : [];
              const f2025 = Array.isArray(all2025) ? all2025.filter(m => m.matchIsFinished) : [];
              allFinished = [...f2025, ...f2026];
            } catch {}

            const extractLast4 = (teamCheck) => {
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
            };

            const bayernForm = extractLast4(m => 
              (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName))) ||
              (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName)))
            );

            const oppShort = parsed.opponent?.shortName || '';
            const opponentForm = extractLast4(m =>
              (m.team1 && m.team1.shortName?.toLowerCase().includes(oppShort.toLowerCase())) ||
              (m.team2 && m.team2.shortName?.toLowerCase().includes(oppShort.toLowerCase()))
            );

            setForm({ bayern: bayernForm, opponent: opponentForm });
            setLoading(false);
            return;
          }
        }

        if (isMounted) setMatch(null);
      } catch {
        if (isMounted) setMatch(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNextMatchAndForm();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMatchCentreClick = () => {
    if (match?.id) {
      if (onNavigate) {
        onNavigate(`/match/${match.id}`);
      } else if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/match/${match.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setNotice(true);
      setTimeout(() => setNotice(false), 3400);
    }
  };

  const getFormSummary = (list) => {
    if (!list || list.length === 0) return '';
    const w = list.filter(m => m.result === 'W').length;
    const d = list.filter(m => m.result === 'D').length;
    const l = list.filter(m => m.result === 'L').length;
    return `${w}W • ${d}D • ${l}L`;
  };

  // 1. Loading Skeleton State: Matches exact expanded dimensions
  if (loading) {
    return (
      <div 
        className="w-full bg-[#121824]/95 border border-[#1c2535] rounded-xl p-6 sm:p-8 lg:p-10 select-none animate-pulse shadow-2xl"
        aria-busy="true"
        aria-label="Loading upcoming FC Bayern match and form"
      >
        {/* Top Eyebrow Header Skeleton */}
        <div className="flex items-center justify-between border-b border-[#1c2535] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-6 w-28 bg-white/10 rounded-md" />
            <div className="h-4 w-32 bg-white/5 rounded hidden sm:block" />
          </div>
          <div className="h-6 w-36 bg-white/5 rounded-md" />
        </div>

        {/* Center Head-to-Head Skeleton */}
        <div className="py-7 sm:py-9 my-4 border-y border-[#1c2535]/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-7 sm:h-9 w-40 sm:w-48 bg-white/10 rounded" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="h-9 w-16 bg-white/10 rounded-lg" />
            <div className="h-4 w-32 bg-white/5 rounded" />
            <div className="h-6 w-24 bg-white/10 rounded" />
            <div className="h-3.5 w-28 bg-white/5 rounded" />
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
            <div className="space-y-2 text-right hidden md:block">
              <div className="h-3 w-16 bg-white/5 rounded ml-auto" />
              <div className="h-7 sm:h-9 w-40 sm:w-48 bg-white/10 rounded" />
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/10 shrink-0" />
          </div>
        </div>

        {/* Recent Form Skeleton */}
        <div className="py-3 border-b border-[#1c2535]/60 space-y-3">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-4 w-full bg-white/5 rounded" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-4 w-full bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Footer Row Skeleton */}
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-white/5 rounded" />
            <div className="h-7 w-52 bg-white/10 rounded" />
          </div>
          <div className="h-10 sm:h-12 w-36 sm:w-40 bg-white/10 rounded-lg" />
        </div>
      </div>
    );
  }

  // 2. Fallback State: Editorial placeholder when fixture feed is synchronizing
  if (!match) {
    return (
      <div className="w-full bg-[#121824]/95 border border-[#1c2535] rounded-xl p-6 sm:p-8 lg:p-10 select-none shadow-2xl text-left">
        <div className="flex items-center justify-between border-b border-[#1c2535] pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-xs font-display font-black uppercase tracking-widest text-[#dc052d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
              NEXT MATCH
            </span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <span className="font-display font-bold text-sm text-gray-300 uppercase tracking-wider hidden sm:inline">
              BUNDESLIGA &amp; EUROPEAN FIXTURES
            </span>
          </div>
          <span className="px-2.5 py-1 rounded text-xs font-display font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
            ALLIANZ ARENA
          </span>
        </div>

        <div className="py-8 my-4 border-y border-[#1c2535]/80 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <BayernCrest className="w-full h-full drop-shadow-md" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-display font-bold text-gray-400 uppercase tracking-widest block">
                GERMAN BUNDESLIGA
              </span>
              <h3 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                FC BAYERN MÜNCHEN
              </h3>
            </div>
          </div>

          <div className="text-center md:text-right">
            <span className="font-display font-bold text-sm sm:text-base text-gray-300 uppercase tracking-wider block">
              SCHEDULE SYNCHRONIZING
            </span>
            <span className="text-xs font-display text-gray-500 uppercase tracking-wider block mt-0.5">
              OFFICIAL MATCH CALENDAR
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-display text-gray-400">
            <MapPin size={14} className="text-[#dc052d]" />
            <span>MÜNCHEN, BAVARIA</span>
          </div>
          <button
            onClick={handleMatchCentreClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 hover:bg-[#dc052d] border border-white/10 hover:border-[#dc052d] text-white font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
          >
            <span>MATCH CENTRE</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Upcoming Fixture + Recent Form Presentation
  const { date: formattedDate, primaryKickoff, secondaryKickoff } = formatKickoff(match.date, visitorTimezone, timeFormat);
  const isBayernHome = match.isHome;
  const homeBadgeText = isBayernHome ? 'ALLIANZ ARENA • HOME' : 'AWAY FIXTURE';

  const homeTeam = match.homeTeam || (isBayernHome ? match.bayern : match.opponent);
  const awayTeam = match.awayTeam || (isBayernHome ? match.opponent : match.bayern);
  const isHomeBayern = isBayernHome || homeTeam?.name?.includes('Bayern');
  const isAwayBayern = !isBayernHome || awayTeam?.name?.includes('Bayern');

  const bayernFormList = form?.bayern || [];
  const opponentFormList = form?.opponent || [];
  const opponentDisplayName = match.opponent?.name || 'Opponent';

  // Associate each side's Recent Form directly with the team displayed on that side above
  const leftTeamName = isHomeBayern ? 'FC BAYERN MÜNCHEN' : opponentDisplayName;
  const leftTeamFormList = isHomeBayern ? bayernFormList : opponentFormList;

  const rightTeamName = isAwayBayern ? 'FC BAYERN MÜNCHEN' : opponentDisplayName;
  const rightTeamFormList = isAwayBayern ? bayernFormList : opponentFormList;

  return (
    <div className="w-full bg-[#121824]/95 backdrop-blur-sm border border-[#1c2535] hover:border-[#2a3548] rounded-xl p-6 sm:p-8 lg:p-10 transition-all duration-200 ease-out shadow-2xl text-left select-none relative">
      {/* =========================================================
          1. TOP KICKER & METADATA BAR
          ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2535] pb-4">
        {/* Left: Eyebrow Badge, Competition, Round */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/35 text-xs font-display font-black uppercase tracking-widest text-[#dc052d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
            NEXT MATCH
          </span>

          <span className="text-gray-600 hidden xs:inline">•</span>

          <span className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
            {match.competition?.name || 'BUNDESLIGA'}
          </span>

          {match.competition?.round && (
            <>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-xs font-display font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">
                {match.competition.round}
              </span>
            </>
          )}
        </div>

        {/* Right: Home/Away Tag & Venue */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-display">
          <span
            className={`px-2.5 py-1 rounded text-xs font-display font-bold uppercase tracking-wider border ${
              isBayernHome
                ? 'bg-[#dc052d]/20 text-[#dc052d] border-[#dc052d]/35'
                : 'bg-white/5 text-gray-300 border-white/10'
            }`}
          >
            {homeBadgeText}
          </span>

          {match.venue && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-display uppercase tracking-wider text-gray-400">
              <MapPin size={13} className="text-[#dc052d] shrink-0" />
              <span className="truncate max-w-[220px] font-medium">{match.venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          2. DOMINANT ELEMENT: HEAD-TO-HEAD MATCHUP CLASH
          ========================================================= */}
      {/* Desktop / Tablet Landscape View (>= md) */}
      <div className="hidden md:grid md:grid-cols-12 md:items-center py-6 sm:py-8 my-4 border-y border-[#1c2535]/80 gap-6">
        {/* Left Team: Home Team */}
        <div className="md:col-span-5 flex items-center justify-end gap-5 lg:gap-6 text-right">
          <div className="space-y-1">
            <span className="text-[11px] font-display font-bold tracking-widest uppercase block text-gray-400">
              {isHomeBayern ? 'HOME • MÜNCHEN' : 'HOME TEAM'}
            </span>
            <h3 className="font-display font-black text-2xl lg:text-3xl xl:text-4xl text-white uppercase tracking-tight leading-tight">
              {homeTeam?.name || 'FC Bayern München'}
            </h3>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 flex items-center justify-center">
            {isHomeBayern ? (
              <BayernCrest className="w-full h-full drop-shadow-md" />
            ) : homeTeam?.logo && !oppImgError ? (
              <img
                src={homeTeam.logo}
                alt={homeTeam.name}
                onError={() => setOppImgError(true)}
                className="w-full h-full object-contain filter contrast-105 drop-shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-gray-400">
                {homeTeam?.name ? homeTeam.name.substring(0, 3).toUpperCase() : 'HOM'}
              </div>
            )}
          </div>
        </div>

        {/* Center Clash Column: VS Emblem + Kickoff Details */}
        <div className="md:col-span-2 flex flex-col items-center justify-center text-center px-1">
          <div className="px-4.5 sm:px-5 py-1.5 sm:py-2 rounded-lg bg-white/5 border border-white/10 text-xs sm:text-sm font-display font-black text-gray-300 tracking-[0.2em] uppercase shadow-inner">
            VS
          </div>
          <span className="font-display font-bold text-sm sm:text-base lg:text-[17px] text-gray-200 uppercase tracking-wider mt-3.5 sm:mt-4 block whitespace-nowrap">
            {formattedDate}
          </span>
          <div className="relative inline-flex items-center justify-center mt-2 sm:mt-2.5">
            <button
              type="button"
              onClick={toggleTimeFormat}
              className="absolute right-[calc(100%-5px)] top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-[#dc052d]/15 active:bg-[#dc052d]/25 text-[#dc052d] hover:text-[#ff2a51] transition-all duration-150 cursor-pointer touch-manipulation group/clock focus:outline-none focus-visible:ring-1 focus-visible:ring-[#dc052d]"
              title="Switch time format"
              aria-label="Switch time format"
            >
              <Clock size={16} className="shrink-0 group-hover/clock:scale-110 transition-transform" />

              {/* Desktop hover tooltip */}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-black/95 border border-white/10 text-[10px] font-display font-medium text-gray-200 uppercase tracking-wider whitespace-nowrap opacity-0 group-hover/clock:opacity-100 group-focus-visible/clock:opacity-100 transition-opacity duration-150 z-30 shadow-xl hidden sm:block">
                Switch time format
              </span>
            </button>

            <span 
              onClick={toggleTimeFormat}
              className="text-base sm:text-lg lg:text-xl xl:text-2xl font-display text-white font-black uppercase tracking-tight whitespace-nowrap cursor-pointer select-none hover:text-gray-200 transition-colors"
              title="Switch time format"
            >
              {primaryKickoff}
            </span>
          </div>
          <span className="text-xs sm:text-[13px] lg:text-sm font-display text-gray-400 uppercase tracking-wide mt-1.5 sm:mt-2 block whitespace-nowrap">
            {secondaryKickoff}
          </span>
        </div>

        {/* Right Team: Away Team */}
        <div className="md:col-span-5 flex items-center justify-start gap-5 lg:gap-6 text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 flex items-center justify-center">
            {isAwayBayern ? (
              <BayernCrest className="w-full h-full drop-shadow-md" />
            ) : awayTeam?.logo && !oppImgError ? (
              <img
                src={awayTeam.logo}
                alt={awayTeam.name}
                onError={() => setOppImgError(true)}
                className="w-full h-full object-contain filter contrast-105 drop-shadow-md"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-sm text-gray-400">
                {awayTeam?.name ? awayTeam.name.substring(0, 3).toUpperCase() : 'AWY'}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span
              className={`text-[11px] font-display font-bold tracking-widest uppercase block ${
                isAwayBayern ? 'text-[#dc052d]' : 'text-gray-400'
              }`}
            >
              {isAwayBayern ? 'AWAY • FC BAYERN' : 'AWAY TEAM'}
            </span>
            <h3 className="font-display font-black text-2xl lg:text-3xl xl:text-4xl text-white uppercase tracking-tight leading-tight">
              {awayTeam?.name || 'FC Bayern München'}
            </h3>
          </div>
        </div>
      </div>

      {/* Mobile Head-to-Head View (< md) */}
      <div className="md:hidden py-6 my-4 border-y border-[#1c2535]/80 space-y-5">
        <div className="grid grid-cols-2 items-center gap-4 text-center">
          {/* Mobile Home Team */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {isHomeBayern ? (
                <BayernCrest className="w-full h-full drop-shadow-md" />
              ) : homeTeam?.logo && !oppImgError ? (
                <img
                  src={homeTeam.logo}
                  alt={homeTeam.name}
                  onError={() => setOppImgError(true)}
                  className="w-full h-full object-contain filter contrast-105 drop-shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-xs text-gray-400">
                  {homeTeam?.name ? homeTeam.name.substring(0, 3).toUpperCase() : 'HOM'}
                </div>
              )}
            </div>
            <span className="text-[10px] font-display font-bold text-gray-400 uppercase tracking-widest block">
              HOME
            </span>
            <h4 className="font-display font-black text-lg text-white uppercase tracking-tight leading-tight">
              {homeTeam?.name}
            </h4>
          </div>

          {/* Mobile Away Team */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {isAwayBayern ? (
                <BayernCrest className="w-full h-full drop-shadow-md" />
              ) : awayTeam?.logo && !oppImgError ? (
                <img
                  src={awayTeam.logo}
                  alt={awayTeam.name}
                  onError={() => setOppImgError(true)}
                  className="w-full h-full object-contain filter contrast-105 drop-shadow-md"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-xs text-gray-400">
                  {awayTeam?.name ? awayTeam.name.substring(0, 3).toUpperCase() : 'AWY'}
                </div>
              )}
            </div>
            <span
              className={`text-[10px] font-display font-bold uppercase tracking-widest block ${
                isAwayBayern ? 'text-[#dc052d]' : 'text-gray-400'
              }`}
            >
              AWAY
            </span>
            <h4 className="font-display font-black text-lg text-white uppercase tracking-tight leading-tight">
              {awayTeam?.name}
            </h4>
          </div>
        </div>

        {/* Mobile Date & Kickoff Banner */}
        <div className="flex flex-col items-center justify-center pt-2.5 border-t border-[#1c2535]/50 text-center">
          <span className="text-xs sm:text-sm font-display font-bold text-gray-200 uppercase tracking-wider">
            {formattedDate}
          </span>

          <div className="relative inline-flex items-center justify-center mt-1.5">
            <button
              type="button"
              onClick={toggleTimeFormat}
              className="absolute right-[calc(100%-5px)] top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-transparent hover:bg-[#dc052d]/15 active:bg-[#dc052d]/25 text-[#dc052d] hover:text-[#ff2a51] transition-all duration-150 cursor-pointer touch-manipulation group/clock focus:outline-none"
              title="Switch time format"
              aria-label="Switch time format"
            >
              <Clock size={15} className="shrink-0 group-hover/clock:scale-110 transition-transform" />
            </button>

            <span 
              onClick={toggleTimeFormat}
              className="text-sm sm:text-base font-display font-black text-white uppercase tracking-tight whitespace-nowrap cursor-pointer select-none"
              title="Switch time format"
            >
              {primaryKickoff}
            </span>
          </div>

          <span className="text-[11px] sm:text-xs font-display text-gray-400 uppercase tracking-wider mt-1">
            {secondaryKickoff}
          </span>
        </div>
      </div>

      {/* =========================================================
          3. SECONDARY ELEMENT: COMPACT RECENT FORM AREA
          ========================================================= */}
      {(bayernFormList.length > 0 || opponentFormList.length > 0) && (
        <div className="pt-2 pb-4">
          {/* Eyebrow Label */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">
                RECENT FORM
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-[10px] font-display uppercase tracking-wider text-gray-500">
                LAST 4 FIXTURES
              </span>
            </div>
          </div>

          {/* Side-by-side on desktop, stacked on mobile. Visually aligned under each team above */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* 1. Left Team Recent Form (Directly underneath the Left Team in the clash above) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  {leftTeamName}
                </span>
                <span className="text-[11px] font-display font-semibold text-gray-400 uppercase tracking-wider">
                  {getFormSummary(leftTeamFormList)}
                </span>
              </div>

              {/* Clean editorial-style row/list: fits on one row on desktop, natural wrap on mobile */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-x-2 lg:gap-x-2.5 gap-y-1.5 text-xs font-display overflow-hidden">
                {leftTeamFormList.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <span 
                        className={`w-4.5 h-4.5 rounded-[3px] flex items-center justify-center text-[10px] font-display font-black leading-none shrink-0 ${
                          item.result === 'W'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.result === 'D'
                            ? 'bg-white/10 text-gray-300 border border-white/20'
                            : 'bg-[#dc052d]/15 text-[#dc052d] border border-[#dc052d]/30'
                        }`}
                      >
                        {item.result}
                      </span>
                      <span className="font-display font-bold text-gray-200 uppercase tracking-tight">
                        {item.opponent}
                      </span>
                      <span className="font-display font-medium text-gray-400 tracking-tight">
                        {item.score?.replace('-', '–')}
                      </span>
                    </div>
                    {idx < leftTeamFormList.length - 1 && (
                      <span className="text-gray-600 select-none text-xs shrink-0" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 2. Right Team Recent Form (Directly underneath the Right Team in the clash above) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                  {rightTeamName}
                </span>
                <span className="text-[11px] font-display font-semibold text-gray-400 uppercase tracking-wider">
                  {getFormSummary(rightTeamFormList)}
                </span>
              </div>

              {/* Clean editorial-style row/list: fits on one row on desktop, natural wrap on mobile */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-x-2 lg:gap-x-2.5 gap-y-1.5 text-xs font-display overflow-hidden">
                {rightTeamFormList.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0">
                      <span 
                        className={`w-4.5 h-4.5 rounded-[3px] flex items-center justify-center text-[10px] font-display font-black leading-none shrink-0 ${
                          item.result === 'W'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.result === 'D'
                            ? 'bg-white/10 text-gray-300 border border-white/20'
                            : 'bg-[#dc052d]/15 text-[#dc052d] border border-[#dc052d]/30'
                        }`}
                      >
                        {item.result}
                      </span>
                      <span className="font-display font-bold text-gray-200 uppercase tracking-tight">
                        {item.opponent}
                      </span>
                      <span className="font-display font-medium text-gray-400 tracking-tight">
                        {item.score?.replace('-', '–')}
                      </span>
                    </div>
                    {idx < rightTeamFormList.length - 1 && (
                      <span className="text-gray-600 select-none text-xs shrink-0" aria-hidden="true">
                        ·
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. FOOTER ROW: KICKOFF COUNTDOWN & EDITORIAL MATCH CENTRE ACTION
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#1c2535]">
        {/* Left: Kickoff Countdown */}
        <div className="flex flex-col text-left">
          {/* Kickoff Countdown */}
          {countdown && (
            <div className="flex flex-col">
              {countdown.isMatchday ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-xs sm:text-sm font-display font-black uppercase tracking-widest text-[#dc052d]">
                    <span className="w-2 h-2 rounded-full bg-[#dc052d] animate-pulse" />
                    MATCHDAY
                  </span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-xs sm:text-[13px] font-display font-bold uppercase tracking-wider text-[#dc052d]">
                    KICKOFF IN
                  </span>
                  <div className="font-display flex items-baseline tracking-tight mt-1 sm:mt-1.5">
                    <span className="text-white font-black text-lg sm:text-xl lg:text-2xl tabular-nums">
                      {countdown.days}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-bold ml-1 mr-2.5 sm:mr-3">
                      D
                    </span>
                    <span className="text-white font-black text-lg sm:text-xl lg:text-2xl tabular-nums">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-bold ml-1 mr-2.5 sm:mr-3">
                      H
                    </span>
                    <span className="text-white font-black text-lg sm:text-xl lg:text-2xl tabular-nums">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-bold ml-1 mr-2.5 sm:mr-3">
                      M
                    </span>
                    <span className="text-white font-black text-lg sm:text-xl lg:text-2xl tabular-nums">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-gray-400 text-xs sm:text-sm font-bold ml-1">
                      S
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: MATCH CENTRE CTA Action */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={handleMatchCentreClick}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none group/btn shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
            title="Open Match Centre"
          >
            <span>MATCH CENTRE</span>
            <ArrowRight
              size={15}
              className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1 shrink-0"
            />
          </button>

          {notice && (
            <div className="absolute right-0 -bottom-8 whitespace-nowrap px-2.5 py-1 rounded bg-black/95 border border-[#dc052d]/50 text-[#dc052d] text-[10px] font-display font-bold tracking-wider animate-in fade-in z-30 shadow-xl">
              MATCH CENTRE PREVIEW AVAILABLE CLOSER TO KICKOFF
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
