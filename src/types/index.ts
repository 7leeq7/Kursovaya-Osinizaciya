export interface User {
  id: number;
  username: string;
  email: string;
  role?: string | UserRole | number;
  role_id?: number;
  phone?: string;
  address?: string;
  created_at?: string;
}

export type UserRole = 'admin' | 'employee' | 'guest'; 