import React from 'react';
import { Formation, Player, SquadMetrics } from '../../../types/draft';
import { GameMode } from '../types';

interface RightScorecardProps {
  formation: Formation;
  squad: Record<string, Player | null>;
  metrics: SquadMetrics;
  mode: GameMode;
}

export const RightScorecard: React.FC<RightScorecardProps> = ({
  formation,
  squad,
  metrics,
  mode,
}) => {
  // Order slots in classical scorecard sequence: GK, RB, CB, CB, LB, CM, CM, CM, RW, ST, LW
  const orderedSlots = [...formation.slots].sort((a, b) => {
    const order = [
      'GK',
      'RB',
      'RCB',
      'CB',
      'CB1',
      'CB2',
      'LCB',
      'LB',
      'RWB',
      'LWB',
      'CDM',
      'RCM',
      'CM',
      'CM1',
      'CM2',
      'LCM',
      'LM',
      'RM',
      'CAM',
      'RW',
      'ST',
      'CF',
      'LS',
      'RS',
      'LW',
    ];
    const idxA = order.indexOf(a.label);
    const idxB = order.indexOf(b.label);
    return (idxA >= 0 ? idxA : 99) - (idxB >= 0 ? idxB : 99);
  });

  return (
    <div className="bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[560px] transition-colors duration-200">
      <div>
        {/* Scorecard Tab Header - full available container width */}
        <div className="p-1 bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] rounded-xl mb-4">
          <div className="w-full py-1.5 text-xs font-bold font-heading uppercase rounded-lg bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 shadow-2xs dark:shadow-[0_0_12px_rgba(0,210,106,0.38)] text-center tracking-wider">
            Scorecard
          </div>
        </div>

        {/* LIVE SCORECARD */}
        <div className="space-y-3">
          {/* Header & Giant OVR number */}
          <div className="flex items-start justify-between pb-2 border-b border-[#DCE3EA] dark:border-[#162E3D]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#697789] dark:text-[#6A889C] block">
                SCORECARD • {metrics.totalDrafted}/11
              </span>
              <span className="text-[11px] text-[#697789] dark:text-[#6A889C] font-medium">
                {mode === 'almanac' ? 'Almanac Memory Mode' : 'Live Squad Balance'}
              </span>
            </div>

            {/* Giant Number in font-sports matching screenshots */}
            <div className="font-sports text-6xl font-black text-[#172638] dark:text-white leading-none tracking-tight">
              {mode === 'classic' ? (metrics.overallRating || '—') : '??'}
            </div>
          </div>

          {/* Attack & Defense Meters (matching Screenshots 2 & 3) */}
          <div className="space-y-2 py-1">
            {/* Attack Meter */}
            <div>
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#172638] dark:text-white mb-1">
                <span>ATTACK {mode === 'classic' && metrics.attackRating ? metrics.attackRating : '—'}</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5E9F0] dark:bg-[#162E3D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] dark:bg-[#00D26A] dark:shadow-[0_0_8px_rgba(0,210,106,0.6)] transition-all duration-300 rounded-full"
                  style={{
                    width: `${mode === 'classic' && metrics.attackRating ? (metrics.attackRating / 99) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Defense Meter */}
            <div>
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#172638] dark:text-white mb-1">
                <span>DEFENSE {mode === 'classic' && metrics.defenseRating ? metrics.defenseRating : '—'}</span>
              </div>
              <div className="h-1.5 w-full bg-[#E5E9F0] dark:bg-[#162E3D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#172638] dark:bg-white transition-all duration-300 rounded-full"
                  style={{
                    width: `${mode === 'classic' && metrics.defenseRating ? (metrics.defenseRating / 99) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Position-by-Position Lineup List (matching Screenshots 1, 2, 3) */}
          <div className="pt-2 border-t border-[#DCE3EA] dark:border-[#162E3D] divide-y divide-[#DCE3EA]/60 dark:divide-[#162E3D]/60 max-h-[340px] overflow-y-auto pr-1">
            {orderedSlots.map((slot) => {
              const player = squad[slot.id];
              return (
                <div key={slot.id} className="py-1.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-[10px] font-black uppercase text-[#697789] dark:text-[#6A889C] font-mono">
                      {slot.label}
                    </span>
                    {player ? (
                      <span className="font-bold text-[#172638] dark:text-white truncate max-w-[140px]">
                        {player.shortName || player.playerName || player.name}
                      </span>
                    ) : (
                      <span className="text-[#697789] dark:text-[#6A889C] font-medium">—</span>
                    )}
                  </div>

                  {player && (
                    <span className="font-heading font-black text-xs text-[#10B981] dark:text-[#00FFA3]">
                      {mode === 'classic' ? (player.editorialRating || player.rating) : '★'}
                    </span>
                  )}
                </div>
              );
              })}
            </div>
          </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#DCE3EA] dark:border-[#162E3D] text-[10px] text-[#697789] dark:text-[#6A889C] text-center">
        ROAD TO IMMORTALITY Scoring Engine
      </div>
    </div>
  );
};
