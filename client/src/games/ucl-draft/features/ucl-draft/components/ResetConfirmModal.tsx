import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  draftedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  draftedCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#081923] border border-[#DCE3EA] dark:border-[#162E3D] rounded-2xl shadow-2xl p-6 space-y-5 text-[#172638] dark:text-[#E6F0F6]">
        {/* Warning Icon & Title */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-black text-lg uppercase text-[#172638] dark:text-white">
              Reset Starting XI?
            </h3>
            <p className="text-xs text-[#697789] dark:text-[#6A889C] mt-1 leading-relaxed">
              You currently have <strong className="text-[#172638] dark:text-white">{draftedCount} player(s)</strong> drafted. Resetting will clear all positions and restart the European challenge from scratch.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold font-heading uppercase text-[#697789] dark:text-[#6A889C] hover:text-[#172638] dark:hover:text-white bg-[#F6F8FA] dark:bg-[#0B1E2B] border border-[#DCE3EA] dark:border-[#162E3D] btn-lift cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl text-xs font-bold font-heading uppercase text-white bg-red-600 hover:bg-red-700 active:scale-98 shadow-xs btn-lift cursor-pointer"
          >
            Yes, Reset Lineup
          </button>
        </div>
      </div>
    </div>
  );
};
