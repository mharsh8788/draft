import React, { useState } from 'react';
import Header from './components/Header';
import GamesHub from './pages/GamesHub';
import ArchivePage from './pages/ArchivePage';
import CareerPuzzlePage from './pages/CareerPuzzlePage';
import TimelinePage from './pages/TimelinePage';
import FeedbackPage from './pages/FeedbackPage';
import GameProgress from './components/GameProgress';
import DraftCard from './components/DraftCard';
import MysteryCard from './components/MysteryCard';
import RevealModal from './components/RevealModal';
import PitchView from './components/PitchView';
import ComparisonView from './components/ComparisonView';
import FormationSelector from './components/FormationSelector';
import AboutModal from './components/AboutModal';
import { useDraftGame } from './hooks/useDraftGame';
import { useRouter } from './hooks/useRouter';
import { sounds } from './utils/audio';
import { ArrowLeft, Volume2, VolumeX, Flame, Trophy, Shield } from 'lucide-react';

export default function App() {
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { currentPath, navigate, isHome, isMysteryGame, isCareerPuzzle, isTimeline, isArchive, isFeedback } = useRouter();

  const {
    gameStatus,
    selectedFormation,
    currentRound,
    totalRounds,
    currentPositionConfig,
    userTeam,
    opponentTeam,
    currentPair,
    lastChoice,
    score,
    streak,
    bestStreak,
    correctCount,
    wrongCount,
    lastRoundResult,
    startDraft,
    makeChoice,
    continueToNextRound,
    openFormationSelection,
    resetGame
  } = useDraftGame();

  const handleSelectGame = (route) => {
    if (route === '/mystery-player') {
      navigate('/mystery-player');
      if (gameStatus === 'completed') {
        openFormationSelection();
      }
    } else if (route === '/guess-player') {
      navigate('/guess-player');
    } else if (route === '/timeline') {
      navigate('/timeline');
    } else if (route === '/archive') {
      navigate('/archive');
    }
  };

  const handleBackToGames = () => {
    navigate('/');
  };

  const handleRestartDraft = () => {
    openFormationSelection();
  };

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  const roundFormatted = currentRound < 10 ? `0${currentRound}` : currentRound;
  const totalFormatted = totalRounds < 10 ? `0${totalRounds}` : totalRounds;

  return (
    <div className="min-h-screen w-full m-0 p-0 bg-[#0b0f17] text-white flex flex-col font-display selection:bg-[#dc052d] selection:text-white">
      {/* 1. Global Club Header (Full-Width Bayern Red Navigation Bar) */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {/* ROUTE 1: Home Games Hub */}
        {isHome && (
          <GamesHub onSelectGame={handleSelectGame} onNavigate={navigate} />
        )}

        {/* ROUTE 2: Mystery Player Game */}
        {isMysteryGame && (
          <div className="flex-1 w-full subtle-football-pattern flex flex-col">
            {/* Formation Selection Screen */}
            {(gameStatus === 'idle' || gameStatus === 'selecting_formation') && (
              <FormationSelector
                onSelectFormation={(formationKey) => startDraft(formationKey)}
                onBackToGames={handleBackToGames}
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
                    backgroundImage: "url('/images/bayern-newspaper-archive.jpg')",
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
                      onClick={handleBackToGames}
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
                        player={currentPair.mysteryPlayer}
                        targetPosition={currentPositionConfig}
                        onSelect={makeChoice}
                        disabled={gameStatus === 'revealing'}
                      />
                    </div>

                    {/* Secondary: Option A Choice Card */}
                    <div className="flex flex-col">
                      <DraftCard
                        player={currentPair.revealedPlayer}
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
                onBackToGames={handleBackToGames}
              />
            )}
          </div>
        )}

        {/* ROUTE 3: Career Puzzle (Who Am I?) */}
        {isCareerPuzzle && (
          <CareerPuzzlePage onBackToGames={handleBackToGames} onNavigate={navigate} />
        )}

        {/* ROUTE 4: Standalone Historical Timeline */}
        {isTimeline && (
          <TimelinePage onNavigate={navigate} />
        )}

        {/* ROUTE 5: Dedicated Archive Page */}
        {isArchive && (
          <ArchivePage onNavigate={navigate} />
        )}

        {/* ROUTE 6: Community Feedback Page */}
        {isFeedback && (
          <FeedbackPage onNavigate={navigate} />
        )}
      </main>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      {/* Editorial Footer */}
      <footer className="relative z-20 w-full py-5 px-4 sm:px-6 lg:px-8 bg-[#dc052d] text-xs font-display select-none">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="font-display font-bold text-sm text-white tracking-wide uppercase">
              FC BAYERN GAMES
            </p>
            <p className="text-[11px] text-white/80">
              Fan-made project · Not affiliated with FC Bayern München.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-display font-semibold text-white/85">
            <button 
              onClick={() => navigate('/')}
              className={`transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-xs ${currentPath === '/' ? 'text-white font-bold' : 'text-white/85'}`}
            >
              Games
            </button>
            <span className="text-white/50">•</span>
            <button 
              onClick={() => navigate('/timeline')}
              className={`transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-xs ${currentPath === '/timeline' ? 'text-white font-bold' : 'text-white/85'}`}
            >
              Timeline
            </button>
            <span className="text-white/50">•</span>
            <button 
              onClick={() => navigate('/archive')}
              className={`transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-xs ${currentPath === '/archive' ? 'text-white font-bold' : 'text-white/85'}`}
            >
              Archive
            </button>
            <span className="text-white/50">•</span>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 hover:text-white text-white/85 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:rounded-xs"
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
