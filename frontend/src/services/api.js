// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Generic API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Accommodation API
export const accommodationApi = {
  // Get all accommodations with optional filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/api/accommodations${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get accommodation by ID
  getById: async (id) => {
    return apiRequest(`/api/accommodations/${id}`);
  },

  // Create new accommodation (landlord only)
  create: async (accommodationData) => {
    return apiRequest('/api/accommodations', {
      method: 'POST',
      body: JSON.stringify(accommodationData),
    });
  },

  // Update accommodation (landlord only)
  update: async (id, accommodationData) => {
    return apiRequest(`/api/accommodations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accommodationData),
    });
  },

  // Delete accommodation (landlord only)
  delete: async (id) => {
    return apiRequest(`/api/accommodations/${id}`, {
      method: 'DELETE',
    });
  },

  // Get landlord's properties
  getLandlordProperties: async () => {
    return apiRequest('/api/properties/landlord');
  },
};

// University API
export const universityApi = {
  // Get all universities
  getAll: async () => {
    return apiRequest('/api/universities');
  },

  // Get university by ID
  getById: async (id) => {
    return apiRequest(`/api/universities/${id}`);
  },

  // Get campuses for a university
  getCampuses: async (universityId) => {
    return apiRequest(`/api/universities/${universityId}/campuses`);
  },
};

// Campus API
export const campusApi = {
  // Get all campuses
  getAll: async () => {
    return apiRequest('/api/campuses');
  },

  // Get campus by ID
  getById: async (id) => {
    return apiRequest(`/api/campuses/${id}`);
  },
};

// Booking API
export const bookingApi = {
  // Get user's bookings
  getMyBookings: async () => {
    return apiRequest('/api/bookings/my-bookings');
  },

  // Create booking
  create: async (bookingData) => {
    return apiRequest('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel booking
  cancel: async (id) => {
    return apiRequest(`/api/bookings/${id}/cancel`, {
      method: 'PUT',
    });
  },
};

// Auth API
export const authApi = {
  // Login
  login: async (credentials) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get profile
  getProfile: async () => {
    return apiRequest('/api/auth/profile');
  },

  // Update profile
  updateProfile: async (userData) => {
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Export all APIs
export default {
  accommodation: accommodationApi,
  university: universityApi,
  campus: campusApi,
  booking: bookingApi,
  auth: authApi,
};
