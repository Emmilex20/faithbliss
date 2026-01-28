interface NoProfilesStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  onStartOver?: () => void;
}

export const NoProfilesState = ({
  title = "No more profiles!",
  description = "Check back later for new matches",
  actionLabel = "Start Over",
  onAction,
  onStartOver
}: NoProfilesStateProps) => {
  const action = onAction || onStartOver;
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">??</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action}
          className="bg-pink-600 hover:bg-pink-500 px-6 py-2 rounded-full transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};