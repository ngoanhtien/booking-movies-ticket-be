import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieForm from './MovieForm';
import { Movie, MovieFormData } from '../../types';
import { fetchMovies, uploadMovieImage } from '../../services/movieService';
import { useQuery } from '@tanstack/react-query';

// Define response interface
interface MoviesResponse {
  content: Movie[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const MovieManagement: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch movies using React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['movies', page, pageSize],
    queryFn: () => fetchMovies(page, pageSize)
  }) as any;

  const movies = data?.content || [];
  const totalRows = data?.totalElements || 0;

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('movies.id'), width: 70 },
    { 
      field: 'title', 
      headerName: t('movies.title'), 
      width: 200,
      valueGetter: (params) => params.row.title || params.row.name || '',
    },
    { 
      field: 'duration', 
      headerName: t('movies.duration'), 
      width: 100,
      valueGetter: (params) => `${params.row.duration} ${t('movies.minutes')}`,
    },
    { 
      field: 'releaseDate', 
      headerName: t('movies.releaseDate'), 
      width: 130,
      valueGetter: (params) => {
        const dateStr = params.row.releaseDate || params.row.releasedDate;
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString();
      }
    },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 130,
      renderCell: (params) => {
        const status = params.row.status;
        const isActive = status === 'ACTIVE' || status === 'SHOWING';
        return (
          <Typography
            color={isActive ? 'success.main' : 'error.main'}
          >
            {isActive ? t('common.active') : t('common.inactive')}
          </Typography>
        );
      },
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedMovie(null);
    setOpen(true);
  };

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality using API call
    console.log('Delete movie:', id);
    setSnackbar({
      open: true,
      message: t('movies.deleteNotImplemented', 'Delete functionality not yet implemented'),
      severity: 'info'
    });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMovie(null);
  };

  const handleSave = async (formData: MovieFormData) => {
    try {
      // Chuyển đổi formData.releaseDate từ Date sang string
      const movieToSave = {
        id: selectedMovie?.id, // Include the ID for updates
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        releaseDate: formData.releaseDate.toISOString().split('T')[0],
        status: formData.status,
        posterUrl: formData.posterUrl || '',
      };
      
      console.log('Saving movie:', movieToSave);
      
      // Giả lập API call để lưu phim, trả về ID (cần thay bằng API thực tế)
      // API có thể là axios.post('/movie', movieToSave) hoặc axios.put('/movie', movieToSave)
      const savedMovieId = selectedMovie?.id || Math.floor(Math.random() * 1000) + 1; // Mô phỏng ID từ API
      
      // Nếu có file ảnh, upload lên server
      if (formData.posterFile) {
        console.log(`Uploading image for movie ID: ${savedMovieId}`);
        try {
          // Upload ảnh nhỏ (small)
          const imageUrl = await uploadMovieImage(savedMovieId, formData.posterFile, 'small');
          console.log('Uploaded small image URL:', imageUrl);
          
          // Nếu muốn upload cả ảnh lớn (large) với cùng file
          // const largeImageUrl = await uploadMovieImage(savedMovieId, formData.posterFile, 'large');
          // console.log('Uploaded large image URL:', largeImageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          setSnackbar({
            open: true,
            message: t('movies.imageUploadError', 'Failed to upload movie image'),
            severity: 'error'
          });
        }
      }
      
      // Đóng dialog
      handleClose();
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: selectedMovie 
          ? t('movies.updateSuccess', { title: formData.title })
          : t('movies.addSuccess', { title: formData.title }),
        severity: 'success'
      });
      
      // Refresh danh sách phim
      refetch();
    } catch (error) {
      console.error('Error saving movie:', error);
      setSnackbar({
        open: true,
        message: t('movies.saveError', 'Error saving movie'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('movies.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          {t('common.add')}
        </Button>
      </Box>
      <Card>
        <CardContent sx={{ height: 600 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">
              {error instanceof Error ? error.message : t('common.errorOccurred', 'An error occurred')}
            </Alert>
          ) : (
            <DataGrid
              rows={movies}
              columns={columns}
              paginationMode="server"
              rowCount={totalRows}
              pageSizeOptions={[5, 10, 20]}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={(model) => {
                setPage(model.page);
                setPageSize(model.pageSize);
              }}
              disableRowSelectionOnClick
              loading={isLoading}
            />
          )}
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <MovieForm
          movie={selectedMovie}
          onSave={handleSave}
          onCancel={handleClose}
        />
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MovieManagement; 