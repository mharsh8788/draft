/**
 * Seeded Pseudo-Random Number Generator for UCL Draft Campaign
 * Uses Mulberry32 algorithm for fast, high-quality 32-bit deterministic randomness.
 */

export interface SeededRNG {
  readonly seed: string;
  next(): number; // Float in [0, 1)
  nextInt(min: number, max: number): number; // Integer in [min, max] (inclusive)
  nextFloat(min: number, max: number): number; // Float in [min, max)
  shuffle<T>(array: readonly T[]): T[]; // Deterministic Fisher-Yates shuffle (non-mutating)
  pick<T>(array: readonly T[]): T; // Pick a random element
  weightedPick<T>(items: Array<{ item: T; weight: number }>): T; // Weighted selection
}

/**
 * Hash any string seed (e.g. "#WC6XC4" or "#UCL-7A0X") to a 32-bit unsigned integer.
 */
export function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Creates an instance of SeededRNG initialized with the given seed string.
 * Two RNG instances created with identical seeds will yield identical sequences.
 */
export function createSeededRNG(seed: string | number): SeededRNG {
  const seedString = typeof seed === 'string' ? seed : `#SEED-${seed}`;
  let state = typeof seed === 'number' ? seed >>> 0 : hashSeed(seed);

  // Mulberry32 core generator
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const nextInt = (min: number, max: number): number => {
    if (min >= max) return min;
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const nextFloat = (min: number, max: number): number => {
    if (min >= max) return min;
    return next() * (max - min) + min;
  };

  const shuffle = <T>(array: readonly T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const pick = <T>(array: readonly T[]): T => {
    if (array.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    const idx = Math.floor(next() * array.length);
    return array[idx];
  };

  const weightedPick = <T>(items: Array<{ item: T; weight: number }>): T => {
    if (items.length === 0) {
      throw new Error('Cannot pick from empty weighted items');
    }
    const totalWeight = items.reduce((sum, it) => sum + Math.max(0, it.weight), 0);
    if (totalWeight <= 0) {
      return items[0].item;
    }
    let threshold = next() * totalWeight;
    for (const it of items) {
      const w = Math.max(0, it.weight);
      if (threshold <= w) {
        return it.item;
      }
      threshold -= w;
    }
    return items[items.length - 1].item;
  };

  return {
    seed: seedString,
    next,
    nextInt,
    nextFloat,
    shuffle,
    pick,
    weightedPick,
  };
}

/**
 * Generates a memorable alphanumeric campaign seed matching the reference format (e.g. #WC6XC4).
 */
export function generateCampaignSeed(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes ambiguous chars like 0, 1, I, O
  let result = '#';
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }
  return result;
}
