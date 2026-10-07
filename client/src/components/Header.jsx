import React, { useRef, useEffect } from 'react';
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

  const activeItemRef = useRef(null);
  const navRef = useRef(null);

  // Automatically scroll the active navigation item into view on page load/navigation
  useEffect(() => {
    if (activeItemRef.current && navRef.current) {
      const nav = navRef.current;
      const activeEl = activeItemRef.current;
      const navRect = nav.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();

      // If active item is partially or fully out of view within the nav scroll container
      if (elRect.left < navRect.left || elRect.right > navRect.right) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentPath]);

  return (
    <header className="w-full bg-[#dc052d] sticky top-0 z-50 shadow-md select-none m-0 p-0 border-none rounded-none">
      {/* Centered Content Container matching the page width */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Left: [FC Bayern crest] FC Bayern München */}
        <div 
          onClick={() => onNavigate('/')}
          className="shrink-0 flex items-center gap-2.5 sm:gap-4 cursor-pointer group select-none transition-transform duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-md"
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

        {/* Right: Games / Timeline / Archive / Feedback / About Navigation (Horizontal swipeable on mobile) */}
        <nav 
          ref={navRef}
          aria-label="Global Navigation" 
          className="min-w-0 flex-1 flex items-center justify-start md:justify-end gap-1 sm:gap-2 font-display overflow-x-auto overflow-y-hidden whitespace-nowrap flex-nowrap scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x ml-2 sm:ml-0 pr-6 sm:pr-0 py-1"
        >
          {navLinks.map((item) => (
            <button
              key={item.label}
              ref={item.isActive ? activeItemRef : null}
              onClick={() => onNavigate(item.path)}
              className={`relative shrink-0 whitespace-nowrap text-sm sm:text-[15px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 ${
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
            className="shrink-0 whitespace-nowrap text-sm sm:text-[15px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-white/85 hover:text-white font-medium hover:bg-black/10 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
          >
            About
          </button>

          {/* Right-side scroll cushion spacer so 'About' is never clipped on mobile */}
          <span className="w-5 shrink-0 sm:hidden select-none pointer-events-none" aria-hidden="true" />
        </nav>
      </div>
    </header>
  );
}
