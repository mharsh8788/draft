import { Formation, Player, SquadMetrics, SquadPicks } from '../../types/draft';
import { SimulationMatch, SimulationResult, TacticalStyle, GameMode } from './types';

export function calculateSquadMetrics(
  squad: SquadPicks,
  formation: Formation,
  tacticalStyle: TacticalStyle = 'balanced'
): SquadMetrics {
  const assignedEntries = Object.entries(squad).filter(
    (entry): entry is [string, Player] => entry[1] !== null
  );
  const players = assignedEntries.map(([, p]) => p);
  const totalDrafted = players.length;
  const isComplete = totalDrafted === 11;

  if (totalDrafted === 0) {
    return {
      totalDrafted: 0,
      isComplete: false,
      baseRating: 0,
      chemistryBonus: 0,
      overallRating: 0,
      attackRating: 0,
      midfieldRating: 0,
      defenseRating: 0,
      goalkeeperRating: 0,
      clubCounts: {},
      eraCounts: {},
      nationCounts: {},
      activeSynergies: [],
    };
  }

  // Positional Subsets
  const gkPlayers = assignedEntries
    .filter(([slotId]) => formation.slots.find((s) => s.id === slotId)?.category === 'GK')
    .map(([, p]) => p);

  const defPlayers = assignedEntries
    .filter(([slotId]) => formation.slots.find((s) => s.id === slotId)?.category === 'DEF')
    .map(([, p]) => p);

  const midPlayers = assignedEntries
    .filter(([slotId]) => formation.slots.find((s) => s.id === slotId)?.category === 'MID')
    .map(([, p]) => p);

  const fwdPlayers = assignedEntries
    .filter(([slotId]) => formation.slots.find((s) => s.id === slotId)?.category === 'FWD')
    .map(([, p]) => p);

  const avg = (arr: Player[]) =>
    arr.length ? Math.round((arr.reduce((sum, p) => sum + (p.editorialRating ?? p.rating ?? 0), 0) / arr.length) * 10) / 10 : 0;

  const baseRating = Math.round((players.reduce((sum, p) => sum + (p.editorialRating ?? p.rating ?? 0), 0) / totalDrafted) * 10) / 10;
  const attackRating = avg(fwdPlayers);
  const midfieldRating = avg(midPlayers);
  const defenseRating = avg(defPlayers);
  const goalkeeperRating = avg(gkPlayers);

  // Groupings
  const clubCounts: Record<string, number> = {};
  const eraCounts: Record<string, number> = {};
  const nationCounts: Record<string, number> = {};
  const activeSynergies: string[] = [];

  for (const p of players) {
    const club = p.primaryClub || p.club || 'Unknown';
    const era = p.era || p.season || 'Unknown';
    const nation = p.nationality || 'Unknown';
    clubCounts[club] = (clubCounts[club] || 0) + 1;
    eraCounts[era] = (eraCounts[era] || 0) + 1;
    nationCounts[nation] = (nationCounts[nation] || 0) + 1;
  }

  let chemistryBonus = 0;

  // 1. Club Chemistry: 2+ players from the same club (+1 per club, max +3)
  let clubBonus = 0;
  for (const [club, count] of Object.entries(clubCounts)) {
    if (count >= 2) {
      clubBonus += 1;
      activeSynergies.push(`${club} Chemistry (${count} players)`);
    }
  }
  chemistryBonus += Math.min(3, clubBonus);

  // 2. Era / Dynasty Synergy: Retired for single-season UCL Draft (2026-27).
  // Preserves Club Chemistry, Nationality Connection, and Tactical Style bonuses.

  // 3. Nationality Connection: 3+ players from same nation (+1)
  for (const [nation, count] of Object.entries(nationCounts)) {
    if (count >= 3) {
      chemistryBonus += 1;
      activeSynergies.push(`${nation} Connection (${count} players)`);
    }
  }

  // 4. Tactical Style Bonus
  if (isComplete) {
    if ((tacticalStyle === 'defensive' || tacticalStyle === 'pressing') && (defenseRating + midfieldRating) / 2 >= 90) {
      chemistryBonus += 1;
      activeSynergies.push('Defensive Wall (+1 Style Bonus)');
    } else if ((tacticalStyle === 'attacking' || tacticalStyle === 'counter') && attackRating >= 90) {
      chemistryBonus += 1;
      activeSynergies.push('Lethal Transition (+1 Style Bonus)');
    } else if (tacticalStyle === 'control' && midfieldRating >= 92) {
      chemistryBonus += 1;
      activeSynergies.push('Tiki-Taka Masterclass (+1 Style Bonus)');
    } else if (tacticalStyle === 'balanced' && Math.abs(attackRating - defenseRating) <= 4) {
      chemistryBonus += 1;
      activeSynergies.push('Tactical Harmony (+1 Style Bonus)');
    }
  }

  // Squad overall rating is the authentic mathematical average of the squad's player ratings
  const overallRating = baseRating;

  return {
    totalDrafted,
    isComplete,
    baseRating,
    chemistryBonus,
    overallRating,
    attackRating,
    midfieldRating,
    defenseRating,
    goalkeeperRating,
    clubCounts,
    eraCounts,
    nationCounts,
    activeSynergies,
  };
}

