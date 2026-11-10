import React from 'react';
import WouldYouRatherGame from '../games/would-you-rather/WouldYouRatherGame';

export default function WouldYouRatherPage({ onBackToGames }) {
  return (
    <div className="relative w-full min-h-screen bg-[#f2efe4]">
      {/* Native Would You Rather Game */}
      <WouldYouRatherGame onBackToGames={onBackToGames} />
    </div>
  );
}
