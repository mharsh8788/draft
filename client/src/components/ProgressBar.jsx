import React from 'react';
import { ROUND_POSITIONS } from '../data/players';
import { Check } from 'lucide-react';

export default function ProgressBar({ currentRound }) {
  return (
    <div className="w-full max-w-5xl mx-auto py-2">
      {/* Progress Track */}
      <div className="relative">
        {/* Horizontal Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-[#1c2535] z-0">
          <div 
            className="h-full bg-[#dc052d] transition-all duration-300 ease-out"
            style={{ width: `${((currentRound - 1) / (ROUND_POSITIONS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative z-10 flex justify-between items-center">
          {ROUND_POSITIONS.map((r) => {
            const isCompleted = r.round < currentRound;
            const isCurrent = r.round === currentRound;

            return (
              <div key={r.round} className="flex flex-col items-center">
                <div 
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-display font-bold transition-colors ${
                    isCompleted 
                      ? 'bg-[#dc052d] text-white border border-[#dc052d]'
                      : isCurrent 
                        ? 'bg-white text-[#0b0f17] border-2 border-[#dc052d]'
                        : 'bg-[#121824] text-gray-500 border border-[#1c2535]'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : (
                    <span>{r.round}</span>
                  )}
                </div>

                <span 
                  className={`mt-1.5 text-[10px] font-display font-bold uppercase tracking-wider hidden sm:block ${
                    isCurrent 
                      ? 'text-white' 
                      : isCompleted 
                        ? 'text-gray-300' 
                        : 'text-gray-600'
                  }`}
                >
                  {r.position}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
