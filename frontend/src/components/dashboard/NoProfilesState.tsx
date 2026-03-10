interface NoProfilesStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onStartOver?: () => void;
}

export const NoProfilesState = ({
  title = 'No new profiles right now',
  description = 'You are all caught up for the moment. New people will appear here as soon as they join or become available.',
  actionLabel = 'Reload Profiles',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onStartOver,
}: NoProfilesStateProps) => {
  const action = onAction || onStartOver;

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-pink-400/40 bg-pink-500/15 text-3xl">
        ✨
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mb-5 text-sm leading-relaxed text-slate-300">{description}</p>
      <div className="flex flex-col items-center gap-3">
        {action && (
          <button
            onClick={action}
            className="min-w-[12rem] rounded-full border border-pink-300/20 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-[0_14px_28px_rgba(217,70,239,0.22)] transition hover:-translate-y-0.5 hover:from-pink-400 hover:via-fuchsia-400 hover:to-violet-400"
          >
            {actionLabel}
          </button>
        )}
        {onSecondaryAction && secondaryActionLabel && (
          <button
            onClick={onSecondaryAction}
            className="min-w-[12rem] rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
