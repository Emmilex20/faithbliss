/* eslint-disable no-irregular-whitespace */
// src/components/dashboard/DashboardPage.tsx (FINAL, CORRECTED VERSION)

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { useToast } from '@/contexts/ToastContext'; 
import { DesktopLayout } from '@/components/dashboard/DesktopLayout';
import { MobileLayout } from '@/components/dashboard/MobileLayout';
import { ProfileDisplay } from '@/components/dashboard/ProfileDisplay';
import { OverlayPanels } from '@/components/dashboard/OverlayPanels';
import { StoryBar } from '@/components/dashboard/StoryBar';
import { insertScrollbarStyles } from '@/components/dashboard/styles'; 
import { usePotentialMatches, useMatching, useStories, useUserProfile } from '@/hooks/useAPI'; 

import { API, type User } from '@/services/api'; 

// Insert scrollbar styles
insertScrollbarStyles();

export const DashboardPage = ({ user: activeUser }: { user: User }) => {
    const navigate = useNavigate(); 
    
    const { showSuccess, showInfo } = useToast();
    const [showFilters, setShowFilters] = useState(false);
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [filteredProfiles, setFilteredProfiles] = useState<User[] | null>(null);
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [isExhausted, setIsExhausted] = useState(false);
    const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

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

    useEffect(() => {
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : 'anon';
        const storageKey = `likedUserIds_${currentUserId}`;
        const stored = localStorage.getItem(storageKey);
        const storedIds = stored ? (JSON.parse(stored) as string[]) : [];
        const profileLikes = (currentUserData as any)?.likes || [];
        const profileMatches = (currentUserData as any)?.matches || [];
        const merged = new Set<string>(
            [...storedIds, ...profileLikes, ...profileMatches].map(String)
        );
        setLikedIds(merged);
    }, [currentUserData]);

    const updateLikedIds = (userId: string) => {
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : 'anon';
        const storageKey = `likedUserIds_${currentUserId}`;
        setLikedIds(prev => {
            const next = new Set(prev);
            next.add(userId);
            localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const activeProfiles = useMemo(() => {
        // Function to check for valid ID
        // Note: Filters out any null/undefined entries AND entries missing 'id'/'_id'
        const hasValidId = (p: User) => p && (p.id || (p as any)._id);
        const hasDisplayName = (p: User) => typeof p.name === 'string' && p.name.trim().length > 0;
        const currentUserId = currentUserData?.id ? String(currentUserData.id) : null;
        const isLiked = (p: User) => {
            const pid = p.id || (p as any)._id;
            return pid ? likedIds.has(String(pid)) : false;
        };

        if (filteredProfiles && filteredProfiles.length > 0) {
            // Filter filtered results for valid IDs
            return filteredProfiles
                .filter(hasValidId)
                .filter(hasDisplayName)
                .filter(p => !isLiked(p))
                .filter(p => !currentUserId || String(p.id || (p as any)._id) !== currentUserId);
        }
        
        // Use potential matches only; if empty, show the "no profiles" state.
        const safeProfiles = Array.isArray(profiles) ? profiles : [];
        return safeProfiles
            .filter(hasValidId)
            .filter(hasDisplayName)
            .filter(p => !isLiked(p))
            .filter(p => !currentUserId || String(p.id || (p as any)._id) !== currentUserId);
        
    }, [profiles, filteredProfiles, likedIds, currentUserData]);


    useEffect(() => {
        setCurrentProfileIndex(0);
        setIsExhausted(false);
    }, [filteredProfiles, activeProfiles]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setFilteredProfiles(null);
        };
    }, []);

    // Show loading state while fetching matches or refreshing the token.
    if (matchesLoading || userLoading) {
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
    const currentProfile = !isExhausted && activeProfiles ? activeProfiles[currentProfileIndex] : undefined; 

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
        // 🚨 CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
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
                updateLikedIds(String(userIdToLike));
                goToNextProfile();
            } catch (error) {
                console.error('Failed to like user:', error);
            }
    };

    const handlePass = async () => {
        // 🚨 CRITICAL FIX: Use currentProfile?.id OR currentProfile?._id
        const userIdToPass = currentProfile?.id || currentProfile?._id;
        
        if (!userIdToPass) {
            console.warn("No user ID found to pass. Skipping API call.");
            goToNextProfile(); // Move to the next profile placeholder
            return;
        }
        
        try {
            await passUser(userIdToPass);
            console.log(`Passed on profile ${userIdToPass}`);
            goToNextProfile();
        } catch (error) {
            console.error('Failed to pass user:', error);
            goToNextProfile(); // Always move on even if API fails
        }
    };


    const handleMessage = () => {
        // 🚨 FIX: Safely check for required data using fallback
        const profileId = currentProfile?.id || currentProfile?._id;
        if (profileId && currentProfile?.name) { 
            navigate(`/messages?profileId=${profileId}&profileName=${encodeURIComponent(currentProfile.name)}`);
        }
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
                        onGoBack={() => setCurrentProfileIndex(Math.max(0, currentProfileIndex - 1))}
                        onLike={handleLike}
                        onPass={handlePass}
                        onMessage={handleMessage}
                        noProfilesTitle="No more profiles right now"
                        noProfilesDescription="You have reached the end of your potential matches. Check back later for new people."
                        noProfilesActionLabel="Check again"
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
                        onGoBack={() => setCurrentProfileIndex(Math.max(0, currentProfileIndex - 1))}
                        onLike={handleLike}
                        onPass={handlePass}
                        onMessage={handleMessage}
                        noProfilesTitle="No more profiles right now"
                        noProfilesDescription="You have reached the end of your potential matches. Check back later for new people."
                        noProfilesActionLabel="Check again"
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
