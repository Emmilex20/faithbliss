import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast } from '@/contexts/ToastContext';

interface ToastItemProps {
  toast: Toast;
  onRemove: () => void;
}

const getSuccessEmoji = (text: string) => {
  const value = text.toLowerCase();
  if (value.includes('login') || value.includes('welcome')) return '\u{1F44B}';
  if (value.includes('payment') || value.includes('subscription')) return '\u{1F389}';
  if (value.includes('photo') || value.includes('upload')) return '\u{1F4F8}';
  if (value.includes('message') || value.includes('sent')) return '\u{1F4E9}';
  if (value.includes('saved') || value.includes('updated') || value.includes('settings')) return '\u{2705}';
  if (value.includes('story')) return '\u{1F31F}';
  return '\u{2728}';
};

type ToneMeta = {
  icon: React.ReactNode;
  toneClass: string;
  glowClass: string;
  iconWrapClass: string;
  iconClass: string;
  progressClass: string;
  emoji?: string;
};

const getToneMeta = (toast: Toast): ToneMeta => {
  if (toast.type === 'success') {
    const source = `${toast.title ?? ''} ${toast.message}`;
    return {
      icon: <CheckCircle2 className="h-[18px] w-[18px]" />,
      toneClass: 'border-emerald-300/30 bg-emerald-500/[0.07]',
      glowClass: 'shadow-[0_8px_24px_rgba(16,185,129,0.22)]',
      iconWrapClass: 'bg-emerald-400/18 border border-emerald-300/35',
      iconClass: 'text-emerald-200',
      progressClass: 'bg-gradient-to-r from-emerald-300 via-lime-200 to-emerald-300',
      emoji: getSuccessEmoji(source),
    };
  }
  if (toast.type === 'error') {
    return {
      icon: <XCircle className="h-[18px] w-[18px]" />,
      toneClass: 'border-rose-300/30 bg-rose-500/[0.07]',
      glowClass: 'shadow-[0_8px_24px_rgba(244,63,94,0.2)]',
      iconWrapClass: 'bg-rose-400/18 border border-rose-300/35',
      iconClass: 'text-rose-200',
      progressClass: 'bg-gradient-to-r from-rose-300 via-rose-200 to-rose-300',
    };
  }
  if (toast.type === 'warning') {
    return {
      icon: <AlertTriangle className="h-[18px] w-[18px]" />,
      toneClass: 'border-amber-300/30 bg-amber-500/[0.07]',
      glowClass: 'shadow-[0_8px_24px_rgba(245,158,11,0.2)]',
      iconWrapClass: 'bg-amber-400/18 border border-amber-300/35',
      iconClass: 'text-amber-200',
      progressClass: 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300',
    };
  }
  return {
    icon: <Info className="h-[18px] w-[18px]" />,
    toneClass: 'border-sky-300/30 bg-sky-500/[0.07]',
    glowClass: 'shadow-[0_8px_24px_rgba(14,165,233,0.2)]',
    iconWrapClass: 'bg-sky-400/18 border border-sky-300/35',
    iconClass: 'text-sky-200',
    progressClass: 'bg-gradient-to-r from-sky-300 via-cyan-200 to-sky-300',
  };
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const tone = useMemo(() => getToneMeta(toast), [toast]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove();
    }, 220);
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0 && !toast.persistent) {
      const autoCloseTimer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(autoCloseTimer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.persistent]);

  const shellClass = isLeaving
    ? 'translate-x-5 opacity-0 scale-[0.985]'
    : isVisible
      ? 'translate-x-0 opacity-100 scale-100'
      : 'translate-x-5 opacity-0 scale-[0.985]';

  const effectiveTitle = toast.title || (toast.type === 'success' ? 'Success' : undefined);
  const effectiveMessage =
    toast.type === 'success' && tone.emoji ? `${tone.emoji} ${toast.message}` : toast.message;

  return (
    <div
      className={`pointer-events-auto w-full transform transition-all duration-200 ease-out ${shellClass}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={[
          'relative overflow-hidden rounded-xl border backdrop-blur-xl',
          'bg-slate-900/92 text-white',
          'px-3.5 py-3',
          tone.toneClass,
          tone.glowClass,
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone.iconWrapClass}`}>
            <span className={tone.iconClass}>{tone.icon}</span>
          </div>

          <div className="min-w-0 flex-1">
            {effectiveTitle && (
              <h4 className="truncate text-[13px] font-semibold leading-tight text-white">
                {effectiveTitle}
              </h4>
            )}
            <p className="mt-0.5 break-words text-[13px] leading-relaxed text-white/85">
              {effectiveMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded-md p-1 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!toast.persistent && toast.duration && toast.duration > 0 && (
          <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full w-full origin-left ${tone.progressClass}`}
              style={{
                animation: `toast-progress ${toast.duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};
