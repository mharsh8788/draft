import React from 'react';
import { GameMode } from '../types';
import { SquadMetrics } from '../../../types/draft';
import { Trophy, Info, RotateCcw, Undo2, BookOpen, Compass, Sun, Moon, HelpCircle } from 'lucide-react';

interface GameHeaderProps {
  metrics: SquadMetrics;
  mode: GameMode;
  theme: 'light' | 'dark';
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
  onOpenDisclaimer: () => void;
  onOpenGameGuide: () => void;
  onToggleMode: () => void;
  onToggleTheme: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  metrics,
  mode,
  theme,
  canUndo,
  onUndo,
  onReset,
  onOpenDisclaimer,
  onOpenGameGuide,
  onToggleMode,
  onToggleTheme,
}) => {
  return (
    <header className="bg-white dark:bg-[#06121A] text-[#172638] dark:text-white border-b border-[#DCE3EA] dark:border-[#162E3D] sticky top-0 z-40 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo / Title: ROAD TO IMMORTALITY */}
          <div className="flex items-center gap-2.5">
            <div className="font-sports text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 tracking-tight leading-none uppercase">
              ROAD TO IMMORTALITY
            </div>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-[#697789] dark:text-[#6A889C] bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] px-2 py-0.5 rounded-md">
              BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI
            </span>
          </div>

          {/* Right Header Controls matching Screenshot 1 */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mode Indicator / Toggle */}
            <button
              onClick={onToggleMode}
              title={`Switch to ${mode === 'classic' ? 'Almanac' : 'Classic'} mode`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] text-[11px] sm:text-xs font-bold font-heading uppercase text-[#172638] dark:text-white btn-lift cursor-pointer"
            >
              {mode === 'classic' ? (
                <>
                  <Compass className="w-3.5 h-3.5 text-[#10B981] dark:text-[#00D26A]" />
                  <span className="hidden xs:inline">Classic</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="hidden xs:inline">Almanac</span>
                </>
              )}
            </button>

            {/* Undo Action */}
            {canUndo && (
              <button
                onClick={onUndo}
                title="Undo last draft pick"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] text-xs font-medium text-[#172638] dark:text-slate-200 btn-lift cursor-pointer"
              >
                <Undo2 className="w-3 h-3 text-[#697789] dark:text-slate-400" />
                <span>Undo</span>
              </button>
            )}

            {/* Reset Action */}
            <button
              onClick={onReset}
              disabled={metrics.totalDrafted === 0}
              title="Reset lineup"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-rose-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 border border-[#DCE3EA] dark:border-[#162E3D] text-xs font-medium text-[#172638] dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed btn-lift cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#697789] dark:text-slate-400" />
              <span>Reset</span>
            </button>

            {/* Game Guide Control */}
            <button
              onClick={onOpenGameGuide}
              title="How to Play UCL Draft (Rules & Strategy)"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] text-xs font-bold font-heading uppercase text-[#172638] dark:text-white btn-lift cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#10B981] dark:text-[#00D26A]" />
              <span className="hidden md:inline">Guide</span>
            </button>

            {/* Theme Toggle (matching Screenshot 1 [DARK] / [LIGHT] control) */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] text-xs font-bold font-heading uppercase text-[#172638] dark:text-white btn-lift cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>DARK</span>
                </>
              )}
            </button>

            {/* Editorial / Legal Notes Control */}
            <button
              onClick={onOpenDisclaimer}
              title="Editorial Notes & Legal Disclaimer"
              className="p-1.5 rounded-lg bg-[#F6F8FA] dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] text-[#697789] dark:text-slate-300 hover:text-[#172638] dark:hover:text-white btn-lift cursor-pointer"
              aria-label="Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
