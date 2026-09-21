import React, { useState } from 'react';
import { FORMATIONS } from '../data/formations';
import { ArrowLeft, ArrowRight, Shield, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

function MiniPitchPreview({ slots = [] }) {
  return (
    <div className="relative w-full aspect-[4/4.4] bg-[#0a160f] rounded-lg border border-[#222c3d] overflow-hidden pitch-pattern pointer-events-none select-none">
      {/* Pitch Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-white/15 fill-none" strokeWidth="1">
        <rect x="5%" y="4%" width="90%" height="92%" rx="4" />
        <line x1="5%" y1="50%" x2="95%" y2="50%" />
        <circle cx="50%" cy="50%" r="14%" />
        <rect x="25%" y="4%" width="50%" height="15%" />
        <rect x="25%" y="81%" width="50%" height="15%" />
      </svg>

      {/* Formation Node Dots */}
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ top: slot.top, left: slot.left }}
        >
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#121824] border border-white/40 flex items-center justify-center shadow-xs">
            <span className="text-[7px] sm:text-[8px] font-mono font-bold text-white leading-none">
              {slot.position.split('/')[0]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FormationSelector({ 
  onSelectFormation, 
  onBackToGames, 
  defaultFormation = '4-3-3' 
}) {
  const [selectedKey, setSelectedKey] = useState(defaultFormation);

  const handleSelect = (key) => {
    setSelectedKey(key);
    sounds.playSelect();
  };

  const handleStart = () => {
    sounds.playSelect();
    onSelectFormation(selectedKey);
  };

  return (
    <section className="relative w-full flex-1 overflow-hidden bg-[#070b12] py-8 sm:py-10">
      {/* Full-width Wide Allianz Arena Interior Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none"
        style={{ 
          backgroundImage: "url('/images/allianz-arena-interior.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* 70-80% Dark Navy/Black Contrast Overlay (Stadium, red stands & roof recognizable while cards stay crisp) */}
      <div className="absolute inset-0 bg-[#070b12]/75 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/85 via-[#070b12]/60 to-[#070b12]/90 pointer-events-none" />

      {/* Inner Content Container (Centered & Constrained to max-w-6xl) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left animate-in fade-in duration-200">
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222c3d] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#dc052d] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
              TACTICAL SETUP
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-xs font-mono text-gray-400">11 POSITIONS</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            CHOOSE YOUR FORMATION
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-sans">
            Select the tactical shape for your FC Bayern starting XI. The formation determines the exact position requirements for every round.
          </p>
        </div>

        <button
          onClick={onBackToGames}
          className="self-start sm:self-center px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Games</span>
        </button>
      </div>

      {/* Grid of 6 Formations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FORMATIONS.map((f) => {
          const isSelected = selectedKey === f.key;
          return (
            <div
              key={f.key}
              onClick={() => handleSelect(f.key)}
              className={`group relative flex flex-col justify-between rounded-xl bg-[#121824] border-2 p-5 cursor-pointer transition-all duration-150 shadow-md ${
                isSelected 
                  ? 'border-[#dc052d] bg-[#141d2d] ring-1 ring-[#dc052d]' 
                  : 'border-[#222c3d] hover:border-[#374560] hover:bg-[#151c2a]'
              }`}
            >
              {/* Card Header: Formation Name & Selected Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">
                      {f.name}
                    </h3>
                    <span className="text-xs font-mono text-gray-400 font-medium">
                      {f.label.split(' ')[1] || ''}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                    isSelected 
                      ? 'bg-[#dc052d] border-[#dc052d] text-white' 
                      : 'border-white/20 bg-black/40 text-transparent group-hover:border-white/40'
                  }`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                </div>

                {/* Mini Tactical Pitch Preview */}
                <MiniPitchPreview slots={f.slots} />

                {/* Tactical Line Breakdown */}
                <div className="flex items-center justify-between text-[11px] font-mono border-t border-[#222c3d] pt-2.5 text-gray-400">
                  <span>{f.defenders} Defenders</span>
                  <span>•</span>
                  <span>{f.midfielders} Midfield</span>
                  <span>•</span>
                  <span>{f.attackers} Forwards</span>
                </div>

                {/* Tactical Description */}
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  {f.description}
                </p>
              </div>

              {/* Selection Indicator Pill */}
              <div className="pt-4">
                <div className={`w-full py-2 rounded text-center text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                  isSelected 
                    ? 'bg-[#dc052d] text-white' 
                    : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                }`}>
                  {isSelected ? 'SELECTED FORMATION' : 'SELECT ' + f.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Draft Action Footer */}
      <div className="bg-[#0e141f] rounded-xl border border-[#222c3d] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Shield size={16} className="text-[#dc052d]" />
            <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
              READY TO DRAFT: <span className="text-[#dc052d]">{selectedKey}</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            You will draft 11 positions according to the {selectedKey} tactical shape.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-base tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
        >
          <span>START DRAFT</span>
          <ArrowRight size={18} />
        </button>
      </div>
      </div>
    </section>
  );
}
