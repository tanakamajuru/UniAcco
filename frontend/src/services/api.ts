import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api`;

// Helper function to handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && (data.error || data.message)) || response.statusText;
    return Promise.reject(error);
  }
  return data;
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },
  
  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  
  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
};

// Accommodation API
export const accommodationApi = {
  // Get all accommodations with optional filters
  getAll: async (filters: Record<string, any> = {}) => {
    const queryParams = new URLSearchParams(
      Object.entries(filters).reduce<Record<string, string>>((params, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') params[key] = String(value);
        return params;
      }, {})
    ).toString();
    const response = await fetch(`${API_URL}/accommodations?${queryParams}`);
    return handleResponse(response);
  },

  // Get accommodation by ID
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/accommodations/${id}`);
    return handleResponse(response);
  },

  // Create new accommodation (admin only)
  create: async (data: any) => {
    const response = await fetch(`${API_URL}/accommodations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update accommodation (admin only)
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/accommodations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete accommodation (admin only)
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/accommodations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Bookings API
export const bookingApi = {
  // Create a new booking (student only)
  create: async (bookingData: any) => {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  // Get current user's bookings (student only)
  getMyBookings: async () => {
    const response = await fetch(`${API_URL}/bookings/my-bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Cancel a booking (student only)
  cancel: async (id: string) => {
    const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get bookings for landlord's properties (landlord only)
  getPropertyBookings: async () => {
    const response = await fetch(`${API_URL}/bookings/property-bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update booking status (landlord only)
  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/bookings/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },
};

// Reviews API
export const reviewApi = {
  // Create review for completed booking (student only)
  create: async (reviewData: any) => {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Get reviews for an accommodation
  getByAccommodation: async (accommodationId: string) => {
    const response = await fetch(`${API_URL}/reviews/accommodation/${accommodationId}`);
    return handleResponse(response);
  },

  // Get current student's reviews
  getMyReviews: async () => {
    const response = await fetch(`${API_URL}/reviews/my-reviews`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete review (student can delete own review)
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Favorites API
export const favoriteApi = {
  // Add accommodation to favorites (student only)
  add: async (accommodationId: string) => {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ accommodationId }),
    });
    return handleResponse(response);
  },

  // Get current student's favorite accommodations
  getMyFavorites: async () => {
    const response = await fetch(`${API_URL}/favorites`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Remove accommodation from favorites
  remove: async (accommodationId: string) => {
    const response = await fetch(`${API_URL}/favorites/${accommodationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Health Check API
export const healthApi = {
  check: async () => {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse(response);
  },
};
