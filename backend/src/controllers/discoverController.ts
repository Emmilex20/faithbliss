// src/controllers/discoverController.ts

import { Request, Response } from 'express';
import { admin, usersCollection } from '../config/firebase-admin';
import type { DocumentData } from 'firebase-admin/firestore';

interface IUserProfile extends DocumentData {
  id: string;
  name?: string;
  email?: string;
  gender?: string;
  age?: number;
  denomination?: string;
  location?: string;
  profilePhoto1?: string;
  profilePhoto2?: string;
  profilePhoto3?: string;
  faithJourney?: string;
  churchAttendance?: string;
  sundayActivity?: string;
  relationshipGoals?: string[];
  hobbies?: string[];
  values?: string[];
  favoriteVerse?: string;
  profession?: string;
  fieldOfStudy?: string;
  lookingFor?: string[];
  latitude?: number;
  longitude?: number;
  likes?: string[];
  passes?: string[];
  matches?: string[];
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const filterProfiles = async (req: Request, res: Response) => {
  const uid = req.userId;
  if (!uid) {
    return res.status(401).json({ message: 'Unauthorized: Firebase UID missing.' });
  }

  const userDoc = await usersCollection.doc(uid).get();
  if (!userDoc.exists) {
    return res.status(404).json({ message: 'User profile not found.' });
  }

  const currentUser = { id: userDoc.id, ...userDoc.data() } as IUserProfile;

  const {
    preferredGender,
    preferredDenominations,
    preferredDenomination,
    minAge,
    maxAge,
    maxDistance,
    preferredFaithJourney,
    preferredChurchAttendance,
    preferredRelationshipGoals,
  } = req.body || {};

  const denominationList: string[] | undefined =
    preferredDenominations || preferredDenomination;

  const min = typeof minAge === 'number' ? minAge : undefined;
  const max = typeof maxAge === 'number' ? maxAge : undefined;

  const excluded = new Set<string>([
    currentUser.id,
    ...(currentUser.likes || []),
    ...(currentUser.passes || []),
    ...(currentUser.matches || []),
  ]);

  const snapshot = await usersCollection
    .where('onboardingCompleted', '==', true)
    .get();

  const results: IUserProfile[] = [];

  snapshot.forEach((doc) => {
    if (excluded.has(doc.id)) return;
    const u = { id: doc.id, ...doc.data() } as IUserProfile;

    if (preferredGender && u.gender !== preferredGender) return;
    if (typeof min === 'number' && typeof u.age === 'number' && u.age < min) return;
    if (typeof max === 'number' && typeof u.age === 'number' && u.age > max) return;

    if (denominationList?.length && (!u.denomination || !denominationList.includes(u.denomination))) {
      return;
    }

    if (preferredFaithJourney?.length && (!u.faithJourney || !preferredFaithJourney.includes(u.faithJourney))) {
      return;
    }

    const attendance = u.churchAttendance || u.sundayActivity;
    if (preferredChurchAttendance?.length && (!attendance || !preferredChurchAttendance.includes(attendance))) {
      return;
    }

    if (preferredRelationshipGoals?.length) {
      const goals = Array.isArray(u.relationshipGoals) ? u.relationshipGoals : [];
      const hasGoal = goals.some((g) => preferredRelationshipGoals.includes(g));
      if (!hasGoal) return;
    }

    if (
      typeof maxDistance === 'number' &&
      typeof currentUser.latitude === 'number' &&
      typeof currentUser.longitude === 'number' &&
      typeof u.latitude === 'number' &&
      typeof u.longitude === 'number'
    ) {
      const distance = haversineKm(currentUser.latitude, currentUser.longitude, u.latitude, u.longitude);
      if (distance > maxDistance) return;
      (u as any).distance = Math.round(distance);
    }

    results.push(u);
  });

  return res.status(200).json(
    results.map((u) => ({
      id: u.id,
      name: u.name,
      age: u.age,
      gender: u.gender,
      denomination: u.denomination,
      location: u.location,
      profilePhoto1: u.profilePhoto1,
      profilePhoto2: u.profilePhoto2,
      profilePhoto3: u.profilePhoto3,
      bio: u.bio,
      faithJourney: u.faithJourney,
      churchAttendance: u.churchAttendance || u.sundayActivity,
      relationshipGoals: u.relationshipGoals,
      hobbies: u.hobbies,
      values: u.values,
      favoriteVerse: u.favoriteVerse,
      profession: u.profession,
      fieldOfStudy: u.fieldOfStudy,
      lookingFor: u.lookingFor,
      distance: (u as any).distance,
    }))
  );
};
