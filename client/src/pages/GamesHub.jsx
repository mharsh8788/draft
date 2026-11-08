import React, { useState, useRef, useEffect } from 'react';
import { GAMES, ROAD_TO_GLORY_MILESTONES } from '../data/games';
import { HOMEPAGE_FEATURED_FACT } from '../data/facts';
import FunFactCard from '../components/FunFactCard';
import NextMatchBanner from '../components/NextMatchBanner';
import { sounds } from '../utils/audio';
import { ArrowRight, Clock, Shield, Trophy } from 'lucide-react';

export default function GamesHub({ onSelectGame, onNavigate }) {
  const featuredGame = GAMES.find((g) => g.featured) || GAMES[0];
  const moreGames = GAMES.filter((g) => !g.featured);

  // Coordinated CTA button interaction group state
  // Active milestone for Road to Glory (default: 2020 UEFA Champions League - The Journey to Lisbon)
  const [activeMilestoneId, setActiveMilestoneId] = useState('2020-the-sextuple');
  const activeMilestone = ROAD_TO_GLORY_MILESTONES.find((m) => m.id === activeMilestoneId) || ROAD_TO_GLORY_MILESTONES[1] || ROAD_TO_GLORY_MILESTONES[0];

  const handleNavigateMilestone = (eventId) => {
    const targetRoute = `/timeline#timeline-event-${eventId}`;
    if (onSelectGame) {
      onSelectGame(targetRoute);
    } else if (onNavigate) {
      onNavigate(targetRoute);
    }
  };

  const [hoveredCta, setHoveredCta] = useState(null);
  const activeCta = hoveredCta || 'games';

  const handleCtaHover = (ctaKey) => {
    // Only engage hover state on devices that support true hover (prevents touch devices getting stuck)
    if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(hover: hover)').matches) {
      return;
    }
    setHoveredCta(ctaKey);
  };

  const handleCtaLeave = () => {
    setHoveredCta(null);
  };

  const handlePlayFeatured = () => {
    sounds.playWhistle();
    if (onSelectGame && featuredGame.route) {
      onSelectGame(featuredGame.route);
    } else if (onNavigate) {
      onNavigate(featuredGame.route || '/mystery-player');
    }
  };

  const mysteryPlayerRef = useRef(null);

  const handleScrollToMysteryPlayer = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const target = mysteryPlayerRef.current || document.getElementById('mystery-player-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash === '#mystery-player-section' || hash === '#mystery-player') {
        const target = mysteryPlayerRef.current || document.getElementById('mystery-player-section');
        if (target) {
          setTimeout(() => {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col text-left">
      {/* =========================================================
          1. ALLIANZ ARENA ATMOSPHERIC HERO SECTION
          ========================================================= */}
      <section className="relative w-full overflow-hidden bg-[#070b12]">
        {/* Stadium Background Image (Full-Width, Positioned at center 38% for lower stadium placement) */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
          style={{ 
            backgroundImage: "url('/images/allianz-arena-home.jpg')",
            backgroundPosition: "center 38%"
          }}
        />

        {/* 65-70% Dark Navy/Black Contrast Overlay for Perfect Balance & Recognition */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/88 via-[#070b12]/68 to-[#070b12]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-[#070b12]/20 pointer-events-none" />

        {/* Subtle, Restrained Bayern-Red Atmospheric Accent near the lower portion */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#070b12] via-[#dc052d]/4 to-transparent pointer-events-none" />

        {/* Seamless Soft Dark Fade Transition into Next Section (No hard border) */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070b12] via-[#070b12]/60 to-transparent pointer-events-none" />

        {/* Hero Content Container (Left / Center-Left Positioned) */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-18 lg:py-24 min-h-[380px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] flex flex-col justify-center">
          <div className="max-w-2xl space-y-4 sm:space-y-5 text-left">
            {/* Red Accent Line & Club Kicker */}
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-0.5 bg-[#dc052d]" />
              <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-widest text-[#dc052d]">
                FC BAYERN MÜNCHEN
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[1.05]">
              FAN GAMES &amp; ARCHIVE
            </h1>

            {/* Subheading / Description */}
            <p className="text-sm sm:text-base md:text-lg text-gray-200 font-display leading-relaxed max-w-xl font-normal">
              Test your Bayern knowledge. Build your XI. Discover the club&apos;s history.
            </p>

            {/* Coordinated Interactive Action CTA Buttons */}
            <div 
              className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-4"
              onPointerLeave={handleCtaLeave}
              onTouchStart={handleCtaLeave}
            >
              {/* BUTTON 1: EXPLORE GAMES */}
              <button
                onClick={handleScrollToMysteryPlayer}
                onPointerEnter={() => handleCtaHover('games')}
                onFocus={() => handleCtaHover('games')}
                className={`inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none ${
                  activeCta === 'games'
                    ? 'bg-[#dc052d] hover:bg-[#b80425] text-white border border-[#dc052d] shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/25 shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70'
                }`}
              >
                <span>EXPLORE GAMES</span>
                <span
                  className={`inline-flex items-center overflow-hidden transition-all duration-200 ease-out ${
                    activeCta === 'games'
                      ? 'w-4.5 sm:w-5 opacity-100 translate-x-0 ml-2 sm:ml-2.5'
                      : 'w-0 opacity-0 -translate-x-1.5 ml-0'
                  }`}
                  aria-hidden="true"
                >
                  <ArrowRight size={18} className="shrink-0" />
                </span>
              </button>

              {/* BUTTON 2: BAYERN TIMELINE */}
              <button
                onClick={() => onNavigate && onNavigate('/timeline')}
                onPointerEnter={() => handleCtaHover('timeline')}
                onFocus={() => handleCtaHover('timeline')}
                className={`inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none ${
                  activeCta === 'timeline'
                    ? 'bg-[#dc052d] hover:bg-[#b80425] text-white border border-[#dc052d] shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/25 shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70'
                }`}
              >
                <span>BAYERN TIMELINE</span>
                <span
                  className={`inline-flex items-center overflow-hidden transition-all duration-200 ease-out ${
                    activeCta === 'timeline'
                      ? 'w-4.5 sm:w-5 opacity-100 translate-x-0 ml-2 sm:ml-2.5'
                      : 'w-0 opacity-0 -translate-x-1.5 ml-0'
                  }`}
                  aria-hidden="true"
                >
                  <ArrowRight size={18} className="shrink-0" />
                </span>
              </button>

              {/* BUTTON 3: CLUB ARCHIVE */}
              <button
                onClick={() => onNavigate && onNavigate('/archive')}
                onPointerEnter={() => handleCtaHover('archive')}
                onFocus={() => handleCtaHover('archive')}
                className={`inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none ${
                  activeCta === 'archive'
                    ? 'bg-[#dc052d] hover:bg-[#b80425] text-white border border-[#dc052d] shadow-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-white/25 shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70'
                }`}
              >
                <span>CLUB ARCHIVE</span>
                <span
                  className={`inline-flex items-center overflow-hidden transition-all duration-200 ease-out ${
                    activeCta === 'archive'
                      ? 'w-4.5 sm:w-5 opacity-100 translate-x-0 ml-2 sm:ml-2.5'
                      : 'w-0 opacity-0 -translate-x-1.5 ml-0'
                  }`}
                  aria-hidden="true"
                >
                  <ArrowRight size={18} className="shrink-0" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2 & 3. CONTINUOUS FULL-WIDTH ALLIANZ ARENA GAMES ATMOSPHERE
          ========================================================= */}
      <section id="games-section" className="relative w-full overflow-hidden bg-[#070b12] -mt-10 sm:-mt-14 md:-mt-18 lg:-mt-22 pt-2 sm:pt-3 pb-8 sm:pb-10 md:pb-12">
        {/* Full-width Continuous Stadium Background across the entire Games area — Crisp architecture and floodlights */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none scale-105"
          style={{ 
            backgroundImage: "url('/images/allianz-arena-games.jpg')",
            backgroundPosition: "center 18%",
            backgroundSize: "cover",
            filter: "contrast(1.08) brightness(1.05)"
          }}
        />

        {/* Directional contrast overlay: strengthened dark negative space behind the left-side text, softly tapering to keep stadium atmosphere, architecture, and lighting clearly visible */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: "linear-gradient(to right, rgba(7, 11, 18, 0.90) 0%, rgba(7, 11, 18, 0.84) 34%, rgba(7, 11, 18, 0.52) 65%, rgba(7, 11, 18, 0.20) 100%), linear-gradient(to bottom, rgba(7, 11, 18, 0.50) 0%, rgba(7, 11, 18, 0.28) 18%, rgba(7, 11, 18, 0.45) 45%, rgba(7, 11, 18, 0.82) 75%, #070b12 100%)"
          }}
        />

        {/* Subtle, restrained top fade transition from Hero (reduced opacity so floodlights are not buried) */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#070b12]/80 via-[#070b12]/30 to-transparent pointer-events-none" />

        {/* Clean dark navy edge fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 sm:h-24 bg-gradient-to-t from-[#070b12] to-transparent pointer-events-none" />

        {/* Centered Constrained Content Container matching max-w-6xl */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          
          {/* =========================================================
              UPCOMING FIXTURE: NEXT MATCH
              ========================================================= */}
          <NextMatchBanner onNavigate={onNavigate} />

          {/* =========================================================
              FEATURED GAME: BLIND PICK
              ========================================================= */}
          <div 
            id="mystery-player-section"
            ref={mysteryPlayerRef}
            className="space-y-4 pt-4 sm:pt-6 scroll-mt-20 sm:scroll-mt-24"
          >
            {/* Section Eyebrow Header */}
            <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
              <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
              <span>FEATURED CHALLENGE</span>
            </div>

            {/* Editorial Content Layout sitting seamlessly on the stadium background (No rigid borders or boxes) */}
            <div className="py-6 sm:py-8 lg:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12">
                {/* Left Column (7 cols): Game Metadata, Typography & CTA */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
                  {/* 1. Status / Metadata Eyebrow */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-display uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#dc052d]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                      AVAILABLE NOW
                    </span>
                    <span className="text-gray-600 select-none" aria-hidden="true">·</span>
                    <span className="text-gray-400 font-medium">
                      11 POSITIONS · TACTICAL XI DRAFT
                    </span>
                  </div>

                  {/* 2. Dominant Title */}
                  <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[0.95]">
                    {featuredGame.title}
                  </h2>

                  {/* 3. Concise Description */}
                  <p className="text-base sm:text-lg text-gray-200 font-sans font-medium max-w-lg leading-relaxed tracking-normal">
                    One player revealed. One player hidden. Can you make the right choice?
                  </p>

                  {/* 4. Editorial Metadata (Clean typography without boxes/pills) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-display uppercase tracking-wider text-gray-300 font-semibold pt-0.5">
                    <span>11 PLAYERS</span>
                    <span className="text-gray-600 select-none" aria-hidden="true">·</span>
                    <span>4-3-3 FORMATION</span>
                    <span className="text-gray-600 select-none" aria-hidden="true">·</span>
                    <span>BLIND SELECTION</span>
                  </div>

                  {/* 5. Primary Contained CTA Button with subtle hover transition & arrow slide */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      onClick={handlePlayFeatured}
                      className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out shadow-md cursor-pointer group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      <span>PLAY NOW</span>
                      <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1.5" />
                    </button>
                  </div>
                </div>

                {/* Right Column (5 cols): Integrated Mystery Player Visual (Seamless Multi-Gradient Edge Mask) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center text-center select-none py-2 lg:py-0">
                  <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[430px] h-[400px] sm:h-[460px] lg:h-[510px] flex items-end justify-center group/player">
                    {/* Subtle restrained environmental red spill light matched to stadium floodlights (no artificial outline or glow) */}
                    <div 
                      className="absolute inset-0 pointer-events-none" 
                      style={{
                        background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(220, 5, 45, 0.12) 0%, rgba(220, 5, 45, 0.03) 50%, transparent 75%)'
                      }}
                    />

                    {/* Integrated Mystery Player Asset: multi-gradient masking (radial + linear) with soft irregular transitions */}
                    <img
                      src="/images/mystery-player.png"
                      alt="FC Bayern Blind Pick"
                      className="relative z-10 w-full h-full object-contain object-bottom pointer-events-none select-none transition-transform duration-300 ease-out group-hover/player:scale-[1.015]"
                      style={{
                        maskImage: 'radial-gradient(ellipse 72% 70% at 52% 48%, black 46%, rgba(0,0,0,0.85) 62%, transparent 96%), linear-gradient(to bottom, transparent 0%, black 5%, black 78%, transparent 98%), linear-gradient(to right, transparent 0%, black 10%, black 82%, transparent 98%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 72% 70% at 52% 48%, black 46%, rgba(0,0,0,0.85) 62%, transparent 96%), linear-gradient(to bottom, transparent 0%, black 5%, black 78%, transparent 98%), linear-gradient(to right, transparent 0%, black 10%, black 82%, transparent 98%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in',
                        filter: 'contrast(1.02) brightness(1.01)'
                      }}
                    />
                  </div>

                  <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider mt-3 sm:mt-4 block">
                    11 POSITIONS · COMPLETE THE XI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================
              MORE GAMES SECTION
              ========================================================= */}
          <div className="space-y-6 pt-4 sm:pt-6">
            {/* Header: Kicker, Title, Description (Soft subtle border) */}
            <div className="border-b border-[#182233]/70 pb-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-[#dc052d]" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                    TACTICAL &amp; ARCHIVE
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight">
                  MORE GAMES
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-display leading-relaxed max-w-xl">
                  Upcoming tactical challenges and historical campaigns entering through the tunnel.
                </p>
              </div>
            </div>

            {/* Foreground Games: Wide Editorial Showcase */}
            <div className="space-y-10 sm:space-y-12">
              {/* GAME 1: ROAD TO GLORY (WIDE EDITORIAL CAMPAIGN SPREAD, 90-95% CONTENT WIDTH) */}
              <div className="w-full space-y-4">
                {/* 1. Category & Status Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-bold uppercase tracking-widest text-[#fdb913]">
                      ROAD TO GLORY
                    </span>
                    <span className="text-gray-600 text-xs">/</span>
                    <span className="text-xs font-display font-semibold uppercase tracking-wider text-gray-400">
                      HISTORICAL MOMENTS
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#fdb913]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fdb913] animate-pulse" />
                    AVAILABLE NOW
                  </span>
                </div>

                {/* 2. Milestone Selectors — Clean Editorial Tab Navigation */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-1.5 scrollbar-none select-none">
                  {ROAD_TO_GLORY_MILESTONES.map((milestone, idx) => {
                    const isAvailable = milestone.id === '2020-the-sextuple' || milestone.status === 'available';
                    const isSelected = milestone.id === activeMilestone.id;

                    return (
                      <React.Fragment key={milestone.id}>
                        {idx > 0 && (
                          <span className="shrink-0 text-white/20 text-xs px-1 select-none" aria-hidden="true">
                            ·
                          </span>
                        )}
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => setActiveMilestoneId(milestone.id)}
                            className={`relative py-1 px-1.5 sm:px-2 text-xs font-display font-bold uppercase tracking-wider transition-colors duration-200 cursor-pointer shrink-0 focus-visible:outline-hidden focus-visible:text-[#fdb913] ${
                              isSelected
                                ? 'text-[#fdb913]'
                                : 'text-gray-400 hover:text-gray-100'
                            }`}
                          >
                            <span>{milestone.label}</span>
                            {isSelected && (
                              <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-[#fdb913] rounded-full" />
                            )}
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 py-1 px-1 sm:px-1.5 text-xs font-display font-medium uppercase tracking-wider text-gray-500 cursor-default shrink-0 select-none"
                            title="Coming Soon"
                          >
                            <span>{milestone.label}</span>
                            <span className="text-[9px] font-display font-bold tracking-widest text-gray-400 uppercase bg-white/5 border border-white/10 px-1.5 py-0.5 rounded leading-none">
                              COMING SOON
                            </span>
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* 3. Wide Editorial Spread Container (58% Text / 42% Visual, Multi-Layer Seamless Edge Blending) */}
                <div className="relative w-full overflow-hidden select-none group/rtg min-h-[440px] lg:min-h-[470px] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  {/* DESKTOP & TABLET: Seamless Full-Width Background with Prominent Ball on the Right */}
                  <div 
                    className="hidden md:block absolute inset-0 pointer-events-none select-none"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 100%), linear-gradient(to bottom, transparent 0%, black 4%, black 96%, transparent 100%)',
                      maskComposite: 'intersect',
                      WebkitMaskComposite: 'source-in'
                    }}
                  >
                    {/* The Champions League football photograph anchored prominently on the right */}
                    <div 
                      className="absolute inset-0 bg-no-repeat"
                      style={{
                        backgroundImage: `url(${activeMilestone.bgImage || '/images/champions-league-ball.png'})`,
                        backgroundPosition: 'right 30px center',
                        backgroundSize: 'cover'
                      }}
                    />
                    {/* Directional gradient: strong dark contrast behind text on the left, smoothly reducing toward the right so football is clearly visible */}
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(to right, #070b12 0%, #070b12 34%, rgba(7, 11, 18, 0.88) 46%, rgba(7, 11, 18, 0.42) 58%, rgba(7, 11, 18, 0.08) 68%, transparent 78%)'
                      }}
                    />
                  </div>

                  {/* MOBILE VIEW: Seamless Upper Ball Showcase with Smooth Radial & Downward Feathering */}
                  <div className="block md:hidden relative w-full h-52 sm:h-56 overflow-hidden pointer-events-none select-none -mx-6 -mt-6 mb-6">
                    <div 
                      className="absolute inset-0 bg-no-repeat"
                      style={{
                        backgroundImage: `url(${activeMilestone.bgImage || '/images/champions-league-ball.png'})`,
                        backgroundPosition: 'center 42%',
                        backgroundSize: 'cover',
                        maskImage: 'radial-gradient(ellipse 90% 85% at 50% 42%, black 65%, rgba(0,0,0,0.9) 80%, transparent 100%), linear-gradient(to bottom, black 0%, black 76%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at 50% 42%, black 65%, rgba(0,0,0,0.9) 80%, transparent 100%), linear-gradient(to bottom, black 0%, black 76%, transparent 100%)',
                        maskComposite: 'intersect',
                        WebkitMaskComposite: 'source-in'
                      }}
                    />
                    {/* Small Elegant Lisbon 2020 Label (No Clunky Box) */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-widest text-[#fdb913]">
                      <Trophy size={11} className="text-[#fdb913]" />
                      <span>{activeMilestone.badge}</span>
                    </div>
                  </div>

                  {/* Two-Column Grid Layout: 58% Text / 42% Visual */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                    {/* Left Column (58%): Spacious Typography, Unconstrained Width, Relaxed Copy */}
                    <div className="lg:col-span-7 space-y-5 text-left">
                      {/* 1. Kicker & Lisbon 2020 Indicator */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-display font-bold uppercase tracking-widest text-[#fdb913]">
                          {activeMilestone.kicker}
                        </span>
                        <span className="text-gray-600 text-xs select-none">·</span>
                        <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-400">
                          {activeMilestone.subtitle}
                        </span>
                        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-display font-bold uppercase tracking-wider text-[#fdb913] ml-2">
                          <Trophy size={11} className="text-[#fdb913]" />
                          <span>{activeMilestone.badge}</span>
                        </span>
                      </div>

                      {/* 2. Main Heading (Oswald, 38-42px) */}
                      <h4 className="font-display font-black text-3xl sm:text-[38px] lg:text-[42px] text-white tracking-tight uppercase leading-[1.05]">
                        {activeMilestone.title}
                      </h4>

                      {/* 3. Description (Plus Jakarta Sans, 15-16px, Relaxed Line-Height, Unconstrained Width) */}
                      <p className="font-sans text-[15px] sm:text-base text-gray-300 leading-relaxed max-w-xl font-normal">
                        {activeMilestone.description}
                      </p>

                      {/* 4. Statistics Row (Clean Horizontal Row with Appropriate Gaps & Subtle Dividers) */}
                      <div className="space-y-3 pt-2 sm:pt-3">
                        <div className="flex items-center gap-6 sm:gap-8">
                          <div className="text-left">
                            <span className="font-display font-black text-3xl sm:text-[36px] lg:text-[40px] text-white tracking-tight block leading-none">
                              {activeMilestone.statPrimary}
                            </span>
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#fdb913] mt-1.5 block">
                              {activeMilestone.statPrimaryLabel}
                            </span>
                          </div>

                          <div className="h-9 w-px bg-white/20 select-none" aria-hidden="true" />

                          <div className="text-left">
                            <span className="font-display font-black text-3xl sm:text-[36px] lg:text-[40px] text-[#fdb913] tracking-tight block leading-none">
                              {activeMilestone.statSecondary}
                            </span>
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-300 mt-1.5 block">
                              {activeMilestone.statSecondaryLabel}
                            </span>
                          </div>

                          <div className="h-9 w-px bg-white/20 select-none" aria-hidden="true" />

                          <div className="text-left">
                            <span className="font-display font-black text-3xl sm:text-[36px] lg:text-[40px] text-white tracking-tight block leading-none">
                              {activeMilestone.statTertiary}
                            </span>
                            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#fdb913] mt-1.5 block">
                              {activeMilestone.statTertiaryLabel}
                            </span>
                          </div>
                        </div>

                        {/* Supporting Metadata Line */}
                        <div className="text-xs font-display font-semibold uppercase tracking-wider text-gray-400 pt-1">
                          {activeMilestone.stats.split(' · ').map((tag, idx, arr) => (
                            <React.Fragment key={tag}>
                              <span>{tag}</span>
                              {idx < arr.length - 1 && <span className="mx-2 text-gray-600 select-none">·</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* 5. Primary Interactive Gold CTA Button */}
                      <div className="pt-4 sm:pt-5">
                        <button
                          onClick={() => handleNavigateMilestone(activeMilestone.eventId)}
                          className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-md bg-[#fdb913] hover:bg-[#e0a20f] text-black font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer shadow-md group hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 select-none"
                        >
                          <span>EXPLORE THE JOURNEY</span>
                          <ArrowRight size={15} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>

                    {/* Right Column (42%): Visual Anchor Area (Empty div to hold grid spacing on desktop) */}
                    <div className="hidden lg:block lg:col-span-5 min-h-[360px]" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          4. CLUB ARCHIVE / STORIES & SILVERWARE (FULL-WIDTH SUPPORTERS ATMOSPHERE)
          ========================================================= */}
      <section className="relative w-full overflow-hidden bg-[#070b12] pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-14">
        {/* Full-width Bayern Supporters + Players Background */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
          style={{ 
            backgroundImage: "url('/images/bayern-supporters-archive.jpg')",
            backgroundPosition: "center 20%",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat"
          }}
        />

        {/* 50-60% Base Dark Contrast Overlay */}
        <div className="absolute inset-0 bg-[#070b12]/50 pointer-events-none" />

        {/* Subtle vertical and text contrast gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12] via-[#070b12]/30 to-[#070b12]/65 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/60 via-[#070b12]/15 to-transparent pointer-events-none" />

        {/* Short, clean dark edge fade at top and into footer */}
        <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-gradient-to-b from-[#070b12] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#070b12] to-transparent pointer-events-none" />

        {/* Centered Constrained Content Container matching max-w-6xl */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[#dc052d] block">
                CLUB ARCHIVE &amp; HISTORY
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-wide">
                STORIES &amp; SILVERWARE
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-display max-w-xl">
                The trophies that shaped Bayern&apos;s history and the moments that defined Germany&apos;s greatest club.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('/timeline')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#dc052d]/15 hover:bg-[#dc052d]/25 text-[#dc052d] hover:text-white border border-[#dc052d]/40 hover:border-[#dc052d]/60 text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 ease-out cursor-pointer shrink-0 hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
            >
              <span>EXPLORE TIMELINE</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* One Featured Archive Card (Beckenbauer) */}
          <div className="pt-1">
            <FunFactCard 
              fact={HOMEPAGE_FEATURED_FACT} 
              onNavigate={onNavigate || (() => onSelectGame && onSelectGame('/archive'))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
