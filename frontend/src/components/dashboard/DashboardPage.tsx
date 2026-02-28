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
import { MatchCelebrationOverlay } from '@/components/dashboard/MatchCelebrationOverlay';
import { type DashboardFiltersPayload } from '@/components/dashboard/FilterPanel';
import type { DashboardFilterFocusSection } from '@/components/dashboard/FilterPanel';
import { insertScrollbarStyles } from '@/components/dashboard/styles'; 
import { usePotentialMatches, useMatching, useStories, useUserProfile } from '@/hooks/useAPI'; 

import { API, type User } from '@/services/api'; 

// Insert scrollbar styles
insertScrollbarStyles();

export const DashboardPage = ({ user: activeUser }: { user: User }) => {
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();
  const [showFilters, setShowFilters] = useState(false);
    const [filterFocusSection, setFilterFocusSection] = useState<DashboardFilterFocusSection | null>(null);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [showPostOnboardingOverlay, setShowPostOnboardingOverlay] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('right');
    const [filteredProfiles, setFilteredProfiles] = useState<User[] | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [isExhausted, setIsExhausted] = useState(false);
    const prefetchingRef = useRef(false);
    const lastPrefetchAtRef = useRef(0);
    const lastPrefetchIndexRef = useRef<number | null>(null);
    const pendingActionIdsRef = useRef<Set<string>>(new Set());
    const hasCompletedInitialLoadRef = useRef(false);
    const [showForcedOnboardingPrompt, setShowForcedOnboardingPrompt] = useState(false);
    const ONBOARDING_PAUSE_STORAGE_KEY = 'faithbliss_onboarding_pause_state';
    const matchCelebrationTimerRef = useRef<number | null>(null);
    const [matchCelebration, setMatchCelebration] = useState<{
      open: boolean;
      matchedUserId: string;
      matchedUserName: string;
      matchedUserPhoto?: string;
    }>({
      open: false,
      matchedUserId: '',
      matchedUserName: '',
      matchedUserPhoto: undefined,
    });

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

    const activeProfiles = useMemo(() => {
        // Function to check for valid ID
        // Note: Filters out any null/undefined entries AND entries missing 'id'/'_id'
        const hasValidId = (p: User) => p && (p.id || (p as any)._id);
        const hasDisplayName = (p: User) => typeof p.name === 'string' && p.name.trim().length > 0;
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : null;

        if (filteredProfiles !== null) {
            // Filtered mode: honor even an empty array so "no matches" is preserved.
            return filteredProfiles
                .filter(hasValidId)
                .filter(hasDisplayName)
                .filter(p => !currentUserId || String(p.id || (p as any)._id) !== currentUserId);
        }
        
        // Use potential matches only; if empty, show the "no profiles" state.
        const safeProfiles = Array.isArray(profiles) ? profiles : [];
        return safeProfiles
            .filter(hasValidId)
            .filter(hasDisplayName)
            .filter(p => !currentUserId || String(p.id || (p as any)._id) !== currentUserId);
        
    }, [profiles, filteredProfiles, currentUserData]);


    useEffect(() => {
        if (!Array.isArray(activeProfiles) || activeProfiles.length === 0) {
            setCurrentProfileIndex(0);
            return;
        }
        setIsExhausted(false);
        setCurrentProfileIndex((prev) => (prev >= activeProfiles.length ? 0 : prev));
    }, [filteredProfiles, activeProfiles]);

    useEffect(() => {
        if (filteredProfiles !== null) return;
        if (!Array.isArray(activeProfiles) || activeProfiles.length === 0) return;

        const remaining = activeProfiles.length - currentProfileIndex - 1;
        if (remaining > 2) return;
        if (prefetchingRef.current) return;
        if (lastPrefetchIndexRef.current === currentProfileIndex) return;
        if (Date.now() - lastPrefetchAtRef.current < 5000) return;

        prefetchingRef.current = true;
        lastPrefetchIndexRef.current = currentProfileIndex;
        lastPrefetchAtRef.current = Date.now();
        refetch()
          .catch(() => null)
          .finally(() => {
            prefetchingRef.current = false;
          });
    }, [activeProfiles, currentProfileIndex, filteredProfiles, refetch]);

    // Auto-refresh feed when empty so newly registered users appear without manual reload.
    useEffect(() => {
        if (filteredProfiles !== null) return;
        if (matchesLoading || userLoading) return;
        if (Array.isArray(activeProfiles) && activeProfiles.length > 0) return;

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
    }, [filteredProfiles, matchesLoading, userLoading, activeProfiles, refetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setFilteredProfiles(null);
      if (matchCelebrationTimerRef.current) {
        window.clearTimeout(matchCelebrationTimerRef.current);
      }
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

    // Use a safe, non-asserted way to define the current profile
    const currentProfile = !isExhausted && activeProfiles
      ? (activeProfiles[currentProfileIndex] ?? activeProfiles[0])
      : undefined; 

    const goToNextProfile = () => {
        if (!activeProfiles) return;
        
        if (currentProfileIndex < activeProfiles.length - 1) {
            setCurrentProfileIndex(prev => prev + 1);
        } else {
            if (filteredProfiles !== null) {
                showInfo("End of filtered results.");
                setIsExhausted(true);
            } else {
                showInfo("No more new profiles right now. Check back later.");
                setIsExhausted(true);
            }
        }
    };
    
    const handleNoProfilesAction = async () => {
        setIsExhausted(false);
        setCurrentProfileIndex(0);
        if (filteredProfiles !== null) {
            setFilteredProfiles(null);
        }
        await refetch();
    };

  const handleLike = () => {
    //  CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
    const userIdToLike = currentProfile?.id || currentProfile?._id;
    const likedProfile = currentProfile;
    
    if (!userIdToLike) {
      console.warn("No user ID found to like. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }

    // Optimistic UX: move to next profile immediately.
    setSwipeDirection('right');
    goToNextProfile();

    const key = String(userIdToLike);
    if (pendingActionIdsRef.current.has(key)) return;
    pendingActionIdsRef.current.add(key);

    // Fire network call in background so UI never blocks.
    void likeUser(key, { suppressSuccessToast: true })
      .then((result) => {
        console.log(`Liked profile ${key}`);
        if (result?.isMatch && likedProfile) {
          const matchedUserId = String(likedProfile.id || (likedProfile as any)._id || key);
          const matchedUserName = likedProfile.name || 'New Match';
          const matchedUserPhoto = likedProfile.profilePhoto1 || likedProfile.profilePhoto2 || likedProfile.profilePhoto3;

          if (matchCelebrationTimerRef.current) {
            window.clearTimeout(matchCelebrationTimerRef.current);
          }

          setMatchCelebration({
            open: true,
            matchedUserId,
            matchedUserName,
            matchedUserPhoto,
          });

          matchCelebrationTimerRef.current = window.setTimeout(() => {
            setMatchCelebration((prev) => ({ ...prev, open: false }));
          }, 30000);
        }
      })
      .catch((error) => {
        console.error('Failed to like user:', error);
      })
      .finally(() => {
        pendingActionIdsRef.current.delete(key);
      });
  };

  const handlePass = () => {
    //  CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
    const userIdToPass = currentProfile?.id || currentProfile?._id;
    
    if (!userIdToPass) {
      console.warn("No user ID found to pass. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }
    
    // Optimistic UX: move to next profile immediately.
    setSwipeDirection('left');
    goToNextProfile();

    const key = String(userIdToPass);
    if (pendingActionIdsRef.current.has(key)) return;
    pendingActionIdsRef.current.add(key);

    // Fire network call in background so UI never blocks.
    void passUser(key)
      .then(() => {
        console.log(`Passed on profile ${key}`);
      })
      .catch((error) => {
        console.error('Failed to pass user:', error);
      })
      .finally(() => {
        pendingActionIdsRef.current.delete(key);
      });
  };

  const handleGoBack = () => {
    setSwipeDirection('left');
    setCurrentProfileIndex(Math.max(0, currentProfileIndex - 1));
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
            setCurrentProfileIndex(0);
            setIsExhausted(false);
            showInfo('Filters cleared. Showing all profiles.');
            return;
        }

        setIsLoadingFilters(true);
        try {
            const results = await API.Discovery.filterProfiles(normalizedFilters); 
            setFilteredProfiles(Array.isArray(results) ? results : []);
            setCurrentProfileIndex(0);
            setIsExhausted(false);
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

  const closeMatchCelebration = () => {
    if (matchCelebrationTimerRef.current) {
      window.clearTimeout(matchCelebrationTimerRef.current);
      matchCelebrationTimerRef.current = null;
    }
    setMatchCelebration((prev) => ({ ...prev, open: false }));
  };

  const handleMatchChat = () => {
    const targetId = matchCelebration.matchedUserId;
    const targetName = matchCelebration.matchedUserName;
    closeMatchCelebration();
    if (!targetId) {
      navigate('/messages');
      return;
    }
    navigate(
      `/messages?profileId=${encodeURIComponent(targetId)}&profileName=${encodeURIComponent(targetName || '')}`
    );
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
      <MatchCelebrationOverlay
        open={matchCelebration.open}
        currentUserName={userName}
        currentUserPhoto={userImage}
        matchedUserName={matchCelebration.matchedUserName}
        matchedUserPhoto={matchCelebration.matchedUserPhoto}
        onContinue={closeMatchCelebration}
        onChat={handleMatchChat}
      />
      {showPostOnboardingOverlay && (
        <PostOnboardingWelcomeOverlay
          user={currentUserData}
          onPrimary={() => {
            setShowPostOnboardingOverlay(false);
            setShowFilters(true);
            try {
              localStorage.removeItem('faithbliss_show_post_onboarding_offer');
            } catch {
              // Ignore localStorage access errors.
            }
          }}
          onDismiss={() => {
            setShowPostOnboardingOverlay(false);
            try {
              localStorage.removeItem('faithbliss_show_post_onboarding_offer');
            } catch {
              // Ignore localStorage access errors.
            }
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
                        viewerLatitude={typeof currentUserData?.latitude === 'number' ? currentUserData.latitude : undefined}
                        viewerLongitude={typeof currentUserData?.longitude === 'number' ? currentUserData.longitude : undefined}
                        onStartOver={() => setCurrentProfileIndex(0)}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        swipeDirection={swipeDirection}
                        noProfilesTitle="No new matches yet"
                        noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        noProfilesActionLabel="Reload Profiles"
                        onNoProfilesAction={handleNoProfilesAction}
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
                        viewerLatitude={typeof currentUserData?.latitude === 'number' ? currentUserData.latitude : undefined}
                        viewerLongitude={typeof currentUserData?.longitude === 'number' ? currentUserData.longitude : undefined}
                        onStartOver={() => setCurrentProfileIndex(0)}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        swipeDirection={swipeDirection}
                        noProfilesTitle="No new matches yet"
                        noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        noProfilesActionLabel="Reload Profiles"
                        onNoProfilesAction={handleNoProfilesAction}
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

