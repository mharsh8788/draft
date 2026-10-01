import React from 'react';
import { GAMES } from '../data/games';
import { HOMEPAGE_FEATURED_FACT } from '../data/facts';
import FunFactCard from '../components/FunFactCard';
import { sounds } from '../utils/audio';
import { ArrowRight, Clock, Shield } from 'lucide-react';

export default function GamesHub({ onSelectGame, onNavigate }) {
  const featuredGame = GAMES.find((g) => g.featured) || GAMES[0];
  const moreGames = GAMES.filter((g) => !g.featured);

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

            {/* Action CTA Buttons */}
            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={handleScrollToGames}
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out shadow-lg cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group/btn select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <span>EXPLORE GAMES</span>
                <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('/timeline')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase border border-white/10 hover:border-white/25 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
              >
                <span>BAYERN TIMELINE</span>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('/archive')}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase border border-white/10 hover:border-white/25 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
              >
                <span>CLUB ARCHIVE</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2 & 3. CONTINUOUS FULL-WIDTH ALLIANZ ARENA GAMES ATMOSPHERE
          ========================================================= */}
      <section id="games-section" className="relative w-full overflow-hidden bg-[#070b12] py-8 sm:py-10 md:py-12">
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
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          
          {/* =========================================================
              FEATURED GAME: MYSTERY PLAYER
              ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
              <span className="w-2 h-2 rounded-full bg-[#dc052d] animate-pulse" />
              <span>FEATURED CHALLENGE</span>
            </div>

            {/* Featured Game Card: Desktop Horizontal / Mobile Stacked */}
            <div className="bg-[#121824]/95 backdrop-blur-sm border border-[#1c2535] hover:border-[#dc052d]/35 rounded-xl overflow-hidden transition-all duration-200 ease-out shadow-2xl hover:-translate-y-0.5">
              {/* Desktop Layout (Horizontal Grid) */}
              <div className="hidden lg:grid lg:grid-cols-12 items-stretch">
                {/* Left Column (7 cols): Game Metadata, Typography & CTA */}
                <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Quiet Metadata Bar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px] font-display font-bold text-gray-300 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                        Available Now
                      </span>
                      <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider">
                        11 Positions • Tactical XI Draft
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase leading-none">
                      {featuredGame.title}
                    </h2>

                    {/* Concise Description */}
                    <p className="text-base text-gray-300 font-display font-medium max-w-lg leading-relaxed tracking-wide">
                      {featuredGame.tagline}
                    </p>

                    {/* Badges */}
                    {featuredGame.badges && featuredGame.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {featuredGame.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-display font-bold text-gray-300 uppercase tracking-wider"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Button */}
                  <div className="pt-2">
                    <button
                      onClick={handlePlayFeatured}
                      className="inline-flex items-center gap-3 px-7 py-3.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out shadow-md cursor-pointer group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      <span>PLAY NOW</span>
                      <ArrowRight size={18} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* Right Column (5 cols): Tactical Pitch Silhouette Centerpiece */}
                <div className="lg:col-span-5 relative bg-[#090e16]/80 border-l border-[#1c2535] flex items-center justify-center p-8 overflow-hidden select-none">
                  {/* Subtle Pitch Geometry Overlay */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none pitch-pattern" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    <div className="w-52 h-52 rounded-full border border-white/20" />
                    <div className="w-80 h-80 rounded-full border border-white/10 absolute" />
                  </div>

                  {/* Tactical Silhouette & High-Contrast Question Mark */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      {/* Transparent Footballer Silhouette */}
                      <img
                        src="/images/mystery-silhouette-white.png"
                        alt="Mystery Player Silhouette"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(220,5,45,0.45)]"
                      />

                      {/* Prominent Question Mark Badge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-display font-black text-6xl text-white drop-shadow-[0_2px_10px_rgba(220,5,45,0.85)] -mt-1">
                          ?
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider mt-2">
                      11 Positions • Complete the XI
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="lg:hidden flex flex-col p-6 space-y-5">
                {/* 1. Kicker */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-300 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                    Available Now
                  </span>
                  <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider">
                    11 Positions • Tactical XI Draft
                  </span>
                </div>

                {/* 2. Visual Centerpiece */}
                <div className="relative h-44 bg-[#090e16]/80 border border-[#1c2535] rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-15 pointer-events-none pitch-pattern" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <img
                        src="/images/mystery-silhouette-white.png"
                        alt="Mystery Player Silhouette"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(220,5,45,0.45)]"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="font-display font-black text-5xl text-white drop-shadow-[0_2px_8px_rgba(220,5,45,0.85)] -mt-1">
                          ?
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Game Title */}
                <h2 className="font-display font-black text-3xl text-white tracking-tight uppercase leading-none">
                  {featuredGame.title}
                </h2>

                {/* 4. Description */}
                <p className="text-sm text-gray-300 font-display font-medium leading-relaxed tracking-wide">
                  {featuredGame.tagline}
                </p>

                {/* Badges */}
                {featuredGame.badges && featuredGame.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredGame.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-300 uppercase tracking-wider"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* 5. Primary CTA */}
                <button
                  onClick={handlePlayFeatured}
                  className="w-full py-3 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out shadow-sm cursor-pointer flex items-center justify-center gap-2 group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                >
                  <span>PLAY NOW</span>
                  <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================
              MORE GAMES SECTION
              ========================================================= */}
          <div className="space-y-6">
            {/* Header: Kicker, Title, Description, and Badges */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1c2535] pb-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-[#dc052d]" />
                  <span className="text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                    EXPANDING CATALOG
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight">
                  MORE GAMES
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 font-display leading-relaxed max-w-xl">
                  Upcoming tactical challenges and archive career puzzles entering through the tunnel.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-display font-bold text-gray-300 uppercase tracking-wider">
                  {moreGames.length} in development
                </span>
              </div>
            </div>

            {/* Foreground Game Cards Grid: 38-0 and WHO AM I? */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GAME 1: 38–0 */}
              <div className="bg-[#121824] border border-[#1c2535] hover:border-[#2a3548] rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out shadow-2xl hover:-translate-y-0.5">
                {/* Visual Treatment: Bundesliga 38-0 Tracker Motif */}
                <div className="relative h-40 sm:h-44 bg-[#090e16] border-b border-[#1c2535] flex items-center justify-center select-none overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none pitch-pattern" />
                  
                  {/* Category Kicker (Top-Left) */}
                  <span className="absolute top-3 left-3 text-[10px] font-display font-bold uppercase tracking-wider text-gray-400">
                    SEASON STRATEGY
                  </span>

                  {/* 38 and 0 Centered Scoreboard Graphic */}
                  <div className="relative z-10 flex items-center gap-4 bg-[#111927] px-6 py-3 rounded-lg border border-[#1c2535]">
                    <div className="text-center">
                      <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight block leading-none">
                        38
                      </span>
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-gray-400 mt-1 block">
                        Matches
                      </span>
                    </div>

                    <div className="text-xl font-display font-bold text-gray-600 px-1">—</div>

                    <div className="text-center">
                      <span className="font-display font-black text-3xl sm:text-4xl text-[#dc052d] tracking-tight block leading-none">
                        0
                      </span>
                      <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[#dc052d] mt-1 block">
                        Losses
                      </span>
                    </div>
                  </div>

                  {/* Status Badge (Top-Right) */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
                      <Clock size={11} className="text-gray-400" />
                      COMING SOON
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-gray-400 block">
                      Single-Season Simulation
                    </span>
                    <h4 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
                      38–0
                    </h4>
                    <p className="text-sm text-gray-300 font-display leading-relaxed">
                      Can you guide Bayern through an unbeaten Bundesliga campaign?
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
                        38 MATCHES
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
                        STRATEGY
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      disabled
                      aria-disabled="true"
                      className="w-full py-3 px-4 rounded-lg bg-white/5 text-gray-500 font-display font-bold text-xs tracking-wider uppercase border border-white/10 cursor-not-allowed flex items-center justify-center gap-2 select-none"
                    >
                      <Clock size={13} />
                      <span>COMING SOON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GAME 2: WHO AM I? */}
              <div className="bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 ease-out shadow-2xl hover:-translate-y-0.5">
                {/* Visual Treatment: Career Deduction Trail Motif */}
                <div className="relative h-40 sm:h-44 bg-[#090e16] border-b border-[#1c2535] flex items-center justify-center select-none overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none pitch-pattern" />

                  {/* Category Kicker (Top-Left) */}
                  <span className="absolute top-3 left-3 text-[10px] font-display font-bold uppercase tracking-wider text-[#dc052d]">
                    CAREER PUZZLE
                  </span>

                  {/* Transfer Trail / Career Milestones */}
                  <div className="relative z-10 flex items-center gap-2.5 bg-[#111927] px-5 py-3 rounded-lg border border-[#1c2535]">
                    <div className="px-2.5 py-1.5 rounded bg-[#1c2436] border border-white/10 flex flex-col items-center justify-center min-w-[50px]">
                      <span className="text-[11px] font-display font-bold text-gray-300 leading-none">1999</span>
                      <span className="text-[8px] font-display font-bold uppercase tracking-wider text-gray-500 mt-0.5">DEBUT</span>
                    </div>
                    <div className="w-3.5 h-0.5 bg-[#dc052d]" />
                    <div className="px-2.5 py-1.5 rounded bg-[#dc052d]/20 border border-[#dc052d]/40 flex flex-col items-center justify-center min-w-[50px]">
                      <span className="text-xs font-display font-black text-[#dc052d] leading-none">FCB</span>
                      <span className="text-[8px] font-display font-bold uppercase tracking-wider text-[#dc052d]/80 mt-0.5">PEAK</span>
                    </div>
                    <div className="w-3.5 h-0.5 bg-gray-600" />
                    <div className="w-10 h-9 rounded bg-[#1c2436] border border-white/10 flex items-center justify-center">
                      <span className="font-display font-black text-lg text-white leading-none">?</span>
                    </div>
                  </div>

                  {/* Status Badge (Top-Right) */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-[#dc052d]/20 text-[#dc052d] border border-[#dc052d]/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
                      AVAILABLE NOW
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-display text-[#dc052d] font-bold block uppercase tracking-wider">
                      Deduction Challenge
                    </span>
                    <h4 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase leading-tight">
                      WHO AM I?
                    </h4>
                    <p className="text-sm text-gray-300 font-display leading-relaxed">
                      Trace a Bayern player's career from clues.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
                        CAREER
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
                        PUZZLE
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-display font-bold text-gray-400 uppercase tracking-wider">
                        DEDUCTION
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => onSelectGame ? onSelectGame('/guess-player') : onNavigate && onNavigate('/guess-player')}
                      className="w-full py-3 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-2 shadow-sm select-none group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                    >
                      <span>PLAY NOW</span>
                      <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
                    </button>
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
