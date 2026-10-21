import React from 'react';

/**
 * ImageSkeleton:
 * Subtle, dark skeleton with a restrained shimmer animation consistent with the
 * site's dark navy (#0d131f) and subtle Bayern-red (#dc052d) visual style.
 * - Respects prefers-reduced-motion automatically via CSS.
 * - Fits any container or explicit dimensions passed via className.
 */
export default function ImageSkeleton({ className = '', rounded = 'rounded-md', ...props }) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
