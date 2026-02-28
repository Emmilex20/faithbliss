import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import { useMatches, useMatching } from '@/hooks/useAPI';
import {
  BadgeCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Church,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import type { User } from '@/services/api';

const getProfilePhotos = (user: User): string[] => {
  const photos = [
    user.profilePhoto1,
    user.profilePhoto2,
    user.profilePhoto3,
    user.profilePhoto4,
    user.profilePhoto5,
    user.profilePhoto6,
  ].filter(Boolean) as string[];

  if (photos.length === 0) {
    return ['/default-avatar.png'];
  }

  return photos;
};

const formatValue = (value?: string | null): string => {
  if (!value) return 'Not provided';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
    <h3 className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500 sm:text-[0.78rem]">
      {title}
    </h3>
    {children}
  </section>
);

const ChipList = ({ items, emptyText = 'Not provided' }: { items?: string[]; emptyText?: string }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-slate-700 shadow-[0_10px_18px_rgba(15,23,42,0.06)] sm:text-sm"
        >
          {formatValue(item)}
        </span>
      ))}
    </div>
  );
};

const getInterestList = (profile: User): string[] => {
  if (Array.isArray(profile.interests) && profile.interests.length > 0) return profile.interests;
  if (Array.isArray(profile.hobbies) && profile.hobbies.length > 0) return profile.hobbies;
  return [];
};

const normalizeList = (value?: string[] | string | null): string[] => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
};

