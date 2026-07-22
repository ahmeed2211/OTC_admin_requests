import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { changePassword as changePasswordApi, logout as logoutApi } from '../api/auth.api';
import { LoginDto, ChangePasswordDto } from '../types/auth.types';

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    login: contextLogin,
    logout: contextLogout, 
    isAuthenticated,
  } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (dto: LoginDto) => {
    setLoading(true);
    setError(null);
    try {
      await contextLogin(dto);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Identifiants incorrects.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (dto: ChangePasswordDto) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await changePasswordApi(dto);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors du changement de mot de passe.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutApi();      
      contextLogout();       
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erreur lors de la déconnexion.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    changePassword,
  };
};