import { Formation, PitchSlot, Player, SquadMetrics, SquadPicks } from '../types/draft';
import { FORMATIONS, DEFAULT_FORMATION_ID } from '../data/formations';
import { isPlayerEligibleForSlot } from '../data/players';

export function getFormationById(id: string): Formation {
  return FORMATIONS.find((f) => f.id === id) || FORMATIONS[0];
}

export function initializeSquad(formation: Formation): SquadPicks {
  const squad: SquadPicks = {};
  for (const slot of formation.slots) {
    squad[slot.id] = null;
  }
  return squad;
}

export function isPlayerDrafted(squad: SquadPicks, playerId: string): boolean {
  return Object.values(squad).some((p) => p !== null && (p.id === playerId || p.playerId === playerId));
}

export function getDraftedSlotId(squad: SquadPicks, playerId: string): string | null {
  for (const [slotId, player] of Object.entries(squad)) {
    if (player && (player.id === playerId || player.playerId === playerId)) {
      return slotId;
    }
  }
  return null;
}

export function findFirstEligibleEmptySlot(
  slots: PitchSlot[],
  squad: SquadPicks,
  player: Player
): PitchSlot | null {
  // 1. Prefer empty slots that match player's specific tactical position
  for (const slot of slots) {
    if (!squad[slot.id] && slot.allowedPositions.includes(player.specificPosition)) {
      return slot;
    }
  }

  // 2. Prefer empty slots within player's primary category (e.g. FWD -> FWD)
  for (const slot of slots) {
    if (
      !squad[slot.id] &&
      slot.category === player.primaryCategory &&
      isPlayerEligibleForSlot(player, slot.allowedPositions, slot.category)
    ) {
      return slot;
    }
  }

  // 3. Fallback to any empty slot where player is eligible (e.g. flex roles)
  for (const slot of slots) {
    if (!squad[slot.id] && isPlayerEligibleForSlot(player, slot.allowedPositions, slot.category)) {
      return slot;
    }
  }

  return null;
}

/**
 * Handle switching formations while preserving compatible player assignments.
 */
export function migrateSquadFormation(
  oldFormation: Formation,
  newFormation: Formation,
  currentSquad: SquadPicks
): { newSquad: SquadPicks; unassignedPlayers: Player[] } {
  const newSquad: SquadPicks = initializeSquad(newFormation);
  const unassignedPlayers: Player[] = [];
  const draftedPlayers = Object.values(currentSquad).filter(
    (p): p is Player => Boolean(p)
  );

  // 1. Direct slot id match if positions still align
  for (const slot of newFormation.slots) {
    const existing = currentSquad[slot.id];
    if (existing && isPlayerEligibleForSlot(existing, slot.allowedPositions, slot.category)) {
      newSquad[slot.id] = existing;
    }
  }

  // 2. For players from old squad that didn't stay in same slotId, try to place in compatible empty slot
  const alreadyAssignedIds = new Set(
    Object.values(newSquad)
      .filter((p): p is Player => Boolean(p))
      .map((p) => p.id)
  );

  const pendingPlayers = draftedPlayers.filter((p) => !alreadyAssignedIds.has(p.id));

  for (const player of pendingPlayers) {
    const emptySlot = findFirstEligibleEmptySlot(newFormation.slots, newSquad, player);
    if (emptySlot) {
      newSquad[emptySlot.id] = player;
    } else {
      unassignedPlayers.push(player);
    }
  }

  return { newSquad, unassignedPlayers };
}

/**
 * Calculate squad metrics, ratings, synergies, and club/era breakdowns.
 */
export function calculateSquadMetrics(squad: SquadPicks, formation: Formation): SquadMetrics {
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

  // Positional subsets
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
    arr.length ? Math.round((arr.reduce((sum, p) => sum + p.editorialRating, 0) / arr.length) * 10) / 10 : 0;

  const baseRating = Math.round((players.reduce((sum, p) => sum + p.editorialRating, 0) / totalDrafted) * 10) / 10;
  const attackRating = avg(fwdPlayers);
  const midfieldRating = avg(midPlayers);
  const defenseRating = avg(defPlayers);
  const goalkeeperRating = avg(gkPlayers);

  // Breakdown counts
  const clubCounts: Record<string, number> = {};
  const eraCounts: Record<string, number> = {};
  const nationCounts: Record<string, number> = {};
  const activeSynergies: string[] = [];

  for (const p of players) {
    // Primary club count
    clubCounts[p.primaryClub] = (clubCounts[p.primaryClub] || 0) + 1;
    // Era count
    eraCounts[p.era] = (eraCounts[p.era] || 0) + 1;
    // Nation count
    nationCounts[p.nationality] = (nationCounts[p.nationality] || 0) + 1;
  }

  let chemistryBonus = 0;

  // Club synergy: 2+ players from same club (+1 per club, max +3)
  let clubBonus = 0;
  for (const [club, count] of Object.entries(clubCounts)) {
    if (count >= 2) {
      clubBonus += 1;
      activeSynergies.push(`${club} Chemistry (${count} players)`);
    }
  }
  chemistryBonus += Math.min(3, clubBonus);

  // Era synergy: 4+ players from same era (+1)
  for (const [era, count] of Object.entries(eraCounts)) {
    if (count >= 4) {
      chemistryBonus += 1;
      activeSynergies.push(`${era} Dynasty (${count} players)`);
    }
  }

  // Nation synergy: 3+ players from same country (+1)
  for (const [nation, count] of Object.entries(nationCounts)) {
    if (count >= 3) {
      chemistryBonus += 1;
      activeSynergies.push(`${nation} Connection (${count} players)`);
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
 * Format shareable squad summary as text ready to copy.
 */
export function generateShareableSummary(
  formation: Formation,
  squad: SquadPicks,
  metrics: SquadMetrics
): string {
  const lines: string[] = [];
  lines.push(`⭐ ROAD TO IMMORTALITY — BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI ⭐`);
  lines.push(`Formation: ${formation.name} (${formation.id})`);
  lines.push(`Overall Rating: ${metrics.overallRating} OVR | Chemistry: +${metrics.chemistryBonus}`);
  lines.push(`FWD: ${metrics.attackRating || '-'} | MID: ${metrics.midfieldRating || '-'} | DEF: ${metrics.defenseRating || '-'} | GK: ${metrics.goalkeeperRating || '-'}`);
  lines.push(``);
  lines.push(`STARTING XI:`);

  // Order slots from GK to FWD
  const sortedSlots = [...formation.slots].sort((a, b) => b.y - a.y);
  for (const slot of sortedSlots) {
    const player = squad[slot.id];
    if (player) {
      lines.push(
        `• [${slot.label}] ${player.name} (${player.primaryClub}) - ${player.editorialRating} OVR [${player.uclStats.titles}x UCL 🏆]`
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
  lines.push(`Play ROAD TO IMMORTALITY: Build Your All-Time Champions League XI`);

  return lines.join('\n');
}
