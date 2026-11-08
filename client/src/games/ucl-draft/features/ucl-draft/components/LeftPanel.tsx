import React, { useMemo } from 'react';
import { Formation, Player, PitchSlot } from '../../../types/draft';
import { GameMode, TacticalStyle, GameStatus, DraftHistoryItem } from '../types';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import {
  getPlayerShirtNumber,
  isPlayerEligibleForSlot,
  getCardsForChallenge,
  isRealPlayerDrafted,
  formatPlayerPositions,
  getClubCode,
} from '../../../data/players';

interface LeftPanelProps {
  status: GameStatus;
  formations: Formation[];
  activeFormationId: string;
  mode: GameMode;
  tacticalStyle: TacticalStyle;
  drawnClub: string | null;
  drawnEra: string | null;
  rerollsRemaining: number;
  awaitingNextRoll: boolean;
  players: Player[];
  squad: Record<string, Player | null>;
  history?: DraftHistoryItem[];
  selectedSlot: PitchSlot | null;
  selectedPlayerForDraft?: Player | null;
  onSelectPlayerForDraft: (player: Player | null) => void;
  onSelectFormation: (id: string) => void;
  onSelectStyle: (style: TacticalStyle) => void;
  onSelectMode: (mode: GameMode) => void;
  onRoll: () => void;
  onRollNextChallenge: () => void;
  onRerollClub: () => void;
  onRerollEra?: () => void;
  onDraftPlayer: (player: Player) => void;
  onSimulateTournament: () => void;
  onReset?: () => void;
  isLocked?: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  status,
  formations,
  activeFormationId,
  mode,
  tacticalStyle,
  drawnClub,
  drawnEra,
  rerollsRemaining,
  awaitingNextRoll,
  players,
  squad,
  history = [],
  selectedSlot,
  selectedPlayerForDraft,
  onSelectPlayerForDraft,
  onSelectFormation,
  onSelectStyle,
  onSelectMode,
  onRoll,
  onRollNextChallenge,
  onRerollClub,
  onRerollEra,
  onDraftPlayer,
  onSimulateTournament,
  onReset,
  isLocked = false,
}) => {
  const currentFormation = formations.find((f) => f.id === activeFormationId) || formations[0];
  const draftedCount = Object.values(squad).filter((p) => p !== null).length;
  const isLineupComplete = draftedCount === 11 || isLocked || status === 'completed';

  // Exactly 11 cards for the drawn club + season challenge
  const challengeCards = useMemo(() => {
    return drawnClub && drawnEra ? getCardsForChallenge(drawnClub, drawnEra) : [];
  }, [drawnClub, drawnEra]);

  // Sort all available players by rating descending (highest-rated first, stable for equal ratings)
  const candidatePool = useMemo(() => {
    const raw = challengeCards.length > 0 ? challengeCards : players.slice(0, 11);
    return [...raw].sort((a, b) => {
      const ratingA = a.editorialRating ?? a.rating ?? 0;
      const ratingB = b.editorialRating ?? b.rating ?? 0;
      return ratingB - ratingA;
    });
  }, [challengeCards, players]);

  // Highest rating in candidate pool receives gold typography (matching 7a0.org)
  const maxRatingInPool = useMemo(() => {
    if (candidatePool.length === 0) return 0;
    return Math.max(...candidatePool.map((p) => p.editorialRating || p.rating || 0));
  }, [candidatePool]);

  // Chronologically ordered list of players drafted so far (for pinned top section)
  const pickedPlayers = useMemo(() => {
    const list: Player[] = [];
    const seen = new Set<string>();

    for (const h of history) {
      if (h.newPlayer && !seen.has(h.newPlayer.id)) {
        const isInSquad = Object.values(squad).some((p) => p?.id === h.newPlayer?.id);
        if (isInSquad) {
          list.push(h.newPlayer);
          seen.add(h.newPlayer.id);
        }
      }
    }

    for (const p of Object.values(squad)) {
      if (p && !seen.has(p.id)) {
        list.push(p);
        seen.add(p.id);
      }
    }

    return list;
  }, [history, squad]);

  return (
    <div className="bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[560px] transition-colors duration-200">
      {/* STATE A: PRE-DRAFT SETUP */}
      {status === 'setup' && (
        <div className="space-y-4">
          {/* Formations Grid */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block mb-1.5">
              FORMATION
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {formations.map((f) => {
                const active = f.id === activeFormationId;
                return (
                  <button
                    key={f.id}
                    onClick={() => onSelectFormation(f.id)}
                    className={`py-1.5 text-xs font-bold font-heading rounded-lg btn-lift cursor-pointer ${
                      active
                        ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.38)]'
                        : 'bg-[#F6F8FA] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white border border-[#DCE3EA] dark:border-[#162E3D]'
                    }`}
                  >
                    {f.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tactical Style */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block mb-1.5">
              STYLE
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(['Defensive', 'Balanced', 'Attacking'] as const).map((styleOption) => {
                const val = styleOption.toLowerCase() as TacticalStyle;
                const active =
                  tacticalStyle === val ||
                  (val === 'defensive' && (tacticalStyle === 'pressing' || tacticalStyle === 'defensive')) ||
                  (val === 'attacking' && (tacticalStyle === 'counter' || tacticalStyle === 'attacking')) ||
                  (val === 'balanced' && (tacticalStyle === 'balanced' || tacticalStyle === 'control'));
                return (
                  <button
                    key={styleOption}
                    onClick={() => onSelectStyle(val)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg font-heading btn-lift cursor-pointer ${
                      active
                        ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.38)]'
                        : 'bg-[#F6F8FA] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white border border-[#DCE3EA] dark:border-[#162E3D]'
                    }`}
                  >
                    {styleOption}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode / Difficulty */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block mb-1.5">
              MODE • DIFFICULTY
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => onSelectMode('classic')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg font-heading uppercase btn-lift cursor-pointer ${
                  mode === 'classic'
                    ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.38)]'
                    : 'bg-[#F6F8FA] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white border border-[#DCE3EA] dark:border-[#162E3D]'
                }`}
              >
                Classic
              </button>
              <button
                onClick={() => onSelectMode('almanac')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg font-heading uppercase btn-lift cursor-pointer ${
                  mode === 'almanac'
                    ? 'bg-[#172638] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.38)]'
                    : 'bg-[#F6F8FA] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white border border-[#DCE3EA] dark:border-[#162E3D]'
                }`}
              >
                Almanac
              </button>
            </div>
          </div>

          {/* Roll Card Box with Giant Button */}
          <div className="pt-4 mt-auto">
            <div className="p-4 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl text-center space-y-3">
              <p className="text-xs text-[#697789] dark:text-[#6A889C] font-medium">
                Roll to draw a European powerhouse club
              </p>
              <button
                onClick={onRoll}
                className="w-full py-4 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] active:scale-98 text-white dark:text-slate-950 font-sports text-3xl font-black uppercase tracking-wider shadow-sm dark:shadow-[0_4px_24px_-2px_rgba(0,210,106,0.45)] dark:hover:shadow-[0_4px_30px_0px_rgba(0,210,106,0.65)] btn-lift-primary flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ROLL</span>
                <span className="text-2xl">🎲</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE B: ACTIVE DRAFTING (Player-First Selection Workflow with Refined Typography) */}
      {status === 'drafting' && !isLineupComplete && (
        <div className="space-y-3 flex-1 flex flex-col">
          {/* 1. Drawn Header: Prominent Draw Name & Competition (Matching Reference Screenshot) */}
          <div className="pb-3 border-b border-[#DCE3EA] dark:border-[#162E3D]">
            <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#697789] dark:text-[#6A889C] block">
              DRAWN
            </span>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="text-sm font-mono font-bold text-[#697789] dark:text-[#6A889C] uppercase shrink-0">
                {drawnClub ? getClubCode(drawnClub) : 'RMA'}
              </span>
              <h3 className="font-sports text-4xl sm:text-5xl font-black uppercase text-[#172638] dark:text-white tracking-tight leading-none truncate">
                {drawnClub || 'Real Madrid'}
              </h3>
            </div>
            <div className="font-sports text-2xl sm:text-3xl font-black uppercase text-[#10B981] dark:text-[#00FFA3] tracking-tight leading-tight mt-2">
              Champions League
            </div>
            <div className="font-sports text-2xl sm:text-3xl font-black uppercase text-[#10B981] dark:text-[#00FFA3] tracking-tight leading-none">
              {drawnEra || '2026-27'}
            </div>
          </div>

          {/* 2. Reroll Bar: Full Width Single Action */}
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block">
              NOT CONVINCED? REROLL • {rerollsRemaining} LEFT
            </span>
            <button
              onClick={onRerollClub}
              disabled={rerollsRemaining <= 0 || awaitingNextRoll}
              className="w-full py-2.5 px-4 text-xs font-bold uppercase font-heading bg-[#F6F8FA] dark:bg-[#0B1E2B] hover:bg-[#E5E9F0] dark:hover:bg-[#122A3B] text-[#172638] dark:text-white border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 btn-lift cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#10B981] dark:text-[#00FFA3]" />
              <span>↻ ANOTHER CLUB</span>
            </button>
          </div>

          {/* 3. Awaiting Next Roll Banner */}
          {awaitingNextRoll ? (
            <div className="my-auto py-5 text-center space-y-3 bg-[#F6F8FA] dark:bg-[#0B1E2B] p-4 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D]">
              <div className="w-10 h-10 rounded-full bg-[#10B981]/10 dark:bg-[#00D26A]/20 text-[#10B981] dark:text-[#00FFA3] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm uppercase text-[#172638] dark:text-white">
                  Selection Locked! ({draftedCount}/11)
                </h4>
                <p className="text-xs text-[#697789] dark:text-[#6A889C] mt-0.5">
                  Roll to draw your next European club challenge.
                </p>
              </div>

              <button
                onClick={onRollNextChallenge}
                className="w-full py-3.5 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] active:scale-98 text-white dark:text-slate-950 font-sports text-2xl font-black uppercase tracking-wider shadow-sm dark:shadow-[0_4px_22px_-2px_rgba(0,210,106,0.45)] dark:hover:shadow-[0_4px_30px_0px_rgba(0,210,106,0.65)] btn-lift-primary flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ROLL NEXT CHALLENGE</span>
                <span className="text-xl">🎲</span>
              </button>
            </div>
          ) : (
            /* 4. Candidate & Picked Players List: Noticeably Larger Names & Ratings */
            <div className="flex-1 flex flex-col pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block">
                  PICK A PLAYER
                </span>
                {selectedPlayerForDraft && (
                  <button
                    onClick={() => onSelectPlayerForDraft(null)}
                    className="text-[10px] uppercase font-bold text-amber-500 hover:text-amber-400 underline btn-lift cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>

              <div className="flex-1 max-h-[440px] overflow-y-auto space-y-2 pr-1 divide-y divide-[#DCE3EA]/40 dark:divide-[#162E3D]/50">
                {/* 4a. Pinned Picked Players from earlier rounds */}
                {pickedPlayers.map((player) => {
                  const shirtNum = getPlayerShirtNumber(player);
                  const positionsStr = formatPlayerPositions(player);
                  const clubCode = getClubCode(player.club);
                  const ratingVal = player.editorialRating || player.rating;

                  return (
                    <div
                      key={`picked-${player.id}`}
                      className="py-2.5 px-3 rounded-xl bg-[#F6F8FA] dark:bg-[#06141D] border border-[#DCE3EA]/60 dark:border-[#162E3D] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs sm:text-sm font-mono text-[#697789] dark:text-[#6A889C] shrink-0 min-w-[26px]">
                          #{shirtNum}
                        </span>
                        <span className="font-heading font-black text-sm sm:text-base text-[#172638] dark:text-white truncate max-w-[130px]">
                          {player.playerName || player.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-amber-500 dark:text-amber-400 uppercase tracking-tight block">
                            PICKED • {clubCode} {player.season || '2026-27'}
                          </span>
                          <span className="text-[10px] font-mono text-[#697789] dark:text-[#6A889C]">
                            {positionsStr}
                          </span>
                        </div>
                        <span className="font-sports text-xl sm:text-2xl font-black text-[#172638] dark:text-white min-w-[30px] text-right leading-none">
                          {mode === 'classic' ? ratingVal : '★'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 4b. Challenge Candidates for the current turn (11 cards) */}
                {candidatePool.map((player) => {
                  const isAlreadyDrafted = isRealPlayerDrafted(squad, player.playerId || player.id);

                  const hasOpenSlot = currentFormation.slots.some(
                    (s) => !squad[s.id] && isPlayerEligibleForSlot(player, s.allowedPositions, s.category)
                  );
                  const shirtNum = getPlayerShirtNumber(player);
                  const positionsStr = formatPlayerPositions(player);
                  const playerRating = player.editorialRating || player.rating || 0;
                  const isTopRated = playerRating === maxRatingInPool && maxRatingInPool > 0;
                  const isSelected = selectedPlayerForDraft?.id === player.id;

                  // Disabled: ALREADY DRAFTED
                  if (isAlreadyDrafted) {
                    return (
                      <div
                        key={player.id}
                        className="py-2.5 px-3 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B]/50 opacity-40 flex items-center justify-between text-xs cursor-not-allowed border border-transparent"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs sm:text-sm font-mono text-[#697789] dark:text-[#6A889C] shrink-0 min-w-[26px]">
                            #{shirtNum}
                          </span>
                          <span className="font-heading font-black text-sm sm:text-base text-[#697789] dark:text-[#6A889C] truncate max-w-[130px]">
                            {player.playerName || player.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight block">
                            ALREADY DRAFTED
                          </span>
                          <span className="text-[10px] font-mono text-[#697789] dark:text-[#6A889C]">
                            {positionsStr}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Disabled: NO OPEN POSITION
                  if (!hasOpenSlot) {
                    return (
                      <div
                        key={player.id}
                        className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#081923] opacity-40 flex items-center justify-between text-xs cursor-not-allowed border border-transparent"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs sm:text-sm font-mono text-[#697789] dark:text-[#6A889C] shrink-0 min-w-[26px]">
                            #{shirtNum}
                          </span>
                          <span
                            className={`font-heading font-black text-sm sm:text-base truncate max-w-[130px] ${
                              isTopRated ? 'text-[#E5B842] dark:text-amber-400' : 'text-[#697789] dark:text-[#6A889C]'
                            }`}
                          >
                            {player.playerName || player.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight block">
                              NO OPEN POSITION
                            </span>
                            <span className="text-[10px] font-mono text-[#697789] dark:text-[#6A889C]">
                              {positionsStr}
                            </span>
                          </div>
                          <span className="font-sports text-xl sm:text-2xl font-black text-[#697789] dark:text-[#6A889C] min-w-[30px] text-right leading-none">
                            {mode === 'classic' ? playerRating : '★'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Eligible Candidate: Player-First Selection
                  // Clicking selects player, highlights eligible positions on the pitch
                  return (
                    <button
                      key={player.id}
                      onClick={() => {
                        if (isSelected) {
                          onSelectPlayerForDraft(null);
                        } else {
                          onSelectPlayerForDraft(player);
                        }
                      }}
                      className={`w-full py-3 px-3 rounded-xl flex items-center justify-between transition-all duration-180 ease-out group cursor-pointer text-left border ${
                        isSelected
                          ? 'bg-[#10B981] dark:bg-[#00D26A] text-white border-transparent shadow-[0_0_16px_rgba(0,210,106,0.45)] ring-2 ring-white/20'
                          : 'bg-white dark:bg-[#081923] text-[#172638] dark:text-white border-[#DCE3EA]/60 dark:border-[#162E3D]/80 hover:bg-[#10B981]/10 dark:hover:bg-[#00D26A]/15 hover:border-[#10B981]/60 dark:hover:border-[#00D26A]/60 hover:shadow-[inset_2px_0_0_0_#10B981] dark:hover:shadow-[inset_2px_0_0_0_#00D26A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-mono font-bold shrink-0 min-w-[26px] transition-colors duration-180 ${
                            isSelected
                              ? 'text-white/80'
                              : 'text-[#697789] dark:text-[#6A889C] group-hover:text-[#10B981] dark:group-hover:text-[#00FFA3]'
                          }`}
                        >
                          #{shirtNum}
                        </span>
                        <span
                          className={`font-heading font-black text-base sm:text-lg truncate max-w-[145px] sm:max-w-[160px] tracking-tight ${
                            isSelected
                              ? 'text-white'
                              : isTopRated
                              ? 'text-[#E5B842] dark:text-amber-400'
                              : 'text-[#172638] dark:text-white'
                          }`}
                        >
                          {player.playerName || player.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span
                          className={`text-xs font-mono font-bold px-2 py-0.5 rounded transition-colors duration-180 ${
                            isSelected
                              ? 'text-white bg-black/25'
                              : 'text-[#697789] dark:text-[#6A889C] bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] group-hover:border-[#10B981]/40 dark:group-hover:border-[#00D26A]/40'
                          }`}
                        >
                          {positionsStr}
                        </span>
                        <span
                          className={`font-sports text-2xl sm:text-3xl font-black min-w-[34px] text-right leading-none ${
                            isSelected
                              ? 'text-white'
                              : 'text-[#172638] dark:text-white'
                          }`}
                        >
                          {mode === 'classic' ? playerRating : '★'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE C: LINEUP COMPLETE 11/11 */}
      {isLineupComplete && (
        <div className="space-y-4 my-auto py-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 mx-auto">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <span className="text-[11px] uppercase font-bold tracking-widest font-heading">
              LINEUP COMPLETE • LOCKED
            </span>
          </div>

          <div className="font-sports text-7xl font-black text-[#172638] dark:text-white tracking-tight leading-none">
            11/11
          </div>

          <p className="text-xs text-[#697789] dark:text-[#6A889C] max-w-xs mx-auto">
            Your Starting XI is locked in. Launch your Champions League campaign to simulate the knockout run and chase immortality!
          </p>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={onSimulateTournament}
              className="w-full py-4 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] active:scale-98 text-white dark:text-slate-950 font-sports text-2xl font-black uppercase tracking-wider shadow-sm dark:shadow-[0_4px_24px_-2px_rgba(0,210,106,0.45)] dark:hover:shadow-[0_4px_30px_0px_rgba(0,210,106,0.65)] btn-lift-primary flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>SIMULATE THE TOURNAMENT</span>
              <span className="text-2xl">➔</span>
            </button>

            {onReset && (
              <button
                onClick={onReset}
                title="Reset Starting XI and start new draft"
                className="w-full py-3.5 px-4 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D] bg-[#F6F8FA] dark:bg-[#0B1E2B] hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-300 dark:hover:border-rose-800 text-[#697789] dark:text-[#A0B3C6] hover:text-rose-600 dark:hover:text-rose-400 font-sports text-xl font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-xs cursor-pointer btn-lift"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET LINEUP</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
