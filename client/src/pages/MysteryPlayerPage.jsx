import React, { useState } from 'react';
import FormationSelector from '../components/FormationSelector';
import DraftCard from '../components/DraftCard';
import MysteryCard from '../components/MysteryCard';
import RevealModal from '../components/RevealModal';
import PitchView from '../components/PitchView';
import ComparisonView from '../components/ComparisonView';
import GameProgress from '../components/GameProgress';
import { useDraftGame } from '../hooks/useDraftGame';
import { sounds } from '../utils/audio';
import { ArrowLeft, Volume2, VolumeX, Flame } from 'lucide-react';

export default function MysteryPlayerPage({ onBackToGames, onNavigate }) {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const {
    gameStatus,
    selectedFormation,
    currentRound,
    totalRounds,
    currentPositionConfig,
    userTeam,
    opponentTeam,
    currentPair,
    score,
    streak,
    bestStreak,
    correctCount,
    wrongCount,
    lastRoundResult,
    startDraft,
    makeChoice,
    continueToNextRound,
    openFormationSelection
  } = useDraftGame();

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const handleRestartDraft = () => {
    openFormationSelection();
  };

  const roundFormatted = currentRound < 10 ? `0${currentRound}` : currentRound;
  const totalFormatted = totalRounds < 10 ? `0${totalRounds}` : totalRounds;

  return (
    <div className="flex-1 w-full subtle-football-pattern flex flex-col">
      {/* Formation Selection Screen */}
      {(gameStatus === 'idle' || gameStatus === 'selecting_formation') && (
        <FormationSelector
          onSelectFormation={(formationKey) => startDraft(formationKey)}
          onBackToGames={onBackToGames}
          defaultFormation={selectedFormation}
        />
      )}

      {/* In-Game Mystery Player Active Screen (Historical Newspaper Archive Atmospheric Background) */}
      {(gameStatus === 'playing' || gameStatus === 'revealing') && (
        <div className="relative flex-1 w-full overflow-hidden bg-[#070b12] flex flex-col">
          {/* Full-width Historical Newspaper Collage Background */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none blur-[1.5px] scale-105"
            style={{ 
              backgroundImage: "url('/images/bayern-newspaper-archive.webp')",
              backgroundPosition: "center center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat"
            }}
          />

          {/* 75-85% Dark Navy/Black Contrast Overlay */}
          <div className="absolute inset-0 bg-[#070b12]/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/90 via-[#070b12]/75 to-[#070b12]/90 pointer-events-none" />

          {/* In-Game Sub-Header Bar (Active Game) */}
          <div className="relative z-10 bg-[#0e141f]/85 border-b border-[#1c2535] px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Back Link */}
              <button
                onClick={onBackToGames}
                className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
              >
                <ArrowLeft size={14} />
                <span>Back to Games</span>
              </button>

              {/* In-Game Live Metrics & Sound */}
              <div className="flex items-center gap-3 sm:gap-5 font-display text-xs">
                <div className="flex items-center gap-1 text-gray-300">
                  <span className="text-gray-500 uppercase text-[10px]">XP</span>
                  <strong className="text-white text-sm">{score}</strong>
                </div>

                <div className="w-px h-4 bg-[#1c2535]" />

                <div className="flex items-center gap-1.5 text-[#fdb913]">
                  <Flame size={14} />
                  <span className="text-gray-400 uppercase text-[10px]">Streak</span>
                  <strong className="text-sm">{streak}</strong>
                </div>

                <div className="w-px h-4 bg-[#1c2535]" />

                {/* Sound Toggle */}
                <button
                  onClick={handleToggleSound}
                  aria-label="Toggle Sound"
                  className="p-1 rounded text-gray-400 hover:text-white transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
                  title={soundEnabled ? "Mute audio" : "Enable audio"}
                >
                  {soundEnabled ? <Volume2 size={16} className="text-[#dc052d]" /> : <VolumeX size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Active Draft Main Content */}
          <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
            {/* Top Round Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-[#dc052d]">
                <span>ROUND {roundFormatted} / {totalFormatted}</span>
                <span>•</span>
                <span className="text-gray-300">
                  {currentPositionConfig?.label || currentPositionConfig?.position}
                </span>
              </div>

              {/* Central Heading */}
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
                WHO IS THIS PLAYER?
              </h1>

              {/* Progress Indicator Dots */}
              <GameProgress currentRound={currentRound} />
            </div>

            {/* Focused Head-to-Head Cards Matchup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
              {/* Primary: Mystery Player Card (Visual Centerpiece) */}
              <div className="flex flex-col">
                <MysteryCard
                  player={currentPair?.mysteryPlayer}
                  targetPosition={currentPositionConfig}
                  onSelect={makeChoice}
                  disabled={gameStatus === 'revealing'}
                />
              </div>

              {/* Secondary: Option A Choice Card */}
              <div className="flex flex-col">
                <DraftCard
                  key={currentPair?.revealedPlayer?.id || currentRound}
                  player={currentPair?.revealedPlayer}
                  onSelect={makeChoice}
                  disabled={gameStatus === 'revealing'}
                />
              </div>
            </div>

            {/* Tactical Pitch Progression */}
            <div className="pt-8 border-t border-[#1c2535] max-w-4xl mx-auto">
              <PitchView 
                userTeam={userTeam} 
                opponentTeam={opponentTeam} 
                formationKey={selectedFormation}
                isSubdued={gameStatus === 'playing'}
              />
            </div>

            {/* Reveal Result State Modal */}
            {gameStatus === 'revealing' && (
              <RevealModal
                lastRoundResult={lastRoundResult}
                roundNumber={currentRound}
                isLastRound={currentRound === totalRounds}
                onContinue={continueToNextRound}
              />
            )}
          </div>
        </div>
      )}

      {/* Completed Draft State */}
      {gameStatus === 'completed' && (
        <ComparisonView
          userTeam={userTeam}
          opponentTeam={opponentTeam}
          formationKey={selectedFormation}
          score={score}
          bestStreak={bestStreak}
          correctCount={correctCount}
          wrongCount={wrongCount}
          onRestart={handleRestartDraft}
          onBackToGames={onBackToGames}
        />
      )}
    </div>
  );
}
