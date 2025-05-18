import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Alert,
  Snackbar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import EmailIcon from '@mui/icons-material/Email';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { BookingResponse, bookingService } from '../../services/bookingService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Interface for booking status
type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface BookingHistoryItem extends BookingResponse {
  bookingTime: string;
  status: BookingStatus;
}

const BookingHistory: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState<BookingHistoryItem[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingHistoryItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  // Fetch booking history from API
  const fetchBookingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.getUserBookings();
      const bookingsData = response.data || [];
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching booking history:', error);
      setError(t('bookings.history.fetchError') || 'Failed to load booking history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDetails = (booking: BookingHistoryItem) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return theme.palette.warning.main;
      case 'CONFIRMED':
        return theme.palette.info.main;
      case 'COMPLETED':
        return theme.palette.success.main;
      case 'CANCELLED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getFilteredBookings = () => {
    switch (tabValue) {
      case 0: // All bookings
        return bookings;
      case 1: // Upcoming
        return bookings.filter(booking => 
          booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );
      case 2: // Past
        return bookings.filter(booking => 
          booking.status === 'COMPLETED' || booking.status === 'CANCELLED'
        );
      default:
        return bookings;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateTime = `${date}T${time}`;
      return format(new Date(dateTime), 'HH:mm - EEEE, dd/MM/yyyy', { locale: vi });
    } catch (e) {
      return `${time} - ${date}`;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box 
          display="flex" 
          flexDirection="column" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          py={4}
        >
          <CircularProgress size={60} thickness={4} sx={{ mb: 2 }} />
          <Typography color="textSecondary">
            {t('common.loading')}
          </Typography>
        </Box>
      </Container>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={2}
        >
          <Typography variant="h4" gutterBottom>
            {t('bookings.history.title')}
          </Typography>
          <Button 
            color="primary" 
            variant="outlined" 
            onClick={fetchBookingHistory} 
            disabled={loading}
          >
            {t('common.refresh')}
          </Button>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking history tabs">
            <Tab label={t('bookings.history.allBookings')} />
            <Tab label={t('bookings.history.upcoming')} />
            <Tab label={t('bookings.history.past')} />
          </Tabs>
        </Box>
        
        {filteredBookings.length === 0 ? (
          <Box py={4} textAlign="center">
            <ConfirmationNumberIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t('bookings.history.noBookings')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {t('bookings.history.bookMoviePrompt')}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              href="/movies"
            >
              {t('bookings.history.browseMovies')}
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredBookings.map((booking) => (
              <Grid item xs={12} md={6} key={booking.bookingId}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                    },
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 12, 
                      right: 12,
                      zIndex: 1 
                    }}
                  >
                    <Chip 
                      label={booking.status}
                      sx={{
                        backgroundColor: getStatusColor(booking.status),
                        color: '#fff',
                        fontWeight: 'bold'
                      }}
                      size="small"
                    />
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {booking.movie.movieName}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mt={1} mb={1}>
                      <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {formatDateTime(booking.movie.date, booking.movie.startTime)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mt={1} mb={1}>
                      <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" noWrap>
                        {booking.cinema.cinemaName} - {booking.cinema.roomName}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mt={1} mb={1}>
                      <ConfirmationNumberIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {booking.seats.join(', ')}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Typography variant="subtitle2" color="primary">
                      {t('bookings.history.bookingCode')}: {booking.bookingCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('bookings.history.totalAmount')}: {booking.totalAmount.toLocaleString('vi-VN')} VND
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleOpenDetails(booking)}
                      sx={{ ml: 'auto' }}
                    >
                      {t('common.viewDetails')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog 
          open={detailsOpen} 
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">
              {t('bookings.history.bookingDetails')}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <Chip 
                      label={selectedBooking.status}
                      sx={{
                        backgroundColor: getStatusColor(selectedBooking.status),
                        color: '#fff',
                        fontWeight: 'bold',
                        mr: 1
                      }}
                    />
                    <Typography variant="subtitle2">
                      {t('bookings.history.bookingId')}: {selectedBooking.bookingCode}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.bookingTime && format(new Date(selectedBooking.bookingTime), 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Stack>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" alignItems="flex-start">
                  <TheaterComedyIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {selectedBooking.movie.movieName}
                    </Typography>
                    <Typography variant="body2">
                      {selectedBooking.movie.format}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {`${selectedBooking.movie.startTime} - ${selectedBooking.movie.endTime}`}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {selectedBooking.movie.date}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {`${selectedBooking.cinema.cinemaName} - ${selectedBooking.cinema.roomName}`}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                  {selectedBooking.cinema.address}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  {t('bookings.history.seats')}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {selectedBooking.seats.map((seat, index) => (
                    <Chip
                      key={index}
                      label={seat}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              
              {selectedBooking.foodItems && selectedBooking.foodItems.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <FastfoodIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('bookings.history.concessions')}
                  </Typography>
                  
                  <List dense>
                    {selectedBooking.foodItems.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={`${item.name} x ${item.quantity}`}
                          secondary={`${item.price.toLocaleString('vi-VN')} VND`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    backgroundColor: 'background.default',
                    p: 2,
                    mt: 2,
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {t('bookings.history.paymentSummary')}
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={12} display="flex" justifyContent="space-between">
                      <Typography variant="body2">{t('bookings.history.subtotal')}:</Typography>
                      <Typography variant="body2">
                        {selectedBooking.totalAmount.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12} display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {t('bookings.history.total')}:
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {selectedBooking.totalAmount.toLocaleString('vi-VN')} VND
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              startIcon={<LocalPrintshopIcon />}
              onClick={() => window.print()}
            >
              {t('common.print')}
            </Button>
            <Button 
              startIcon={<EmailIcon />}
              onClick={() => {/* Send email functionality */}}
            >
              {t('common.sendEmail')}
            </Button>
            <Button onClick={handleCloseDetails} color="primary">
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default BookingHistory; 