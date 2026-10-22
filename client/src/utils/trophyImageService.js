// In-memory cache for processed transparent trophy images (Data URLs)
const processedTrophyCache = new Map();

/**
 * Preprocess trophy image canvas transparency (neutralizes white background)
 */
export function processTrophyTransparency(src) {
  if (!src) return Promise.resolve(null);
  if (processedTrophyCache.has(src)) {
    return Promise.resolve(processedTrophyCache.get(src));
  }

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Threshold for neutralizing white / near-white background
        const threshold = 238;
        const feather = 18;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a === 0) continue;

          const minChannel = Math.min(r, g, b);

          if (minChannel >= threshold) {
            // White / near-white background pixel -> set fully transparent
            data[i + 3] = 0;
          } else if (minChannel > threshold - feather) {
            // Smooth anti-aliasing edge blend
            const factor = (threshold - minChannel) / feather;
            data[i + 3] = Math.round(a * Math.min(1, Math.max(0, factor)));
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const transparentUrl = canvas.toDataURL('image/png');
        processedTrophyCache.set(src, transparentUrl);
        resolve(transparentUrl);
      } catch {
        // Fallback to raw source if canvas processing fails (e.g. security restriction)
        processedTrophyCache.set(src, src);
        resolve(src);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = src;
  });
}

/**
 * Preload and decode a trophy image completely.
 * Resolves with the transparent Data URL, or null if loading failed.
 */
export async function loadAndDecodeTrophy(src, timeoutMs = 4000) {
  if (!src) return null;

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve(null), timeoutMs);
  });

  const loadPromise = (async () => {
    const transparentUrl = await processTrophyTransparency(src);
    if (!transparentUrl) return null;

    try {
      const img = new Image();
      img.src = transparentUrl;
      if (img.decode) {
        await img.decode();
      } else {
        await new Promise((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    } catch {
      // Decode error is non-fatal if url is valid
    }

    return transparentUrl;
  })();

  return Promise.race([loadPromise, timeoutPromise]);
}
