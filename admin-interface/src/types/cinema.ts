export interface Cinema {
  id: number;
  name: string;
  hotline: string;
  description: string;
  logoUrl: string;
  address: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CinemaFormData {
  id?: number;
  name: string;
  hotline: string;
  description: string;
  logoUrl?: File;
  address: string;
} 