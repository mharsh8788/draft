import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { PageTransitionContext } from '../context/PageTransitionContext';
import { HONOURS } from '../data/honours';
import TrophyCard from './TrophyCard';
import { loadAndDecodeTrophy } from '../utils/trophyImageService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDE_TROPHY_IDS = {
  0: ['bundesliga', 'dfb-pokal', 'ucl', 'german-super-cup'],
  1: ['league-cup', 'uefa-cup', 'cup-winners-cup', 'intercontinental-cup'],
  2: ['fifa-club-world-cup', 'uefa-super-cup'],
};

function getSlideIndexForCard(cardIndex) {
  if (cardIndex < 4) return 0;
  if (cardIndex < 8) return 1;
  return 2;
}

export default function HonoursSection() {
  const pageTransition = useContext(PageTransitionContext);
  const transitionState = pageTransition?.transitionState || 'idle';
  const isTransitionIdle = transitionState === 'idle';

  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const cardRefs = useRef({});

  // Slide-by-slide image readiness & count animation states
  const [slideImagesReady, setSlideImagesReady] = useState({
    0: false,
    1: false,
    2: false,
  });
  const [slideAnimated, setSlideAnimated] = useState({
    0: false,
    1: false,
    2: false,
  });
  const slideAnimatedRef = useRef({
    0: false,
    1: false,
    2: false,
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const isMountedRef = useRef(true);

  const [processedImages, setProcessedImages] = useState({});
  const [failedImages, setFailedImages] = useState({});

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 1. Preload and decode trophy images; track image readiness separately per slide
  useEffect(() => {
    isMountedRef.current = true;

    // Safety fallback timeout: ensure all slide images resolve even if an image stalls
    const safetyTimer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setSlideImagesReady({ 0: true, 1: true, 2: true });
    }, 4000);

    const resolved = {};

    function checkSlideReady(sIdx) {
      const ids = SLIDE_TROPHY_IDS[sIdx];
      const isReady = ids.every((id) => resolved[id]);
      if (isReady) {
        setSlideImagesReady((prev) => (prev[sIdx] ? prev : { ...prev, [sIdx]: true }));
      }
    }

    async function preloadAllTrophies() {
      try {
        await Promise.allSettled(
          HONOURS.map(async (trophy, idx) => {
            const rawSrc = trophy.image || `/images/trophies/${trophy.id}.jpg`;
            const sIdx = getSlideIndexForCard(idx);
            try {
              const url = await loadAndDecodeTrophy(rawSrc);
              resolved[trophy.id] = true;
              if (url) {
                setProcessedImages((prev) => ({ ...prev, [trophy.id]: url }));
              } else {
                setFailedImages((prev) => ({ ...prev, [trophy.id]: true }));
              }
            } catch {
              resolved[trophy.id] = true;
              setProcessedImages((prev) => ({ ...prev, [trophy.id]: rawSrc }));
            }

            if (isMountedRef.current) {
              checkSlideReady(sIdx);
            }
          })
        );
      } finally {
        clearTimeout(safetyTimer);
        if (isMountedRef.current) {
          setSlideImagesReady({ 0: true, 1: true, 2: true });
        }
      }
    }

    preloadAllTrophies();

    return () => {
      isMountedRef.current = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // 2. Viewport visibility observation: detect when section enters the viewport
  useEffect(() => {
    if (slideAnimatedRef.current[0] && slideAnimatedRef.current[1] && slideAnimatedRef.current[2]) return;

    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsSectionInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionInView(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
      }
    );

    observer.observe(el);

    // Initial check in case section is already in viewport on mount
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < windowHeight - 60 && rect.bottom > 60) {
      setIsSectionInView(true);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // 3. Trigger count-up animation per slide when it is active, its images are ready, and section is in view
  useEffect(() => {
    if (!isSectionInView || !isTransitionIdle) return;

    if (!slideAnimatedRef.current[activeSlide] && slideImagesReady[activeSlide]) {
      slideAnimatedRef.current[activeSlide] = true;
      setSlideAnimated((prev) => ({ ...prev, [activeSlide]: true }));
    }
  }, [activeSlide, isSectionInView, isTransitionIdle, slideImagesReady]);

  // 4. Observe horizontal intersection of slide key cards within carousel
  useEffect(() => {
    if (!scrollRef.current || typeof IntersectionObserver === 'undefined') return;

    const firstCardOfSlide = {
      0: 'bundesliga',
      1: 'league-cup',
      2: 'fifa-club-world-cup',
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const cardId = entry.target.dataset.trophyId;
            const sIdx = Object.keys(firstCardOfSlide).find(
              (k) => firstCardOfSlide[k] === cardId
            );
            if (sIdx !== undefined) {
              setActiveSlide(Number(sIdx));
            }
          }
        });
      },
      {
        root: scrollRef.current,
        threshold: [0.5],
      }
    );

    Object.values(firstCardOfSlide).forEach((cardId) => {
      const el = cardRefs.current[cardId];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [slideImagesReady]);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 10) {
      setScrollProgress(scrollLeft / maxScroll);

      const card1El = cardRefs.current['league-cup'];
      const card2El = cardRefs.current['fifa-club-world-cup'];

      if (card1El && card2El) {
        const midPoint01 = card1El.offsetLeft - clientWidth * 0.45;
        const midPoint12 = card2El.offsetLeft - clientWidth * 0.55;

        if (scrollLeft < midPoint01) {
          setActiveSlide(0);
        } else if (scrollLeft < midPoint12) {
          setActiveSlide(1);
        } else {
          setActiveSlide(2);
        }
      } else {
        const progress = scrollLeft / maxScroll;
        setActiveSlide(progress < 0.33 ? 0 : progress < 0.67 ? 1 : 2);
      }
    } else {
      setScrollProgress(0);
      setActiveSlide(0);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollToSlide = (slideIdx) => {
    if (!scrollRef.current) return;
    const targetTrophyId = slideIdx === 0 
      ? 'bundesliga' 
      : slideIdx === 1 
        ? 'league-cup' 
        : 'fifa-club-world-cup';

    const targetEl = cardRefs.current[targetTrophyId];
    const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

    let targetLeft = 0;
    if (slideIdx === 0) {
      targetLeft = 0;
    } else if (slideIdx === 2) {
      targetLeft = maxScroll;
    } else if (targetEl) {
      targetLeft = Math.min(targetEl.offsetLeft, maxScroll);
    } else {
      targetLeft = maxScroll / 2;
    }

    setActiveSlide(slideIdx);
    scrollRef.current.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const handleScroll = (direction) => {
    if (direction === 'left') {
      const prev = Math.max(0, activeSlide - 1);
      scrollToSlide(prev);
    } else {
      const next = Math.min(2, activeSlide + 1);
      scrollToSlide(next);
    }
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
              const slideIdx = getSlideIndexForCard(index);
              return (
                <TrophyCard
                  key={trophy.id}
                  cardRef={(el) => {
                    cardRefs.current[trophy.id] = el;
                  }}
                  trophy={trophy}
                  index={index}
                  allImagesReady={slideImagesReady[slideIdx]}
                  processedSrc={processedImages[trophy.id]}
                  hasError={!!failedImages[trophy.id]}
                  isTriggered={slideAnimated[slideIdx]}
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
                onClick={() => scrollToSlide(idx)}
                aria-label={`Go to slide group ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  activeSlide === idx 
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
