import React from 'react';
import { Home, Zap, Clock, Trophy, ArrowRight } from 'lucide-react';

export default function FunFactCard({ fact, onNavigate }) {
  return (
    <div className="bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/40 rounded-xl overflow-hidden text-left transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-md group">
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
        {/* Left: Square / Visual Frame (4 cols on desktop) */}
        <div className="md:col-span-4 relative bg-[#090e16] border-b md:border-b-0 md:border-r border-[#1c2535] flex items-center justify-center select-none overflow-hidden min-h-[200px] md:min-h-[220px] aspect-square md:aspect-auto">
          {fact.image ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#090e16]">
              {/* Blurred background extension */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-md scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${fact.image})` }}
              />

              {/* Primary historical photograph */}
              <img
                src={fact.image}
                alt={fact.title}
                className={`relative z-10 w-full h-full object-cover ${fact.imagePosition || 'object-top'} transition-transform duration-200 ease-out group-hover:scale-[1.025]`}
                loading="lazy"
              />

              {/* Seamless dark vignette gradient at base */}
              <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#090e16] via-[#090e16]/60 to-transparent z-20 pointer-events-none" />

              {/* Historical caption tag */}
              <div className="absolute bottom-2.5 left-3 z-30 flex items-center gap-1.5">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider text-white drop-shadow">
                  {fact.imageCaption || fact.tag || 'BAYERN ARCHIVE'}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 select-none bg-[#0a0f18]">
              {/* Subtle pitch pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none pitch-pattern" />

              {/* Dedicated graphic treatments for non-image facts */}
              {fact.graphicType === 'berni' && (
                <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-16 h-16 rounded-full bg-[#162030] border border-[#1e2a3d] flex items-center justify-center text-[#dc052d]">
                    <Home size={28} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d] block">
                      BERNI's HOUSE
                    </span>
                    <span className="text-[9px] font-display text-gray-400 uppercase tracking-wider block">
                      FCB MUSEUM 2-STOREY
                    </span>
                  </div>
                </div>
              )}

              {fact.graphicType === 'drum' && (
                <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-16 h-16 rounded-full bg-[#162030] border border-[#1e2a3d] flex items-center justify-center">
                    <span className="font-display font-black text-2xl text-white tracking-wider">
                      '97
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d] block">
                      KICKED AD DRUM
                    </span>
                    <span className="text-[9px] font-display text-gray-400 uppercase tracking-wider block">
                      MUSEUM EXHIBIT
                    </span>
                  </div>
                </div>
              )}

              {fact.graphicType === 'timer' && (
                <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-16 h-16 rounded-full bg-[#dc052d]/15 border border-[#dc052d]/35 flex items-center justify-center text-[#dc052d]">
                    <span className="font-display font-black text-xl text-white tracking-tight">
                      10.12<span className="text-xs text-[#dc052d]">s</span>
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d] block">
                      ALL-TIME UCL RECORD
                    </span>
                    <span className="text-[9px] font-display text-gray-400 uppercase tracking-wider block">
                      ROY MAKAAY (2007)
                    </span>
                  </div>
                </div>
              )}

              {!fact.graphicType && (
                <div className="relative z-10 flex flex-col items-center justify-center space-y-2.5">
                  <div className="w-16 h-16 rounded-full bg-[#162030] border border-[#1e2a3d] flex items-center justify-center">
                    <span className="font-display font-black text-2xl text-white">FCB</span>
                  </div>
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d]">
                    HISTORICAL FACT
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Editorial Content Area (8 cols on desktop) */}
        <div className="md:col-span-8 p-6 sm:p-7 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Small label above title */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-medium text-gray-300 uppercase tracking-wider">
                {fact.category || 'Historical Archive'}
              </span>
              <span className="text-[10px] font-display text-gray-400">
                {fact.year} • {fact.tag}
              </span>
            </div>

            {/* Prominent Title: increased by ~10–15% when aftermath exists */}
            <h3 className={`font-display font-bold text-white tracking-tight uppercase leading-snug ${
              fact.aftermath 
                ? 'text-2xl sm:text-3xl md:text-[28px]' 
                : 'text-lg sm:text-xl md:text-2xl'
            }`}>
              {fact.title}
            </h3>

            {/* Editorial Layout: If storyBlocks exist */}
            {fact.storyBlocks ? (
              <div className="space-y-3.5 pt-1">
                {/* Short Introduction: noticeably larger and easier to read */}
                <div className={`space-y-1 font-display text-gray-200 leading-relaxed ${
                  fact.aftermath ? 'text-sm sm:text-[15px] md:text-base' : 'text-xs sm:text-sm'
                }`}>
                  {(fact.introduction || fact.paragraphs.slice(0, 2)).map((intro, idx) => (
                    <p key={idx} className={idx === 1 ? "font-semibold text-white" : ""}>
                      {intro}
                    </p>
                  ))}
                </div>

                {/* THE STORY Section Kicker */}
                <div className="flex items-center gap-2 pt-1">
                  <span className={`font-display font-bold uppercase tracking-widest text-[#dc052d] ${
                    fact.aftermath ? 'text-xs' : 'text-[10px]'
                  }`}>
                    THE STORY
                  </span>
                  <div className="h-px bg-[#1c2535] flex-1" />
                </div>

                {/* 3 Story Blocks: subtle borders, 3 cols desktop, stacked mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#1c2535] py-1.5 border-b border-[#1c2535]">
                  {fact.storyBlocks.map((block, idx) => (
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
                          fact.aftermath ? 'text-xs sm:text-sm' : 'text-xs'
                        }`}>
                          {block.title}
                        </h4>
                      </div>
                      <p className={`font-display leading-relaxed pt-0.5 text-gray-300 ${
                        fact.aftermath ? 'text-xs sm:text-[13px] md:text-[13.5px]' : 'text-[11px] sm:text-xs'
                      }`}>
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* AFTERMATH SECTION (Only when fact has aftermath) */}
                {fact.aftermath && (
                  <div className="space-y-2 py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-display font-bold uppercase tracking-widest text-[#dc052d]">
                        AFTERMATH
                      </span>
                      <div className="h-px bg-[#1c2535] flex-1" />
                    </div>

                    <p className="text-xs sm:text-sm md:text-[14.5px] text-gray-200 font-display leading-relaxed">
                      {fact.aftermath.text}
                    </p>

                    <div className="grid grid-cols-3 divide-x divide-[#1c2535] py-2 border-y border-[#1c2535]">
                      {fact.aftermath.stats.map((stat, idx) => (
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

                {/* Strong Closing Statement */}
                {fact.closingStatement && (
                  <div className="pt-1.5 space-y-2.5">
                    <div className={`font-display font-black tracking-wide uppercase leading-tight space-y-0.5 ${
                      fact.aftermath ? 'text-sm sm:text-base md:text-[17px]' : 'text-xs sm:text-sm'
                    }`}>
                      <div className="text-white">{fact.closingStatement[0]}</div>
                      <div className="text-[#dc052d]">{fact.closingStatement[1]}</div>
                    </div>

                    {/* Solid Bayern Red "VIEW ARCHIVE →" CTA Button */}
                    {fact.aftermath && (
                      <div className="pt-2">
                        <a
                          href="/archive"
                          onClick={(e) => {
                            e.preventDefault();
                            if (onNavigate) {
                              onNavigate('/archive');
                            } else {
                              window.history.pushState({}, '', '/archive');
                              window.dispatchEvent(new PopStateEvent('popstate'));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className="inline-flex items-center justify-between gap-4 min-w-[180px] sm:min-w-[190px] px-5 py-2.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 ease-out shadow-sm group/cta select-none cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                        >
                          <span>VIEW ARCHIVE</span>
                          <ArrowRight size={14} className="text-white transition-transform duration-200 ease-out group-hover/cta:translate-x-1" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Body Paragraphs for other cards */
              <div className="space-y-2.5 text-xs sm:text-sm text-gray-300 font-display leading-relaxed">
                {fact.paragraphs.map((para, idx) => (
                  <p 
                    key={idx}
                    className={idx === fact.paragraphs.length - 1 && fact.paragraphs.length > 1 ? "font-semibold text-white pt-1" : ""}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
