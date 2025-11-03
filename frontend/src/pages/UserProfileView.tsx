import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeartBeatLoader } from "@/components/HeartBeatLoader";
import {
  ArrowLeft,
  Heart,
  X,
  MessageCircle,
  MapPin,
  Church,
  Music,
  Verified,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/services/api";

const getProfilePhotos = (user: User): string[] => {
  const photos: string[] = [];
  if (user.profilePhoto1) photos.push(user.profilePhoto1);
  if (user.profilePhoto2) photos.push(user.profilePhoto2);
  if (user.profilePhoto3) photos.push(user.profilePhoto3);
  return photos.filter(Boolean);
};

const ProfilePage = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUserProfileById, user } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch another user’s profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!profileId) {
        console.error("No profile ID found in URL");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const userData = await getUserProfileById(profileId);
        setProfile(userData);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, getUserProfileById]);

  const handleMessage = () => {
    if (profile?.id) {
      navigate(
        `/messages?profileId=${profile.id}&profileName=${encodeURIComponent(
          profile.name
        )}`
      );
    }
  };

  const nextPhoto = () => {
    if (!profile) return;
    const photos = getProfilePhotos(profile);
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    if (!profile) return;
    const photos = getProfilePhotos(profile);
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) return <HeartBeatLoader message="Loading profile..." />;

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">
            This user may not exist or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-full font-medium transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const photos = getProfilePhotos(profile);
  const currentPhotoUrl =
    photos[currentPhotoIndex] || photos[0] || "/default-avatar.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">
            {profile.name}'s Profile
          </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photo Gallery */}
        <div className="relative overflow-hidden">
          <div className="aspect-[4/5] md:aspect-[16/10] relative overflow-hidden">
            <img
              src={currentPhotoUrl}
              alt={`${profile.name} photo`}
              className="object-cover w-full h-full absolute top-0 left-0"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentPhotoIndex
                          ? "bg-white"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {profile.isVerified && (
              <div className="absolute top-4 right-4 bg-blue-500/90 backdrop-blur-md text-white p-2 rounded-full z-10">
                <Verified className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">
                {profile.name}, {profile.age}
              </h1>
              <div className="flex items-center space-x-2 text-gray-300 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{profile.location || "Not specified"}</span>
              </div>
            </div>
            {profile.bio && (
              <div className="bg-gray-800/50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}
          </div>

          {/* Faith & Values */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Church className="w-6 h-6 text-blue-400" />
              <span>Faith & Values</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.faithJourney && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    Faith Journey
                  </h4>
                  <p className="text-gray-300">{profile.faithJourney}</p>
                </div>
              )}
              {profile.sundayActivity && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">
                    Sunday Activity
                  </h4>
                  <p className="text-gray-300">{profile.sundayActivity}</p>
                </div>
              )}
            </div>
          </div>

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Music className="w-6 h-6 text-purple-400" />
                <span>Interests & Hobbies</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.hobbies.map((hobby, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {hobby}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {user?.id !== profile.id && (
          <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-700/50 p-4">
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
              <button
                onClick={() => navigate(-1)}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 p-4 rounded-full transition-all hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={handleMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message</span>
              </button>

              <button
                onClick={() => console.log("Like", profile.name)}
                className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-400 p-4 rounded-full transition-all hover:scale-110"
              >
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
