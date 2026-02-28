import { Heart, X } from 'lucide-react';

interface FloatingActionButtonsProps {
  onGoBack: () => void;
  onPass: () => void;
  onLike: () => void;
}

export const FloatingActionButtons = ({ onGoBack: _onGoBack, onPass, onLike }: FloatingActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5">
      <button
        onClick={onPass}
        className="group inline-flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border border-black/5 bg-white text-slate-950 shadow-[0_18px_34px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(15,23,42,0.18)] active:translate-y-0"
        aria-label="Pass"
      >
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.24)]">
          <span className="absolute inset-[1px] rounded-[1.05rem] border border-white/10" />
          <X className="relative h-5.5 w-5.5 text-white stroke-[2.8] transition-transform duration-200 group-hover:scale-105" />
        </span>
      </button>

      <button
        onClick={onLike}
        className="group inline-flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border border-black/5 bg-white text-slate-950 shadow-[0_18px_34px_rgba(15,23,42,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_38px_rgba(15,23,42,0.18)] active:translate-y-0"
        aria-label="Like"
      >
        <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-[0_10px_20px_rgba(236,72,153,0.34)]">
          <span className="absolute inset-[1px] rounded-[1.05rem] bg-gradient-to-br from-white/18 to-transparent" />
          <Heart className="relative h-5.5 w-5.5 fill-white text-white stroke-[2.4] transition-transform duration-200 group-hover:scale-105" />
        </span>
      </button>
    </div>
  );
};
