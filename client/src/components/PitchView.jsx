import React, { useState } from 'react';
import { Shield, Bot } from 'lucide-react';
import { getPlayerImage } from '../utils/imageRotation';
import { getFormation } from '../data/formations';

function PitchPlayerSlot({ player, isLatest, slot, isComputer = false, compact = false }) {
  const [imgErr, setImgErr] = useState(false);
  const playerImg = getPlayerImage(player);
  const hasImg = playerImg && !imgErr;

  const cardDimClass = compact
    ? "w-12 h-16 xs:w-14 xs:h-18 sm:w-16 sm:h-21 md:w-18 md:h-24 lg:w-20 lg:h-26 xl:w-22 xl:h-28"
    : "w-14 h-18 xs:w-16 xs:h-21 sm:w-20 sm:h-26 md:w-22 md:h-29 lg:w-26 lg:h-34";

  const surnameMaxWClass = compact
    ? "max-w-[70px] xs:max-w-[80px] sm:max-w-[95px] md:max-w-[110px] lg:max-w-[125px]"
    : "max-w-[85px] xs:max-w-[95px] sm:max-w-[115px] md:max-w-[130px] lg:max-w-[145px]";

  const ratingBg = isComputer ? "bg-[#2563eb]" : "bg-[#dc052d]";
  const borderHighlight = isComputer ? "hover:border-[#3b82f6]" : "hover:border-[#dc052d]";
  const ringHighlight = isComputer ? "ring-[#3b82f6]" : "ring-[#dc052d]";

  return (
    <div 
      className="flex flex-col items-center group cursor-pointer"
      title={`${player.name} (${player.position}) - ${player.overall} OVR`}
    >
      {hasImg ? (
        <div className={`relative ${cardDimClass} rounded-xl overflow-hidden shadow-2xl transition-all duration-200 group-hover:scale-105 group-hover:z-30 bg-[#121824] ${
          isLatest 
            ? `ring-3 ${ringHighlight} ring-offset-2 ring-offset-[#0a160f] shadow-xl` 
            : `border border-[#1c2535] ${borderHighlight}`
        }`}>
          <img
            src={playerImg}
            alt={player.name}
            onError={() => setImgErr(true)}
            className={`w-full h-full object-cover ${player.imagePosition || 'object-[center_top]'} filter contrast-[1.03] transition-transform duration-300 group-hover:scale-108`}
          />

          {/* Cinematic bottom dark gradient for photo depth & badge clarity */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Top-left position pill */}
          <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 bg-black/80 text-gray-200 text-[7px] xs:text-[8px] sm:text-[9px] md:text-xs font-display font-bold px-1 py-0.5 sm:px-1.5 rounded border border-white/10 leading-none backdrop-blur-xs">
            {slot.position.split('/')[0]}
          </span>

          {/* Bottom-right rating badge */}
          <span className={`absolute bottom-0 right-0 ${ratingBg} text-white text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-tl-lg font-display leading-none shadow-md`}>
            {player.overall}
          </span>
        </div>
      ) : (
        <div className={`relative ${cardDimClass} rounded-xl flex flex-col items-center justify-between p-1.5 sm:p-2.5 font-display shadow-2xl transition-transform group-hover:scale-105 ${
          isLatest 
            ? `${ratingBg} text-white border-2 border-white` 
            : `bg-[#121824] text-white border border-[#1c2535] ${borderHighlight}`
        }`}>
          <span className="text-[8px] xs:text-[9px] sm:text-xs font-display font-bold uppercase tracking-wider text-gray-300">
            {slot.position}
          </span>
          <span className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black leading-none">
            {player.overall}
          </span>
          <span className="text-[8px] xs:text-[9px] sm:text-xs font-display text-gray-400 uppercase">
            {player.position}
          </span>
        </div>
      )}

      {/* Player surname bar */}
      <div className={`mt-1 px-1 py-0.5 sm:px-2 sm:py-0.5 rounded-md bg-black/95 border border-white/20 text-center ${surnameMaxWClass} truncate shadow-md backdrop-blur-xs`}>
        <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-white tracking-tight truncate block">
          {player.name.split(' ').pop()}
        </span>
      </div>
    </div>
  );
}

export default function PitchView({ 
  team,
  userTeam = [], 
  opponentTeam = [], 
  title,
  subtitle,
  formationKey = '4-3-3', 
  isSubdued = false,
  isComputer = false,
  compact = false,
  showStatsHeader = true
}) {
  const formation = getFormation(formationKey);
  const slots = formation.slots;
  const currentTeam = team || (isComputer ? opponentTeam : userTeam) || [];

  const totalOvr = currentTeam.reduce((acc, p) => acc + (p.overall || 0), 0);
  const avgRating = currentTeam.length > 0 
    ? (totalOvr / currentTeam.length).toFixed(1)
    : '—';

  const defaultTitle = isComputer ? "COMPUTER BAYERN XI" : "YOUR BAYERN XI";
  const displayTitle = title || defaultTitle;
  const accentColor = isComputer ? "#2563eb" : "#dc052d";

  const cardDimClass = compact
    ? "w-12 h-16 xs:w-14 xs:h-18 sm:w-16 sm:h-21 md:w-18 md:h-24 lg:w-20 lg:h-26 xl:w-22 xl:h-28"
    : "w-14 h-18 xs:w-16 xs:h-21 sm:w-20 sm:h-26 md:w-22 md:h-29 lg:w-26 lg:h-34";

  const pitchMinHClass = compact
    ? "min-h-[540px] sm:min-h-[620px] md:min-h-[720px] lg:min-h-[780px]"
    : "min-h-[640px] sm:min-h-[740px] md:min-h-[860px] lg:min-h-[940px]";

  return (
    <div className={`w-full mx-auto space-y-3 text-left transition-opacity duration-300 ${
      isSubdued ? 'opacity-70 hover:opacity-100' : 'opacity-100'
    }`}>
      {/* Tactical Header Bar */}
      {showStatsHeader && (
        <div className="flex items-center justify-between bg-[#121824] px-4 py-2.5 rounded-lg border border-[#1c2535]">
          <div className="flex items-center gap-2">
            {isComputer ? (
              <Bot size={16} className="text-[#3b82f6]" />
            ) : (
              <Shield size={16} className="text-[#dc052d]" />
            )}
            <span className="font-display font-bold text-sm sm:text-base text-white uppercase tracking-wider">
              {displayTitle}
            </span>
            <span className="text-xs sm:text-sm font-display text-gray-400">
              ({currentTeam.length} / 11)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-display">
            <span className="text-gray-400">
              FORMATION: <strong className="text-white">{formation.name}</strong>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">
              AVG OVR: <strong style={{ color: accentColor }}>{avgRating}</strong>
            </span>
          </div>
        </div>
      )}

      {/* The Football Pitch Graphic */}
      <div className={`relative w-full aspect-[3/4] sm:aspect-[4/4.8] md:aspect-[4/4.4] lg:aspect-[1/1.08] ${pitchMinHClass} bg-[#0a160f] rounded-2xl border border-[#1c2535] overflow-hidden pitch-pattern shadow-2xl`}>
        {/* Pitch Field Markings (SVG Overlay) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/12 fill-none" strokeWidth="1.2">
          <rect x="4%" y="4%" width="92%" height="92%" rx="8" />
          <line x1="4%" y1="50%" x2="96%" y2="50%" />
          <circle cx="50%" cy="50%" r="12%" />
          <circle cx="50%" cy="50%" r="2.5" className="fill-white/20" />

          {/* Top Penalty Area */}
          <rect x="25%" y="4%" width="50%" height="15%" />
          <rect x="37%" y="4%" width="26%" height="6%" />
          <path d="M 40% 19% A 10% 10% 0 0 0 60% 19%" />

          {/* Bottom Penalty Area */}
          <rect x="25%" y="81%" width="50%" height="15%" />
          <rect x="37%" y="90%" width="26%" height="6%" />
          <path d="M 40% 81% A 10% 10% 0 0 1 60% 81%" />
        </svg>

        {/* Pitch Watermark */}
        <div className="absolute top-3 right-4 text-[10px] sm:text-xs font-display font-bold uppercase tracking-widest text-white/20 pointer-events-none">
          {displayTitle} • {formation.name}
        </div>

        {/* Player Position Slots */}
        {slots.map((slot) => {
          const player = currentTeam[slot.round - 1];
          const isLatest = player && currentTeam.length === slot.round && !isComputer;

          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
              style={{ top: slot.top, left: slot.left }}
            >
              {player ? (
                <PitchPlayerSlot 
                  player={player} 
                  isLatest={isLatest} 
                  slot={slot} 
                  isComputer={isComputer}
                  compact={compact}
                />
              ) : (
                /* Empty Slot with ? and Position */
                <div className="flex flex-col items-center">
                  <div className={`${cardDimClass} rounded-xl border-2 border-dashed border-white/25 bg-black/45 backdrop-blur-xs flex flex-col items-center justify-center text-white/50 space-y-1`}>
                    <span className="text-base sm:text-xl md:text-2xl font-bold leading-none text-white/40">?</span>
                    <span className="text-[8px] sm:text-xs md:text-sm font-display font-bold uppercase tracking-wider text-white/60">{slot.position}</span>
                  </div>
                  <span className="text-[8px] sm:text-xs font-display uppercase text-white/30 mt-1">
                    {slot.label}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