const ProfilePage = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserProfileById, user: contextUser } = useAuthContext();
  const { likeUser, passUser } = useMatching();
  const { mutual } = useMatches();

  const [showSidePanel, setShowSidePanel] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'like' | 'pass' | null>(null);

  const layoutName = contextUser?.name || 'User';
  const layoutImage = contextUser?.profilePhoto1 || undefined;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userData = await getUserProfileById(profileId);
        setProfile(userData);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, getUserProfileById]);

  const photos = useMemo(() => (profile ? getProfilePhotos(profile) : ['/default-avatar.png']), [profile]);

  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [profile?.id]);

  const currentPhotoUrl = photos[currentPhotoIndex] || photos[0];
  const isOwnProfile = Boolean(contextUser?.id && profile?.id && contextUser.id === profile.id);
  const mutualIds = useMemo(() => {
    const list = Array.isArray(mutual)
      ? mutual
      : mutual && typeof mutual === 'object' && 'matches' in (mutual as Record<string, unknown>)
      ? ((mutual as { matches?: any[] }).matches ?? [])
      : [];

    return new Set(
      list
        .map((item: any) => item?.matchedUserId || item?.id || item?.matchedUser?.id)
        .filter(Boolean)
        .map((id: string) => String(id))
    );
  }, [mutual]);
  const isMutual = Boolean(profile?.id && mutualIds.has(String(profile.id)));

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleMessage = () => {
    if (!profile?.id) return;
    navigate(`/messages?profileId=${profile.id}&profileName=${encodeURIComponent(profile.name)}`);
  };

  const handleLike = async () => {
    if (!profile?.id || isOwnProfile) return;
    setActionLoading('like');
    try {
      await likeUser(profile.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePass = async () => {
    if (!profile?.id || isOwnProfile) return;
    setActionLoading('pass');
    try {
      await passUser(profile.id);
      navigate('/dashboard');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <HeartBeatLoader message="Loading profile..." />;

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-900">
        <div className="max-w-md rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Profile Not Found</h1>
          <p className="mb-6 text-sm text-slate-500">This user may no longer be available or the link is invalid.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition hover:bg-slate-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const content = (
    <div className="profile-page mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:pb-24 lg:px-8">
      <div className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
        <div className="relative h-52 overflow-hidden sm:h-64 lg:h-[19rem]">
          <img src={currentPhotoUrl} alt={`${profile.name} cover`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h1 className="profile-display text-[1.7rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
                    {profile.name}
                  </h1>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 sm:text-base">
                  {profile.age ? `${profile.age} years` : 'Age not provided'}
                  {profile.gender ? ` � ${formatValue(profile.gender)}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  {profile.location || 'Location not provided'}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2 text-xs text-slate-500 shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:text-sm">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-slate-500">Photos</p>
                <p>{photos.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(320px,1.1fr)_1.4fr] lg:gap-6">
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.12)]">
              <div className="relative aspect-[4/5]">
                <img src={currentPhotoUrl} alt={`${profile.name} photo`} className="h-full w-full object-cover" />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/95 p-2 text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full border border-slate-200/70 bg-white/90 px-2 py-1 shadow-[0_12px_24px_rgba(15,23,42,0.1)]">
                      {photos.map((_, index) => (
                        <button
                          key={`photo-dot-${index}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            index === currentPhotoIndex ? 'bg-slate-900' : 'bg-slate-300'
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="space-y-4 sm:space-y-5">
            <InfoCard title="Bio">
              <p className="text-[1.05rem] leading-relaxed text-slate-700 sm:text-lg">{profile.bio?.trim() || 'No bio provided yet.'}</p>
              {(profile.personalPromptQuestion || profile.personalPromptAnswer) && (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {profile.personalPromptQuestion || 'Prompt'}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-900 profile-display">{profile.personalPromptAnswer || 'No answer provided yet.'}</p>
                </div>
              )}
            </InfoCard>

            <InfoCard title="Faith and Values">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Church className="h-4 w-4" /> Church Attendance
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{formatValue(profile.churchAttendance || profile.sundayActivity)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Baptism Status</p>
                  <p className="mt-1 font-medium text-slate-900">{formatValue(profile.baptismStatus)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 sm:col-span-2">
                  <p className="mb-2 text-xs text-slate-500">Spiritual Gifts</p>
                  <ChipList items={profile.spiritualGifts} emptyText="No spiritual gifts listed" />
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3 sm:col-span-2">
                  <p className="mb-2 text-xs text-slate-500">Core Values</p>
                  <ChipList items={profile.values} emptyText="No values listed" />
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Relationship Goals">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                  <p className="mb-2 text-xs text-slate-500">Looking For</p>
                  <ChipList items={profile.lookingFor} emptyText="No relationship preference listed" />
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                  <p className="mb-2 text-xs text-slate-500">Relationship Goals</p>
                  <ChipList items={profile.relationshipGoals} emptyText="No goals listed" />
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Interests and Personal Details">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                    <Sparkles className="h-4 w-4" /> Interests / Hobbies
                  </p>
                  <ChipList items={getInterestList(profile)} emptyText="No interests listed" />
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Favorite Verse</p>
                  <p className="mt-1 italic text-slate-900">{profile.favoriteVerse ? `"${profile.favoriteVerse}"` : 'Not provided'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Briefcase className="h-4 w-4" /> Profession
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{profile.profession || 'Not provided'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <GraduationCap className="h-4 w-4" /> Education
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{profile.fieldOfStudy || 'Not provided'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 sm:col-span-2">
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <UserRound className="h-4 w-4" /> Gender
                  </p>
                  <p className="mt-1 font-medium text-slate-900">{formatValue(profile.gender)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Communication Style</p>
                  <div className="mt-2">
                    <ChipList items={normalizeList(profile.communicationStyle)} emptyText="Not provided" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Love Language</p>
                  <div className="mt-2">
                    <ChipList items={normalizeList(profile.loveStyle)} emptyText="Not provided" />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Education Level</p>
                  <p className="mt-1 font-medium text-slate-900">{formatValue(profile.educationLevel)}</p>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/92 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
            {isMutual ? (
              <button
                onClick={handleMessage}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:bg-slate-800"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
            ) : (
              <>
                <button
                  onClick={handlePass}
                  disabled={actionLoading !== null}
                  className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-950 shadow-[0_14px_26px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,23,42,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Pass"
                >
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 shadow-[0_10px_18px_rgba(15,23,42,0.26)]">
                    <span className="absolute inset-[1px] rounded-[1rem] border border-white/10" />
                    <X className="relative h-5 w-5 text-white stroke-[2.8]" />
                  </span>
                </button>
                <button
                  onClick={handleLike}
                  disabled={actionLoading !== null}
                  className="inline-flex h-[3.4rem] w-[3.4rem] items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-950 shadow-[0_14px_26px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_30px_rgba(15,23,42,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Like"
                >
                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-[0_10px_18px_rgba(236,72,153,0.35)]">
                    <span className="absolute inset-[1px] rounded-[1rem] bg-gradient-to-br from-white/18 to-transparent" />
                    <Heart className="relative h-5 w-5 fill-white text-white stroke-[2.4]" />
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 dashboard-main">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap');

        .profile-page {
          font-family: "Manrope", "Segoe UI", sans-serif;
        }

        .profile-display {
          font-family: "Fraunces", "Times New Roman", serif;
        }
      `}</style>
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={contextUser} onClose={() => setShowSidePanel(false)} />
        </div>
          <div className="flex min-h-screen flex-1 flex-col bg-white">
            <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={contextUser}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title={`${profile.name}'s Profile`}
          />
          <div className="flex-1 overflow-y-auto">{content}</div>
        </div>
      </div>

      <div className="min-h-screen lg:hidden">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={contextUser}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title={`${profile.name}'s Profile`}
        />
        <div className="flex-1">{content}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSidePanel(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel userName={layoutName} userImage={layoutImage} user={contextUser} onClose={() => setShowSidePanel(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;






