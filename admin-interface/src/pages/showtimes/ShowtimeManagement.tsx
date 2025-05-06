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
import ShowtimeForm from './ShowtimeForm';

interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  cinemaId: number;
  cinemaName: string;
  roomId: number;
  roomName: string;
  date: string;
  time: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

const ShowtimeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  // Mock data - will be replaced with API calls
  const showtimes: Showtime[] = [
    {
      id: 1,
      movieId: 1,
      movieTitle: 'Sample Movie',
      cinemaId: 1,
      cinemaName: 'Sample Cinema',
      roomId: 1,
      roomName: 'Room 1',
      date: '2024-03-20',
      time: '19:00',
      price: 100000,
      status: 'ACTIVE',
    },
  ];

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('showtimes.id'), width: 70 },
    { field: 'movieTitle', headerName: t('showtimes.movie'), width: 200 },
    { field: 'cinemaName', headerName: t('showtimes.cinema'), width: 150 },
    { field: 'roomName', headerName: t('showtimes.room'), width: 100 },
    { field: 'date', headerName: t('showtimes.date'), width: 130 },
    { field: 'time', headerName: t('showtimes.time'), width: 100 },
    {
      field: 'price',
      headerName: t('showtimes.price'),
      width: 130,
      valueFormatter: (params) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.value as number);
      },
    },
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
    setSelectedShowtime(null);
    setOpen(true);
  };

  const handleEdit = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    // TODO: Implement delete functionality
    console.log('Delete showtime:', id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShowtime(null);
  };

  const handleSave = (showtime: Omit<Showtime, 'id'>) => {
    // TODO: Implement save functionality
    console.log('Save showtime:', showtime);
    handleClose();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('showtimes.title')}</Typography>
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
            rows={showtimes}
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
        <ShowtimeForm
          showtime={selectedShowtime}
          onSave={handleSave}
          onCancel={handleClose}
        />
      </Dialog>
    </Box>
  );
};

export default ShowtimeManagement; 