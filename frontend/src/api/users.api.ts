import api from './axios.config';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '../types/user.types';

export const createUser = (dto: CreateUserDto): Promise<{ data: User }> =>
  api.post('/users', dto);

export const getAllUsers = (role?: UserRole): Promise<{ data: User[] }> =>
  api.get('/users', { params: role ? { role } : undefined });

export const getUserById = (id: string): Promise<{ data: User }> =>
  api.get(`/users/${id}`);

export const updateUser = (
  id: string,
  dto: UpdateUserDto,
): Promise<{ data: User }> =>
  api.patch(`/users/${id}`, dto);

export const deleteUser = (id: string): Promise<{ data: { message: string } }> =>
  api.delete(`/users/${id}`);

export const toggleUserActive = (id: string): Promise<{ data: User }> =>
  api.patch(`/users/${id}/toggle-active`);

export const resetPassword = (
  id: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ data: { message: string } }> =>
  api.patch(`/users/${id}/reset-password`, { currentPassword, newPassword });