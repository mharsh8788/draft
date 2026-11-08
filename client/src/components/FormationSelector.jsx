import React, { useState } from 'react';
import { FORMATIONS } from '../data/formations';
import { ArrowLeft, ArrowRight, Shield, Check } from 'lucide-react';
import { sounds } from '../utils/audio';

function getStyleLabel(formation) {
  if (formation.key === '4-4-1-1') return 'Shadow Striker';
  return formation.label.replace(formation.name, '').trim();
}

function getDistributionText(f) {
  const def = `${f.defenders} Defender${Number(f.defenders) !== 1 ? 's' : ''}`;
  const mid = `${f.midfielders} Midfielder${Number(f.midfielders) !== 1 ? 's' : ''}`;
  const att = `${f.attackers} Forward${Number(f.attackers) !== 1 ? 's' : ''}`;
  return `${def} · ${mid} · ${att}`;
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
    <section className="relative w-full flex-1 overflow-hidden bg-[#070b12] py-4 sm:py-6">
      {/* Full-width Wide Allianz Arena Interior Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none opacity-45"
        style={{ 
          backgroundImage: "url('/images/allianz-arena-interior.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Cinematic Dark Navy/Black Contrast Overlays */}
      <div className="absolute inset-0 bg-[#070b12]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/90 via-[#070b12]/70 to-[#070b12]/90 pointer-events-none" />

      {/* Inner Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5 sm:space-y-4 text-left animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2535] pb-3 sm:pb-3.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#dc052d] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc052d]" />
                TACTICAL SETUP
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-[11px] font-display font-bold uppercase tracking-wider text-gray-400">11 POSITIONS</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight leading-none">
              CHOOSE YOUR FORMATION
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-display leading-normal font-normal">
              Select the tactical shape for your FC Bayern starting XI. The formation determines the exact position requirements for every round.
            </p>
          </div>

          <button
            onClick={onBackToGames}
            className="self-start sm:self-center px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/25 transition-all duration-200 ease-out flex items-center gap-1.5 cursor-pointer hover:-translate-x-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70 shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Back to Games</span>
          </button>
        </div>

        {/* Responsive Grid of Compact Text-First Formation Cards (3-col, 2-row on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4">
          {FORMATIONS.map((f) => {
            const isSelected = selectedKey === f.key;
            const styleLabel = getStyleLabel(f);
            const distribution = getDistributionText(f);

            return (
              <div
                key={f.key}
                onClick={() => handleSelect(f.key)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect(f.key);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-xl p-3.5 sm:p-4 cursor-pointer transition-all duration-200 ease-out shadow-xs select-none hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70 ${
                  isSelected 
                    ? 'bg-[#141d2d] border border-[#dc052d] ring-1 ring-[#dc052d]/50 shadow-md' 
                    : 'bg-[#0e1420] border border-[#1c2535] hover:border-[#dc052d]/40 hover:bg-[#121926]'
                }`}
              >
                {/* Upper Area: Formation Name, Style Label, Distribution, Radio Indicator */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      {/* Formation Name & Style Label */}
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight leading-none">
                          {f.name}
                        </h3>
                        <span className={`text-[11px] font-display font-bold uppercase tracking-wider transition-colors ${
                          isSelected ? 'text-[#dc052d]' : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
                          {styleLabel}
                        </span>
                      </div>

                      {/* Player Distribution */}
                      <div className="mt-1 text-[11px] sm:text-xs font-display font-medium text-gray-400 tracking-wide">
                        {distribution}
                      </div>
                    </div>

                    {/* Clean Radio/Check Selection Indicator */}
                    <div 
                      className={`shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-[#dc052d] border-[#dc052d] text-white shadow-xs' 
                          : 'border-white/25 bg-black/30 text-transparent group-hover:border-white/50'
                      }`}
                      aria-hidden="true"
                    >
                      <Check size={11} strokeWidth={3} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                    </div>
                  </div>

                  {/* Short Tactical Description with Consistent Height */}
                  <p className="text-[11px] sm:text-xs text-gray-300 font-display leading-snug font-normal pt-1.5 border-t border-[#1c2535]/60 min-h-[34px]">
                    {f.description}
                  </p>
                </div>

                {/* Bottom Selection Status Bar */}
                <div className="mt-2.5 pt-2 border-t border-[#1c2535]/60 flex items-center justify-between text-[10px] sm:text-[11px] font-display">
                  <span className={`font-bold uppercase tracking-wider transition-colors ${
                    isSelected ? 'text-[#dc052d]' : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {isSelected ? 'SELECTED SHAPE' : 'SELECT ' + f.name}
                  </span>

                  {isSelected && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white bg-[#dc052d] px-1.5 py-0.5 rounded shadow-xs leading-none">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Draft Action Footer (Compact) */}
        <div className="bg-[#0e141f] rounded-xl border border-[#1c2535] p-3.5 sm:p-4 px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5">
              <Shield size={14} className="text-[#dc052d]" />
              <span className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                READY TO DRAFT: <span className="text-[#dc052d]">{selectedKey}</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-400 font-display">
              You will draft 11 positions according to the {selectedKey} tactical shape.
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 shrink-0"
          >
            <span>START DRAFT</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}
