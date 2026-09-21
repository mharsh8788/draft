import React from 'react';
import { Volume2, VolumeX, RotateCcw, Shield, Trophy } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ 
  currentRound, 
  totalRounds = 11, 
  gameStatus, 
  onReset, 
  soundEnabled, 
  setSoundEnabled 
}) {
  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07101c]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={gameStatus !== 'idle' ? onReset : undefined}
          className="flex items-center gap-3 cursor-pointer group"
          title="Bayern Draft Home"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dc052d] via-[#900014] to-[#0066b2] p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-[#0b0f17] rounded-full flex items-center justify-center font-display font-bold text-xs text-[#fdb913] tracking-wider">
              FCB
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-wider text-white group-hover:text-[#dc052d] transition-colors">
                BAYERN <span className="text-[#dc052d]">DRAFT</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#dc052d]/20 text-[#dc052d] border border-[#dc052d]/40">
                4-3-3 XI
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">Build Your Ultimate Bayern XI</p>
          </div>
        </div>

        {/* Round Status */}
        {gameStatus === 'playing' && (
          <div className="flex items-center gap-2 bg-[#121824] px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#dc052d] animate-pulse"></span>
            <span className="text-xs uppercase font-bold tracking-wider text-gray-300">
              ROUND <span className="text-white font-display text-base font-extrabold text-[#fdb913]">{currentRound}</span> / {totalRounds}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-lg bg-[#121824] hover:bg-[#1c2436] text-gray-300 hover:text-white border border-white/10 transition-colors"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 size={18} className="text-[#fdb913]" /> : <VolumeX size={18} />}
          </button>

          {gameStatus !== 'idle' && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-[#dc052d]/20 text-gray-300 hover:text-[#dc052d] border border-white/10 hover:border-[#dc052d]/40 text-xs font-semibold tracking-wide transition-all"
            >
              <RotateCcw size={15} />
              <span className="hidden sm:inline">New Draft</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
