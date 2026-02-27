/* eslint-disable no-irregular-whitespace */
// services/api.ts - Comprehensive API service for all backend endpoints

import type { User, UserPreferences } from "@/types/User";


// Client-side authentication stub
// This function is modified to simply return what's in localStorage.
// It is no longer CRITICAL for authentication in the new cookie-based flow.
const auth = async () => {
    // This is a simplified client-side implementation for fetching the current access token.
    const accessToken = localStorage.getItem('accessToken');
    
    // We keep this structure to satisfy existing calls to await auth()
    return {
        accessToken: accessToken || null,
        // user: user object (if stored)
    };
};


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Information & Health Check Endpoints
export const SystemAPI = {
  // Get API information
  getApiInfo: async (): Promise<{
    name: string;
    version: string;
    description: string;
    endpoints: Record<string, string>;
  }> => {
    // Correct - already has /api
    return apiRequest('/api', { method: 'GET' }, false);
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    // Correct - already has /api
    return apiRequest('/api/health', { method: 'GET' }, false);
  },
};

// Types for API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  createdAt: string;
  user?: User;
  matchedUser?: User;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  matchId: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
  attachment?: {
    url: string;
    publicId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    resourceType?: string;
  } | null;
  replyTo?: {
    id: string;
    senderId: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'SYSTEM';
    attachment?: {
      url: string;
      publicId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      resourceType?: string;
    } | null;
  } | null;
  reactions?: Array<{
    userId: string;
    emoji: string;
    createdAt?: string;
  }>;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

interface Conversation {
  matchId: string;
  match: Match;
  lastMessage?: Message;
  unreadCount: number;
}

interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  author: User;
  isLiked?: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  location: string;
  organizerId: string;
  attendeesCount: number;
  createdAt: string;
  organizer: User;
  isJoined?: boolean;
}

interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  content: string;
  prayersCount: number;
  createdAt: string;
  user: User;
  hasPrayed?: boolean;
}

interface BlessingEntry {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  user: User;
}

interface PotentialMatch {
  id: string;
  name: string;
  age: number;
  profilePhotos?: {
    photo1?: string;
    photo2?: string;
    photo3?: string;
  };
  bio?: string;
  denomination?: string;
  interests?: string[];
  distance?: number;
}

interface MatchResult {
  isMatch: boolean;
  matchId?: string;
  message?: string;
}

interface TokenDebugInfo {
  userId: string;
  email: string;
  isValid: boolean;
  expiresAt: string;
}

interface Comment {

  id: string;

  postId: string;

  userId: string;

  content: string;

  createdAt: string;

  user: User;

}



export interface UpdateProfileDto {
  name?: string;
  gender?: 'MALE' | 'FEMALE';
  age?: number;
  denomination?: 'BAPTIST' | 'METHODIST' | 'PRESBYTERIAN' | 'PENTECOSTAL' | 'CATHOLIC' | 'ORTHODOX' | 'ANGLICAN' | 'LUTHERAN' | 'ASSEMBLIES_OF_GOD' | 'SEVENTH_DAY_ADVENTIST' | 'OTHER';
  bio?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber?: string;
  countryCode?: string;
  birthday?: string; // ISO 8601 date string
  fieldOfStudy?: string;
  profession?: string;
  faithJourney?: 'GROWING' | 'ESTABLISHED' | 'SEEKING';
  sundayActivity?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'RARELY';
  churchAttendance?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'RARELY';
  baptismStatus?: 'BAPTIZED' | 'NOT_BAPTIZED' | 'PENDING' | 'PREFER_NOT_TO_SAY';
  spiritualGifts?: string[];
  lookingFor?: string[];
  hobbies?: string[];
  interests?: string[];
  values?: string[];
  favoriteVerse?: string;
  drinkingHabit?: string;
  smokingHabit?: string;
  workoutHabit?: string;
  petPreference?: string;
  communicationStyle?: string[] | string;
  loveStyle?: string[] | string;
  educationLevel?: string;
  zodiacSign?: string;
  height?: string;
  language?: string;
  languageSpoken?: string[];
  preferredMinHeight?: number;
  personalPromptQuestion?: string;
  personalPromptAnswer?: string;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
}

export interface CompleteOnboardingDto {
  education: string;
  occupation: string;
  location: string;
  latitude: number;
  longitude: number;
  denomination: string;
  churchAttendance: string;
  baptismStatus: string;
  spiritualGifts: string[];
  interests: string[];
  relationshipGoals: string[];
  lifestyle: string;
  bio: string;
}

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UploadPhotosResponse {
  message: string;
  profilePhoto1?: string;
  profilePhoto2?: string;
  profilePhoto3?: string;
}

export interface UploadSinglePhotoResponse {
  message: string;
  photoUrl: string;
}

