import { Heart, X } from 'lucide-react';

interface FloatingActionButtonsProps {
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
}

export const FloatingActionButtons = ({ onGoBack: _onGoBack, onPass, onLike }: FloatingActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      <button
        onClick={onPass}
        className="group relative inline-flex h-14 min-w-[128px] items-center justify-center gap-2 rounded-2xl border border-rose-200/65 bg-gradient-to-br from-rose-500/90 via-rose-500/80 to-orange-500/85 px-5 text-white shadow-[0_12px_26px_rgba(244,63,94,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_16px_28px_rgba(244,63,94,0.45)] active:translate-y-0 active:scale-100"
        aria-label="Pass"
      >
        <span className="absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/15">
          <X className="h-4 w-4" />
        </span>
        <span className="relative text-sm font-bold uppercase tracking-wide">Pass</span>
      </button>

      <button
        onClick={onLike}
        className="group relative inline-flex h-14 min-w-[128px] items-center justify-center gap-2 rounded-2xl border border-fuchsia-100/70 bg-gradient-to-br from-fuchsia-500/90 via-pink-500/85 to-violet-500/90 px-5 text-white shadow-[0_12px_26px_rgba(217,70,239,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_16px_28px_rgba(217,70,239,0.45)] active:translate-y-0 active:scale-100"
        aria-label="Like"
      >
        <span className="absolute inset-0 rounded-2xl bg-white/0 transition-colors duration-200 group-hover:bg-white/10" />
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/15">
          <Heart className="h-4 w-4 fill-current" />
        </span>
        <span className="relative text-sm font-bold uppercase tracking-wide">Like</span>
      </button>
    </div>
  );
};
