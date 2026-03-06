/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { useToast } from '@/contexts/ToastContext'; 
import { DesktopLayout } from '@/components/dashboard/DesktopLayout';
import { MobileLayout } from '@/components/dashboard/MobileLayout';
import { ProfileDisplay } from '@/components/dashboard/ProfileDisplay';
import { OverlayPanels } from '@/components/dashboard/OverlayPanels';
import { StoryBar } from '@/components/dashboard/StoryBar';
import { PostOnboardingWelcomeOverlay } from '@/components/dashboard/PostOnboardingWelcomeOverlay';
import { type DashboardFiltersPayload } from '@/components/dashboard/FilterPanel';
import type { DashboardFilterFocusSection } from '@/components/dashboard/FilterPanel';
import { useProfileQueue } from '@/components/dashboard/useProfileQueue';
import { insertScrollbarStyles } from '@/components/dashboard/styles'; 
import { usePotentialMatches, useMatching, useStories, useUserProfile } from '@/hooks/useAPI'; 

import { API, type User } from '@/services/api'; 

// Insert scrollbar styles
insertScrollbarStyles();

const DASHBOARD_PASSED_PROFILES_STORAGE_KEY_PREFIX = 'faithbliss_dashboard_passed_profiles';

export const DashboardPage = ({ user: activeUser }: { user: User }) => {
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();
  const [showFilters, setShowFilters] = useState(false);
    const [filterFocusSection, setFilterFocusSection] = useState<DashboardFilterFocusSection | null>(null);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [showPostOnboardingOverlay, setShowPostOnboardingOverlay] = useState(false);
    const [filteredProfiles, setFilteredProfiles] = useState<User[] | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const pendingActionIdsRef = useRef<Set<string>>(new Set());
    const hasCompletedInitialLoadRef = useRef(false);
    const [showForcedOnboardingPrompt, setShowForcedOnboardingPrompt] = useState(false);
    const ONBOARDING_PAUSE_STORAGE_KEY = 'faithbliss_onboarding_pause_state';
    const [persistedPassedProfileIds, setPersistedPassedProfileIds] = useState<string[]>([]);
    const [isReviewingPassedProfiles, setIsReviewingPassedProfiles] = useState(false);

  // Fetch real potential matches from backend
  const { 
    data: profiles, 
    loading: matchesLoading, 
    error: matchesError, 
    refetch 
  } = usePotentialMatches();

  // Note: userProfile is now fetching the currently logged-in user's *latest* profile data
  const { data: userProfile, loading: userLoading } = useUserProfile(); 

    const { likeUser, passUser } = useMatching();
    const { stories, loading: storiesLoading, createStory, markStorySeen, likeStory, getStoryLikes, replyToStory, deleteStory } = useStories();

  // Use the data from useUserProfile if available, otherwise use the prop
    const currentUserData = userProfile || activeUser;
    const userName = currentUserData.name || "User";
    const userImage = currentUserData.profilePhoto1 || undefined; // Uses profilePhoto1 from the User interface
    const passedProfilesStorageKey = useMemo(() => {
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : '';
        return currentUserId ? `${DASHBOARD_PASSED_PROFILES_STORAGE_KEY_PREFIX}:${currentUserId}` : '';
    }, [currentUserData?.id]);

    useEffect(() => {
        if (!passedProfilesStorageKey) {
            setPersistedPassedProfileIds([]);
            return;
        }

        try {
            const raw = localStorage.getItem(passedProfilesStorageKey);
            const parsed = raw ? JSON.parse(raw) : [];
            const items = Array.isArray(parsed)
                ? parsed.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
                : [];
            setPersistedPassedProfileIds(items);
        } catch {
            setPersistedPassedProfileIds([]);
        }
    }, [passedProfilesStorageKey]);

    const activeProfiles = useMemo(() => {
        const hasValidId = (p: User) => p && (p.id || (p as any)._id);
        const hasDisplayName = (p: User) => typeof p.name === 'string' && p.name.trim().length > 0;
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : null;
        const passedIdSet = new Set(persistedPassedProfileIds);

        const sourceProfiles =
            filteredProfiles !== null
                ? filteredProfiles
                : (Array.isArray(profiles) ? profiles : []);

        const baseProfiles = sourceProfiles
            .filter(hasValidId)
            .filter(hasDisplayName)
            .filter((profile) => profile.onboardingCompleted === true)
            .filter((profile) => !currentUserId || String(profile.id || (profile as any)._id) !== currentUserId);

        if (isReviewingPassedProfiles) {
            return baseProfiles;
        }

        const unpassedProfiles = baseProfiles.filter(
            (profile) => !passedIdSet.has(String(profile.id || (profile as any)._id))
        );

        return unpassedProfiles.length > 0 ? unpassedProfiles : baseProfiles;
    }, [profiles, filteredProfiles, currentUserData?.id, isReviewingPassedProfiles, persistedPassedProfileIds]);

    const {
      queue: profileQueue,
      currentProfile,
      advance,
      retreat,
      reset,
    } = useProfileQueue(activeProfiles, {
      preloadSize: 5,
      onRefill: filteredProfiles === null ? refetch : null,
    });

    // Auto-refresh feed when empty so newly registered users appear without manual reload.
    useEffect(() => {
        if (filteredProfiles !== null) return;
        if (matchesLoading || userLoading) return;
        if (currentProfile) return;

        const refresh = () => {
            refetch().catch(() => null);
        };

        const intervalId = window.setInterval(refresh, 10000);

        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };

        window.addEventListener('focus', handleVisibilityOrFocus);
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('focus', handleVisibilityOrFocus);
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
        };
    }, [currentProfile, filteredProfiles, matchesLoading, userLoading, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setFilteredProfiles(null);
    };
  }, []);

  useEffect(() => {
    if (hasCompletedInitialLoadRef.current) return;
    if (matchesError) {
      hasCompletedInitialLoadRef.current = true;
      return;
    }
    if (!matchesLoading && profiles !== null) {
      hasCompletedInitialLoadRef.current = true;
    }
  }, [matchesLoading, profiles, matchesError]);

  useEffect(() => {
    try {
      const shouldShow = localStorage.getItem('faithbliss_show_post_onboarding_offer') === '1';
      if (shouldShow) {
        setShowPostOnboardingOverlay(true);
      }
    } catch {
      // Ignore localStorage access errors.
    }
  }, []);

  useEffect(() => {
    const uid = currentUserData?.id;
    if (!uid || currentUserData?.onboardingCompleted) return;

    let timeoutId: number | undefined;

    try {
      const raw = localStorage.getItem(ONBOARDING_PAUSE_STORAGE_KEY);
      if (!raw) return;
      const pauseState = JSON.parse(raw) as {
        uid?: string;
        dashboardEnteredAt?: number | null;
        promptShown?: boolean;
      };
      if (pauseState.uid !== uid || pauseState.promptShown) return;

      const enteredAt = typeof pauseState.dashboardEnteredAt === 'number' ? pauseState.dashboardEnteredAt : Date.now();
      if (typeof pauseState.dashboardEnteredAt !== 'number') {
        localStorage.setItem(
          ONBOARDING_PAUSE_STORAGE_KEY,
          JSON.stringify({ ...pauseState, dashboardEnteredAt: enteredAt })
        );
      }

      const elapsed = Date.now() - enteredAt;
      const remaining = Math.max(0, 10 * 60 * 1000 - elapsed);
      timeoutId = window.setTimeout(() => {
        setShowForcedOnboardingPrompt(true);
        try {
          const latestRaw = localStorage.getItem(ONBOARDING_PAUSE_STORAGE_KEY);
          if (!latestRaw) return;
          const latest = JSON.parse(latestRaw) as Record<string, unknown>;
          localStorage.setItem(
            ONBOARDING_PAUSE_STORAGE_KEY,
            JSON.stringify({ ...latest, promptShown: true })
          );
        } catch {
          // Ignore localStorage errors.
        }
      }, remaining);
    } catch {
      // Ignore storage parse errors.
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [currentUserData?.id, currentUserData?.onboardingCompleted]);

  // Show loading state while fetching matches or refreshing the token.
    const isInitialHydration =
      !hasCompletedInitialLoadRef.current && (matchesLoading || userLoading || (profiles === null && !matchesError));

    if (isInitialHydration) {
        return <HeartBeatLoader message="Preparing your matches..." />;
    }

  // Handle error state for profiles
    if (matchesError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
                <div className="text-center p-8">
                    <p className="text-red-400 mb-4">Failed to load profiles: {matchesError}</p>
                    <button
                        onClick={() => refetch()} 
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Try Again
          </button>
        </div>
      </div>
    );
  }

    const goToNextProfile = () => {
      const hasNext = advance();
      if (hasNext) return;
      if (filteredProfiles !== null) {
        showInfo('End of filtered results.');
      } else {
        showInfo('No more new profiles right now. Check back later.');
      }
    };
    
    const handleNoProfilesAction = async () => {
      reset();
      setIsReviewingPassedProfiles(false);
      if (filteredProfiles !== null) {
        setFilteredProfiles(null);
      }
      await refetch();
    };

    const handleReviewPassedProfiles = async () => {
      reset();
      try {
        const response = await API.Match.getPassedProfiles();
        const passedProfiles = Array.isArray(response?.profiles) ? response.profiles : [];
        setFilteredProfiles(passedProfiles);
        setIsReviewingPassedProfiles(true);

        if (passedProfiles.length > 0) {
          showInfo(`Reviewing ${passedProfiles.length} passed profile${passedProfiles.length > 1 ? 's' : ''}.`);
        } else {
          showInfo('You have no passed profiles to review right now.');
        }
      } catch (error) {
        console.error('Failed to load passed profiles:', error);
      }
    };

  const handleLike = () => {
    const currentProfileCandidate = currentProfile as (User & { _id?: string }) | null;
    const userIdToLike = currentProfileCandidate?.id || currentProfileCandidate?._id;

    if (!userIdToLike) {
      console.warn("No user ID found to like. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }

    goToNextProfile();

    const key = String(userIdToLike);
    if (pendingActionIdsRef.current.has(key)) return;
    pendingActionIdsRef.current.add(key);

    // Fire network call in background so UI never blocks.
    void likeUser(key, { suppressSuccessToast: true })
      .catch((error) => {
        console.error('Failed to like user:', error);
      })
      .finally(() => {
        pendingActionIdsRef.current.delete(key);
      });
  };

  const handlePass = () => {
    const currentProfileCandidate = currentProfile as (User & { _id?: string }) | null;
    const userIdToPass = currentProfileCandidate?.id || currentProfileCandidate?._id;
    
    if (!userIdToPass) {
      console.warn("No user ID found to pass. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }
    
    goToNextProfile();

    const key = String(userIdToPass);
    if (passedProfilesStorageKey) {
      try {
        const existingRaw = localStorage.getItem(passedProfilesStorageKey);
        const existingParsed = existingRaw ? JSON.parse(existingRaw) : [];
        const existingPassedProfileIds = Array.isArray(existingParsed)
          ? existingParsed.filter(
              (value): value is string =>
                typeof value === 'string' && value.trim().length > 0
            )
          : [];
        const nextPersistedPassedProfileIds = Array.from(
          new Set([...existingPassedProfileIds, key])
        ).slice(-500);
        localStorage.setItem(
          passedProfilesStorageKey,
          JSON.stringify(nextPersistedPassedProfileIds)
        );
      } catch {
        // Ignore localStorage access errors.
      }
    }

    if (pendingActionIdsRef.current.has(key)) return;
    pendingActionIdsRef.current.add(key);

    // Fire network call in background so UI never blocks.
    void passUser(key)
      .catch((error) => {
        console.error('Failed to pass user:', error);
      })
      .finally(() => {
        pendingActionIdsRef.current.delete(key);
      });
  };

  const handleGoBack = () => {
    retreat();
  };


 
const handleApplyFilters = async (filters: DashboardFiltersPayload) => {
        const normalizedEntries = Object.entries(filters || {}).filter(([, value]) => {
            if (value === undefined || value === null) return false;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim().length > 0;
            return true;
        });
        const normalizedFilters = Object.fromEntries(normalizedEntries) as DashboardFiltersPayload;
        const hasActiveFilters = Object.keys(normalizedFilters).length > 0;

        if (!hasActiveFilters) {
            setFilteredProfiles(null);
            setIsReviewingPassedProfiles(false);
            reset();
            showInfo('Filters cleared. Showing all profiles.');
            return;
        }

        setIsLoadingFilters(true);
        try {
            const results = await API.Discovery.filterProfiles(normalizedFilters); 
            setFilteredProfiles(Array.isArray(results) ? results : []);
            setIsReviewingPassedProfiles(false);
            reset();
            if (results.length > 0) {
              showSuccess(`Found ${results.length} profile${results.length > 1 ? 's' : ''}.`);
            } else {
              showInfo('No profiles match your filters. Try widening your criteria.');
            }
        } catch (error) {
            console.error('Failed to apply filters:', error);
        } finally {
            setIsLoadingFilters(false);
        }
    };

  const handleToggleFilters = () => {
    setFilterFocusSection(null);
    setShowFilters((prev) => !prev);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
    setFilterFocusSection(null);
  };

  const openFiltersToSection = (section: DashboardFilterFocusSection) => {
    setFilterFocusSection(section);
    setShowFilters(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white pb-0 lg:pb-20 no-horizontal-scroll dashboard-main">
      {showPostOnboardingOverlay && (
        <PostOnboardingWelcomeOverlay
          user={currentUserData}
          onPrimary={() => {
            setShowPostOnboardingOverlay(false);
            try {
              localStorage.removeItem('faithbliss_show_post_onboarding_offer');
            } catch {
              // Ignore localStorage access errors.
            }
            navigate('/dashboard', { replace: true });
          }}
        />
      )}
      {isLoadingFilters && <HeartBeatLoader message="Applying filters..." />}
      {showForcedOnboardingPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-pink-400/30 bg-slate-900 p-6 text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white">Complete Your Onboarding</h3>
            <p className="mt-3 text-sm text-slate-300">
              To continue using FaithBliss, please finish the remaining onboarding steps.
            </p>
            <button
              type="button"
              onClick={() => navigate('/onboarding', { replace: true })}
              className="mt-6 w-full rounded-full bg-pink-600 px-5 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              Continue Onboarding
            </button>
          </div>
        </div>
      )}
      
      {/* Desktop Layout */}
                <DesktopLayout
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        showFilters={showFilters}
        showSidePanel={showSidePanel}
                    onToggleFilters={handleToggleFilters}
                    onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
                    topContent={
                      <StoryBar
                        stories={stories}
                        loading={storiesLoading}
                        onCreateStory={createStory}
                        onMarkStorySeen={markStorySeen}
                        onLikeStory={likeStory}
                        onGetStoryLikes={getStoryLikes}
                        onReplyToStory={replyToStory}
                        onDeleteStory={deleteStory}
                      />
                    }
                >
                    <ProfileDisplay
                        currentProfile={currentProfile}
                        profileQueue={profileQueue}
                        viewerLatitude={typeof currentUserData?.latitude === 'number' ? currentUserData.latitude : undefined}
                        viewerLongitude={typeof currentUserData?.longitude === 'number' ? currentUserData.longitude : undefined}
                        onStartOver={reset}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        noProfilesTitle={isReviewingPassedProfiles ? "No passed profiles to review" : "No new matches yet"}
                        noProfilesDescription={
                          isReviewingPassedProfiles
                            ? "You have no passed profiles available to review right now. Go back to the fresh feed anytime."
                            : "You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        }
                        noProfilesActionLabel={isReviewingPassedProfiles ? "Back to Fresh Feed" : "Reload Profiles"}
                        onNoProfilesAction={handleNoProfilesAction}
                        noProfilesSecondaryActionLabel={isReviewingPassedProfiles ? undefined : "Review Passed Profiles"}
                        onNoProfilesSecondaryAction={isReviewingPassedProfiles ? undefined : handleReviewPassedProfiles}
                        onOpenFilterSection={openFiltersToSection}
                    />
                </DesktopLayout>

      {/* Mobile Layout */}
                <MobileLayout
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        showFilters={showFilters}
        showSidePanel={showSidePanel}
                    showBottomNav={false}
                    onToggleFilters={handleToggleFilters}
                    onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
                    topContent={
                      <StoryBar
                        stories={stories}
                        loading={storiesLoading}
                        onCreateStory={createStory}
                        onMarkStorySeen={markStorySeen}
                        onLikeStory={likeStory}
                        onGetStoryLikes={getStoryLikes}
                        onReplyToStory={replyToStory}
                        onDeleteStory={deleteStory}
                      />
                    }
                >
                    <ProfileDisplay
                        currentProfile={currentProfile}
                        profileQueue={profileQueue}
                        viewerLatitude={typeof currentUserData?.latitude === 'number' ? currentUserData.latitude : undefined}
                        viewerLongitude={typeof currentUserData?.longitude === 'number' ? currentUserData.longitude : undefined}
                        onStartOver={reset}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        noProfilesTitle={isReviewingPassedProfiles ? "No passed profiles to review" : "No new matches yet"}
                        noProfilesDescription={
                          isReviewingPassedProfiles
                            ? "You have no passed profiles available to review right now. Go back to the fresh feed anytime."
                            : "You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        }
                        noProfilesActionLabel={isReviewingPassedProfiles ? "Back to Fresh Feed" : "Reload Profiles"}
                        onNoProfilesAction={handleNoProfilesAction}
                        noProfilesSecondaryActionLabel={isReviewingPassedProfiles ? undefined : "Review Passed Profiles"}
                        onNoProfilesSecondaryAction={isReviewingPassedProfiles ? undefined : handleReviewPassedProfiles}
                        onOpenFilterSection={openFiltersToSection}
                    />
                </MobileLayout>

      {/* Overlay Panels */}
      <OverlayPanels
        showFilters={showFilters}
        showSidePanel={showSidePanel}
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        onCloseFilters={handleCloseFilters}
        onCloseSidePanel={() => setShowSidePanel(false)}
        onApplyFilters={handleApplyFilters}
        filterFocusSection={filterFocusSection}
      />
    </div>
  );
};

