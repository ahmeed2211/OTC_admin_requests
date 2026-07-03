import { User } from './user.types';

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<User, 'password'>;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}