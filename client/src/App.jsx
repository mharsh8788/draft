import React, { useState, Suspense, lazy } from 'react';
import Header from './components/Header';
import { useRouter } from './hooks/useRouter';

// Route-level code splitting: each page loads on-demand
const GamesHub = lazy(() => import('./pages/GamesHub'));
const GamesPage = lazy(() => import('./pages/GamesPage'));
const MysteryPlayerPage = lazy(() => import('./pages/MysteryPlayerPage'));
const CareerPuzzlePage = lazy(() => import('./pages/CareerPuzzlePage'));
const RoadToImmortalityPage = lazy(() => import('./pages/RoadToImmortalityPage'));
const WouldYouRatherPage = lazy(() => import('./pages/WouldYouRatherPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const ArchivePage = lazy(() => import('./pages/ArchivePage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const MatchCentrePage = lazy(() => import('./pages/MatchCentrePage'));
const AboutModal = lazy(() => import('./components/AboutModal'));

/**
 * Themed route loading fallback
 * Displayed only if a route chunk takes longer than the transition curtain animation (700ms)
 * to prevent broken layout or white flashes on slow networks.
 */
function RouteLoadingFallback() {
  return (
    <div 
      className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#070b12]"
      role="status"
      aria-label="Loading section"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#dc052d]/25 border-t-[#dc052d] animate-spin" />
        <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400">
          Loading
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { 
    currentPath, 
    navigate,
    isHome, 
    isGamesPage,
    isMysteryGame, 
    isCareerPuzzle,
    isRoadToUcl,
    isRoadToImmortality,
    isWouldYouRather,
    isTimeline, 
    isArchive, 
    isFeedback,
    isMatchCentre,
    fixtureId
  } = useRouter();

  const isEmbeddedGame = isRoadToUcl || isRoadToImmortality || isWouldYouRather;

  const handleSelectGame = (route) => {
    if (typeof route === 'string' && route.startsWith('http')) {
      window.open(route, '_blank', 'noopener,noreferrer');
      return;
    }
    if (route === '/mystery-player') {
      navigate('/mystery-player');
    } else if (route === '/guess-player') {
      navigate('/guess-player');
    } else if (route === '/road-to-ucl' || route === '/road-to-immortality' || route === '/ucl-draft') {
      navigate('/road-to-ucl');
    } else if (route === '/would-you-rather') {
      navigate('/would-you-rather');
    } else if (route === '/games') {
      navigate('/games');
    } else if (route && route.startsWith('/timeline')) {
      navigate(route);
    } else if (route === '/archive') {
      navigate('/archive');
    }
  };

  const handleBackToGames = () => {
    navigate('/games');
  };

  return (
    <div className="min-h-screen w-full m-0 p-0 bg-[#0b0f17] text-white flex flex-col font-display selection:bg-[#dc052d] selection:text-white">
      {/* 1. Global Club Header (Full-Width Bayern Red Navigation Bar - Hidden in full-screen embedded games) */}
      {!isEmbeddedGame && (
        <Header
          currentPath={currentPath}
          onNavigate={navigate}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col w-full">
        <Suspense fallback={<RouteLoadingFallback />}>
          {/* ROUTE 1: Home Games Hub */}
          {isHome && (
            <GamesHub onSelectGame={handleSelectGame} onNavigate={navigate} />
          )}

          {/* ROUTE 1B: Dedicated Games Landing Page */}
          {isGamesPage && (
            <GamesPage onNavigate={navigate} onSelectGame={handleSelectGame} />
          )}

          {/* ROUTE 2: Mystery Player Game */}
          {isMysteryGame && (
            <MysteryPlayerPage onBackToGames={handleBackToGames} onNavigate={navigate} />
          )}

          {/* ROUTE 3: Career Puzzle (Who Am I?) */}
          {isCareerPuzzle && (
            <CareerPuzzlePage onBackToGames={handleBackToGames} onNavigate={navigate} />
          )}

          {/* ROUTE 3B: Road to UCL (All-Time UCL Draft) */}
          {(isRoadToUcl || isRoadToImmortality) && (
            <RoadToImmortalityPage onBackToGames={handleBackToGames} onNavigate={navigate} />
          )}

          {/* ROUTE 3C: Would You Rather (Bayern Legends Edition) */}
          {isWouldYouRather && (
            <WouldYouRatherPage onBackToGames={handleBackToGames} onNavigate={navigate} />
          )}

          {/* ROUTE 4: Standalone Historical Timeline */}
          {isTimeline && (
            <TimelinePage onNavigate={navigate} />
          )}

          {/* ROUTE 5: Dedicated Archive Page */}
          {isArchive && (
            <ArchivePage onNavigate={navigate} />
          )}

          {/* ROUTE 6: Community Feedback Page */}
          {isFeedback && (
            <FeedbackPage onNavigate={navigate} />
          )}

          {/* ROUTE 7: Dedicated Match Centre Page */}
          {isMatchCentre && (
            <MatchCentrePage fixtureId={fixtureId} onBack={() => navigate('/')} onNavigate={navigate} />
          )}
        </Suspense>
      </main>

      {/* About Modal */}
      {isAboutOpen && (
        <Suspense fallback={null}>
          <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
        </Suspense>
      )}

      {/* Editorial Footer (Hidden in full-screen embedded games) */}
      {!isEmbeddedGame && (
        <footer className="relative z-20 w-full py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-[#dc052d] text-xs font-display select-none">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4 text-center sm:text-left">
            <p className="font-display font-bold text-xs sm:text-sm text-white tracking-wider uppercase whitespace-nowrap">
              FC BAYERN GAMES
            </p>
            <p className="text-[11px] sm:text-xs text-white/85 font-medium tracking-normal">
              Fan-made project · Not affiliated with FC Bayern München.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