export interface DeletePhotoResponse {
  message: string;
  photoNumber: number;
  photos: {
    profilePhoto1?: string | null;
    profilePhoto2?: string | null;
    profilePhoto3?: string | null;
  }
}

// Generic API request function
const apiRequest = async <T = unknown>(
  endpoint: string, 
  options: RequestInit = {},
  requireAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`; // Ensure leading slash
  
  const headers: Record<string, string> = {
    // Default Content-Type, will be overridden or removed below
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // --- CRITICAL FIX: Ensure Content-Type is NOT set for FormData ---
  if (options.body instanceof FormData) {
    delete headers['Content-Type']; 
  } else if (options.headers) {
    // Handle existing headers, ensuring 'Content-Type' is not double-set 
    // if it was already explicitly passed in `options.headers`
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => { headers[key] = value; });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => { headers[key] = value; });
    } else {
      Object.assign(headers, options.headers);
    }

    // Re-check Content-Type deletion after header merge for FormData
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
  } else {
    headers['Content-Type'] = 'application/json';
  }


  // --- CRITICAL FIX: Removed the mandatory Bearer Token check ---
  if (requireAuth) {
    const session = await auth();
    const token = session?.accessToken;

    if (token) {
        // We can still send the Bearer header if a token exists in localStorage
        headers.Authorization = `Bearer ${token}`;
    }
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // ✅ CRITICAL FIX: This ensures the browser automatically attaches
      // the HTTP-only cookies (like 'token' or 'connect.sid') to the request.
      credentials: 'include', 
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Create a more detailed error object
      const apiError = new Error(errorMessage) as Error & {
        statusCode: number;
        endpoint: string;
        isNetworkError: boolean;
        isCorsError: boolean;
      };
      
      apiError.statusCode = response.status;
      apiError.endpoint = endpoint;
      apiError.isNetworkError = false;
      apiError.isCorsError = false;
      
      // If the server returns 401, it's the final authority that auth failed.
      if (response.status === 401) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (apiError as any).isAuthError = true;
          apiError.message = 'Authentication required or session expired.';
      }

      throw apiError;
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    }
    
    return response as T;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    
    // Enhance error with additional context for better user messaging
    if (error instanceof Error) {
      const enhancedError = error as Error & {
        statusCode?: number;
        endpoint: string;
        isNetworkError: boolean;
        isCorsError: boolean;
        isAuthError: boolean;
      };
      
      if (!enhancedError.statusCode) {
        enhancedError.endpoint = endpoint;
        enhancedError.isNetworkError = true;
        
        // Improved CORS error detection
        const errorMessage = error.message.toLowerCase();
        const isCorsError = errorMessage.includes('cors') || 
                             errorMessage.includes('access-control-allow-origin') ||
                             errorMessage.includes('preflight') ||
                             (errorMessage.includes('networkerror') && navigator.onLine !== false);
        
        if (isCorsError) {
          enhancedError.isCorsError = true;
          enhancedError.message = 'Server connection blocked. This appears to be a server configuration issue (CORS).';
        } else if (errorMessage.includes('networkerror') || errorMessage.includes('failed to fetch')) {
          enhancedError.message = 'Network connection failed. Please check your internet connection.';
        }
      } else if (enhancedError.statusCode === 401) {
        // Handle JWT token expiration
        enhancedError.isAuthError = true;
        if (error.message.includes('Invalid or expired token') || error.message.includes('Authentication required')) {
          enhancedError.message = 'Your session has expired. Please sign in again.';
        }
      }
    }
    
    throw error;
  }
};

// 🔐 Authentication Endpoints
export const AuthAPI = {
  // Register a new user
  register: async (userData: {
    email: string;
    password: string;
    name: string;
    age: number;
  }): Promise<AuthTokens> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthTokens> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  },

  // Refresh JWT token
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, false);
  },

  // Logout user
  logout: async (): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Logout from all devices
  logoutAll: async (): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/logout-all', {
      method: 'POST',
    });
  },

  // Complete user onboarding
  completeOnboarding: async (onboardingData: CompleteOnboardingDto): Promise<User> => {
    // FIX: Added /api prefix
    return apiRequest('/api/auth/complete-onboarding', {
      method: 'PUT',
      body: JSON.stringify(onboardingData),
    });
  },

  // Google OAuth token exchange - Already correct with /api
  googleAuth: async (googleData: {
    email: string;
    name: string;
    picture: string;
    googleId: string;
  }): Promise<AuthTokens> => {
    return apiRequest('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }, false);
  },

  // Debug: Check if user exists (for testing only)
  debugUser: async (email: string): Promise<{ exists: boolean; user?: User }> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/auth/debug/user/${encodeURIComponent(email)}`, {
      method: 'GET',
    }, false);
  },

  // Initiate Google OAuth login - Already correct with /api
  initiateGoogleAuth: async (): Promise<{ authUrl: string }> => {
    return apiRequest('/api/auth/google', {
      method: 'GET',
    }, false);
  },
};

