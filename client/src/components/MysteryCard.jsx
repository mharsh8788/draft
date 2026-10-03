import React from 'react';
import { HelpCircle, ArrowRight, Shield } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function MysteryCard({ player, targetPosition, onSelect, disabled }) {
  const positionLabel = player?.position || targetPosition?.position || "PLAYER";
  const positionName = targetPosition?.label || positionLabel;

  const handleChoose = () => {
    if (disabled) return;
    sounds.playSelect();
    onSelect('mystery');
  };

  return (
    <div className="flex flex-col h-full bg-[#121824] rounded-xl border border-[#1c2535] hover:border-[#dc052d]/60 overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-md group text-left">
      {/* Editorial Header Bar */}
      <div className="bg-[#0c121c] px-5 py-3 border-b border-[#1c2535] flex items-center justify-between">
        <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[#dc052d] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
          MYSTERY PLAYER
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
          {positionLabel}
        </span>
      </div>

      {/* Centerpiece Body */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
        {/* Silhouette Centerpiece with High-Contrast Question Mark */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Transparent Footballer Silhouette */}
            <img
              src="/images/mystery-silhouette-white.png"
              alt="Mystery Player"
              className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-200 ease-out group-hover:scale-[1.025] select-none pointer-events-none"
            />

            {/* Question Mark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-display font-black text-5xl sm:text-6xl text-white drop-shadow-md select-none">
                ?
              </span>
            </div>
          </div>

          <div className="text-center space-y-0.5">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              WHO IS THIS PLAYER?
            </h3>
            <p className="text-xs font-display uppercase tracking-widest text-[#dc052d]">
              HIDDEN BAYERN LEGEND
            </p>
          </div>
        </div>

        {/* Minimal Intentional Clues (Strictly NO rating, NO nation, NO stats) */}
        <div className="bg-[#0a0e14] p-4 rounded-lg border border-[#1c2535] space-y-2.5 font-display text-xs">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-gray-400 uppercase font-medium">Position</span>
            <span className="text-white font-bold">{positionName} ({positionLabel})</span>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-gray-400 uppercase font-medium">Club</span>
            <span className="text-gray-200">FC Bayern München</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400 uppercase font-medium">Overall Rating</span>
            <span className="text-[#dc052d] font-bold">??? (REVEALED ON PICK)</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleChoose}
          disabled={disabled}
          className="w-full py-3.5 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-base tracking-wider uppercase transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:hover:translate-y-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <span>CHOOSE MYSTERY PLAYER</span>
          <ArrowRight size={17} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
