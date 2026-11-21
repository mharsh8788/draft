import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function OdometerDigit({
  targetDigit,
  isTriggered,
  delay = 0,
  duration = 1.1,
  ease = [0.76, 0, 0.24, 1],
}) {
  const digitNum = parseInt(targetDigit, 10);
  const isNumeric = !isNaN(digitNum);

  if (!isNumeric) {
    return <span className="inline-block">{targetDigit}</span>;
  }

  return (
    <span
      className="relative inline-block h-[1em] leading-none overflow-hidden select-none"
      style={{ verticalAlign: 'top' }}
    >
      <motion.span
        initial={{ y: '0%' }}
        animate={{ y: isTriggered ? `-${digitNum * 10}%` : '0%' }}
        transition={{
          duration,
          delay,
          ease,
        }}
        className="flex flex-col items-center will-change-transform"
      >
        {DIGITS.map((num) => (
          <span
            key={num}
            className="w-full h-[1em] leading-none flex items-center justify-center text-center"
          >
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export default function OdometerNumber({
  value,
  isTriggered = false,
  isInView = false,
  delay,
  index = 0,
}) {
  const isReducedMotion = useReducedMotion();

  if (value === undefined || value === null) {
    return <span>—</span>;
  }

  // Accessible fallback: if reduced motion is preferred, render static value immediately
  if (isReducedMotion) {
    return <span>{value}</span>;
  }

  const activeTrigger = isTriggered || isInView;
  // If specific delay is passed, use it; otherwise compute from index (75ms stagger)
  const baseDelay = delay !== undefined ? delay : index * 0.075;
  const digits = String(value).split('');

  return (
    <span className="inline-flex items-center justify-center leading-none tabular-nums">
      {/* Screen reader accessible text */}
      <span className="sr-only">{value}</span>
      {/* Visual odometer rolling reels */}
      <span aria-hidden="true" className="inline-flex items-center justify-center leading-none">
        {digits.map((digit, dIdx) => (
          <OdometerDigit
            key={dIdx}
            targetDigit={digit}
            isTriggered={activeTrigger}
            delay={baseDelay + dIdx * 0.025}
            duration={1.1}
            ease={[0.76, 0, 0.24, 1]}
          />
        ))}
      </span>
    </span>
  );
}
