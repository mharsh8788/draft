import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Clock } from 'lucide-react';
import BayernCrest from './BayernCrest';
import { resolveTeamLogo, ARSENAL_WIKIMEDIA_FALLBACK } from '../utils/teamLogos';

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

function formatOpenLigaMatchClient(rawMatch, status = 'NS', liveScore = null) {
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

  const compName = normalizeCompetitionName(rawMatch.rawComp || rawMatch.leagueName || rawMatch.group?.groupName);

  return {
    id: rawMatch.matchID,
    date: rawMatch.matchDateTimeUTC || rawMatch.matchDateTime,
    timestamp: Math.floor(new Date(rawMatch.matchDateTimeUTC || rawMatch.matchDateTime).getTime() / 1000),
    isHome,
    venue,
    competition: {
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

function parseOpenLigaDBMatch(allSeasonMatches, currentRoundMatches = []) {
  if (!Array.isArray(allSeasonMatches) || allSeasonMatches.length === 0) return null;

  const isBayern = m =>
    (m.team1 && (m.team1.teamId === 40 || /bayern/i.test(m.team1.shortName || '') || /bayern/i.test(m.team1.teamName || ''))) ||
    (m.team2 && (m.team2.teamId === 40 || /bayern/i.test(m.team2.shortName || '') || /bayern/i.test(m.team2.teamName || '')));

  const now = Date.now();
  let selectedMatch = null;
  let matchStatus = 'NS';
  let liveScore = null;

  // 1. Check if Bayern has an in-progress LIVE match in the current rounds
  const currentBayernMatch = Array.isArray(currentRoundMatches) ? currentRoundMatches.find(isBayern) : null;
  if (currentBayernMatch && !currentBayernMatch.matchIsFinished) {
    const kickoffMs = new Date(currentBayernMatch.matchDateTimeUTC || currentBayernMatch.matchDateTime).getTime();
    if (!isNaN(kickoffMs)) {
      const elapsedMs = now - kickoffMs;
      const hasLiveResults = currentBayernMatch.matchResults && currentBayernMatch.matchResults.length > 0;
      if (elapsedMs >= 0 && (elapsedMs <= 160 * 60 * 1000 || hasLiveResults)) {
        selectedMatch = currentBayernMatch;
        matchStatus = 'LIVE';
      }
    }
  }

  // 2. Build sorted upcoming candidate list across all competitions
  const bayernSeasonMatches = allSeasonMatches.filter(isBayern);
  bayernSeasonMatches.sort((a, b) =>
    new Date(a.matchDateTimeUTC || a.matchDateTime).getTime() - new Date(b.matchDateTimeUTC || b.matchDateTime).getTime()
  );

  const upcomingCandidates = bayernSeasonMatches.filter(m => {
    if (m.matchIsFinished) return false;
    if (m.isCancelled || m.status === 'CANC' || m.status === 'ABD') return false;
    const kickoffMs = new Date(m.matchDateTimeUTC || m.matchDateTime).getTime();
    if (isNaN(kickoffMs)) return false;
    if (m.isPostponed && kickoffMs <= now) return false;
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

  return {
    match: formatOpenLigaMatchClient(selectedMatch, matchStatus, liveScore),
    followingMatch: followingRawMatch ? formatOpenLigaMatchClient(followingRawMatch, 'NS', null) : null,
    rawSelected: selectedMatch,
    rawFollowing: followingRawMatch
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

    const statusShort = match?.status?.toUpperCase() || 'NS';
    const isExplicitFinished = ['FT', 'AET', 'PEN'].includes(statusShort);
    const isExplicitLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE', 'BT'].includes(statusShort);
    const isPostponed = ['PST', 'POST', 'CANC', 'ABD', 'SUSP', 'INT'].includes(statusShort);

    if (isPostponed) {
      const statusText = statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED';
      return { isPostponed: true, isFinished: false, isLive: false, isMatchday: false, statusText };
    }

    if (isExplicitFinished) {
      return { isFinished: true, isLive: false, isMatchday: false, isPostponed: false };
    }

    if (isExplicitLive) {
      const liveText = statusShort === 'HT' ? 'HALF TIME' :
                       statusShort === 'ET' ? 'EXTRA TIME' :
                       statusShort === 'P' ? 'PENALTIES' : 'LIVE MATCH';
      return { isFinished: false, isLive: true, isMatchday: true, isPostponed: false, liveText };
    }

    // If kickoff has passed:
    if (diff <= 0) {
      const elapsedMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
      // If elapsed > 150 minutes and not explicitly live, match has finished
      if (elapsedMinutes > 150) {
        return { isFinished: true, isLive: false, isMatchday: false };
      }
      return { isFinished: false, isLive: true, isMatchday: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      isFinished: false,
      isLive: false,
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
  }, [targetMs, match?.status]);

  return countdown;
}

export default function NextMatchBanner({ onNavigate }) {
  const [match, setMatch] = useState(null);
  const [form, setForm] = useState(null);
  const [followingMatch, setFollowingMatch] = useState(null);
  const [followingForm, setFollowingForm] = useState(null);
  const [activeFixtureIndex, setActiveFixtureIndex] = useState(0); // 0 = Next Match, 1 = Following Match
  const [loading, setLoading] = useState(true);
  const [oppImgError, setOppImgError] = useState(false);
  const [notice, setNotice] = useState(false);

  const hasFollowing = Boolean(followingMatch);
  const displayedMatch = (activeFixtureIndex === 1 && followingMatch) ? followingMatch : match;
  const displayedForm = (activeFixtureIndex === 1 && followingMatch) ? followingForm : form;
  const countdown = useKickoffCountdown(displayedMatch);

  useEffect(() => {
    setOppImgError(false);
  }, [activeFixtureIndex]);

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
        const res = await fetch(`/api/next-match?timezone=${encodeURIComponent(detectedTz)}&_t=${Math.floor(Date.now() / 60000)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data && data.success && data.match) {
            setMatch(data.match);
            if (data.form) setForm(data.form);
            if (data.followingMatch) setFollowingMatch(data.followingMatch);
            if (data.followingForm) setFollowingForm(data.followingForm);
            setLoading(false);
            return;
          }
        }

        const [resBl1, resUcl, resDfb, resBl2, resCurBl1, resCurUcl, resCurDfb, res2025, resBl2_2025] = await Promise.all([
          fetch('https://api.openligadb.de/getmatchdata/bl1/2026'),
          fetch('https://api.openligadb.de/getmatchdata/ucl/2026'),
          fetch('https://api.openligadb.de/getmatchdata/dfb/2026'),
          fetch('https://api.openligadb.de/getmatchdata/bl2/2026'),
          fetch('https://api.openligadb.de/getmatchdata/bl1'),
          fetch('https://api.openligadb.de/getmatchdata/ucl'),
          fetch('https://api.openligadb.de/getmatchdata/dfb'),
          fetch('https://api.openligadb.de/getmatchdata/bl1/2025'),
          fetch('https://api.openligadb.de/getmatchdata/bl2/2025')
        ]);

        const bl1Matches = resBl1.ok ? await resBl1.json() : [];
        const uclMatches = resUcl.ok ? await resUcl.json() : [];
        const dfbMatches = resDfb.ok ? await resDfb.json() : [];
        const bl2Matches = resBl2.ok ? await resBl2.json() : [];

        const curBl1 = resCurBl1.ok ? await resCurBl1.json() : [];
        const curUcl = resCurUcl.ok ? await resCurUcl.json() : [];
        const curDfb = resCurDfb.ok ? await resCurDfb.json() : [];

        const allSeasonMatches = [
          ...(Array.isArray(bl1Matches) ? bl1Matches.map(m => ({ ...m, rawComp: m.leagueName || 'Bundesliga' })) : []),
          ...(Array.isArray(uclMatches) ? uclMatches.map(m => ({ ...m, rawComp: m.leagueName || 'UEFA Champions League' })) : []),
          ...(Array.isArray(dfbMatches) ? dfbMatches.map(m => ({ ...m, rawComp: m.leagueName || 'DFB-Pokal' })) : []),
          ...(Array.isArray(bl2Matches) ? bl2Matches.map(m => ({ ...m, rawComp: m.leagueName || '2. Bundesliga' })) : [])
        ];

        const currentMatches = [
          ...(Array.isArray(curBl1) ? curBl1.map(m => ({ ...m, rawComp: m.leagueName || 'Bundesliga' })) : []),
          ...(Array.isArray(curUcl) ? curUcl.map(m => ({ ...m, rawComp: m.leagueName || 'UEFA Champions League' })) : []),
          ...(Array.isArray(curDfb) ? curDfb.map(m => ({ ...m, rawComp: m.leagueName || 'DFB-Pokal' })) : [])
        ];

        const parsed = parseOpenLigaDBMatch(allSeasonMatches, currentMatches);
        if (isMounted && parsed && parsed.match) {
          setMatch(parsed.match);
          if (parsed.followingMatch) setFollowingMatch(parsed.followingMatch);

          // Extract form (latest 5 completed matches, newest first, deduplicated)
          let finishedMatches = [];
          try {
            const prev2025 = res2025.ok ? await res2025.json() : [];
            const prevBl2_2025 = resBl2_2025.ok ? await resBl2_2025.json() : [];
            const rawCombined = [
              ...(Array.isArray(prev2025) ? prev2025 : []),
              ...(Array.isArray(prevBl2_2025) ? prevBl2_2025 : []),
              ...(Array.isArray(bl1Matches) ? bl1Matches : []),
              ...(Array.isArray(bl2Matches) ? bl2Matches : []),
              ...(Array.isArray(uclMatches) ? uclMatches : []),
              ...(Array.isArray(dfbMatches) ? dfbMatches : [])
            ];

            const matchMap = new Map();
            for (const m of rawCombined) {
              if (m && m.matchID && !matchMap.has(m.matchID)) {
                matchMap.set(m.matchID, m);
              }
            }
            finishedMatches = Array.from(matchMap.values()).filter(m => m.matchIsFinished);
            // Sort newest first
            finishedMatches.sort((a, b) => new Date(b.matchDateTimeUTC || b.matchDateTime).getTime() - new Date(a.matchDateTimeUTC || a.matchDateTime).getTime());
          } catch {}

          const extractRecentForm = (teamId, teamName) => {
            const sName = teamName ? String(teamName).toLowerCase().trim() : '';
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
              const rawOpp = opp?.shortName || opp?.teamName || 'Opponent';
              const cleanOpp = rawOpp.replace(/^(@|vs\.?)\s+/i, '').trim();
              return {
                id: m.matchID,
                opponent: cleanOpp,
                score,
                result,
                isHome: isT1,
                date: m.matchDateTimeUTC || m.matchDateTime,
                competition: normalizeCompetitionName(m.leagueName || m.group?.groupName || 'Bundesliga')
              };
            });
          };

          const bayernForm = extractRecentForm(40, 'Bayern');
          const oppTeam = parsed.match.opponent;
          const opponentForm = extractRecentForm(oppTeam?.teamId, oppTeam?.shortName || oppTeam?.name);
          setForm({ bayern: bayernForm, opponent: opponentForm });

          if (parsed.followingMatch) {
            const follOppTeam = parsed.followingMatch.opponent;
            const follOppForm = extractRecentForm(follOppTeam?.teamId, follOppTeam?.shortName || follOppTeam?.name);
            setFollowingForm({ bayern: bayernForm, opponent: follOppForm });
          }

          setLoading(false);
          return;
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
    if (displayedMatch?.id) {
      if (onNavigate) {
        onNavigate(`/match/${displayedMatch.id}`);
      } else if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/match/${displayedMatch.id}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setNotice(true);
      setTimeout(() => setNotice(false), 3400);
    }
  };

  const getFormSummary = (list) => {
    if (!list || list.length === 0) return 'NO RECENT FIXTURES';
    const count = list.length;
    const matchLabel = count === 1 ? '1 MATCH' : `${count} MATCHES`;
    const w = list.filter(m => m.result === 'W').length;
    const d = list.filter(m => m.result === 'D').length;
    const l = list.filter(m => m.result === 'L').length;
    return `${matchLabel} • ${w}W • ${d}D • ${l}L`;
  };

  // 1. Loading Skeleton State: Matches exact expanded dimensions
  if (loading) {
    return (
      <div 
        className="w-full text-left select-none animate-pulse relative pt-1 pb-4 sm:pb-6"
        aria-busy="true"
        aria-label="Loading upcoming FC Bayern match and form"
      >
        {/* Top Eyebrow Header Skeleton */}
        <div className="flex items-center justify-between border-b border-[#1c2535] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-white/10 rounded" />
            <div className="h-4 w-32 bg-white/5 rounded hidden sm:block" />
          </div>
          <div className="h-4 w-36 bg-white/5 rounded" />
        </div>

        {/* Center Head-to-Head Skeleton */}
        <div className="py-8 sm:py-10 border-b border-[#1c2535] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-start">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-white/10 shrink-0" />
            <div className="space-y-2">
              <div className="h-3 w-16 bg-white/5 rounded" />
              <div className="h-7 sm:h-9 w-40 sm:w-48 bg-white/10 rounded" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2.5">
            <div className="h-4 w-8 bg-white/10 rounded" />
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
        <div className="py-5 sm:py-6 border-b border-[#1c2535] space-y-3">
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
        <div className="flex items-center justify-between pt-5 sm:pt-6">
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
  if (!displayedMatch) {
    return (
      <div className="w-full text-left select-none relative pt-1 pb-4 sm:pb-6">
        <div className="flex items-center justify-between border-b border-[#1c2535] pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-widest text-[#dc052d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
              NEXT UP
            </span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <span className="font-display font-bold text-sm text-gray-300 uppercase tracking-wider hidden sm:inline">
              BUNDESLIGA &amp; EUROPEAN FIXTURES
            </span>
          </div>
          <span className="text-xs font-display font-bold uppercase tracking-wider text-gray-400">
            ALLIANZ ARENA
          </span>
        </div>

        <div className="py-8 sm:py-10 border-b border-[#1c2535] flex flex-col md:flex-row items-center justify-between gap-6">
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

        <div className="flex items-center justify-between pt-5 sm:pt-6">
          <div className="flex items-center gap-2 text-xs font-display text-gray-400">
            <MapPin size={14} className="text-[#dc052d]" />
            <span>MÜNCHEN, BAVARIA</span>
          </div>
          <button
            onClick={handleMatchCentreClick}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg"
          >
            <span>MATCH CENTRE</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Active Upcoming Fixture + Recent Form Presentation
  const { date: formattedDate, primaryKickoff, secondaryKickoff } = formatKickoff(displayedMatch.date, visitorTimezone, timeFormat);
  const isBayernHome = displayedMatch.isHome;
  const homeBadgeText = isBayernHome ? 'ALLIANZ ARENA • HOME' : 'AWAY FIXTURE';

  const homeTeam = displayedMatch.homeTeam || (isBayernHome ? displayedMatch.bayern : displayedMatch.opponent);
  const awayTeam = displayedMatch.awayTeam || (isBayernHome ? displayedMatch.opponent : displayedMatch.bayern);
  const isHomeBayern = isBayernHome || homeTeam?.name?.includes('Bayern');
  const isAwayBayern = !isBayernHome || awayTeam?.name?.includes('Bayern');
  const resolvedHomeLogo = resolveTeamLogo(homeTeam) || resolveTeamLogo(homeTeam?.name) || homeTeam?.logo;
  const resolvedAwayLogo = resolveTeamLogo(awayTeam) || resolveTeamLogo(awayTeam?.name) || awayTeam?.logo;

  const bayernFormList = displayedForm?.bayern || [];
  const opponentFormList = displayedForm?.opponent || [];
  const opponentDisplayName = displayedMatch.opponent?.name || 'Opponent';

  // Associate each side's Recent Form directly with the team displayed on that side above
  const leftTeamName = isHomeBayern ? 'FC BAYERN MÜNCHEN' : opponentDisplayName;
  const leftTeamFormList = isHomeBayern ? bayernFormList : opponentFormList;

  const rightTeamName = isAwayBayern ? 'FC BAYERN MÜNCHEN' : opponentDisplayName;
  const rightTeamFormList = isAwayBayern ? bayernFormList : opponentFormList;

  const statusShort = displayedMatch.status?.toUpperCase() || 'NS';
  const isLiveMatch = displayedMatch.status === 'LIVE' || ['1H', '2H', 'HT', 'ET', 'P', 'BT'].includes(statusShort);
  const isPostponedMatch = ['PST', 'POST', 'CANC', 'ABD', 'SUSP', 'INT'].includes(statusShort);

  return (
    <div className="w-full text-left select-none relative pt-1 pb-4 sm:pb-6">
      {/* =========================================================
          1. TOP KICKER & METADATA BAR
          ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2535] pb-4">
        {/* Left: Eyebrow Controls, Competition, Round */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {hasFollowing ? (
            <div className="inline-flex items-center gap-2 sm:gap-2.5" role="tablist" aria-label="Upcoming fixture selection">
              <button
                type="button"
                role="tab"
                aria-selected={activeFixtureIndex === 0}
                onClick={() => setActiveFixtureIndex(0)}
                className={`inline-flex items-center gap-1.5 py-1 text-xs font-display font-black uppercase tracking-widest transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#dc052d] rounded-xs ${
                  activeFixtureIndex === 0
                    ? 'text-[#dc052d]'
                    : 'text-gray-400 hover:text-white'
                }`}
                title="View next fixture"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                    activeFixtureIndex === 0 ? 'bg-[#dc052d] opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />
                NEXT UP
              </button>

              <span className="text-gray-700 select-none text-xs" aria-hidden="true">|</span>

              <button
                type="button"
                role="tab"
                aria-selected={activeFixtureIndex === 1}
                onClick={() => setActiveFixtureIndex(1)}
                className={`inline-flex items-center gap-1.5 py-1 text-xs font-display font-black uppercase tracking-widest transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#dc052d] rounded-xs ${
                  activeFixtureIndex === 1
                    ? 'text-[#dc052d]'
                    : 'text-gray-400 hover:text-white'
                }`}
                title={`View following fixture vs ${followingMatch.opponent?.shortName || followingMatch.opponent?.name}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                    activeFixtureIndex === 1 ? 'bg-[#dc052d] opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />
                AFTER THAT
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-widest text-[#dc052d]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" aria-hidden="true" />
              NEXT UP
            </span>
          )}

          <span className="text-gray-600 hidden xs:inline">•</span>

          <span className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
            {displayedMatch.competition?.name || 'BUNDESLIGA'}
          </span>

          {displayedMatch.competition?.round && (
            <>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-xs font-display font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline">
                {displayedMatch.competition.round}
              </span>
            </>
          )}
        </div>

        {/* Right: Home/Away Tag & Venue */}
        <div className="flex items-center gap-3 text-xs font-display uppercase tracking-wider flex-wrap">
          <span
            className={`font-bold ${
              isBayernHome ? 'text-[#dc052d]' : 'text-gray-300'
            }`}
          >
            {homeBadgeText}
          </span>

          {displayedMatch.venue && (
            <>
              <span className="text-gray-600 select-none" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5 text-gray-400 font-medium">
                <MapPin size={13} className="text-[#dc052d] shrink-0" />
                <span className="truncate max-w-[240px]">{displayedMatch.venue}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =========================================================
          2. DOMINANT ELEMENT: HEAD-TO-HEAD MATCHUP CLASH
          ========================================================= */}
      {/* Desktop / Tablet Landscape View (>= md) */}
      <div className="hidden md:grid md:grid-cols-12 md:items-center py-8 sm:py-10 border-b border-[#1c2535] gap-6">
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
            ) : (resolvedHomeLogo || homeTeam?.logo) && !oppImgError ? (
              <img
                src={resolvedHomeLogo || homeTeam.logo}
                alt={homeTeam.name}
                onError={(e) => {
                  if (/arsenal/i.test(homeTeam?.name || homeTeam?.shortName) && e.currentTarget.src !== ARSENAL_WIKIMEDIA_FALLBACK) {
                    e.currentTarget.src = ARSENAL_WIKIMEDIA_FALLBACK;
                  } else {
                    setOppImgError(true);
                  }
                }}
                className="w-full h-full object-contain drop-shadow-md"
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
          <span className="text-xs sm:text-sm font-display font-black text-gray-400 tracking-[0.25em] uppercase select-none">
            VS
          </span>
          {isLiveMatch ? (
            <div className="mt-3.5 sm:mt-4 flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#dc052d]/15 text-[#dc052d] text-xs font-display font-black uppercase tracking-wider mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                {statusShort === 'HT' ? 'HALF TIME' :
                 statusShort === 'ET' ? 'EXTRA TIME' :
                 statusShort === 'P' ? 'PENALTIES' : 'LIVE'}
              </span>
              <span className="text-2xl sm:text-3xl font-display text-white font-black tracking-tight tabular-nums">
                {displayedMatch.score ? `${displayedMatch.score.home ?? 0} : ${displayedMatch.score.away ?? 0}` : 'IN PROGRESS'}
              </span>
              <span className="text-xs font-display text-gray-400 uppercase tracking-wide mt-1">
                {formattedDate}
              </span>
            </div>
          ) : isPostponedMatch ? (
            <div className="mt-3.5 sm:mt-4 flex flex-col items-center">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-display font-black uppercase tracking-wider mb-1.5 border border-amber-500/30">
                {statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED'}
              </span>
              <span className="text-sm font-display text-gray-300 font-bold uppercase tracking-wider">
                DATE TO BE CONFIRMED
              </span>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Right Team: Away Team */}
        <div className="md:col-span-5 flex items-center justify-start gap-5 lg:gap-6 text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0 flex items-center justify-center">
            {isAwayBayern ? (
              <BayernCrest className="w-full h-full drop-shadow-md" />
            ) : (resolvedAwayLogo || awayTeam?.logo) && !oppImgError ? (
              <img
                src={resolvedAwayLogo || awayTeam.logo}
                alt={awayTeam.name}
                onError={(e) => {
                  if (/arsenal/i.test(awayTeam?.name || awayTeam?.shortName) && e.currentTarget.src !== ARSENAL_WIKIMEDIA_FALLBACK) {
                    e.currentTarget.src = ARSENAL_WIKIMEDIA_FALLBACK;
                  } else {
                    setOppImgError(true);
                  }
                }}
                className="w-full h-full object-contain drop-shadow-md"
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
      <div className="md:hidden py-6 sm:py-8 border-b border-[#1c2535] space-y-5">
        <div className="grid grid-cols-2 items-center gap-4 text-center">
          {/* Mobile Home Team */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {isHomeBayern ? (
                <BayernCrest className="w-full h-full drop-shadow-md" />
              ) : (resolvedHomeLogo || homeTeam?.logo) && !oppImgError ? (
                <img
                  src={resolvedHomeLogo || homeTeam.logo}
                  alt={homeTeam.name}
                  onError={(e) => {
                    if (/arsenal/i.test(homeTeam?.name || homeTeam?.shortName) && e.currentTarget.src !== ARSENAL_WIKIMEDIA_FALLBACK) {
                      e.currentTarget.src = ARSENAL_WIKIMEDIA_FALLBACK;
                    } else {
                      setOppImgError(true);
                    }
                  }}
                  className="w-full h-full object-contain drop-shadow-md"
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
              ) : (resolvedAwayLogo || awayTeam?.logo) && !oppImgError ? (
                <img
                  src={resolvedAwayLogo || awayTeam.logo}
                  alt={awayTeam.name}
                  onError={(e) => {
                    if (/arsenal/i.test(awayTeam?.name || awayTeam?.shortName) && e.currentTarget.src !== ARSENAL_WIKIMEDIA_FALLBACK) {
                      e.currentTarget.src = ARSENAL_WIKIMEDIA_FALLBACK;
                    } else {
                      setOppImgError(true);
                    }
                  }}
                  className="w-full h-full object-contain drop-shadow-md"
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
          {isLiveMatch ? (
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#dc052d]/15 text-[#dc052d] text-[11px] font-display font-black uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                {statusShort === 'HT' ? 'HALF TIME' :
                 statusShort === 'ET' ? 'EXTRA TIME' :
                 statusShort === 'P' ? 'PENALTIES' : 'LIVE'}
              </span>
              <span className="text-xl font-display text-white font-black tracking-tight tabular-nums">
                {displayedMatch.score ? `${displayedMatch.score.home ?? 0} : ${displayedMatch.score.away ?? 0}` : 'IN PROGRESS'}
              </span>
              <span className="text-[11px] font-display text-gray-400 uppercase tracking-wider mt-0.5">
                {formattedDate}
              </span>
            </div>
          ) : isPostponedMatch ? (
            <div className="flex flex-col items-center">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[11px] font-display font-black uppercase tracking-wider mb-1 border border-amber-500/30">
                {statusShort === 'CANC' ? 'CANCELLED' : statusShort === 'SUSP' ? 'SUSPENDED' : 'POSTPONED'}
              </span>
              <span className="text-xs font-display text-gray-300 font-bold uppercase tracking-wider">
                DATE TO BE CONFIRMED
              </span>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* =========================================================
          3. SECONDARY ELEMENT: COMPACT RECENT FORM AREA
          ========================================================= */}
      {(bayernFormList.length > 0 || opponentFormList.length > 0) && (
        <div className="py-5 sm:py-6 border-b border-[#1c2535]">
          {/* Eyebrow Label */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">
                RECENT FORM
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-[10px] font-display uppercase tracking-wider text-gray-500">
                {leftTeamFormList.length === rightTeamFormList.length && leftTeamFormList.length > 0 ? (
                  <>
                    <span className="md:hidden">LAST {Math.min(leftTeamFormList.length, 3)} FIXTURES</span>
                    <span className="hidden md:inline">LAST {leftTeamFormList.length} FIXTURES</span>
                  </>
                ) : (
                  <span>OFFICIAL COMPLETED FIXTURES</span>
                )}
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

              {leftTeamFormList.length === 0 ? (
                <span className="text-xs font-display text-gray-500 uppercase tracking-wider block py-1">
                  No completed fixtures recorded this season
                </span>
              ) : (
                /* Clean editorial-style row/list: fits on one row on desktop, 3 compact fixtures on mobile */
                <div className="flex flex-wrap md:flex-nowrap items-center gap-x-2 lg:gap-x-2.5 gap-y-1.5 text-xs font-display overflow-hidden">
                  {leftTeamFormList.map((item, idx) => {
                    const isHiddenOnMobile = leftTeamFormList.length > 3 && idx >= 3;
                    return (
                      <React.Fragment key={idx}>
                        <div className={`${isHiddenOnMobile ? 'hidden md:inline-flex' : 'inline-flex'} items-center gap-1.5 whitespace-nowrap shrink-0`}>
                          <span 
                            className={`font-display font-black text-xs shrink-0 ${
                              item.result === 'W'
                                ? 'text-emerald-400'
                                : item.result === 'D'
                                ? 'text-gray-300'
                                : 'text-[#dc052d]'
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
                          <span className={`text-gray-600 select-none text-xs shrink-0 ${idx >= 2 ? 'hidden md:inline' : ''}`} aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
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

              {rightTeamFormList.length === 0 ? (
                <span className="text-xs font-display text-gray-500 uppercase tracking-wider block py-1">
                  No completed fixtures recorded this season
                </span>
              ) : (
                /* Clean editorial-style row/list: fits on one row on desktop, 3 compact fixtures on mobile */
                <div className="flex flex-wrap md:flex-nowrap items-center gap-x-2 lg:gap-x-2.5 gap-y-1.5 text-xs font-display overflow-hidden">
                  {rightTeamFormList.map((item, idx) => {
                    const isHiddenOnMobile = rightTeamFormList.length > 3 && idx >= 3;
                    return (
                      <React.Fragment key={idx}>
                        <div className={`${isHiddenOnMobile ? 'hidden md:inline-flex' : 'inline-flex'} items-center gap-1.5 whitespace-nowrap shrink-0`}>
                          <span 
                            className={`font-display font-black text-xs shrink-0 ${
                              item.result === 'W'
                                ? 'text-emerald-400'
                                : item.result === 'D'
                                ? 'text-gray-300'
                                : 'text-[#dc052d]'
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
                          <span className={`text-gray-600 select-none text-xs shrink-0 ${idx >= 2 ? 'hidden md:inline' : ''}`} aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          4. FOOTER ROW: KICKOFF COUNTDOWN & EDITORIAL MATCH CENTRE ACTION
          ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 sm:pt-6">
        {/* Left: Kickoff Countdown */}
        <div className="flex flex-col text-left">
          {/* Kickoff Countdown */}
          {countdown && (
            <div className="flex flex-col">
              {countdown.isPostponed ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-black uppercase tracking-widest text-amber-400">
                    {countdown.statusText || 'POSTPONED'} · SCHEDULE PENDING
                  </span>
                </div>
              ) : countdown.isLive ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-black uppercase tracking-widest text-[#dc052d]">
                    <span className="w-2 h-2 rounded-full bg-[#dc052d] animate-pulse" />
                    {countdown.liveText || 'LIVE MATCH'} {displayedMatch.score ? `· ${displayedMatch.score.home ?? 0} : ${displayedMatch.score.away ?? 0}` : ''}
                  </span>
                </div>
              ) : countdown.isFinished ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-black uppercase tracking-widest text-gray-400">
                    FULL TIME {displayedMatch.score ? `· ${displayedMatch.score.home ?? 0} : ${displayedMatch.score.away ?? 0}` : ''}
                  </span>
                </div>
              ) : countdown.isMatchday ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-black uppercase tracking-widest text-[#dc052d]">
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
