import { HingeStyleProfileCard } from './HingeStyleProfileCard';
import { NoProfilesState } from './NoProfilesState';
import type { User } from '@/services/api';

interface ProfileDisplayProps {
  currentProfile: User | null | undefined;
  onStartOver: () => void;
  onGoBack: () => void;
  onLike: () => void;
  onPass: () => void;
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
  noProfilesTitle,
  noProfilesDescription,
  noProfilesActionLabel,
  onNoProfilesAction,
}: ProfileDisplayProps) => {
  if (!currentProfile || (!currentProfile.id && !(currentProfile as any)._id)) {
    if (currentProfile) {
      console.error("ProfileDisplay: Profile object exists but is missing 'id' or '_id'. Skipping card render.");
    }

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
      <HingeStyleProfileCard profile={currentProfile} onGoBack={onGoBack} onLike={onLike} onPass={onPass} />
    </>
  );
};
