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
          <label className="block text-sm font-semibold text-gray-300 mb-3">Church Attendance</label>
          <select
            value={profileData.churchAttendance || profileData.sundayActivity || ''}
            onChange={(e) => setProfileData(prev => prev ? ({...prev, churchAttendance: e.target.value as any}) : null)}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="">Select attendance</option>
            <option value="WEEKLY">Weekly</option>
            <option value="BI_WEEKLY">Bi-weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="RARELY">Rarely</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Baptism Status</label>
          <select
            value={profileData.baptismStatus || ''}
            onChange={(e) => setProfileData(prev => prev ? ({...prev, baptismStatus: e.target.value as any}) : null)}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="">Select status</option>
            <option value="BAPTIZED">Baptized</option>
            <option value="NOT_BAPTIZED">Not baptized</option>
            <option value="PENDING">Planning to be baptized</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Denomination</label>
          <select
            value={profileData.denomination || ''}
            onChange={(e) => setProfileData(prev => prev ? ({...prev, denomination: e.target.value as 'BAPTIST' | 'METHODIST' | 'PRESBYTERIAN' | 'PENTECOSTAL' | 'CATHOLIC' | 'ORTHODOX' | 'ANGLICAN' | 'LUTHERAN' | 'ASSEMBLIES_OF_GOD' | 'SEVENTH_DAY_ADVENTIST' | 'OTHER'}) : null)}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
          >
            <option value="">Select denomination</option>
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
              { value: 'PASSIONATE', label: 'Passionate Believer ✨' },
              { value: 'ROOTED', label: 'Rooted & Steady 🌿' },
              { value: 'GROWING', label: 'Growing in Faith 🌱' },
              { value: 'ESTABLISHED', label: 'Established & Grounded 🪨' },
              { value: 'SEEKING', label: 'Seeking Faith 🌾' },
            ].map(stage => (
              <button
                key={stage.value}
                onClick={() => setProfileData(prev => prev ? ({...prev, faithJourney: stage.value as any}) : null)}
                className={`p-4 rounded-2xl font-medium transition-all ${
                  profileData.faithJourney && profileData.faithJourney === stage.value
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Spiritual Gifts</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              'Teaching',
              'Serving',
              'Leadership',
              'Encouragement',
              'Giving',
              'Mercy',
              'Wisdom',
              'Faith',
              'Evangelism',
              'Hospitality',
              'Prayer',
              'Administration',
            ].map((gift) => (
              <button
                key={gift}
                onClick={() => setProfileData(prev => {
                  if (!prev) return null;
                  const current = prev.spiritualGifts || [];
                  const next = current.includes(gift)
                    ? current.filter(item => item !== gift)
                    : [...current, gift];
                  return { ...prev, spiritualGifts: next };
                })}
                className={`p-3 rounded-2xl font-medium transition-all text-sm ${
                  profileData.spiritualGifts?.includes(gift)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {gift}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Drinking Habit</label>
            <select
              value={profileData.drinkingHabit || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, drinkingHabit: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select drinking habit</option>
              <option value="Not for me">Not for me</option>
              <option value="Sober">Sober</option>
              <option value="On special occasions">On special occasions</option>
              <option value="Socially on weekends">Socially on weekends</option>
              <option value="Most Nights">Most Nights</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Smoking Habit</label>
            <select
              value={profileData.smokingHabit || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, smokingHabit: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select smoking habit</option>
              <option value="Non-smoker">Non-smoker</option>
              <option value="Social smoker">Social smoker</option>
              <option value="Smoker">Smoker</option>
              <option value="Trying to quit">Trying to quit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Workout Habit</label>
            <select
              value={profileData.workoutHabit || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, workoutHabit: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select workout habit</option>
              <option value="Everyday">Everyday</option>
              <option value="Often">Often</option>
              <option value="Sometimes">Sometimes</option>
              <option value="Never">Never</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Pet Preference</label>
            <select
              value={profileData.petPreference || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, petPreference: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select pet preference</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
              <option value="Don't have but love">Don&apos;t have but love</option>
              <option value="Pet-free">Pet-free</option>
              <option value="Want a pet">Want a pet</option>
              <option value="Allergic to pets">Allergic to pets</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-3">Looking For</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: 'MARRIAGE_MINDED', label: 'Marriage Minded 💍' },
              { value: 'RELATIONSHIP', label: 'Dating with Purpose 💞' },
              { value: 'FRIENDSHIP', label: 'Christian Friendship 🤝' },
              { value: 'NETWORKING', label: 'Networking 🌐' },
            ].map(goal => (
              <button
                key={goal.value}
                onClick={() => setProfileData(prev => {
                  if (!prev) return null;
                  const currentGoals = prev.lookingFor || [];
                  const newGoals = currentGoals.includes(goal.value)
                    ? currentGoals.filter(item => item !== goal.value)
                    : [...currentGoals, goal.value];
                  return { ...prev, lookingFor: newGoals };
                })}
                className={`p-4 rounded-2xl font-medium transition-all ${
                  profileData.lookingFor?.includes(goal.value)
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FaithSection;
