import type React from 'react';
import type { ProfileData } from '@/types/profile';
import AppDropdown from '@/components/AppDropdown';

interface FaithSectionProps {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData | null>>;
}

type FaithJourneyValue = NonNullable<ProfileData['faithJourney']>;

const CHURCH_ATTENDANCE_OPTIONS = [
  { value: '', label: 'Select attendance' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'RARELY', label: 'Rarely' },
  { value: 'OCCASIONALLY', label: 'Occasionally' },
];

const BAPTISM_STATUS_OPTIONS = [
  { value: '', label: 'Select status' },
  { value: 'BAPTIZED', label: 'Baptized' },
  { value: 'NOT_BAPTIZED', label: 'Not baptized' },
  { value: 'PENDING', label: 'Planning to be baptized' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const DENOMINATION_OPTIONS = [
  { value: '', label: 'Select denomination' },
  { value: 'BAPTIST', label: 'Baptist' },
  { value: 'METHODIST', label: 'Methodist' },
  { value: 'PRESBYTERIAN', label: 'Presbyterian' },
  { value: 'PENTECOSTAL', label: 'Pentecostal' },
  { value: 'CATHOLIC', label: 'Catholic' },
  { value: 'ORTHODOX', label: 'Orthodox' },
  { value: 'ANGLICAN', label: 'Anglican' },
  { value: 'LUTHERAN', label: 'Lutheran' },
  { value: 'ASSEMBLIES_OF_GOD', label: 'Assemblies of God' },
  { value: 'SEVENTH_DAY_ADVENTIST', label: 'Seventh-day Adventist' },
  { value: 'OTHER', label: 'Other' },
];

const FAITH_JOURNEY_STAGE_OPTIONS: Array<{ value: FaithJourneyValue; label: string }> = [
  { value: 'PASSIONATE', label: 'Passionate Believer' },
  { value: 'ROOTED', label: 'Rooted & Steady' },
  { value: 'GROWING', label: 'Growing in Faith' },
  { value: 'ESTABLISHED', label: 'Established & Grounded' },
  { value: 'SEEKING', label: 'Seeking Faith' },
];

export const FaithSection = ({ profileData, setProfileData }: FaithSectionProps) => (
  <div className="space-y-6">
    <div className="rounded-3xl border border-gray-700/50 bg-gray-800/50 p-8">
      <h2 className="mb-6 text-2xl font-bold text-white">Faith Journey</h2>

      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-300">Church Attendance</label>
          <AppDropdown
            value={profileData.churchAttendance || profileData.sundayActivity || ''}
            onChange={(next) =>
              setProfileData((prev) => (prev ? ({ ...prev, churchAttendance: next as ProfileData['churchAttendance'] }) : null))
            }
            options={CHURCH_ATTENDANCE_OPTIONS}
            placeholder="Select attendance"
            triggerClassName="w-full rounded-2xl border border-gray-600/50 bg-gray-700/50 p-4 text-white transition-colors focus:border-pink-500"
            menuClassName="border-gray-600/60 bg-slate-900/98"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-300">Baptism Status</label>
          <AppDropdown
            value={profileData.baptismStatus || ''}
            onChange={(next) =>
              setProfileData((prev) => (prev ? ({ ...prev, baptismStatus: next as ProfileData['baptismStatus'] }) : null))
            }
            options={BAPTISM_STATUS_OPTIONS}
            placeholder="Select status"
            triggerClassName="w-full rounded-2xl border border-gray-600/50 bg-gray-700/50 p-4 text-white transition-colors focus:border-pink-500"
            menuClassName="border-gray-600/60 bg-slate-900/98"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-300">Denomination</label>
          <AppDropdown
            value={profileData.denomination || ''}
            onChange={(next) =>
              setProfileData((prev) =>
                prev
                  ? ({
                      ...prev,
                      denomination: next as ProfileData['denomination'],
                    })
                  : null
              )
            }
            options={DENOMINATION_OPTIONS}
            placeholder="Select denomination"
            searchable
            searchPlaceholder="Search denomination..."
            triggerClassName="w-full rounded-2xl border border-gray-600/50 bg-gray-700/50 p-4 text-white transition-colors focus:border-pink-500"
            menuClassName="border-gray-600/60 bg-slate-900/98"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-300">Faith Journey Stage</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {FAITH_JOURNEY_STAGE_OPTIONS.map((stage) => (
              <button
                key={stage.value}
                onClick={() => setProfileData((prev) => (prev ? ({ ...prev, faithJourney: stage.value }) : null))}
                className={`p-4 rounded-2xl font-medium transition-all ${
                  profileData.faithJourney === stage.value
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
          <label className="mb-3 block text-sm font-semibold text-gray-300">Spiritual Gifts</label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                onClick={() =>
                  setProfileData((prev) => {
                    if (!prev) return null;
                    const current = prev.spiritualGifts || [];
                    const next = current.includes(gift) ? current.filter((item) => item !== gift) : [...current, gift];
                    return { ...prev, spiritualGifts: next };
                  })
                }
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
          <label className="mb-3 block text-sm font-semibold text-gray-300">Favorite Bible Verse</label>
          <textarea
            value={profileData.favoriteVerse || ''}
            onChange={(e) => setProfileData((prev) => (prev ? ({ ...prev, favoriteVerse: e.target.value }) : null))}
            rows={3}
            className="w-full p-4 bg-gray-700/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 resize-none focus:border-pink-500 focus:outline-none transition-colors"
            placeholder="Share a verse that speaks to your heart..."
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-300">Looking For</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { value: 'MARRIAGE_MINDED', label: 'Marriage Minded' },
              { value: 'RELATIONSHIP', label: 'Dating with Purpose' },
              { value: 'FRIENDSHIP', label: 'Christian Friendship' },
            ].map((goal) => (
              <button
                key={goal.value}
                onClick={() =>
                  setProfileData((prev) => {
                    if (!prev) return null;
                    const currentGoals = prev.lookingFor || [];
                    const nextGoals = currentGoals.includes(goal.value)
                      ? currentGoals.filter((item) => item !== goal.value)
                      : [...currentGoals, goal.value];
                    return { ...prev, lookingFor: nextGoals };
                  })
                }
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
