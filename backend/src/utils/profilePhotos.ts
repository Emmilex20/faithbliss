export const MIN_REQUIRED_PROFILE_PHOTOS = 3;

export const PROFILE_PHOTO_FIELDS = [
  'profilePhoto1',
  'profilePhoto2',
  'profilePhoto3',
  'profilePhoto4',
  'profilePhoto5',
  'profilePhoto6',
] as const;

type ProfilePhotoRecord = Partial<Record<(typeof PROFILE_PHOTO_FIELDS)[number], unknown>> & {
  profilePhotoCount?: unknown;
};

export const countProfilePhotos = (record?: ProfilePhotoRecord | null): number => {
  if (!record) return 0;

  if (typeof record.profilePhotoCount === 'number' && Number.isFinite(record.profilePhotoCount)) {
    return Math.max(0, Math.min(PROFILE_PHOTO_FIELDS.length, Math.round(record.profilePhotoCount)));
  }

  let count = 0;
  for (const field of PROFILE_PHOTO_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) {
      count += 1;
    }
  }

  return count;
};
