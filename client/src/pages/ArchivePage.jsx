import React from 'react';
import HonoursSection from '../components/HonoursSection';
import FunFactsSection from '../components/FunFactsSection';

export default function ArchivePage({ onNavigate }) {
  return (
    <div className="flex-1 w-full flex flex-col text-left">
      {/* 1. Archive Header Banner (Full-Width Historical Olympiastadion Atmospheric Header) */}
      <section className="relative w-full overflow-hidden bg-[#070b12] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        {/* Full-width Olympiastadion Historical Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
          style={{ 
            backgroundImage: "url('/images/olympiastadion-archive.jpg')",
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat"
          }}
        />

        {/* 40-50% Dark Navy/Black Contrast Overlay (Olympiastadion canopy, pitch & crowd clearly recognizable) */}
        <div className="absolute inset-0 bg-[#070b12]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/60 via-[#070b12]/20 to-transparent pointer-events-none" />

        {/* 100-140px Smooth Dark Navy Gradient at Bottom to gradually dissolve Olympiastadion into dark navy */}
        <div className="absolute inset-x-0 bottom-0 h-28 sm:h-36 bg-gradient-to-t from-[#070b12] via-[#070b12]/80 to-transparent pointer-events-none" />

        {/* Header Content Container (Centered & Constrained to max-w-6xl) */}
        <div className="relative z-10 max-w-6xl mx-auto space-y-2">
          {/* Kicker */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#dc052d]/10 border border-[#dc052d]/25 text-[11px] font-mono font-bold uppercase tracking-widest text-[#dc052d]">
            <span>FC BAYERN MÜNCHEN</span>
          </div>

          {/* Primary Headline */}
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-[42px] text-white tracking-tight uppercase leading-tight">
            THE CLUB ARCHIVE
          </h1>

          {/* Supporting Copy */}
          <p className="text-xs sm:text-sm text-gray-300 font-normal max-w-xl">
            Honours, turning points, and stories that defined Germany's greatest club.
          </p>
        </div>
      </section>

      {/* 2. HONOURS CAROUSEL (Full-Width Museum Atmospheric Section) */}
      <HonoursSection />

      {/* 3. FUN FACTS (Full-Width Vintage Archival Squad Atmospheric Section) */}
      <FunFactsSection title="FUN FACTS" />
    </div>
  );
}
