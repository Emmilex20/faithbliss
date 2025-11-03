interface SaveButtonProps {
  isSaving: boolean;
  saveMessage: string;
  handleSave: () => void;
}

const SaveButton = ({ isSaving, saveMessage, handleSave }: SaveButtonProps) => (
  <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-6 backdrop-blur-xl border-t border-gray-700/30">
    <div className="max-w-6xl mx-auto">
      {saveMessage && (
        <div className={`mb-4 p-3 rounded-xl text-center font-medium ${
          saveMessage.includes('Error') 
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-green-500/20 text-green-300 border border-green-500/30'
        }`}>
          {saveMessage}
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        {isSaving ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Saving Profile...
          </div>
        ) : (
          'Save Changes'
        )}
      </button>
    </div>
  </div>
);

export default SaveButton;
