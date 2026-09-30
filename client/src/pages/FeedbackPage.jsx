import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Star, CheckCircle, AlertCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';

const WEBSITE_PARTS = [
  { id: 'Homepage', label: 'Homepage' },
  { id: 'Games', label: 'Games' },
  { id: 'Timeline', label: 'Timeline' },
  { id: 'Archive', label: 'Archive' },
];

const RATING_LABELS = {
  1: 'Needs Work',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Mia San Mia!',
};

export default function FeedbackPage({ onNavigate }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedParts, setSelectedParts] = useState(['Homepage']);
  const [whatLiked, setWhatLiked] = useState('');
  const [whatImproved, setWhatImproved] = useState('');
  const [comments, setComments] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const togglePart = (partId) => {
    setSelectedParts((prev) => {
      const next = prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId];
      const order = ['Homepage', 'Games', 'Timeline', 'Archive'];
      return next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (rating === 0) {
      setErrorMessage('Please select an overall experience rating (1 to 5).');
      return;
    }

    if (selectedParts.length === 0) {
      setErrorMessage('Please select at least one part of the website you used.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage(
        'Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (.env) to enable submissions.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('feedback').insert([
        {
          overall_experience: rating,
          website_part: selectedParts,
          what_liked: whatLiked.trim() || null,
          what_improved: whatImproved.trim() || null,
          comments: comments.trim() || null,
        },
      ]);

      if (error) {
        throw error;
      }

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setErrorMessage(
        err.message || 'Failed to submit feedback. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRating(0);
    setSelectedParts(['Homepage']);
    setWhatLiked('');
    setWhatImproved('');
    setComments('');
    setSubmitSuccess(false);
    setErrorMessage('');
  };

  return (
    <div className="flex-1 w-full subtle-football-pattern bg-[#070b12] py-8 sm:py-14 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Back Link */}
        <button
          onClick={() => onNavigate && onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors mb-6 cursor-pointer select-none"
        >
          <ArrowLeft size={16} />
          <span>BACK TO GAMES</span>
        </button>

        {/* Main Card */}
        <div className="bg-[#121824] border border-[#222c3d] rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Edge Red Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-[#dc052d]" />

          {/* Success State */}
          {submitSuccess ? (
            <div className="py-8 sm:py-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#dc052d]/15 border border-[#dc052d]/40 flex items-center justify-center mx-auto text-[#dc052d]">
                <CheckCircle size={36} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                  MIA SAN MIA
                </span>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                  FEEDBACK SUBMITTED
                </h2>
                <p className="text-sm sm:text-base text-gray-300 font-sans max-w-md mx-auto leading-relaxed">
                  Thank you for helping us improve this fan-made FC Bayern project. Your insights directly shape upcoming features and gameplay.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => onNavigate && onNavigate('/')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer"
                >
                  RETURN TO GAMES
                </button>
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-display font-bold text-xs sm:text-sm tracking-wider uppercase border border-white/10 transition-colors cursor-pointer"
                >
                  SUBMIT ANOTHER RESPONSE
                </button>
              </div>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* Header */}
              <div className="space-y-2 border-b border-[#222c3d] pb-6">
                <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                  <span className="w-2 h-2 rounded-full bg-[#dc052d]" />
                  <span>COMMUNITY VOICE</span>
                </div>
                <h1 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                  SHARE YOUR FEEDBACK
                </h1>
                <p className="text-sm text-gray-300 font-sans">
                  Help improve this fan-made Bayern project.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle size={18} className="text-[#dc052d] shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Field 1: Overall Experience (1-5 Rating) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-display font-bold uppercase tracking-wider text-white">
                    OVERALL EXPERIENCE <span className="text-[#dc052d]">*</span>
                  </label>
                  {(hoverRating || rating) > 0 && (
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-[#dc052d]">
                      {RATING_LABELS[hoverRating || rating]}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = rating >= val;
                    const isHovered = hoverRating >= val;
                    const isActive = hoverRating > 0 ? isHovered : isSelected;

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`flex-1 py-3 px-2 rounded-lg border text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-1 ${
                          isActive
                            ? 'bg-[#dc052d]/20 border-[#dc052d] text-white shadow-sm'
                            : 'bg-[#0b1017] border-[#222c3d] text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        <Star
                          size={18}
                          className={`${
                            isActive
                              ? 'text-[#dc052d] fill-[#dc052d]'
                              : 'text-gray-500'
                          }`}
                        />
                        <span className="font-display font-black text-xs sm:text-sm leading-none">
                          {val}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Website Part Used */}
              <div className="space-y-2.5">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-white">
                  WHICH PART OF THE WEBSITE DID YOU USE? <span className="text-[#dc052d]">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEBSITE_PARTS.map((part) => {
                    const isSelected = selectedParts.includes(part.id);
                    return (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => togglePart(part.id)}
                        aria-pressed={isSelected}
                        className={`py-2.5 px-3 rounded-lg border text-center transition-all cursor-pointer select-none text-xs font-display font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-[#dc052d] border-[#dc052d] text-white shadow-md'
                            : 'bg-[#0b1017] border-[#222c3d] text-gray-400 hover:text-white hover:border-[#374560]'
                        }`}
                      >
                        {part.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: What did you like? */}
              <div className="space-y-2">
                <label htmlFor="whatLiked" className="text-xs font-display font-bold uppercase tracking-wider text-white">
                  WHAT DID YOU LIKE?
                </label>
                <textarea
                  id="whatLiked"
                  rows={3}
                  value={whatLiked}
                  onChange={(e) => setWhatLiked(e.target.value)}
                  placeholder="The games, historical archive, presentation, player puzzles, visual details..."
                  className="w-full bg-[#0b1017] border border-[#222c3d] focus:border-[#dc052d] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none transition-colors"
                />
              </div>

              {/* Field 4: What should be improved? */}
              <div className="space-y-2">
                <label htmlFor="whatImproved" className="text-xs font-display font-bold uppercase tracking-wider text-white">
                  WHAT SHOULD BE IMPROVED?
                </label>
                <textarea
                  id="whatImproved"
                  rows={3}
                  value={whatImproved}
                  onChange={(e) => setWhatImproved(e.target.value)}
                  placeholder="Features you'd like to see, bugs, tricky questions, pacing, mobile navigation..."
                  className="w-full bg-[#0b1017] border border-[#222c3d] focus:border-[#dc052d] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none transition-colors"
                />
              </div>

              {/* Field 5: Additional Comments */}
              <div className="space-y-2">
                <label htmlFor="comments" className="text-xs font-display font-bold uppercase tracking-wider text-white">
                  ADDITIONAL COMMENTS
                </label>
                <textarea
                  id="comments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any other thoughts, ideas, or notes for the project..."
                  className="w-full bg-[#0b1017] border border-[#222c3d] focus:border-[#dc052d] rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 font-sans focus:outline-none transition-colors"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-150 shadow-md cursor-pointer flex items-center justify-center gap-2 select-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'SUBMITTING FEEDBACK...' : 'SUBMIT FEEDBACK'}</span>
                </button>
              </div>

              {/* Privacy Note */}
              <p className="text-[11px] text-gray-400 font-sans text-center">
                Submissions are stored securely and used solely to refine this fan-made project. No personal login or tracking required.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
