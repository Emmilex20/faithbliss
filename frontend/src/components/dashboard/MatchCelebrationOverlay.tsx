import { AnimatePresence, motion } from 'framer-motion';

type MatchCelebrationOverlayProps = {
  open: boolean;
  currentUserName: string;
  currentUserPhoto?: string;
  matchedUserName: string;
  matchedUserPhoto?: string;
  onChat: () => void;
  onContinue: () => void;
};

const PARTICLES = [
  { emoji: '\u{1F496}', top: '12%', left: '12%', delay: 0.0 },
  { emoji: '\u2728', top: '16%', left: '84%', delay: 0.15 },
  { emoji: '\u{1F389}', top: '28%', left: '6%', delay: 0.25 },
  { emoji: '\u{1F970}', top: '30%', left: '88%', delay: 0.35 },
  { emoji: '\u{1F498}', top: '70%', left: '10%', delay: 0.1 },
  { emoji: '\u{1F525}', top: '74%', left: '86%', delay: 0.2 },
  { emoji: '\u{1F49E}', top: '85%', left: '22%', delay: 0.3 },
  { emoji: '\u2B50', top: '88%', left: '76%', delay: 0.4 },
];

export function MatchCelebrationOverlay({
  open,
  currentUserName,
  currentUserPhoto,
  matchedUserName,
  matchedUserPhoto,
  onChat,
  onContinue,
}: MatchCelebrationOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center overflow-hidden bg-slate-950/75 px-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {PARTICLES.map((item, index) => (
            <motion.span
              key={`${item.emoji}-${index}`}
              className="pointer-events-none absolute select-none text-3xl sm:text-4xl"
              style={{ top: item.top, left: item.left }}
              initial={{ opacity: 0, y: 16, scale: 0.6 }}
              animate={{ opacity: [0, 1, 1, 0], y: [12, -28, -80], scale: [0.6, 1, 1.2] }}
              transition={{ duration: 2.6, delay: item.delay, ease: 'easeOut' }}
            >
              {item.emoji}
            </motion.span>
          ))}

          <motion.div
            className="relative w-full max-w-xl rounded-3xl border border-pink-300/25 bg-gradient-to-br from-fuchsia-600/30 via-pink-500/25 to-rose-500/25 p-7 text-center shadow-[0_20px_80px_rgba(236,72,153,0.35)]"
            initial={{ scale: 0.86, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 8, opacity: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            <motion.div
              className="mx-auto mb-3 inline-flex rounded-full bg-white/15 px-4 py-1 text-sm font-semibold text-pink-100"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              New Connection Unlocked
            </motion.div>

            <motion.h2
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.24 }}
            >
              It&apos;s a Match!
            </motion.h2>

            <motion.p
              className="mt-3 text-sm text-pink-50/90 sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18, duration: 0.2 }}
            >
              You and {matchedUserName || 'your new match'} liked each other.
            </motion.p>

            <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-pink-200/80 bg-slate-800 sm:h-24 sm:w-24">
                  {currentUserPhoto ? (
                    <img src={currentUserPhoto} alt={currentUserName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/80">
                      {(currentUserName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="max-w-[7rem] truncate text-xs font-semibold text-white/90 sm:text-sm">{currentUserName}</p>
              </div>

              <motion.div
                className="text-3xl sm:text-4xl"
                animate={{ scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.3, ease: 'easeInOut' }}
              >
                {'\u2764\uFE0F'}
              </motion.div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-pink-200/80 bg-slate-800 sm:h-24 sm:w-24">
                  {matchedUserPhoto ? (
                    <img src={matchedUserPhoto} alt={matchedUserName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/80">
                      {(matchedUserName || 'M').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="max-w-[7rem] truncate text-xs font-semibold text-white/90 sm:text-sm">{matchedUserName}</p>
              </div>
            </div>

            <div className="mt-7 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onContinue}
                className="rounded-full border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={onChat}
                className="rounded-full bg-pink-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-400"
              >
                Chat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

