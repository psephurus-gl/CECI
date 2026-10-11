import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/** Floating confirmation message pinned to the bottom-right corner. */
export const Toast: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-stone-900 border-2 border-stone-700 text-white text-xs font-bold shadow-2xl"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
};
