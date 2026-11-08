import React, { useState, useEffect } from 'react';
import { Formation, Player, SquadMetrics } from '../../../types/draft';
import { GameMode, SimulationResult } from '../types';
import { CampaignTournament, CampaignMatch, CampaignFixture } from '../campaign/types';
import {
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Play,
  Zap,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CampaignSimulationSectionProps {
  formation: Formation;
  squad: Record<string, Player | null>;
  metrics: SquadMetrics;
  mode: GameMode;
  simulationResult: SimulationResult;
  campaignStep: number;
  campaignSeed: string;
  campaignPlayMode: 'match-by-match' | 'automatic';
  campaignTournament: CampaignTournament | null;
  onNextMatch: () => void;
  onSimulateAll: () => void;
  onReplay: () => void;
  onNewSeed: () => void;
  onSetPlayMode: (mode: 'match-by-match' | 'automatic') => void;
  onViewMyCard: () => void;
}

export const CampaignSimulationSection: React.FC<CampaignSimulationSectionProps> = ({
  formation,
  squad,
  metrics,
  mode,
  simulationResult,
  campaignStep,
  campaignSeed,
  campaignPlayMode,
  campaignTournament,
  onNextMatch,
  onSimulateAll,
  onReplay,
  onNewSeed,
  onSetPlayMode,
  onViewMyCard,
}) => {
  // Track expanded match rows for goal timeline inspection (default expand all played)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const toggleExpand = (idx: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const matches = campaignTournament?.matches || [];
  const fixtures = campaignTournament?.fixtures || [];

  const revealedCount =
    campaignPlayMode === 'automatic'
      ? matches.length
      : Math.min(matches.length, Math.max(0, campaignStep));

  const playedMatches = matches.slice(0, revealedCount);
  const hasLost = playedMatches.some((m) => !m.won);

  // A campaign is completed only after all 4 matches (through the Final) are played
  // or immediately when the user's team suffers a knockout defeat (elimination).
  const isCompleted =
    hasLost ||
    (campaignPlayMode === 'automatic' && matches.length > 0) ||
    (revealedCount >= 4 && matches.length >= 4) ||
    (campaignTournament?.isCompleted === true && (hasLost || revealedCount >= matches.length));

  const isChampion = isCompleted && playedMatches.length === 4 && !hasLost;

  useEffect(() => {
    if (isCompleted && isChampion) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#00D26A', '#F59E0B', '#3478F6'],
        });
      } catch (e) {}
    }
  }, [isCompleted, isChampion]);

  // Compute live summary for played matches only (never show premature tournament stats)
  const winsCount = playedMatches.filter((m) => m.won).length;
  const lossesCount = playedMatches.filter((m) => !m.won).length;
  const goalsFor = playedMatches.reduce((sum, m) => sum + m.squadGoals, 0);
  const goalsAgainst = playedMatches.reduce((sum, m) => sum + m.opponentGoals, 0);
  const scoreBanner = `${winsCount}-${lossesCount}`;

  const activeSeed = campaignTournament?.seed || campaignSeed || '#WC6XC4';

  // Next fixture to unlock in match-by-match mode (strictly blocked upon elimination)
  const nextFixtureIndex = revealedCount;
  const hasNextFixture = !isCompleted && !hasLost && nextFixtureIndex < fixtures.length;
  const nextFixture = hasNextFixture ? fixtures[nextFixtureIndex] : null;

  return (
    <section className="bg-white dark:bg-[#071722] border border-[#DCE3EA] dark:border-[#162E3D] rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 transition-colors duration-200">
      {/* 1. Header (Matching Screenshot 1 & 2) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#DCE3EA] dark:border-[#162E3D]">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold tracking-widest text-[#697789] dark:text-[#8899A6] uppercase">
              CAMPAIGN • SEED <strong className="text-[#10B981] dark:text-[#00FFA3] font-black">{activeSeed}</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300">
              36-Club UCL Campaign
            </span>
            <button
              onClick={onNewSeed}
              title="Generate a new campaign seed"
              className="text-[11px] font-bold text-[#697789] hover:text-[#10B981] dark:text-[#8899A6] dark:hover:text-[#00FFA3] underline cursor-pointer transition-colors"
            >
              Draw New Seed
            </button>
          </div>

          <h2 className="font-sports text-5xl sm:text-6xl font-black uppercase text-[#172638] dark:text-white tracking-tight leading-none mt-2">
            THE CAMPAIGN
          </h2>
          <p className="text-xs text-[#697789] dark:text-[#8899A6] mt-1.5 max-w-xl">
            Simulate your drafted XI against real 2026-27 Champions League club squads (Arsenal, Barcelona, Bayern Munich, Real Madrid) using seeded deterministic match mechanics.
          </p>
        </div>

        {/* Match by match / Automatic Segmented Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl self-start md:self-auto">
          <button
            onClick={() => onSetPlayMode('match-by-match')}
            className={`px-4 py-2 rounded-lg text-xs font-sports font-black uppercase tracking-wider transition-all cursor-pointer ${
              campaignPlayMode === 'match-by-match'
                ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-sm'
                : 'text-[#697789] dark:text-[#8899A6] hover:text-[#172638] dark:hover:text-white'
            }`}
          >
            Match by match
          </button>
          <button
            onClick={() => {
              onSetPlayMode('automatic');
              onSimulateAll();
            }}
            className={`px-4 py-2 rounded-lg text-xs font-sports font-black uppercase tracking-wider transition-all cursor-pointer ${
              campaignPlayMode === 'automatic'
                ? 'bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-sm'
                : 'text-[#697789] dark:text-[#8899A6] hover:text-[#172638] dark:hover:text-white'
            }`}
          >
            Automatic
          </button>
        </div>
      </div>

      {/* 2. Match Fixtures List (Matching Screenshot 1, 2, 3) */}
      <div className="space-y-1">
        {/* A. Played Matches (Revealed sequentially) */}
        {playedMatches.map((match, idx) => {
          const isExpanded = expandedRows[idx] ?? true;
          const countryCode =
            match.opponentCountry === 'Spain'
              ? 'ES'
              : match.opponentCountry === 'Germany'
              ? 'DE'
              : match.opponentCountry === 'England'
              ? 'GB'
              : 'EU';

          return (
            <div
              key={match.id || idx}
              className="border-b border-[#DCE3EA] dark:border-[#162E3D] py-4 transition-colors animate-in fade-in duration-200"
            >
              {/* Main Row */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-hidden"
              >
                {/* Left: Round & Opponent */}
                <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                  <span className="font-sports text-sm sm:text-base font-black tracking-wider text-[#697789] dark:text-[#8899A6] w-28 sm:w-36 shrink-0 uppercase">
                    {match.roundLabel}
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs uppercase font-bold text-[#697789] dark:text-[#6A889C] shrink-0">
                      vs
                    </span>
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#F0F4F8] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#8899A6] border border-[#DCE3EA] dark:border-[#162E3D] shrink-0">
                      {countryCode}
                    </span>
                    <span className="font-sports text-lg sm:text-2xl font-black uppercase text-[#172638] dark:text-white truncate tracking-tight">
                      {match.opponentClub} 2026-27
                    </span>
                  </div>
                </div>

                {/* Right: Score, Win/Loss Icon, Chevron */}
                <div className="flex items-center gap-3 sm:gap-5 shrink-0 ml-3">
                  <div className="text-right">
                    <span
                      className={`font-sports text-xl sm:text-3xl font-black tracking-tight ${
                        match.won
                          ? 'text-[#172638] dark:text-white'
                          : 'text-rose-500 dark:text-rose-400'
                      }`}
                    >
                      {match.squadGoals} – {match.opponentGoals}
                    </span>
                    {match.penalties && (
                      <span className="block text-[11px] font-mono text-[#697789] dark:text-[#8899A6]">
                        ({match.penalties.roundsSummary} pens)
                      </span>
                    )}
                  </div>

                  <span
                    className={`font-sports text-2xl sm:text-3xl font-black ${
                      match.won ? 'text-[#10B981] dark:text-[#00D26A]' : 'text-rose-500'
                    }`}
                  >
                    {match.won ? '✓' : '✕'}
                  </span>

                  <div className="text-[#697789] dark:text-[#8899A6] group-hover:text-[#172638] dark:group-hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </button>

              {/* Expanded Details: Chronological Goals Timeline & Shootout */}
              {isExpanded && (
                <div className="mt-3.5 ml-4 sm:ml-8 pl-4 sm:pl-6 border-l-2 border-[#10B981]/50 dark:border-[#00D26A]/50 space-y-2 py-1 animate-in fade-in duration-200">
                  {match.goals.length === 0 ? (
                    <p className="text-xs text-[#697789] dark:text-[#8899A6] italic">
                      No goals in regulation time.
                    </p>
                  ) : (
                    match.goals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2.5 text-xs sm:text-sm">
                        <span className="font-mono text-xs font-bold text-[#697789] dark:text-[#8899A6] w-8">
                          {goal.minute}'
                        </span>
                        <span className="text-base select-none">
                          {goal.isUserTeam ? '⚽' : '🔴'}
                        </span>
                        <span
                          className={`font-sports font-black tracking-wider uppercase text-sm sm:text-base ${
                            goal.isUserTeam
                              ? 'text-[#172638] dark:text-white'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {goal.scorerName}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#6A889C]">
                          ({goal.isUserTeam ? 'Your Team' : match.opponentClub})
                        </span>
                      </div>
                    ))
                  )}

                  {/* Penalty Shootout Details if drawn */}
                  {match.penalties && (
                    <div className="mt-3 pt-2 border-t border-dashed border-[#DCE3EA] dark:border-[#162E3D]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1.5">
                        ⚡ PENALTY SHOOTOUT RESOLUTION ({match.penalties.roundsSummary})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#8899A6] block">
                            Your XI Kicks:
                          </span>
                          {match.penalties.userKicks.map((k, kIdx) => (
                            <span key={kIdx} className="mr-2 inline-block font-mono">
                              {k.scored ? '⚽ ✓' : '❌'}{' '}
                              <strong className="font-sports">{k.takerName}</strong>
                            </span>
                          ))}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#697789] dark:text-[#8899A6] block">
                            {match.opponentClub} Kicks:
                          </span>
                          {match.penalties.opponentKicks.map((k, kIdx) => (
                            <span key={kIdx} className="mr-2 inline-block font-mono">
                              {k.scored ? '⚽ ✓' : '❌'}{' '}
                              <strong className="font-sports">{k.takerName}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tactical Narrative */}
                  <p className="text-xs text-[#697789] dark:text-[#8899A6] italic pt-2 border-t border-[#DCE3EA]/60 dark:border-[#162E3D]/60">
                    {match.narrative}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* B. Currently Unlocked Playable Fixture (shown when in match-by-match mode and not completed) */}
        {campaignPlayMode === 'match-by-match' && !isCompleted && nextFixture && (
          <div className="border-b border-[#DCE3EA] dark:border-[#162E3D] py-4 transition-colors">
            <div className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <span className="font-sports text-sm sm:text-base font-black tracking-wider text-[#697789] dark:text-[#8899A6] w-28 sm:w-36 shrink-0 uppercase">
                  {nextFixture.roundLabel}
                </span>

                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs uppercase font-bold text-[#697789] dark:text-[#6A889C] shrink-0">
                    vs
                  </span>
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#F0F4F8] dark:bg-[#0B1E2B] text-[#697789] dark:text-[#8899A6] border border-[#DCE3EA] dark:border-[#162E3D] shrink-0">
                    {nextFixture.opponentCountry === 'Spain'
                      ? 'ES'
                      : nextFixture.opponentCountry === 'Germany'
                      ? 'DE'
                      : nextFixture.opponentCountry === 'England'
                      ? 'GB'
                      : 'EU'}
                  </span>
                  <span className="font-sports text-lg sm:text-2xl font-black uppercase text-[#172638] dark:text-white truncate tracking-tight">
                    {nextFixture.opponentClub} 2026-27
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] dark:bg-[#00D26A]/20 dark:text-[#00FFA3] border border-[#10B981]/30 dark:border-[#00D26A]/30">
                  READY
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Match-by-Match Next Fixture Action Bar */}
      {campaignPlayMode === 'match-by-match' && hasNextFixture && nextFixture && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#10B981] dark:border-[#00D26A] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#10B981] dark:text-[#00FFA3] block">
              NEXT KNOCKOUT FIXTURE
            </span>
            <h4 className="font-sports text-2xl font-black uppercase text-[#172638] dark:text-white mt-0.5">
              {nextFixture.roundLabel} vs {nextFixture.opponentClub}
            </h4>
            <p className="text-xs text-[#697789] dark:text-[#8899A6] mt-0.5">
              Opponent squad evaluated directly from 2026-27 team sheet. Click play to execute this stage.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onNextMatch}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] text-white dark:text-slate-950 font-sports text-xl font-black uppercase tracking-wider shadow-md btn-lift-primary flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play {nextFixture.roundName}</span>
            </button>

            <button
              onClick={onSimulateAll}
              className="px-4 py-3 rounded-xl bg-white dark:bg-[#081923] hover:bg-[#E5E9F0] dark:hover:bg-[#122A3B] text-[#172638] dark:text-white border border-[#DCE3EA] dark:border-[#162E3D] font-sports text-sm font-bold uppercase btn-lift flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Rest ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Bottom Campaign Summary Card (Displayed ONLY after Final is played or user is eliminated) */}
      {isCompleted && (
        <div className="rounded-3xl p-6 sm:p-10 bg-[#FAF8F5] text-slate-900 border border-[#E5E9F0] dark:border-transparent shadow-md flex flex-col md:flex-row items-center justify-between gap-8 transition-colors animate-in fade-in duration-300">
          {/* Left Side: Massive Stylized Score Banner */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="font-sports text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none select-none text-slate-900 drop-shadow-sm">
              {scoreBanner}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center md:justify-start">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest">
                {scoreBanner} RECORD
              </span>
              {hasLost && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-300">
                  {campaignTournament?.summary?.statusHeadline || (playedMatches.length > 0 ? `ELIMINATED IN ${playedMatches[playedMatches.length - 1].roundName.toUpperCase()}` : 'ELIMINATED')}
                </span>
              )}
              {isChampion && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  CHAMPIONS OF EUROPE
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Wins Header + 3 Statistics Columns */}
          <div className="flex flex-col items-center md:items-end w-full md:w-auto">
            <div className="font-sports text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 mb-4">
              {winsCount} {winsCount === 1 ? 'WIN' : 'WINS'}
            </div>

            <div className="grid grid-cols-3 gap-6 sm:gap-10 text-center">
              {/* Goals For */}
              <div>
                <div className="font-sports text-4xl sm:text-5xl font-black text-amber-500 leading-none">
                  {goalsFor}
                </div>
                <span className="font-sports text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block mt-1">
                  GOALS FOR
                </span>
              </div>

              {/* Goals Against */}
              <div>
                <div className="font-sports text-4xl sm:text-5xl font-black text-amber-500 leading-none">
                  {goalsAgainst}
                </div>
                <span className="font-sports text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block mt-1">
                  GOALS AGAINST
                </span>
              </div>

              {/* Wins */}
              <div>
                <div className="font-sports text-4xl sm:text-5xl font-black text-amber-500 leading-none">
                  {winsCount}
                </div>
                <span className="font-sports text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block mt-1">
                  WINS
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Action Controls (Matching Screenshot 1 & 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Replay Button */}
        <button
          onClick={onReplay}
          className="px-6 py-3.5 rounded-2xl bg-black dark:bg-[#0B1E2B] hover:bg-slate-800 dark:hover:bg-[#122A3B] text-white border border-slate-700 dark:border-[#162E3D] font-sports text-xl font-black uppercase tracking-wider btn-lift flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>REPLAY</span>
        </button>

        {/* View My Card Button */}
        <button
          onClick={onViewMyCard}
          className="px-8 py-3.5 rounded-2xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] text-white dark:text-slate-950 font-sports text-2xl font-black uppercase tracking-wider shadow-md dark:shadow-[0_4px_24px_rgba(0,210,106,0.35)] btn-lift-primary flex items-center gap-2.5 cursor-pointer"
        >
          <span>VIEW MY CARD</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </section>
  );
};
