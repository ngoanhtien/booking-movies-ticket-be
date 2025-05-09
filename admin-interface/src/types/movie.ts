export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  releaseDate: string; // Format: YYYY-MM-DD
  status: 'ACTIVE' | 'INACTIVE';
  posterUrl: string; // URL to the movie poster
  rating?: string; // e.g., "PG-13", "R", "G"
  ageRestriction?: string; // e.g., "13+", "18+", "P"
  director?: string[];
  actors?: string[];
  trailerUrl?: string;
  // Optional: Add other fields like genre, director, cast, etc. later if needed
  createdAt?: string;
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