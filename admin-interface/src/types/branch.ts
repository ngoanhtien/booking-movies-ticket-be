export interface Branch {
  id: number;
  name: string;
  address: string;
  hotline: string;
  imageUrl?: string;
  cinemaId: number;
  createdAt: string;
  updatedAt: string;
}

export interface BranchFormData {
  id?: number;
  name: string;
  address: string;
  hotline: string;
  imageUrl?: File;
  cinemaId: number;
} 