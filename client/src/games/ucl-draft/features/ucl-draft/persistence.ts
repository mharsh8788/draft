import { DraftState, GameMode, DraftChallenge, TacticalStyle } from './types';
import { FORMATIONS, DEFAULT_FORMATION_ID } from '../../data/formations';
import { PLAYERS, UCL_2026_27_CLUBS } from '../../data/players';
import { getFormationById, initializeSquad } from '../../utils/draftLogic';
import { Player, SquadPicks } from '../../types/draft';

export const DRAFT_STORAGE_KEY = 'ucl_draft_7a0_v2';

export function saveDraftState(state: DraftState): void {
  try {
    const payload = {
      status: state.status,
      isLocked: Boolean(state.isLocked || state.status === 'completed' || Object.values(state.squad).filter(p => p !== null).length === 11),
      formationId: state.formationId,
      mode: state.mode,
      challenge: state.challenge,
      tacticalStyle: state.tacticalStyle,
      squadPlayerIds: Object.fromEntries(
        Object.entries(state.squad).map(([slotId, player]) => [slotId, player ? player.id : null])
      ),
      selectedSlotId: null,
      currentRollClub: state.currentRollClub,
      currentRollEra: state.currentRollEra,
      rerollsRemaining: state.rerollsRemaining,
      awaitingNextRoll: state.awaitingNextRoll,
      simulationResult: state.simulationResult,
      campaignStep: state.campaignStep,
      campaignSeed: state.campaignSeed,
      campaignPlayMode: state.campaignPlayMode,
      campaignTournament: state.campaignTournament,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed persisting UCL Draft state:', err);
  }
}

export function loadDraftState(): Partial<DraftState> | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Validate formation
    const formationId =
      parsed.formationId && FORMATIONS.some((f) => f.id === parsed.formationId)
        ? parsed.formationId
        : DEFAULT_FORMATION_ID;

    const formation = getFormationById(formationId);
    const squad: SquadPicks = initializeSquad(formation);

    // Rehydrate players
    if (parsed.squadPlayerIds && typeof parsed.squadPlayerIds === 'object') {
      for (const slot of formation.slots) {
        const pId = parsed.squadPlayerIds[slot.id];
        if (typeof pId === 'string') {
          const canonical = PLAYERS.find((p) => p.id === pId);
          if (canonical) {
            squad[slot.id] = canonical;
          }
        }
      }
    }

    const mode: GameMode = parsed.mode === 'almanac' ? 'almanac' : 'classic';
    const challenge: DraftChallenge = parsed.challenge === 'club-draw' ? 'club-draw' : 'scout';
    const tacticalStyle: TacticalStyle = [
      'defensive',
      'balanced',
      'attacking',
      'control',
      'pressing',
      'counter',
    ].includes(parsed.tacticalStyle)
      ? parsed.tacticalStyle
      : 'balanced';

    const draftedCount = Object.values(squad).filter((p) => p !== null).length;
    const isCompleted = parsed.status === 'completed' || draftedCount === 11;

    const currentRollClub =
      typeof parsed.currentRollClub === 'string' &&
      UCL_2026_27_CLUBS.some((c) => c.toLowerCase() === parsed.currentRollClub.toLowerCase())
        ? parsed.currentRollClub
        : null;

    return {
      status: isCompleted ? 'completed' : parsed.status === 'drafting' ? 'drafting' : 'setup',
      isLocked: Boolean(parsed.isLocked || isCompleted),
      formationId,
      mode,
      challenge,
      tacticalStyle,
      squad,
      selectedSlotId: null,
      currentRollClub,
      currentRollEra: '2026-27',
      rerollsRemaining: typeof parsed.rerollsRemaining === 'number' ? parsed.rerollsRemaining : 3,
      awaitingNextRoll: typeof parsed.awaitingNextRoll === 'boolean' ? parsed.awaitingNextRoll : false,
      simulationResult: parsed.simulationResult || null,
      campaignStep: typeof parsed.campaignStep === 'number' ? parsed.campaignStep : 0,
      campaignSeed: typeof parsed.campaignSeed === 'string' ? parsed.campaignSeed : '',
      campaignPlayMode: parsed.campaignPlayMode === 'match-by-match' ? 'match-by-match' : 'automatic',
      campaignTournament: parsed.campaignTournament || null,
    };
  } catch (err) {
    console.warn('Failed loading persisted UCL Draft state:', err);
    return null;
  }
}

export function clearDraftState(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed clearing UCL Draft state:', err);
  }
}
