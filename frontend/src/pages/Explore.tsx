/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter, Heart, MapPin, Search, Sparkles, X } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppDropdown from '@/components/AppDropdown';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useMatching } from '@/hooks/useAPI';
import { INTEREST_CATEGORIES } from '@/constants/interestCategories';
import { API, type User } from '@/services/api';

interface ExploreCandidate extends User {
  matchedInterests?: string[];
  interestMatchCount?: number;
}

const MAX_SELECTED_INTERESTS = 6;

const ExploreContent = () => {
  const { user } = useAuthContext();
  const { likeUser, passUser } = useMatching();
  const { showInfo, showError } = useToast();

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [interestQuery, setInterestQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string>('ALL');
  const [selectedInterestOption, setSelectedInterestOption] = useState<string>('');
  const [profiles, setProfiles] = useState<ExploreCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionIds, setPendingActionIds] = useState<string[]>([]);
  const [pendingAutoScrollToResults, setPendingAutoScrollToResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const availableInterestOptions = useMemo(() => {
    const query = interestQuery.trim().toLowerCase();
    const options = selectedCategoryTitle === 'ALL'
      ? INTEREST_CATEGORIES.flatMap((category) => category.options)
      : (INTEREST_CATEGORIES.find((category) => category.title === selectedCategoryTitle)?.options || []);

    const unique = Array.from(new Set(options));
    return unique
      .filter((option) => option.toLowerCase().includes(query))
      .filter((option) => !selectedInterests.includes(option));
  }, [interestQuery, selectedCategoryTitle, selectedInterests]);

  const categoryDropdownOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All categories' },
      ...INTEREST_CATEGORIES.map((category) => ({
        value: category.title,
        label: `${category.emoji} ${category.title}`,
      })),
    ],
    []
  );

  const interestDropdownOptions = useMemo(
    () => availableInterestOptions.map((interest) => ({ value: interest, label: interest })),
    [availableInterestOptions]
  );

  useEffect(() => {
    if (availableInterestOptions.length === 0) {
      setSelectedInterestOption('');
      return;
    }

    setSelectedInterestOption((prev) =>
      prev && availableInterestOptions.includes(prev) ? prev : availableInterestOptions[0]
    );
  }, [availableInterestOptions]);

  useEffect(() => {
    let cancelled = false;

    const loadProfiles = async () => {
      if (selectedInterests.length === 0) {
        setProfiles([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await API.Discovery.getUsersByInterests(selectedInterests);
        if (cancelled) return;
        setProfiles(Array.isArray(response) ? (response as ExploreCandidate[]) : []);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load explore profiles.';
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfiles().catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [selectedInterests]);

  useEffect(() => {
    if (!pendingAutoScrollToResults) return;

    if (!loading && !error && profiles.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPendingAutoScrollToResults(false);
      return;
    }

    if (!loading && (error || profiles.length === 0)) {
      setPendingAutoScrollToResults(false);
    }
  }, [pendingAutoScrollToResults, loading, error, profiles.length]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((item) => item !== interest);
      }
      if (prev.length >= MAX_SELECTED_INTERESTS) {
        showInfo(`You can select up to ${MAX_SELECTED_INTERESTS} interests at once.`, 'Selection Limit');
        return prev;
      }
      setPendingAutoScrollToResults(true);
      return [...prev, interest];
    });
  };

  const handleAddInterestFromDropdown = () => {
    if (!selectedInterestOption) {
      showInfo('Choose an interest first.', 'Select Interest');
      return;
    }
    toggleInterest(selectedInterestOption);
  };

  const runProfileAction = async (
    profileId: string,
    action: () => Promise<unknown>
  ) => {
    if (pendingActionIds.includes(profileId)) return;

    setPendingActionIds((prev) => [...prev, profileId]);
    try {
      await action();
      setProfiles((prev) => prev.filter((profile) => String(profile.id) !== profileId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed. Please retry.';
      showError(message, 'Action Failed');
    } finally {
      setPendingActionIds((prev) => prev.filter((id) => id !== profileId));
    }
  };

  const handleLike = async (profile: ExploreCandidate) => {
    const profileId = String(profile.id || (profile as any)._id || '');
    if (!profileId) return;

    await runProfileAction(profileId, () => likeUser(profileId));
  };

  const handlePass = async (profile: ExploreCandidate) => {
    const profileId = String(profile.id || (profile as any)._id || '');
    if (!profileId) return;

    await runProfileAction(profileId, () => passUser(profileId));
  };

  const layoutName = user?.name || 'User';
  const layoutImage = user?.profilePhoto1 || undefined;
  const activeProfile = profiles[0] || null;
  const queuedProfiles = profiles.slice(1, 3);

  const content = (
    <div className="px-4 pb-8 pt-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-orange-500/15 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                <Sparkles className="h-3.5 w-3.5" />
                Explore Interest
              </p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Explore by Interests</h1>
              <p className="mt-2 text-sm text-slate-100 sm:text-base">
                Pick interests, then like or pass profiles one-by-one.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Selected {selectedInterests.length}/{MAX_SELECTED_INTERESTS}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-sm lg:sticky lg:top-24">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Filter className="h-4 w-4 text-pink-300" />
              Interest Filters
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={interestQuery}
                onChange={(event) => setInterestQuery(event.target.value)}
                placeholder="Search interests..."
                className="w-full rounded-xl border border-white/20 bg-slate-950/75 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-pink-400/60"
              />
            </div>

            {selectedInterests.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-pink-300/50 bg-pink-500/20 px-2.5 py-1 text-[11px] font-semibold text-pink-100 transition hover:bg-pink-500/30"
                  >
                    {interest}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedInterests([])}
                  className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-100 transition hover:bg-white/20"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Category
                </label>
                <AppDropdown
                  value={selectedCategoryTitle}
                  onChange={setSelectedCategoryTitle}
                  options={categoryDropdownOptions}
                  placeholder="All categories"
                  triggerClassName="w-full rounded-xl border border-white/20 bg-slate-950/75 px-3 py-2.5 text-sm text-white focus:border-pink-400/60"
                  menuClassName="border-white/20 bg-slate-950/95"
                  optionClassName="text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
                  Interest
                </label>
                <AppDropdown
                  value={selectedInterestOption}
                  onChange={setSelectedInterestOption}
                  options={interestDropdownOptions}
                  placeholder={availableInterestOptions.length === 0 ? 'No interest found' : 'Choose an interest'}
                  disabled={availableInterestOptions.length === 0}
                  triggerClassName="w-full rounded-xl border border-white/20 bg-slate-950/75 px-3 py-2.5 text-sm text-white focus:border-pink-400/60 disabled:opacity-60"
                  menuClassName="border-white/20 bg-slate-950/95"
                  optionClassName="text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleAddInterestFromDropdown}
                disabled={!selectedInterestOption}
                className="w-full rounded-xl border border-pink-300/50 bg-gradient-to-r from-pink-500/30 to-rose-500/25 px-3 py-2.5 text-sm font-semibold text-pink-100 transition hover:from-pink-500/40 hover:to-rose-500/35 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add Interest
              </button>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {availableInterestOptions.slice(0, 6).map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition hover:border-pink-300/40 hover:text-white"
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section ref={resultsRef} className="rounded-3xl border border-white/10 bg-slate-900/55 p-4 sm:p-6">
            {selectedInterests.length === 0 && (
              <div className="flex min-h-[62vh] items-center justify-center rounded-3xl border border-dashed border-cyan-300/30 bg-cyan-500/5 p-8 text-center text-sm text-cyan-100">
                Pick at least one interest from the left panel to start exploring.
              </div>
            )}

            {selectedInterests.length > 0 && loading && (
              <div className="flex min-h-[62vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-200">
                Loading matching profiles...
              </div>
            )}

            {selectedInterests.length > 0 && error && (
              <div className="flex min-h-[62vh] items-center justify-center rounded-3xl border border-red-400/30 bg-red-500/10 p-8 text-sm text-red-200">
                {error}
              </div>
            )}

            {selectedInterests.length > 0 && !loading && !error && !activeProfile && (
              <div className="flex min-h-[62vh] items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-200">
                No profiles found for these interests. Try switching interest combinations.
              </div>
            )}

            {selectedInterests.length > 0 && !loading && !error && activeProfile && (() => {
              const profileId = String(activeProfile.id || (activeProfile as any)._id || '');
              const disabled = pendingActionIds.includes(profileId);
              const profileImage =
                activeProfile.profilePhoto1 ||
                activeProfile.profilePhoto2 ||
                activeProfile.profilePhoto3 ||
                '/default-avatar.png';
              const matchedInterests = Array.isArray((activeProfile as any).matchedInterests)
                ? ((activeProfile as any).matchedInterests as string[])
                : [];

              return (
                <div className="space-y-5">
                  <div className="relative mx-auto w-full max-w-[420px]">
                    {queuedProfiles.map((queued, idx) => {
                      const queuedImage =
                        queued.profilePhoto1 || queued.profilePhoto2 || queued.profilePhoto3 || '/default-avatar.png';
                      const step = idx + 1;
                      return (
                        <div
                          key={String(queued.id || (queued as any)._id || `queued-${idx}`)}
                          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px] border border-white/10"
                          style={{
                            transform: `translateY(${step * 12}px) scale(${1 - step * 0.035})`,
                            opacity: 0.45 - idx * 0.12,
                            zIndex: 10 - step,
                          }}
                        >
                          <img src={queuedImage} alt={queued.name || 'Queued profile'} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/45" />
                        </div>
                      );
                    })}

                    <article className="relative z-20 overflow-hidden rounded-[30px] border border-white/20 bg-slate-950 shadow-[0_35px_60px_rgba(0,0,0,0.45)]">
                      <div className="relative aspect-[3/4]">
                        <img
                          src={profileImage}
                          alt={activeProfile.name || 'Profile'}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-5">
                          <h3 className="text-2xl font-bold text-white">
                            {activeProfile.name}
                            {activeProfile.age ? `, ${activeProfile.age}` : ''}
                          </h3>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-100">
                            <MapPin className="h-3.5 w-3.5" />
                            {activeProfile.location || 'Location not set'}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-200">
                            {activeProfile.bio?.trim() || 'No bio available yet.'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 bg-slate-950/95 p-4">
                        {matchedInterests.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1.5">
                            {matchedInterests.slice(0, 4).map((interest) => (
                              <span
                                key={`${profileId}-${interest}`}
                                className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100"
                              >
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => handlePass(activeProfile)}
                            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-rose-300/45 bg-rose-500/20 text-rose-100 shadow-[0_12px_25px_rgba(244,63,94,0.25)] transition hover:-translate-y-0.5 hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Pass profile"
                          >
                            <X className="h-6 w-6" />
                          </button>

                          <Link
                            to={`/profile/${encodeURIComponent(profileId)}`}
                            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-slate-100 transition hover:bg-white/20"
                          >
                            <Eye className="mr-1.5 h-4 w-4" />
                            View Profile
                          </Link>

                          <button
                            type="button"
                            disabled={disabled}
                            onClick={() => handleLike(activeProfile)}
                            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-pink-300/55 bg-pink-500/25 text-pink-100 shadow-[0_12px_25px_rgba(236,72,153,0.3)] transition hover:-translate-y-0.5 hover:bg-pink-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Like profile"
                          >
                            <Heart className="h-6 w-6 fill-current" />
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>

                  <p className="text-center text-xs text-slate-400">
                    {profiles.length} candidate{profiles.length > 1 ? 's' : ''} in this interest stack
                  </p>
                </div>
              );
            })()}
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-main min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={user} onClose={() => setShowSidePanel(false)} />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={user}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Explore"
          />
          <div className="flex-1 overflow-y-auto">{content}</div>
        </div>
      </div>

      <div className="min-h-screen lg:hidden">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={user}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Explore"
        />
        <div>{content}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidePanel(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel userName={layoutName} userImage={layoutImage} user={user} onClose={() => setShowSidePanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProtectedExplore() {
  return (
    <ProtectedRoute>
      <ExploreContent />
    </ProtectedRoute>
  );
}
