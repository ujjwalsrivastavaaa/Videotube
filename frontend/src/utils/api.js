const BASE_URL = import.meta.env.VITE_API_URL;

export const getAuthToken = () => localStorage.getItem('accessToken');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('accessToken', token);
};
export const removeAuthToken = () => localStorage.removeItem('accessToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');
export const setRefreshToken = (token) => {
  if (token) localStorage.setItem('refreshToken', token);
};
export const removeRefreshToken = () => localStorage.removeItem('refreshToken');

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if we are sending FormData (file uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    // In case server doesn't return JSON or returns empty
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return null;
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Something went wrong');
  }

  return data;
};
