import type { ProfileData } from "@/types/profile";
import { BIO_MAX_LENGTH, PROFILE_PROMPT_OPTIONS, PROMPT_ANSWER_MAX_LENGTH } from '@/constants/profilePrompts';

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

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Height</label>
            <input
              type="text"
              value={profileData.height || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, height: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder={`e.g., 5'9" or 175 cm`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Language</label>
            <input
              type="text"
              value={profileData.language || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, language: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="English"
            />
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Personal Prompt</label>
            <select
              value={profileData.personalPromptQuestion || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, personalPromptQuestion: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select a question</option>
              {PROFILE_PROMPT_OPTIONS.map((prompt) => (
                <option key={prompt} value={prompt}>
                  {prompt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Prompt Answer</label>
            <textarea
              value={profileData.personalPromptAnswer || ''}
              onChange={(e) =>
                setProfileData((prev) =>
                  prev
                    ? ({
                        ...prev,
                        personalPromptAnswer: e.target.value.slice(0, PROMPT_ANSWER_MAX_LENGTH),
                      })
                    : null
                )
              }
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors"
              placeholder="Your answer"
              rows={3}
            />
            <p className="mt-2 text-right text-xs text-gray-400">
              {(profileData.personalPromptAnswer?.length || 0)}/{PROMPT_ANSWER_MAX_LENGTH}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Communication Style</label>
            <select
              value={profileData.communicationStyle || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, communicationStyle: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select communication style</option>
              <option value="Big time texter">Big time texter</option>
              <option value="Phone caller">Phone caller</option>
              <option value="Video chatter">Video chatter</option>
              <option value="Bad texter">Bad texter</option>
              <option value="Better in person">Better in person</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Love Style</label>
            <select
              value={profileData.loveStyle || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, loveStyle: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select love style</option>
              <option value="Thoughtful gestures">Thoughtful gestures</option>
              <option value="Presents">Presents</option>
              <option value="Touch">Touch</option>
              <option value="Compliments">Compliments</option>
              <option value="Time together">Time together</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Education Level</label>
            <select
              value={profileData.educationLevel || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, educationLevel: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select education level</option>
              <option value="Bachelors">Bachelors</option>
              <option value="In College">In College</option>
              <option value="High School">High School</option>
              <option value="PhD">PhD</option>
              <option value="In Grad School">In Grad School</option>
              <option value="Masters">Masters</option>
              <option value="Trade School">Trade School</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">Zodiac Sign</label>
            <select
              value={profileData.zodiacSign || ''}
              onChange={(e) => setProfileData(prev => prev ? ({...prev, zodiacSign: e.target.value}) : null)}
              className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white focus:border-pink-500 focus:outline-none transition-colors"
            >
              <option value="">Select zodiac sign</option>
              <option value="Capricorn">Capricorn</option>
              <option value="Aquarius">Aquarius</option>
              <option value="Pisces">Pisces</option>
              <option value="Aries">Aries</option>
              <option value="Taurus">Taurus</option>
              <option value="Gemini">Gemini</option>
              <option value="Cancer">Cancer</option>
              <option value="Leo">Leo</option>
              <option value="Virgo">Virgo</option>
              <option value="Libra">Libra</option>
              <option value="Scorpio">Scorpio</option>
              <option value="Sagittarius">Sagittarius</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">About Me (Bio)</label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) =>
              setProfileData((prev) =>
                prev
                  ? ({
                      ...prev,
                      bio: e.target.value.slice(0, BIO_MAX_LENGTH),
                    })
                  : null
              )
            }
            rows={5}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 resize-none focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="Introduce yourself to make a strong impression."
          />
          <p className="mt-2 text-right text-xs text-gray-400">{(profileData.bio?.length || 0)}/{BIO_MAX_LENGTH}</p>
        </div>
      </div>
    </div>
  );
}

export default BasicInfoSection;
