import React, { useEffect } from 'react';
import { 
  X, 
  Trophy, 
  Dices, 
  UserPlus, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Swords, 
  BarChart3,
  HelpCircle
} from 'lucide-react';

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ isOpen, onClose }) => {
  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      num: 1,
      icon: Trophy,
      title: 'The Objective',
      accent: 'text-[#dc052d]',
      bg: 'bg-[#dc052d]/10 border-[#dc052d]/20',
      description: 'Build an elite 11-player Champions League starting XI and lead them through a four-round knockout tournament to conquer Europe and lift the UCL trophy.'
    },
    {
      num: 2,
      icon: Dices,
      title: 'Starting a Challenge',
      accent: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
      description: 'Pick your formation and tactical style, then click ROLL to draw a European powerhouse from the 2026–27 UEFA Champions League. You have 3 tactical rerolls per game if you need a different club draw.'
    },
    {
      num: 3,
      icon: UserPlus,
      title: 'Drafting Players',
      accent: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/20',
      description: 'Each club draw reveals 11 squad players. Select exactly one player per round to draft into an open, eligible position on your tactical pitch until all 11 slots are filled.'
    },
    {
      num: 4,
      icon: Award,
      title: 'Player Ratings',
      accent: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      description: 'Player ratings (65–99 OVR) are calibrated specifically to UEFA Champions League performance, European tournament pedigree, and knockout match form for the season.'
    },
    {
      num: 5,
      icon: ShieldCheck,
      title: 'Position Eligibility',
      accent: 'text-indigo-500',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      description: 'Players can only fill tactical slots matching their eligible positions (e.g. CB, LB/LWB, CM/CAM, RW/ST). Selecting a player highlights all valid empty pitch slots in green. Players with no open slots are marked "NO OPEN POSITION".'
    },
    {
      num: 6,
      icon: Sparkles,
      title: 'User-Biased Drafting',
      accent: 'text-purple-500',
      bg: 'bg-purple-500/10 border-purple-500/20',
      description: 'The drafting engine uses intelligent squad assistance to prioritize viable candidate draws, helping you construct a balanced, chemistry-linked starting XI without hitting artificial dead ends.'
    },
    {
      num: 7,
      icon: Swords,
      title: 'Path Decider (Knockout Rounds)',
      accent: 'text-rose-500',
      bg: 'bg-rose-500/10 border-rose-500/20',
      description: 'Once all 11 players are locked in, launch the tournament campaign! Battle European contenders through the Round of 16, Quarter-Finals, Semi-Finals, and Final to claim the championship.'
    },
    {
      num: 8,
      icon: BarChart3,
      title: 'Final Scorecard',
      accent: 'text-teal-500',
      bg: 'bg-teal-500/10 border-teal-500/20',
      description: 'After the tournament run, your final scorecard evaluates your overall Squad OVR, tactical sector ratings (Attack, Midfield, Defense, Goalkeeper), chemistry bonuses, and knockout achievements.'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl shadow-2xl text-[#172638] dark:text-[#E6F0F6] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#DCE3EA] dark:border-[#162E3D] bg-white/80 dark:bg-[#081923]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#dc052d] text-white flex items-center justify-center shadow-md shadow-[#dc052d]/30 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="how-to-play-title" className="font-sports text-2xl sm:text-3xl font-black uppercase tracking-tight leading-none text-[#172638] dark:text-white">
                  HOW TO PLAY: ROAD TO UCL
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-[10px] font-bold uppercase tracking-wider text-[#dc052d]">
                  GUIDE
                </span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-[#697789] dark:text-[#6A889C] font-semibold mt-0.5">
                Build your All-Time Champions League XI • Step-by-Step Instructions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white hover:bg-[#F6F8FA] dark:hover:bg-[#0B1E2B] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.num}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] flex items-start gap-3 transition-colors hover:border-[#dc052d]/30"
                >
                  <div className={`w-8 h-8 rounded-lg ${step.bg} ${step.accent} border flex items-center justify-center font-sports text-base font-black shrink-0 mt-0.5`}>
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${step.accent}`} />
                      <h4 className="font-heading font-black text-xs sm:text-sm uppercase tracking-tight text-[#172638] dark:text-white">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-[#697789] dark:text-[#8AA1B4] text-xs leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#DCE3EA] dark:border-[#162E3D] bg-[#F6F8FA]/60 dark:bg-[#06141D]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-[#697789] dark:text-[#6A889C]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-mono">ESC</kbd> or click outside to dismiss anytime.
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#dc052d] hover:bg-[#b50425] text-white font-sports text-xl font-black uppercase tracking-wider shadow-sm hover:shadow-[0_0_16px_rgba(220,5,45,0.4)] transition-all cursor-pointer"
          >
            GOT IT, LET'S PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
