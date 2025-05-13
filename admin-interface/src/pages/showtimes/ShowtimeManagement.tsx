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
import ShowtimeForm from './ShowtimeForm';
import { showtimeService, Showtime, ShowtimeFilter } from '../../services/showtimeService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ShowtimeManagement: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState<ShowtimeFilter>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch showtimes using React Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['showtimes', page, pageSize, filter],
    queryFn: () => showtimeService.getAllShowtimes(page, pageSize, filter)
  }) as any;

  const showtimes = data?.content || [];
  const totalRows = data?.totalElements || 0;

  const columns: GridColDef[] = [
    { field: 'id', headerName: t('showtimes.id'), width: 70 },
    { 
      field: 'movie', 
      headerName: t('showtimes.movie'), 
      width: 200,
      valueGetter: (params) => {
        return params.row.schedule?.movie?.title || '';
      }
    },
    { 
      field: 'branch', 
      headerName: t('showtimes.branch'), 
      width: 150,
      valueGetter: (params) => {
        return params.row.room?.branch?.name || '';
      }
    },
    { 
      field: 'room', 
      headerName: t('showtimes.room'), 
      width: 100,
      valueGetter: (params) => {
        return params.row.room?.name || '';
      }
    },
    { 
      field: 'startTime', 
      headerName: t('showtimes.startTime'), 
      width: 180,
      valueGetter: (params) => {
        if (!params.row.startTime) return '';
        const date = new Date(params.row.startTime);
        return date.toLocaleString();
      }
    },
    { 
      field: 'endTime', 
      headerName: t('showtimes.endTime'), 
      width: 180,
      valueGetter: (params) => {
        if (!params.row.endTime) return '';
        const date = new Date(params.row.endTime);
        return date.toLocaleString();
      }
    },
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
          color={params.row.status === 'ACTIVE' ? 'success.main' : 'error.main'}
        >
          {params.row.status === 'ACTIVE' ? t('common.active') : t('common.inactive')}
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

  const handleDelete = async (id: number) => {
    try {
      await showtimeService.deleteShowtime(id);
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: t('showtimes.deleteSuccess', 'Showtime deleted successfully'),
        severity: 'success'
      });
      
      // Refresh danh sách lịch chiếu
      refetch();
    } catch (error) {
      console.error('Error deleting showtime:', error);
      setSnackbar({
        open: true,
        message: t('showtimes.deleteError', 'Error deleting showtime'),
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedShowtime(null);
  };

  const handleSave = async (showtimeData: Partial<Showtime>) => {
    try {
      if (selectedShowtime?.id) {
        // Cập nhật lịch chiếu
        await showtimeService.updateShowtime(selectedShowtime.id, showtimeData);
        setSnackbar({
          open: true,
          message: t('showtimes.updateSuccess', 'Showtime updated successfully'),
          severity: 'success'
        });
      } else {
        // Tạo lịch chiếu mới
        await showtimeService.createShowtime(showtimeData);
        setSnackbar({
          open: true,
          message: t('showtimes.addSuccess', 'Showtime added successfully'),
          severity: 'success'
        });
      }

      // Đóng dialog và refresh dữ liệu
      handleClose();
      refetch();
    } catch (error) {
      console.error('Error saving showtime:', error);
      setSnackbar({
        open: true,
        message: t('showtimes.saveError', 'Error saving showtime'),
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGenerateShowtimes = async () => {
    try {
      const result = await showtimeService.generateShowtimesForActiveMovies();
      
      setSnackbar({
        open: true,
        message: result || t('showtimes.generateSuccess', 'Showtimes generated successfully'),
        severity: 'success'
      });
      
      // Refresh danh sách lịch chiếu
      refetch();
    } catch (error) {
      console.error('Error generating showtimes:', error);
      setSnackbar({
        open: true,
        message: t('showtimes.generateError', 'Error generating showtimes'),
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('showtimes.title')}</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGenerateShowtimes}
          >
            {t('showtimes.generateShowtimes')}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            {t('common.add')}
          </Button>
        </Box>
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
              rows={showtimes}
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
        <ShowtimeForm
          showtime={selectedShowtime}
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

export default ShowtimeManagement; 