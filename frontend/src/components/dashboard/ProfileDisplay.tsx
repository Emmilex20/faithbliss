/* eslint-disable no-irregular-whitespace */
import { HingeStyleProfileCard } from './HingeStyleProfileCard';
import { NoProfilesState } from './NoProfilesState';
import type { User } from '@/services/api';

interface ProfileDisplayProps {
  currentProfile: User | null | undefined;
  onStartOver: () => void;
  onGoBack: () => void;
  onLike: () => void;
  onPass: () => void;
  onMessage: () => void;
}

export const ProfileDisplay = ({
  currentProfile,
  onStartOver,
  onGoBack,
  onLike,
  onPass,
  onMessage
}: ProfileDisplayProps) => {
    
    // Check if profile is null, undefined, or missing a critical ID
    if (!currentProfile || (!currentProfile.id && !currentProfile.id)) {
        // Log an error if the object exists but is malformed
        if (currentProfile) {
            console.error("ProfileDisplay: Profile object exists but is missing 'id' or '_id'. Skipping card render.");
        }
        // Fall back to the "No Profiles" state, which will eventually be replaced
        // by the logic in DashboardPage advancing to the next profile.
        return <NoProfilesState onStartOver={onStartOver} />;
    }

  return (
    <>
      <HingeStyleProfileCard 
        profile={currentProfile} 
        onGoBack={onGoBack}
        onLike={onLike}
        onPass={onPass}
        onMessage={onMessage}
      />
    </>
  );
};