import React from 'react';

export default function QuestionCard({
  question,
  selectedChoice,
  onSelectChoice,
  onProceed,
  isLastQuestion
}) {
  if (!question) return null;

  return (
    <div className="card p-6 sm:p-8 space-y-6 bg-card border border-rule relative text-ink">
      {/* Category & Step Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest uppercase bg-card2 px-2.5 py-0.5 border border-rule rounded text-dim">
            {question.categoryLabel || question.category}
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-dim2 tracking-wider uppercase">
          Question <strong className="text-ink">#{question.number}</strong> of 40
        </span>
      </div>

      {/* Main Question Title */}
      <div className="py-2 text-center sm:text-left">
        <div className="eyebrow mb-1">WOULD YOU RATHER</div>
        <h2 className="text-3xl sm:text-4xl font-disp text-ink leading-tight tracking-tight">
          {question.title}
        </h2>
      </div>

      {/* Option A vs Option B Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OPTION A */}
        <button
          type="button"
          onClick={() => onSelectChoice('A')}
          className={`p-5 rounded-sm text-left transition-all duration-150 flex flex-col justify-between border cursor-pointer font-sans relative ${
            selectedChoice === 'A'
              ? 'bg-[#ffffff] border-acc ring-2 ring-acc/20 shadow-sm'
              : 'bg-[#faf8f2] border-rule hover:border-ink/50 hover:bg-[#ffffff]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                selectedChoice === 'A'
                  ? 'bg-acc text-white'
                  : 'bg-card2 text-ink border border-rule'
              }`}>
                A
              </span>
              {selectedChoice === 'A' && (
                <span className="text-[10px] font-mono font-bold tracking-widest text-acc uppercase bg-acc/10 px-2 py-0.5 rounded border border-acc/20">
                  SELECTED
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-ink">
                {question.optionA.label}
              </h3>
              <div className="text-xs font-mono text-acc font-semibold mt-0.5">
                {question.optionA.sublabel}
              </div>
            </div>

            <p className="text-xs text-dim leading-relaxed">
              {question.optionA.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-rule/60 text-[10.5px] font-mono text-dim2 flex items-center justify-between">
            <span>PRESS [A] OR [1]</span>
            <span className={selectedChoice === 'A' ? 'text-acc font-bold' : ''}>
              {selectedChoice === 'A' ? '✓ READY' : 'CHOOSE OPTION A'}
            </span>
          </div>
        </button>

        {/* OPTION B */}
        <button
          type="button"
          onClick={() => onSelectChoice('B')}
          className={`p-5 rounded-sm text-left transition-all duration-150 flex flex-col justify-between border cursor-pointer font-sans relative ${
            selectedChoice === 'B'
              ? 'bg-[#ffffff] border-acc ring-2 ring-acc/20 shadow-sm'
              : 'bg-[#faf8f2] border-rule hover:border-ink/50 hover:bg-[#ffffff]'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                selectedChoice === 'B'
                  ? 'bg-acc text-white'
                  : 'bg-card2 text-ink border border-rule'
              }`}>
                B
              </span>
              {selectedChoice === 'B' && (
                <span className="text-[10px] font-mono font-bold tracking-widest text-acc uppercase bg-acc/10 px-2 py-0.5 rounded border border-acc/20">
                  SELECTED
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-ink">
                {question.optionB.label}
              </h3>
              <div className="text-xs font-mono text-acc font-semibold mt-0.5">
                {question.optionB.sublabel}
              </div>
            </div>

            <p className="text-xs text-dim leading-relaxed">
              {question.optionB.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-rule/60 text-[10.5px] font-mono text-dim2 flex items-center justify-between">
            <span>PRESS [B] OR [2]</span>
            <span className={selectedChoice === 'B' ? 'text-acc font-bold' : ''}>
              {selectedChoice === 'B' ? '✓ READY' : 'CHOOSE OPTION B'}
            </span>
          </div>
        </button>
      </div>

      {/* Confirmation & Proceed Action */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rule">
        <div className="text-xs text-dim">
          {selectedChoice ? (
            <span>
              Selected: <strong className="text-ink">
                {selectedChoice === 'A' ? question.optionA.label : question.optionB.label}
              </strong>
            </span>
          ) : (
            <span className="italic text-dim2">
              Select Option A or Option B above to continue.
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!selectedChoice}
          onClick={onProceed}
          className={`btn text-xs py-3 px-6 shadow-xs flex items-center gap-2 ${
            !selectedChoice ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>{isLastQuestion ? 'Reveal My Bayern Player Match' : 'Confirm Choice & Proceed'}</span>
          <span className="font-mono">→</span>
        </button>
      </div>
    </div>
  );
}
