import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from 'axios';

interface Booking {
  bookingId: number;
  bookingCode: string;
  movie: {
    movieId: number;
    movieName: string;
    format: string;
    date: string;
    startTime: string;
    endTime: string;
  };
  cinema: {
    cinemaName: string;
    roomName: string;
    address: string;
  };
  seats: string[];
  totalAmount: number;
  foodItems: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

const BookingManagement: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusMenuBooking, setStatusMenuBooking] = useState<Booking | null>(null);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookings');
      setBookings(response.data);
      setError(null);
    } catch (err) {
      setError(t('bookings.fetchError'));
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(bookings.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: newStatus as Booking['status'] }
          : booking
      ));
      setSnackbar({
        open: true,
        message: t('bookings.statusChangeSuccess'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('bookings.statusChangeError'),
        severity: 'error',
      });
      console.error('Error changing booking status:', err);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/bookings/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({
        open: true,
        message: t('bookings.exportSuccess'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('bookings.exportError'),
        severity: 'error',
      });
      console.error('Error exporting bookings:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'bookingCode',
      headerName: t('bookings.code'),
      width: 120,
    },
    {
      field: 'movieName',
      headerName: t('bookings.movie'),
      width: 200,
      valueGetter: (params) => params.row.movie.movieName,
    },
    {
      field: 'cinemaName',
      headerName: t('bookings.cinema'),
      width: 200,
      valueGetter: (params) => params.row.cinema.cinemaName,
    },
    {
      field: 'date',
      headerName: t('bookings.date'),
      width: 150,
      valueGetter: (params) => {
        const date = new Date(params.row.movie.date);
        return format(date, 'dd/MM/yyyy', { locale: vi });
      },
    },
    {
      field: 'time',
      headerName: t('bookings.time'),
      width: 150,
      valueGetter: (params) => `${params.row.movie.startTime} - ${params.row.movie.endTime}`,
    },
    {
      field: 'seats',
      headerName: t('bookings.seats'),
      width: 150,
      valueGetter: (params) => params.row.seats.join(', '),
    },
    {
      field: 'totalAmount',
      headerName: t('bookings.total'),
      width: 150,
      valueGetter: (params) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(params.row.totalAmount);
      },
    },
    {
      field: 'status',
      headerName: t('bookings.status'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={t(`bookings.status.${params.value.toLowerCase()}`)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton
            onClick={() => {
              setSelectedBooking(params.row);
              setDetailsOpen(true);
            }}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            onClick={(event) => {
              setStatusMenuAnchor(event.currentTarget);
              setStatusMenuBooking(params.row);
            }}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredBookings = bookings.filter((booking) =>
    Object.values(booking).some((value) =>
      JSON.stringify(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">{t('bookings.title')}</Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          {t('bookings.export')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('bookings.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={filteredBookings}
            columns={columns}
            autoHeight
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            getRowId={(row) => row.bookingId}
          />
        )}
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>{t('bookings.details')}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('bookings.movieInfo')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>
                      {t('bookings.movie')}: {selectedBooking.movie.movieName}
                    </Typography>
                    <Typography>
                      {t('bookings.format')}: {selectedBooking.movie.format}
                    </Typography>
                    <Typography>
                      {t('bookings.date')}:{' '}
                      {format(new Date(selectedBooking.movie.date), 'dd/MM/yyyy', {
                        locale: vi,
                      })}
                    </Typography>
                    <Typography>
                      {t('bookings.time')}: {selectedBooking.movie.startTime} -{' '}
                      {selectedBooking.movie.endTime}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('bookings.cinemaInfo')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>
                      {t('bookings.cinema')}: {selectedBooking.cinema.cinemaName}
                    </Typography>
                    <Typography>
                      {t('bookings.room')}: {selectedBooking.cinema.roomName}
                    </Typography>
                    <Typography>
                      {t('bookings.address')}: {selectedBooking.cinema.address}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {t('bookings.bookingInfo')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>
                      {t('bookings.code')}: {selectedBooking.bookingCode}
                    </Typography>
                    <Typography>
                      {t('bookings.seats')}: {selectedBooking.seats.join(', ')}
                    </Typography>
                    <Typography>
                      {t('bookings.total')}:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(selectedBooking.totalAmount)}
                    </Typography>
                    <Typography>
                      {t('bookings.status')}:{' '}
                      <Chip
                        label={t(`bookings.status.${selectedBooking.status.toLowerCase()}`)}
                        color={getStatusColor(selectedBooking.status)}
                        size="small"
                      />
                    </Typography>
                  </Stack>
                </Grid>

                {selectedBooking.foodItems.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {t('bookings.foodItems')}
                    </Typography>
                    <Stack spacing={1}>
                      {selectedBooking.foodItems.map((item, index) => (
                        <Typography key={index}>
                          {item.name} x{item.quantity} -{' '}
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price * item.quantity)}
                        </Typography>
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setNewStatus('CONFIRMED');
            setStatusChangeDialogOpen(true);
            setStatusMenuAnchor(null);
          }}
        >
          {t('bookings.status.confirmed')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setNewStatus('CANCELLED');
            setStatusChangeDialogOpen(true);
            setStatusMenuAnchor(null);
          }}
        >
          {t('bookings.status.cancelled')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setNewStatus('COMPLETED');
            setStatusChangeDialogOpen(true);
            setStatusMenuAnchor(null);
          }}
        >
          {t('bookings.status.completed')}
        </MenuItem>
      </Menu>

      <Dialog
        open={statusChangeDialogOpen}
        onClose={() => setStatusChangeDialogOpen(false)}
      >
        <DialogTitle>{t('bookings.confirmStatusChange')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('bookings.statusChangeConfirmation', {
              bookingCode: statusMenuBooking?.bookingCode,
              newStatus: t(`bookings.status.${newStatus.toLowerCase()}`),
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              if (statusMenuBooking) {
                handleStatusChange(statusMenuBooking.bookingId, newStatus);
                setStatusChangeDialogOpen(false);
              }
            }}
            color="primary"
            variant="contained"
          >
            {t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingManagement; 