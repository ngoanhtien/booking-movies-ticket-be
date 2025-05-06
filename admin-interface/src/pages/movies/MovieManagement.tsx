import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieForm from './MovieForm';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  posterUrl: string;
}

const MovieManagement: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Mock data - will be replaced with API calls
  const movies: Movie[] = [
    {
      id: 1,
      title: 'Sample Movie',
      description: 'A sample movie description',
      duration: 120,
      releaseDate: '2024-03-20',
      status: 'ACTIVE',
      posterUrl: 'https://example.com/poster.jpg',
    },
  ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('movies.id'), width: 70 },
    { field: 'title', headerName: t('movies.title'), width: 200 },
    { field: 'duration', headerName: t('movies.duration'), width: 130 },
    { field: 'releaseDate', headerName: t('movies.releaseDate'), width: 130 },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 130,
      renderCell: (params) => (
        <Typography
          color={params.value === 'ACTIVE' ? 'success.main' : 'error.main'}
        >
          {params.value === 'ACTIVE' ? t('common.active') : t('common.inactive')}
        </Typography>
      ),
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
    // TODO: Implement delete functionality
    console.log('Delete movie:', id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMovie(null);
  };

  const handleSave = (movie: Omit<Movie, 'id'>) => {
    // TODO: Implement save functionality
    console.log('Save movie:', movie);
    handleClose();
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
        <CardContent>
          <DataGrid
            rows={movies}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            disableRowSelectionOnClick
          />
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
    </Box>
  );
};

export default MovieManagement; 