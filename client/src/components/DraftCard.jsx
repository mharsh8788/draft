import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';
import { getPlayerImage } from '../utils/imageRotation';

export default function DraftCard({ player, onSelect, disabled }) {
  const [imageError, setImageError] = useState(false);

  const displayImage = getPlayerImage(player);
  const hasImage = Boolean(displayImage && !imageError);

  useEffect(() => {
    setImageError(false);
  }, [player?.id, displayImage]);

  if (!player) return null;

  const handleChoose = () => {
    if (disabled) return;
    sounds.playSelect();
    onSelect('revealed');
  };

  const surname = player.name.split(' ').pop();

  return (
    <div className="group relative flex flex-col h-full bg-[#121824] rounded-xl border border-[#222c3d] hover:border-[#374560] overflow-hidden transition-all shadow-sm text-left">
      {/* 1. Full-Bleed Historical Player Image (Fills 100% of card) */}
      {hasImage && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src={displayImage}
            alt={player.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover ${player.imagePosition || 'object-[center_top]'} filter contrast-[1.03] transition-transform duration-700 group-hover:scale-105`}
          />

          {/* Natural cinematic bottom-to-top gradient:
              - Upper 40-45%: completely transparent (historical photo, face & trophy fully visible)
              - Lower portion: translucent dark wash directly behind player text for crisp legibility
              - Bottom base: fades smoothly into dark navy (#121824) where button sits */}
          <div className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-[#121824] from-15% via-[#121824]/85 via-50% via-[#121824]/35 via-75% to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Floating Position Badge in Top-Right */}
      <div className="absolute top-3.5 right-3.5 z-20 pointer-events-none">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-gray-200 border border-white/15 backdrop-blur-xs">
          {player.position}
        </span>
      </div>

      {/* 3. Card Content Area (Flows naturally from clear image -> player info -> dark fade -> choose button) */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-6 sm:p-7 space-y-5">
        {/* Player Information (No stats box, sits over lower portion of image) */}
        <div className="space-y-2.5">
          {/* Nationality / Era */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            <span className="text-xl leading-none">{player.flag}</span>
            <span className="font-mono uppercase tracking-wider font-bold text-white">
              {player.nationality}
            </span>
            <span className="text-gray-400">•</span>
            <span className="font-mono text-gray-300 text-[11px]">{player.era}</span>
          </div>

          {/* Player Name */}
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
            {player.name}
          </h3>

          {/* Player Description */}
          <p className="text-xs sm:text-sm text-gray-200 italic border-l-2 border-[#dc052d] pl-3 py-0.5 font-sans leading-relaxed line-clamp-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            "{player.bio}"
          </p>
        </div>

        {/* Choose Player Button (Sits naturally at bottom after image has faded into dark background) */}
        <div className="pt-1">
          <button
            onClick={handleChoose}
            disabled={disabled}
            className="w-full py-3.5 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase border border-white/20 hover:border-white/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-sm group/btn"
          >
            <span>CHOOSE {surname}</span>
            <ArrowRight size={16} className="transition-transform duration-150 group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
