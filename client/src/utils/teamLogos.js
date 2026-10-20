/**
 * Resolves team crests to verified transparent assets to prevent opaque JPEG
 * background artifacts from third-party data providers like OpenLigaDB.
 */
export function resolveTeamLogo(teamOrName, fallbackUrl = null) {
  let name = '';
  let rawUrl = fallbackUrl;

  if (teamOrName && typeof teamOrName === 'object') {
    name = teamOrName.name || teamOrName.teamName || teamOrName.shortName || '';
    rawUrl = teamOrName.logo || teamOrName.teamIconUrl || fallbackUrl || null;
  } else if (typeof teamOrName === 'string') {
    name = teamOrName;
  }

  const normalized = String(name || '').toLowerCase().trim();

  // Bayern Munich
  if (normalized.includes('bayern')) {
    return '/fc-bayern-logo.png';
  }

  // Arsenal FC
  if (normalized.includes('arsenal')) {
    return '/arsenal-logo.svg';
  }

  return rawUrl || null;
}

export const ARSENAL_WIKIMEDIA_FALLBACK = 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg';