/**
 * Deterministic Champions League Knockout Run Simulator.
 * Simulates 4 tournament rounds (R16, QF, SF, Final) judging squad power.
 */
export function simulateChampionsLeagueRun(
  metrics: SquadMetrics,
  squad: SquadPicks,
  tacticalStyle: TacticalStyle
): SimulationResult {
  const playerIds = Object.values(squad)
    .filter((p): p is Player => p !== null)
    .map((p) => p.id);

  // Deterministic seed based on player names
  const seed = playerIds.reduce((acc, id) => acc + id.charCodeAt(0), 0);

  const roundsData = [
    {
      round: 'Round of 16' as const,
      opponent: 'Juventus 1996 (Lippi)',
      opponentRating: 90,
      oppAdvantage: 0,
    },
    {
      round: 'Quarter-Final' as const,
      opponent: 'Manchester United 1999 (Treble)',
      opponentRating: 92,
      oppAdvantage: 1,
    },
    {
      round: 'Semi-Final' as const,
      opponent: 'Bayern Munich 2013 (Heynckes)',
      opponentRating: 94,
      oppAdvantage: 1,
    },
    {
      round: 'Final' as const,
      opponent: 'Real Madrid 2017 (Zidane)',
      opponentRating: 95,
      oppAdvantage: 2,
    },
  ];

  let champion = true;
  let totalGoalsAllowed = 0;
  const matches: SimulationMatch[] = [];

  for (let i = 0; i < roundsData.length; i++) {
    const r = roundsData[i];
    if (!champion) {
      // If knocked out in a previous round, cannot play later rounds
      matches.push({
        round: r.round,
        opponent: r.opponent,
        opponentRating: r.opponentRating,
        squadGoals: 0,
        opponentGoals: 0,
        won: false,
        cleanSheet: false,
        narrative: 'Did not advance to this stage.',
      });
      continue;
    }

    // Effective Squad Power against this opponent
    const ratingDiff = metrics.overallRating - r.opponentRating;
    const roundSeed = (seed * (i + 1) * 17) % 100;

    // Goals for calculation
    let squadGoals = Math.max(1, Math.round(2 + (metrics.attackRating - 92) * 0.4 + (roundSeed % 3) * 0.5));
    // Goals against calculation
    let opponentGoals = Math.max(
      0,
      Math.round(1 + (r.opponentRating - metrics.defenseRating) * 0.3 - (metrics.goalkeeperRating >= 94 ? 1 : 0))
    );

    // If defense and GK are elite, chance of clean sheet
    if (metrics.defenseRating >= 94 && metrics.goalkeeperRating >= 93 && roundSeed % 2 === 0) {
      opponentGoals = 0;
    }

    // Ensure decisive victory/loss in knockouts
    if (squadGoals === opponentGoals) {
      if (ratingDiff >= 0) {
        squadGoals += 1;
      } else {
        opponentGoals += 1;
      }
    }

    const won = squadGoals > opponentGoals;
    totalGoalsAllowed += opponentGoals;

    let narrative = '';
    if (won) {
      if (opponentGoals === 0) {
        narrative = `Flawless defensive exhibition. Your backline shut down ${r.opponent} with commanding authority.`;
      } else {
        narrative = `Thrilling tactical battle. Your attacking quality breached ${r.opponent}'s block at decisive moments.`;
      }
    } else {
      champion = false;
      narrative = `Knocked out by ${r.opponent}. Opponent pace and tactical structure capitalized on positional gaps.`;
    }

    matches.push({
      round: r.round,
      opponent: r.opponent,
      opponentRating: r.opponentRating,
      squadGoals,
      opponentGoals,
      won,
      cleanSheet: opponentGoals === 0,
      narrative,
    });
  }

  const playedMatches = matches.filter((m) => m.narrative !== 'Did not advance to this stage.');
  const wins = playedMatches.filter((m) => m.won).length;
  const losses = playedMatches.filter((m) => !m.won).length;
  const draws = 0; // Knockouts resolve to winner
  const goalsFor = playedMatches.reduce((acc, m) => acc + m.squadGoals, 0);
  const goalsAgainst = playedMatches.reduce((acc, m) => acc + m.opponentGoals, 0);
  const goalDifference = goalsFor - goalsAgainst;

  const sevenNilAchievement = champion && totalGoalsAllowed === 0;
  const trophyScore = Math.min(
    100,
    Math.round(metrics.overallRating * 0.7 + (champion ? 25 : wins * 5))
  );

  let summaryVerdict = '';
  if (sevenNilAchievement) {
    summaryVerdict =
      '⭐ PERFECT RUN (THE IMMORTALITY FEAT): Your All-Time Champions League XI conceded zero goals across the entire knockout tournament! European Football Royalty.';
  } else if (champion) {
    summaryVerdict =
      '🏆 EUROPEAN CHAMPIONS: Your drafted squad navigated the greatest historical tournament brackets to lift the Champions League Trophy!';
  } else {
    summaryVerdict =
      'Knocked out in the European campaign. Rebalance your defensive spine or explore alternative chemistry links for a stronger run.';
  }

  return {
    champion,
    sevenNilAchievement,
    matches,
    trophyScore,
    summaryVerdict,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference,
  };
}

