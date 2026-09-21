import React from 'react';

export default function BayernCrest({ className = "w-11 h-11 sm:w-12 sm:h-12", alt = "FC Bayern München Crest" }) {
  return (
    <div className={`relative shrink-0 select-none flex items-center justify-center ${className}`}>
      <img 
        src="/fc-bayern-logo.png" 
        alt={alt}
        className="w-full h-full object-contain pointer-events-none"
        loading="eager"
      />
    </div>
  );
}
