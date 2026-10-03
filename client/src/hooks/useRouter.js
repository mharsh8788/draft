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
        window.history.pushState({}, '', path);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    },
    transitionState: 'idle',
    isTransitioning: false,
    isHome: currentPath === '/' || currentPath === '',
    isMysteryGame: currentPath === '/mystery-player',
    isCareerPuzzle: currentPath === '/guess-player',
    isTimeline: currentPath === '/timeline',
    isArchive: currentPath === '/archive',
    isFeedback: currentPath === '/feedback',
    isMatchCentre: currentPath.startsWith('/match/') || currentPath === '/match',
    fixtureId: currentPath.startsWith('/match/') ? currentPath.replace('/match/', '').split('?')[0] : null
  };
}
