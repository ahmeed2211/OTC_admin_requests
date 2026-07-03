import api from './axios.config';
import { LoginDto, LoginResponse, ChangePasswordDto } from '../types/auth.types';
 
export const login = (dto: LoginDto): Promise<{ data: LoginResponse }> =>
  api.post('/auth/login', dto);
 
export const changePassword = (dto: ChangePasswordDto): Promise<{ data: { message: string } }> =>
  api.post('/auth/change-password', dto);
 