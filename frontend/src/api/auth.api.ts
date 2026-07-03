import api from './axios.config';

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const changePassword = (currentPassword: string, newPassword: string) =>
  api.post('/auth/change-password', { currentPassword, newPassword });