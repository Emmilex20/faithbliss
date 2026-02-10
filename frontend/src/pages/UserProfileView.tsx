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
  <section className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-sm">
    <h3 className="mb-3 text-base font-semibold text-white sm:text-lg">{title}</h3>
    {children}
  </section>
);

const ChipList = ({ items, emptyText = 'Not provided' }: { items?: string[]; emptyText?: string }) => {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-300">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 sm:text-sm"
        >
          {formatValue(item)}
        </span>
      ))}
    </div>
  );
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-bold">Profile Not Found</h1>
          <p className="mb-6 text-sm text-slate-300">This user may no longer be available or the link is invalid.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const content = (
    <div className="mx-auto w-full max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:pb-24 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-[0_20px_80px_rgba(8,20,34,0.45)]">
        <div className="relative h-44 overflow-hidden sm:h-56 lg:h-64">
          <img src={currentPhotoUrl} alt={`${profile.name} cover`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{profile.name}</h1>
                  {profile.isVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300/50 bg-cyan-400/20 px-2 py-1 text-xs font-semibold text-cyan-100">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-200 sm:text-base">
                  {profile.age ? `${profile.age} years` : 'Age not provided'}
                  {profile.gender ? ` � ${formatValue(profile.gender)}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-300 sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  {profile.location || 'Location not provided'}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm sm:text-sm">
                <p className="font-medium">Profile Photos</p>
                <p>{photos.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(320px,1.05fr)_1.45fr] lg:gap-6">
          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
              <div className="relative aspect-[4/5]">
                <img src={currentPhotoUrl} alt={`${profile.name} photo`} className="h-full w-full object-cover" />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-2 text-white transition hover:bg-slate-800"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/65 p-2 text-white transition hover:bg-slate-800"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-900/60 px-2 py-1 backdrop-blur-sm">
                      {photos.map((_, index) => (
                        <button
                          key={`photo-dot-${index}`}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            index === currentPhotoIndex ? 'bg-cyan-300' : 'bg-white/40'
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <InfoCard title="Quick Snapshot">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Denomination</p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.denomination)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Faith Journey</p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.faithJourney)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Profession</p>
                  <p className="mt-1 font-medium text-white">{profile.profession || 'Not provided'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Field of Study</p>
                  <p className="mt-1 font-medium text-white">{profile.fieldOfStudy || 'Not provided'}</p>
                </div>
              </div>
            </InfoCard>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <InfoCard title="Bio">
              <p className="leading-relaxed text-slate-200">{profile.bio?.trim() || 'No bio provided yet.'}</p>
            </InfoCard>

            <InfoCard title="Faith and Values">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Church className="h-4 w-4" /> Church Attendance
                  </p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.churchAttendance || profile.sundayActivity)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Baptism Status</p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.baptismStatus)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="mb-2 text-xs text-slate-400">Spiritual Gifts</p>
                  <ChipList items={profile.spiritualGifts} emptyText="No spiritual gifts listed" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="mb-2 text-xs text-slate-400">Core Values</p>
                  <ChipList items={profile.values} emptyText="No values listed" />
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Lifestyle and Relationship Goals">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs text-slate-400">Looking For</p>
                  <ChipList items={profile.lookingFor} emptyText="No relationship preference listed" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 text-xs text-slate-400">Relationship Goals</p>
                  <ChipList items={profile.relationshipGoals} emptyText="No goals listed" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="text-xs text-slate-400">Lifestyle</p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.lifestyle)}</p>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Interests and Personal Details">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                    <Sparkles className="h-4 w-4" /> Interests / Hobbies
                  </p>
                  <ChipList items={profile.hobbies} emptyText="No hobbies listed" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-slate-400">Favorite Verse</p>
                  <p className="mt-1 italic text-white">{profile.favoriteVerse ? `"${profile.favoriteVerse}"` : 'Not provided'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <Briefcase className="h-4 w-4" /> Profession
                  </p>
                  <p className="mt-1 font-medium text-white">{profile.profession || 'Not provided'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <GraduationCap className="h-4 w-4" /> Education
                  </p>
                  <p className="mt-1 font-medium text-white">{profile.fieldOfStudy || 'Not provided'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <UserRound className="h-4 w-4" /> Gender
                  </p>
                  <p className="mt-1 font-medium text-white">{formatValue(profile.gender)}</p>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/88 px-4 py-3 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-4xl items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/50 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
              aria-label="Back"
            >
              <X className="h-5 w-5" />
            </button>
            {isMutual ? (
              <button
                onClick={handleMessage}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </button>
            ) : (
              <>
                <button
                  onClick={handlePass}
                  disabled={actionLoading !== null}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-orange-300/50 bg-orange-500/10 px-4 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === 'pass' ? 'Passing...' : 'Pass'}
                </button>
                <button
                  onClick={handleLike}
                  disabled={actionLoading !== null}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-pink-300/50 bg-pink-500/10 px-4 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Heart className="h-4 w-4" />
                  {actionLoading === 'like' ? 'Liking...' : 'Like'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_10%_20%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_90%_12%,rgba(56,189,248,0.12),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1220_100%)] text-white dashboard-main">
      <div className="hidden min-h-screen lg:flex">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={contextUser} onClose={() => setShowSidePanel(false)} />
        </div>
        <div className="flex min-h-screen flex-1 flex-col">
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
