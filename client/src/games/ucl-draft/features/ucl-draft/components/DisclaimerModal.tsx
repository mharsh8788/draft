import React from 'react';
import { X, ShieldAlert, Award, Database, FileText, BookOpen } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl p-6 shadow-xl text-[#172638] dark:text-[#E6F0F6]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white hover:bg-[#F6F8FA] dark:hover:bg-[#0B1E2B] btn-lift cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-[#EDF4FF] dark:bg-blue-950/60 border border-[#BFDBFE] dark:border-blue-900 text-[#3478F6] dark:text-[#00FFA3]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#172638] dark:text-white">
            Editorial Disclosures & Data Transparency
          </h2>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-[#172638] dark:text-[#E6F0F6] leading-relaxed">
          {/* 1. Modes */}
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] p-3.5 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D]">
            <h3 className="font-bold text-[#3478F6] dark:text-[#00FFA3] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              1. Classic vs. Almanac Modes
            </h3>
            <p className="text-[#697789] dark:text-[#6A889C] text-xs leading-normal">
              ROAD TO IMMORTALITY Game Modes:
              <br />
              • <strong>Classic Mode</strong> displays player ratings, criteria, and live squad averages for calculated squad-building.
              <br />
              • <strong>Almanac Mode</strong> conceals numerical ratings during drafting, challenging you to construct a winning XI purely from your own historical football knowledge and tournament memory.
            </p>
          </div>

          {/* 2. Editorial Ratings */}
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] p-3.5 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D]">
            <h3 className="font-bold text-[#3478F6] dark:text-[#00FFA3] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              2. Fan-Made Editorial Ratings
            </h3>
            <p className="text-[#697789] dark:text-[#6A889C] text-xs leading-normal">
              Ratings (88–98 OVR) are <strong>editorial balance estimates</strong> calibrated to reflect historical European Cup / UEFA Champions League knockout impact, longevity, and big-game clutch moments. They are not official UEFA ratings or commercial game metrics.
            </p>
          </div>

          {/* 3. Verified Statistics */}
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] p-3.5 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D]">
            <h3 className="font-bold text-[#3478F6] dark:text-[#00FFA3] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <Database className="w-3.5 h-3.5" />
              3. Verified Tournament Statistics
            </h3>
            <p className="text-[#697789] dark:text-[#6A889C] text-xs leading-normal">
              All listed trophies, appearances, goals, and clean sheets are verified tournament records spanning European Cup and Champions League history (1970s–2020s). The dataset includes 81 iconic players across clubs and nations, with Bayern legends represented among Europe's greatest icons.
            </p>
          </div>

          {/* 4. Non-Affiliation */}
          <div className="bg-[#F6F8FA] dark:bg-[#0B1E2B] p-3.5 rounded-xl border border-[#DCE3EA] dark:border-[#162E3D]">
            <h3 className="font-bold text-[#3478F6] dark:text-[#00FFA3] flex items-center gap-1.5 mb-1 text-xs uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              4. Licensing & Visual Integrity
            </h3>
            <p className="text-[#697789] dark:text-[#6A889C] text-xs leading-normal">
              This is an unofficial, non-commercial fan homage. It is not affiliated with, licensed by, or endorsed by UEFA or any participating football club. To preserve copyright integrity, player cards employ refined typographic design, club crest colors, and ISO nationality codes rather than unlicensed player photographs or AI-generated portraits.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#DCE3EA] dark:border-[#162E3D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold font-heading uppercase tracking-wider bg-[#10B981] dark:bg-[#00D26A] hover:bg-[#059669] dark:hover:bg-[#00b85c] text-white dark:text-slate-950 btn-lift-primary cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
