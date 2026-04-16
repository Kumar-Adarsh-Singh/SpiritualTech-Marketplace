import api from './api';

export const googleLogin = (code, redirectUri) =>
  api.post('auth/google/', { code, redirect_uri: redirectUri });

export const githubLogin = (code, redirectUri) =>
  api.post('auth/github/', { code, redirect_uri: redirectUri });

export const refreshToken = (refresh) =>
  api.post('auth/token/refresh/', { refresh });

export const getProfile = () =>
  api.get('auth/profile/');

export const updateProfile = (data) =>
  api.patch('auth/profile/', data);
