import { useContext } from 'react';
import { PageTransitionContext } from '../context/PageTransitionContext';

export function useRouter() {
  const context = useContext(PageTransitionContext);
  if (context) {
    return context;
  }

  // Fallback if accessed outside PageTransitionProvider
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  return {
    currentPath,
    navigate: (path) => {
      if (typeof window !== 'undefined') {
        let normalized = path;
        if (normalized && normalized.startsWith('/road-to-immortality')) {
          normalized = normalized.replace('/road-to-immortality', '/road-to-ucl');
        }
        window.history.pushState({}, '', normalized);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    transitionState: 'idle',
    isTransitioning: false,
    isHome: currentPath === '/' || currentPath === '',
    isGamesPage: currentPath === '/games' || currentPath.startsWith('/games'),
    isMysteryGame: currentPath === '/mystery-player',
    isCareerPuzzle: currentPath === '/guess-player',
    isRoadToUcl: currentPath.startsWith('/road-to-ucl') || currentPath.startsWith('/road-to-immortality') || currentPath.startsWith('/ucl-draft'),
    isRoadToImmortality: currentPath.startsWith('/road-to-ucl') || currentPath.startsWith('/road-to-immortality') || currentPath.startsWith('/ucl-draft'),
    isWouldYouRather: currentPath.startsWith('/would-you-rather'),
    isTimeline: currentPath.startsWith('/timeline'),
    isArchive: currentPath === '/archive',
    isFeedback: currentPath === '/feedback',
    isMatchCentre: currentPath.startsWith('/match/') || currentPath === '/match',
    fixtureId: currentPath.startsWith('/match/') ? currentPath.replace('/match/', '').split('?')[0] : null
  };
}
