import React, { useRef, useState, useEffect } from 'react';
import { HONOURS } from '../data/honours';
import TrophyCard from './TrophyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HonoursSection() {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(scrollLeft / maxScroll);
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    // Scroll by 1 page (4 cards at desktop)
    const scrollOffset = direction === 'left' ? -containerWidth : containerWidth;
    scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  // 3-segment indicator to represent the 3 pages of cards on desktop (● ━ ━)
  const activeSegment = scrollProgress < 0.33 ? 0 : scrollProgress < 0.67 ? 1 : 2;

  return (
    <section className="relative w-full overflow-hidden bg-[#070b12] py-8 sm:py-10 md:py-12">
      {/* Full-width Bayern Munich Trophy Museum Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: "url('/images/bayern-trophy-museum.jpg')",
          backgroundPosition: "center 25%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* 60-65% Dark Navy/Black Contrast Overlay (10-15% darker, specially darkened behind lower cards) */}
      <div className="absolute inset-0 bg-[#070b12]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/70 via-[#070b12]/50 to-[#070b12]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/70 via-[#070b12]/20 to-transparent pointer-events-none" />

      {/* 100-140px Smooth Dark Navy Gradient at Top for seamless transition from Archive Header */}
      <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-[#070b12] via-[#070b12]/80 to-transparent pointer-events-none" />
      {/* Soft Dark Edge Fade at Bottom for seamless transition to Fun Facts */}
      <div className="absolute inset-x-0 bottom-0 h-20 sm:h-28 bg-gradient-to-t from-[#070b12] via-[#070b12]/80 to-transparent pointer-events-none" />

      {/* Inner Centered Constrained Container matching max-w-6xl */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4 text-left">
        {/* 1. Section Header: Compact, restrained, editorial */}
        <div className="space-y-0.5">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase leading-none">
            HONOURS
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-sans">
            The trophies that shaped Bayern's history.
          </p>
        </div>

      {/* 2. Horizontal Trophy Carousel Container (Clean boundaries aligned with content) */}
      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {HONOURS.map((trophy) => (
            <TrophyCard key={trophy.id} trophy={trophy} />
          ))}
        </div>
      </div>

      {/* 3. Subtle Carousel Controls & Segmented Indicator */}
      <div className="flex items-center justify-between pt-1">
        {/* Pagination indicator: 3 segments for 3 pages (● ━ ━) */}
        <div className="flex items-center gap-1.5" aria-label="Carousel pagination">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!scrollRef.current) return;
                const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
                scrollRef.current.scrollTo({ left: (maxScroll * idx) / 2, behavior: 'smooth' });
              }}
              aria-label={`Go to slide group ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeSegment === idx 
                  ? 'w-6 bg-[#dc052d]' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Minimal Subtle Arrow Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous trophies"
            className="w-8 h-8 rounded-lg bg-[#121824] border border-[#222c3d] hover:border-[#374560] text-gray-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next trophies"
            className="w-8 h-8 rounded-lg bg-[#121824] border border-[#222c3d] hover:border-[#374560] text-gray-300 hover:text-white flex items-center justify-center transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
