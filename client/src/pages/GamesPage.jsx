import React, { useState } from 'react';
import { sounds } from '../utils/audio';

export default function GamesPage({ onNavigate, onSelectGame }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const handlePlayGame = (gameOrRoute) => {
    sounds.playWhistle();
    const route = typeof gameOrRoute === 'string' ? gameOrRoute : gameOrRoute?.route;
    const isExternal = typeof gameOrRoute === 'object' ? (gameOrRoute.isExternal || route?.startsWith('http')) : route?.startsWith('http');

    if (isExternal && route) {
      window.open(route, '_blank', 'noopener,noreferrer');
      return;
    }
    if (onSelectGame) {
      onSelectGame(route);
    } else if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <div className="relative flex-1 w-full flex flex-col text-left font-display min-h-screen bg-[#070b12] overflow-x-hidden isolate">
      {/* Unified Atmospheric Games Page Background (bg5.png) */}
      <div 
        className="fixed inset-0 w-full h-full pointer-events-none select-none -z-10 overflow-hidden" 
        aria-hidden="true"
      >
        {/* bg5.png scaled proportionally to page width, preserving aspect ratio (1672/941) without vertical stretching */}
        <div 
          className="w-full h-full transition-opacity duration-300"
          style={{
            backgroundImage: "url('/images/bg5.png')",
            backgroundPosition: "center top",
            backgroundSize: "100% auto",
            backgroundRepeat: "no-repeat",
            opacity: 0.36
          }}
        />
        {/* Subtle dark overlay and vertical continuation gradient to blend naturally into dark Bayern aesthetic */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/22 via-[#070b12]/48 to-[#070b12]/92 pointer-events-none" />
      </div>
      {/* 1. Games Hub Hero Banner (Allianz Arena Atmospheric Header) */}
      <section className="relative w-full overflow-hidden bg-transparent pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 min-h-[220px] sm:min-h-[260px] flex flex-col justify-start">
        {/* Subtle top hero atmospheric gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070b12]/30 to-[#070b12]/70 pointer-events-none" />

        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-3 text-left">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-[11px] font-bold uppercase tracking-widest text-[#dc052d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d] animate-pulse" />
            <span>FC BAYERN MÜNCHEN · INTERACTIVE HUB</span>
          </div>

          {/* Primary Headline */}
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight uppercase leading-none">
            FAN GAMES & CHALLENGES
          </h1>

          {/* Supporting Copy */}
          <p className="text-sm sm:text-base text-gray-300 font-normal max-w-2xl leading-relaxed">
            Test your football knowledge, tactical acumen, and transfer instincts across Bayern-themed interactive challenges and squad builders.
          </p>

          {/* Filter Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Games (3)' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#dc052d] text-white shadow-xs cursor-pointer"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Games Grid Container */}
      <div className="w-full bg-transparent pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* SECTION: WOULD YOU RATHER FULL-WIDTH FEATURED BANNER */}
          {(activeFilter === 'all' || activeFilter === 'playable') && (
            <section className="w-full select-none" aria-label="Would You Rather">
              <div
                onClick={() => handlePlayGame('/would-you-rather')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayGame('/would-you-rather');
                  }
                }}
                className="w-full block overflow-hidden cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.008] active:scale-[0.995] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]"
                title="Play Would You Rather"
                aria-label="Play Would You Rather"
              >
                <img
                  src="/images/bg2.png"
                  alt="Would You Rather"
                  className="w-full h-auto block select-none pointer-events-none transition-[filter,transform] duration-200 ease-out"
                  style={{
                    aspectRatio: '1774 / 887',
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'brightness(0.78) contrast(1.05) saturate(1.08)'
                  }}
                  loading="eager"
                />
              </div>
            </section>
          )}

          {/* SECTION: ROAD TO IMMORTALITY FULL-WIDTH FEATURED BANNER */}
          {(activeFilter === 'all' || activeFilter === 'playable') && (
            <section className="w-full select-none" aria-label="Road to Immortality">
              <div
                onClick={() => handlePlayGame('/road-to-immortality')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayGame('/road-to-immortality');
                  }
                }}
                className="w-full block overflow-hidden cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.008] active:scale-[0.995] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]"
                title="Play Road to Immortality"
                aria-label="Play Road to Immortality"
              >
                <img
                  src="/images/bg3.png"
                  alt="Road to Immortality"
                  className="w-full h-auto block select-none pointer-events-none"
                  style={{ aspectRatio: '1672 / 941', width: '100%', height: 'auto', display: 'block' }}
                  loading="eager"
                />
              </div>
            </section>
          )}

          {/* SECTION: WHO AM I? FULL-WIDTH FEATURED BANNER */}
          {(activeFilter === 'all' || activeFilter === 'playable') && (
            <section className="w-full select-none" aria-label="Who Am I?">
              <div
                onClick={() => handlePlayGame('/guess-player')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePlayGame('/guess-player');
                  }
                }}
                className="w-full block overflow-hidden cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.008] active:scale-[0.995] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]"
                title="Play Who Am I?"
                aria-label="Play Who Am I?"
              >
                <img
                  src="/images/bg4.png"
                  alt="Who Am I?"
                  className="w-full h-auto block select-none pointer-events-none"
                  style={{ aspectRatio: '1672 / 941', width: '100%', height: 'auto', display: 'block' }}
                  loading="eager"
                />
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
