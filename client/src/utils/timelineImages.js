/**
 * Timeline Image Management & Resolution System
 *
 * Dedicated directory:
 *   client/public/images/timeline/
 *
 * Numbering convention:
 *   `<event-number>.jpg`     = Primary/default image for the timeline event (1-based index)
 *   `<event-number>-2.jpg`   = Additional image 2 for the VIEW MOMENT viewer
 *   `<event-number>-3.jpg`   = Additional image 3 for the VIEW MOMENT viewer
 *   ...
 *
 * Examples:
 *   Event 1 (1900 Foundation):
 *     /images/timeline/1.jpg
 *     /images/timeline/1-2.jpg
 *
 *   Event 2 (1932 Championship):
 *     /images/timeline/2.jpg
 *     /images/timeline/2-2.jpg
 */

import { TIMELINE_EVENTS } from '../data/timelineEvents';

// In-memory cache for probed image URLs to prevent redundant network requests
const imageExistenceCache = new Map();

/**
 * Returns the 1-based index/number of a timeline event.
 * @param {Object|string|number} event - The event object or event ID or number.
 * @returns {number|null} 1-based event number (e.g. 1 to 19).
 */
export function getTimelineEventNumber(event) {
  if (!event) return null;
  if (typeof event === 'number') return event;
  if (event.eventNumber) return event.eventNumber;
  const id = typeof event === 'string' ? event : event.id;
  const index = TIMELINE_EVENTS.findIndex((e) => e.id === id);
  return index !== -1 ? index + 1 : null;
}

/**
 * Returns the primary image path for an event number.
 * @param {number} eventNumber
 * @returns {string}
 */
export function getTimelinePrimaryImageUrl(eventNumber) {
  if (!eventNumber) return null;
  return `/images/timeline/${eventNumber}.jpg`;
}

/**
 * Returns candidate additional numbered image path.
 * @param {number} eventNumber
 * @param {number} subIndex (e.g. 2, 3, 4...)
 * @returns {string}
 */
export function getTimelineAdditionalImageUrl(eventNumber, subIndex) {
  if (!eventNumber || !subIndex) return null;
  return `/images/timeline/${eventNumber}-${subIndex}.jpg`;
}

/**
 * Checks whether an image exists at the specified URL using client-side probing.
 * Results are cached in memory.
 * @param {string} url
 * @returns {Promise<boolean>}
 */
export function checkImageExists(url) {
  if (!url) return Promise.resolve(false);
  if (imageExistenceCache.has(url)) {
    return Promise.resolve(imageExistenceCache.get(url));
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      imageExistenceCache.set(url, true);
      resolve(true);
    };
    img.onerror = () => {
      imageExistenceCache.set(url, false);
      resolve(false);
    };
    img.src = url;
  });
}

const eventImagesCache = new Map();

/**
 * Asynchronously discovers and resolves all available images for a timeline event:
 * 1. Checks `/images/timeline/${eventNumber}.jpg`
 * 2. Checks `/images/timeline/${eventNumber}-2.jpg`, `-3.jpg`, etc.
 * 3. Falls back to `event.image` if primary does not exist yet.
 *
 * @param {Object} event
 * @returns {Promise<string[]>} Array of valid image URLs
 */
export async function resolveTimelineEventImages(event) {
  if (!event) return [];
  const eventNum = getTimelineEventNumber(event);
  if (!eventNum) {
    return event.image ? [event.image] : [];
  }

  const cacheKey = event.id || String(eventNum);
  if (eventImagesCache.has(cacheKey)) {
    return eventImagesCache.get(cacheKey);
  }

  const primaryUrl = getTimelinePrimaryImageUrl(eventNum);
  const images = [];

  // 1. Verify Primary Image
  const primaryExists = await checkImageExists(primaryUrl);
  if (primaryExists) {
    images.push(primaryUrl);
  } else if (event.image) {
    // Graceful fallback to verified existing asset if numbered image not yet uploaded
    images.push(event.image);
  }

  // 2. Discover additional images: ${eventNum}-2.jpg, ${eventNum}-3.jpg, ...
  for (let sub = 2; sub <= 10; sub++) {
    const candidateUrl = getTimelineAdditionalImageUrl(eventNum, sub);
    const exists = await checkImageExists(candidateUrl);
    if (exists) {
      images.push(candidateUrl);
    } else {
      // Sequential break when next numbered image does not exist
      break;
    }
  }

  eventImagesCache.set(cacheKey, images);
  return images;
}

