import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UclDraftFeature } from '../games/ucl-draft/features/ucl-draft/UclDraftFeature';
import '../games/ucl-draft/ucl-draft.css';

export default function RoadToImmortalityPage({ onBackToGames }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ucl_draft_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('ucl_draft_theme', next);
      } catch {}
      return next;
    });
  };

  return (
    <div
      data-theme={theme}
      className={`relative w-full min-h-screen ucl-draft-scope transition-colors duration-200 ${
        theme === 'dark' ? 'dark bg-[#06121A] text-white' : 'bg-[#F6F8FA] text-[#172638]'
      }`}
    >
      {/* Top-Left Back to Games Button */}
      <button
        type="button"
        onClick={onBackToGames}
        className={`fixed top-3 left-3 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-display font-bold uppercase tracking-wider shadow-xl backdrop-blur-md transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d] select-none ${
          theme === 'dark'
            ? 'bg-[#070b12]/90 hover:bg-[#dc052d] text-gray-200 hover:text-white border border-white/20 hover:border-[#dc052d]'
            : 'bg-white/95 hover:bg-[#dc052d] text-slate-800 hover:text-white border border-slate-300 hover:border-[#dc052d] shadow-md'
        }`}
        title="Return to Games hub"
      >
        <ArrowLeft size={13} className="transition-transform duration-200" />
        <span>BACK TO GAMES</span>
      </button>

      {/* Native Road to Immortality (UCL Draft) */}
      <UclDraftFeature theme={theme} onToggleTheme={handleToggleTheme} />
    </div>
  );
}
