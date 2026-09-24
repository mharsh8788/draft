import React, { useState, useEffect, useRef } from 'react';
import { 
  TIMELINE_EVENTS, 
  TIMELINE_ERAS,
  TIMELINE_ERA_BACKGROUNDS 
} from '../data/timelineEvents';
import { 
  getTimelineEventNumber,
  getTimelinePrimaryImageUrl,
  resolveTimelineEventImages 
} from '../utils/timelineImages';
import { 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ArrowUp, 
  ArrowRight, 
  Shield,
  Maximize2
} from 'lucide-react';

/**
 * TimelineCardImage:
 * Automatically crossfades through all available numbered images for the event (e.g. 2.jpg -> 2-2.jpg -> 2-3.jpg).
 * - Rotates every ~4 seconds using a subtle 500ms crossfade.
 * - If only 1 image exists, remains completely static.
 * - Pauses rotation when outside the viewport to maximize performance.
 * - Respects prefers-reduced-motion.
 * - Never displays broken image icons.
 */
function TimelineCardImage({ event, eventNumber, onClick }) {
  const [images, setImages] = useState(() => (event.image ? [event.image] : []));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasResolved, setHasResolved] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef(null);

  // 1. Asynchronously resolve all available images for this event
  useEffect(() => {
    let isCurrent = true;
    resolveTimelineEventImages(event).then((resolved) => {
      if (isCurrent) {
        if (resolved.length > 0) {
          setImages(resolved);
        }
        setHasResolved(true);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [event.id, eventNumber]);

  // 2. Viewport detection: pause timer when card is outside viewport
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '150px 0px 150px 0px', threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 3. Detect prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 4. Round-robin rotation every 4 seconds when multiple images exist and card is visible
  useEffect(() => {
    if (images.length <= 1 || !isVisible || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [images.length, isVisible, prefersReducedMotion]);

  // Handle runtime image loading error by filtering out missing asset
  const handleImageError = (failedSrc) => {
    setImages((prev) => {
      const filtered = prev.filter((s) => s !== failedSrc);
      if (filtered.length === 0 && event.image && failedSrc !== event.image) {
        return [event.image];
      }
      return filtered;
    });
  };

  // If resolved and no images available at all, render clean fallback card
  if (hasResolved && images.length === 0) {
    return (
      <div 
        onClick={onClick}
        className="relative w-full h-36 sm:h-44 bg-[#0a101b] border-b border-[#1f293d] flex flex-col items-center justify-center group cursor-pointer overflow-hidden select-none"
        title="Click to view historical moment"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-transparent opacity-80" />
        <Shield size={28} className="text-white/20 group-hover:scale-105 transition-transform" />
        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mt-2 group-hover:text-gray-200 transition-colors">
          HISTORICAL ARCHIVE • {event.year}
        </span>

        {event.trophyBadge && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 border border-white/15 text-[10px] font-mono font-bold text-[#fdb913] flex items-center gap-1 shadow-sm">
            <Trophy size={11} />
            <span>{event.trophyBadge}</span>
          </div>
        )}

        <span className="absolute bottom-2 left-3 text-[10px] font-mono uppercase text-gray-400 tracking-wider">
          {event.exactDate}
        </span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onClick={onClick}
      className="relative w-full h-36 sm:h-44 bg-[#080d15] overflow-hidden border-b border-[#1f293d] cursor-pointer group select-none"
      title="Click image to open historical viewer"
    >
      {/* Historical Images with subtle 500ms Crossfade Transition */}
      {images.map((src, idx) => (
        <img 
          key={src}
          src={src} 
          alt={event.title}
          onError={() => handleImageError(src)}
          className={`absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-opacity duration-500 ease-in-out ${
            idx === currentIndex 
              ? 'opacity-90 group-hover:opacity-100 z-10' 
              : 'opacity-0 pointer-events-none z-0'
          }`}
          loading="lazy"
        />
      ))}

      {/* Dark gradient overlay for consistent text and badge contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-[#0d131f]/20 to-transparent pointer-events-none z-10" />
      
      {/* Trophy / Event Badge Overlay */}
      {event.trophyBadge && (
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 border border-white/15 text-[10px] font-mono font-bold text-[#fdb913] flex items-center gap-1 shadow-sm pointer-events-none z-20">
          <Trophy size={11} />
          <span>{event.trophyBadge}</span>
        </div>
      )}

      {/* Hover Enlarge Indicator */}
      <div className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded bg-black/70 border border-white/15 text-[10px] font-mono text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 pointer-events-none z-20">
        <Maximize2 size={10} />
        <span>VIEW</span>
      </div>

      <span className="absolute bottom-2 left-3 text-[10px] font-mono uppercase text-gray-300 tracking-wider pointer-events-none z-20">
        {event.exactDate}
      </span>
    </div>
  );
}

export default function TimelinePage({ onNavigate }) {
  const [selectedEra, setSelectedEra] = useState('all');
  const [activeScrollEventId, setActiveScrollEventId] = useState(TIMELINE_EVENTS[0]?.id || '');
  const [activeEvent, setActiveEvent] = useState(null);
  const [eventImages, setEventImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const timelineTopRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const progressLineRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // 1. SCROLL-REACTIVE TIMELINE: Active event detection & timeline progress fill line
  useEffect(() => {
    let animationFrameId = null;

    const handleScroll = () => {
      if (animationFrameId) return;

      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;

        // Progress fill effect for central timeline line
        if (timelineContainerRef.current && progressLineRef.current) {
          const containerRect = timelineContainerRef.current.getBoundingClientRect();
          const triggerY = window.innerHeight * 0.42;
          const fillHeight = Math.max(0, Math.min(containerRect.height - 24, triggerY - containerRect.top));
          progressLineRef.current.style.height = `${fillHeight}px`;
        }

        // Viewport detection: find event closest to the reference line (approx 38% down viewport)
        const triggerY = window.innerHeight * 0.38;
        let closestId = TIMELINE_EVENTS[0].id;
        let minDistance = Infinity;

        TIMELINE_EVENTS.forEach((event) => {
          const el = document.getElementById(`timeline-event-${event.id}`);
          if (el) {
            const rect = el.getBoundingClientRect();
            const eventCenter = rect.top + Math.min(rect.height / 2, 90);
            const dist = Math.abs(eventCenter - triggerY);
            if (dist < minDistance) {
              minDistance = dist;
              closestId = event.id;
            }
          }
        });

        setActiveScrollEventId(closestId);

        // Update era navigation highlight if not in programmatic jump
        if (!isNavigatingRef.current) {
          if (window.pageYOffset < 160) {
            setSelectedEra('all');
          } else {
            const currentEvt = TIMELINE_EVENTS.find((e) => e.id === closestId);
            if (currentEvt) {
              setSelectedEra(currentEvt.era);
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // 2. ERA NAVIGATION: Smooth scroll jump to relevant era
  const handleEraClick = (eraId) => {
    setSelectedEra(eraId);
    isNavigatingRef.current = true;

    const headerOffset = window.innerWidth >= 640 ? 145 : 125;

    if (eraId === 'all') {
      if (timelineTopRef.current) {
        const elementPosition = timelineTopRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }
    } else {
      const firstEvent = TIMELINE_EVENTS.find((e) => e.era === eraId);
      if (firstEvent) {
        const el = document.getElementById(`timeline-event-${firstEvent.id}`);
        if (el) {
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 750);
  };

  // 3. ARCHIVAL VIEWER: Resolve all available images when activeEvent changes
  useEffect(() => {
    if (!activeEvent) {
      setEventImages([]);
      setActiveImageIndex(0);
      return;
    }

    setActiveImageIndex(0);
    let isCurrent = true;

    resolveTimelineEventImages(activeEvent).then((imgs) => {
      if (isCurrent) {
        setEventImages(imgs);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [activeEvent?.id]);

  // Navigate through complete historical event sequence in viewer
  const navigateEvent = (direction) => {
    if (!activeEvent) return;
    const currentIndex = TIMELINE_EVENTS.findIndex((e) => e.id === activeEvent.id);
    if (currentIndex === -1) return;
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < TIMELINE_EVENTS.length) {
      setActiveEvent(TIMELINE_EVENTS[newIndex]);
    }
  };

  // Stepping through multiple images or events
  const handleModalPrevious = () => {
    if (eventImages.length > 1 && activeImageIndex > 0) {
      setActiveImageIndex((prev) => prev - 1);
      return;
    }
    navigateEvent(-1);
  };

  const handleModalNext = () => {
    if (eventImages.length > 1 && activeImageIndex < eventImages.length - 1) {
      setActiveImageIndex((prev) => prev + 1);
      return;
    }
    navigateEvent(1);
  };

  // 4. ARCHIVAL VIEWER: Keyboard shortcuts (Escape, Left, Right)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeEvent) return;
      if (e.key === 'Escape') {
        setActiveEvent(null);
      } else if (e.key === 'ArrowLeft') {
        handleModalPrevious();
      } else if (e.key === 'ArrowRight') {
        handleModalNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEvent, activeImageIndex, eventImages.length]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeIndexInModal = activeEvent 
    ? TIMELINE_EVENTS.findIndex((e) => e.id === activeEvent.id) 
    : -1;

  const activeScrollIndex = TIMELINE_EVENTS.findIndex((e) => e.id === activeScrollEventId);
  const currentEventInView = TIMELINE_EVENTS.find((e) => e.id === activeScrollEventId) || TIMELINE_EVENTS[0];
  const activeEra = selectedEra !== 'all' ? selectedEra : (currentEventInView?.era || 'foundation');

  return (
    <div className="relative flex-1 w-full bg-[#070b12] text-white flex flex-col text-left font-sans">
      
      {/* =========================================================
          1. COMPACT PAGE HERO
          ========================================================= */}
      <section className="relative z-10 w-full overflow-hidden bg-[#070b12]">
        {/* Background Archival Texture */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none select-none blur-[1px] opacity-25 scale-105"
          style={{ 
            backgroundImage: "url('/images/bayern-historical-collage.jpg')",
            backgroundPosition: "center center"
          }}
        />
        {/* Smooth Dark Fade Transition into the dark navy color (#070b12) at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/60 via-[#070b12]/85 to-[#070b12] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dc052d]/10 border border-[#dc052d]/30 text-[#dc052d] text-xs font-display font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
            <span>HISTORICAL ARCHIVE • 1900–PRESENT</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase">
            THE BAYERN TIMELINE
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto font-sans leading-relaxed">
            More than a century of moments, eras and turning points that shaped FC Bayern München into Germany&apos;s record champions.
          </p>
        </div>
      </section>

      {/* =========================================================
          TIMELINE SECTION (ERA NAV + CHRONOLOGICAL EVENTS)
          ========================================================= */}
      <section className="relative w-full flex-1">

        {/* Era Atmospheric Backgrounds with Smooth Crossfade */}
        {Object.entries(TIMELINE_ERA_BACKGROUNDS).map(([eraKey, eraBg]) => {
          if (!eraBg?.image) return null;
          const isActive = activeEra === eraKey;

          return (
            <div
              key={eraKey}
              aria-hidden="true" 
              className={`absolute ${eraBg.topClass || 'top-0'} inset-x-0 w-full ${eraBg.heightClass || 'h-[2200px]'} pointer-events-none select-none z-0 overflow-hidden transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Historical Background Image */}
              <div
                className={`absolute inset-0 w-full h-full pointer-events-none select-none ${eraBg.blur || ''}`}
                style={{
                  backgroundImage: `url('${eraBg.image}')`,
                  backgroundPosition: eraBg.position || 'center top',
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  opacity: eraBg.opacity || 0.24,
                  filter: eraBg.filter || 'grayscale(15%) contrast(100%)'
                }}
              />

              {/* Subdued Dark Navy Archive Overlay */}
              <div className="absolute inset-0 bg-[#070b12]/40 pointer-events-none" />

              {/* Seamless Top & Bottom Gradient: Smooth dark fade from #070b12 at the top, revealing archive atmosphere in the center, and fading to #070b12 at bottom */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#070b12] via-[#070b12]/20 to-[#070b12] pointer-events-none" />
            </div>
          );
        })}

        {/* =========================================================
            2. ERA NAVIGATION (TRANSPARENT OVERLAY NAV - CENTERED)
            Sits directly on top of the founding document background
            ========================================================= */}
        <nav 
          aria-label="Timeline Era Navigation" 
          className="sticky top-16 sm:top-20 z-30 bg-transparent select-none"
        >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-1.5 sm:space-y-2">
          
          {/* Top Row: Centered "EXPLORE BY ERA" Kicker */}
          <div className="flex items-center justify-center">
            <span className="text-[11px] font-mono tracking-wider text-gray-400 uppercase font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
              <span>EXPLORE BY ERA</span>
            </span>
          </div>

          {/* Era Links Row (Centered on desktop, swipeable on mobile, NO scrollbar visible) */}
          <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-8 lg:gap-10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5 pb-0.5">
            {TIMELINE_ERAS.map((era) => {
              const isSelected = selectedEra === era.id;
              return (
                <button
                  key={era.id}
                  onClick={() => handleEraClick(era.id)}
                  className="group relative pb-1.5 flex flex-col items-center transition-all cursor-pointer shrink-0 text-center"
                >
                  {/* Era Title */}
                  <span className={`text-xs sm:text-[13px] font-sans tracking-wide transition-colors ${
                    isSelected 
                      ? 'text-white font-semibold' 
                      : 'text-gray-400 group-hover:text-gray-200 font-medium'
                  }`}>
                    {era.label}
                  </span>

                  {/* Year Range underneath */}
                  <span className={`text-[10px] font-mono tracking-normal leading-tight transition-colors ${
                    isSelected 
                      ? 'text-gray-300' 
                      : 'text-gray-500 group-hover:text-gray-400'
                  }`}>
                    {era.period || '1900–PRESENT'}
                  </span>

                  {/* Active Red Underline Indicator */}
                  {isSelected ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#dc052d] rounded-full transition-all duration-200" />
                  ) : (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-white/20 rounded-full transition-all duration-200" />
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </nav>

      {/* =========================================================
          3. SCROLL-REACTIVE CHRONOLOGICAL TIMELINE
          ========================================================= */}
      <main 
        id="timeline-start"
        ref={timelineTopRef} 
        className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1"
      >
        
        {/* Timeline Rules Container */}
        <div ref={timelineContainerRef} className="relative">
          {/* Continuous Central Vertical Track Line (Subdued Base) */}
          <div className="absolute top-6 bottom-6 left-8 sm:left-1/2 w-0.5 -translate-x-1/2 bg-[#1b2537] pointer-events-none" />

          {/* Active Fill Line (Grows down to current position) */}
          <div 
            ref={progressLineRef} 
            className="absolute top-6 left-8 sm:left-1/2 w-0.5 -translate-x-1/2 bg-[#dc052d] pointer-events-none transition-[height] duration-75 ease-out shadow-[0_0_8px_rgba(220,5,45,0.4)]" 
            style={{ height: '0px' }} 
          />

          {/* Timeline Events Stack */}
          <div className="space-y-8 sm:space-y-12">
            {TIMELINE_EVENTS.map((event, index) => {
              const eventNumber = index + 1;
              const isEven = index % 2 === 0;
              const isCurrentActive = event.id === activeScrollEventId;
              const isPast = index < activeScrollIndex;

              return (
                <div 
                  key={event.id}
                  id={`timeline-event-${event.id}`}
                  className="relative flex flex-col sm:flex-row items-start scroll-mt-36"
                >
                  {/* Timeline Milestone Marker Dot */}
                  {isCurrentActive ? (
                    <div 
                      className="absolute left-8 sm:left-1/2 top-5 -translate-x-1/2 w-7 h-7 rounded-full bg-[#dc052d] border-2 border-white flex items-center justify-center z-20 shadow-[0_0_14px_rgba(220,5,45,0.7)] scale-110 transition-all duration-200"
                      title={`${event.year} - Active Moment`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    </div>
                  ) : (
                    <div 
                      className={`absolute left-8 sm:left-1/2 top-5 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center z-20 transition-all duration-200 ${
                        isPast 
                          ? 'bg-[#0b1019] border-2 border-[#dc052d]/80 text-[#dc052d]' 
                          : 'bg-[#070b12] border-2 border-[#202b3d] text-gray-500'
                      }`}
                      title={event.year}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-[#dc052d]' : 'bg-[#2b374e]'}`} />
                    </div>
                  )}

                  {/* Event Card Container (Alternating on Desktop, Single Column on Mobile) */}
                  <div className={`w-full sm:w-[calc(50%-2rem)] pl-16 sm:pl-0 ${
                    isEven ? 'sm:mr-auto sm:pr-4' : 'sm:ml-auto sm:pl-4'
                  }`}>
                    <article
                      onClick={() => setActiveEvent(event)}
                      className={`group rounded-xl overflow-hidden transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl border ${
                        isCurrentActive
                          ? 'border-[#dc052d] bg-[#121927] shadow-[0_4px_24px_rgba(220,5,45,0.18)] ring-1 ring-[#dc052d]/40 opacity-100 scale-[1.01]'
                          : 'border-[#1f293d] bg-[#0d131f] opacity-80 hover:opacity-100 hover:border-[#dc052d]/60 scale-100'
                      }`}
                    >
                      {/* Image Area with Automatic Numbered Loading & Clean Fallback */}
                      <TimelineCardImage 
                        event={event} 
                        eventNumber={eventNumber} 
                        onClick={() => setActiveEvent(event)} 
                      />

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-black text-2xl sm:text-3xl text-[#dc052d] tracking-tight">
                            {event.year}
                          </span>
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {event.eraLabel}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-lg sm:text-xl text-white uppercase tracking-tight group-hover:text-white transition-colors">
                          {event.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed line-clamp-3">
                          {event.summary}
                        </p>

                        {/* Event CTA: "VIEW MOMENT →" */}
                        <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#dc052d] group-hover:text-[#ff385c] group-hover:translate-x-0.5 transition-all">
                          <span>VIEW MOMENT →</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </article>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </main>
      </section>

      {/* =========================================================
          4. ARCHIVAL EVENT VIEWER / LIGHTBOX (MULTI-IMAGE READY)
          ========================================================= */}
      {activeEvent && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#070b12]/95 select-none"
          onClick={() => setActiveEvent(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* Close Button (Fixed Top-Right) */}
          <button
            onClick={() => setActiveEvent(null)}
            aria-label="Close viewer"
            className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full text-gray-400 hover:text-white bg-black/50 hover:bg-black/80 border border-white/10 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>

          {/* Previous Arrow (Fixed Left Edge) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleModalPrevious();
            }}
            disabled={activeIndexInModal <= 0 && activeImageIndex <= 0}
            aria-label="Previous photo"
            className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#dc052d] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-20 disabled:cursor-not-allowed hover:disabled:bg-black/60"
            title="Previous (Arrow Left)"
          >
            <ChevronLeft size={22} className="sm:hidden" />
            <ChevronLeft size={26} className="hidden sm:block" />
          </button>

          {/* Next Arrow (Fixed Right Edge) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleModalNext();
            }}
            disabled={activeIndexInModal >= TIMELINE_EVENTS.length - 1 && activeImageIndex >= eventImages.length - 1}
            aria-label="Next photo"
            className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-[#dc052d] border border-white/15 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg disabled:opacity-20 disabled:cursor-not-allowed hover:disabled:bg-black/60"
            title="Next (Arrow Right)"
          >
            <ChevronRight size={22} className="sm:hidden" />
            <ChevronRight size={26} className="hidden sm:block" />
          </button>

          {/* Centered Archival Image & Caption Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center max-w-full max-h-full cursor-default"
          >
            {eventImages.length > 0 ? (
              <div className="relative flex flex-col items-center">
                {/* Historical Photograph: Original aspect ratio, max-w-[90vw], max-h-[75vh], subtle shadow, no card box */}
                <img
                  src={eventImages[activeImageIndex]}
                  alt={`${activeEvent.title}${eventImages.length > 1 ? ` - Photo ${activeImageIndex + 1}` : ''}`}
                  className="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain mx-auto shadow-2xl rounded-sm select-none"
                />

                {/* 1 / 2 Image Counter Badge (when multiple images exist for the event) */}
                {eventImages.length > 1 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/75 border border-white/20 text-[11px] font-mono font-bold text-gray-200 shadow-md">
                    {activeImageIndex + 1} / {eventImages.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
                <Shield size={36} className="text-white/20" />
                <span className="uppercase tracking-wider">HISTORICAL ARCHIVE RECORD • {activeEvent.year}</span>
              </div>
            )}

            {/* Editorial Caption & Navigation Dots Underneath */}
            <div className="mt-3 sm:mt-4 text-center max-w-2xl px-4 space-y-1.5 select-none">
              {/* Year & Event Title */}
              <div className="flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-400">
                <span className="text-[#dc052d] font-bold">{activeEvent.year}</span>
                <span>•</span>
                <span className="text-gray-200 font-sans font-semibold tracking-normal">{activeEvent.title}</span>
              </div>

              {/* Archival Photo Caption */}
              {activeEvent.imageCaption && (
                <p className="text-xs sm:text-[13px] font-sans text-gray-300 italic tracking-wide">
                  {activeEvent.imageCaption}
                </p>
              )}

              {/* Image Navigation Dots (when multiple images exist for the event) */}
              {eventImages.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {eventImages.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex(dotIdx);
                      }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        dotIdx === activeImageIndex 
                          ? 'w-6 bg-[#dc052d]' 
                          : 'w-1.5 bg-white/30 hover:bg-white/60'
                      }`}
                      title={`View photo ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          5. END OF TIMELINE CLOSING SECTION
          ========================================================= */}
      <section className="relative z-10 w-full overflow-hidden bg-[#0a0f18] border-t border-[#1b2535] py-12 sm:py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          <img
            src="/images/bayern-crest.png"
            alt="FC Bayern München Crest"
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto object-contain select-none"
          />

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
              125+ YEARS OF MIA SAN MIA
            </h2>
            <p className="text-sm text-gray-300 font-sans max-w-lg mx-auto">
              From a Munich football club founded in 1900 to one of Europe&apos;s most decorated and revered clubs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowUp size={15} />
              <span>BACK TO TOP</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate('/archive')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <span>EXPLORE THE ARCHIVE</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
