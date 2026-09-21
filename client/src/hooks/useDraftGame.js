import { useState, useCallback, useRef } from 'react';
import { PLAYERS, isPositionEligible } from '../data/players';
import { getFormation, FORMATIONS } from '../data/formations';
import { api } from '../services/api';
import { resolvePlayerWithRotatedImage } from '../utils/imageRotation';
import { generateComputerXI } from '../utils/computerDraft';

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

  const [backendDraftId, setBackendDraftId] = useState(null);

  // Private ref holding the full mystery player object so it is never exposed in visible UI state
  const hiddenMysteryPlayerRef = useRef(null);

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

  // Start fresh draft for chosen formation
  const startDraft = useCallback(async (formationKey) => {
    const chosenFormation = formationKey || selectedFormation;
    setSelectedFormation(chosenFormation);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongCount(0);
    setLastRoundResult(null);

    // Try backend initialization first
    const backendData = await api.createDraft(chosenFormation);
    if (backendData && backendData.id) {
      setBackendDraftId(backendData.id);
      setCurrentRound(backendData.currentRound || 1);
      setUserTeam([]);
      setOpponentTeam([]);
      setUsedPlayerIds([backendData.revealedPlayer.id, backendData.mysteryPlayer.id]);

      // Resolve rotated image for available choice
      const resolvedRevealed = resolvePlayerWithRotatedImage(backendData.revealedPlayer, true);

      setCurrentPair({
        revealedPlayer: resolvedRevealed,
        mysteryPlayer: backendData.mysteryPlayer // strictly masked from backend
      });
      setLastChoice(null);
      setGameStatus('playing');
      return;
    }

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
  const makeChoice = useCallback(async (choice) => {
    if (gameStatus !== 'playing' || !currentPair.revealedPlayer || !currentPair.mysteryPlayer) {
      return;
    }

    // Try backend choice if available
    if (backendDraftId) {
      const backendRes = await api.choosePlayer(
        backendDraftId,
        choice,
        currentPair.revealedPlayer.id,
        currentPair.mysteryPlayer.id
      );

      if (backendRes && backendRes.userPick) {
        // At reveal time, resolve rotated image for the revealed mystery player
        const resolvedMystery = resolvePlayerWithRotatedImage(backendRes.revealedMysteryPlayer, true);
        const resolvedRevealed = currentPair.revealedPlayer;

        const userPick = choice === 'mystery' ? resolvedMystery : resolvedRevealed;
        const opponentPick = choice === 'mystery' ? resolvedRevealed : resolvedMystery;

        // Determine if choice is correct (user got equal or higher rated player)
        const isCorrect = userPick.overall >= opponentPick.overall;
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

        setUserTeam(prev => [...prev, userPick]);
        setOpponentTeam(prev => [...prev, opponentPick]);
        setLastChoice(choice);

        setLastRoundResult({
          userPick,
          opponentPick,
          revealedMysteryPlayer: resolvedMystery,
          isCorrect,
          xpEarned,
          streak: newStreak,
          bestStreak: newBestStreak,
          diff: userPick.overall - opponentPick.overall
        });

        setGameStatus('revealing');

        if (backendRes.nextRound) {
          // Pre-resolve rotated image for next round's revealed player
          const nextRevealed = resolvePlayerWithRotatedImage(backendRes.nextRound.revealedPlayer, true);
          setCurrentPair({
            revealedPlayer: nextRevealed,
            mysteryPlayer: backendRes.nextRound.mysteryPlayer
          });
        }
        return;
      }
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

    setGameStatus('revealing');
  }, [gameStatus, currentPair, backendDraftId, usedPlayerIds, streak, bestStreak]);

  // Proceed to next round or finish
  const continueToNextRound = useCallback(async () => {
    const formation = getFormation(selectedFormation);
    if (currentRound >= formation.slots.length) {
      if (backendDraftId) {
        const finishRes = await api.finishDraft(backendDraftId);
        if (finishRes && finishRes.opponentTeam && finishRes.opponentTeam.length === 11) {
          setOpponentTeam(finishRes.opponentTeam);
        } else {
          const compXI = generateComputerXI(selectedFormation, userTeam, opponentTeam);
          setOpponentTeam(compXI);
        }
      } else {
        const compXI = generateComputerXI(selectedFormation, userTeam, opponentTeam);
        setOpponentTeam(compXI);
      }
      setGameStatus('completed');
    } else {
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);

      // If backend didn't pre-populate next round, generate client pair
      if (!backendDraftId) {
        const nextPair = generatePairForRound(nextRound, usedPlayerIds, selectedFormation);
        setCurrentPair(nextPair);
      }
      setLastChoice(null);
      setLastRoundResult(null);
      setGameStatus('playing');
    }
  }, [currentRound, backendDraftId, usedPlayerIds, selectedFormation, userTeam, opponentTeam, generatePairForRound]);

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
    setBackendDraftId(null);
    hiddenMysteryPlayerRef.current = null;
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
    setBackendDraftId(null);
    hiddenMysteryPlayerRef.current = null;
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
