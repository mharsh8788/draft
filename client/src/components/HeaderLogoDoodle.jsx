import React, { useState, useEffect, useRef, useCallback } from 'react';
import BayernCrest from './BayernCrest';

/**
 * HeaderLogoDoodle
 * Google Doodle-style celebratory moment for the FC Bayern website header.
 * 
 * Features & Specifications:
 * 1. Trophy Appearance:
 *    - Bright, rich gold spherical football with embossed pentagon/hexagon panel seams.
 *    - Dark bronze base with subtle golden edge highlights and beveled facet depth (NOT muddy brown).
 *    - Soft, restrained golden aura behind the trophy that provides elegant contrast on Bayern red (#dc052d).
 * 2. One-Time Page Load Animation:
 *    - Whenever the website is opened or freshly loaded/refreshed, automatically plays once.
 *    - Starts with FC Bayern crest, smoothly transitions into the 3D Ballon d'Or, remains visible briefly,
 *      then smoothly transitions back to the original Bayern crest.
 *    - Plays only once per page load (does not loop continuously).
 * 3. Hover Interaction (1-Second Threshold):
 *    - After initial animation, hovering over the crest for 1 second triggers the trophy animation.
 *    - Remains visible for ~3 seconds before smoothly returning to the crest.
 *    - If pointer leaves before the 1-second dwell threshold, the hover timer is cancelled immediately.
 *    - Initial and hover animations do not interfere with each other.
 * 4. Touch Device Support:
 *    - On touch devices, tapping the crest directly triggers the celebratory animation.
 * 5. Layout & Accessibility:
 *    - Fixed logo container dimensions (w-10 h-10 on mobile, w-12 h-12 on desktop) - zero layout shifts.
 *    - Full respect for prefers-reduced-motion (renders static crest with no animations).
 */