/**
 * Format shareable summary text for copying.
 */
export function generateShareableSummary(
  formation: Formation,
  squad: SquadPicks,
  metrics: SquadMetrics,
  mode: GameMode,
  simulationResult: SimulationResult | null
): string {
  const lines: string[] = [];
  lines.push(`⭐ ROAD TO IMMORTALITY — BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI ⭐`);
  lines.push(`Mode: ${mode === 'classic' ? 'Classic (Stats)' : 'Almanac (From Memory)'}`);
  lines.push(`Formation: ${formation.name} (${formation.id})`);
  lines.push(`Squad Rating: ${metrics.overallRating} OVR | Chemistry: +${metrics.chemistryBonus}`);
  lines.push(
    `Attack: ${metrics.attackRating || '-'} | Midfield: ${metrics.midfieldRating || '-'} | Defense: ${
      metrics.defenseRating || '-'
    } | Goalkeeper: ${metrics.goalkeeperRating || '-'}`
  );

  if (simulationResult) {
    lines.push(``);
    lines.push(
      `TOURNAMENT RESULT: ${simulationResult.champion ? '🏆 EUROPEAN CHAMPIONS' : 'Knockout Stage Exit'}`
    );
    if (simulationResult.sevenNilAchievement) {
      lines.push(`🎯 IMMORTALITY ACHIEVEMENT: Zero goals conceded throughout the campaign!`);
    }
  }

  lines.push(``);
  lines.push(`STARTING XI:`);

  // Order from GK at bottom to FWD at top
  const sortedSlots = [...formation.slots].sort((a, b) => b.y - a.y);
  for (const slot of sortedSlots) {
    const player = squad[slot.id];
    if (player) {
      const ratingText = mode === 'classic' ? ` - ${player.editorialRating} OVR` : '';
      lines.push(
        `• [${slot.label}] ${player.name} (${player.primaryClub})${ratingText} [${player.uclStats.titles}x 🏆]`
      );
    } else {
      lines.push(`• [${slot.label}] [Empty Slot]`);
    }
  }

  if (metrics.activeSynergies.length > 0) {
    lines.push(``);
    lines.push(`ACTIVE SYNERGIES:`);
    metrics.activeSynergies.forEach((s) => lines.push(`⚡ ${s}`));
  }

  lines.push(``);
  lines.push(`Play the UCL Draft: Fan-made editorial Champions League simulator`);

  return lines.join('\n');
}
