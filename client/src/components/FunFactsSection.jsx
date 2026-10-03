import React, { useState } from 'react';
import { FUN_FACTS } from '../data/facts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FunFactsSection({ 
  title = "FUN FACTS", 
  subtitle = "Stories, turning points, and moments from Bayern's history." 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? FUN_FACTS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === FUN_FACTS.length - 1 ? 0 : prev + 1));
  };

  const currentFact = FUN_FACTS[currentIndex];
  const formatNumber = (num) => (num < 10 ? `0${num}` : num);

  return (
    <section className="relative w-full overflow-hidden bg-[#070b12] py-8 sm:py-10 md:py-14">
      {/* Full-width Historical Bayern Munich Archival Squad Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: "url('/images/bayern-vintage-squad.jpg')",
          backgroundPosition: "center 30%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* 55-65% Dark Navy/Black Contrast Overlay (Historical photograph clearly recognizable while cards stay crisp & readable) */}
      <div className="absolute inset-0 bg-[#070b12]/55 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/65 via-transparent to-[#070b12]/70 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/40 via-transparent to-[#070b12]/40 pointer-events-none" />

      {/* Soft Dark Edge Fades at Top (from Honours) and Bottom (into Footer) */}
      <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#070b12] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#070b12] to-transparent pointer-events-none" />

      {/* Inner Centered Constrained Container matching max-w-6xl */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-left">
        {/* 1. Section Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-none">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-display">
            {subtitle}
          </p>
        </div>

      {/* 2. Single Featured-Card Carousel */}
      <div className="w-full">
        {/* Fixed Responsive Card Container (Exact same dimensions for every fact) */}
        <div className="bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/40 rounded-xl overflow-hidden text-left flex flex-col md:flex-row items-stretch md:h-[490px] w-full select-none transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-md">
          
          {/* Image Container (Fixed 40% Width Desktop, Fixed Height Mobile, Full-Cover Image) */}
          <div className="w-full md:w-[40%] shrink-0 h-[240px] sm:h-[280px] md:h-full relative overflow-hidden bg-[#090e16] border-b md:border-b-0 md:border-r border-[#1c2535]">
            {/* Primary Cover Image with object-fit: cover */}
            <img
              key={currentFact.id}
              src={currentFact.image}
              alt={currentFact.title}
              className={`w-full h-full object-cover ${currentFact.imagePosition || 'object-[center_top]'} transition-transform duration-200 ease-out group-hover:scale-[1.025]`}
              loading="eager"
            />

            {/* Base gradient vignette */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#090e16] via-[#090e16]/60 to-transparent z-20 pointer-events-none" />

            {/* Archival caption tag */}
            <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-white drop-shadow">
                {currentFact.imageCaption || currentFact.tag || 'BAYERN ARCHIVE'}
              </span>
            </div>
          </div>

          {/* Content Panel (Fixed 60% Width Desktop, Exact Same Vertical Rhythm across All Facts) */}
          <div className="w-full md:w-[60%] h-full p-6 sm:p-7 md:p-8 flex flex-col justify-between overflow-hidden bg-[#121824]">
            
            {/* Top: Metadata & Title & Introduction */}
            <div className="space-y-2.5">
              {/* Category and Year Tag */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#dc052d]/10 border border-[#dc052d]/25 text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d]">
                  {currentFact.category || 'FUN FACT'}
                </span>
                <span className="text-[10px] font-display text-gray-400 uppercase tracking-wider">
                  {currentFact.year} • {currentFact.tag}
                </span>
              </div>

              {/* Prominent Title */}
              <h3 className={`font-display font-bold text-white tracking-tight uppercase leading-snug ${
                currentFact.aftermath 
                  ? 'text-2xl sm:text-3xl md:text-[28px]' 
                  : 'text-lg sm:text-xl md:text-2xl'
              }`}>
                {currentFact.title}
              </h3>

              {/* Short Introduction */}
              <div className={`space-y-1 font-display text-gray-200 leading-relaxed ${
                currentFact.aftermath 
                  ? 'text-sm sm:text-[15px] md:text-base' 
                  : 'text-xs sm:text-sm'
              }`}>
                {currentFact.introduction?.map((intro, idx) => (
                  <p key={idx} className={idx === 1 ? "font-semibold text-white" : ""}>
                    {intro}
                  </p>
                )) || currentFact.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            {/* Middle: THE STORY (3 Compact Editorial Columns) */}
            <div className="space-y-1.5 py-1">
              {/* Kicker with thin divider line */}
              <div className="flex items-center gap-2">
                <span className={`font-display font-bold uppercase tracking-widest text-[#dc052d] ${
                  currentFact.aftermath ? 'text-xs' : 'text-[10px]'
                }`}>
                  THE STORY
                </span>
                <div className="h-px bg-[#1c2535] flex-1" />
              </div>

              {/* 3 Story Blocks: subtle borders, 3 cols desktop, stacked mobile */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1c2535] py-1.5 border-b border-[#1c2535]">
                {currentFact.storyBlocks?.map((block, idx) => (
                  <div 
                    key={idx} 
                    className={`space-y-1.5 ${
                      idx === 0 
                        ? 'pb-2.5 md:pb-0 md:pr-3.5' 
                        : idx === 1 
                        ? 'py-2.5 md:py-0 md:px-3.5' 
                        : 'pt-2.5 md:pt-0 md:pl-3.5'
                    }`}
                  >
                    <div className="min-h-[28px] flex flex-col justify-end">
                      {block.kicker && (
                        <span className="text-[10px] sm:text-[11px] font-display font-bold text-[#dc052d] uppercase tracking-wider block leading-none mb-1">
                          {block.kicker}
                        </span>
                      )}
                      <h4 className={`font-display font-bold text-white uppercase tracking-wide leading-none ${
                        currentFact.aftermath ? 'text-xs sm:text-sm' : 'text-xs'
                      }`}>
                        {block.title}
                      </h4>
                    </div>
                    {/* Increased body text size and line-height */}
                    <p className={`font-display leading-relaxed pt-0.5 text-gray-300 ${
                      currentFact.aftermath ? 'text-xs sm:text-[13px] md:text-[13.5px]' : 'text-[11px] sm:text-xs'
                    }`}>
                      {block.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* AFTERMATH SECTION (Only when fact has aftermath) */}
            {currentFact.aftermath && (
              <div className="space-y-2 py-1">
                {/* AFTERMATH heading */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-display font-bold uppercase tracking-widest text-[#dc052d]">
                    AFTERMATH
                  </span>
                  <div className="h-px bg-[#1c2535] flex-1" />
                </div>

                {/* Concise text */}
                <p className="text-xs sm:text-sm md:text-[14.5px] text-gray-200 font-display leading-relaxed">
                  {currentFact.aftermath.text}
                </p>

                {/* Compact archive statistic row */}
                <div className="grid grid-cols-3 divide-x divide-[#1c2535] py-2 border-y border-[#1c2535]">
                  {currentFact.aftermath.stats.map((stat, idx) => (
                    <div key={idx} className={`space-y-0.5 ${idx === 0 ? 'pr-3' : idx === 1 ? 'px-3' : 'pl-3'}`}>
                      <span className="font-display font-black text-lg sm:text-xl md:text-2xl text-white leading-none block">
                        {stat.value}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-display font-bold uppercase tracking-wider text-gray-400 block leading-tight pt-0.5">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom: Strong Closing Statement (More prominent and slightly larger) */}
            <div className="pt-1.5">
              {currentFact.closingStatement && (
                <div className={`font-display font-black tracking-wide uppercase leading-tight space-y-0.5 ${
                  currentFact.aftermath ? 'text-sm sm:text-base md:text-[17px]' : 'text-xs sm:text-sm'
                }`}>
                  <div className="text-white">{currentFact.closingStatement[0]}</div>
                  <div className="text-[#dc052d]">{currentFact.closingStatement[1]}</div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Carousel Navigation Strip: ←        01 / 04        → */}
        <div className="flex items-center justify-between pt-4 px-1 select-none">
          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            aria-label="Previous fact"
            className="w-10 h-10 rounded-lg bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/50 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Central Counter: 01 / 04 */}
          <div className="flex items-center gap-3 font-display">
            <span className="text-sm sm:text-base font-bold text-white tracking-widest">
              {formatNumber(currentIndex + 1)} <span className="text-gray-500 font-normal">/</span> {formatNumber(FUN_FACTS.length)}
            </span>

            {/* Segment / Indicator dots */}
            <div className="flex items-center gap-1.5 ml-1">
              {FUN_FACTS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to fact ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-6 bg-[#dc052d]' 
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            aria-label="Next fact"
            className="w-10 h-10 rounded-lg bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/50 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
      </div>
    </section>
  );
}
