import type { ProfileData } from '@/types/profile';

interface FaithSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const FaithSection = ({ profileData, setProfileData }: FaithSectionProps) => (
  <div className="space-y-6">
    <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-6">Faith Journey</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Denomination</label>
          <select
            value={profileData.denomination}
            onChange={(e) => setProfileData(prev => prev ? ({...prev, denomination: e.target.value as 'BAPTIST' | 'METHODIST' | 'PRESBYTERIAN' | 'PENTECOSTAL' | 'CATHOLIC' | 'ORTHODOX' | 'ANGLICAN' | 'LUTHERAN' | 'ASSEMBLIES_OF_GOD' | 'SEVENTH_DAY_ADVENTIST' | 'OTHER'}) : null)}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="BAPTIST">Baptist</option>
            <option value="METHODIST">Methodist</option>
            <option value="PRESBYTERIAN">Presbyterian</option>
            <option value="PENTECOSTAL">Pentecostal</option>
            <option value="CATHOLIC">Catholic</option>
            <option value="ORTHODOX">Orthodox</option>
            <option value="ANGLICAN">Anglican</option>
            <option value="LUTHERAN">Lutheran</option>
            <option value="ASSEMBLIES_OF_GOD">Assemblies of God</option>
            <option value="SEVENTH_DAY_ADVENTIST">Seventh-day Adventist</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Faith Journey Stage</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'GROWING',
              'ESTABLISHED',
              'SEEKING'
            ].map(stage => (
              <button
                key={stage}
                onClick={() => setProfileData(prev => prev ? ({...prev, faithJourney: stage as 'GROWING' | 'ESTABLISHED' | 'SEEKING'}) : null)}
                className={`p-4 rounded-2xl font-medium transition-all ${
                  profileData.faithJourney && profileData.faithJourney === stage
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {stage === 'GROWING' ? 'Growing in Faith 🌿' : stage === 'ESTABLISHED' ? 'Rooted & Steady 🪴' : 'Seeking Faith 🌱'}
              </button>
            ))}
          </div>
        </div>



        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Favorite Bible Verse</label>
          <textarea
            value={profileData.favoriteVerse}
            onChange={(e) => setProfileData(prev => prev ? ({...prev, favoriteVerse: e.target.value}) : null)}
            rows={3}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 resize-none focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="Share a verse that speaks to your heart..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Looking For</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              'RELATIONSHIP',
              'FRIENDSHIP',
              'NETWORKING'
            ].map(goal => (
              <button
                key={goal}
                onClick={() => setProfileData(prev => {
                  if (!prev) return null;
                  const currentGoals = prev.lookingFor || [];
                  const newGoals = currentGoals.includes(goal)
                    ? currentGoals.filter(item => item !== goal)
                    : [...currentGoals, goal];
                  return { ...prev, lookingFor: newGoals };
                })}
                className={`p-4 rounded-2xl font-medium transition-all ${
                  profileData.lookingFor?.includes(goal)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {goal === 'RELATIONSHIP' ? 'Dating with Purpose 💕' : goal === 'FRIENDSHIP' ? 'Christian Friendship 💫' : 'Networking 🤝'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FaithSection;
