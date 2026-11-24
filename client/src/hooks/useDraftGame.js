import { useState, useCallback, useRef } from 'react';
import { PLAYERS, isPositionEligible } from '../data/players';
import { getFormation, FORMATIONS } from '../data/formations';
import { resolvePlayerWithRotatedImage, getPlayerImage } from '../utils/imageRotation';
import { generateComputerXI } from '../utils/computerDraft';

const preloadedImageUrls = new Set();

function preloadImageUrl(url) {
  if (!url || typeof window === 'undefined') return;
  if (preloadedImageUrls.has(url)) return;
  preloadedImageUrls.add(url);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useDraftGame() {
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle' | 'selecting_formation' | 'playing' | 'revealing' | 'completed'
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [currentRound, setCurrentRound] = useState(1);
  const [userTeam, setUserTeam] = useState([]);
  const [opponentTeam, setOpponentTeam] = useState([]);
  const [usedPlayerIds, setUsedPlayerIds] = useState([]);
  const [currentPair, setCurrentPair] = useState({ revealedPlayer: null, mysteryPlayer: null });
  const [lastChoice, setLastChoice] = useState(null); // 'revealed' or 'mystery'
  
  // Game progression & score state
  const [score, setScore] = useState(0); // Total XP
  const [streak, setStreak] = useState(0); // Current streak
  const [bestStreak, setBestStreak] = useState(0); // Best streak
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [lastRoundResult, setLastRoundResult] = useState(null);

  // Private ref holding the full mystery player object so it is never exposed in visible UI state
  const hiddenMysteryPlayerRef = useRef(null);

  // Pre-generated next round pair ref (prepared while reveal modal is displayed)
  const nextPairRef = useRef(null);

  const activeFormation = getFormation(selectedFormation);

  // Generate pair client-side with strictly masked mystery player
  const generatePairForRound = useCallback((roundNum, currentUsedIds, formationKey) => {
    const formation = getFormation(formationKey || selectedFormation);
    const roundConfig = formation.slots.find(r => r.round === roundNum) || formation.slots[roundNum - 1];
    if (!roundConfig) return null;

    const targetPosition = roundConfig.position;
    const eligible = PLAYERS.filter(
      p => isPositionEligible(p, targetPosition) && !currentUsedIds.includes(p.id)
    );

    let pair = [];
    if (eligible.length < 2) {
      const fallback = PLAYERS.filter(p => isPositionEligible(p, targetPosition));
      pair = shuffle(fallback);
    } else {
      pair = shuffle(eligible);
    }

    const fullRevealed = pair[0];
    const fullMystery = pair[1] || pair[0];

    // Store full mystery player in private ref
    hiddenMysteryPlayerRef.current = fullMystery;

    // Available choice receives rotated image (appearance recorded)
    const resolvedRevealed = resolvePlayerWithRotatedImage(fullRevealed, true);

    // Preload revealed player image immediately
    if (resolvedRevealed?.image) {
      preloadImageUrl(resolvedRevealed.image);
    }

    // Preload mystery player portrait immediately so reveal modal has it cached
    const mysteryImgUrl = getPlayerImage(fullMystery);
    if (mysteryImgUrl) {
      preloadImageUrl(mysteryImgUrl);
    }

    return {
      revealedPlayer: resolvedRevealed,
      // Public state receives strictly masked mystery object (NO image, NO rotation leak)
      mysteryPlayer: {
        id: fullMystery.id,
        position: fullMystery.position,
        isMystery: true
      }
    };
  }, [selectedFormation]);

  // Start fresh draft for chosen formation (pure client initialization without dead /api/drafts 404 delay)
  const startDraft = useCallback((formationKey) => {
    const chosenFormation = formationKey || selectedFormation;
    setSelectedFormation(chosenFormation);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLastRoundResult(null);
    nextPairRef.current = null;

    // Client-side initialization
    const initialUsed = [];
    const firstPair = generatePairForRound(1, initialUsed, chosenFormation);

    setCurrentRound(1);
    setUserTeam([]);
    setOpponentTeam([]);
    setUsedPlayerIds(initialUsed);
    setCurrentPair(firstPair);
    setLastChoice(null);
    setGameStatus('playing');
  }, [selectedFormation, generatePairForRound]);

  // Handle user making a selection
  const makeChoice = useCallback((choice) => {
    if (gameStatus !== 'playing' || !currentPair.revealedPlayer || !currentPair.mysteryPlayer) {
      return;
    }

    // Local client logic: fetch unmasked mystery player
    const fullMysteryPlayer = hiddenMysteryPlayerRef.current || 
      PLAYERS.find(p => p.id === currentPair.mysteryPlayer.id);

    // At reveal time, resolve rotated image for the mystery player
    const resolvedMysteryPlayer = resolvePlayerWithRotatedImage(fullMysteryPlayer, true);
    const resolvedRevealedPlayer = currentPair.revealedPlayer;

    const userSelected = choice === 'revealed' ? resolvedRevealedPlayer : resolvedMysteryPlayer;
    const opponentSelected = choice === 'revealed' ? resolvedMysteryPlayer : resolvedRevealedPlayer;

    const newUsed = [...usedPlayerIds, resolvedRevealedPlayer.id, fullMysteryPlayer.id];

    // Determine correct / streak
    const isCorrect = userSelected.overall >= opponentSelected.overall;
    const newStreak = isCorrect ? streak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);
    const xpEarned = isCorrect ? 250 : 0;

    if (isCorrect) {
      setScore(prev => prev + xpEarned);
      setStreak(newStreak);
      setBestStreak(newBestStreak);
      setCorrectCount(prev => prev + 1);
    } else {
      setStreak(0);
      setWrongCount(prev => prev + 1);
    }

    setUserTeam(prev => [...prev, userSelected]);
    setOpponentTeam(prev => [...prev, opponentSelected]);
    setUsedPlayerIds(newUsed);
    setLastChoice(choice);

    setLastRoundResult({
      userPick: userSelected,
      opponentPick: opponentSelected,
      revealedMysteryPlayer: fullMysteryPlayer,
      isCorrect,
      xpEarned,
      streak: newStreak,
      bestStreak: newBestStreak,
      diff: userSelected.overall - opponentSelected.overall
    });

    // While user views the reveal modal, prepare and preload the next round's pair
    const nextRoundNum = currentRound + 1;
    const formation = getFormation(selectedFormation);
    if (nextRoundNum <= formation.slots.length) {
      const nextPair = generatePairForRound(nextRoundNum, newUsed, selectedFormation);
      nextPairRef.current = nextPair;
      if (nextPair?.revealedPlayer?.image) {
        preloadImageUrl(nextPair.revealedPlayer.image);
      }
      if (hiddenMysteryPlayerRef.current) {
        const nextMysteryImg = getPlayerImage(hiddenMysteryPlayerRef.current);
        if (nextMysteryImg) {
          preloadImageUrl(nextMysteryImg);
        }
      }
    } else {
      nextPairRef.current = null;
    }

    setGameStatus('revealing');
  }, [gameStatus, currentPair, usedPlayerIds, streak, bestStreak, currentRound, selectedFormation, generatePairForRound]);

  // Proceed to next round or finish
  const continueToNextRound = useCallback(() => {
    const formation = getFormation(selectedFormation);
    if (currentRound >= formation.slots.length) {
      const compXI = generateComputerXI(selectedFormation, userTeam, opponentTeam);
      setOpponentTeam(compXI);
      setGameStatus('completed');
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);

      // Use pre-generated next pair if available, ensuring exact consistency
      const nextPair = nextPairRef.current || generatePairForRound(nextRound, usedPlayerIds, selectedFormation);
      nextPairRef.current = null;
      setCurrentPair(nextPair);

      setLastChoice(null);
      setLastRoundResult(null);
      setGameStatus('playing');
    }
  }, [currentRound, usedPlayerIds, selectedFormation, userTeam, opponentTeam, generatePairForRound]);

  // Go to formation selection screen
  const openFormationSelection = useCallback(() => {
    setGameStatus('selecting_formation');
    setCurrentRound(1);
    setUserTeam([]);
    setOpponentTeam([]);
    setUsedPlayerIds([]);
    setCurrentPair({ revealedPlayer: null, mysteryPlayer: null });
    setLastChoice(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLastRoundResult(null);
    hiddenMysteryPlayerRef.current = null;
    nextPairRef.current = null;
  }, []);

  // Reset draft
  const resetGame = useCallback(() => {
    setGameStatus('idle');
    setCurrentRound(1);
    setUserTeam([]);
    setOpponentTeam([]);
    setUsedPlayerIds([]);
    setCurrentPair({ revealedPlayer: null, mysteryPlayer: null });
    setLastChoice(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLastRoundResult(null);
    hiddenMysteryPlayerRef.current = null;
    nextPairRef.current = null;
  }, []);

  return {
    gameStatus,
    setGameStatus,
    selectedFormation,
    setSelectedFormation,
    formations: FORMATIONS,
    currentRound,
    totalRounds: activeFormation.slots.length,
    currentPositionConfig: activeFormation.slots.find(r => r.round === currentRound) || activeFormation.slots[currentRound - 1],
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
  };
}