export default function HeaderLogoDoodle({ className = "w-full h-full" }) {
  // Check prefers-reduced-motion eagerly so state is correct on render 0
  const [hasReducedMotion, setHasReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Phases: 'idle' | 'transform_in' | 'active' | 'transform_out' | 'restored'
  const [phase, setPhase] = useState('idle');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // References for timers and lifecycle state
  const isMountedRef = useRef(true);
  const animTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const isInitialPlayedRef = useRef(false);

  // Derive active animation status
  const isAnimating = phase === 'transform_in' || phase === 'active' || phase === 'transform_out';
  const isAnimatingRef = useRef(false);
  isAnimatingRef.current = isAnimating;

  // Listen to prefers-reduced-motion dynamically
  useEffect(() => {
    isMountedRef.current = true;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleMotionChange = (e) => {
      setHasReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMotionChange);
    } else {
      mediaQuery.addListener(handleMotionChange);
    }

    return () => {
      isMountedRef.current = false;
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMotionChange);
      } else {
        mediaQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  // Core 3-second celebratory sequence: Crest -> Ballon d'Or -> Crest
  const playTrophySequence = useCallback(() => {
    if (hasReducedMotion) return;
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    isAnimatingRef.current = true;

    // Phase 1: Smooth 3D transition into Ballon d'Or (450ms)
    setPhase('transform_in');
    phaseRef.current = 'transform_in';

    // Phase 2: Active trophy rotation and light sweep (~2100ms)
    animTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setPhase('active');
      phaseRef.current = 'active';

      // Phase 3: Smooth 3D transition back to Bayern crest (500ms)
      animTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        setPhase('transform_out');
        phaseRef.current = 'transform_out';

        // Phase 4: Restored to original crest
        animTimerRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setPhase('restored');
          phaseRef.current = 'restored';
          isAnimatingRef.current = false;
        }, 500);
      }, 2100);
    }, 450);
  }, [hasReducedMotion]);

  // One-time automatic intro animation on every fresh page load / reload (Strict Mode safe)
  useEffect(() => {
    if (hasReducedMotion) {
      setPhase('restored');
      phaseRef.current = 'restored';
      return;
    }

    if (!isInitialPlayedRef.current) {
      // Allow initial crest to register for 800ms before smooth transition begins
      const introTimer = setTimeout(() => {
        isInitialPlayedRef.current = true;
        if (isMountedRef.current) {
          playTrophySequence();
        }
      }, 800);

      return () => clearTimeout(introTimer);
    }
  }, [hasReducedMotion, playTrophySequence]);

  // Pointer hover handlers with strict 1-second dwell threshold and leave cancellation
  const handlePointerEnter = useCallback(() => {
    if (hasReducedMotion || isAnimatingRef.current || phaseRef.current !== 'restored') {
      return;
    }

    // Clear any existing hover timer before arming a new dwell
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Require holding hover for full 1000ms (1 second) before triggering
    hoverTimerRef.current = setTimeout(() => {
      hoverTimerRef.current = null;
      if (isMountedRef.current && !isAnimatingRef.current && phaseRef.current === 'restored') {
        playTrophySequence();
      }
    }, 1000);
  }, [hasReducedMotion, playTrophySequence]);

  const handlePointerLeave = useCallback(() => {
    // If pointer leaves before 1 second, cancel hover-triggered animation immediately
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  // Tap-to-trigger on mobile/touch devices
  const handleTap = useCallback((e) => {
    // Prevent event from bubbling to parent link/navigation container
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      // On touch devices, prevent gesture/ghost click side effects
      if (e.cancelable && e.type === 'touchend') {
        e.preventDefault();
      }
    }

    if (hasReducedMotion || isAnimatingRef.current) {
      return;
    }

    // Trigger on tap when restored or idle
    if (phaseRef.current === 'restored' || phaseRef.current === 'idle') {
      // Clear any pending hover timer
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      playTrophySequence();
    }
  }, [hasReducedMotion, playTrophySequence]);

  // If reduced motion is requested, render standard crest statically
  if (hasReducedMotion) {
    return <BayernCrest className={className} />;
  }

  const phaseClassMap = {
    idle: 'doodle-idle',
    transform_in: 'doodle-transform-in',
    active: 'doodle-active',
    transform_out: 'doodle-transform-out',
    restored: 'doodle-restored',
  };

  const currentPhaseClass = phaseClassMap[phase] || 'doodle-restored';

  return (
    <div 
      className={`relative select-none flex items-center justify-center [perspective:800px] ${currentPhaseClass} ${className}`}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleTap}
      onTouchStart={(e) => {
        // Prevent parent links or gesture containers from reacting to touch on the crest
        e.stopPropagation();
      }}
      onTouchEnd={handleTap}
      title={isAnimating ? "Harry Kane 2026 Ballon d’Or Winner" : "FC Bayern München (Hover 1s to celebrate Ballon d’Or)"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' && phaseRef.current === 'restored' && !isAnimatingRef.current) {
          e.preventDefault();
          playTrophySequence();
        }
      }}
    >
      <style>{`
        /* Scoped Doodle Transition Rules */
        .doodle-crest-layer,
        .doodle-trophy-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.34, 1.25, 0.64, 1), opacity 0.38s ease;
        }

        /* Phase: Idle & Restored (Original FC Bayern Crest default) */
        .doodle-idle .doodle-crest-layer,
        .doodle-restored .doodle-crest-layer {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
          pointer-events: auto;
          z-index: 2;
        }
        .doodle-idle .doodle-trophy-layer,
        .doodle-restored .doodle-trophy-layer {
          opacity: 0;
          transform: scale(0.8) rotateY(-90deg);
          pointer-events: none;
          z-index: 1;
        }

        /* Phase: Transform-in (Crest flips out, Trophy flips in) */
        .doodle-transform-in .doodle-crest-layer {
          opacity: 0;
          transform: scale(0.85) rotateY(90deg);
          transition: transform 0.4s ease-in, opacity 0.3s ease-in;
          pointer-events: none;
          z-index: 1;
        }
        .doodle-transform-in .doodle-trophy-layer {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, opacity 0.35s ease-out 0.1s;
          pointer-events: auto;
          z-index: 2;
        }

        /* Phase: Active Trophy */
        .doodle-active .doodle-crest-layer {
          opacity: 0;
          transform: scale(0.85) rotateY(90deg);
          pointer-events: none;
          z-index: 1;
        }
        .doodle-active .doodle-trophy-layer {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
          pointer-events: auto;
          z-index: 2;
        }

        /* Phase: Transform-out (Trophy flips out, Crest flips in) */
        .doodle-transform-out .doodle-trophy-layer {
          opacity: 0;
          transform: scale(0.85) rotateY(-90deg);
          transition: transform 0.4s ease-in, opacity 0.3s ease-in;
          pointer-events: none;
          z-index: 1;
        }
        .doodle-transform-out .doodle-crest-layer {
          opacity: 1;
          transform: scale(1) rotateY(0deg);
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, opacity 0.35s ease-out 0.1s;
          pointer-events: auto;
          z-index: 2;
        }

        /* Restrained, soft golden halo behind trophy */
        .doodle-halo {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(253, 185, 19, 0.45) 0%, rgba(253, 185, 19, 0.12) 48%, transparent 70%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease, transform 0.45s ease;
          transform: scale(0.8);
          z-index: 0;
        }
        .doodle-transform-in .doodle-halo,
        .doodle-active .doodle-halo {
          opacity: 1;
          transform: scale(1.12);
        }
        .doodle-transform-out .doodle-halo {
          opacity: 0;
          transform: scale(1.25);
        }

        /* 3D Trophy Keyframe Animations */
        @keyframes trophy3DRotate {
          0% {
            transform: rotateY(-13deg) rotateZ(-1.5deg) scale(0.98);
          }
          45% {
            transform: rotateY(13deg) rotateZ(1.5deg) scale(1.02);
          }
          80% {
            transform: rotateY(-3deg) rotateZ(-0.5deg) scale(1);
          }
          100% {
            transform: rotateY(0deg) rotateZ(0deg) scale(1);
          }
        }

        @keyframes lightSweepAnimation {
          0% {
            transform: translateX(-120%) rotate(25deg);
            opacity: 0;
          }
          25% {
            opacity: 0.95;
          }
          65% {
            transform: translateX(120%) rotate(25deg);
            opacity: 0.95;
          }
          100% {
            transform: translateX(150%) rotate(25deg);
            opacity: 0;
          }
        }

        @keyframes starGlintAnimation {
          0%, 30% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          70%, 100% {
            transform: scale(0) rotate(90deg);
            opacity: 0;
          }
        }

        @keyframes trophyAuraBreath {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.14);
          }
        }

        .doodle-active .doodle-trophy-group {
          transform-origin: 50% 55%;
          animation: trophy3DRotate 2.3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .doodle-active .doodle-light-beam {
          animation: lightSweepAnimation 2.3s ease-in-out infinite;
        }

        .doodle-active .doodle-star-glint {
          transform-origin: 36px 26px;
          animation: starGlintAnimation 2.3s ease-in-out infinite;
        }

        .doodle-active .doodle-aura-pulse {
          transform-origin: 50px 45px;
          animation: trophyAuraBreath 2.3s ease-in-out infinite;
        }
      `}</style>

      {/* Restrained golden glow behind trophy */}
      <div className="doodle-halo" />

      {/* Layer 1: FC Bayern Crest (Default / Fallback) */}
      <div className="doodle-crest-layer">
        <BayernCrest className="w-full h-full" />
      </div>

      {/* Layer 2: Animated Ballon d'Or Trophy */}
      <div className="doodle-trophy-layer">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full overflow-visible drop-shadow-[0_2px_8px_rgba(253,185,19,0.32)]" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            {/* Soft Ambient Gold Aura */}
            <radialGradient id="headerDoodleAura" cx="50%" cy="48%" r="52%">
              <stop offset="0%" stopColor="#FFE066" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#FDB913" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#FDB913" stopOpacity="0" />
            </radialGradient>

            {/* Bright Rich Gold Ball Shading */}
            <radialGradient id="headerDoodleBallShading" cx="36%" cy="32%" r="62%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="10%" stopColor="#FFF7C2" />
              <stop offset="28%" stopColor="#FFD64D" />
              <stop offset="56%" stopColor="#F5A623" />
              <stop offset="80%" stopColor="#C87D04" />
              <stop offset="95%" stopColor="#6B3F00" />
              <stop offset="100%" stopColor="#3B2000" />
            </radialGradient>

            {/* Dark Bronze Base Gradients (NOT muddy brown) */}
            <linearGradient id="headerDoodleBronzeFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#382A1D" />
              <stop offset="30%" stopColor="#221911" />
              <stop offset="70%" stopColor="#2D2117" />
              <stop offset="100%" stopColor="#140D08" />
            </linearGradient>

            <linearGradient id="headerDoodleBronzeTop" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#473524" />
              <stop offset="50%" stopColor="#664D35" />
              <stop offset="100%" stopColor="#3A2B1D" />
            </linearGradient>

            <linearGradient id="headerDoodleBronzeFacet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#594430" />
              <stop offset="50%" stopColor="#33251A" />
              <stop offset="100%" stopColor="#19110B" />
            </linearGradient>

            {/* Subtle Golden Edge Gleam on Dark Bronze Base */}
            <linearGradient id="headerDoodleGoldEdgeGleam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8C6C26" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#F5C862" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#D4A843" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#73541B" stopOpacity="0.3" />
            </linearGradient>

            {/* Dark Bronze & Gold Collar */}
            <linearGradient id="headerDoodleBronzeCollar" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1F160F" />
              <stop offset="25%" stopColor="#D4A843" />
              <stop offset="50%" stopColor="#FFE082" />
              <stop offset="75%" stopColor="#A67C29" />
              <stop offset="100%" stopColor="#18110A" />
            </linearGradient>

            {/* Clip path for light sheen inside the golden sphere */}
            <clipPath id="headerDoodleSphereClip">
              <circle cx="50" cy="42" r="28.5" />
            </clipPath>

            {/* Specular Light Sheen Beam Gradient */}
            <linearGradient id="headerDoodleSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#FFF1B8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Restrained Golden Glow behind trophy */}
          <circle className="doodle-aura-pulse" cx="50" cy="45" r="37" fill="url(#headerDoodleAura)" pointerEvents="none" />

          {/* 3D Rotating Trophy Group */}
          <g className="doodle-trophy-group">
            {/* 1. Dark Bronze Base Pedestal with Subtle Golden Highlights */}
            <g id="header-trophy-base">
              {/* Contact Shadow */}
              <ellipse cx="50" cy="94" rx="26" ry="4.5" fill="#000000" opacity="0.65" />

              {/* Main Front Dark Bronze Face */}
              <polygon points="26,78 74,78 78,92 22,92" fill="url(#headerDoodleBronzeFront)" stroke="#1F160F" strokeWidth="0.5" />

              {/* Chiseled Top Facet of Base */}
              <polygon points="30,71 70,71 74,78 26,78" fill="url(#headerDoodleBronzeTop)" stroke="#2E2014" strokeWidth="0.5" />

              {/* Left Angular Facet */}
              <polygon points="22,92 26,78 30,71 18,84" fill="url(#headerDoodleBronzeFacet)" />

              {/* Right Shadow Facet */}
              <polygon points="74,78 78,92 84,85 70,71" fill="#130D08" />

              {/* Subtle Golden Highlights on Bronze Edges */}
              <line x1="26" y1="78" x2="74" y2="78" stroke="url(#headerDoodleGoldEdgeGleam)" strokeWidth="0.9" strokeLinecap="round" />
              <polyline points="30,71 70,71 74,78" fill="none" stroke="#D4A843" strokeWidth="0.6" strokeOpacity="0.75" />
              <line x1="18" y1="84" x2="26" y2="78" stroke="#E6BA54" strokeWidth="0.7" strokeOpacity="0.8" />

              {/* Subtle Metallic Gold Inset / Vein Detail */}
              <polygon points="46,81 55,80 52,86 48,87" fill="#C99E3D" opacity="0.7" />
              <line x1="46" y1="81" x2="55" y2="80" stroke="#FFF0A6" strokeWidth="0.5" opacity="0.8" />

              {/* Dark Bronze Collar with Gold Accent Ring */}
              <path d="M 41,68 L 59,68 L 57,72 L 43,72 Z" fill="url(#headerDoodleBronzeCollar)" stroke="#1C140D" strokeWidth="0.5" />
            </g>

            {/* 2. Bright Rich Gold Football Sphere */}
            <g id="header-trophy-ball">
              <circle cx="50" cy="42" r="28.5" fill="url(#headerDoodleBallShading)" />

              {/* Stitched Seam Grooves & Pentagon/Hexagon Facets */}
              <g id="header-seams" fill="none" opacity="0.75">
                <polygon points="45,34 56,33 62,42 54,49 43,45" fill="#FFC53D" fillOpacity="0.18" stroke="#6B3B00" strokeWidth="1.1" strokeLinejoin="round" />
                <polyline points="45,34 56,33 62,42" stroke="#FFF1B8" strokeWidth="0.6" strokeLinejoin="round" />
                <path d="M 45,34 L 38,27 M 38,27 L 27,31 M 38,27 L 42,18" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 56,33 L 64,25 M 64,25 L 73,28 M 64,25 L 61,16" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 62,42 L 72,44 M 72,44 L 78,38 M 72,44 L 76,54" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 54,49 L 58,59 M 58,59 L 69,61 M 58,59 L 50,65" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 43,45 L 34,51 M 34,51 L 28,45 M 34,51 L 35,62" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 28,45 L 23,38" stroke="#6B3B00" strokeWidth="1" strokeLinecap="round" />
                <path d="M 45,34 L 38,27 M 56,33 L 64,25" stroke="#FFF7CC" strokeWidth="0.5" />
              </g>

              <ellipse cx="50" cy="69" rx="14" ry="3" fill="#2E1600" opacity="0.6" />

              {/* Specular Light Sheen Sweeping Across Sphere */}
              <g clipPath="url(#headerDoodleSphereClip)">
                <rect className="doodle-light-beam" x="0" y="10" width="45" height="70" fill="url(#headerDoodleSheen)" />
              </g>

              {/* Outer Golden Rim Reflex Highlight */}
              <circle cx="50" cy="42" r="28" fill="none" stroke="#FFE79A" strokeWidth="0.8" opacity="0.7" />

              {/* Brilliant 4-Point Star Sparkle Glint on sphere crest */}
              <g className="doodle-star-glint">
                <path d="M 36,21 Q 36,26 31,26 Q 36,26 36,31 Q 36,26 41,26 Q 36,26 36,21 Z" fill="#FFFFFF" />
                <circle cx="36" cy="26" r="1.4" fill="#FFFBE6" />
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
