import React from 'react';
import { Formation } from '../../../types/draft';
import { GameMode, DraftChallenge, TacticalStyle, GameStatus } from '../types';
import { Play, Sparkles, Sliders, Dices, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface SetupControlsProps {
  status: GameStatus;
  formations: Formation[];
  activeFormationId: string;
  mode: GameMode;
  challenge: DraftChallenge;
  tacticalStyle: TacticalStyle;
  onSelectFormation: (id: string) => void;
  onSelectMode: (mode: GameMode) => void;
  onSelectChallenge: (challenge: DraftChallenge) => void;
  onSelectTacticalStyle: (style: TacticalStyle) => void;
  onStartGame: () => void;
}

export const SetupControls: React.FC<SetupControlsProps> = ({
  status,
  formations,
  activeFormationId,
  mode,
  challenge,
  tacticalStyle,
  onSelectFormation,
  onSelectMode,
  onSelectChallenge,
  onSelectTacticalStyle,
  onStartGame,
}) => {
  const isSetup = status === 'setup';

  return (
    <div className="bg-white border border-[#DCE3EA] rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Pre-Draft Intro in Setup Mode */}
        {isSetup && (
          <div className="pb-3 border-b border-[#DCE3EA]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#3478F6]" />
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#697789]">
                Game Configuration
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#172638] font-heading">
              Select Your Rules & Tactical Blueprint
            </h2>
            <p className="text-xs text-[#697789] mt-0.5">
              Draft an iconic Champions League Starting XI. Complete all 11 positions to simulate your run against Europe's legendary dynasties.
            </p>
          </div>
        )}

        {/* Segmented Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Formation */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Formation
            </label>
            <div className="grid grid-cols-3 p-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl gap-1">
              {formations.map((f) => {
                const active = f.id === activeFormationId;
                return (
                  <button
                    key={f.id}
                    onClick={() => onSelectFormation(f.id)}
                    className={`py-1 text-xs font-bold font-heading rounded-lg transition-all ${
                      active
                        ? 'bg-[#3478F6] text-white shadow-xs'
                        : 'text-[#697789] hover:text-[#172638] hover:bg-white'
                    }`}
                  >
                    {f.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Game Mode (Classic vs Almanac) */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Information Mode
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl gap-1">
              <button
                onClick={() => onSelectMode('classic')}
                className={`flex items-center justify-center gap-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  mode === 'classic'
                    ? 'bg-[#3478F6] text-white shadow-xs'
                    : 'text-[#697789] hover:text-[#172638] hover:bg-white'
                }`}
                title="Visible ratings & career metrics"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Classic</span>
              </button>

              <button
                onClick={() => onSelectMode('almanac')}
                className={`flex items-center justify-center gap-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  mode === 'almanac'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-[#697789] hover:text-[#172638] hover:bg-white'
                }`}
                title="Ratings hidden during draft. Pure historical memory challenge!"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Almanac</span>
              </button>
            </div>
          </div>

          {/* 3. Challenge Rules */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Draft Mechanism
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl gap-1">
              <button
                onClick={() => onSelectChallenge('scout')}
                className={`py-1 text-xs font-bold rounded-lg transition-all ${
                  challenge === 'scout'
                    ? 'bg-[#3478F6] text-white shadow-xs'
                    : 'text-[#697789] hover:text-[#172638] hover:bg-white'
                }`}
              >
                Open Scout
              </button>

              <button
                onClick={() => onSelectChallenge('club-draw')}
                className={`flex items-center justify-center gap-1 py-1 text-xs font-bold rounded-lg transition-all ${
                  challenge === 'club-draw'
                    ? 'bg-[#3478F6] text-white shadow-xs'
                    : 'text-[#697789] hover:text-[#172638] hover:bg-white'
                }`}
                title="Roll a random European club each turn"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>Club Draw</span>
              </button>
            </div>
          </div>

          {/* 4. Tactical Style */}
          <div>
            <label className="text-[11px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Tactical Style
            </label>
            <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl px-2 py-1 flex items-center">
              <select
                value={tacticalStyle}
                onChange={(e) => onSelectTacticalStyle(e.target.value as TacticalStyle)}
                className="bg-transparent text-xs font-bold text-[#172638] focus:outline-none w-full"
              >
                <option value="balanced">Balanced Tactical Setup</option>
                <option value="control">Control (Tiki-Taka / Midfield Domination)</option>
                <option value="pressing">Pressing (Gegenpress / High Tempo)</option>
                <option value="counter">Counter (Direct / Transition Lethality)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Start Button in Setup Mode */}
        {isSetup && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={onStartGame}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#3478F6] hover:bg-blue-600 active:scale-98 text-white font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Draft / Play Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
