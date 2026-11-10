import React, { useState, useEffect } from 'react';
import { Formation, Player, SquadMetrics } from '../../../types/draft';
import { GameMode, SimulationResult } from '../types';
import { generateShareableSummary } from '../scoring';
import { X, Copy, Check, Trophy, Sparkles, Award, RotateCcw, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompletedModalProps {
  isOpen: boolean;
  onClose: () => void;
  formation: Formation;
  squad: Record<string, Player | null>;
  metrics: SquadMetrics;
  mode: GameMode;
  simulationResult: SimulationResult | null;
  onPlayAgain: () => void;
}

export const CompletedModal: React.FC<CompletedModalProps> = ({
  isOpen,
  onClose,
  formation,
  squad,
  metrics,
  mode,
  simulationResult,
  onPlayAgain,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && metrics.isComplete) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3478F6', '#10B981', '#F59E0B', '#172638'],
        });
      } catch (e) {}
    }
  }, [isOpen, metrics.isComplete]);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = generateShareableSummary(formation, squad, metrics, mode, simulationResult);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const rosterSlots = [...formation.slots].sort((a, b) => b.y - a.y);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl p-5 sm:p-6 shadow-xl text-[#172638] dark:text-[#E6F0F6]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white hover:bg-[#F6F8FA] dark:hover:bg-[#0B1E2B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#3478F6] text-white flex items-center justify-center shadow-xs">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3478F6] bg-[#EDF4FF] dark:bg-blue-950/60 border border-[#BFDBFE] dark:border-blue-900 px-2 py-0.5 rounded">
                {metrics.isComplete ? 'XI Complete' : 'In-Progress Draft'}
              </span>
              {mode === 'almanac' && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  Almanac Reveal
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-[#172638] dark:text-white mt-0.5">
              ROAD TO IMMORTALITY
            </h2>
            <p className="text-[11px] uppercase font-bold text-[#697789] dark:text-[#6A889C] tracking-wider mt-0.5">
              BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI
            </p>
          </div>
        </div>

        {/* Mode Reveal Banner for Almanac */}
        {mode === 'almanac' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl">
            <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
              <strong className="font-bold">Almanac Mode Reveal:</strong> You drafted your squad purely from historical memory! The true editorial player ratings and calculated squad strength are now unveiled below.
            </p>
          </div>
        )}

        {/* Overall Score & Positional Balance Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Main OVR Card */}
          <div className="col-span-2 sm:col-span-1 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-[#3478F6] dark:text-cyan-400 tracking-wider">
              Squad OVR
            </span>
            <span className="font-heading text-3xl font-black text-[#172638] dark:text-white mt-1">
              {metrics.overallRating || '--'}
            </span>
            {metrics.chemistryBonus > 0 && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-0.5 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />+{metrics.chemistryBonus} Chem
              </span>
            )}
          </div>

          {/* Positional Metrics */}
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-rose-700 dark:text-rose-400">Attack</span>
            <span className="font-heading text-xl font-bold text-[#172638] dark:text-white mt-0.5">
              {metrics.attackRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">Midfield</span>
            <span className="font-heading text-xl font-bold text-[#172638] dark:text-white mt-0.5">
              {metrics.midfieldRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-blue-700 dark:text-blue-400">Defense</span>
            <span className="font-heading text-xl font-bold text-[#172638] dark:text-white mt-0.5">
              {metrics.defenseRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-400">Goalkeeper</span>
            <span className="font-heading text-xl font-bold text-[#172638] dark:text-white mt-0.5">
              {metrics.goalkeeperRating || '--'}
            </span>
          </div>
        </div>

        {/* Champions League Knockout Tournament Simulation */}
        {simulationResult && (
          <div className="mt-4 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#172638] dark:text-white">
                <Award className="w-4 h-4 text-[#3478F6] dark:text-cyan-400" />
                <span>Tournament Simulation Result</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  simulationResult.champion
                    ? 'bg-[#E6F4EA] dark:bg-emerald-950/70 text-[#137333] dark:text-emerald-300 border border-[#A8DAB5] dark:border-emerald-700'
                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {simulationResult.champion ? '🏆 European Champions' : 'Knockout Exit'}
              </span>
            </div>

            <p className="text-xs text-[#172638] dark:text-white font-semibold mb-3">
              {simulationResult.summaryVerdict}
            </p>

            {/* Match Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {simulationResult.matches.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs ${
                    m.won
                      ? 'bg-white dark:bg-[#081923] border-[#DCE3EA] dark:border-[#162E3D]'
                      : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#6A889C]">{m.round}</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        m.won ? 'bg-[#E6F4EA] dark:bg-emerald-950 text-[#137333] dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {m.squadGoals} - {m.opponentGoals}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#172638] dark:text-white">vs {m.opponent}</div>
                  <p className="text-[10px] text-[#697789] dark:text-[#6A889C] mt-0.5 leading-snug">{m.narrative}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synergies & Chemistry Highlights */}
        {metrics.activeSynergies.length > 0 && (
          <div className="mt-4 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 uppercase tracking-wide">
              <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Squad Synergies & Tactical Chemistry</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metrics.activeSynergies.map((syn, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] text-[#172638] dark:text-white px-2.5 py-1 rounded-md font-semibold shadow-2xs"
                >
                  ⚡ {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Club & Era Breakdown */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#6A889C] tracking-wider block mb-1.5">
              Clubs Represented
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(metrics.clubCounts).map(([club, count]) => (
                <span
                  key={club}
                  className="bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] text-[#172638] dark:text-white px-2 py-0.5 rounded text-[11px]"
                >
                  {club} <strong className="text-[#3478F6] dark:text-cyan-400 font-mono">({count})</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#6A889C] tracking-wider block mb-1.5">
              Eras Represented
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(metrics.eraCounts).map(([era, count]) => (
                <span
                  key={era}
                  className="bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] text-[#172638] dark:text-white px-2 py-0.5 rounded text-[11px]"
                >
                  {era} <strong className="text-[#3478F6] dark:text-cyan-400 font-mono">({count})</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Starting XI Lineup Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#697789] dark:text-[#6A889C]">
              Starting Lineup Sheet ({formation.name})
            </span>
            <span className="text-xs text-[#697789] dark:text-[#6A889C] font-mono">{metrics.totalDrafted} of 11</span>
          </div>

          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl divide-y divide-[#DCE3EA] dark:divide-[#162E3D] max-h-52 overflow-y-auto">
            {rosterSlots.map((slot) => {
              const player = squad[slot.id];
              return (
                <div key={slot.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-black uppercase text-[#3478F6] dark:text-cyan-400 font-heading">
                      {slot.label}
                    </span>
                    {player ? (
                      <div>
                        <span className="font-bold text-[#172638] dark:text-white">{player.name}</span>
                        <span className="text-[#697789] dark:text-[#6A889C] ml-1.5 text-[11px]">
                          ({player.primaryClub})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#697789] dark:text-[#6A889C] italic">Empty Position</span>
                    )}
                  </div>

                  {player && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#172638] dark:text-white bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] px-1 rounded">
                        {player.countryCode}
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                        ★ {player.uclStats.titles}x
                      </span>
                      <span className="font-heading font-black text-[#172638] dark:text-white text-xs">
                        {player.editorialRating} OVR
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DCE3EA] dark:border-[#162E3D]">
          <p className="text-[11px] text-[#697789] dark:text-[#6A889C] text-center sm:text-left">
            Ratings are fan-made editorial balance estimates.
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold font-heading uppercase tracking-wider transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#3478F6] hover:bg-blue-600 text-white shadow-xs active:scale-95'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Shareable Lineup'}</span>
            </button>

            <button
              onClick={onPlayAgain}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold font-heading uppercase tracking-wider text-[#172638] dark:text-white bg-[#F6F8FA] dark:bg-[#0B1E2B] hover:bg-[#E5E9F0] dark:hover:bg-[#162E3D] border border-[#DCE3EA] dark:border-[#162E3D] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Draft</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
