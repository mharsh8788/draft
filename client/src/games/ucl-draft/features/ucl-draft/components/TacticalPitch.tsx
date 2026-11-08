import React, { useState } from 'react';
import { Formation, PitchSlot, Player } from '../../../types/draft';
import { GameMode } from '../types';
import { X, ArrowLeftRight } from 'lucide-react';
import { getPlayerShirtNumber, isPlayerEligibleForSlot } from '../../../data/players';

interface TacticalPitchProps {
  formation: Formation;
  squad: Record<string, Player | null>;
  selectedSlotId: string | null;
  mode: GameMode;
  selectedPlayerForDraft?: Player | null;
  onSelectSlot: (slotId: string) => void;
  onRemovePlayer: (slotId: string) => void;
  onMovePlayer?: (fromSlotId: string, toSlotId: string) => void;
  onSwapPlayers?: (slotIdA: string, slotIdB: string) => void;
  onPlacePlayerInSlot?: (player: Player, slotId: string) => void;
  onIneligibleSlotClick?: (player: Player, slotLabel: string) => void;
  isLocked?: boolean;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  formation,
  squad,
  selectedSlotId,
  mode,
  selectedPlayerForDraft,
  onSelectSlot,
  onRemovePlayer,
  onMovePlayer,
  onSwapPlayers,
  onPlacePlayerInSlot,
  onIneligibleSlotClick,
  isLocked = false,
}) => {
  // Moving / swapping player state: which slot is currently tapped to move
  const [movingSlotId, setMovingSlotId] = useState<string | null>(null);

  const movingPlayer = movingSlotId ? squad[movingSlotId] : null;

  const handleSlotClick = (slot: PitchSlot) => {
    // If the lineup is locked permanently (11/11), all card clicks and selection interactions are disabled
    if (isLocked) {
      return;
    }

    const playerInSlot = squad[slot.id];

    // CASE 1: Player-First Selection workflow (candidate selected from left panel)
    if (selectedPlayerForDraft) {
      // Do not allow placing into an already occupied position
      if (playerInSlot) {
        return;
      }

      // Check position eligibility
      const isEligible = isPlayerEligibleForSlot(
        selectedPlayerForDraft,
        slot.allowedPositions,
        slot.category
      );

      if (isEligible) {
        onPlacePlayerInSlot?.(selectedPlayerForDraft, slot.id);
      } else {
        onIneligibleSlotClick?.(selectedPlayerForDraft, slot.label);
      }
      return;
    }

    // CASE 2: Currently moving a player already on the pitch
    if (movingSlotId && movingPlayer) {
      // Clicked the same player again -> cancel move mode
      if (movingSlotId === slot.id) {
        setMovingSlotId(null);
        return;
      }

      // Target slot is empty -> check eligibility and move
      if (!playerInSlot) {
        const canMove = isPlayerEligibleForSlot(movingPlayer, slot.allowedPositions, slot.category);
        if (canMove && onMovePlayer) {
          onMovePlayer(movingSlotId, slot.id);
          setMovingSlotId(null);
          return;
        }
      }

      // Target slot is occupied -> check bidirectional swap eligibility
      if (playerInSlot) {
        const movingSlot = formation.slots.find((s) => s.id === movingSlotId);
        if (movingSlot) {
          const movingCanPlayTarget = isPlayerEligibleForSlot(
            movingPlayer,
            slot.allowedPositions,
            slot.category
          );
          const targetCanPlayMoving = isPlayerEligibleForSlot(
            playerInSlot,
            movingSlot.allowedPositions,
            movingSlot.category
          );

          if (movingCanPlayTarget && targetCanPlayMoving && onSwapPlayers) {
            onSwapPlayers(movingSlotId, slot.id);
            setMovingSlotId(null);
            return;
          }
        }
        // If not swappable, switch selected moving player to this player
        setMovingSlotId(slot.id);
        return;
      }
    }

    // CASE 3: Not in moving mode, click on an occupied player to begin moving/swapping
    if (playerInSlot) {
      setMovingSlotId(slot.id);
      return;
    }

    // Normal empty slot selection
    onSelectSlot(slot.id);
  };

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Soft Diffused Phosphorescent Green Stadium Atmosphere (Dark Mode only) */}
      <div
        aria-hidden="true"
        className="phosphor-glow-backdrop opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      {/* Tactical Pitch Board */}
      <div className="relative z-10 w-full rounded-2xl overflow-hidden border border-[#DCE3EA] dark:border-2 dark:border-[#00D26A] shadow-sm dark:shadow-[0_0_24px_-4px_rgba(0,210,106,0.38),0_0_60px_-15px_rgba(0,210,106,0.2),inset_0_0_20px_-6px_rgba(0,210,106,0.15)] select-none pitch-turf-green dark:pitch-turf-green-dark transition-all duration-200">
        <div className="relative w-full pb-[130%]">
          {/* Locked Badge (matching Section 2) */}
          {isLocked && (
            <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-xs border border-amber-400/60 text-[10px] sm:text-xs font-heading font-black tracking-widest uppercase text-amber-300 shadow-md pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>LINEUP LOCKED</span>
            </div>
          )}

          {/* SVG Pitch Markings */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 130"
            preserveAspectRatio="none"
          >
            {/* Outer boundary */}
            <rect
              x="4"
              y="4"
              width="92"
              height="122"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
              rx="1"
            />
            {/* Halfway line */}
            <line
              x1="4"
              y1="65"
              x2="96"
              y2="65"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            {/* Center circle & spot */}
            <circle
              cx="50"
              cy="65"
              r="12"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="65" r="1.1" fill="#ffffff" fillOpacity="0.9" />

            {/* Top Penalty Box & 6-yard box */}
            <rect
              x="24"
              y="4"
              width="52"
              height="21"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            <rect
              x="36"
              y="4"
              width="28"
              height="8"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="17" r="0.9" fill="#ffffff" fillOpacity="0.9" />
            <path
              d="M 40 25 A 9 9 0 0 0 60 25"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />

            {/* Bottom Penalty Box & 6-yard box */}
            <rect
              x="24"
              y="105"
              width="52"
              height="21"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            <rect
              x="36"
              y="118"
              width="28"
              height="8"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />
            <circle cx="50" cy="113" r="0.9" fill="#ffffff" fillOpacity="0.9" />
            <path
              d="M 40 105 A 9 9 0 0 1 60 105"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.85"
              strokeWidth="0.8"
            />

            {/* Corner arcs */}
            <path d="M 4 7 A 3 3 0 0 0 7 4" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.8" />
            <path d="M 93 4 A 3 3 0 0 0 96 7" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.8" />
            <path d="M 4 123 A 3 3 0 0 1 7 126" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.8" />
            <path d="M 93 126 A 3 3 0 0 1 96 123" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="0.8" />
          </svg>

          {/* Positional Slot Nodes */}
          <div className="absolute inset-0">
            {formation.slots.map((slot) => {
              const player = squad[slot.id];
              const isSelectedSlot = selectedSlotId === slot.id;
              const isMovingThisPlayer = movingSlotId === slot.id;

              // Rule: After selecting a player, highlight ONLY the positions that player is eligible to play
              const isEligibleForSelectedPlayer =
                !player && selectedPlayerForDraft
                  ? isPlayerEligibleForSlot(selectedPlayerForDraft, slot.allowedPositions, slot.category)
                  : false;

              // Check compatibility if moving player is active
              const isCompatibleWithMoving =
                !player && movingPlayer
                  ? isPlayerEligibleForSlot(movingPlayer, slot.allowedPositions, slot.category)
                  : false;

              // Check swap compatibility if another player is moving
              const isSwappableWithMoving =
                player && movingSlotId && movingSlotId !== slot.id && movingPlayer
                  ? (() => {
                      const movingSlot = formation.slots.find((s) => s.id === movingSlotId);
                      if (!movingSlot) return false;
                      return (
                        isPlayerEligibleForSlot(movingPlayer, slot.allowedPositions, slot.category) &&
                        isPlayerEligibleForSlot(player, movingSlot.allowedPositions, movingSlot.category)
                      );
                    })()
                  : false;

              return (
                <div
                  key={slot.id}
                  style={{
                    left: `${slot.x}%`,
                    top: `${slot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute z-10"
                >
                  {player ? (
                    /* Filled Slot: Player card with gold border and incandescent phosphor glow */
                    <div
                      onClick={() => handleSlotClick(slot)}
                      className={`group relative flex flex-col items-center transition-transform duration-150 ${
                        isLocked
                          ? 'cursor-default'
                          : `cursor-pointer hover:scale-105 ${isMovingThisPlayer ? 'scale-105 z-20' : ''}`
                      }`}
                    >
                      {/* Incandescent Phosphorescent Green Illumination Glow behind occupied card */}
                      <div
                        aria-hidden="true"
                        className="absolute -inset-2.5 rounded-2xl bg-[radial-gradient(circle,rgba(0,210,106,0.32)_0%,rgba(0,210,106,0.10)_55%,transparent_75%)] pointer-events-none -z-10"
                      />

                      <div
                        className={`relative w-[62px] sm:w-[76px] md:w-[86px] h-[80px] sm:h-[96px] md:h-[108px] rounded-xl bg-gradient-to-b from-[#142938] to-[#071622] border-[1.5px] border-[#E5B842] p-1.5 flex flex-col justify-between shadow-[0_8px_20px_rgba(0,0,0,0.65)] transition-all ${
                          isMovingThisPlayer
                            ? 'ring-2 ring-[#00D26A] shadow-[0_0_20px_rgba(0,210,106,0.65)]'
                            : isSwappableWithMoving
                            ? 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.6)] animate-pulse'
                            : isSelectedSlot
                            ? 'ring-2 ring-amber-400'
                            : ''
                        }`}
                      >
                        {/* Top: Shirt Number in Gold font-mono font-black */}
                        <div className="w-full text-center">
                          <span className="text-sm sm:text-base md:text-lg font-black text-amber-300 font-mono leading-none tracking-tight">
                            {getPlayerShirtNumber(player)}
                          </span>
                        </div>

                        {/* Center: Nationality Badge / Silhouette */}
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[9px] sm:text-[10px] md:text-[11px] font-bold text-amber-200 font-mono shadow-inner my-0.5">
                          {player.countryCode || 'UCL'}
                        </div>

                        {/* Bottom: Player Name in all caps bold */}
                        <p className="text-[9px] sm:text-[11px] md:text-xs font-heading font-black uppercase text-white text-center truncate leading-tight px-0.5 tracking-tight">
                          {player.shortName || player.playerName || player.name}
                        </p>

                        {/* Swap indicator badge when swappable */}
                        {!isLocked && isSwappableWithMoving && (
                          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md">
                            <ArrowLeftRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </div>
                        )}

                        {/* Quick Remove Button on Hover (strictly hidden when lineup is locked) */}
                        {!isLocked && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (movingSlotId === slot.id) setMovingSlotId(null);
                              onRemovePlayer(slot.id);
                            }}
                            title={`Remove ${player.name}`}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Empty Slot: Highlight ONLY when eligible for selected player, otherwise neutral */
                    <button
                      onClick={() => handleSlotClick(slot)}
                      className={`group flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer ${
                        isEligibleForSelectedPlayer || isCompatibleWithMoving
                          ? 'scale-110'
                          : isSelectedSlot
                          ? 'scale-105'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div
                        className={`w-[52px] h-[52px] sm:w-[66px] sm:h-[66px] md:w-[74px] md:h-[74px] rounded-full border-2 border-dashed flex items-center justify-center font-heading font-black text-xs sm:text-sm md:text-base tracking-tight transition-all ${
                          isEligibleForSelectedPlayer || isCompatibleWithMoving
                            ? 'border-[#10B981] dark:border-[#00D26A] bg-[#10B981]/25 dark:bg-[#00D26A]/25 text-[#10B981] dark:text-[#00FFA3] ring-2 ring-[#00D26A]/60 shadow-[0_0_20px_rgba(0,210,106,0.6)] animate-pulse'
                            : selectedPlayerForDraft
                            ? 'border-amber-400/40 bg-[#172638]/20 dark:bg-[#06121A]/40 text-amber-300/40 opacity-50 cursor-not-allowed'
                            : isSelectedSlot
                            ? 'border-white bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 ring-3 ring-amber-300 shadow-md dark:shadow-[0_0_18px_rgba(0,210,106,0.5)]'
                            : 'border-amber-400/85 bg-[#172638]/40 dark:bg-[#06121A]/60 hover:bg-[#172638]/60 dark:hover:bg-[#06121A]/80 text-amber-300 hover:border-white'
                        }`}
                      >
                        {slot.label}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Helper text matching player-first workflow & reference */}
      <p className="mt-2 text-xs sm:text-sm text-[#697789] dark:text-[#6A889C] font-medium text-center">
        {selectedPlayerForDraft ? (
          <span className="text-[#10B981] dark:text-[#00FFA3] font-bold">
            Tap an illuminated position on the pitch to assign #{getPlayerShirtNumber(selectedPlayerForDraft)}{' '}
            {selectedPlayerForDraft.playerName || selectedPlayerForDraft.name}
          </span>
        ) : movingPlayer ? (
          `Moving #${getPlayerShirtNumber(movingPlayer)} ${
            movingPlayer.playerName || movingPlayer.name
          } — tap an empty slot or compatible player to swap`
        ) : (
          'Tap a player to move them to another position'
        )}
      </p>
    </div>
  );
};
