// In-memory cache for processed transparent trophy images (Data URLs or verified URLs)
const processedTrophyCache = new Map();

/**
 * Preprocess trophy image canvas transparency (neutralizes white background)
 * Downscales oversized source images to 480px max dimension for crisp high-res retina display
 * and rapid encoding/decoding.
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
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        if (!natW || !natH) {
          processedTrophyCache.set(src, src);
          return resolve(src);
        }

        // Downscale oversized images to max dimension of 480px for high-res retina display.
        // This reduces pixel count from 1.2M down to ~200k (6x faster and generates compact Data URLs)
        const maxDim = 480;
        let targetW = natW;
        let targetH = natH;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
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
      // Asset genuinely failed to load (404, bad path)
      resolve(null);
    };

    img.src = src;
  });
}

/**
 * Preload and decode a trophy image completely.
 * Resolves with the transparent Data URL (or raw src fallback), or null only if the image asset truly failed to load.
 */
export async function loadAndDecodeTrophy(src, timeoutMs = 12000) {
  if (!src) return null;

  if (processedTrophyCache.has(src)) {
    return processedTrophyCache.get(src);
  }

  let timedOut = false;
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      timedOut = true;
      resolve(null);
    }, timeoutMs);
  });

  const loadPromise = (async () => {
    try {
      const transparentUrl = await processTrophyTransparency(src);
      if (!transparentUrl) {
        // img.onerror fired - genuine failure
        return null;
      }

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
    } catch {
      // In case of unexpected runtime error, fall back to raw src
      return src;
    }
  })();

  const result = await Promise.race([loadPromise, timeoutPromise]);
  if (!result && timedOut) {
    // If safety timeout expired, fall back to cached result or raw src rather than failing
    return processedTrophyCache.get(src) || src;
  }
  return result;
}
