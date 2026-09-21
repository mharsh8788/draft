/**
 * Centralized Image Resolver & Rotation System for FC Bayern Players
 *
 * Automatically resolves player images from player ID using convention:
 * `/images/players/${player.id}.jpg`
 *
 * Also maintains deterministic round-robin rotation if multiple images exist.
 */

const appearanceCounts = new Map();

/**
 * Returns the primary or rotated image URL for a player.
 * Automatically derives `/images/players/${player.id}.jpg` from player.id.
 *
 * @param {Object|string} player - The player object or player ID string.
 * @param {boolean} increment - Whether to increment the appearance counter.
 * @returns {string|null} - The resolved image URL or null if mystery/invalid.
 */
export function getPlayerImage(player, increment = false) {
  if (!player) return null;
  if (typeof player === 'string') {
    return `/images/players/${player}.jpg`;
  }
  if (player.isMystery) return null;
  if (!player.id) return null;

  // Build images list:
  // If player.images is explicitly defined and non-empty, cycle through them.
  // Otherwise, default automatically to `/images/players/${player.id}.jpg`.
  let images = [];
  if (Array.isArray(player.images) && player.images.length > 0) {
    images = player.images;
  } else if (player.image) {
    images = [player.image];
  } else {
    images = [`/images/players/${player.id}.jpg`];
  }

  const currentCount = appearanceCounts.get(player.id) || 0;
  const index = currentCount % images.length;
  const selectedImage = images[index];

  if (increment) {
    appearanceCounts.set(player.id, currentCount + 1);
  }

  return selectedImage;
}

/**
 * Alias for getPlayerImage for backwards-compatibility.
 */
export function getRotatedImage(player, increment = false) {
  return getPlayerImage(player, increment);
}

/**
 * Attaches the resolved `image` property to a shallow clone of the player object.
 * Does NOT mutate the original static player object.
 * @param {Object} player - The player object.
 * @param {boolean} increment - Whether to record this as a new appearance.
 * @returns {Object} - Cloned player with resolved `image`.
 */
export function resolvePlayerWithRotatedImage(player, increment = false) {
  if (!player) return null;
  if (player.isMystery) {
    // Strictly do not attach any images or increment rotation for mystery player
    return player;
  }

  const image = getPlayerImage(player, increment);
  return {
    ...player,
    image,
    images: Array.isArray(player.images) && player.images.length > 0
      ? player.images
      : (image ? [image] : [`/images/players/${player.id}.jpg`])
  };
}

/**
 * Manually increment appearance count for a player ID.
 * @param {string} playerId
 * @returns {number} The new appearance count.
 */
export function recordPlayerAppearance(playerId) {
  if (!playerId) return 0;
  const current = appearanceCounts.get(playerId) || 0;
  const next = current + 1;
  appearanceCounts.set(playerId, next);
  return next;
}

/**
 * Get current appearance count for a player ID.
 * @param {string} playerId
 * @returns {number}
 */
export function getPlayerAppearanceCount(playerId) {
  return appearanceCounts.get(playerId) || 0;
}

/**
 * Reset all appearance counters (e.g. on full hard restart or unit testing).
 */
export function resetImageRotation() {
  appearanceCounts.clear();
}
