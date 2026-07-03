export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phonenumber: string;
  department: string;
  role: UserRole;
  isActive: boolean;
  totalRequests: number;
  createdAt: string;
  updatedAt: string;
}
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phonenumber: string;
  department: string;
  role: UserRole;
}
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phonenumber?: string;
  department?: string;
  role?: UserRole;
}