// 👤 User Management API
export const UserAPI = {
  // Debug token endpoint
  debugToken: async (): Promise<TokenDebugInfo> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/debug');
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me');
  },

  // Update current user profile
  updateMe: async (userData: UpdateProfileDto): Promise<User> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Update user settings
  updateSettings: async (settings: Record<string, any>): Promise<{ message: string }> => {
    return apiRequest('/api/users/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  // Get user preferences
  getPreferences: async (): Promise<UserPreferences> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me/preferences');
  },

  // Update user preferences
  updatePreferences: async (preferences: UserPreferences): Promise<UserPreferences> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  // Deactivate user account
  deactivateAccount: async (): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me/deactivate', {
      method: 'POST',
    });
  },

  // Reactivate user account
  reactivateAccount: async (): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me/reactivate', {
      method: 'POST',
    });
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/users/${id}`);
  },

  // Search users with advanced filters
  searchUsers: async (params: {
    age_min?: number;
    age_max?: number;
    denomination?: string;
    interests?: string[];
    location?: string;
    radius?: number;
  }): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/users/search/advanced?${new URLSearchParams(params as Record<string, string>)}`);
  },

  // Get all users with optional filters
  getAllUsers: async (filters?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GetUsersResponse> => {
    const queryParams: Record<string, string> = {};
    if (filters?.page) queryParams.page = filters.page.toString();
    if (filters?.limit) queryParams.limit = filters.limit.toString();
    if (filters?.search) queryParams.search = filters.search;

    const query = Object.keys(queryParams).length > 0 ? `?${new URLSearchParams(queryParams).toString()}` : '';
    // FIX: Corrected to `/api/users`
    return apiRequest(`/api/users${query}`);
  },

  // Upload multiple photos
  uploadPhotos: async (photos: FormData): Promise<UploadPhotosResponse> => {
    // FIX: Added /api prefix
    return apiRequest('/api/users/me/photos', {
      method: 'POST',
      body: photos,
      headers: {}, // Let apiRequest handle Content-Type for FormData
    });
  },

  // Upload specific photo by number
  uploadSpecificPhoto: async (photoNumber: number, photo: FormData): Promise<UploadSinglePhotoResponse> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/users/me/photo/${photoNumber}`, {
      method: 'POST',
      body: photo,
      headers: {}, // Let apiRequest handle Content-Type for FormData
    });
  },

  // Delete specific photo by number
  deletePhoto: async (photoNumber: number): Promise<DeletePhotoResponse> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/users/me/photo/${photoNumber}`, {
      method: 'DELETE',
    });
  },
};

// Matching API
export const MatchAPI = {
  // Get user's matches
  getMatches: async (): Promise<Match[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/matches');
  },

  // Get potential matches for user
  getPotentialMatches: async (): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/matches/potential');
  },

  // Create a new match
  createMatch: async (matchedUserId: string): Promise<{ match: Match; created: boolean; }> => {
    // FIX: Added /api prefix
    return apiRequest('/api/match/create', {
      method: 'POST',
      body: JSON.stringify({ matchedUserId }),
    });
  },

  // Like a user
  likeUser: async (userId: string): Promise<MatchResult> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/matches/like/${userId}`, {
      method: 'POST',
    });
  },

  // Pass on a user
  passUser: async (userId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/matches/pass/${userId}`, {
      method: 'POST',
    });
  },
};

// 💬 Messaging API
export const MessageAPI = {
  // Get user conversations
  getMatchConversations: async (): Promise<Conversation[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/matches/conversations');
  },


  // Get unread message count
  getUnreadCount: async (): Promise<{ count: number }> => {
    // FIX: Added /api prefix
    return apiRequest('/api/messages/unread-count');
  },

  // Send a message
  sendMessage: async (messageData: {
    matchId: string;
    content: string;
  }): Promise<Message> => {
    // FIX: Added /api prefix
    return apiRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  // Get messages for a match
  getMatchMessages: async (matchId: string, page: number = 1, limit: number = 50): Promise<Message[]> => {
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() }).toString();
    // FIX: Added /api prefix
    return apiRequest(`/api/messages/${matchId}?${query}`);
  },

  // Mark message as read
  markMessageAsRead: async (messageId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },
};

