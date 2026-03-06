import type { User } from '@/services/api';
import type { DashboardFilterFocusSection } from './FilterPanel';
import { SwipeDeck } from './SwipeDeck';

interface ProfileDisplayProps {
  currentProfile: User | null | undefined;
  profileQueue?: User[];
  viewerLatitude?: number;
  viewerLongitude?: number;
  onStartOver: () => void;
  onGoBack: () => void;
  onLike: () => void;
  onPass: () => void;
  noProfilesTitle?: string;
  noProfilesDescription?: string;
  noProfilesActionLabel?: string;
  onNoProfilesAction?: () => void;
  noProfilesSecondaryActionLabel?: string;
  onNoProfilesSecondaryAction?: () => void;
  onOpenFilterSection?: (section: DashboardFilterFocusSection) => void;
}

export const ProfileDisplay = ({
  currentProfile,
  profileQueue,
  viewerLatitude,
  viewerLongitude,
  onStartOver,
  onGoBack,
  onLike,
  onPass,
  noProfilesTitle,
  noProfilesDescription,
  noProfilesActionLabel,
  onNoProfilesAction,
  noProfilesSecondaryActionLabel,
  onNoProfilesSecondaryAction,
  onOpenFilterSection,
}: ProfileDisplayProps) => {
  const resolvedQueue =
    Array.isArray(profileQueue) && profileQueue.length > 0
      ? profileQueue
      : currentProfile
      ? [currentProfile]
      : [];

  return (
    <div className="h-full w-full">
      <SwipeDeck
        profileQueue={resolvedQueue}
        viewerLatitude={viewerLatitude}
        viewerLongitude={viewerLongitude}
        onStartOver={onStartOver}
        onGoBack={onGoBack}
        onLike={onLike}
        onPass={onPass}
        noProfilesTitle={noProfilesTitle}
        noProfilesDescription={noProfilesDescription}
        noProfilesActionLabel={noProfilesActionLabel}
        onNoProfilesAction={onNoProfilesAction}
        noProfilesSecondaryActionLabel={noProfilesSecondaryActionLabel}
        onNoProfilesSecondaryAction={onNoProfilesSecondaryAction}
        onOpenFilterSection={onOpenFilterSection}
      />
    </div>
  );
};
