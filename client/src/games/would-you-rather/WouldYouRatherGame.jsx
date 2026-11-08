import React, { useState } from 'react';
import WouldYouRatherPage from './pages/WouldYouRatherPage';
import './would-you-rather.css';

export default function WouldYouRatherGame() {
  const [currentTab, setCurrentTab] = useState('quiz');

  const scrollToSection = (sectionId, tabKey) => {
    setCurrentTab(tabKey);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="would-you-rather-scope min-h-screen flex flex-col font-sans">
      {/* 1. Redraft FC Matchday Masthead Header */}
      <header>
        <div className="wrap hd">
          <div className="logo cursor-pointer" onClick={() => scrollToSection('game-hero', 'quiz')}>
            BAYERN<b>RATHER</b> FC
          </div>
          <nav>
            <button
              type="button"
              className={currentTab === 'quiz' ? 'active' : ''}
              onClick={() => scrollToSection('game-hero', 'quiz')}
            >
              Would You Rather
            </button>
            <button
              type="button"
              className={currentTab === 'play' ? 'active' : ''}
              onClick={() => scrollToSection('game-main', 'play')}
            >
              Play
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Redraft FC Sub-Header Ticker Strip */}
      <div className="strip">
        <div className="wrap">
          <span className="font-bold text-ink">WOULD YOU RATHER?</span>
          <span className="text-dim2">·</span>
          <span className="text-dim">10 QUESTIONS PER SESSION</span>
          <span className="text-dim2">·</span>
          <span className="text-acc font-bold">40-QUESTION FOOTBALL BANK</span>
          <span className="text-dim2">·</span>
          <span className="text-dim">15 BAYERN PLAYER MATCHES</span>
          <span className="text-dim2">·</span>
          <span className="text-acc font-bold">WEIGHTED FOOTBALL TRAITS</span>
          <span className="text-dim2">·</span>
          <span className="text-dim">ROBBEN · MÜLLER · NEUER · KROOS · KANE</span>
        </div>
      </div>

      {/* 3. Main Application Wrap */}
      <main className="wrap flex-1 w-full py-8">
        <WouldYouRatherPage />
      </main>

      {/* 4. Redraft FC Matchday Programme Footer */}
      <footer className="wrap">
        Would You Rather? is an unofficial historical fan identity game. It is not affiliated with, endorsed by or connected to FC Bayern München, UEFA, or the DFL. Player records and historical eras are verified club facts.
        <br />
        Opinion-based fan profile engine with deterministic 32-path mapping.
        <div className="mt-4 pt-3 border-t border-rule flex flex-wrap items-center gap-4 text-[10.5px] font-mono text-dim2">
          <span>PRIMARY SOURCES:</span>
          <a href="https://fcbayern.com/en" target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
            FC Bayern Archive
          </a>
          <span>·</span>
          <a href="https://www.uefa.com/uefachampionsleague/" target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
            UEFA Champions League
          </a>
          <span>·</span>
          <a href="https://www.bundesliga.com/en/bundesliga" target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
            Bundesliga Records
          </a>
          <span>·</span>
          <a href="https://www.worldfootball.net/teams/bayern-muenchen/" target="_blank" rel="noopener noreferrer" className="hover:text-ink underline">
            WorldFootball.net Archives
          </a>
        </div>
      </footer>
    </div>
  );
}
