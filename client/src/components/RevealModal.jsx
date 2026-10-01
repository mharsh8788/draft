import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';
import { ArrowRight, Check, X, Shield, Star, Flame } from 'lucide-react';
import { getPlayerImage } from '../utils/imageRotation';

export default function RevealModal({ 
  lastRoundResult, 
  roundNumber, 
  isLastRound, 
  onContinue 
}) {
  const [mysteryImgErr, setMysteryImgErr] = useState(false);
  const [userImgErr, setUserImgErr] = useState(false);
  const [oppImgErr, setOppImgErr] = useState(false);

  useEffect(() => {
    sounds.playReveal();
  }, []);

  if (!lastRoundResult) return null;

  const {
    userPick,
    opponentPick,
    revealedMysteryPlayer,
    isCorrect,
    xpEarned,
    streak,
    bestStreak,
    diff
  } = lastRoundResult;

  const mysteryPlayer = revealedMysteryPlayer || opponentPick;
  const userSurname = userPick.name.split(' ').pop();

  const mysteryImage = getPlayerImage(mysteryPlayer);
  const userImage = getPlayerImage(userPick);
  const opponentImage = getPlayerImage(opponentPick);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm modal-backdrop-animate">
      <div className="w-full max-w-lg bg-[#121824] rounded-xl border border-[#1c2535] shadow-2xl overflow-hidden space-y-5 p-6 sm:p-7 text-left modal-content-animate">
        {/* Top Header: Round Complete Kicker & Streak Status */}
        <div className="flex items-center justify-between border-b border-[#1c2535] pb-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-gray-400 block">
              ROUND {roundNumber < 10 ? `0${roundNumber}` : roundNumber} COMPLETE
            </span>
            <span className="text-xs font-display font-bold uppercase text-[#dc052d]">
              DECISION REVEAL
            </span>
          </div>

          {/* XP & Streak Pills */}
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <>
                <span className="px-2.5 py-1 rounded bg-[#dc052d]/15 border border-[#dc052d]/30 text-[#dc052d] font-display font-bold text-xs">
                  +{xpEarned} XP
                </span>
                <span className="px-2.5 py-1 rounded bg-[#fdb913]/15 border border-[#fdb913]/30 text-[#fdb913] font-display font-bold text-xs flex items-center gap-1">
                  <Flame size={13} />
                  STREAK {streak}
                </span>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-400 font-display font-bold text-xs">
                STREAK ENDED • BEST: {bestStreak}
              </span>
            )}
          </div>
        </div>

        {/* The Central Reveal Statement */}
        <div className="p-4 rounded-lg bg-[#0a0e14] border border-[#1c2535] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {mysteryImage && !mysteryImgErr ? (
            <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden border-2 border-[#dc052d] shadow-lg shrink-0 bg-[#121824]">
              <img
                src={mysteryImage}
                alt={mysteryPlayer.name}
                onError={() => setMysteryImgErr(true)}
                className={`w-full h-full object-cover ${mysteryPlayer.imagePosition || 'object-top'} filter contrast-105`}
              />
              <span className="absolute bottom-0 right-0 bg-[#dc052d] text-white text-[9px] font-black px-1.5 py-0.5 rounded-tl font-display">
                {mysteryPlayer.position}
              </span>
            </div>
          ) : (
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg border-2 border-[#dc052d] bg-[#121824] flex flex-col items-center justify-center shrink-0">
              <span className="font-display font-black text-2xl text-white">{mysteryPlayer.overall}</span>
              <span className="font-display text-[9px] text-[#dc052d] font-bold uppercase">{mysteryPlayer.position}</span>
            </div>
          )}

          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-display font-bold uppercase tracking-widest text-gray-400 block">
              THE MYSTERY PLAYER WAS
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
              {mysteryPlayer.name}
            </h2>
            <div className="inline-flex items-center gap-2 pt-0.5 flex-wrap justify-center sm:justify-start">
              <span className="text-base">{mysteryPlayer.flag}</span>
              <span className="font-display text-xs text-gray-400 uppercase">{mysteryPlayer.nationality}</span>
              <span className="text-gray-600">•</span>
              <span className="font-display font-bold text-sm text-[#dc052d]">
                {mysteryPlayer.overall} OVR
              </span>
              <span className="text-gray-600">•</span>
              <span className="font-display text-xs text-gray-400">{mysteryPlayer.era}</span>
            </div>
          </div>
        </div>

        {/* Head-to-Head Comparison: Your Pick vs Mystery Option */}
        <div className="grid grid-cols-2 gap-3 font-display">
          {/* User's Choice */}
          <div className="p-3.5 rounded-lg bg-[#0c121c] border border-[#1c2535] flex items-start gap-3">
            {userImage && !userImgErr ? (
              <img
                src={userImage}
                alt={userPick.name}
                onError={() => setUserImgErr(true)}
                className="w-11 h-13 sm:w-12 sm:h-14 rounded object-cover object-top border border-[#dc052d]/40 shadow shrink-0 hidden xs:block"
              />
            ) : (
              <span className="w-11 h-13 sm:w-12 sm:h-14 rounded bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400 shrink-0 font-display hidden xs:flex">
                {userPick.position}
              </span>
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#dc052d] block">
                YOUR PICK
              </span>
              <h4 className="font-display font-bold text-base text-white truncate">
                {userPick.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="font-display font-black text-2xl text-white">
                  {userPick.overall}
                </span>
                <span className="text-[10px] text-gray-400">OVR</span>
              </div>
              {isCorrect ? (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <Check size={12} /> HIGHER RATING
                </span>
              ) : (
                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                  <X size={12} /> LOWER RATING
                </span>
              )}
            </div>
          </div>

          {/* Opponent Pick */}
          <div className="p-3.5 rounded-lg bg-[#0c121c] border border-[#1c2535] flex items-start gap-3">
            {opponentImage && !oppImgErr ? (
              <img
                src={opponentImage}
                alt={opponentPick.name}
                onError={() => setOppImgErr(true)}
                className="w-11 h-13 sm:w-12 sm:h-14 rounded object-cover object-top border border-white/10 shadow shrink-0 hidden xs:block"
              />
            ) : (
              <span className="w-11 h-13 sm:w-12 sm:h-14 rounded bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-400 shrink-0 font-display hidden xs:flex">
                {opponentPick.position}
              </span>
            )}
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                OPPONENT PICK
              </span>
              <h4 className="font-display font-bold text-base text-gray-300 truncate">
                {opponentPick.name}
              </h4>
              <div className="flex items-baseline gap-1.5 pt-0.5">
                <span className="font-display font-black text-2xl text-gray-400">
                  {opponentPick.overall}
                </span>
                <span className="text-[10px] text-gray-400">OVR</span>
              </div>
              <span className="text-[10px] text-gray-400 block truncate">
                {opponentPick.position} • {opponentPick.nationality}
              </span>
            </div>
          </div>
        </div>

        {/* Concise Comparison Stats Table */}
        <div className="bg-[#0a0e14] rounded-lg border border-[#1c2535] overflow-hidden text-xs font-display">
          <table className="w-full text-left">
            <tbody>
              <tr className="bg-white/[0.01]">
                <td className="py-2 px-3.5 text-gray-400 font-display">Overall Rating</td>
                <td className="py-2 px-3.5 text-center font-bold text-white">{userPick.overall}</td>
                <td className="py-2 px-3.5 text-center font-bold text-gray-400">{opponentPick.overall}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Progression Notification */}
        <div className="p-2.5 rounded bg-white/5 border border-white/5 flex items-center justify-between text-xs font-display">
          <span className="text-gray-300 flex items-center gap-1.5">
            <Check size={14} className="text-emerald-400" />
            <span><strong>{userSurname}</strong> added to your Bayern XI</span>
          </span>
          <span className="text-gray-400 uppercase font-bold text-[10px]">
            {userPick.position} SLOT
          </span>
        </div>

        {/* Continue Action Button */}
        <button
          onClick={onContinue}
          autoFocus
          className="w-full py-3.5 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] group/btn focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <span>{isLastRound ? "VIEW FINAL BAYERN XI" : "CONTINUE TO NEXT ROUND"}</span>
          <ArrowRight size={17} className="transition-transform duration-200 ease-out group-hover/btn:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
