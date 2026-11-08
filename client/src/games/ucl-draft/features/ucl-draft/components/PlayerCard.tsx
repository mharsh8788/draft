import React, { useState } from 'react';
import { Player, PitchSlot } from '../../../types/draft';
import { GameMode } from '../types';
import { Trophy, Check, Plus, Info, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { isPlayerEligibleForSlot } from '../../../data/players';

interface PlayerCardProps {
  player: Player;
  mode: GameMode;
  isDrafted: boolean;
  draftedSlotLabel: string | null;
  selectedSlot: PitchSlot | null;
  onDraft: (player: Player) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  mode,
  isDrafted,
  draftedSlotLabel,
  selectedSlot,
  onDraft,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Check compatibility with active slot
  const isEligibleForSelected = selectedSlot
    ? isPlayerEligibleForSlot(player, selectedSlot.allowedPositions, selectedSlot.category)
    : true;

  // Category badge colors (light theme)
  const categoryBadgeColors = {
    GK: 'bg-amber-50 border-amber-200 text-amber-800',
    DEF: 'bg-blue-50 border-blue-200 text-blue-800',
    MID: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    FWD: 'bg-rose-50 border-rose-200 text-rose-800',
  }[player.primaryCategory];

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 overflow-hidden flex flex-col justify-between ${
        isDrafted
          ? 'bg-[#F6F8FA] border-[#DCE3EA] opacity-60'
          : selectedSlot && !isEligibleForSelected
          ? 'bg-[#FAFBFD] border-[#DCE3EA] opacity-70'
          : 'bg-white border-[#DCE3EA] hover:border-[#3478F6] hover:shadow-sm'
      }`}
    >
      {/* Card Header & Content */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          {/* Position Tag, Nation & Era */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border font-heading ${categoryBadgeColors}`}
            >
              {player.specificPosition}
            </span>

            <span className="text-[10px] font-mono font-bold text-[#172638] bg-[#F6F8FA] px-1.5 py-0.5 rounded border border-[#DCE3EA]">
              {player.countryCode}
            </span>

            <span className="text-[10px] font-medium text-[#697789] bg-[#F6F8FA] px-1.5 py-0.5 rounded border border-[#DCE3EA]">
              {player.era}
            </span>
          </div>

          {/* Rating Badge (Classic vs Almanac) */}
          <div className="flex flex-col items-end">
            {mode === 'classic' ? (
              <>
                <div className="flex items-baseline gap-1 bg-[#EDF4FF] border border-[#BFDBFE] px-2 py-0.5 rounded-md">
                  <span className="text-[9px] uppercase font-bold text-[#3478F6] tracking-wider">OVR</span>
                  <span className="font-heading text-lg font-black text-[#172638] leading-none">
                    {player.editorialRating}
                  </span>
                </div>
                <span className="text-[8px] text-[#697789] tracking-tight mt-0.5">Editorial Rating</span>
              </>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-amber-700">
                <Lock className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-bold font-mono">??</span>
                <span className="text-[8px] text-amber-600 uppercase font-semibold">Almanac</span>
              </div>
            )}
          </div>
        </div>

        {/* Player Name & Clubs */}
        <div className="mt-2">
          <h3 className="font-heading text-lg font-bold text-[#172638] tracking-tight leading-snug group-hover:text-[#3478F6] transition-colors truncate">
            {player.name}
          </h3>
          <p className="text-xs text-[#697789] font-medium truncate">
            {player.uclClubs.join(' • ')}
          </p>
        </div>

        {/* Verified Stats Row */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-lg bg-[#F6F8FA] border border-[#DCE3EA] text-center">
          <div>
            <span className="text-[9px] uppercase text-[#697789] font-bold block">Titles</span>
            <span className="text-xs font-bold text-amber-700 flex items-center justify-center gap-0.5 font-heading">
              <Trophy className="w-3 h-3 text-amber-500 inline" />
              {player.uclStats.titles}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase text-[#697789] font-bold block">Apps</span>
            <span className="text-xs font-bold text-[#172638] font-heading">
              {player.uclStats.appearances}
            </span>
          </div>

          <div>
            <span className="text-[9px] uppercase text-[#697789] font-bold block">
              {player.primaryCategory === 'GK' ? 'Clean Sheets' : 'Goals'}
            </span>
            <span className="text-xs font-bold text-[#3478F6] font-heading">
              {player.primaryCategory === 'GK'
                ? player.uclStats.cleanSheets ?? '-'
                : player.uclStats.goals ?? '-'}
            </span>
          </div>
        </div>

        {/* Collapsible Key Highlight & Historical Rationale */}
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-[11px] font-medium text-[#697789] hover:text-[#172638] py-1 transition-colors"
          >
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-[#3478F6]" />
              Historical Insight
            </span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-1.5 text-[11px] text-[#172638] bg-[#F6F8FA] p-2.5 rounded-lg border border-[#DCE3EA] space-y-1.5 leading-relaxed">
              <p>
                <span className="text-[#3478F6] font-bold">Highlight:</span> {player.keyHighlight}
              </p>
              {mode === 'classic' && (
                <p className="text-[#697789]">
                  <span className="text-[#172638] font-bold">Rating Rationale:</span>{' '}
                  {player.ratingRationale}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Action Button */}
      <div className="p-3 pt-0">
        {isDrafted ? (
          <div className="w-full py-1.5 px-3 rounded-lg bg-[#E6F4EA] border border-[#A8DAB5] flex items-center justify-center gap-1.5 text-xs font-bold text-[#137333]">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Drafted in {draftedSlotLabel}</span>
          </div>
        ) : (
          <button
            onClick={() => onDraft(player)}
            disabled={selectedSlot !== null && !isEligibleForSelected}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold font-heading uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              selectedSlot && !isEligibleForSelected
                ? 'bg-[#F6F8FA] text-[#697789] border border-[#DCE3EA] cursor-not-allowed'
                : selectedSlot
                ? 'bg-[#3478F6] hover:bg-blue-600 text-white border border-[#2563EB] shadow-xs active:scale-98'
                : 'bg-[#172638] hover:bg-slate-800 text-white border border-[#172638] shadow-xs active:scale-98'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {selectedSlot
                ? isEligibleForSelected
                  ? `Draft to ${selectedSlot.label}`
                  : `Incompatible with ${selectedSlot.label}`
                : 'Draft Player'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
