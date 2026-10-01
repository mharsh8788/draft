import React, { useState, useEffect, useRef } from 'react';
import { CAREER_PUZZLES } from '../data/careerPuzzles';
import { PLAYERS } from '../data/players';
import { getPlayerImage } from '../utils/imageRotation';
import { sounds } from '../utils/audio';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  Flame, 
  Lock, 
  Eye, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Shield,
  Trophy
} from 'lucide-react';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prominent Player Thumbnail for Large Answer Option Cards
function PlayerThumbnail({ playerId, playerName }) {
  const [imgError, setImgError] = useState(false);
  const src = getPlayerImage(playerId);

  if (!src || imgError) {
    return (
      <div className="w-20 h-26 sm:w-24 sm:h-32 lg:w-28 lg:h-36 rounded-xl bg-[#141c2b] border border-white/10 flex items-center justify-center shrink-0 text-gray-500 shadow-md">
        <Shield size={28} className="text-gray-600" />
      </div>
    );
  }

  return (
    <div className="w-20 h-26 sm:w-24 sm:h-32 lg:w-28 lg:h-36 rounded-xl overflow-hidden border border-white/10 bg-[#0d131f] shrink-0 shadow-md">
      <img
        src={src}
        alt={playerName || 'Player'}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}

export default function CareerPuzzlePage({ onBackToGames }) {
  const [puzzles, setPuzzles] = useState([]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [clueStep, setClueStep] = useState(0); // 0 = Clue 1, 1 = Clue 2, 2 = Clue 3, 3 = Clue 4
  const [choices, setChoices] = useState([]);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'revealed' | 'completed'
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [isLocking, setIsLocking] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Scoring
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(sounds.isEnabled());

  const lockTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      sounds.stopWrong();
    };
  }, []);

  // Initialize randomized puzzle sequence
  useEffect(() => {
    const randomized = shuffle(CAREER_PUZZLES);
    setPuzzles(randomized);
    setPuzzleIndex(0);
    loadPuzzle(randomized[0], 0);
  }, []);

  const loadPuzzle = (puzzle, idx) => {
    if (!puzzle) return;
    sounds.stopWrong();
    const target = PLAYERS.find(p => p.id === puzzle.playerId) || PLAYERS[0];
    
    // Find 3 distractors strictly from database
    const distractors = puzzle.distractorIds
      .map(id => PLAYERS.find(p => p.id === id))
      .filter(Boolean);

    while (distractors.length < 3) {
      const fallback = PLAYERS.find(p => p.id !== target.id && !distractors.some(d => d.id === p.id));
      if (fallback) distractors.push(fallback);
      else break;
    }

    const allOptions = shuffle([target, ...distractors.slice(0, 3)]);
    const labels = ['A', 'B', 'C', 'D'];
    const formattedChoices = allOptions.map((player, i) => ({
      label: labels[i],
      id: player.id,
      name: player.name,
      position: player.position,
      flag: player.flag,
      nationality: player.nationality,
      isCorrect: player.id === target.id
    }));

    setClueStep(0);
    setChoices(formattedChoices);
    setSelectedChoiceId(null);
    setIsLocking(false);
    setLastResult(null);
    setGameState('playing');
  };

  const currentPuzzle = puzzles[puzzleIndex];
  const targetPlayer = currentPuzzle ? PLAYERS.find(p => p.id === currentPuzzle.playerId) : null;
  const currentRewardXp = [100, 75, 50, 25][clueStep] || 25;

  const handleRevealNextClue = () => {
    if (gameState !== 'playing' || isLocking || clueStep >= 3) return;
    sounds.stopWrong();
    sounds.playSelect();
    setClueStep(prev => Math.min(prev + 1, 3));
  };

  const handleSelectChoice = (choiceId) => {
    if (gameState !== 'playing' || isLocking || !targetPlayer) return;

    sounds.stopWrong();
    sounds.initContext();
    setSelectedChoiceId(choiceId);
    setIsLocking(true);

    const isCorrect = choiceId === targetPlayer.id;

    // Immediately play wrong-answer buzzer if choice is incorrect
    if (!isCorrect) {
      sounds.playWrong();
    }

    // Tactile "LOCKED IN" state before reveal
    lockTimerRef.current = setTimeout(() => {
      setIsLocking(false);
      const earnedXp = isCorrect ? currentRewardXp : 0;
      const newStreak = isCorrect ? streak + 1 : 0;
      const newBest = Math.max(bestStreak, newStreak);

      if (isCorrect) {
        setScore(prev => prev + earnedXp);
        setStreak(newStreak);
        setBestStreak(newBest);
        setCorrectCount(prev => prev + 1);
        sounds.playReveal();
      } else {
        setStreak(0);
      }

      const chosen = PLAYERS.find(p => p.id === choiceId) || { name: 'Unknown', id: choiceId };
      setLastResult({
        isCorrect,
        earnedXp,
        chosenPlayer: chosen,
        targetPlayer,
        clueStepUsed: clueStep + 1
      });
      setGameState('revealed');
    }, 650);
  };

  const handleNextPuzzle = () => {
    sounds.stopWrong();
    if (puzzleIndex + 1 >= puzzles.length) {
      setGameState('completed');
    } else {
      const nextIdx = puzzleIndex + 1;
      setPuzzleIndex(nextIdx);
      loadPuzzle(puzzles[nextIdx], nextIdx);
    }
  };

  const handleRestart = () => {
    sounds.stopWrong();
    const randomized = shuffle(CAREER_PUZZLES);
    setPuzzles(randomized);
    setPuzzleIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    loadPuzzle(randomized[0], 0);
  };

  const handleToggleSound = () => {
    const newState = sounds.toggleSound();
    setSoundEnabled(newState);
  };

  if (!currentPuzzle || !targetPlayer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#070b12] text-white">
        <span className="font-display text-sm text-gray-400">Loading Who Am I?...</span>
      </div>
    );
  }

  const targetImage = getPlayerImage(targetPlayer);

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-[#070b12] flex flex-col text-left">
      {/* Historical Bayern Player Collage Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-no-repeat pointer-events-none select-none blur-[1.5px] scale-[1.02]"
        style={{ 
          backgroundImage: "url('/images/bayern-historical-collage.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover"
        }}
      />
      {/* Dark Navy/Black Contrast Overlay (adjusted to ~92% for subtle, atmospheric background visibility) */}
      <div className="absolute inset-0 bg-[#070b12]/92 pointer-events-none" />

      {/* Sub-Header Navigation & Live Metrics Bar (Integrated with background + thin Bayern-red top border) */}
      <div className="relative z-10 bg-[#070b12]/70 backdrop-blur-sm border-t border-[#dc052d] border-b border-white/10 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToGames}
            className="flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all duration-200 ease-out cursor-pointer hover:-translate-x-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <ArrowLeft size={14} />
            <span>Back to Games</span>
          </button>

          {/* Metrics */}
          <div className="flex items-center gap-3 sm:gap-5 font-display text-xs">
            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500 uppercase text-[10px]">PUZZLE</span>
              <strong className="text-white text-sm">{puzzleIndex + 1}/{puzzles.length}</strong>
            </div>

            <div className="w-px h-4 bg-[#1c2535]" />

            <div className="flex items-center gap-1.5 text-gray-300">
              <span className="text-gray-500 uppercase text-[10px]">TOTAL XP</span>
              <strong className="text-white text-sm">{score}</strong>
            </div>

            <div className="w-px h-4 bg-[#1c2535]" />

            <div className="flex items-center gap-1.5 text-[#fdb913]">
              <Flame size={14} />
              <span className="text-gray-400 uppercase text-[10px]">Streak</span>
              <strong className="text-sm">{streak}</strong>
            </div>

            <div className="w-px h-4 bg-[#1c2535]" />

            <button
              onClick={handleToggleSound}
              aria-label="Toggle Sound"
              className="p-1 rounded text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute audio" : "Enable audio"}
            >
              {soundEnabled ? <Volume2 size={16} className="text-[#dc052d]" /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-5 flex-1">

        {/* State 1: Active Mystery Player Deduction Arena */}
        {gameState !== 'completed' && (
          <div className="space-y-5">

            {/* TITLE */}
            <div className="text-center">
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
                WHO AM I?
              </h1>
            </div>

            {/* REVEAL SHOWCASE (Displayed upon answer selection) */}
            {gameState === 'revealed' && (
              <div className="w-full bg-[#0d131f] rounded-2xl border border-[#1c2535] p-5 sm:p-7 space-y-5 shadow-2xl animate-in fade-in duration-300">
                {/* Top Reveal Status Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      lastResult?.isCorrect 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      {lastResult?.isCorrect ? <Check size={22} /> : <X size={22} />}
                    </span>

                    <div>
                      <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wide">
                        {lastResult?.isCorrect ? `CORRECT! +${lastResult.earnedXp} XP` : "INCORRECT GUESS"}
                      </h3>
                      <p className="text-xs font-display text-gray-400">
                        {lastResult?.isCorrect 
                          ? `Deducted on Clue 0${lastResult.clueStepUsed} of 4`
                          : `You guessed ${lastResult?.chosenPlayer?.name || 'Unknown'}`}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleNextPuzzle}
                    autoFocus
                    className="px-6 py-2.5 rounded-xl bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer flex items-center gap-2 shadow-lg hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    <span>{puzzleIndex + 1 >= puzzles.length ? "VIEW FINAL SUMMARY" : "NEXT PLAYER"}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                {/* Player Spotlight Profile */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-[#080d14] border border-[#1c2535]">
                  {targetImage && (
                    <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden border-2 border-[#dc052d] shrink-0 bg-[#121824] shadow-[0_0_18px_rgba(220,5,45,0.35)]">
                      <img
                        src={targetImage}
                        alt={targetPlayer.name}
                        className={`w-full h-full object-cover ${targetPlayer.imagePosition || 'object-[center_top]'}`}
                      />
                    </div>
                  )}

                    <div className="space-y-1.5 flex-1 text-center sm:text-left">
                      <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#dc052d]">
                        THE PLAYER WAS
                      </span>

                      <h4 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                        {targetPlayer.name}
                      </h4>

                      <div className="flex items-center gap-2 pt-0.5 flex-wrap justify-center sm:justify-start text-xs font-display">
                        <span className="text-base">{targetPlayer.flag}</span>
                        <span className="text-gray-300 uppercase font-bold">{targetPlayer.nationality}</span>
                        <span className="text-gray-600">•</span>
                        <span className="font-bold text-[#dc052d]">{targetPlayer.overall} OVR</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400">{targetPlayer.era}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-300 font-bold">{targetPlayer.position}</span>
                      </div>

                      {targetPlayer.bio && (
                        <p className="text-xs text-gray-300 italic pt-1.5 font-display border-t border-white/5 max-w-2xl leading-relaxed">
                          &ldquo;{targetPlayer.bio}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
            )}

            {/* 2 & 3. CHRONOLOGICAL CLUES AREA (All revealed clues remain visible from oldest to newest) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="flex items-center gap-2 text-gray-300 font-display text-xs">
                  <span className="text-[#dc052d] font-bold">CLUE 0{clueStep + 1} / 04</span>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-1.5" aria-label={`Clue ${clueStep + 1} of 4`}>
                    {[0, 1, 2, 3].map((stepIdx) => {
                      const isCurrent = stepIdx === clueStep;
                      const isCompleted = stepIdx < clueStep;
                      return (
                        <span
                          key={stepIdx}
                          className={`transition-all duration-300 ${
                            isCurrent
                              ? 'w-2.5 h-2.5 rounded-full bg-[#dc052d] ring-2 ring-[#dc052d]/40 shadow-[0_0_8px_rgba(220,5,45,0.8)]'
                              : isCompleted
                              ? 'w-2 h-2 rounded-full bg-white/70'
                              : 'w-2 h-2 rounded-full bg-white/20'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                <span className="text-[11px] font-display text-gray-400 uppercase tracking-wider">
                  CHRONOLOGICAL CLUES
                </span>
              </div>

              {/* Stack of all clues revealed so far */}
              <div className="space-y-3">
                {currentPuzzle.clues.slice(0, clueStep + 1).map((clue, idx) => {
                  const isActive = idx === clueStep;

                  return (
                    <div
                      key={clue.step}
                      className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border transition-all duration-300 text-left ${
                        isActive
                          ? 'bg-[#0f1726] border-2 border-[#dc052d]/70 shadow-lg ring-1 ring-[#dc052d]/30'
                          : 'bg-[#0b101a] border border-[#1c2535] opacity-85'
                      }`}
                    >
                      {/* Clue Header: Step & Milestone Label */}
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded font-display font-bold text-xs uppercase tracking-wider ${
                            isActive ? 'bg-[#dc052d] text-white' : 'bg-white/10 text-gray-300'
                          }`}>
                            CLUE 0{clue.step}
                          </span>
                          <span className={`text-xs font-display uppercase tracking-widest ${
                            isActive ? 'text-white font-bold' : 'text-gray-400 font-semibold'
                          }`}>
                            {clue.year} • {clue.label}
                          </span>
                        </div>

                        {isActive ? (
                          <span className="px-2 py-0.5 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-[#dc052d] font-display text-[10px] font-bold uppercase tracking-wider">
                            ACTIVE CLUE
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-display text-emerald-400">
                            <Check size={12} />
                            <span>REVEALED</span>
                          </span>
                        )}
                      </div>

                      {/* Clue Body Quote */}
                      <div className="pt-2">
                        <p className={`font-display leading-relaxed italic ${
                          isActive 
                            ? 'text-white font-medium text-base sm:text-lg' 
                            : 'text-gray-300 text-sm sm:text-base'
                        }`}>
                          &ldquo;{clue.text}&rdquo;
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. REVEAL NEXT CLUE BUTTON (−25 XP) */}
              {gameState === 'playing' && clueStep < 3 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0c121d] border border-[#1c2535]">
                  <p className="text-xs font-display text-gray-400 text-center sm:text-left">
                    Need another hint? Reveals Clue 0{clueStep + 2} (reduces reward to +{[75, 50, 25][clueStep]} XP).
                  </p>

                  <button
                    onClick={handleRevealNextClue}
                    disabled={isLocking}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-display text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-white/25 transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 disabled:hover:translate-y-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
                  >
                    <Eye size={14} className="text-[#fdb913]" />
                    <span>REVEAL NEXT CLUE</span>
                    <span className="px-1.5 py-0.5 rounded bg-black/50 text-[#dc052d] font-bold">−25 XP</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4 & 5. LARGE PLAYER ANSWER OPTIONS (2x2 Desktop, 1-Col Mobile) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <div className="space-y-0.5">
                  <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                    WHO IS THIS PLAYER?
                  </h3>
                  <p className="text-xs font-display text-gray-400">
                    Select 1 of 4 Bayern players to lock in your answer
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded bg-[#fdb913]/10 border border-[#fdb913]/30 text-[#fdb913] font-display font-bold text-xs">
                  +{currentRewardXp} XP
                </div>
              </div>

              {/* 2x2 Answer Grid with Large Player Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isRevealedState = gameState === 'revealed';
                  const isCorrectChoice = choice.isCorrect;

                  let borderClass = "border-[#1c2535] hover:border-[#dc052d]/50";
                  let bgClass = "bg-[#0e1422] hover:bg-[#131b2b]";

                  // Lock-in interaction visual states
                  if (isLocking && isSelected) {
                    borderClass = "border-[#fdb913] ring-2 ring-[#fdb913]/60 shadow-[0_0_20px_rgba(253,185,19,0.35)]";
                    bgClass = "bg-[#182234]";
                  } else if (isRevealedState) {
                    if (isCorrectChoice) {
                      borderClass = "border-emerald-500 ring-1 ring-emerald-500/50 shadow-md";
                      bgClass = "bg-emerald-950/40";
                    } else if (isSelected && !isCorrectChoice) {
                      borderClass = "border-red-500 ring-1 ring-red-500/50";
                      bgClass = "bg-red-950/40";
                    } else {
                      bgClass = "bg-[#0a0e16]/50 opacity-35";
                      borderClass = "border-[#192230]";
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleSelectChoice(choice.id)}
                      disabled={gameState !== 'playing' || isLocking}
                      className={`w-full group p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 ease-out cursor-pointer disabled:cursor-default flex items-center justify-between gap-4 shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70 ${bgClass} ${borderClass}`}
                    >
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
                        {/* Large Player Image */}
                        <PlayerThumbnail
                          playerId={choice.id}
                          playerName={choice.name}
                        />

                        {/* Option Letter + Details */}
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-lg font-display font-black text-sm flex items-center justify-center border shrink-0 transition-colors ${
                              isRevealedState && isCorrectChoice
                                ? 'bg-emerald-500 text-white border-emerald-400'
                                : isRevealedState && isSelected && !isCorrectChoice
                                ? 'bg-red-600 text-white border-red-500'
                                : isLocking && isSelected
                                ? 'bg-[#fdb913] text-black border-[#fdb913]'
                                : 'bg-[#162030] text-white border-white/10 group-hover:bg-[#dc052d]'
                            }`}>
                              {choice.label}
                            </span>
                            <span className="text-[11px] font-display text-gray-400 uppercase tracking-wider">
                              OPTION {choice.label}
                            </span>
                          </div>

                          <h4 className="font-display font-black text-base sm:text-xl lg:text-2xl text-white uppercase tracking-tight truncate">
                            {choice.name}
                          </h4>

                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300 font-display">
                            <span className="text-base">{choice.flag}</span>
                            <span className="uppercase font-semibold text-[11px] sm:text-xs">{choice.nationality}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-white font-bold">{choice.position}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right-Side State Badges */}
                      <div className="shrink-0 flex items-center">
                        {isLocking && isSelected && (
                          <span className="px-2.5 py-1 rounded bg-[#fdb913]/20 border border-[#fdb913]/40 text-[#fdb913] font-display font-bold text-xs tracking-wider animate-pulse flex items-center gap-1">
                            <Lock size={12} />
                            <span>LOCKED IN</span>
                          </span>
                        )}

                        {isRevealedState && (
                          <span>
                            {isCorrectChoice ? (
                              <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                                <Check size={18} className="text-emerald-400" />
                              </span>
                            ) : isSelected ? (
                              <span className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                                <X size={18} className="text-red-400" />
                              </span>
                            ) : null}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* State 2: Completed All Puzzles Summary */}
        {gameState === 'completed' && (
          <div className="max-w-2xl mx-auto bg-[#0d131f] rounded-2xl border-2 border-[#dc052d] p-7 sm:p-10 space-y-7 shadow-2xl text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#dc052d]/20 border border-[#dc052d]/40 flex items-center justify-center mx-auto text-[#dc052d]">
              <Trophy size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-display font-bold uppercase tracking-widest text-[#dc052d] block">
                CHALLENGE COMPLETED
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                WHO AM I? MASTER
              </h2>
              <p className="text-sm text-gray-300 font-display">
                You have completed all {puzzles.length} historical Bayern player career deduction puzzles!
              </p>
            </div>

            {/* Scorecard Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-display text-left">
              <div className="p-3.5 rounded-xl bg-[#080d14] border border-[#1c2535]">
                <span className="text-[10px] text-gray-400 uppercase block">TOTAL SCORE</span>
                <span className="font-display font-black text-2xl text-[#dc052d]">{score.toLocaleString()} XP</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080d14] border border-[#1c2535]">
                <span className="text-[10px] text-gray-400 uppercase block">ACCURACY</span>
                <span className="font-display font-black text-2xl text-white">{correctCount} / {puzzles.length}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080d14] border border-[#1c2535]">
                <span className="text-[10px] text-gray-400 uppercase block">BEST STREAK</span>
                <span className="font-display font-black text-2xl text-[#fdb913]">{bestStreak}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#080d14] border border-[#1c2535]">
                <span className="text-[10px] text-gray-400 uppercase block">SUCCESS RATE</span>
                <span className="font-display font-black text-2xl text-emerald-400">
                  {Math.round((correctCount / (puzzles.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestart}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc052d]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d14]"
              >
                <RotateCcw size={16} />
                <span>PLAY AGAIN</span>
              </button>

              <button
                onClick={onBackToGames}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold text-sm tracking-wider uppercase border border-white/10 hover:border-white/20 transition-all duration-200 ease-out hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d14]"
              >
                <ArrowLeft size={16} />
                <span>BACK TO GAMES</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
