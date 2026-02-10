import { ArrowLeft, Heart, X } from 'lucide-react';

interface FloatingActionButtonsProps {
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
}

export const FloatingActionButtons = ({ onGoBack, onPass, onLike }: FloatingActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <button
        onClick={onGoBack}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-500/60 bg-slate-700/70 text-white transition hover:scale-105 hover:bg-slate-600"
        aria-label="Go back"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <button
        onClick={onPass}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-rose-300/70 bg-rose-500/80 text-white shadow-lg shadow-rose-900/30 transition hover:scale-105 hover:bg-rose-500"
        aria-label="Pass"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={onLike}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-fuchsia-200/80 bg-fuchsia-500/85 text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-105 hover:bg-fuchsia-500"
        aria-label="Like"
      >
        <Heart className="h-5 w-5" />
      </button>
    </div>
  );
};
