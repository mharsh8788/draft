import React from 'react';
import { Formation } from '../../../types/draft';
import { GameMode } from '../types';

interface TopHeroSectionProps {
  formations: Formation[];
  activeFormationId: string;
  mode: GameMode;
  onSelectFormation: (id: string) => void;
  onSelectMode: (mode: GameMode) => void;
  onPlayNow: () => void;
}

export const TopHeroSection: React.FC<TopHeroSectionProps> = ({
  formations,
  activeFormationId,
  mode,
  onSelectFormation,
  onSelectMode,
  onPlayNow,
}) => {
  return (
    <section className="bg-white dark:bg-[#06121A] border-b border-[#DCE3EA] dark:border-[#162E3D] pt-6 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Subtitle letterspaced */}
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#697789] dark:text-[#6A889C] mb-4">
          ROAD TO IMMORTALITY • BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI
        </div>

        {/* 2-Column Hero: Left Headline/Controls & Right Pitch Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column (Headline + Play Now + Mode + Formations) */}
          <div className="relative lg:col-span-6 space-y-4">
            {/* Atmospheric Green Glow behind Headline (Dark mode only) */}
            <div
              aria-hidden="true"
              className="hero-glow-backdrop opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none"
            />

            {/* Massive ROAD TO IMMORTALITY headline with phosphorescent green atmospheric shadow in dark mode */}
            <div className="relative z-10 font-sports text-5xl sm:text-6xl md:text-7xl font-black text-[#172638] dark:text-white dark:drop-shadow-[0_0_35px_rgba(0,210,106,0.28)] tracking-tight leading-none uppercase">
              ROAD TO IMMORTALITY
            </div>

            {/* Subtitle */}
            <div className="relative z-10 font-sports text-2xl sm:text-3xl md:text-4xl font-black uppercase text-[#172638] dark:text-white tracking-tight leading-[0.95]">
              BUILD YOUR ALL-TIME <br />
              <span className="text-[#10B981] dark:text-[#00FFA3]">CHAMPIONS LEAGUE XI</span>
            </div>

            {/* Description */}
            <p className="relative z-10 text-xs sm:text-sm text-[#697789] dark:text-[#6A889C] max-w-xl leading-relaxed">
              Play a football draft game built for Champions League fans: roll a European powerhouse club, draft one player at a time, and see whether your starting XI can achieve immortality in European football.
            </p>

            {/* Play Now Button + With Friends pill */}
            <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onPlayNow}
                className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] active:scale-98 text-white dark:text-slate-950 font-sports text-2xl font-black uppercase tracking-wider shadow-sm dark:shadow-[0_4px_22px_-2px_rgba(0,210,106,0.45)] dark:hover:shadow-[0_4px_30px_0px_rgba(0,210,106,0.65)] btn-lift-primary text-center cursor-pointer"
              >
                PLAY NOW
              </button>

              <span className="px-4 py-3 rounded-xl bg-[#F6F8FA] dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] text-[#697789] dark:text-[#6A889C] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed">
                <span>SOLO & FRIENDS</span>
                <span className="text-[9px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded font-sans">
                  NEW
                </span>
              </span>
            </div>

            {/* Mode & Difficulty Controls */}
            <div className="relative z-10 pt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C]">
                  MODE • DIFFICULTY
                </span>
                <div className="inline-flex p-0.5 bg-[#F6F8FA] dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-lg gap-0.5">
                  <button
                    onClick={() => onSelectMode('classic')}
                    className={`px-3 py-1 text-xs font-bold rounded-md font-heading uppercase btn-lift cursor-pointer ${
                      mode === 'classic'
                        ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.4)]'
                        : 'text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => onSelectMode('almanac')}
                    className={`px-3 py-1 text-xs font-bold rounded-md font-heading uppercase btn-lift cursor-pointer ${
                      mode === 'almanac'
                        ? 'bg-[#172638] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.4)]'
                        : 'text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white'
                    }`}
                  >
                    Almanac
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#697789] dark:text-[#6A889C] italic">
                {mode === 'classic'
                  ? 'Player strength is visible, so every pick has clear information.'
                  : 'Player strength is hidden. Pure football knowledge & historical memory!'}
              </p>
            </div>

            {/* Formation Selector Pills */}
            <div className="relative z-10 pt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C] block mb-1">
                FORMATION
              </span>
              <div className="flex flex-wrap gap-1.5">
                {formations.map((f) => {
                  const active = f.id === activeFormationId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFormation(f.id)}
                      className={`px-2.5 py-1 text-xs font-bold font-heading rounded-lg btn-lift cursor-pointer ${
                        active
                          ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.4)]'
                          : 'bg-[#F6F8FA] dark:bg-[#081923] text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white border border-[#DCE3EA] dark:border-[#162E3D]'
                      }`}
                    >
                      {f.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Hero Pitch Preview (matching Screenshot 1) */}
          <div className="relative lg:col-span-6 flex justify-center">
            {/* Phosphorescent Green Atmosphere behind Hero Pitch Preview */}
            <div
              aria-hidden="true"
              className="phosphor-glow-backdrop opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none"
            />

            <div className="relative z-10 w-full max-w-md rounded-2xl overflow-hidden border border-[#DCE3EA] dark:border-2 dark:border-[#00D26A] shadow-md dark:shadow-[0_0_24px_-4px_rgba(0,210,106,0.38),0_0_50px_-15px_rgba(0,210,106,0.2),inset_0_0_18px_-5px_rgba(0,210,106,0.15)] pitch-turf-green dark:pitch-turf-green-dark p-3 select-none">
              <div className="relative w-full pb-[130%]">
                {/* SVG Pitch Markings */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 130"
                  preserveAspectRatio="none"
                >
                  <rect x="4" y="4" width="92" height="122" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.8" rx="1" />
                  <line x1="4" y1="65" x2="96" y2="65" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.8" />
                  <circle cx="50" cy="65" r="12" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.8" />
                  <circle cx="50" cy="65" r="1.1" fill="#ffffff" fillOpacity="0.9" />
                  <rect x="24" y="4" width="52" height="21" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.8" />
                  <rect x="24" y="105" width="52" height="21" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="0.8" />
                </svg>

                {/* 11 Hero Cards with gold border matching screenshot 1 */}
                <div className="absolute inset-0">
                  {/* Forwards */}
                  <div className="absolute left-[20%] top-[20%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">7</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">PT</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">C. Ronaldo</span>
                  </div>

                  <div className="absolute left-[50%] top-[15%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">9</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">FR</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Benzema</span>
                  </div>

                  <div className="absolute left-[80%] top-[20%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">10</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">AR</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Messi</span>
                  </div>

                  {/* Midfield */}
                  <div className="absolute left-[25%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">8</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">ES</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Iniesta</span>
                  </div>

                  <div className="absolute left-[50%] top-[53%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">5</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">FR</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Zidane</span>
                  </div>

                  <div className="absolute left-[75%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">10</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">HR</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Modrić</span>
                  </div>

                  {/* Defense */}
                  <div className="absolute left-[16%] top-[72%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">3</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">IT</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Maldini</span>
                  </div>

                  <div className="absolute left-[38%] top-[74%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">4</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">ES</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Ramos</span>
                  </div>

                  <div className="absolute left-[62%] top-[74%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">5</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">DE</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Beckenbauer</span>
                  </div>

                  <div className="absolute left-[84%] top-[72%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">21</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">DE</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Lahm</span>
                  </div>

                  {/* Goalkeeper */}
                  <div className="absolute left-[50%] top-[90%] -translate-x-1/2 -translate-y-1/2 w-14 sm:w-16 h-18 sm:h-21 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#1c3348] to-[#122230] dark:from-[#0F2838] dark:to-[#06141D] border-[1.5px] border-amber-400 p-1 sm:p-1.5 flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                    <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mono leading-none">1</span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0a1b26] border border-amber-400/40 mx-auto flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-amber-200 font-mono shadow-inner my-0.5">DE</div>
                    <span className="text-[8.5px] sm:text-[10px] font-heading font-black uppercase text-white text-center truncate leading-tight tracking-tight px-0.5">Neuer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats ticker */}
        <div className="mt-8 pt-4 border-t border-[#DCE3EA] dark:border-[#162E3D] flex items-center justify-center gap-6 text-xs text-[#697789] dark:text-[#6A889C] font-medium text-center">
          <span><strong className="text-[#172638] dark:text-white font-bold font-heading text-sm">36</strong> European Clubs</span>
          <span>•</span>
          <span><strong className="text-[#172638] dark:text-white font-bold font-heading text-sm">2026–27</strong> Unified Season</span>
          <span>•</span>
          <span><strong className="text-[#172638] dark:text-white font-bold font-heading text-sm">396</strong> Calibrated Cards</span>
        </div>
      </div>
    </section>
  );
};
