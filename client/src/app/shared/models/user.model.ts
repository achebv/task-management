export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}
