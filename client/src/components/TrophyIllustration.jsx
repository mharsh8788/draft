import React from 'react';

export default function TrophyIllustration({ type, className = "w-28 h-28" }) {
  switch (type) {
    case 'meisterschale':
      // Bundesliga Trophy: The iconic circular German Championship Plate (Meisterschale)
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer silver rim */}
          <circle cx="50" cy="50" r="46" stroke="#94a3b8" strokeWidth="2.5" fill="#1e293b" />
          {/* Outer gemstone ring */}
          <circle cx="50" cy="50" r="42" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
          {/* Sunburst radiant lines */}
          <circle cx="50" cy="50" r="34" stroke="#64748b" strokeWidth="1" />
          {/* Inner ring */}
          <circle cx="50" cy="50" r="26" stroke="#e2e8f0" strokeWidth="2" fill="#0f172a" />
          {/* Central golden disc */}
          <circle cx="50" cy="50" r="17" stroke="#f59e0b" strokeWidth="1.5" fill="#78350f" fillOpacity="0.4" />
          {/* Core gemstone */}
          <circle cx="50" cy="50" r="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="1" />
          {/* Decorative jewels */}
          <circle cx="50" cy="12" r="2" fill="#38bdf8" />
          <circle cx="50" cy="88" r="2" fill="#38bdf8" />
          <circle cx="12" cy="50" r="2" fill="#38bdf8" />
          <circle cx="88" cy="50" r="2" fill="#38bdf8" />
          <circle cx="23" cy="23" r="2" fill="#38bdf8" />
          <circle cx="77" cy="23" r="2" fill="#38bdf8" />
          <circle cx="23" cy="77" r="2" fill="#38bdf8" />
          <circle cx="77" cy="77" r="2" fill="#38bdf8" />
        </svg>
      );

    case 'dfb-pokal':
      // DFB-Pokal: The iconic gold chalice with green pedestal
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base pedestal (emerald green base) */}
          <rect x="36" y="86" width="28" height="8" rx="2" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
          <rect x="40" y="80" width="20" height="6" fill="#047857" />
          {/* Stem */}
          <path d="M46 70 L46 80 L54 80 L54 70 Z" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
          {/* Cup body (golden chalice) */}
          <path d="M30 24 C30 54 36 68 50 70 C64 68 70 54 70 24 Z" fill="#b45309" fillOpacity="0.4" stroke="#f59e0b" strokeWidth="2" />
          {/* Upper rim */}
          <ellipse cx="50" cy="24" rx="20" ry="4" stroke="#fbbf24" strokeWidth="2" fill="#d97706" />
          {/* Handles */}
          <path d="M30 30 C16 30 16 52 32 58" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M70 30 C84 30 84 52 68 58" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Ornate crest band */}
          <rect x="34" y="38" width="32" height="4" fill="#fbbf24" opacity="0.8" rx="1" />
        </svg>
      );

    case 'ucl':
      // UEFA Champions League: The iconic "Ol' Big Ears" silver chalice
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <rect x="34" y="88" width="32" height="6" rx="2" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M40 88 L46 76 L54 76 L60 88 Z" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
          {/* Stem ring */}
          <rect x="44" y="74" width="12" height="3" rx="1" fill="#e2e8f0" />
          {/* Trophy Bowl */}
          <path d="M28 22 C28 54 36 72 50 74 C64 72 72 54 72 22 Z" fill="#1e293b" fillOpacity="0.5" stroke="#e2e8f0" strokeWidth="2" />
          <ellipse cx="50" cy="22" rx="22" ry="4" stroke="#f8fafc" strokeWidth="2" fill="#475569" />
          {/* Giant Handles ("Big Ears") */}
          <path d="M28 24 C10 16 8 50 30 64" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          <path d="M72 24 C90 16 92 50 70 64" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
          {/* Subtle star motif */}
          <circle cx="50" cy="46" r="3" fill="#38bdf8" />
        </svg>
      );

    case 'dfl-supercup':
      // DFL Supercup: Dual ribbon modern silver/gold trophy
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circular base */}
          <ellipse cx="50" cy="90" rx="26" ry="6" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          {/* Upward curved stylized ribbon pillars */}
          <path d="M32 90 C34 50 38 30 46 16 C42 34 38 60 38 90 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
          <path d="M68 90 C66 50 62 30 54 16 C58 34 62 60 62 90 Z" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="1" />
          {/* Central sphere / ball */}
          <circle cx="50" cy="34" r="12" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
          <circle cx="50" cy="34" r="7" stroke="#fde68a" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'uefa-cup':
      // UEFA Cup / Europa League: Faceted vase chalice on octagonal base
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <rect x="36" y="86" width="28" height="8" rx="2" fill="#78350f" stroke="#b45309" strokeWidth="1" />
          <polygon points="40,86 44,76 56,76 60,86" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
          {/* Faceted Vase Body */}
          <polygon points="30,20 38,76 62,76 70,20" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="44" y1="20" x2="46" y2="76" stroke="#94a3b8" strokeWidth="1" />
          <line x1="56" y1="20" x2="54" y2="76" stroke="#94a3b8" strokeWidth="1" />
          {/* Top rim */}
          <polygon points="28,20 72,20 70,16 30,16" fill="#e2e8f0" stroke="#f8fafc" strokeWidth="1" />
        </svg>
      );

    case 'uefa-supercup':
      // UEFA Super Cup: Tall slender urn with looping ribbon handles
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Base */}
          <ellipse cx="50" cy="90" rx="22" ry="5" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
          <path d="M42 90 L46 76 L54 76 L58 90 Z" fill="#334155" stroke="#cbd5e1" strokeWidth="1" />
          {/* Slender body */}
          <path d="M34 24 C34 50 40 72 50 76 C60 72 66 50 66 24 Z" fill="#1e293b" fillOpacity="0.5" stroke="#e2e8f0" strokeWidth="2" />
          <ellipse cx="50" cy="24" rx="16" ry="3.5" stroke="#f8fafc" strokeWidth="2" fill="#475569" />
          {/* Curving handles */}
          <path d="M34 28 C22 28 22 48 38 60" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
          <path d="M66 28 C78 28 78 48 62 60" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'fifa-cwc':
      // FIFA Club World Cup: Curved silver pillars holding golden football
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Stepped base */}
          <rect x="32" y="88" width="36" height="6" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
          <rect x="36" y="82" width="28" height="6" rx="1" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
          {/* Curved sweeping pillars */}
          <path d="M38 82 C38 60 42 40 46 26" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <path d="M62 82 C62 60 58 40 54 26" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <path d="M50 82 L50 26" stroke="#94a3b8" strokeWidth="2" />
          {/* Top golden football globe */}
          <circle cx="50" cy="20" r="12" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="50" cy="20" r="6" stroke="#fde68a" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      );

    case 'intercontinental':
      // Intercontinental Cup: Twin spheres on golden pillars
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Plinth */}
          <rect x="30" y="86" width="40" height="8" rx="2" fill="#1e293b" stroke="#d97706" strokeWidth="1.5" />
          {/* Twin golden columns */}
          <rect x="38" y="44" width="6" height="42" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
          <rect x="56" y="44" width="6" height="42" fill="#d97706" stroke="#f59e0b" strokeWidth="1" />
          {/* Crossbar */}
          <rect x="34" y="40" width="32" height="5" rx="1" fill="#fbbf24" />
          {/* Two Globes (Europe & South America) */}
          <circle cx="43" cy="26" r="10" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="57" cy="26" r="10" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Latitude lines */}
          <ellipse cx="43" cy="26" rx="9" ry="3" stroke="#fde68a" strokeWidth="0.8" opacity="0.7" />
          <ellipse cx="57" cy="26" rx="9" ry="3" stroke="#fde68a" strokeWidth="0.8" opacity="0.7" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="#64748b" strokeWidth="2" />
          <path d="M35 30 L65 30 L55 60 L45 60 Z" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
      );
  }
}
