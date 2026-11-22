/**
 * Route chunk preloader utility
 * Preloads dynamic route modules during the transition curtain's covering phase
 * so that when the curtain reaches the 'covered' state (700ms), the destination
 * component is already parsed and ready in memory with zero loading flash.
 */

export const routeLoaders = {
  home: () => import('../pages/GamesHub'),
  games: () => import('../pages/GamesPage'),
  mystery: () => import('../pages/MysteryPlayerPage'),
  careerPuzzle: () => import('../pages/CareerPuzzlePage'),
  roadToUcl: () => import('../pages/RoadToImmortalityPage'),
  wouldYouRather: () => import('../pages/WouldYouRatherPage'),
  timeline: () => import('../pages/TimelinePage'),
  archive: () => import('../pages/ArchivePage'),
  feedback: () => import('../pages/FeedbackPage'),
  matchCentre: () => import('../pages/MatchCentrePage')
};

export function preloadRoute(path) {
  if (typeof path !== 'string' || !path) return Promise.resolve();
  const p = path.trim().toLowerCase();

  if (p === '/' || p === '') {
    return routeLoaders.home();
  } else if (p === '/games' || p.startsWith('/games')) {
    return routeLoaders.games();
  } else if (p.startsWith('/mystery-player')) {
    return routeLoaders.mystery();
  } else if (p.startsWith('/guess-player')) {
    return routeLoaders.careerPuzzle();
  } else if (p.startsWith('/road-to-ucl') || p.startsWith('/road-to-immortality') || p.startsWith('/ucl-draft')) {
    return routeLoaders.roadToUcl();
  } else if (p.startsWith('/would-you-rather')) {
    return routeLoaders.wouldYouRather();
  } else if (p.startsWith('/timeline')) {
    return routeLoaders.timeline();
  } else if (p.startsWith('/archive')) {
    return routeLoaders.archive();
  } else if (p.startsWith('/feedback')) {
    return routeLoaders.feedback();
  } else if (p.startsWith('/match')) {
    return routeLoaders.matchCentre();
  }
  return Promise.resolve();
}
