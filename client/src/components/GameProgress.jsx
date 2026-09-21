import React from 'react';
import { ROUND_POSITIONS } from '../data/players';

export default function GameProgress({ currentRound }) {
  const currentPos = ROUND_POSITIONS.find(r => r.round === currentRound);

  return (
    <div className="w-full max-w-xl mx-auto py-1 space-y-2 text-center select-none">
      {/* Dots Indicator: ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {ROUND_POSITIONS.map((r) => {
          const isDone = r.round < currentRound;
          const isCurrent = r.round === currentRound;

          return (
            <div
              key={r.round}
              className={`transition-all ${
                isCurrent 
                  ? 'w-6 h-2 rounded-full bg-[#dc052d]' 
                  : isDone 
                    ? 'w-2 h-2 rounded-full bg-white/70' 
                    : 'w-2 h-2 rounded-full bg-white/15'
              }`}
              title={`Round ${r.round}: ${r.label}`}
            />
          );
        })}
      </div>
    </div>
  );
}
