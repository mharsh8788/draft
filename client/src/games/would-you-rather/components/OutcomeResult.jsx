import React, { useState } from 'react';

export default function OutcomeResult({
  outcome,
  onReplay
}) {
  if (!outcome) return null;

  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  const player = outcome.matchedPlayer || outcome.profile || {};
  const { description, topTraits = [], breakdown = [], summary = {} } = outcome;

  return (
    <div className="card p-6 sm:p-10 space-y-8 bg-card border border-rule text-ink animate-fadeIn">
      {/* 1. Header Kicker, Player Portrait & Match Banner */}
      <div className="text-center space-y-4 border-b border-rule pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-acc/10 border border-acc/20 font-mono text-[10.5px] font-bold text-acc uppercase tracking-widest">
          <span>🔴 BAYERN PLAYER MATCH</span>
          <span className="text-dim2">·</span>
          <span>10 DECISIONS RESOLVED</span>
        </div>

        {/* Player Image Portrait */}
        {player.image && (
          <div className="flex justify-center pt-1">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-acc shadow-sm bg-card2 p-0.5">
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover object-top rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        <div>
          <h1 className="text-4xl sm:text-5xl font-disp text-ink leading-tight">
            {player.name}
          </h1>

          <div className="font-mono text-xs text-dim2 uppercase tracking-wider font-semibold mt-0.5">
            {player.role}
          </div>
        </div>

        {player.headline && (
          <p className="font-disp italic text-lg sm:text-xl text-acc max-w-xl mx-auto leading-tight">
            “{player.headline}”
          </p>
        )}

        {/* Dynamic Trait-Driven Description */}
        <p className="text-sm text-dim max-w-2xl mx-auto leading-relaxed pt-1">
          {description || player.bio}
        </p>

        {/* Strongest Matching Football Traits */}
        {Array.isArray(topTraits) && topTraits.length > 0 && (
          <div className="pt-3 space-y-2">
            <span className="font-mono text-[10px] uppercase text-dim2 tracking-widest block font-bold">
              Your Strongest Matching Football Traits
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {topTraits.map((t, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[11px] uppercase tracking-wider bg-card2 border border-rule px-3 py-1 rounded text-ink font-semibold flex items-center gap-1.5"
                >
                  <span className="text-acc">★</span>
                  <span>{t.label || t.trait}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Analytical Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="bg-card2 p-4 rounded border border-rule">
          <span className="text-[10px] font-mono uppercase text-dim2 tracking-wider block">
            Football Philosophy
          </span>
          <span className="text-sm font-bold font-mono text-ink mt-1 block">
            {summary.preferenceTendency || 'Balanced Visionary'}
          </span>
        </div>

        <div className="bg-card2 p-4 rounded border border-rule">
          <span className="text-[10px] font-mono uppercase text-dim2 tracking-wider block">
            Session Completed
          </span>
          <span className="text-sm font-bold font-mono text-ink mt-1 block">
            {summary.totalQuestions || 10} OF {summary.totalQuestions || 10} QUESTIONS
          </span>
        </div>

        <div className="bg-card2 p-4 rounded border border-rule">
          <span className="text-[10px] font-mono uppercase text-dim2 tracking-wider block">
            Option Distribution
          </span>
          <span className="text-sm font-bold font-mono text-acc mt-1 block">
            {summary.optionACount || 0} Option A · {summary.optionBCount || 0} Option B
          </span>
        </div>
      </div>

      {/* 3. The User's Answer Breakdown (Collapsible Accordion) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
            Your 10 Matchday Decisions in this Session
          </h2>
          <span className="font-mono text-[10.5px] text-dim2">
            OPINION-BASED COMPARISON
          </span>
        </div>

        {/* Compact Dropdown / Accordion Control Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsBreakdownExpanded(prev => !prev)}
            aria-expanded={isBreakdownExpanded}
            className="w-full card p-3 flex items-center justify-between bg-card2 hover:bg-white border border-rule transition-colors cursor-pointer text-left font-sans"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-ink">
                {isBreakdownExpanded
                  ? 'Hide all 10 questions'
                  : `View all ${breakdown.length || 10} questions`}
              </span>
              <span className="text-[11px] font-mono text-dim2">
                ({isBreakdownExpanded ? 'Click to collapse' : 'Click to expand'})
              </span>
            </div>

            <svg
              className={`w-4 h-4 text-ink transition-transform duration-200 ${
                isBreakdownExpanded ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Expanded Question Cards */}
        {isBreakdownExpanded && (
          <div className="grid grid-cols-1 gap-2.5 pt-1 animate-fadeIn">
            {breakdown.map((item, idx) => (
              <div
                key={item.questionId || idx}
                className="p-3.5 sm:p-4 rounded border border-rule bg-[#faf8f2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 sm:max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-dim2 bg-card2 px-1.5 py-0.5 rounded border border-rule">
                      #{idx + 1}
                    </span>
                    <span className="text-dim font-medium truncate">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-ink">
                    {item.selectedLabel}
                    {item.selectedSublabel && (
                      <span className="font-mono font-normal text-xs text-acc ml-2">
                        ({item.selectedSublabel})
                      </span>
                    )}
                  </div>
                  {item.selectedDescription && (
                    <p className="text-[11.5px] text-dim leading-snug">
                      {item.selectedDescription}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-rule/60">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-dim2">
                    Picked
                  </span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-acc text-white rounded">
                    CHOICE {item.selectedKey}
                  </span>
                  {item.rivalLabel && (
                    <span className="text-[10px] text-dim2 italic">
                      over {item.rivalLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Play Again & Replay Action */}
      <div className="pt-4 border-t border-rule flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReplay}
          className="btn text-xs py-3 px-8 shadow-sm flex items-center gap-2"
        >
          <span>Play Again with 10 Fresh Questions</span>
          <span className="font-mono">↺</span>
        </button>
      </div>
    </div>
  );
}
