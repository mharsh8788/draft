import { DraftState, DraftAction, DraftHistoryItem } from './types';
import { PitchSlot, Player } from '../../types/draft';
import { FORMATIONS, DEFAULT_FORMATION_ID } from '../../data/formations';
import {
  UCL_CLUBS,
  UCL_SEASONS,
  getRandomClubSeasonChallenge,
  isRealPlayerDrafted,
  isPlayerEligibleForSlot,
} from '../../data/players';
import {
  getFormationById,
  initializeSquad,
  migrateSquadFormation,
  findFirstEligibleEmptySlot,
} from '../../utils/draftLogic';
import { calculateSquadMetrics, simulateChampionsLeagueRun } from './scoring';
import {
  generateCampaignSeed,
  generateCampaignTournament,
  createPendingCampaignTournament,
  computeCampaignSummary,
  createSimulationResultFromTournament,
  CampaignTournament,
} from './campaign';

/**
 * Helper to determine if the lineup is permanently locked.
 * Lineup locks immediately once 11 players are drafted into the starting XI (11/11).
 */
export function isLineupLocked(state: DraftState): boolean {
  if (state.isLocked) return true;
  if (state.status === 'completed') return true;
  const draftedCount = Object.values(state.squad).filter((p) => p !== null).length;
  return draftedCount >= 11;
}

export const initialDraftState: DraftState = {
  status: 'setup',
  isLocked: false,
  formationId: DEFAULT_FORMATION_ID,
  mode: 'classic',
  challenge: 'club-draw',
  tacticalStyle: 'balanced',
  squad: initializeSquad(getFormationById(DEFAULT_FORMATION_ID)),
  selectedSlotId: null,
  currentRollClub: 'Real Madrid',
  currentRollEra: '2026-27',
  rerollsRemaining: 3,
  awaitingNextRoll: false,
  history: [],
  notification: null,
  simulationResult: null,
  campaignStep: 0,
  campaignSeed: '#WC6XC4',
  campaignPlayMode: 'match-by-match',
  campaignTournament: null,
  isResultsOpen: false,
  isDisclaimerOpen: false,
  isGameGuideOpen: false,
  isResetConfirmOpen: false,
};

