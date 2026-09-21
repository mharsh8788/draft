import React, { useState } from 'react';
import { RotateCcw, Share2, Check, ArrowLeft, Flame, Shield, Bot } from 'lucide-react';
import PitchView from './PitchView';
import { getFormation } from '../data/formations';
import { generateComputerXI } from '../utils/computerDraft';

export default function ComparisonView({ 
  userTeam = [], 
  opponentTeam = [], 
  formationKey = '4-3-3',
  score = 0, 
  bestStreak = 0, 
  correctCount = 0, 
  wrongCount = 0, 
  onRestart, 
  onBackToGames 
}) {
  const [copied, setCopied] = useState(false);
  const formation = getFormation(formationKey);

  // Guarantee valid, non-duplicate 11-man Computer XI for the exact formation
  const computerXI = opponentTeam && opponentTeam.length === 11
    ? opponentTeam
    : generateComputerXI(formationKey, userTeam, opponentTeam);

  // Compute stats for User XI
  const userTotalOvr = userTeam.reduce((acc, p) => acc + (p.overall || 0), 0);
  const userAvgOvr = (userTotalOvr / (userTeam.length || 1)).toFixed(1);
  const userGoals = userTeam.reduce((acc, p) => acc + (p.goals || 0), 0);
  const userTrophies = userTeam.reduce((acc, p) => acc + (p.trophies || 0), 0);

  // Compute stats for Computer XI
  const compTotalOvr = computerXI.reduce((acc, p) => acc + (p.overall || 0), 0);
  const compAvgOvr = (compTotalOvr / (computerXI.length || 1)).toFixed(1);
  const compGoals = computerXI.reduce((acc, p) => acc + (p.goals || 0), 0);
  const compTrophies = computerXI.reduce((acc, p) => acc + (p.trophies || 0), 0);

  const handleCopySummary = () => {
    let comparisonLines = formation.slots.map((slot, idx) => {
      const u = userTeam[idx];
      const c = computerXI[idx];
      const uName = u ? `${u.name} (${u.overall})` : '—';
      const cName = c ? `${c.name} (${c.overall})` : '—';
      return `• ${slot.position}: ${uName} vs ${cName}`;
    }).join('\n');

    const text = `⚽ FC BAYERN XI DRAFT: YOUR XI vs COMPUTER XI (${formation.name})\n\n🔴 YOUR XI: ${userAvgOvr} OVR (${userTotalOvr} Total Pts)\n🔵 COMPUTER XI: ${compAvgOvr} OVR (${compTotalOvr} Total Pts)\n\nScore: ${score} XP | Correct Picks: ${correctCount}/11 | Streak: ${bestStreak}\n\nHead-to-Head Lineup:\n${comparisonLines}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="border-b border-[#222c3d] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#dc052d] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
              FINAL COMPARISON
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-xs font-mono text-gray-300 font-bold">
              {formation.name} ({formation.label})
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight">
            YOUR XI <span className="text-gray-500 font-normal">vs</span> COMPUTER XI
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-sans max-w-3xl">
            Compare your drafted Starting XI against the opposing Computer XI in the {formation.name} tactical setup.
          </p>
        </div>

        <button
          onClick={onBackToGames}
          className="self-start sm:self-center px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/10 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Hub</span>
        </button>
      </div>

      {/* Head-to-Head Summary Scoreboard Banner */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-stretch font-mono">
        {/* User XI Card (5 cols) */}
        <div className="md:col-span-5 bg-[#121824] rounded-xl border-2 border-[#dc052d]/60 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222c3d] pb-3">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#dc052d]" />
              <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wide">
                YOUR BAYERN XI
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#dc052d]/20 text-[#dc052d] font-bold border border-[#dc052d]/40">
              {formation.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
              <span className="text-[10px] text-gray-400 uppercase block">AVG SQUAD RATING</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {userAvgOvr} <span className="text-xs font-mono text-[#dc052d]">OVR</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
              <span className="text-[10px] text-gray-400 uppercase block">TOTAL SQUAD OVR</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#dc052d]">
                {userTotalOvr}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
            <span>Goals: <strong className="text-white">{userGoals.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Titles: <strong className="text-[#fdb913]">{userTrophies}</strong></span>
          </div>
        </div>

        {/* Center VS Divider (1 col) */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#162030] border border-[#2a3850] flex items-center justify-center shadow-md">
            <span className="font-display font-black text-sm text-gray-300">VS</span>
          </div>
        </div>

        {/* Computer XI Card (5 cols) */}
        <div className="md:col-span-5 bg-[#121824] rounded-xl border-2 border-[#2563eb]/60 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#222c3d] pb-3">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#3b82f6]" />
              <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wide">
                COMPUTER BAYERN XI
              </span>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2563eb]/20 text-[#3b82f6] font-bold border border-[#2563eb]/40">
              {formation.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
              <span className="text-[10px] text-gray-400 uppercase block">AVG SQUAD RATING</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-white">
                {compAvgOvr} <span className="text-xs font-mono text-[#3b82f6]">OVR</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
              <span className="text-[10px] text-gray-400 uppercase block">TOTAL SQUAD OVR</span>
              <span className="font-display font-black text-2xl sm:text-3xl text-[#3b82f6]">
                {compTotalOvr}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
            <span>Goals: <strong className="text-white">{compGoals.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Titles: <strong className="text-[#fdb913]">{compTrophies}</strong></span>
          </div>
        </div>
      </div>

      {/* In-Game Draft Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121824] p-4 rounded-xl border border-[#222c3d] font-mono">
        <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
          <span className="text-[10px] text-gray-400 uppercase block">DRAFT COMPLETION</span>
          <span className="font-display font-black text-xl sm:text-2xl text-white">11 / 11</span>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
          <span className="text-[10px] text-gray-400 uppercase block">ACCURACY</span>
          <span className="font-display font-black text-xl sm:text-2xl text-white">
            <span className="text-emerald-400">{correctCount}</span>
            <span className="text-gray-500 text-base font-normal"> / </span>
            <span className="text-gray-400 text-lg">{wrongCount} W</span>
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
          <span className="text-[10px] text-gray-400 uppercase block flex items-center gap-1">
            <Flame size={12} className="text-[#fdb913]" /> BEST STREAK
          </span>
          <span className="font-display font-black text-xl sm:text-2xl text-[#fdb913]">
            {bestStreak}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0e14] border border-[#222c3d]">
          <span className="text-[10px] text-gray-400 uppercase block">XP EARNED</span>
          <span className="font-display font-black text-xl sm:text-2xl text-[#dc052d]">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Side-By-Side (Desktop) / Stacked (Mobile) Tactical Pitches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
            Tactical Pitch Comparison ({formation.name})
          </h2>
          <span className="text-xs font-mono text-gray-400">
            SAME FORMATION • 11 SLOTS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Your XI Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-mono font-bold uppercase tracking-wider text-[#dc052d]">
              <span className="flex items-center gap-1.5">
                <Shield size={14} /> YOUR STARTING XI
              </span>
              <span>{userAvgOvr} OVR</span>
            </div>
            <PitchView 
              team={userTeam} 
              title="YOUR BAYERN XI"
              formationKey={formation.key} 
              isComputer={false}
              compact={true}
              showStatsHeader={false}
            />
          </div>

          {/* Column 2: Computer XI Pitch */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 text-xs font-mono font-bold uppercase tracking-wider text-[#3b82f6]">
              <span className="flex items-center gap-1.5">
                <Bot size={14} /> COMPUTER STARTING XI
              </span>
              <span>{compAvgOvr} OVR</span>
            </div>
            <PitchView 
              team={computerXI} 
              title="COMPUTER BAYERN XI"
              formationKey={formation.key} 
              isComputer={true}
              compact={true}
              showStatsHeader={false}
            />
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-base tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
        >
          <RotateCcw size={18} />
          <span>PLAY AGAIN / CHOOSE FORMATION</span>
        </button>

        <button
          onClick={handleCopySummary}
          className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
          <span>{copied ? "COPIED FULL COMPARISON" : "SHARE COMPARISON"}</span>
        </button>

        <button
          onClick={onBackToGames}
          className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase border border-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          <span>BACK TO GAMES</span>
        </button>
      </div>
    </div>
  );
}
