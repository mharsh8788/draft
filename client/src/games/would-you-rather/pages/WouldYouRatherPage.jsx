import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_QUESTIONS } from '../data/questions';
import { BAYERN_PLAYERS } from '../data/outcomes';
import {
  selectSessionQuestions,
  calculateGameOutcome,
  getStoredPreviousQuestionIds,
  saveStoredPreviousQuestionIds
} from '../utils/gameEngine';
import QuestionProgress from '../components/QuestionProgress';
import QuestionCard from '../components/QuestionCard';
import OutcomeResult from '../components/OutcomeResult';

export default function WouldYouRatherPage() {
  // Initialize exactly 10 questions from the 40-question bank, avoiding previous session questions where possible
  const [sessionQuestions, setSessionQuestions] = useState(() => {
    const prevIds = getStoredPreviousQuestionIds();
    const picked = selectSessionQuestions(ALL_QUESTIONS, prevIds, 10);
    saveStoredPreviousQuestionIds(picked.map(q => q.id));
    return picked;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of 'A' or 'B'
  const [selectedChoice, setSelectedChoice] = useState(null); // 'A' | 'B' | null
  const [outcome, setOutcome] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = useMemo(() => {
    return sessionQuestions[currentIndex] || null;
  }, [sessionQuestions, currentIndex]);

  const isLastQuestion = currentIndex === sessionQuestions.length - 1;

  // Handle choice selection
  const handleSelectChoice = useCallback((choice) => {
    if (isFinished) return;
    setSelectedChoice(choice);
  }, [isFinished]);

  // Proceed to next question or calculate final result
  const handleProceed = useCallback(() => {
    if (!selectedChoice || !currentQuestion || isFinished) return;

    const newAnswers = [...answers, selectedChoice];
    setAnswers(newAnswers);

    if (currentIndex + 1 < sessionQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
    } else {
      // 10 Questions Completed: calculate deterministic player matching outcome
      const result = calculateGameOutcome(newAnswers, sessionQuestions, BAYERN_PLAYERS);
      setOutcome(result);
      setIsFinished(true);
      setSelectedChoice(null);
    }
  }, [selectedChoice, currentQuestion, answers, currentIndex, sessionQuestions, isFinished]);

  // Play Again: start a fresh session with 10 newly selected questions
  const handleReplay = useCallback(() => {
    const prevIds = sessionQuestions.map(q => q.id);
    const newQuestions = selectSessionQuestions(ALL_QUESTIONS, prevIds, 10);
    saveStoredPreviousQuestionIds(newQuestions.map(q => q.id));

    setSessionQuestions(newQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedChoice(null);
    setOutcome(null);
    setIsFinished(false);
  }, [sessionQuestions]);

  // Keyboard accessibility: [A]/[1] for Option A, [B]/[2] for Option B, [Enter] to proceed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (!isFinished) {
        if (e.key === 'a' || e.key === 'A' || e.key === '1') {
          handleSelectChoice('A');
        } else if (e.key === 'b' || e.key === 'B' || e.key === '2') {
          handleSelectChoice('B');
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedChoice) {
            handleProceed();
          }
        }
      } else {
        if (e.key === 'r' || e.key === 'R') {
          handleReplay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, selectedChoice, handleSelectChoice, handleProceed, handleReplay]);

  return (
    <div className="w-full space-y-8">
      {/* 1. Redraft FC Matchday Hero Section */}
      <section id="game-hero" className="space-y-3 pt-2">
        <div className="eyebrow">
          HISTORICAL SOUVENIR PROGRAMME · PLAYER IDENTITY MATCH
        </div>
        <h1>
          Would You Rather?<br />
          Find your <em>Bayern player twin</em>.
        </h1>
        <p className="lede">
          Ten decisive dilemmas sampled from 40 football debates. Choose between iconic players, golden eras, tactical styles, and transfer scenarios to discover which Bayern legend shares your football mind.
        </p>
      </section>

      {/* 2. Question Progress Indicator */}
      {!isFinished && (
        <section id="game-progress">
          <QuestionProgress
            currentIndex={currentIndex}
            totalQuestions={sessionQuestions.length}
            onRestart={handleReplay}
          />
        </section>
      )}

      {/* 3. Main Decision Card OR Final Outcome View */}
      <section id="game-main">
        {!isFinished ? (
          <QuestionCard
            question={currentQuestion}
            selectedChoice={selectedChoice}
            onSelectChoice={handleSelectChoice}
            onProceed={handleProceed}
            isLastQuestion={isLastQuestion}
          />
        ) : (
          <OutcomeResult
            outcome={outcome}
            onReplay={handleReplay}
          />
        )}
      </section>

      {/* 4. Matchday Programme Legend / Guidance */}
      <section className="card p-4 bg-card2 border border-rule text-xs space-y-2 text-dim">
        <div className="flex items-center justify-between border-b border-rule pb-2">
          <span className="font-mono font-bold uppercase tracking-wider text-ink text-[11px]">
            Matchday Quiz Rules & Football Trait Alignment
          </span>
          <span className="font-mono text-[10px] text-dim2">
            SHORTCUTS: [A/1] OPTION A · [B/2] OPTION B · [ENTER] PROCEED
          </span>
        </div>
        <p className="leading-relaxed">
          Each session randomly draws 10 balanced questions across 5 categories from our 40-question bank. Your selections calculate your accumulated football traits—from tactical intelligence and big-game mentality to directness and teamwork—matching you with the Bayern icon whose on-pitch DNA mirrors your own.
        </p>
      </section>
    </div>
  );
}
