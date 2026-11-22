import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import TransitionCurtain from '../components/TransitionCurtain';
import { preloadRoute } from '../utils/routePreloader';

export const PageTransitionContext = createContext(null);

export function PageTransitionProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.startsWith('/road-to-immortality')) {
        const canonical = p.replace('/road-to-immortality', '/road-to-ucl');
        window.history.replaceState({}, '', canonical);
        return canonical;
      }
      return p;
    }
    return '/';
  });
  const [targetPath, setTargetPath] = useState(null);
  const [transitionState, setTransitionState] = useState('idle'); // 'idle' | 'covering' | 'covered' | 'revealing'

  const transitionStateRef = useRef('idle');
  const targetPathRef = useRef(null);
  const isPopStateRef = useRef(false);
  const holdTimerRef = useRef(null);

  targetPathRef.current = targetPath;

  // Cleanup hold timer on unmount
  useEffect(() => {
    return () => {
      clearTimeout(holdTimerRef.current);
    };
  }, []);

  // Listen to popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      let nextPath = window.location.pathname;
      if (nextPath.startsWith('/road-to-immortality')) {
        const canonical = nextPath.replace('/road-to-immortality', '/road-to-ucl');
        window.history.replaceState({}, '', canonical);
        nextPath = canonical;
      }
      if (nextPath !== currentPath) {
        if (transitionStateRef.current === 'idle') {
          preloadRoute(nextPath);
          isPopStateRef.current = true;
          transitionStateRef.current = 'covering';
          setTargetPath(nextPath);
          setTransitionState('covering');
        } else {
          // If already transitioning, synchronize current path
          setCurrentPath(nextPath);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPath]);

  // Navigate function with staggered curtain transition
  const navigate = useCallback((path, options = {}) => {
    if (typeof window === 'undefined') return;

    let normalizedPath = (path || '/').trim();
    if (normalizedPath.startsWith('/road-to-immortality')) {
      normalizedPath = normalizedPath.replace('/road-to-immortality', '/road-to-ucl');
    }

    // 1. Same route click check: avoid duplicate transition, scroll to top
    if (normalizedPath === currentPath) {
      if (options.scroll !== false) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // 2. Synchronous fast-click guard: ignore if transition is currently active
    if (transitionStateRef.current !== 'idle') {
      return;
    }

    // Preload target route chunk immediately while the transition curtain is covering
    preloadRoute(normalizedPath);

    isPopStateRef.current = !!options.isPopState;
    transitionStateRef.current = 'covering';
    setTargetPath(normalizedPath);
    setTransitionState('covering');
  }, [currentPath]);

  // When all 8 panels finish sweeping down and fully cover the screen
  const handleCovered = useCallback(() => {
    // Enter COVERED state: hold 100% solid red coverage
    transitionStateRef.current = 'covered';
    setTransitionState('covered');

    const next = targetPathRef.current;

    const commitAndReveal = () => {
      if (next) {
        if (!isPopStateRef.current) {
          window.history.pushState({}, '', next);
        }
        setCurrentPath(next);
        if (!next.includes('#')) {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }

      // Brief 35ms hold to ensure destination DOM commits and paints cleanly before reveal starts
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        transitionStateRef.current = 'revealing';
        setTransitionState('revealing');
      }, 35);
    };

    if (next) {
      // Ensure chunk is resolved before opening the curtain, with a safety timeout of 1500ms
      Promise.race([
        preloadRoute(next),
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]).then(commitAndReveal).catch(commitAndReveal);
    } else {
      commitAndReveal();
    }
  }, []);

  // When all 8 panels finish exiting downward off the screen
  const handleComplete = useCallback(() => {
    transitionStateRef.current = 'idle';
    setTransitionState('idle');
    setTargetPath(null);
    isPopStateRef.current = false;
  }, []);

  const isTransitioning = transitionState !== 'idle';

  const contextValue = {
    currentPath,
    navigate,
    transitionState,
    isTransitioning,
    isHome: currentPath === '/' || currentPath === '',
    isGamesPage: currentPath === '/games' || currentPath.startsWith('/games'),
    isMysteryGame: currentPath.startsWith('/mystery-player'),
    isCareerPuzzle: currentPath.startsWith('/guess-player'),
    isRoadToUcl: currentPath.startsWith('/road-to-ucl') || currentPath.startsWith('/road-to-immortality') || currentPath.startsWith('/ucl-draft'),
    isRoadToImmortality: currentPath.startsWith('/road-to-ucl') || currentPath.startsWith('/road-to-immortality') || currentPath.startsWith('/ucl-draft'),
    isWouldYouRather: currentPath.startsWith('/would-you-rather'),
    isTimeline: currentPath.startsWith('/timeline'),
    isArchive: currentPath.startsWith('/archive'),
    isFeedback: currentPath.startsWith('/feedback'),
    isMatchCentre: currentPath.startsWith('/match/') || currentPath === '/match',
    fixtureId: currentPath.startsWith('/match/') ? currentPath.replace('/match/', '').split('?')[0] : null
  };

  return (
    <PageTransitionContext.Provider value={contextValue}>
      {children}
      <TransitionCurtain
        transitionState={transitionState}
        onCovered={handleCovered}
        onComplete={handleComplete}
      />
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error('usePageTransition must be used within a PageTransitionProvider');
  }
  return context;
}
