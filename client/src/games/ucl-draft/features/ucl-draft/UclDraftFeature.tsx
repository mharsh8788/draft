import React, { useReducer, useEffect, useMemo, useRef, useState } from 'react';
import { Player } from '../../types/draft';
import { uclDraftReducer, initialDraftState, isLineupLocked } from './uclDraftReducer';
import { loadDraftState, saveDraftState } from './persistence';
import { calculateSquadMetrics } from './scoring';
import { getFormationById } from '../../utils/draftLogic';
import { FORMATIONS } from '../../data/formations';
import { PLAYERS } from '../../data/players';
import { GameHeader } from './components/GameHeader';
import { TopHeroSection } from './components/TopHeroSection';
import { TacticalPitch } from './components/TacticalPitch';
import { LeftPanel } from './components/LeftPanel';
import { RightScorecard } from './components/RightScorecard';
import { CampaignSimulationSection } from './components/CampaignSimulationSection';
import { DisclaimerModal } from './components/DisclaimerModal';
import { GameGuideModal } from './components/GameGuideModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export interface UclDraftFeatureProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const UclDraftFeature: React.FC<UclDraftFeatureProps> = ({
  theme: controlledTheme,
  onToggleTheme: controlledToggleTheme,
}) => {
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('ucl_draft_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark'; // matches 7a0.org default in screenshots
  });

  const theme = controlledTheme ?? internalTheme;

  const [state, dispatch] = useReducer(uclDraftReducer, initialDraftState, () => {
    const saved = loadDraftState();
    return saved ? { ...initialDraftState, ...saved } : initialDraftState;
  });

  const [selectedPlayerForDraft, setSelectedPlayerForDraft] = useState<Player | null>(null);

  const draftZoneRef = useRef<HTMLDivElement>(null);
  const campaignZoneRef = useRef<HTMLDivElement>(null);

  const formation = useMemo(() => getFormationById(state.formationId), [state.formationId]);

  const metrics = useMemo(() => {
    return calculateSquadMetrics(state.squad, formation, state.tacticalStyle);
  }, [state.squad, formation, state.tacticalStyle]);

  const isLocked = useMemo(() => isLineupLocked(state), [state]);

  // Ensure candidate selection is cleared as soon as lineup is locked
  useEffect(() => {
    if (isLocked && selectedPlayerForDraft) {
      setSelectedPlayerForDraft(null);
    }
  }, [isLocked, selectedPlayerForDraft]);

  const selectedSlot = useMemo(() => {
    if (!state.selectedSlotId) return null;
    return formation.slots.find((s) => s.id === state.selectedSlotId) || null;
  }, [state.selectedSlotId, formation]);

  // Persist state to localStorage
  useEffect(() => {
    saveDraftState(state);
  }, [state]);

  // Persist theme to localStorage
  const handleToggleTheme = () => {
    if (controlledToggleTheme) {
      controlledToggleTheme();
    } else {
      setInternalTheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark';
        try {
          localStorage.setItem('ucl_draft_theme', next);
        } catch {}
        return next;
      });
    }
  };

  // Dismiss notification banner automatically
  useEffect(() => {
    if (!state.notification) return;
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_NOTIFICATION', payload: null });
    }, 4000);
    return () => clearTimeout(timer);
  }, [state.notification]);

  const scrollToDraftZone = () => {
    if (state.status === 'setup') {
      dispatch({ type: 'START_GAME' });
    }
    draftZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSimulateTournament = () => {
    dispatch({ type: 'RUN_SIMULATION' });
    setTimeout(() => {
      campaignZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handlePlacePlayerInSlot = (player: Player, slotId: string) => {
    if (isLocked) return;
    dispatch({ type: 'DRAFT_PLAYER', payload: { player, targetSlotId: slotId } });
    setSelectedPlayerForDraft(null);
  };

  const handleIneligibleSlotClick = (player: Player, slotLabel: string) => {
    if (isLocked) return;
    dispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        type: 'error',
        message: `${player.playerName || player.name} cannot play in the ${slotLabel} position.`,
      },
    });
  };

  const handleResetClick = () => {
    setSelectedPlayerForDraft(null);
    if (metrics.totalDrafted > 0) {
      dispatch({ type: 'OPEN_RESET_CONFIRM' });
    } else {
      dispatch({ type: 'RESET_DRAFT' });
    }
  };

  return (
    <div
      data-theme={theme}
      className={`min-h-screen flex flex-col ${
        theme === 'dark' ? 'dark bg-[#06121A] text-white' : 'bg-[#F6F8FA] text-[#172638]'
      } antialiased transition-colors duration-200 overflow-x-hidden`}
    >
      {/* 1. Header (matching Screenshot 1) */}
      <GameHeader
        metrics={metrics}
        mode={state.mode}
        theme={theme}
        canUndo={state.history.length > 0 && !isLocked}
        onUndo={() => dispatch({ type: 'UNDO_DRAFT' })}
        onReset={handleResetClick}
        onOpenDisclaimer={() => dispatch({ type: 'SET_DISCLAIMER_OPEN', payload: true })}
        onOpenGameGuide={() => dispatch({ type: 'SET_GAME_GUIDE_OPEN', payload: true })}
        onToggleMode={() =>
          dispatch({ type: 'SET_MODE', payload: state.mode === 'classic' ? 'almanac' : 'classic' })
        }
        onToggleTheme={handleToggleTheme}
      />

      {/* Floating Notification Toast */}
      {state.notification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 p-3.5 rounded-xl border shadow-lg text-xs sm:text-sm font-medium ${
              state.notification.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                : state.notification.type === 'success'
                ? 'bg-[#E6F4EA] dark:bg-emerald-950/80 border-[#A8DAB5] dark:border-emerald-800 text-[#137333] dark:text-[#00FFA3]'
                : 'bg-[#EDF4FF] dark:bg-blue-950/80 border-[#BFDBFE] dark:border-blue-900 text-[#1D4ED8] dark:text-cyan-300'
            }`}
          >
            {state.notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : state.notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#00FFA3] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#3478F6] dark:text-cyan-400 shrink-0" />
            )}
            <span>{state.notification.message}</span>
          </div>
        </div>
      )}

      {/* 2. Top Hero Section (matching Screenshot 1) */}
      <TopHeroSection
        formations={FORMATIONS}
        activeFormationId={state.formationId}
        mode={state.mode}
        onSelectFormation={(id) => {
          if (isLocked) {
            dispatch({
              type: 'SET_NOTIFICATION',
              payload: {
                type: 'error',
                message: 'Lineup is locked (11/11). Reset the draft to change formation.',
              },
            });
            return;
          }
          setSelectedPlayerForDraft(null);
          dispatch({ type: 'SET_FORMATION', payload: id });
        }}
        onSelectMode={(m) => dispatch({ type: 'SET_MODE', payload: m })}
        onPlayNow={scrollToDraftZone}
      />

      {/* 3. Main Draft Zone Section (matching Screenshots 2, 3, 4, 5) */}
      <section
        id="draft-zone"
        ref={draftZoneRef}
        className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 scroll-mt-16"
      >
        {/* Section Heading matching Screenshot 2 & 3 */}
        <div className="pb-2">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#697789] dark:text-[#6A889C]">
            DRAFT ZONE / START NOW
          </div>
          <h2 className="font-sports text-4xl sm:text-5xl font-black uppercase text-[#172638] dark:text-white tracking-tight leading-none mt-0.5">
            PLAY ROAD TO IMMORTALITY NOW
          </h2>
          <p className="text-xs sm:text-sm text-[#697789] dark:text-[#6A889C] mt-1 max-w-2xl leading-relaxed">
            Choose a mode, lock in a formation, and start building your UCL XI. Every turn gives you one squad, one decision, and one chance to keep the XI balanced.
          </p>
        </div>

        {/* The 3-Column Draft Workspace (matching 7a0.org: Left Controls, Center Tactical Pitch, Right Scorecard) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Column 1: Left Control & Draft Panel (3 cols on lg/xl) */}
          <div className="lg:col-span-3 xl:col-span-3">
            <LeftPanel
              status={state.status}
              formations={FORMATIONS}
              activeFormationId={state.formationId}
              mode={state.mode}
              tacticalStyle={state.tacticalStyle}
              drawnClub={state.currentRollClub}
              drawnEra={state.currentRollEra}
              rerollsRemaining={state.rerollsRemaining}
              awaitingNextRoll={state.awaitingNextRoll}
              players={PLAYERS}
              squad={state.squad}
              history={state.history}
              selectedSlot={selectedSlot}
              selectedPlayerForDraft={selectedPlayerForDraft}
              onSelectPlayerForDraft={(player) => {
                if (isLocked) return;
                setSelectedPlayerForDraft(player);
              }}
              onSelectFormation={(id) => {
                if (isLocked) {
                  dispatch({
                    type: 'SET_NOTIFICATION',
                    payload: {
                      type: 'error',
                      message: 'Lineup is locked (11/11). Reset the draft to change formation.',
                    },
                  });
                  return;
                }
                setSelectedPlayerForDraft(null);
                dispatch({ type: 'SET_FORMATION', payload: id });
              }}
              onSelectStyle={(st) => dispatch({ type: 'SET_TACTICAL_STYLE', payload: st })}
              onSelectMode={(m) => dispatch({ type: 'SET_MODE', payload: m })}
              onRoll={() => {
                if (isLocked) return;
                setSelectedPlayerForDraft(null);
                dispatch({ type: 'START_GAME' });
              }}
              onRollNextChallenge={() => {
                if (isLocked) return;
                setSelectedPlayerForDraft(null);
                dispatch({ type: 'ROLL_NEXT_CHALLENGE' });
              }}
              onRerollClub={() => {
                if (isLocked) return;
                setSelectedPlayerForDraft(null);
                dispatch({ type: 'REROLL_CLUB' });
              }}
              onRerollEra={() => {
                if (isLocked) return;
                setSelectedPlayerForDraft(null);
                dispatch({ type: 'REROLL_ERA' });
              }}
              onDraftPlayer={(player) => {
                if (isLocked) return;
                dispatch({ type: 'DRAFT_PLAYER', payload: { player } });
                setSelectedPlayerForDraft(null);
              }}
              onSimulateTournament={handleSimulateTournament}
              onReset={handleResetClick}
              isLocked={isLocked}
            />
          </div>

          {/* Column 2: Center Tactical Pitch (6 cols on lg/xl - prominent showcase) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <TacticalPitch
              formation={formation}
              squad={state.squad}
              selectedSlotId={state.selectedSlotId}
              mode={state.mode}
              selectedPlayerForDraft={selectedPlayerForDraft}
              isLocked={isLocked}
              onSelectSlot={(slotId) => {
                if (isLocked) return;
                dispatch({ type: 'SELECT_SLOT', payload: slotId });
              }}
              onRemovePlayer={(slotId) => {
                if (isLocked) return;
                dispatch({ type: 'REMOVE_PLAYER', payload: slotId });
              }}
              onMovePlayer={(fromSlotId, toSlotId) => {
                if (isLocked) return;
                dispatch({ type: 'MOVE_PLAYER', payload: { fromSlotId, toSlotId } });
              }}
              onSwapPlayers={(slotIdA, slotIdB) => {
                if (isLocked) return;
                dispatch({ type: 'SWAP_PLAYERS', payload: { slotIdA, slotIdB } });
              }}
              onPlacePlayerInSlot={handlePlacePlayerInSlot}
              onIneligibleSlotClick={handleIneligibleSlotClick}
            />
          </div>

          {/* Column 3: Right Scorecard (3 cols on lg/xl) */}
          <div className="lg:col-span-3 xl:col-span-3">
            <RightScorecard
              formation={formation}
              squad={state.squad}
              metrics={metrics}
              mode={state.mode}
            />
          </div>
        </div>

        {/* 4. Champions League Campaign Knockout Simulation (when 11/11 complete) */}
        {metrics.isComplete && state.simulationResult && (
          <div ref={campaignZoneRef} className="pt-6">
            <CampaignSimulationSection
              formation={formation}
              squad={state.squad}
              metrics={metrics}
              mode={state.mode}
              simulationResult={state.simulationResult}
              campaignStep={state.campaignStep}
              campaignSeed={state.campaignSeed}
              campaignPlayMode={state.campaignPlayMode}
              campaignTournament={state.campaignTournament}
              onNextMatch={() => dispatch({ type: 'SIMULATE_NEXT_MATCH' })}
              onSimulateAll={() => dispatch({ type: 'SIMULATE_ALL_MATCHES' })}
              onReplay={() => dispatch({ type: 'REPLAY_CAMPAIGN' })}
              onNewSeed={() => dispatch({ type: 'NEW_CAMPAIGN_SEED' })}
              onSetPlayMode={(m) => dispatch({ type: 'SET_CAMPAIGN_PLAY_MODE', payload: m })}
              onViewMyCard={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-[#DCE3EA] dark:border-[#162E3D] bg-white dark:bg-[#06121A] py-6 text-center text-xs text-[#697789] dark:text-[#6A889C] mt-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            ROAD TO IMMORTALITY — BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI • An original football draft game.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_GAME_GUIDE_OPEN', payload: true })}
              className="text-[#10B981] dark:text-[#00FFA3] hover:underline font-medium cursor-pointer"
            >
              How to Play Guide
            </button>
            <span>•</span>
            <button
              onClick={() => dispatch({ type: 'SET_DISCLAIMER_OPEN', payload: true })}
              className="text-[#3478F6] dark:text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              Editorial Notes & Data Sources
            </button>
            <span>•</span>
            <span>Fan Project • Not affiliated with UEFA</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <GameGuideModal
        isOpen={state.isGameGuideOpen}
        onClose={() => dispatch({ type: 'SET_GAME_GUIDE_OPEN', payload: false })}
      />

      <ResetConfirmModal
        isOpen={state.isResetConfirmOpen}
        draftedCount={metrics.totalDrafted}
        onConfirm={() => dispatch({ type: 'RESET_DRAFT' })}
        onCancel={() => dispatch({ type: 'CLOSE_RESET_CONFIRM' })}
      />

      <DisclaimerModal
        isOpen={state.isDisclaimerOpen}
        onClose={() => dispatch({ type: 'SET_DISCLAIMER_OPEN', payload: false })}
      />
    </div>
  );
};
