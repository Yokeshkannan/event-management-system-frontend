/**
 * lib/auth.js — Auth helper utilities (localStorage token management)
 */

export const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const isAuthenticated = () => !!getToken();
export const isOrganizer = () => getUser()?.role === 'organizer';
export const isAttendee  = () => getUser()?.role === 'attendee';
