import React from 'react';
import { ArrowRight, Clock, HelpCircle, Trophy, GitFork, Shield } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function GameCard({ game, onPlay }) {
  const isAvailable = game.status === 'available';

  const handleAction = () => {
    if (isAvailable && onPlay) {
      sounds.playWhistle();
      onPlay(game.route);
    }
  };

  return (
    <div className="flex flex-col bg-[#121824] border border-[#222c3d] hover:border-[#374560] rounded-xl overflow-hidden transition-all duration-200 group text-left">
      {/* Visual Centerpiece Banner - Distinct for each game! */}
      <div className="relative h-48 bg-[#0a0e14] border-b border-[#222c3d] overflow-hidden flex items-center justify-center select-none">
        {/* Subtle field grid pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none pitch-pattern" />

        {/* --- GAME 1: MYSTERY PLAYER CENTERPIECE --- */}
        {game.id === 'mystery-player' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Transparent Footballer Silhouette with High-Contrast Question Mark */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <img
                src="/images/mystery-silhouette-white.png"
                alt="Mystery Player Silhouette"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(220,5,45,0.45)]"
              />

              {/* Glowing Center Question Mark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-display font-black text-5xl text-white drop-shadow-[0_2px_8px_rgba(220,5,45,0.85)] -mt-1">
                  ?
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#dc052d] mt-1">
              WHO IS THIS PLAYER?
            </span>
          </div>
        )}

        {/* --- GAME 2: 38-0 INVINCIBLE SEASON CENTERPIECE --- */}
        {game.id === '38-0' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Bold 38 & 0 Football Season Display */}
            <div className="flex items-center gap-3 bg-[#111927] px-5 py-3 rounded-lg border border-[#222c3d]">
              <div className="text-center">
                <span className="font-display font-black text-4xl text-white tracking-tight block leading-none">
                  38
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-gray-400">
                  MATCHES
                </span>
              </div>

              <div className="text-xl font-mono font-bold text-gray-600 px-1">—</div>

              <div className="text-center">
                <span className="font-display font-black text-4xl text-[#dc052d] tracking-tight block leading-none">
                  0
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#dc052d]">
                  LOSSES
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mt-2">
              BUNDESLIGA CHALLENGE
            </span>
          </div>
        )}

        {/* --- GAME 3: WHO AM I? CAREER PATH CENTERPIECE --- */}
        {game.id === 'who-am-i' && (
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Stepping Stones / Transfer Trail Motif */}
            <div className="flex items-center gap-2 bg-[#111927] px-4 py-3 rounded-lg border border-[#222c3d]">
              <div className="w-8 h-8 rounded bg-[#1c2436] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-gray-300">
                1999
              </div>
              <div className="w-3 h-0.5 bg-[#dc052d]" />
              <div className="w-8 h-8 rounded bg-[#dc052d]/20 border border-[#dc052d]/40 flex items-center justify-center text-[10px] font-mono font-bold text-[#dc052d]">
                FCB
              </div>
              <div className="w-3 h-0.5 bg-gray-600" />
              <div className="w-8 h-8 rounded bg-[#1c2436] border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-gray-400">
                ?
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mt-2">
              CAREER DEDUCTION
            </span>
          </div>
        )}

        {/* Top-Right Status Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#dc052d]/15 text-[#dc052d] border border-[#dc052d]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
              AVAILABLE NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-gray-400 border border-white/10">
              <Clock size={10} />
              {game.badge}
            </span>
          )}
        </div>
      </div>

      {/* Card Information Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-2">
          {/* Metadata pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold uppercase tracking-wider text-gray-400 text-[11px]">
              {game.category}
            </span>
            {game.meta?.rounds && (
              <span className="font-mono font-bold text-gray-400 text-[11px]">
                {game.meta.rounds} ROUNDS
              </span>
            )}
          </div>

          {/* Game Title */}
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight uppercase group-hover:text-[#dc052d] transition-colors">
            {game.title}
          </h3>

          {/* One-Line Description */}
          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            {game.description}
          </p>
        </div>

        {/* Action Button */}
        <div>
          {isAvailable ? (
            <button
              onClick={handleAction}
              className="w-full py-3 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>PLAY GAME</span>
              <ArrowRight size={16} />
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
