// src/utils/api.js
import { supabase } from './supabase';

export async function fetchAccommodations(filters = {}) {
  let query = supabase
    .from('accommodations')
    .select(`
      *,
      accommodation_amenities (*),
      accommodation_images (id, image_url, is_primary)
    `)
    .eq('is_available', true);

  // Apply filters if provided
  if (filters.university) {
    query = query.eq('university', filters.university);
  }
  if (filters.campus) {
    query = query.eq('campus', filters.campus);
  }
  if (filters.minPrice) {
    query = query.gte('price_per_month', filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte('price_per_month', filters.maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching accommodations:', error);
    throw error;
  }

  return data || [];
}