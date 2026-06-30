// src/utils/api.js
import { accommodationApi } from '../services/api';

/**
 * Fetch accommodations with optional filters
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} List of accommodations
 */
export async function fetchAccommodations(filters = {}) {
  try {
    // Map filter names to match the backend API
    const apiFilters = {
      is_available: true,
      ...filters,
      // Map filter names if they're different
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
    };
    
    // Remove undefined values
    Object.keys(apiFilters).forEach(key => 
      apiFilters[key] === undefined && delete apiFilters[key]
    );
    
    const data = await accommodationApi.getAll(apiFilters);
    // New API returns { results, total }; older callers expect an array.
    if (Array.isArray(data)) return data;
    return (data && data.results) || [];
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    throw error;
  }
}

// Re-export all API methods for convenience
export * from '../services/api';