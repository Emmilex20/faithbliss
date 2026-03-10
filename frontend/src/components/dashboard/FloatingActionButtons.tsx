import { Heart, X } from 'lucide-react';

interface FloatingActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
}

export const FloatingActionButtons = ({ onPass, onLike }: FloatingActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      <button
        onClick={onPass}
        className="group inline-flex h-[4.3rem] w-[4.3rem] items-center justify-center rounded-full border border-white/12 bg-white/5 text-slate-950 shadow-[0_14px_28px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/8 active:translate-y-0"
        aria-label="Pass"
      >
        <span className="relative inline-flex h-[3.05rem] w-[3.05rem] items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-[0_10px_20px_rgba(15,23,42,0.2)]">
          <span className="absolute inset-[1px] rounded-[1.05rem] border border-white/12" />
          <X className="relative h-5.5 w-5.5 text-white stroke-[2.7] transition-transform duration-200 group-hover:scale-105" />
        </span>
      </button>

      <button
        onClick={onLike}
        className="group inline-flex h-[4.3rem] w-[4.3rem] items-center justify-center rounded-full border border-pink-300/20 bg-white/5 text-slate-950 shadow-[0_16px_32px_rgba(236,72,153,0.16)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/8 active:translate-y-0"
        aria-label="Like"
      >
        <span className="relative inline-flex h-[3.05rem] w-[3.05rem] items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-[0_10px_18px_rgba(236,72,153,0.24)]">
          <span className="absolute inset-[1px] rounded-[1.08rem] bg-gradient-to-br from-white/18 to-transparent" />
          <Heart className="relative h-5.25 w-5.25 fill-white text-white stroke-[2.2] transition-transform duration-200 group-hover:scale-105" />
        </span>
      </button>
    </div>
  );
};
