import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { UclDraftFeature } from '../games/ucl-draft/features/ucl-draft/UclDraftFeature';
import '../games/ucl-draft/ucl-draft.css';

export default function RoadToImmortalityPage({ onBackToGames }) {
  return (
    <div className="relative w-full min-h-screen bg-[#06121A] ucl-draft-scope">
      {/* Top-Left Back to Games Button */}
      <button
        type="button"
        onClick={onBackToGames}
        className="fixed top-3 left-3 z-50 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#070b12]/90 hover:bg-[#dc052d] text-gray-200 hover:text-white border border-white/20 hover:border-[#dc052d] text-xs font-display font-bold uppercase tracking-wider shadow-xl backdrop-blur-md transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d] select-none"
        title="Return to Games hub"
      >
        <ArrowLeft size={13} className="transition-transform duration-200" />
        <span>BACK TO GAMES</span>
      </button>

      {/* Native Road to Immortality (UCL Draft) */}
      <UclDraftFeature />
    </div>
  );
}
