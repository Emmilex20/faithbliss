import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL; 

export const uploadPhotosToCloudinary = async (files: File[]) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken(); 

  const formData = new FormData();
  files.forEach((file) => formData.append('photos', file));

  const res = await fetch(`${API_URL}/api/uploads/upload-photos`, { // <-- FIX IS HERE
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`, 
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
