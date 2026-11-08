import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * Bayern Red Stagger Wipe Transition Curtain
 * 
 * Refined Specification:
 * - 8 equal-width vertical panels (each 12.5% viewport width)
 * - Full viewport height
 * - Solid Bayern red: #dc052d
 * - No gradients, glow, blur, bounce, or 3D
 * - Transition phase speed: ~700ms (within 650–750ms requirement)
 * - Panel duration: 490ms, Panel stagger: 30ms (0ms, 30ms, 60ms, ..., 210ms -> total 700ms)
 * - Natural smooth cubic-bezier easing: [0.4, 0, 0.2, 1]
 * - State machine: IDLE -> COVERING -> COVERED -> REVEALING -> IDLE
 * - Sweep in: TOP -> BOTTOM behind header
 * - COVERED: panels remain 100% mounted, locking screen in solid Bayern red (fast DOM swap)
 * - Reveal: TOP -> BOTTOM (top of page revealed first as panels exit downward)
 * - Stacking: zIndex 9990 (subordinate to Header zIndex 10000, covers all page content)
 * - Zero flash, zero hairlines, zero layout shift
 * - Full prefers-reduced-motion support
 */

const PANEL_COUNT = 8;
const DURATION = 0.49; // 490ms per panel
const STAGGER = 0.03; // 30ms stagger between panels -> total phase duration: 490 + 7*30 = 700ms
const PREMIUM_EASING = [0.4, 0, 0.2, 1]; // Smooth, natural easeInOut

export default function TransitionCurtain({
  transitionState, // 'idle' | 'covering' | 'covered' | 'revealing'
  onCovered,
  onComplete,
}) {
  const systemPrefersReducedMotion = useReducedMotion();

  // Safety fallback timers
  const safetyCoverTimer = useRef(null);
  const safetyRevealTimer = useRef(null);

  // Panel completion tracking
  const completedCoverPanels = useRef(new Set());
  const completedRevealPanels = useRef(new Set());
  const hasCoveredFired = useRef(false);
  const hasCompleteFired = useRef(false);

  // Array of 8 panel indices [0, 1, 2, 3, 4, 5, 6, 7]
  const panels = Array.from({ length: PANEL_COUNT }, (_, i) => i);

  // Total calculated time for all 8 panels to complete (0.49s + 7 * 0.03s = 0.70s / 700ms)
  const totalCoverTimeMs = (DURATION + (PANEL_COUNT - 1) * STAGGER) * 1000 + 40;
  const totalRevealTimeMs = (DURATION + (PANEL_COUNT - 1) * STAGGER) * 1000 + 40;

  // Manage completion tracking and safety timers per phase
  useEffect(() => {
    if (transitionState === 'covering') {
      completedCoverPanels.current.clear();
      hasCoveredFired.current = false;

      clearTimeout(safetyCoverTimer.current);
      safetyCoverTimer.current = setTimeout(() => {
        if (!hasCoveredFired.current) {
          hasCoveredFired.current = true;
          onCovered?.();
        }
      }, totalCoverTimeMs + 180);

      return () => clearTimeout(safetyCoverTimer.current);
    }

    if (transitionState === 'revealing') {
      completedRevealPanels.current.clear();
      hasCompleteFired.current = false;

      clearTimeout(safetyRevealTimer.current);
      safetyRevealTimer.current = setTimeout(() => {
        if (!hasCompleteFired.current) {
          hasCompleteFired.current = true;
          onComplete?.();
        }
      }, totalRevealTimeMs + 180);

      return () => clearTimeout(safetyRevealTimer.current);
    }
  }, [transitionState, totalCoverTimeMs, totalRevealTimeMs, onCovered, onComplete]);

  // Panel animation config by state
  const getPanelAnimation = (index) => {
    // COVERING: sweep down from above viewport (-100%) to fully cover screen (0%)
    if (transitionState === 'covering') {
      return {
        y: '0%',
        transition: {
          duration: DURATION,
          delay: index * STAGGER, // P1: 0ms, P2: 75ms, ..., P8: 525ms
          ease: PREMIUM_EASING,
        },
      };
    }

    // COVERED: lock at 0% with 0 duration so all 8 panels stay fully mounted and solid red
    if (transitionState === 'covered') {
      return {
        y: '0%',
        transition: { duration: 0 },
      };
    }

    // REVEALING: sweep down from 0% to exit off bottom (100%), revealing top of destination first
    // Starts from TOP-RIGHT and progresses RIGHT -> LEFT (P8 -> P1) with exact 75ms stagger and 1000ms duration
    if (transitionState === 'revealing') {
      const reverseIndex = PANEL_COUNT - 1 - index;
      return {
        y: '100%',
        transition: {
          duration: DURATION,
          delay: reverseIndex * STAGGER, // P8: 0ms, P7: 75ms, P6: 150ms, P5: 225ms, P4: 300ms, P3: 375ms, P2: 450ms, P1: 525ms
          ease: PREMIUM_EASING,
        },
      };
    }

    // IDLE: reset silently to -100% while overlay is hidden (visibility: hidden)
    return {
      y: '-100%',
      transition: { duration: 0 },
    };
  };

  const handlePanelAnimationComplete = (panelIndex) => {
    if (transitionState === 'covering') {
      completedCoverPanels.current.add(panelIndex);
      if (completedCoverPanels.current.size === PANEL_COUNT && !hasCoveredFired.current) {
        hasCoveredFired.current = true;
        onCovered?.();
      }
    } else if (transitionState === 'revealing') {
      completedRevealPanels.current.add(panelIndex);
      if (completedRevealPanels.current.size === PANEL_COUNT && !hasCompleteFired.current) {
        hasCompleteFired.current = true;
        onComplete?.();
      }
    }
  };

  const isTransitionActive = transitionState !== 'idle';

  return (
    <div
      id="transition-curtain-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 9990,
        pointerEvents: isTransitionActive ? 'auto' : 'none',
        overflow: 'hidden',
        visibility: isTransitionActive ? 'visible' : 'hidden',
        opacity: isTransitionActive ? 1 : 0,
      }}
      aria-hidden={!isTransitionActive}
    >
      {/* REDUCED MOTION SIMPLE ACCESSIBLE CROSSFADE */}
      {systemPrefersReducedMotion ? (
        <AnimatePresence>
          {isTransitionActive && (
            <motion.div
              key="reduced-motion-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#dc052d',
              }}
              onAnimationComplete={() => {
                if (transitionState === 'covering' && !hasCoveredFired.current) {
                  hasCoveredFired.current = true;
                  onCovered?.();
                } else if (transitionState === 'revealing' && !hasCompleteFired.current) {
                  hasCompleteFired.current = true;
                  onComplete?.();
                }
              }}
            />
          )}
        </AnimatePresence>
      ) : (
        /* 8-PANEL STAGGER WIPE */
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {panels.map((panelIndex) => (
            <motion.div
              key={`curtain-panel-${panelIndex}`}
              initial={{ y: '-100%' }}
              animate={getPanelAnimation(panelIndex)}
              style={{
                flex: '1 1 0%',
                width: 'calc(100% / 8 + 0.5px)',
                height: '100%',
                backgroundColor: '#dc052d', // Solid Bayern Red
                marginRight: '-0.5px', // Eliminate subpixel hairline cracks on high-DPI displays
                willChange: 'transform',
              }}
              onAnimationComplete={() => handlePanelAnimationComplete(panelIndex)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
