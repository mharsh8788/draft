import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import ImageSkeleton from './ImageSkeleton';
import OdometerNumber from './OdometerNumber';
import { processTrophyTransparency, loadAndDecodeTrophy } from '../utils/trophyImageService';

export default function TrophyCard({
  trophy,
  index = 0,
  isTriggered = false,
  cardRef,
  allImagesReady = null, // Boolean when coordinated by HonoursSection, or null when standalone
  processedSrc: externalProcessedSrc = undefined,
  hasError: externalHasError = undefined,
}) {
  const [internalSrc, setInternalSrc] = useState(null);
  const [internalReady, setInternalReady] = useState(false);
  const [internalError, setInternalError] = useState(false);

  const rawImageSrc = trophy.image || `/images/trophies/${trophy.id}.jpg`;

  // Fallback standalone loading if not coordinated by HonoursSection
  useEffect(() => {
    if (allImagesReady !== null) return;

    let isMounted = true;
    setInternalReady(false);
    setInternalError(false);

    if (rawImageSrc) {
      loadAndDecodeTrophy(rawImageSrc).then((result) => {
        if (!isMounted) return;
        if (result) {
          setInternalSrc(result);
          setInternalReady(true);
          setInternalError(false);
        } else {
          setInternalError(true);
        }
      });
    } else {
      setInternalError(true);
    }

    return () => {
      isMounted = false;
    };
  }, [rawImageSrc, allImagesReady]);

  // Determine whether we are using coordinated or standalone state
  const isCoordinated = allImagesReady !== null;
  const isImageReady = isCoordinated ? allImagesReady : internalReady;
  const processedSrc = isCoordinated ? externalProcessedSrc : internalSrc;
  const hasError = isCoordinated ? externalHasError : internalError;

  return (
    <div ref={cardRef} className="group relative w-[220px] sm:w-[240px] lg:w-[calc((100%-3*1.25rem)/4)] shrink-0 bg-[#121824] border border-[#1c2535] hover:border-[#dc052d]/40 rounded-xl overflow-hidden flex flex-col transition-all duration-200 ease-out select-none hover:-translate-y-0.5 shadow-md">
      {/* 1. Trophy Visual Area: 58% of height with subtle museum backlight */}
      <div className="relative h-48 sm:h-52 bg-[#0a0f18] border-b border-[#1c2535] flex items-center justify-center overflow-hidden p-4">
        {/* Very subtle dark radial spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,5,45,0.06)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Subtle museum pedestal baseline */}
        <div className="absolute bottom-2 inset-x-8 h-px bg-white/10" />

        {/* Hero Trophy Asset */}
        <div className="relative z-10 transition-transform duration-200 ease-out group-hover:scale-[1.025] flex items-center justify-center w-full h-full">
          {(!isImageReady || !processedSrc) && !hasError && (
            <ImageSkeleton 
              className="w-28 sm:w-32 h-36 sm:h-40 rounded-lg" 
              aria-label={`Loading ${trophy.name}`}
            />
          )}

          {isImageReady && processedSrc && !hasError && (
            <img
              src={processedSrc}
              alt={trophy.name}
              className="max-h-36 sm:max-h-40 max-w-[88%] object-contain drop-shadow-md pointer-events-none transition-opacity duration-300 opacity-100"
            />
          )}

          {hasError && (
            <div className="flex flex-col items-center justify-center text-center p-2 text-white/20 select-none">
              <Shield size={32} className="stroke-[1.5]" />
              <span className="text-[10px] font-display uppercase tracking-wider text-gray-500 mt-1">
                {trophy.shortName || 'Trophy'}
              </span>
            </div>
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
            <OdometerNumber
              value={trophy.count}
              isTriggered={isTriggered}
              delay={0}
              index={0}
            />
          </span>
          <span className="text-[10px] font-display font-bold tracking-widest text-[#dc052d] uppercase mt-1">
            {trophy.unit || 'TITLES'}
          </span>
        </div>
      </div>
    </div>
  );
}
