export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  membershipLevel: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export type MembershipLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'; 