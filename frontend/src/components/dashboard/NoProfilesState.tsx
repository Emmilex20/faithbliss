interface NoProfilesStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onStartOver?: () => void;
}

export const NoProfilesState = ({
  title = "No new profiles right now",
  description = "You are all caught up for the moment. New people will appear here as soon as they join or become available.",
  actionLabel = "Reload Profiles",
  onAction,
  onStartOver
}: NoProfilesStateProps) => {
  const action = onAction || onStartOver;
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-pink-400/40 bg-pink-500/15 text-3xl">
        ✨
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
      <p className="mb-5 text-sm leading-relaxed text-slate-300">{description}</p>
      {action && (
        <button
          onClick={action}
          className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 py-2.5 font-semibold text-white transition hover:from-pink-400 hover:to-fuchsia-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
