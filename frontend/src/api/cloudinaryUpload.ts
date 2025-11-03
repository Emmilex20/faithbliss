import { getAuth } from 'firebase/auth';

export const uploadPhotosToCloudinary = async (files: File[]) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken(); // 🔑 Firebase ID token

  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const res = await fetch('http://localhost:5000/api/uploads/upload-photos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, // 🔑 Send token
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Upload failed');
  }

  const data = await res.json();
  return data.urls as string[];
};
