import type { ProfileData } from '@/types/profile';

interface PassionsSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const PassionsSection = ({ profileData, setProfileData }: PassionsSectionProps) => {
  const availablePassions = [
    'Faith & Spirituality', 'Design & Creativity', 'Social Impact', 'Travel', 'Music & Worship',
    'Reading', 'Fitness & Health', 'Cooking', 'Photography', 'Technology', 'Art', 'Sports',
    'Volunteering', 'Nature & Outdoors', 'Fashion', 'Dancing', 'Movies & TV', 'Gaming'
  ];

  const togglePassion = (passion: string) => {
    const newHobbies = (profileData.hobbies || []).includes(passion)
      ? (profileData.hobbies || []).filter((p: string) => p !== passion)
      : [...(profileData.hobbies || []), passion];
    setProfileData(prev => prev ? ({...prev, hobbies: newHobbies}) : null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Passions</h2>
          <p className="text-gray-400">Select up to 5 things you&apos;re passionate about</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availablePassions.map(passion => (
            <button
              key={passion}
              onClick={() => togglePassion(passion)}
              className={`p-3 rounded-xl font-medium transition-all text-center border-2 ${
                profileData.hobbies && profileData.hobbies.includes(passion)
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-transparent hover:border-gray-500/50'
              }`}
            >
              {passion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassionsSection;
