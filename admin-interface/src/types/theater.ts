export interface Theater {
  id: number;
  name: string;
  cinemaId: number;
  cinemaName?: string;
  address: string;
  capacity: number;
  numberOfRooms: number;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TheaterFormData {
  id?: number;
  name: string;
  cinemaId: number;
  address: string;
  capacity: number;
  numberOfRooms: number;
  imageUrl?: File | string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  description?: string;
} 