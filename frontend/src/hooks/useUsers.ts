import { useState, useCallback } from 'react';
import {
  createUser as createUserApi,
  getAllUsers as getAllUsersApi,
  getUserById as getUserByIdApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  toggleUserActive as toggleUserActiveApi,
  resetPassword as resetPasswordApi,
} from '../api/users.api';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '../types/user.types';

export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async <T>(fn: () => Promise<{ data: T }>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await fn();
      return data;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Une erreur est survenue.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createUser = useCallback(
    (dto: CreateUserDto) => handle<User>(() => createUserApi(dto)),
    [],
  );

  const getAllUsers = useCallback(
    (role?: UserRole) => handle<User[]>(() => getAllUsersApi(role)),
    [],
  );

  const getUserById = useCallback(
  (id: string) => handle<User>(() => getUserByIdApi(id)),
  [],
);

  const updateUser = useCallback(
    (id: string, dto: UpdateUserDto) =>
      handle<User>(() => updateUserApi(id, dto)),
    [],
  );

  const deleteUser = useCallback(
    (id: string) => handle<{ message: string }>(() => deleteUserApi(id)),
    [],
  );

  const toggleUserActive = useCallback(
    (id: string) => handle<User>(() => toggleUserActiveApi(id)),
    [],
  );

  const resetPassword = useCallback(
    (id: string, currentPassword: string, newPassword: string) =>
      handle<{ message: string }>(() =>
        resetPasswordApi(id, currentPassword, newPassword),
      ),
    [],
  );

  return {
    loading,
    error,
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    toggleUserActive,
    resetPassword,
  };
};