import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of the user info we'll store
interface UserInfo {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

// Define the state and actions
interface AuthState {
  userInfo: UserInfo | null;
  setUserInfo: (info: UserInfo | null) => void;
}

// Create the store
// We use 'persist' middleware to save the user info in localStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,
      setUserInfo: (info) => set({ userInfo: info }),
    }),
    {
      name: 'faithbliss-auth', // Name for the localStorage item
    }
  )
);