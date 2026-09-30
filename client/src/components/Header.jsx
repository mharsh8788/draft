import React from 'react';
import BayernCrest from './BayernCrest';

export default function Header({ 
  currentPath, 
  onNavigate, 
  onOpenAbout 
}) {
  const isGamesActive = currentPath === '/';

  return (
    <header className="w-full bg-[#dc052d] sticky top-0 z-50 shadow-md select-none m-0 p-0 border-none rounded-none">
      {/* Centered Content Container matching the page width */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: [FC Bayern crest] FC Bayern München */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 sm:gap-4 cursor-pointer group select-none"
          title="FC Bayern München Games"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('/');
            }
          }}
        >
          {/* Crest: 44-52px on desktop (w-12 h-12 = 48px), ~40px on mobile */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <BayernCrest className="w-full h-full" />
          </div>

          {/* Wordmark: 30-36px desktop (text-[32px] sm:text-[34px]), bold, clean, leading-none */}
          <span className="text-white font-bold text-xl sm:text-[32px] lg:text-[34px] tracking-tight leading-none whitespace-nowrap">
            FC Bayern München
          </span>
        </div>

        {/* Right: Games / Timeline / Archive / About Navigation */}
        <nav aria-label="Global Navigation" className="flex items-center gap-3.5 sm:gap-6">
          <button
            onClick={() => onNavigate('/')}
            className={`text-sm sm:text-[15px] transition-colors cursor-pointer ${
              currentPath === '/' 
                ? 'text-white font-bold border-b-2 border-white pb-0.5' 
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            Games
          </button>

          <button
            onClick={() => onNavigate('/timeline')}
            className={`text-sm sm:text-[15px] transition-colors cursor-pointer ${
              currentPath === '/timeline' 
                ? 'text-white font-bold border-b-2 border-white pb-0.5' 
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            Timeline
          </button>

          <button
            onClick={() => onNavigate('/archive')}
            className={`text-sm sm:text-[15px] transition-colors cursor-pointer ${
              currentPath === '/archive' 
                ? 'text-white font-bold border-b-2 border-white pb-0.5' 
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            Archive
          </button>

          <button
            onClick={() => onNavigate('/feedback')}
            className={`text-sm sm:text-[15px] transition-colors cursor-pointer ${
              currentPath === '/feedback' 
                ? 'text-white font-bold border-b-2 border-white pb-0.5' 
                : 'text-white/85 hover:text-white font-medium'
            }`}
          >
            Feedback
          </button>
          
          <button
            onClick={onOpenAbout}
            className="text-sm sm:text-[15px] text-white/85 hover:text-white font-medium transition-colors cursor-pointer"
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
}
