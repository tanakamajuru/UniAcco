// src/services/api.js — UniAcco API client
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getToken = () => localStorage.getItem('token');

export const parseJwt = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const currentRole = () => {
  const t = getToken();
  return t ? parseJwt(t)?.role || null : null;
};

// Resolve an image path returned by the API (e.g. "/uploads/...") to an absolute URL.
export const imageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const isForm = options.body instanceof FormData;
  const headers = {
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

const qs = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.append(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

// ---------------- Auth ----------------
export const authApi = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
};

export const userApi = {
  updateMe: (body) => request('/api/users/me', { method: 'PATCH', body: JSON.stringify(body) }),
  verify: (body) => request('/api/users/verify', { method: 'POST', body: JSON.stringify(body) }),
};

// ---------------- Lookups ----------------
export const universityApi = {
  getAll: () => request('/api/universities'),
};
export const amenityApi = {
  getAll: () => request('/api/amenities'),
};

// ---------------- Accommodations ----------------
export const accommodationApi = {
  getAll: (filters = {}) => request(`/api/accommodations${qs(filters)}`),
  getById: (id) => request(`/api/accommodations/${id}`),
  create: (body) =>
    request('/api/accommodations', {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  update: (id, body) =>
    request(`/api/accommodations/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id) => request(`/api/accommodations/${id}`, { method: 'DELETE' }),
  landlord: () => request('/api/accommodations/landlord'),
};

// ---------------- Favourites (local-only, no account or server) ----------------
// Saved listings live in the browser so we never store this preference
// server-side. `list()` hydrates the saved ids into full accommodation objects.
const FAV_KEY = 'uniacco.favourites';

const readFavIds = () => {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const writeFavIds = (ids) => {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* storage unavailable (private mode) — favourites just won't persist */
  }
};

export const favouriteApi = {
  ids: () => readFavIds(),
  has: (id) => readFavIds().includes(id),
  add: (id) => {
    writeFavIds([...readFavIds(), id]);
    return Promise.resolve({ ok: true });
  },
  remove: (id) => {
    writeFavIds(readFavIds().filter((x) => x !== id));
    return Promise.resolve({ ok: true });
  },
  // Hydrate saved ids into accommodation objects; drop any that no longer exist.
  list: async () => {
    const results = await Promise.all(
      readFavIds().map((id) => accommodationApi.getById(id).catch(() => null))
    );
    return results.filter(Boolean);
  },
};

// ---------------- Applications ----------------
export const applicationApi = {
  create: (body) => request('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  mine: () => request('/api/applications/mine'),
  landlord: () => request('/api/applications/landlord'),
  setStatus: (id, status) =>
    request(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// ---------------- Payments ----------------
export const paymentApi = {
  initiate: (body) => request('/api/payments/initiate', { method: 'POST', body: JSON.stringify(body) }),
  status: (reference) => request(`/api/payments/status/${reference}`),
  history: () => request('/api/payments/history'),
};

// ---------------- Host ----------------
export const hostApi = {
  stats: () => request('/api/host/stats'),
  applicants: () => request('/api/host/applicants'),
};

// ---------------- Compatibility shims (legacy pages) ----------------
export const campusApi = {
  getAll: async () => [],
  getById: async () => null,
};
export const bookingApi = {
  getMyBookings: () => applicationApi.mine(),
};

export default {
  auth: authApi,
  user: userApi,
  university: universityApi,
  amenity: amenityApi,
  accommodation: accommodationApi,
  favourite: favouriteApi,
  application: applicationApi,
  payment: paymentApi,
  host: hostApi,
};
