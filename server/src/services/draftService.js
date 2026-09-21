import { db } from '../db/database.js';
import { PLAYERS, isPositionEligible } from '../data/players.js';
import { getFormation } from '../data/formations.js';
import crypto from 'crypto';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const draftService = {
  generatePair(roundNum, usedIds, formationKey = '4-3-3') {
    const formation = getFormation(formationKey);
    const roundConfig = formation.slots.find(r => r.round === roundNum) || formation.slots[roundNum - 1];
    if (!roundConfig) return null;

    const targetPos = roundConfig.position;
    const eligible = PLAYERS.filter(
      p => isPositionEligible(p, targetPos) && !usedIds.includes(p.id)
    );

    if (eligible.length < 2) {
      // Fallback
      const fallback = PLAYERS.filter(p => isPositionEligible(p, targetPos));
      const shuffled = shuffle(fallback);
      return {
        revealedPlayer: shuffled[0],
        mysteryPlayer: shuffled[1] || shuffled[0]
      };
    }

    const shuffled = shuffle(eligible);
    return {
      revealedPlayer: shuffled[0],
      mysteryPlayer: shuffled[1]
    };
  },

  // Mask sensitive identity, rating, and statistical fields for mystery player
  maskMysteryPlayer(player) {
    if (!player) return null;
    return {
      id: player.id,
      position: player.position,
      isMystery: true
    };
  },

  async createDraft(formationKey = '4-3-3') {
    const draftId = 'draft_' + crypto.randomBytes(8).toString('hex');
    const formation = getFormation(formationKey);
    const draft = await db.createDraft(draftId, formation.key);

    const pair = this.generatePair(1, [], formation.key);
    draft.currentPair = pair;

    return {
      id: draft.id,
      status: draft.status,
      formation: formation.key,
      currentRound: 1,
      totalRounds: formation.slots.length,
      position: formation.slots[0],
      revealedPlayer: pair.revealedPlayer,
      mysteryPlayer: this.maskMysteryPlayer(pair.mysteryPlayer)
    };
  },

  async getDraft(draftId) {
    const draft = await db.getDraft(draftId);
    if (!draft) return null;

    return {
      id: draft.id,
      status: draft.status,
      formation: draft.formation || '4-3-3',
      currentRound: draft.current_round,
      userTeam: draft.userTeam || [],
      opponentTeam: draft.opponentTeam || []
    };
  },

  async makeChoice(draftId, choice, currentPairIds) {
    const draft = await db.getDraft(draftId);
    if (!draft) {
      throw new Error('Draft session not found');
    }

    const formation = getFormation(draft.formation);

    if (draft.current_round > formation.slots.length || draft.status === 'completed') {
      throw new Error('Draft is already completed');
    }

    const roundConfig = formation.slots.find(r => r.round === draft.current_round) || formation.slots[draft.current_round - 1];
    if (!roundConfig) {
      throw new Error('Invalid round configuration');
    }

    // Retrieve full player objects
    const revealedPlayer = PLAYERS.find(p => p.id === currentPairIds.revealedPlayerId);
    const mysteryPlayer = PLAYERS.find(p => p.id === currentPairIds.mysteryPlayerId);

    if (!revealedPlayer || !mysteryPlayer) {
      throw new Error('Invalid player IDs provided for this round');
    }

    // Validate position compatibility
    if (!isPositionEligible(revealedPlayer, roundConfig.position) ||
        !isPositionEligible(mysteryPlayer, roundConfig.position)) {
      throw new Error(`One or more players do not match the required position: ${roundConfig.position}`);
    }

    // Validate no duplicates
    if (draft.usedPlayerIds.includes(revealedPlayer.id) || draft.usedPlayerIds.includes(mysteryPlayer.id)) {
      throw new Error('One of the players has already been used in this draft');
    }

    const wasMystery = choice === 'mystery';
    const userPlayer = wasMystery ? mysteryPlayer : revealedPlayer;
    const opponentPlayer = wasMystery ? revealedPlayer : mysteryPlayer;

    // Save pick
    await db.savePick(draftId, draft.current_round, userPlayer, opponentPlayer, wasMystery);

    const isFinished = draft.current_round > formation.slots.length;
    let nextPairData = null;

    if (!isFinished) {
      const nextPair = this.generatePair(draft.current_round, draft.usedPlayerIds, formation.key);
      draft.currentPair = nextPair;
      const nextSlot = formation.slots.find(r => r.round === draft.current_round) || formation.slots[draft.current_round - 1];
      nextPairData = {
        round: draft.current_round,
        position: nextSlot,
        revealedPlayer: nextPair.revealedPlayer,
        mysteryPlayer: this.maskMysteryPlayer(nextPair.mysteryPlayer)
      };
    }

    return {
      draftId,
      roundCompleted: draft.current_round - 1,
      isFinished,
      revealedMysteryPlayer: mysteryPlayer, // full unmasked object revealed now
      userPick: userPlayer,
      opponentPick: opponentPlayer,
      nextRound: nextPairData
    };
  },

  generateComputerXI(formationKey, userTeam = [], opponentPicks = []) {
    const formation = getFormation(formationKey);
    const userPlayerIds = new Set((userTeam || []).map(p => p.id));
    const usedComputerIds = new Set();
    const computerXI = [];

    formation.slots.forEach((slot, index) => {
      const targetPosition = slot.position;
      const opponentPick = opponentPicks[index];

      if (
        opponentPick &&
        opponentPick.id &&
        !userPlayerIds.has(opponentPick.id) &&
        !usedComputerIds.has(opponentPick.id) &&
        isPositionEligible(opponentPick, targetPosition)
      ) {
        usedComputerIds.add(opponentPick.id);
        computerXI.push(opponentPick);
        return;
      }

      const eligiblePool = PLAYERS.filter(
        p => isPositionEligible(p, targetPosition) &&
             !userPlayerIds.has(p.id) &&
             !usedComputerIds.has(p.id)
      );

      if (eligiblePool.length > 0) {
        eligiblePool.sort((a, b) => b.overall - a.overall);
        const chosen = eligiblePool[0];
        usedComputerIds.add(chosen.id);
        computerXI.push(chosen);
        return;
      }

      const fallbackPool = PLAYERS.filter(
        p => isPositionEligible(p, targetPosition) && !usedComputerIds.has(p.id)
      );
      fallbackPool.sort((a, b) => b.overall - a.overall);
      const fallbackChosen = fallbackPool[0] || PLAYERS[0];
      usedComputerIds.add(fallbackChosen.id);
      computerXI.push(fallbackChosen);
    });

    return computerXI;
  },

  async finishDraft(draftId) {
    const draft = await db.getDraft(draftId);
    if (!draft) {
      throw new Error('Draft session not found');
    }

    const formation = getFormation(draft.formation);
    const userTeam = draft.userTeam || [];
    const opponentTeam = this.generateComputerXI(formation.key, userTeam, draft.opponentTeam || []);

    const calculateStats = (team) => {
      const count = team.length || 1;
      return {
        avgRating: (team.reduce((acc, p) => acc + p.overall, 0) / count).toFixed(1),
        goals: team.reduce((acc, p) => acc + p.goals, 0),
        assists: team.reduce((acc, p) => acc + p.assists, 0),
        appearances: team.reduce((acc, p) => acc + p.appearances, 0),
        trophies: team.reduce((acc, p) => acc + p.trophies, 0),
        bundesligaTitles: team.reduce((acc, p) => acc + p.bundesligaTitles, 0),
        championsLeagueTitles: team.reduce((acc, p) => acc + p.championsLeagueTitles, 0)
      };
    };

    return {
      draftId,
      status: 'completed',
      formation: formation.key,
      userTeam,
      opponentTeam,
      computerTeam: opponentTeam,
      userStats: calculateStats(userTeam),
      opponentStats: calculateStats(opponentTeam),
      comparisonMessage: "Compare the numbers and decide."
    };
  }
};
