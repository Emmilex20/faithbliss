import type { ProfileData } from "@/types/profile";

interface BasicInfoSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

const BasicInfoSection = ({ profileData, setProfileData }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 rounded-3xl p-8 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Gender</label>
            <select
              value={profileData.gender || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, gender: e.target.value as 'MALE' | 'FEMALE'}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">First Name</label>
            <input
              type="text"
              value={profileData.name || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, name: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Age</label>
            <input
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, age: parseInt(e.target.value)}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="25"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Job Title</label>
            <input
              type="text"
              value={profileData.profession || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, profession: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Product Designer"
            />
          </div>



          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Education</label>
            <select
              value={profileData.fieldOfStudy || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, fieldOfStudy: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select education</option>
              <option value="High School">High School</option>
              <option value="Some College">Some College</option>
              <option value="University Graduate">University Graduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">Location</label>
          <div className="relative">
            <input
              type="text"
              value={profileData.location?.address || ''}
              onChange={(e) => setProfileData(prev => prev ? ({
                ...prev,
                location: {
                  ...(prev.location || { latitude: 0, longitude: 0, address: '' }),
                  address: e.target.value
                }
              }) : null)}
              className="w-full p-4 pr-12 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Lagos, Nigeria"
            />
            <button
              onClick={async () => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    async (position) => {
                      try {
                        const { latitude, longitude } = position.coords;
                        // Use reverse geocoding to get location name
                        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                        const data = await response.json();
                        const address = `${data.city}, ${data.countryName}`;
                        setProfileData(prev => prev ? ({...prev, location: { latitude, longitude, address }}) : null);
                      } catch (error) {
                        console.error('Error getting location:', error);
                        alert('Unable to get your location. Please enter it manually.');
                      }
                    },
                    (error) => {
                      console.error('Geolocation error:', error);
                      alert('Location access denied. Please enter your location manually.');
                    }
                  );
                } else {
                  alert('Geolocation is not supported by this browser.');
                }
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 rounded-lg transition-colors"
              title="Detect my location"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoSection;
