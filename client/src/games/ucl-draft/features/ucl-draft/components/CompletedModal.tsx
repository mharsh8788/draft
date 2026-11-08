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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-[#DCE3EA] rounded-2xl p-5 sm:p-6 shadow-xl text-[#172638]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#697789] hover:text-[#172638] hover:bg-[#F6F8FA] transition-colors"
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
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3478F6] bg-[#EDF4FF] border border-[#BFDBFE] px-2 py-0.5 rounded">
                {metrics.isComplete ? 'XI Complete' : 'In-Progress Draft'}
              </span>
              {mode === 'almanac' && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  Almanac Reveal
                </span>
              )}
            </div>
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight text-[#172638] mt-0.5">
              ROAD TO IMMORTALITY
            </h2>
            <p className="text-[11px] uppercase font-bold text-[#697789] tracking-wider mt-0.5">
              BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI
            </p>
          </div>
        </div>

        {/* Mode Reveal Banner for Almanac */}
        {mode === 'almanac' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-900 font-medium">
              <strong className="font-bold">Almanac Mode Reveal:</strong> You drafted your squad purely from historical memory! The true editorial player ratings and calculated squad strength are now unveiled below.
            </p>
          </div>
        )}

        {/* Overall Score & Positional Balance Cards */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Main OVR Card */}
          <div className="col-span-2 sm:col-span-1 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold text-[#3478F6] tracking-wider">
              Squad OVR
            </span>
            <span className="font-heading text-3xl font-black text-[#172638] mt-1">
              {metrics.overallRating || '--'}
            </span>
            {metrics.chemistryBonus > 0 && (
              <span className="text-[10px] font-bold text-amber-700 mt-0.5 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" />+{metrics.chemistryBonus} Chem
              </span>
            )}
          </div>

          {/* Positional Metrics */}
          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-rose-700">Attack</span>
            <span className="font-heading text-xl font-bold text-[#172638] mt-0.5">
              {metrics.attackRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-emerald-700">Midfield</span>
            <span className="font-heading text-xl font-bold text-[#172638] mt-0.5">
              {metrics.midfieldRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-blue-700">Defense</span>
            <span className="font-heading text-xl font-bold text-[#172638] mt-0.5">
              {metrics.defenseRating || '--'}
            </span>
          </div>

          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-2.5 text-center flex flex-col justify-center">
            <span className="text-[10px] uppercase font-semibold text-amber-700">Goalkeeper</span>
            <span className="font-heading text-xl font-bold text-[#172638] mt-0.5">
              {metrics.goalkeeperRating || '--'}
            </span>
          </div>
        </div>

        {/* Champions League Knockout Tournament Simulation */}
        {simulationResult && (
          <div className="mt-4 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#172638]">
                <Award className="w-4 h-4 text-[#3478F6]" />
                <span>Tournament Simulation Result</span>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  simulationResult.champion
                    ? 'bg-[#E6F4EA] text-[#137333] border border-[#A8DAB5]'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {simulationResult.champion ? '🏆 European Champions' : 'Knockout Exit'}
              </span>
            </div>

            <p className="text-xs text-[#172638] font-semibold mb-3">
              {simulationResult.summaryVerdict}
            </p>

            {/* Match Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {simulationResult.matches.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs ${
                    m.won ? 'bg-white border-[#DCE3EA]' : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#697789]">{m.round}</span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded text-[11px] ${
                        m.won ? 'bg-[#E6F4EA] text-[#137333]' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {m.squadGoals} - {m.opponentGoals}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#172638]">vs {m.opponent}</div>
                  <p className="text-[10px] text-[#697789] mt-0.5 leading-snug">{m.narrative}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Synergies & Chemistry Highlights */}
        {metrics.activeSynergies.length > 0 && (
          <div className="mt-4 bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
              <Flame className="w-4 h-4 text-amber-600" />
              <span>Squad Synergies & Tactical Chemistry</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metrics.activeSynergies.map((syn, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-white border border-[#DCE3EA] text-[#172638] px-2.5 py-1 rounded-md font-semibold shadow-2xs"
                >
                  ⚡ {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Club & Era Breakdown */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Clubs Represented
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(metrics.clubCounts).map(([club, count]) => (
                <span
                  key={club}
                  className="bg-white border border-[#DCE3EA] text-[#172638] px-2 py-0.5 rounded text-[11px]"
                >
                  {club} <strong className="text-[#3478F6] font-mono">({count})</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl p-3">
            <span className="text-[10px] uppercase font-bold text-[#697789] tracking-wider block mb-1.5">
              Eras Represented
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(metrics.eraCounts).map(([era, count]) => (
                <span
                  key={era}
                  className="bg-white border border-[#DCE3EA] text-[#172638] px-2 py-0.5 rounded text-[11px]"
                >
                  {era} <strong className="text-[#3478F6] font-mono">({count})</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Starting XI Lineup Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#697789]">
              Starting Lineup Sheet ({formation.name})
            </span>
            <span className="text-xs text-[#697789] font-mono">{metrics.totalDrafted} of 11</span>
          </div>

          <div className="bg-[#F6F8FA] border border-[#DCE3EA] rounded-xl divide-y divide-[#DCE3EA] max-h-52 overflow-y-auto">
            {rosterSlots.map((slot) => {
              const player = squad[slot.id];
              return (
                <div key={slot.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-[11px] font-black uppercase text-[#3478F6] font-heading">
                      {slot.label}
                    </span>
                    {player ? (
                      <div>
                        <span className="font-bold text-[#172638]">{player.name}</span>
                        <span className="text-[#697789] ml-1.5 text-[11px]">
                          ({player.primaryClub})
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#697789] italic">Empty Position</span>
                    )}
                  </div>

                  {player && (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-[#172638] bg-white border border-[#DCE3EA] px-1 rounded">
                        {player.countryCode}
                      </span>
                      <span className="text-amber-700 font-bold text-[11px]">
                        ★ {player.uclStats.titles}x
                      </span>
                      <span className="font-heading font-black text-[#172638] text-xs">
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
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#DCE3EA]">
          <p className="text-[11px] text-[#697789] text-center sm:text-left">
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
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold font-heading uppercase tracking-wider text-[#172638] bg-[#F6F8FA] hover:bg-[#E5E9F0] border border-[#DCE3EA] transition-colors"
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
