/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUserProfile } from '@/hooks/useAPI';
import { API } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import PhotosSection from '@/components/profile/PhotosSection';
import BasicInfoSection from '@/components/profile/BasicInfoSection';
import PassionsSection from '@/components/profile/PassionsSection';
import FaithSection from '@/components/profile/FaithSection';
import SaveButton from '@/components/profile/SaveButton';
import type { ProfileData } from '@/types/profile';
import type { UpdateProfileDto } from '@/services/api';
import { updateProfileClient, uploadSpecificPhotoClient } from '@/services/api-client';

const ProfilePage: React.FC = () => {
  const { accessToken, user: authUser } = useAuth();

  // ✅ Use only valid id/email from your User type
  const currentUserId = authUser?.id;
  const currentUserEmail = authUser?.email;

  const { data: userData, loading, execute } = useUserProfile(currentUserId, currentUserEmail);

  const [activeSection, setActiveSection] = useState<'photos' | 'basics' | 'passions' | 'faith'>('photos');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    console.log('🔥 ProfilePage: raw userData from useUserProfile:', userData);

    let resolved = userData as any;

    if (Array.isArray(userData)) {
      resolved =
        userData.find((u: any) => u.id === currentUserId) ||
        userData.find((u: any) => u.email?.toLowerCase() === currentUserEmail?.toLowerCase()) ||
        userData[0] ||
        null;
      console.warn('ProfilePage: useUserProfile returned array. Resolved to:', resolved ? resolved.id || resolved.email : null);
    }

    const user = resolved;
    if (!user) {
      console.warn('ProfilePage: no user found to map into profileData — user remains null');
      return;
    }

    setProfileData({
      id: user.id || '',
      email: user.email || '',
      name: user.name || '',
      gender: user.gender || undefined,
      age: user.age ?? 0,
      denomination: user.denomination || undefined,
      bio: user.bio || '',
      location: {
        address: user.location || '',
        latitude: user.latitude ?? null,
        longitude: user.longitude ?? null,
      },
      phoneNumber: user.phoneNumber || '',
      countryCode: user.countryCode || '',
      birthday: user.birthday || '',
      fieldOfStudy: user.fieldOfStudy || '',
      profession: user.profession || '',
      faithJourney: user.faithJourney || undefined,
      sundayActivity: user.sundayActivity || undefined,
      lookingFor: user.lookingFor || [],
      hobbies: user.hobbies || [],
      values: user.values || [],
      favoriteVerse: user.favoriteVerse || '',
      photos: [user.profilePhoto1, user.profilePhoto2, user.profilePhoto3].filter(Boolean) as string[],
      isVerified: user.isVerified || false,
      onboardingCompleted: user.onboardingCompleted || false,
      preferences: user.preferences || undefined,
    });
  }, [userData, currentUserId, currentUserEmail]);

  // ✅ Save handler
  const handleSave = async () => {
    if (!profileData || !accessToken) return;
    setIsSaving(true);
    try {
      const updatePayload: UpdateProfileDto = {
        name: profileData.name,
        age: profileData.age,
        bio: profileData.bio,
        denomination: profileData.denomination as any,
        favoriteVerse: profileData.favoriteVerse,
        faithJourney: profileData.faithJourney as any,
        lookingFor: profileData.lookingFor,
        hobbies: profileData.hobbies,
        values: profileData.values,
        location: profileData.location?.address || undefined,
        latitude: profileData.location?.latitude ?? undefined,
        longitude: profileData.location?.longitude ?? undefined,
        fieldOfStudy: profileData.fieldOfStudy,
        profession: profileData.profession,
      };

      await updateProfileClient(updatePayload, accessToken);
      setSaveMessage('Profile saved successfully!');
      if (execute) await execute();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Error saving profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Photo upload handler
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileData || !accessToken) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const currentPhotoCount = profileData.photos.length;
      const photoNumber = currentPhotoCount < 3 ? currentPhotoCount + 1 : 1;

      const response = await uploadSpecificPhotoClient(photoNumber, formData, accessToken);
      const photoUrl = response?.photoUrl || response?.url || response?.data?.photoUrl;

      const updatedPhotosArray = [...(profileData.photos || [])];
      updatedPhotosArray[photoNumber - 1] = photoUrl;
      setProfileData(prev => (prev ? { ...prev, photos: updatedPhotosArray } : null));

      setSaveMessage('Photo uploaded successfully!');
      if (execute) await execute();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setSaveMessage('Error uploading photo. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Remove photo
  const removePhoto = async (index: number) => {
    if (!profileData || !accessToken) return;
    setIsSaving(true);
    try {
      const photoNumberToRemove = index + 1;
      const response = await API.User.deletePhoto(photoNumberToRemove);

      const updatedPhotosArray = [
        response.photos.profilePhoto1,
        response.photos.profilePhoto2,
        response.photos.profilePhoto3,
      ].filter(Boolean) as string[];

      setProfileData(prev => (prev ? { ...prev, photos: updatedPhotosArray } : null));
      setSaveMessage('Photo removed successfully!');
      if (execute) await execute();
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error removing photo:', err);
      setSaveMessage('Error removing photo. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        <p className="ml-4 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen text-white p-6">
        <ProfileHeader />
        <div className="max-w-4xl mx-auto p-4">
          <p className="text-lg text-yellow-300">
            We couldn't load your profile yet. Please refresh or complete onboarding.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white pb-20 no-horizontal-scroll dashboard-main">
      <ProfileHeader />
      <ProfileTabs activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="max-w-4xl mx-auto p-4 pb-20">
        {profileData && activeSection === 'photos' && (
          <PhotosSection
            profileData={profileData}
            handlePhotoUpload={handlePhotoUpload}
            removePhoto={removePhoto}
          />
        )}

        {profileData && activeSection === 'basics' && (
          <BasicInfoSection profileData={profileData} setProfileData={setProfileData} />
        )}

        {profileData && activeSection === 'passions' && (
          <PassionsSection profileData={profileData} setProfileData={setProfileData} />
        )}

        {profileData && activeSection === 'faith' && (
          <FaithSection profileData={profileData} setProfileData={setProfileData} />
        )}
      </div>

      <SaveButton isSaving={isSaving} saveMessage={saveMessage} handleSave={handleSave} />

      <div className="h-32" />
    </div>
  );
};

export default function ProtectedProfileWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
