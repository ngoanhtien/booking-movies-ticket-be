import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import MovieForm from './MovieForm';
import { Movie, MovieFormData } from '../../types'; // Import từ barrel file thay vì trực tiếp từ movie.ts
import { CircularProgress, Alert, Box } from '@mui/material';

// Giả định các hàm API service (sẽ được implement sau)
const fetchMovieDetails = async (id: string): Promise<Movie> => {
  console.log(`Fetching movie details for id: ${id}`);
  // TODO: Implement actual API call
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        id: parseInt(id),
        title: `Movie ${id} Title (Fetched)`,
        description: 'Fetched description.',
        duration: 120,
        releaseDate: '2024-01-01',
        status: 'ACTIVE',
        posterUrl: `https://via.placeholder.com/300x450.png?text=Movie+${id}`,
      });
    }, 1000)
  );
};

const createMovieAPI = async (data: MovieFormData): Promise<Movie> => {
  console.log('Creating movie:', data);
  // TODO: Implement actual API call for create
  // Giả định API trả về Movie object hoàn chỉnh bao gồm cả ID do server tạo ra
  // và posterUrl nếu có upload
  return new Promise((resolve) =>
    setTimeout(() => {
      const newMovie: Movie = {
        id: Date.now(), 
        title: data.title,
        description: data.description,
        duration: data.duration,
        releaseDate: data.releaseDate.toISOString().split('T')[0],
        status: data.status,
        posterUrl: data.posterUrl || 'https://via.placeholder.com/300x450.png?text=New+Movie' // Placeholder
      };
      resolve(newMovie);
    }, 1000)
  );
};

const updateMovieAPIMutationFn = async (variables: {id: string, data: MovieFormData}): Promise<Movie> => {
  const { id, data } = variables;
  console.log(`Updating movie ${id}:`, data);
  // TODO: Implement actual API call for update
  return new Promise((resolve) =>
    setTimeout(() => {
      const updatedMovie: Movie = {
        id: parseInt(id),
        title: data.title,
        description: data.description,
        duration: data.duration,
        releaseDate: data.releaseDate.toISOString().split('T')[0],
        status: data.status,
        posterUrl: data.posterUrl || `https://via.placeholder.com/300x450.png?text=Movie+${id}` // Placeholder
      };
      resolve(updatedMovie);
    }, 1000)
  );
};


const MovieFormWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(id);

  const { data: movie, isLoading, isError, error } = useQuery<Movie, Error>({
    queryKey: ['movieDetails', id],
    queryFn: () => {
      if (!id) throw new Error('Movie ID is required for editing.');
      return fetchMovieDetails(id);
    },
    enabled: isEditMode && !!id, 
  });

  const createMutation = useMutation<Movie, Error, MovieFormData>({
    mutationFn: createMovieAPI, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] }); 
      navigate('/admin/movies');
      // TODO: Show success notification
    },
    onError: (err: Error) => {
      console.error("Error creating movie:", err);
      // TODO: Show error notification
    }
  });

  const updateMutation = useMutation<Movie, Error, { id: string, data: MovieFormData }>({
    mutationFn: updateMovieAPIMutationFn, 
    onSuccess: (data, variables) => { 
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['movieDetails', variables.id] });
      navigate('/admin/movies');
      // TODO: Show success notification
    },
    onError: (err: Error) => {
      console.error("Error updating movie:", err);
      // TODO: Show error notification
    }
  });

  const handleSave = (formData: MovieFormData) => {
    if (isEditMode && id) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    navigate('/admin/movies');
  };

  if (isLoading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (isError && isEditMode) {
    return <Alert severity="error">{t('errors.fetchFailed', { entity: t('movies.movie')})}: {error?.message}</Alert>;
  }
  
  const movieDataForForm: Movie | null = isEditMode ? (movie || null) : null;

  return (
    <MovieForm
      movie={movieDataForForm}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default MovieFormWrapper; 