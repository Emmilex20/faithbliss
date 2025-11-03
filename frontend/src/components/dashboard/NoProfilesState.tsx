interface NoProfilesStateProps {
  onStartOver: () => void;
}

export const NoProfilesState = ({ onStartOver }: NoProfilesStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">💫</div>
      <h2 className="text-2xl font-bold mb-2">No more profiles!</h2>
      <p className="text-gray-400 mb-4">Check back later for new matches</p>
      <button
        onClick={onStartOver}
        className="bg-pink-600 hover:bg-pink-500 px-6 py-2 rounded-full transition-colors"
      >
        Start Over
      </button>
    </div>
  );
};