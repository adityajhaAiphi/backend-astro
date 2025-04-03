// API configuration file
// Force production URL for now
export const API_BASE_URL = 'https://astroalert-backend-m1hn.onrender.com/api';

export const AUTH_ENDPOINTS = {
  signin: `${API_BASE_URL}/auth/signin`,
  signout: `${API_BASE_URL}/auth/signout`,
  signup: `${API_BASE_URL}/auth/signup`,
};
