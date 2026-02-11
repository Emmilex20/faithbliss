/* eslint-disable no-irregular-whitespace */
// src/components/dashboard/DashboardPage.tsx (FINAL, CORRECTED VERSION)

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo, useRef } from 'react';
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { useToast } from '@/contexts/ToastContext'; 
import { DesktopLayout } from '@/components/dashboard/DesktopLayout';
import { MobileLayout } from '@/components/dashboard/MobileLayout';
import { ProfileDisplay } from '@/components/dashboard/ProfileDisplay';
import { OverlayPanels } from '@/components/dashboard/OverlayPanels';
import { StoryBar } from '@/components/dashboard/StoryBar';
import { PostOnboardingWelcomeOverlay } from '@/components/dashboard/PostOnboardingWelcomeOverlay';
import { insertScrollbarStyles } from '@/components/dashboard/styles'; 
import { usePotentialMatches, useMatching, useStories, useUserProfile } from '@/hooks/useAPI'; 

import { API, type User } from '@/services/api'; 

// Insert scrollbar styles
insertScrollbarStyles();

export const DashboardPage = ({ user: activeUser }: { user: User }) => {
 
  
  const { showSuccess, showInfo } = useToast();
  const [showFilters, setShowFilters] = useState(false);
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

        if (filteredProfiles && filteredProfiles.length > 0) {
            // Filter filtered results for valid IDs
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
        if (filteredProfiles) return;
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
        if (filteredProfiles) return;
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
    };
  }, []);

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

  // Show loading state while fetching matches or refreshing the token.
    if (matchesLoading || userLoading || (profiles === null && !matchesError)) {
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
            if (filteredProfiles) {
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
        if (filteredProfiles) {
            setFilteredProfiles(null);
        }
        await refetch();
    };

  const handleLike = async () => {
    //  CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
    const userIdToLike = currentProfile?.id || currentProfile?._id;
    
    if (!userIdToLike) {
      console.warn("No user ID found to like. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }
    
            try {
                // Note: userIdToLike might be an ObjectId object, but JS will convert it to a string for the API call.
                await likeUser(userIdToLike);
                console.log(`Liked profile ${userIdToLike}`);
                setSwipeDirection('right');
                goToNextProfile();
            } catch (error) {
                console.error('Failed to like user:', error);
            }
  };

  const handlePass = async () => {
    //  CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
    const userIdToPass = currentProfile?.id || currentProfile?._id;
    
    if (!userIdToPass) {
      console.warn("No user ID found to pass. Skipping API call.");
      goToNextProfile(); // Move to the next profile placeholder
      return;
    }
    
    try {
      await passUser(userIdToPass);
      console.log(`Passed on profile ${userIdToPass}`);
      setSwipeDirection('left');
      goToNextProfile();
    } catch (error) {
      console.error('Failed to pass user:', error);
      goToNextProfile(); // Always move on even if API fails
    }
  };

  const handleGoBack = () => {
    setSwipeDirection('left');
    setCurrentProfileIndex(Math.max(0, currentProfileIndex - 1));
  };


 
const handleApplyFilters = async (filters: any) => {
        setIsLoadingFilters(true);
        try {
            const results = await API.Discovery.filterProfiles(filters); 
            setFilteredProfiles(results);
            setIsExhausted(false);
            showSuccess('Filters applied!');
        } catch (error) {
            console.error('Failed to apply filters:', error);
        } finally {
            setIsLoadingFilters(false);
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white pb-20 no-horizontal-scroll dashboard-main">
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
      
      {/* Desktop Layout */}
                <DesktopLayout
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        showFilters={showFilters}
        showSidePanel={showSidePanel}
                    onToggleFilters={() => setShowFilters(!showFilters)}
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
                        onStartOver={() => setCurrentProfileIndex(0)}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        swipeDirection={swipeDirection}
                        noProfilesTitle="No new matches yet"
                        noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        noProfilesActionLabel="Reload Profiles"
                        onNoProfilesAction={handleNoProfilesAction}
                    />
                </DesktopLayout>

      {/* Mobile Layout */}
                <MobileLayout
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        showFilters={showFilters}
        showSidePanel={showSidePanel}
                    onToggleFilters={() => setShowFilters(!showFilters)}
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
                        onStartOver={() => setCurrentProfileIndex(0)}
                        onGoBack={handleGoBack}
                        onLike={handleLike}
                        onPass={handlePass}
                        swipeDirection={swipeDirection}
                        noProfilesTitle="No new matches yet"
                        noProfilesDescription="You have liked or passed everyone available for now. Tap reload and we will fetch fresh profiles instantly."
                        noProfilesActionLabel="Reload Profiles"
                        onNoProfilesAction={handleNoProfilesAction}
                    />
                </MobileLayout>

      {/* Overlay Panels */}
      <OverlayPanels
        showFilters={showFilters}
        showSidePanel={showSidePanel}
        userName={userName}
        userImage={userImage}
        user={currentUserData} 
        onCloseFilters={() => setShowFilters(false)}
        onCloseSidePanel={() => setShowSidePanel(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

