import React from 'react';
import { X, Shield, Info, Heart } from 'lucide-react';
import BayernCrest from './BayernCrest';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm modal-backdrop-animate">
      <div className="w-full max-w-lg bg-[#121824] rounded-xl border border-[#1c2535] shadow-2xl p-6 sm:p-8 space-y-6 text-left modal-content-animate">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#1c2535] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0">
              <BayernCrest className="w-full h-full" />
            </div>
            <div>
              <span className="text-xs font-display font-bold uppercase text-[#dc052d] tracking-widest block">
                FAN INITIATIVE
              </span>
              <h2 className="font-display font-bold text-2xl text-white uppercase tracking-tight">
                About FC Bayern Games
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#dc052d]/70"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm text-gray-300 leading-relaxed font-display">
          <p>
            <strong>FC Bayern Games</strong> is an independent, fan-crafted interactive gaming platform celebrating the history, legends, and unforgettable moments of FC Bayern München.
          </p>

          <div className="p-4 rounded-lg bg-[#0a0e14] border border-[#1c2535] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-white font-bold uppercase font-display">
              <Shield size={16} className="text-[#dc052d]" />
              Authentic Club Records
            </div>
            <p className="text-gray-400">
              Every player profile, match statistic, appearance total, and trophy honor featured across our games is verified against official historical club records.
            </p>
          </div>

          <p className="text-xs text-gray-400 italic">
            Disclaimer: This is a non-commercial educational and portfolio project. It is not affiliated with, authorized, maintained, sponsored, or endorsed by FC Bayern München AG or any of its affiliates.
          </p>
        </div>

        {/* Close Action */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-lg bg-[#dc052d] hover:bg-[#b80425] text-white font-display font-bold text-sm tracking-wider uppercase transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
