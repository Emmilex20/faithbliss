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
  noProfilesTitle?: string;
  noProfilesDescription?: string;
  noProfilesActionLabel?: string;
  onNoProfilesAction?: () => void;
}

export const ProfileDisplay = ({
  currentProfile,
  onStartOver,
  onGoBack,
  onLike,
  onPass,
  onMessage,
  noProfilesTitle,
  noProfilesDescription,
  noProfilesActionLabel,
  onNoProfilesAction
}: ProfileDisplayProps) => {
    
    // Check if profile is null, undefined, or missing a critical ID
    if (!currentProfile || (!currentProfile.id && !(currentProfile as any)._id)) {
        // Log an error if the object exists but is malformed
        if (currentProfile) {
            console.error("ProfileDisplay: Profile object exists but is missing 'id' or '_id'. Skipping card render.");
        }
        // Fall back to the "No Profiles" state, which will eventually be replaced
        // by the logic in DashboardPage advancing to the next profile.
        return (
          <NoProfilesState
            title={noProfilesTitle}
            description={noProfilesDescription}
            actionLabel={noProfilesActionLabel}
            onAction={onNoProfilesAction}
            onStartOver={onStartOver}
          />
        );
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
