export interface Movie {
  id: number;
  name?: string; // API sử dụng name thay vì title
  title?: string; // Giữ lại để tương thích với code cũ
  summary?: string; // API sử dụng summary thay vì description
  description?: string; // Giữ lại để tương thích với code cũ
  descriptionLong?: string; // Mô tả dài từ API
  duration: number; // in minutes
  releaseDate?: string; // Format: YYYY-MM-DD
  releasedDate?: string; // API sử dụng releasedDate thay vì releaseDate
  status: 'ACTIVE' | 'INACTIVE' | 'SHOWING' | 'UPCOMING'; // Thêm trạng thái từ API
  posterUrl?: string; // URL to the movie poster
  imageSmallUrl?: string; // API sử dụng imageSmallUrl 
  imageLargeUrl?: string; // API sử dụng imageLargeUrl
  rating?: string; // e.g., "PG-13", "R", "G"
  ageRestriction?: string; // e.g., "13+", "18+", "P"
  ageLimit?: number; // API sử dụng ageLimit thay vì ageRestriction
  director?: string | string[]; // Có thể là string hoặc array từ API
  actors?: string[];
  trailerUrl?: string;
  language?: string; // Ngôn ngữ phim
  schedules?: any[]; // Lịch chiếu
  categories?: any[]; // Danh mục/thể loại
  // Các trường từ API
  createdBy?: string | null;
  createdAt?: string;
  lastModifiedBy?: string | null;
  lastModifiedAt?: string;
  isDeleted?: boolean;
  // Optional: Add other fields like genre, director, cast, etc. later if needed
  updatedAt?: string;
}

export interface MovieFormData {
  title: string;
  description: string;
  duration: number;
  releaseDate: Date; // Formik uses Date object, will be converted to string for API
  status: 'ACTIVE' | 'INACTIVE';
  posterUrl?: string; // Existing poster URL, might be empty for new movies or if new poster is uploaded
  posterFile?: File | null; // For uploading a new poster
  // Add any other fields that are part of the movie creation/update form
} 