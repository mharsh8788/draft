import React from 'react';
import { Play, Sparkles, Shield, Users, HelpCircle, Trophy, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Hero({ onStartDraft }) {
  const handleStart = () => {
    sounds.playWhistle();
    onStartDraft();
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden stadium-glow">
      {/* Background Decorative Pitch Circles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#dc052d]/15 border border-[#dc052d]/30 text-[#dc052d] text-xs font-bold uppercase tracking-widest shadow-sm">
          <Sparkles size={14} className="animate-spin text-[#fdb913]" style={{ animationDuration: '6s' }} />
          <span>The Ultimate Football Decision Game</span>
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white uppercase drop-shadow-lg">
            BAYERN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc052d] via-[#fdb913] to-[#dc052d]">DRAFT</span>
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-gray-300 max-w-2xl mx-auto">
            Build your ultimate Bayern XI.
          </p>
        </div>

        {/* Secondary Question Hook */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121824]/90 border border-white/10 backdrop-blur-md max-w-xl mx-auto shadow-2xl">
          <p className="text-lg sm:text-xl font-bold text-[#fdb913] tracking-wide flex items-center justify-center gap-2">
            <HelpCircle size={22} className="text-[#dc052d]" />
            This Player or Mystery Player?
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pick between a revealed Bayern legend and hidden clues across 11 intense position rounds. The player you don't choose joins the opponent's Mystery XI.
          </p>
        </div>

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl bg-gradient-to-r from-[#dc052d] to-[#990000] hover:from-[#e60630] hover:to-[#b30000] text-white font-display font-bold text-xl sm:text-2xl tracking-wider uppercase shadow-xl red-glow hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play size={24} className="fill-white group-hover:translate-x-1 transition-transform" />
            <span>START DRAFT</span>
          </button>
        </div>

        {/* 3 Game Pillar Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-3xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-[#121824]/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#dc052d]/20 text-[#dc052d] shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Authentic 4-3-3</h2>
              <p className="text-xs text-gray-400 mt-0.5">Position-specific rounds from GK to ST with pitch visualization.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121824]/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#fdb913]/20 text-[#fdb913] shrink-0">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">50+ Bayern Icons</h2>
              <p className="text-xs text-gray-400 mt-0.5">Beckembauer, Müller, Neuer, Robben, Kane, Lewandowski and more.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121824]/60 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#0066b2]/20 text-[#0066b2] shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Objective Clash</h2>
              <p className="text-xs text-gray-400 mt-0.5">Head-to-head stats comparison. Compare the numbers and decide.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
