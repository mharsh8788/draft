import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import TransitionCurtain from '../components/TransitionCurtain';

export const PageTransitionContext = createContext(null);

export function PageTransitionProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(() => 
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
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
      const nextPath = window.location.pathname;
      if (nextPath !== currentPath) {
        if (transitionStateRef.current === 'idle') {
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

    const normalizedPath = (path || '/').trim();

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
    if (next) {
      if (!isPopStateRef.current) {
        window.history.pushState({}, '', next);
      }
      setCurrentPath(next);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Hold covered state for 100ms so destination DOM paints completely underneath
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      transitionStateRef.current = 'revealing';
      setTransitionState('revealing');
    }, 100);
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
    isMysteryGame: currentPath === '/mystery-player',
    isCareerPuzzle: currentPath === '/guess-player',
    isTimeline: currentPath === '/timeline',
    isArchive: currentPath === '/archive',
    isFeedback: currentPath === '/feedback',
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
