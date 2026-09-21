import React, { useState } from 'react';
import TrophyIllustration from './TrophyIllustration';

export default function TrophyCard({ trophy }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative w-[220px] sm:w-[240px] lg:w-[calc((100%-3*1.25rem)/4)] shrink-0 bg-[#121824] border border-[#222c3d] hover:border-[#3b4861] rounded-xl overflow-hidden flex flex-col transition-all duration-200 select-none hover:-translate-y-1">
      {/* 1. Trophy Visual Area: 58% of height with subtle museum backlight */}
      <div className="relative h-48 sm:h-52 bg-[#0a0f18] border-b border-[#222c3d] flex items-center justify-center overflow-hidden p-4">
        {/* Very subtle dark radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,5,45,0.06)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Subtle museum pedestal baseline */}
        <div className="absolute bottom-2 inset-x-8 h-px bg-white/10" />

        {/* Hero Trophy Asset */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center w-full h-full">
          {trophy.image && !imgError ? (
            <img
              src={trophy.image}
              alt={trophy.name}
              onError={() => setImgError(true)}
              className="max-h-36 sm:max-h-40 max-w-[88%] object-contain drop-shadow-md pointer-events-none"
              loading="lazy"
            />
          ) : (
            <TrophyIllustration type={trophy.type} className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md" />
          )}
        </div>
      </div>

      {/* 2. Information Area: Trophy Name & Large Count */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-center space-y-2 bg-[#121824]">
        {/* Trophy Name */}
        <h3 className="font-display font-bold text-xs sm:text-sm text-gray-200 tracking-wider uppercase group-hover:text-white transition-colors truncate">
          {trophy.shortName || trophy.name}
        </h3>

        {/* Large Prominent Count */}
        <div className="flex flex-col items-center justify-center">
          <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
            {trophy.count !== undefined && trophy.count !== null ? trophy.count : '—'}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#dc052d] uppercase mt-1">
            {trophy.unit || 'TITLES'}
          </span>
        </div>
      </div>
    </div>
  );
}
