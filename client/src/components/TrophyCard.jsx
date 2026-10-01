import React, { useState, useEffect } from 'react';
import TrophyIllustration from './TrophyIllustration';

// Memory cache for processed transparent trophy images
const processedTrophyCache = new Map();

function processTrophyTransparency(src) {
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
        // Fallback to raw source if canvas processing fails
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

export default function TrophyCard({ trophy }) {
  const [processedSrc, setProcessedSrc] = useState(null);
  const [hasError, setHasError] = useState(false);

  const rawImageSrc = trophy.image || `/images/trophies/${trophy.id}.jpg`;

  useEffect(() => {
    let isMounted = true;
    setHasError(false);

    if (rawImageSrc) {
      processTrophyTransparency(rawImageSrc).then((result) => {
        if (!isMounted) return;
        if (result) {
          setProcessedSrc(result);
          setHasError(false);
        } else {
          setHasError(true);
        }
      });
    } else {
      setHasError(true);
    }

    return () => {
      isMounted = false;
    };
  }, [rawImageSrc, trophy.id]);

  return (
    <div className="group relative w-[220px] sm:w-[240px] lg:w-[calc((100%-3*1.25rem)/4)] shrink-0 bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/40 rounded-xl overflow-hidden flex flex-col transition-all duration-200 ease-out select-none hover:-translate-y-0.5 shadow-md">
      {/* 1. Trophy Visual Area: 58% of height with subtle museum backlight */}
      <div className="relative h-48 sm:h-52 bg-[#0a0f18] border-b border-[#1c2535] flex items-center justify-center overflow-hidden p-4">
        {/* Very subtle dark radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,5,45,0.06)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Subtle museum pedestal baseline */}
        <div className="absolute bottom-2 inset-x-8 h-px bg-white/10" />

        {/* Hero Trophy Asset */}
        <div className="relative z-10 transition-transform duration-200 ease-out group-hover:scale-[1.025] flex items-center justify-center w-full h-full">
          {processedSrc && !hasError ? (
            <img
              src={processedSrc}
              alt={trophy.name}
              onError={() => setHasError(true)}
              className="max-h-36 sm:max-h-40 max-w-[88%] object-contain drop-shadow-md pointer-events-none"
              loading="lazy"
            />
          ) : (
            <TrophyIllustration type={trophy.type} className="w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md" />
          )}
        </div>
      </div>

      {/* 2. Information Area: Trophy Name & Large Count */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between text-center space-y-2 bg-[#121824]">
        {/* Trophy Name */}
        <h3 className="font-display font-bold text-xs sm:text-sm text-gray-200 tracking-wider uppercase group-hover:text-white transition-colors truncate">
          {trophy.shortName || trophy.name}
        </h3>

        {/* Large Prominent Count */}
        <div className="flex flex-col items-center justify-center">
          <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
            {trophy.count !== undefined && trophy.count !== null ? trophy.count : '—'}
          </span>
          <span className="text-[10px] font-display font-bold tracking-widest text-[#dc052d] uppercase mt-1">
            {trophy.unit || 'TITLES'}
          </span>
        </div>
      </div>
    </div>
  );
}
