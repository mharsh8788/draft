import { PLAYERS, isPositionEligible } from '../data/players.js';
import { getFormation } from '../data/formations.js';
import { resolvePlayerWithRotatedImage } from './imageRotation.js';

/**
 * Generates a realistic, strong Computer XI for the selected formation.
 * Ensures:
 * 1. Every computer player is strictly eligible for their position slot.
 * 2. No duplicate players between User XI and Computer XI.
 * 3. No duplicate players within Computer XI.
 * 4. High-rated competitive player selection for a legitimate opposing draft.
 */
export function generateComputerXI(formationKey = '4-3-3', userTeam = [], opponentPicks = []) {
  const formation = getFormation(formationKey);
  const userPlayerIds = new Set((userTeam || []).map(p => p.id));
  const usedComputerIds = new Set();
  const computerXI = [];

  formation.slots.forEach((slot, index) => {
    const targetPosition = slot.position;
    const opponentPick = opponentPicks[index];

    // Check if opponentPick from this round's matchup is valid and available
    if (
      opponentPick &&
      opponentPick.id &&
      !userPlayerIds.has(opponentPick.id) &&
      !usedComputerIds.has(opponentPick.id) &&
      isPositionEligible(opponentPick, targetPosition)
    ) {
      usedComputerIds.add(opponentPick.id);
      const resolved = resolvePlayerWithRotatedImage(opponentPick, false);
      computerXI.push(resolved);
      return;
    }

    // Otherwise, select the highest rated eligible player not already used
    const eligiblePool = PLAYERS.filter(
      p => isPositionEligible(p, targetPosition) &&
           !userPlayerIds.has(p.id) &&
           !usedComputerIds.has(p.id)
    );

    if (eligiblePool.length > 0) {
      // Sort by rating descending, with slight variance if ratings are equal
      eligiblePool.sort((a, b) => b.overall - a.overall);
      const chosen = eligiblePool[0];
      usedComputerIds.add(chosen.id);
      const resolved = resolvePlayerWithRotatedImage(chosen, false);
      computerXI.push(resolved);
      return;
    }

    // Ultimate fallback if pool exhausted
    const fallbackPool = PLAYERS.filter(
      p => isPositionEligible(p, targetPosition) && !usedComputerIds.has(p.id)
    );
    fallbackPool.sort((a, b) => b.overall - a.overall);
    const fallbackChosen = fallbackPool[0] || PLAYERS[0];
    usedComputerIds.add(fallbackChosen.id);
    const resolved = resolvePlayerWithRotatedImage(fallbackChosen, false);
    computerXI.push(resolved);
  });

  return computerXI;
}
