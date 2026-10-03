import React from 'react';
import BayernCrest from './BayernCrest';

export default function Header({ 
  currentPath, 
  onNavigate, 
  onOpenAbout 
}) {
  const isGamesActive = currentPath === '/' || currentPath === '/mystery-player' || currentPath === '/guess-player';
  const isTimelineActive = currentPath === '/timeline';
  const isArchiveActive = currentPath === '/archive';
  const isFeedbackActive = currentPath === '/feedback';

  const navLinks = [
    { label: 'Games', path: '/', isActive: isGamesActive },
    { label: 'Timeline', path: '/timeline', isActive: isTimelineActive },
    { label: 'Archive', path: '/archive', isActive: isArchiveActive },
    { label: 'Feedback', path: '/feedback', isActive: isFeedbackActive },
  ];

  return (
    <header className="w-full bg-[#dc052d] sticky top-0 z-50 shadow-md select-none m-0 p-0 border-none rounded-none">
      {/* Centered Content Container matching the page width */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: [FC Bayern crest] FC Bayern München */}
        <div 
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 sm:gap-4 cursor-pointer group select-none transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-md"
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-95">
            <BayernCrest className="w-full h-full" />
          </div>

          {/* Wordmark: 30-36px desktop (text-[32px] sm:text-[34px]), bold, clean, leading-none */}
          <span className="text-white font-display font-bold text-xl sm:text-[32px] lg:text-[34px] tracking-tight leading-none whitespace-nowrap">
            FC Bayern München
          </span>
        </div>

        {/* Right: Games / Timeline / Archive / Feedback / About Navigation */}
        <nav aria-label="Global Navigation" className="flex items-center gap-1 sm:gap-2 font-display">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.path)}
              className={`relative text-sm sm:text-[15px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 ${
                item.isActive 
                  ? 'text-white font-bold bg-black/20 shadow-xs' 
                  : 'text-white/85 hover:text-white font-medium hover:bg-black/10'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={onOpenAbout}
            className="text-sm sm:text-[15px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-white/85 hover:text-white font-medium hover:bg-black/10 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
          >
            About
          </button>
        </nav>
      </div>
    </header>
  );
}
