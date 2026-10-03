import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { PageTransitionContext } from '../context/PageTransitionContext';
import { HONOURS } from '../data/honours';
import TrophyCard from './TrophyCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function isCardVisible(cardEl, containerEl, sectionEl) {
  if (!cardEl || !sectionEl) return false;

  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;

  // 1. Check if section is vertically within the window viewport
  const sectionRect = sectionEl.getBoundingClientRect();
  const isSectionInWindow = sectionRect.bottom > 20 && sectionRect.top < windowHeight - 20;
  if (!isSectionInWindow) return false;

  // 2. Check if card itself is vertically within the window viewport
  const cardRect = cardEl.getBoundingClientRect();
  const isCardInWindowY = cardRect.bottom > 10 && cardRect.top < windowHeight - 10;
  if (!isCardInWindowY) return false;

  // 3. Check if card is horizontally within the window viewport
  const isCardInWindowX = cardRect.right > 10 && cardRect.left < windowWidth - 10;
  if (!isCardInWindowX) return false;

  // 4. Check if card is within the horizontal visible bounds of the scroll container
  if (containerEl) {
    const containerRect = containerEl.getBoundingClientRect();
    // Overlap requires card right edge > container left + 30px AND card left edge < container right - 30px
    const inContainerX = cardRect.right > containerRect.left + 30 && cardRect.left < containerRect.right - 30;
    if (!inContainerX) return false;
  }

  return true;
}

export default function HonoursSection() {
  const pageTransition = useContext(PageTransitionContext);
  const transitionState = pageTransition?.transitionState || 'idle';
  const isTransitionIdle = transitionState === 'idle';

  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const cardRefs = useRef({});
  const triggeredIdsRef = useRef(new Set());

  // Map of trophy.id -> { triggered: boolean, delay: number }
  const [animationTriggers, setAnimationTriggers] = useState({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkCardVisibility = useCallback(() => {
    // 1. Never animate while page-transition curtain is covering or revealing
    if (!isTransitionIdle || !sectionRef.current || !scrollRef.current) return;

    // 2. Return early if all cards have already animated
    if (triggeredIdsRef.current.size >= HONOURS.length) return;

    const newlyVisible = [];
    HONOURS.forEach((trophy) => {
      if (triggeredIdsRef.current.has(trophy.id)) return;
      const cardEl = cardRefs.current[trophy.id];
      if (!cardEl) return;

      if (isCardVisible(cardEl, scrollRef.current, sectionRef.current)) {
        newlyVisible.push(trophy.id);
      }
    });

    if (newlyVisible.length > 0) {
      const updates = {};
      newlyVisible.forEach((id, batchIdx) => {
        triggeredIdsRef.current.add(id);
        updates[id] = {
          triggered: true,
          delay: batchIdx * 0.075, // 75ms stagger within this visible batch
        };
      });
      setAnimationTriggers((prev) => ({ ...prev, ...updates }));
    }
  }, [isTransitionIdle]);

  const checkScroll = useCallback(() => {
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

    checkCardVisibility();
  }, [checkCardVisibility]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Synchronize animation triggers with page transition completion & viewport entry
  useEffect(() => {
    if (!isTransitionIdle) return;

    // Check immediately when page transition reaches idle
    checkCardVisibility();

    // Check again after browser paint cycle
    const timer = setTimeout(checkCardVisibility, 60);

    const handleEvent = () => checkCardVisibility();
    window.addEventListener('scroll', handleEvent, { passive: true });
    window.addEventListener('resize', handleEvent, { passive: true });

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleEvent, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleEvent);
      window.removeEventListener('resize', handleEvent);
      if (container) {
        container.removeEventListener('scroll', handleEvent);
      }
    };
  }, [isTransitionIdle, checkCardVisibility]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const containerWidth = scrollRef.current.clientWidth;
    // Scroll by 1 page (4 cards at desktop)
    const scrollOffset = direction === 'left' ? -containerWidth : containerWidth;
    scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    setTimeout(checkCardVisibility, 150);
    setTimeout(checkCardVisibility, 350);
  };

  // 3-segment indicator to represent the 3 pages of cards on desktop (● ━ ━)
  const activeSegment = scrollProgress < 0.33 ? 0 : scrollProgress < 0.67 ? 1 : 2;

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#070b12] py-8 sm:py-10 md:py-12">
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
          <p className="text-xs sm:text-sm text-gray-300 font-display">
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
          {HONOURS.map((trophy, index) => {
            const triggerInfo = animationTriggers[trophy.id];
            return (
              <TrophyCard
                key={trophy.id}
                cardRef={(el) => {
                  cardRefs.current[trophy.id] = el;
                }}
                trophy={trophy}
                index={index}
                isTriggered={triggerInfo?.triggered || false}
                staggerDelay={triggerInfo?.delay || 0}
              />
            );
          })}
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
                setTimeout(checkCardVisibility, 150);
                setTimeout(checkCardVisibility, 350);
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
            className="w-8 h-8 rounded-lg bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/50 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 ease-out disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 disabled:hover:translate-y-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Next trophies"
            className="w-8 h-8 rounded-lg bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/50 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 ease-out disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 disabled:hover:translate-y-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
