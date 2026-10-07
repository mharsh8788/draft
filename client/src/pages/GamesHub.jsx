import React, { useState } from 'react';
import { GAMES } from '../data/games';
import { HOMEPAGE_FEATURED_FACT } from '../data/facts';
import FunFactCard from '../components/FunFactCard';
import NextMatchBanner from '../components/NextMatchBanner';
import { sounds } from '../utils/audio';
import { ArrowRight, Clock, Shield } from 'lucide-react';

export default function GamesHub({ onSelectGame, onNavigate }) {
  const featuredGame = GAMES.find((g) => g.featured) || GAMES[0];
  const moreGames = GAMES.filter((g) => !g.featured);

  // Coordinated CTA button interaction group state
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
    }
  };

  const handleScrollToGames = () => {
    const el = document.getElementById('games-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      handlePlayFeatured();
    }
  };

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
                onClick={handleScrollToGames}
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
        {/* Full-width Continuous Stadium Background across the entire Games area */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
          style={{ 
            backgroundImage: "url('/images/allianz-arena-games.jpg')",
            backgroundPosition: "center center",
            backgroundSize: "cover"
          }}
        />

        {/* Dark Overlay so the stadium background remains atmospheric without competing with cards */}
        <div className="absolute inset-0 bg-[#070b12]/65 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/80 via-[#070b12]/50 to-[#070b12]/80 pointer-events-none" />

        {/* Subtle Soft Dark Edge Fade at Top to blend smoothly with Hero */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#070b12] via-[#070b12]/50 to-transparent pointer-events-none" />

        {/* Short, clean dark navy edge fade at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-[#070b12] to-transparent pointer-events-none" />

        {/* Centered Constrained Content Container matching max-w-6xl */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">
          
          {/* =========================================================
              UPCOMING FIXTURE: NEXT MATCH
              ========================================================= */}
          <NextMatchBanner onNavigate={onNavigate} />

          {/* =========================================================
              FEATURED GAME: MYSTERY PLAYER
              ========================================================= */}
          <div className="space-y-4 pt-4 sm:pt-6">
            {/* Section Eyebrow Header */}
            <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
              <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
              <span>FEATURED CHALLENGE</span>
            </div>

            {/* Editorial Content Layout sitting directly on the homepage background */}
            <div className="border-y border-[#1c2535] py-8 sm:py-10">
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
                  <p className="text-base sm:text-lg text-gray-300 font-display font-medium max-w-lg leading-relaxed tracking-wide">
                    {featuredGame.tagline}
                  </p>

                  {/* 4. Editorial Metadata (Clean typography without boxes/pills) */}
                  {featuredGame.badges && featuredGame.badges.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs font-display uppercase tracking-wider text-gray-400 font-medium pt-0.5">
                      {featuredGame.badges.map((badge, idx) => (
                        <React.Fragment key={idx}>
                          <span>{badge}</span>
                          {idx < featuredGame.badges.length - 1 && (
                            <span className="text-gray-600 select-none" aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* 5. Primary Contained CTA Button */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      onClick={handlePlayFeatured}
                      className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out shadow-lg cursor-pointer group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      <span>PLAY NOW</span>
                      <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Right Column (5 cols): Integrated Mystery Player Visual */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center text-center select-none py-4 lg:py-0">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                    {/* Transparent Footballer Silhouette */}
                    <img
                      src="/images/mystery-silhouette-white.png"
                      alt="Mystery Player Silhouette"
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />

                    {/* Prominent Question Mark Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-display font-black text-6xl sm:text-7xl text-white drop-shadow-xl -mt-1">
                        ?
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider mt-3">
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
            {/* Header: Kicker, Title, Description */}
            <div className="border-b border-[#1c2535] pb-4">
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
                  Upcoming tactical challenges and archive career puzzles entering through the tunnel.
                </p>
              </div>
            </div>

            {/* Foreground Games: Open Editorial Two-Column Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 relative items-stretch">
              {/* GAME 1: SEASON STRATEGY (38–0) */}
              <div className="flex flex-col justify-between space-y-5 md:pr-8 lg:pr-10">
                {/* Category & Status Header Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-400">
                    SEASON STRATEGY
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    COMING SOON
                  </span>
                </div>

                {/* Tactical Visual Graphic */}
                <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-[#090e17] border border-[#1c2535] flex items-center justify-center select-none">
                  {/* Subtle pitch pattern watermark */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none pitch-pattern" />

                  {/* Subtle tactical pitch markings */}
                  <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 400 200">
                    <line x1="200" y1="0" x2="200" y2="200" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="200" cy="100" r="44" fill="none" stroke="#ffffff" strokeWidth="1" />
                    <circle cx="200" cy="100" r="2.5" fill="#ffffff" />
                    <path d="M 110 145 Q 160 115 190 100" fill="none" stroke="#dc052d" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                    <path d="M 290 55 Q 240 85 210 100" fill="none" stroke="#dc052d" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
                  </svg>

                  {/* 38-0 Scoreboard Concept in Pure Typography */}
                  <div className="relative z-10 flex items-center gap-6 sm:gap-8">
                    <div className="text-center">
                      <span className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight block leading-none">
                        38
                      </span>
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 mt-1.5 block">
                        MATCHES
                      </span>
                    </div>

                    <div className="h-8 w-px bg-white/15" />

                    <div className="text-center">
                      <span className="font-display font-black text-4xl sm:text-5xl text-[#dc052d] tracking-tight block leading-none">
                        0
                      </span>
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d] mt-1.5 block">
                        LOSSES
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Hierarchy */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-display font-bold uppercase tracking-widest text-gray-400 block">
                      SINGLE-SEASON SIMULATION
                    </span>
                    <h4 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
                      38–0
                    </h4>
                    <p className="text-sm text-gray-300 font-display leading-relaxed">
                      Can you guide Bayern through an unbeaten Bundesliga campaign?
                    </p>
                  </div>

                  {/* Plain Editorial Typography Tags */}
                  <div className="text-xs font-display font-bold uppercase tracking-wider text-gray-400">
                    <span>38 MATCHES</span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span>STRATEGY</span>
                  </div>
                </div>

                {/* Restrained Editorial Disabled CTA */}
                <div className="pt-2">
                  <div
                    aria-disabled="true"
                    className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-gray-500 select-none py-1.5"
                  >
                    <span>COMING SOON</span>
                    <ArrowRight size={14} className="text-gray-600" />
                  </div>
                </div>
              </div>

              {/* GAME 2: CAREER PUZZLE (WHO AM I?) */}
              <div className="flex flex-col justify-between space-y-5 md:pl-8 lg:pl-10 md:border-l md:border-[#1c2535] border-t md:border-t-0 border-[#1c2535] pt-8 md:pt-0">
                {/* Category & Status Header Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-display font-bold uppercase tracking-widest text-[#dc052d]">
                    CAREER PUZZLE
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                    AVAILABLE NOW
                  </span>
                </div>

                {/* Editorial Visual Graphic */}
                <div className="relative w-full h-44 sm:h-48 rounded-lg overflow-hidden bg-[#090e17] border border-[#1c2535] flex items-center justify-center select-none">
                  {/* Existing historical collage background image */}
                  <img
                    src="/images/bayern-historical-collage.jpg"
                    alt="Bayern Historical Archive"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-30 blur-[0.5px] scale-105 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090e17] via-[#090e17]/75 to-[#090e17]/85 pointer-events-none" />

                  {/* Deduction Trail in Pure Editorial Typography */}
                  <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                    <div className="text-center">
                      <span className="font-display font-black text-xl sm:text-2xl text-white tracking-tight block leading-none">
                        1999
                      </span>
                      <span className="text-[9px] font-display font-bold uppercase tracking-widest text-gray-400 mt-1 block">
                        DEBUT
                      </span>
                    </div>

                    <div className="w-5 sm:w-7 h-px bg-[#dc052d]" />

                    <div className="text-center">
                      <span className="font-display font-black text-xl sm:text-2xl text-[#dc052d] tracking-tight block leading-none">
                        FCB
                      </span>
                      <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#dc052d]/80 mt-1 block">
                        PEAK
                      </span>
                    </div>

                    <div className="w-5 sm:w-7 h-px bg-white/20" />

                    <div className="text-center">
                      <span className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight block leading-none">
                        ?
                      </span>
                      <span className="text-[9px] font-display font-bold uppercase tracking-widest text-gray-400 mt-1 block">
                        WHO
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Hierarchy */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-xs font-display text-[#dc052d] font-bold block uppercase tracking-widest">
                      DEDUCTION CHALLENGE
                    </span>
                    <h4 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
                      WHO AM I?
                    </h4>
                    <p className="text-sm text-gray-300 font-display leading-relaxed">
                      Trace a Bayern player's career from clues.
                    </p>
                  </div>

                  {/* Plain Editorial Typography Tags */}
                  <div className="text-xs font-display font-bold uppercase tracking-wider text-gray-400">
                    <span>CAREER</span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span>PUZZLE</span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span>DEDUCTION</span>
                  </div>
                </div>

                {/* Primary Interactive Bayern-Red CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => onSelectGame ? onSelectGame('/guess-player') : onNavigate && onNavigate('/guess-player')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer shadow-sm group hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 select-none"
                  >
                    <span>PLAY NOW</span>
                    <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
                  </button>
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
