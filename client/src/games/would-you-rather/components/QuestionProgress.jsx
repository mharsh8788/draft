import React from 'react';

export default function QuestionProgress({
  currentIndex,
  totalQuestions,
  onRestart
}) {
  const currentNumber = currentIndex + 1;
  const progressPercent = Math.round((currentNumber / totalQuestions) * 100);

  return (
    <div className="card p-3.5 space-y-3 bg-[#fbf9f3] border border-rule">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Progress counter */}
        <div className="flex items-center gap-2">
          <span className="tag font-bold text-ink">
            DECISION {currentNumber} OF {totalQuestions}
          </span>
          <span className="text-dim2">·</span>
          <span className="font-mono text-dim text-[11px]">
            {progressPercent}% RESOLVED
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 font-mono text-[11.5px]">
          <span className="text-dim2 text-[10px] hidden sm:inline uppercase">
            15 Bayern Player Profiles
          </span>
          <div className="border-l border-rule pl-3">
            <button
              type="button"
              onClick={onRestart}
              className="text-[10.5px] font-mono text-dim hover:text-acc underline cursor-pointer bg-transparent border-none p-0"
              title="Restart quiz from Question 1"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Progress meter bar */}
      <div className="w-full h-1.5 bg-rule rounded-full overflow-hidden">
        <div
          className="h-full bg-acc transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
