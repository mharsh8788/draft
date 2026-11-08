import React from 'react';
import { X, Trophy, ShieldCheck, Sparkles, BookOpen, Dices } from 'lucide-react';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-[#172638] dark:text-[#E6F0F6]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE3EA] dark:border-[#162E3D]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 flex items-center justify-center font-sports text-xl font-black">
              UCL
            </div>
            <div>
              <h3 className="font-sports text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-[#172638] dark:text-white">
                ROAD TO IMMORTALITY
              </h3>
              <p className="text-[11px] uppercase tracking-widest text-[#697789] dark:text-[#6A889C] font-semibold mt-0.5">
                BUILD YOUR ALL-TIME CHAMPIONS LEAGUE XI • Strategy Guide & Rules
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white hover:bg-[#F6F8FA] dark:hover:bg-[#0B1E2B] btn-lift cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rules Grid */}
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 font-sports text-xl font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="font-heading font-black text-sm uppercase text-[#172638] dark:text-white">
                Turn-by-Turn European Club Draws
              </h4>
              <p className="text-[#697789] dark:text-[#6A889C] mt-1 leading-relaxed">
                Every turn draws one European powerhouse from the 2026–27 UEFA Champions League. You draft exactly one eligible player from that club into your starting XI.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 font-sports text-xl font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="font-heading font-black text-sm uppercase text-[#172638] dark:text-white">
                Position Strictness & Formation Fit
              </h4>
              <p className="text-[#697789] dark:text-[#6A889C] mt-1 leading-relaxed">
                Players can only fill compatible tactical slots (GK, DEF, MID, FWD). If a drawn player cannot fit any remaining open slot in your selected formation, their row will indicate <strong className="text-amber-500 font-bold">NO OPEN POSITION</strong>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 font-sports text-xl font-black flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="font-heading font-black text-sm uppercase text-[#172638] dark:text-white">
                Classic vs Almanac Mode
              </h4>
              <p className="text-[#697789] dark:text-[#6A889C] mt-1 leading-relaxed">
                In <strong className="text-[#10B981] dark:text-[#00D26A]">Classic Mode</strong>, numerical ratings (65–99) and criteria are visible. In <strong className="text-amber-400 font-bold">Almanac Mode</strong>, numerical ratings and sector balances are concealed during the draft—rely purely on your football knowledge until the final reveal!
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] flex gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#10B981] dark:bg-[#00D26A] text-white dark:text-slate-950 font-sports text-xl font-black flex items-center justify-center shrink-0">
              4
            </div>
            <div>
              <h4 className="font-heading font-black text-sm uppercase text-[#172638] dark:text-white">
                The Knockout Campaign Run
              </h4>
              <p className="text-[#697789] dark:text-[#6A889C] mt-1 leading-relaxed">
                Once all 11 slots are filled, launch the tournament campaign! Battle European opponents through the Round of 16, Quarter-Finals, Semi-Finals, and Final. Win the title without conceding a single goal to achieve <strong className="text-[#10B981] dark:text-[#00D26A]">European Immortality</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#DCE3EA] dark:border-[#162E3D] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] text-white dark:text-slate-950 font-sports text-xl font-black uppercase tracking-wider btn-lift-primary cursor-pointer"
          >
            GOT IT, LET'S PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