export function uclDraftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'START_GAME': {
      if (isLineupLocked(state)) {
        return state;
      }
      const challenge = getRandomClubSeasonChallenge();
      return {
        ...state,
        status: 'drafting',
        isLocked: false,
        currentRollClub: challenge.club,
        currentRollEra: '2026-27',
        rerollsRemaining: 3,
        awaitingNextRoll: false,
        campaignStep: 0,
        campaignSeed: generateCampaignSeed(),
        campaignTournament: null,
        notification: {
          type: 'info',
          message: `Challenge drawn: ${challenge.club} (2026-27). Pick 1 player for your XI.`,
        },
      };
    }

    case 'ROLL_NEXT_CHALLENGE': {
      if (isLineupLocked(state)) {
        return state;
      }
      const challenge = getRandomClubSeasonChallenge({
        club: state.currentRollClub || '',
        season: '2026-27',
      });
      return {
        ...state,
        currentRollClub: challenge.club,
        currentRollEra: '2026-27',
        awaitingNextRoll: false,
        notification: {
          type: 'info',
          message: `Next Challenge: ${challenge.club} (2026-27). Pick 1 player for your XI.`,
        },
      };
    }

    case 'SET_FORMATION': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Reset the draft to change formation.',
          },
        };
      }
      if (action.payload === state.formationId) return state;
      const targetFormation = getFormationById(action.payload);
      const currentFormation = getFormationById(state.formationId);
      const { newSquad, unassignedPlayers } = migrateSquadFormation(
        currentFormation,
        targetFormation,
        state.squad
      );

      const draftedCount = Object.values(newSquad).filter((p) => p !== null).length;

      return {
        ...state,
        formationId: action.payload,
        squad: newSquad,
        selectedSlotId: null,
        history: [],
        status: draftedCount === 11 ? 'completed' : state.status,
        notification:
          unassignedPlayers.length > 0
            ? {
                type: 'info',
                message: `Switched to ${targetFormation.name}. ${unassignedPlayers.length} player(s) returned to pool.`,
              }
            : {
                type: 'success',
                message: `Switched formation to ${targetFormation.name}.`,
              },
      };
    }

    case 'SET_MODE': {
      if (action.payload === state.mode) return state;
      return {
        ...state,
        mode: action.payload,
        notification: {
          type: 'info',
          message:
            action.payload === 'almanac'
              ? 'Switched to Almanac Mode: Player ratings are now hidden. Rely on football knowledge!'
              : 'Switched to Classic Mode: Numerical ratings and criteria are visible.',
        },
      };
    }

    case 'SET_CHALLENGE': {
      if (action.payload === state.challenge) return state;
      const challenge = getRandomClubSeasonChallenge();
      return {
        ...state,
        challenge: action.payload,
        currentRollClub: challenge.club,
        currentRollEra: '2026-27',
        rerollsRemaining: 3,
        awaitingNextRoll: false,
        notification: {
          type: 'info',
          message:
            action.payload === 'club-draw'
              ? 'Club Draw Mode: You must pick from your drawn European club & season each turn.'
              : 'Open Scouting Mode: Free browsing across all Champions League legends.',
        },
      };
    }

    case 'SET_TACTICAL_STYLE': {
      return {
        ...state,
        tacticalStyle: action.payload,
      };
    }

    case 'SELECT_SLOT': {
      if (isLineupLocked(state)) return state;
      return {
        ...state,
        selectedSlotId: state.selectedSlotId === action.payload ? null : action.payload,
      };
    }

    case 'REROLL_CLUB': {
      if (isLineupLocked(state)) return state;
      if (state.rerollsRemaining <= 0) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'No rerolls remaining for this draft.',
          },
        };
      }
      const challenge = getRandomClubSeasonChallenge({
        club: state.currentRollClub || '',
        season: '2026-27',
      });
      return {
        ...state,
        currentRollClub: challenge.club,
        rerollsRemaining: state.rerollsRemaining - 1,
        notification: {
          type: 'info',
          message: `Rerolled club: ${challenge.club} (${state.rerollsRemaining - 1} rerolls left).`,
        },
      };
    }

    case 'REROLL_ERA': {
      if (isLineupLocked(state)) return state;
      if (state.rerollsRemaining <= 0) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'No rerolls remaining for this draft.',
          },
        };
      }
      return {
        ...state,
        currentRollEra: '2026-27',
        rerollsRemaining: state.rerollsRemaining - 1,
        notification: {
          type: 'info',
          message: `Season pinned to 2026-27 (${state.rerollsRemaining - 1} rerolls left).`,
        },
      };
    }

    case 'DRAFT_PLAYER': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Reset the draft to build a new team.',
          },
        };
      }
      const { player, targetSlotId } = action.payload;
      if (!player) return state;
      const formation = getFormationById(state.formationId);

      // 1. Prevent duplicate real-player selection across different seasons
      if (isRealPlayerDrafted(state.squad, player.playerId || player.id)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: `${player.playerName || player.name} is already drafted in your starting XI. A real player can be selected only once.`,
          },
        };
      }

      // 2. Identify target slot
      let slotToFill: PitchSlot | null = null;
      if (targetSlotId) {
        slotToFill = formation.slots.find((s) => s.id === targetSlotId) || null;
        if (slotToFill && state.squad[slotToFill.id] !== null) {
          return {
            ...state,
            notification: {
              type: 'error',
              message: `The ${slotToFill.label} position is already occupied.`,
            },
          };
        }
      } else if (state.selectedSlotId) {
        slotToFill = formation.slots.find((s) => s.id === state.selectedSlotId) || null;
        if (!slotToFill || state.squad[slotToFill.id] !== null) {
          slotToFill = findFirstEligibleEmptySlot(formation.slots, state.squad, player);
        }
      } else {
        slotToFill = findFirstEligibleEmptySlot(formation.slots, state.squad, player);
      }

      if (!slotToFill) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: `No eligible empty position available for ${player.playerName || player.name} (${player.specificPosition}) in this formation.`,
          },
        };
      }

      // 3. Validate position constraint
      if (!isPlayerEligibleForSlot(player, slotToFill.allowedPositions, slotToFill.category)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: `${player.playerName || player.name} (${player.specificPosition}) cannot play in the ${slotToFill.label} slot.`,
          },
        };
      }

      const prevPlayer = state.squad[slotToFill.id];
      const prevRollClub = state.currentRollClub;
      const prevRollEra = state.currentRollEra;
      const nextSquad: Record<string, Player | null> = {
        ...state.squad,
        [slotToFill.id]: player,
      };

      const historyItem: DraftHistoryItem = {
        slotId: slotToFill.id,
        previousPlayer: prevPlayer,
        newPlayer: player,
        previousRollClub: prevRollClub,
        previousRollEra: prevRollEra,
      };

      const totalDrafted = Object.values(nextSquad).filter((p) => p !== null).length;
      const isComplete = totalDrafted === 11;

      // Next empty slot targeting
      const nextEmpty = formation.slots.find((s) => s.id !== slotToFill!.id && nextSquad[s.id] === null);

      let simResult = state.simulationResult;
      if (isComplete) {
        const metrics = calculateSquadMetrics(nextSquad, formation, state.tacticalStyle);
        simResult = simulateChampionsLeagueRun(metrics, nextSquad, state.tacticalStyle);
      }

      return {
        ...state,
        squad: nextSquad,
        selectedSlotId: nextEmpty ? nextEmpty.id : null,
        history: [...state.history, historyItem],
        status: isComplete ? 'completed' : 'drafting',
        isLocked: isComplete,
        awaitingNextRoll: !isComplete,
        simulationResult: simResult,
        campaignStep: 0,
        isResultsOpen: isComplete,
        notification: {
          type: 'success',
          message: `${player.playerName || player.name} drafted to ${slotToFill.label}! ${
            isComplete ? 'XI complete and locked (11/11) — launch your European Campaign!' : 'Roll for your next challenge.'
          }`,
        },
      };
    }

    case 'MOVE_PLAYER': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Players cannot be moved after lineup is complete.',
          },
        };
      }
      const { fromSlotId, toSlotId } = action.payload;
      if (fromSlotId === toSlotId) return state;
      const formation = getFormationById(state.formationId);
      const player = state.squad[fromSlotId];
      if (!player) return state;

      const targetSlot = formation.slots.find((s) => s.id === toSlotId);
      if (!targetSlot) return state;

      // Target must be empty for simple move
      if (state.squad[toSlotId] !== null) return state;

      // Validate position compatibility
      if (!isPlayerEligibleForSlot(player, targetSlot.allowedPositions, targetSlot.category)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: `${player.playerName || player.name} (${player.specificPosition}) cannot play in the ${targetSlot.label} slot.`,
          },
        };
      }

      const nextSquad = {
        ...state.squad,
        [fromSlotId]: null,
        [toSlotId]: player,
      };

      const metrics = calculateSquadMetrics(nextSquad, formation, state.tacticalStyle);
      const isComplete = metrics.totalDrafted === 11;
      let simResult = state.simulationResult;
      if (isComplete) {
        simResult = simulateChampionsLeagueRun(metrics, nextSquad, state.tacticalStyle);
      }

      return {
        ...state,
        squad: nextSquad,
        selectedSlotId: null,
        simulationResult: simResult,
        notification: {
          type: 'success',
          message: `Moved ${player.playerName || player.name} to ${targetSlot.label}!`,
        },
      };
    }

    case 'SWAP_PLAYERS': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Players cannot be swapped after lineup is complete.',
          },
        };
      }
      const { slotIdA, slotIdB } = action.payload;
      if (slotIdA === slotIdB) return state;
      const formation = getFormationById(state.formationId);
      const playerA = state.squad[slotIdA];
      const playerB = state.squad[slotIdB];
      if (!playerA || !playerB) return state;

      const slotA = formation.slots.find((s) => s.id === slotIdA);
      const slotB = formation.slots.find((s) => s.id === slotIdB);
      if (!slotA || !slotB) return state;

      // Both players must be compatible with each other's slot
      const isAEligibleForB = isPlayerEligibleForSlot(playerA, slotB.allowedPositions, slotB.category);
      const isBEligibleForA = isPlayerEligibleForSlot(playerB, slotA.allowedPositions, slotA.category);

      if (!isAEligibleForB || !isBEligibleForA) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: `Cannot swap: position constraints not satisfied for both players.`,
          },
        };
      }

      const nextSquad = {
        ...state.squad,
        [slotIdA]: playerB,
        [slotIdB]: playerA,
      };

      const metrics = calculateSquadMetrics(nextSquad, formation, state.tacticalStyle);
      const isComplete = metrics.totalDrafted === 11;
      let simResult = state.simulationResult;
      if (isComplete) {
        simResult = simulateChampionsLeagueRun(metrics, nextSquad, state.tacticalStyle);
      }

      return {
        ...state,
        squad: nextSquad,
        selectedSlotId: null,
        simulationResult: simResult,
        notification: {
          type: 'success',
          message: `Swapped positions between ${playerA.playerName || playerA.name} and ${playerB.playerName || playerB.name}!`,
        },
      };
    }

    case 'REMOVE_PLAYER': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Players cannot be removed after lineup is complete.',
          },
        };
      }
      const existing = state.squad[action.payload];
      if (!existing) return state;

      const nextSquad = {
        ...state.squad,
        [action.payload]: null,
      };

      const historyItem: DraftHistoryItem = {
        slotId: action.payload,
        previousPlayer: existing,
        newPlayer: null,
      };

      return {
        ...state,
        squad: nextSquad,
        history: [...state.history, historyItem],
        status: 'drafting',
        awaitingNextRoll: false,
        simulationResult: null,
        campaignStep: 0,
        notification: {
          type: 'info',
          message: `${existing.playerName || existing.name} removed from ${action.payload.toUpperCase()}.`,
        },
      };
    }

    case 'UNDO_DRAFT': {
      if (isLineupLocked(state)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Lineup is locked (11/11). Reset the draft to build a new team.',
          },
        };
      }
      if (state.history.length === 0) {
        return {
          ...state,
          notification: {
            type: 'info',
            message: 'No drafting actions to undo.',
          },
        };
      }

      const last = state.history[state.history.length - 1];
      const nextSquad = {
        ...state.squad,
        [last.slotId]: last.previousPlayer,
      };

      return {
        ...state,
        squad: nextSquad,
        history: state.history.slice(0, state.history.length - 1),
        currentRollClub: last.previousRollClub || state.currentRollClub,
        currentRollEra: last.previousRollEra || state.currentRollEra,
        selectedSlotId: last.slotId,
        status: 'drafting',
        awaitingNextRoll: false,
        simulationResult: null,
        campaignStep: 0,
        notification: {
          type: 'info',
          message: 'Last action undone.',
        },
      };
    }

    case 'OPEN_RESET_CONFIRM': {
      return {
        ...state,
        isResetConfirmOpen: true,
      };
    }

    case 'CLOSE_RESET_CONFIRM': {
      return {
        ...state,
        isResetConfirmOpen: false,
      };
    }

    case 'RESET_DRAFT': {
      const formation = getFormationById(state.formationId);
      const challenge = getRandomClubSeasonChallenge();
      return {
        ...state,
        squad: initializeSquad(formation),
        selectedSlotId: null,
        currentRollClub: challenge.club,
        currentRollEra: challenge.season,
        rerollsRemaining: 3,
        awaitingNextRoll: false,
        history: [],
        status: 'setup',
        isLocked: false,
        simulationResult: null,
        campaignStep: 0,
        campaignSeed: generateCampaignSeed(),
        campaignTournament: null,
        isResultsOpen: false,
        isResetConfirmOpen: false,
        notification: {
          type: 'info',
          message: 'Draft reset. All positions are open.',
        },
      };
    }

    case 'RUN_SIMULATION': {
      const totalDrafted = Object.values(state.squad).filter((p) => p !== null).length;
      if (totalDrafted < 11) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'The campaign can only be launched once your Starting XI is complete (11/11).',
          },
        };
      }
      const seed = state.campaignSeed || generateCampaignSeed();
      const isAuto = state.campaignPlayMode === 'automatic';
      const tourney = isAuto
        ? generateCampaignTournament(state.squad, seed)
        : createPendingCampaignTournament(state.squad, seed);
      const step = isAuto ? 4 : 0;
      const sim = createSimulationResultFromTournament(tourney);
      return {
        ...state,
        campaignSeed: seed,
        campaignTournament: tourney,
        simulationResult: sim,
        campaignStep: step,
        isResultsOpen: true,
      };
    }

    case 'SIMULATE_NEXT_MATCH': {
      const totalDrafted = Object.values(state.squad).filter((p) => p !== null).length;
      if (totalDrafted < 11) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Cannot simulate matches before your XI is complete.',
          },
        };
      }
      const seed = state.campaignSeed || generateCampaignSeed();
      let tourney = state.campaignTournament;
      if (!tourney) {
        tourney = generateCampaignTournament(state.squad, seed);
      }
      const currentStep = state.campaignStep || 0;
      const alreadyPlayed = tourney.matches.slice(0, currentStep);
      const alreadyLost = alreadyPlayed.some((m) => !m.won);
      const alreadyEliminated = tourney.isEliminated && currentStep >= tourney.matches.length;

      // Knockout progression guard: block any advance if already eliminated or completed
      if (alreadyLost || alreadyEliminated || (tourney.isCompleted && currentStep >= tourney.matches.length)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Your team has been eliminated from the competition. Replay the campaign to try again.',
          },
        };
      }

      const nextStep = Math.min(tourney.matches.length, currentStep + 1);
      const playedSoFar = tourney.matches.slice(0, nextStep);
      const justPlayedMatch = playedSoFar[nextStep - 1];
      const hasJustLost = justPlayedMatch ? !justPlayedMatch.won : false;
      const currentSummary = computeCampaignSummary(playedSoFar);
      const isDone = hasJustLost || nextStep >= tourney.matches.length || nextStep >= 4;

      const updatedTourney: CampaignTournament = {
        ...tourney,
        revealedCount: nextStep,
        isCompleted: isDone,
        isEliminated: currentSummary.isEliminated,
        eliminatedRound: currentSummary.eliminatedRound,
        summary: currentSummary,
      };
      const sim = createSimulationResultFromTournament(updatedTourney);
      return {
        ...state,
        campaignSeed: seed,
        campaignTournament: updatedTourney,
        simulationResult: sim,
        campaignStep: nextStep,
        isResultsOpen: true,
      };
    }

    case 'SIMULATE_ALL_MATCHES': {
      const totalDrafted = Object.values(state.squad).filter((p) => p !== null).length;
      if (totalDrafted < 11) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Cannot simulate matches before your XI is complete.',
          },
        };
      }
      const seed = state.campaignSeed || generateCampaignSeed();
      const tourney = state.campaignTournament || generateCampaignTournament(state.squad, seed);

      const currentStep = state.campaignStep || 0;
      const alreadyPlayed = tourney.matches.slice(0, currentStep);
      if (alreadyPlayed.some((m) => !m.won)) {
        return {
          ...state,
          notification: {
            type: 'error',
            message: 'Your team has already been eliminated from the competition.',
          },
        };
      }

      const allRevealed: CampaignTournament = {
        ...tourney,
        revealedCount: tourney.matches.length,
        isCompleted: true,
        summary: computeCampaignSummary(tourney.matches),
      };
      const sim = createSimulationResultFromTournament(allRevealed);
      return {
        ...state,
        campaignSeed: seed,
        campaignTournament: allRevealed,
        simulationResult: sim,
        campaignStep: 4,
        isResultsOpen: true,
      };
    }

    case 'REPLAY_CAMPAIGN': {
      const totalDrafted = Object.values(state.squad).filter((p) => p !== null).length;
      if (totalDrafted < 11) return state;
      const seed = state.campaignSeed || generateCampaignSeed();
      const isAuto = state.campaignPlayMode === 'automatic';
      const tourney = isAuto
        ? generateCampaignTournament(state.squad, seed)
        : createPendingCampaignTournament(state.squad, seed);
      const step = isAuto ? 4 : 0;
      const sim = createSimulationResultFromTournament(tourney);
      return {
        ...state,
        campaignTournament: tourney,
        simulationResult: sim,
        campaignStep: step,
        notification: {
          type: 'info',
          message: `Campaign replay active with seed ${seed}. Results are 100% deterministic.`,
        },
      };
    }

    case 'NEW_CAMPAIGN_SEED': {
      const newSeed = generateCampaignSeed();
      const isAuto = state.campaignPlayMode === 'automatic';
      const tourney = state.squad && Object.values(state.squad).filter((p) => p !== null).length === 11
        ? isAuto
          ? generateCampaignTournament(state.squad, newSeed)
          : createPendingCampaignTournament(state.squad, newSeed)
        : null;
      const step = isAuto && tourney ? 4 : 0;
      const sim = tourney ? createSimulationResultFromTournament(tourney) : null;
      return {
        ...state,
        campaignSeed: newSeed,
        campaignTournament: tourney,
        simulationResult: sim,
        campaignStep: step,
        notification: {
          type: 'info',
          message: `Drawn new campaign seed: ${newSeed}.`,
        },
      };
    }

    case 'SET_CAMPAIGN_PLAY_MODE': {
      if (action.payload === 'automatic' && state.campaignTournament && !state.campaignTournament.isCompleted) {
        const tourney = state.campaignTournament;
        const allRevealed: CampaignTournament = {
          ...tourney,
          revealedCount: tourney.matches.length,
          isCompleted: true,
          summary: computeCampaignSummary(tourney.matches),
        };
        const sim = createSimulationResultFromTournament(allRevealed);
        return {
          ...state,
          campaignPlayMode: 'automatic',
          campaignTournament: allRevealed,
          simulationResult: sim,
          campaignStep: 4,
        };
      }
      return {
        ...state,
        campaignPlayMode: action.payload,
      };
    }

    case 'SET_RESULTS_OPEN': {
      return {
        ...state,
        isResultsOpen: action.payload,
      };
    }

    case 'SET_DISCLAIMER_OPEN': {
      return {
        ...state,
        isDisclaimerOpen: action.payload,
      };
    }

    case 'SET_GAME_GUIDE_OPEN': {
      return {
        ...state,
        isGameGuideOpen: action.payload,
      };
    }

    case 'SET_NOTIFICATION': {
      return {
        ...state,
        notification: action.payload,
      };
    }

    case 'RESTORE_SAVED_STATE': {
      const merged: DraftState = {
        ...state,
        ...action.payload,
      };
      return {
        ...merged,
        isLocked: isLineupLocked(merged),
      };
    }

    default:
      return state;
  }
}
