/**
 * lib/api.js — Central API client for all backend requests
 * Automatically attaches JWT token from localStorage
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getHeaders = (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
};

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (body) =>
    fetch(`${API_URL}/auth/register`, {
      method: 'POST', headers: getHeaders(false), body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST', headers: getHeaders(false), body: JSON.stringify(body),
    }).then(handleResponse),

  me: () =>
    fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  updateProfile: (body) =>
    fetch(`${API_URL}/auth/profile`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),

  updatePassword: (body) =>
    fetch(`${API_URL}/auth/password`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),
};

// ─── Events ────────────────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${API_URL}/events${qs ? '?' + qs : ''}`, {
      headers: getHeaders(false),
    }).then(handleResponse);
  },

  getById: (id) =>
    fetch(`${API_URL}/events/${id}`, { headers: getHeaders(false) }).then(handleResponse),

  getMyEvents: () =>
    fetch(`${API_URL}/events/organizer/my-events`, { headers: getHeaders() }).then(handleResponse),

  create: (body) =>
    fetch(`${API_URL}/events`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),

  update: (id, body) =>
    fetch(`${API_URL}/events/${id}`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE', headers: getHeaders(),
    }).then(handleResponse),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return fetch(`${API_URL}/upload`, {
      method: 'POST', headers, body: formData,
    }).then(handleResponse);
  },
};

// ─── Bookings ──────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create: (body) =>
    fetch(`${API_URL}/bookings`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),

  getMyBookings: () =>
    fetch(`${API_URL}/bookings/my`, { headers: getHeaders() }).then(handleResponse),

  getEventBookings: (eventId) =>
    fetch(`${API_URL}/bookings/event/${eventId}`, { headers: getHeaders() }).then(handleResponse),

  cancel: (id) =>
    fetch(`${API_URL}/bookings/${id}/cancel`, {
      method: 'PATCH', headers: getHeaders(),
    }).then(handleResponse),
};

// ─── Tickets ───────────────────────────────────────────────────────────────
export const ticketsAPI = {
  getByEvent: (eventId) =>
    fetch(`${API_URL}/tickets/event/${eventId}`, { headers: getHeaders(false) }).then(handleResponse),

  createType: (body) =>
    fetch(`${API_URL}/tickets/types`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(body),
    }).then(handleResponse),
};
