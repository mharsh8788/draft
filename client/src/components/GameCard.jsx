import React from 'react';
import { ArrowRight, Clock, HelpCircle, Trophy, GitFork, Shield, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameCard({ game, onPlay }) {
  const isAvailable = game.status === 'available';

  const handleAction = () => {
    if (isAvailable) {
      if (game?.route !== '/would-you-rather') {
        sounds.playWhistle();
      }
      if (game.isExternal || (game.route && game.route.startsWith('http'))) {
        window.open(game.route, '_blank', 'noopener,noreferrer');
      } else if (onPlay) {
        onPlay(game.route);
      }
    }
  };

  return (
    <div 
      onClick={handleAction}
      className={`flex flex-col bg-[#121824] border border-[#1c2535] rounded-xl overflow-hidden transition-all duration-200 ease-out shadow-md group text-left ${
        isAvailable ? 'hover:border-[#dc052d]/40 hover:-translate-y-0.5 cursor-pointer' : ''
      }`}
    >
      {/* Visual Centerpiece Banner - Distinct for each game! */}
      <div className="relative h-48 bg-[#0a0e14] border-b border-[#1c2535] overflow-hidden flex items-center justify-center select-none">
        {/* Subtle field grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-pattern" />

        {/* --- GAME 1: BLIND PICK CENTERPIECE --- */}
        {game.id === 'mystery-player' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Transparent Footballer Silhouette with High-Contrast Question Mark */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <img
                src="/images/mystery-silhouette-white.png"
                alt="Blind Pick Silhouette"
                className="w-full h-full object-contain filter drop-shadow-md"
              />

              {/* Center Question Mark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-display font-black text-5xl text-white drop-shadow-md -mt-1">
                  ?
                </span>
              </div>
            </div>

            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d] mt-1">
              WHO IS THIS PLAYER?
            </span>
          </div>
        )}

        {/* --- GAME 2: ROAD TO IMMORTALITY / UCL DRAFT --- */}
        {game.id === 'road-to-immortality' && (
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full">
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center opacity-30 pointer-events-none filter blur-[0.5px]"
              style={{ backgroundImage: "url('/images/ucl-bg.jpg')" }}
            />
            <div className="relative w-24 h-24 flex items-center justify-center z-10">
              <img
                src="/images/champions-league-ball.png"
                alt="Champions League Ball"
                className="w-full h-full object-contain filter drop-shadow-[0_0_18px_rgba(0,102,178,0.55)] opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200"
              />
            </div>
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#66b3ff] mt-1 bg-black/60 border border-[#0066b2]/40 px-2 py-0.5 rounded relative z-10">
              ALL-TIME CHAMPIONS LEAGUE XI
            </span>
          </div>
        )}

        {/* --- GAME 3: WOULD YOU RATHER --- */}
        {game.id === 'would-you-rather' && (
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
            <div className="flex items-center gap-3 bg-[#121927]/90 px-4 py-2.5 rounded-lg border border-[#1f2d42] shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#dc052d]/60 bg-[#1c2536] flex items-center justify-center">
                  <img
                    src="/images/players/robben.jpg"
                    alt="Robben"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-display font-extrabold text-white">OPTION A</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#dc052d] text-white text-[10px] font-display font-black flex items-center justify-center shadow-xs">
                VS
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-display font-extrabold text-white">OPTION B</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#fdb913]/60 bg-[#1c2536] flex items-center justify-center">
                  <img
                    src="/images/players/muller.jpg"
                    alt="Müller"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#fdb913] mt-2 bg-black/60 border border-[#fdb913]/30 px-2 py-0.5 rounded">
              BAYERN LEGEND MATCH
            </span>
          </div>
        )}

        {/* --- GAME 4: ROAD TO GLORY CENTERPIECE --- */}
        {game.id === 'road-to-glory' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Bold 11 & Lisbon European Campaign Display */}
            <div className="flex items-center gap-3 bg-[#0d1624] px-5 py-3 rounded-lg border border-[#1f2d42]">
              <div className="text-center">
                <span className="font-display font-black text-3xl text-white tracking-tight block leading-none">
                  11
                </span>
                <span className="text-[9px] font-display font-bold uppercase tracking-wider text-[#fdb913]">
                  WINS
                </span>
              </div>

              <div className="text-xl font-display font-bold text-[#fdb913] px-1">•</div>

              <div className="text-center">
                <span className="font-display font-black text-3xl text-[#fdb913] tracking-tight block leading-none">
                  LISBON
                </span>
                <span className="text-[9px] font-display font-bold uppercase tracking-wider text-gray-300">
                  2020
                </span>
              </div>
            </div>

            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#fdb913] mt-2">
              EUROPEAN CAMPAIGN
            </span>
          </div>
        )}

        {/* --- GAME 5: WHO AM I? CAREER PATH CENTERPIECE --- */}
        {game.id === 'who-am-i' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Stepping Stones / Transfer Trail Motif */}
            <div className="flex items-center gap-2 bg-[#111927] px-4 py-3 rounded-lg border border-[#1c2535]">
              <div className="w-8 h-8 rounded bg-[#1c2436] border border-white/10 flex items-center justify-center text-[10px] font-display font-bold text-gray-300">
                1999
              </div>
              <div className="w-3 h-0.5 bg-[#dc052d]" />
              <div className="w-8 h-8 rounded bg-[#dc052d]/20 border border-[#dc052d]/40 flex items-center justify-center text-[10px] font-display font-bold text-[#dc052d]">
                FCB
              </div>
              <div className="w-3 h-0.5 bg-gray-600" />
              <div className="w-8 h-8 rounded bg-[#1c2436] border border-white/10 flex items-center justify-center text-[10px] font-display font-bold text-gray-400">
                ?
              </div>
            </div>

            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 mt-2">
              CAREER DEDUCTION
            </span>
          </div>
        )}

        {/* Top-Right Status Badge */}
        <div className="absolute top-3 right-3 z-20">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-[#dc052d]/15 text-[#dc052d] border border-[#dc052d]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
              AVAILABLE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-display font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
              <Clock size={10} />
              {game.badge || 'COMING SOON'}
            </span>
          )}
        </div>
      </div>

      {/* Card Information Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-2">
          {/* Metadata pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-bold uppercase tracking-wider text-gray-400 text-[11px]">
              {game.category}
            </span>
            {game.meta?.rounds && (
              <span className="font-display font-bold text-gray-400 text-[11px]">
                {game.meta.rounds} ROUNDS
              </span>
            )}
          </div>

          {/* Game Title */}
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight uppercase group-hover:text-[#dc052d] transition-colors">
            {game.title}
          </h3>

          {/* One-Line Description */}
          <p className="text-sm text-gray-300 leading-relaxed font-display">
            {game.description}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isAvailable ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="w-full py-3 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-2 shadow-sm group/btn hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <span>PLAY GAME</span>
              {game.isExternal ? (
                <ExternalLink size={16} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5" />
              ) : (
                <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
              )}
            </button>
          ) : (
            <button
              disabled
              className="w-full py-3 px-4 rounded-lg bg-white/5 text-gray-500 font-display font-bold text-sm tracking-wider uppercase border border-white/10 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>COMING SOON</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