// Payments API
export const PaymentAPI = {
  initialize: async (payload: { tier: 'premium' | 'elite'; currency: 'NGN' | 'USD' }): Promise<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
    amount: number;
    currency: 'NGN' | 'USD';
  }> => {
    return apiRequest('/api/payments/initialize', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verify: async (reference: string) => {
    return apiRequest('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
  },
};

// Support API
export const SupportAPI = {
  submitTicket: async (payload: { type: 'HELP' | 'REPORT'; subject?: string; message: string }) => {
    return apiRequest('/api/support', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// 🔔 Notifications API
export const NotificationAPI = {
  getNotifications: async (): Promise<any[]> => {
    return apiRequest('/api/notifications');
  },
  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiRequest('/api/notifications/unread-count');
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },
  markAllAsRead: async (): Promise<void> => {
    await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
  },
};

// 🏛️ Community API
export const CommunityAPI = {
  // Posts
  createPost: async (postData: {
    content: string;
    imageUrl?: string;
  }): Promise<CommunityPost> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  getPosts: async (): Promise<CommunityPost[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/posts');
  },

  likePost: async (postId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  unlikePost: async (postId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/posts/${postId}/like`, {
      method: 'DELETE',
    });
  },

  commentOnPost: async (postId: string, comment: {
    content: string;
  }): Promise<Comment> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  },

  // Events
  createEvent: async (eventData: {
    title: string;
    description: string;
    dateTime: string;
    location: string;
  }): Promise<CommunityEvent> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  getEvents: async (): Promise<CommunityEvent[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/events');
  },

  joinEvent: async (eventId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/events/${eventId}/join`, {
      method: 'POST',
    });
  },

  leaveEvent: async (eventId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/events/${eventId}/join`, {
      method: 'DELETE',
    });
  },

  // Prayers
  createPrayerRequest: async (prayerData: {
    title: string;
    content: string;
  }): Promise<PrayerRequest> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/prayers', {
      method: 'POST',
      body: JSON.stringify(prayerData),
    });
  },

  getPrayerRequests: async (): Promise<PrayerRequest[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/prayers');
  },

  prayForRequest: async (prayerRequestId: string): Promise<void> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/community/prayers/${prayerRequestId}/pray`, {
      method: 'POST',
    });
  },

  // Blessings
  createBlessing: async (blessingData: {
    content: string;
  }): Promise<BlessingEntry> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/bless', {
      method: 'POST',
      body: JSON.stringify(blessingData),
    });
  },

  getBlessings: async (): Promise<BlessingEntry[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/bless');
  },

  // Highlights
  getHighlights: async (): Promise<CommunityPost[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/community/highlights');
  },
};

// 🔍 Discovery API
export const DiscoveryAPI = {
  getNearbyUsers: async (params?: {
    age_min?: number;
    age_max?: number;
    denomination?: string;
    interests?: string[];
    location?: string;
    radius?: number;
  }): Promise<User[]> => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    // FIX: Added /api prefix
    return apiRequest(`/api/discover/nearby${query}`);
  },

  getUsersByVerse: async (verse: string): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/discover/verse/${encodeURIComponent(verse)}`);
  },

  getUsersByInterest: async (interest: string): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest(`/api/discover/interest/${encodeURIComponent(interest)}`);
  },

  getUsersByInterests: async (interests: string[]): Promise<User[]> => {
    const normalized = (Array.isArray(interests) ? interests : [])
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter((value) => value.length > 0);
    const query = new URLSearchParams();
    if (normalized.length > 0) {
      query.set('interests', normalized.join(','));
    }
    return apiRequest(`/api/discover/interests${query.toString() ? `?${query.toString()}` : ''}`);
  },

  getActiveUsers: async (): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/discover/active');
  },

  getActiveTodayUsers: async (): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/discover/active-today');
  },

  getStats: async (): Promise<{ totalUsers: number; activeToday: number; totalMatches: number }> => {
    // FIX: Added /api prefix
    return apiRequest('/api/discover/stats');
  },

  getDailyChallenge: async (): Promise<{ challenge: string; verse: string; date: string }> => {
    // FIX: Added /api prefix
    return apiRequest('/api/discover/challenge');
  },

  // Filter profiles based on criteria
  filterProfiles: async (filters: {
    preferredGender?: 'MALE' | 'FEMALE';
    preferredDenominations?: string[];
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
    preferredFaithJourney?: string[];
    preferredChurchAttendance?: string[];
    preferredRelationshipGoals?: string[];
  }): Promise<User[]> => {
    // FIX: Added /api prefix
    return apiRequest('/api/discover/filter', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  },
};

// Export all APIs
export const API = {
  System: SystemAPI,
  Auth: AuthAPI,
  User: UserAPI,
  Payment: PaymentAPI,
  Support: SupportAPI,
  Match: MatchAPI,
  Message: MessageAPI,
  Notification: NotificationAPI,
  Community: CommunityAPI,
  Discovery: DiscoveryAPI,
};

// Export types
export type {
  User,
  UserPreferences,
  Match,
  Message,
  Conversation,
  CommunityPost,
  CommunityEvent,
  PrayerRequest,
  BlessingEntry,
  PotentialMatch,
  AuthTokens,
  ApiResponse,
  ApiError,
};

export default API;
