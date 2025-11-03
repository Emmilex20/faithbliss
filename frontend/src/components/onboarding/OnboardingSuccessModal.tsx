import { Heart, Sparkles } from 'lucide-react';

export const OnboardingSuccessModal = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-3xl shadow-2xl p-8 text-center max-w-md w-full border border-gray-700">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">You&apos;re In!</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Your profile is ready. Now it&apos;s time to explore, connect, and maybe even find the one God has written into your story.
          </p>
          <p className="text-sm text-gray-400">
            Taking you to your dashboard...
          </p>
        </div>
        <div className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 animate-spin" />
          Starting Your Journey
        </div>
      </div>
    </div>
  );
};