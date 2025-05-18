import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider
} from '@mui/material';
import { bookingService } from '../services/bookingService';

interface SimpleBookingProps {
  movieId?: string;
  onSuccess?: (bookingId: number) => void;
}

const SimpleBooking: React.FC<SimpleBookingProps> = ({ movieId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState('1');
  const [roomId, setRoomId] = useState('1');
  const [seatIds, setSeatIds] = useState('seat-A1-1,seat-A2-2');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [log, setLog] = useState<string>('');

  const appendLog = (message: string) => {
    setLog(prev => prev + message + '\n');
  };

  // Fetch available schedules for this movie
  useEffect(() => {
    if (movieId) {
      fetchSchedules();
    }
  }, [movieId]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      appendLog(`Fetching schedules for movie ${movieId}...`);
      
      // Directly use fetch to avoid axios interceptors
      const token = localStorage.getItem('token');
      const response = await fetch(`/showtime/${movieId || '1'}/by-date?date=${new Date().toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        appendLog(`Schedules fetched successfully: ${JSON.stringify(data).substring(0, 100)}...`);
        
        // Extract schedules from different possible response formats
        let schedulesData = [];
        if (data?.result) {
          schedulesData = Array.isArray(data.result) ? data.result : [];
        } else if (data?.data) {
          schedulesData = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          schedulesData = data;
        }
        
        setSchedules(schedulesData);
        
        if (schedulesData.length > 0) {
          // Auto-select first schedule
          setScheduleId(schedulesData[0].scheduleId || schedulesData[0].id || '1');
          setRoomId(schedulesData[0].roomId || '1');
        }
      } else {
        appendLog(`Error fetching schedules: ${response.status}`);
        
        // Sample data for testing
        setSchedules([
          { id: '1', scheduleId: '1', roomId: '1', time: '10:00', date: new Date().toISOString().split('T')[0] },
          { id: '2', scheduleId: '2', roomId: '1', time: '13:00', date: new Date().toISOString().split('T')[0] }
        ]);
      }
    } catch (err: any) {
      appendLog(`Exception fetching schedules: ${err.message}`);
      setError(`Could not fetch schedules: ${err.message}`);
      
      // Sample data for testing
      setSchedules([
        { id: '1', scheduleId: '1', roomId: '1', time: '10:00', date: new Date().toISOString().split('T')[0] },
        { id: '2', scheduleId: '2', roomId: '1', time: '13:00', date: new Date().toISOString().split('T')[0] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to book tickets');
        return;
      }
      
      appendLog(`Creating booking request: scheduleId=${scheduleId}, roomId=${roomId}, seats=${seatIds}`);
      
      // Create booking request
      const bookingRequest = {
        scheduleId: parseInt(scheduleId),
        roomId: parseInt(roomId),
        seatIds: seatIds.split(',').map(s => s.trim()),
        foodItems: [],
        paymentMethod: paymentMethod
      };
      
      // Use the booking service to create the booking
      try {
        appendLog('Using bookingService.createBooking...');
        const response = await bookingService.createBooking(bookingRequest);
        appendLog(`Booking successful! Response: ${JSON.stringify(response).substring(0, 200)}...`);
        
        // Process the booking response to get booking ID
        let bookingId = null;
        
        if (response && response.result && response.result.bookingId) {
          bookingId = response.result.bookingId;
        } else if (response && response.bookingId) {
          bookingId = response.bookingId;
        } else if (response && response.data && response.data.bookingId) {
          bookingId = response.data.bookingId;
        }
        
        if (!bookingId) {
          appendLog('No booking ID found in response');
          setSuccess('Booking created, but could not determine booking ID');
          return;
        }
        
        appendLog(`Booking ID: ${bookingId}`);
        
        // Use the booking service to simulate payment
        appendLog('Processing payment...');
        const paymentData = {
          bookingId,
          paymentMethod,
          amount: 0,
          status: 'SUCCESS'
        };
        
        try {
          const paymentResponse = await bookingService.simulatePayment(paymentData);
          appendLog(`Payment successful! Response: ${JSON.stringify(paymentResponse).substring(0, 200)}...`);
          setSuccess(`Booking and payment successful! Booking ID: ${bookingId}`);
          
          // Call onSuccess callback with booking ID
          if (onSuccess) {
            onSuccess(bookingId);
          }
        } catch (paymentErr: any) {
          appendLog(`Payment error: ${paymentErr.message}`);
          setSuccess(`Booking created (ID: ${bookingId}), but payment simulation failed: ${paymentErr.message}`);
        }
      } catch (bookingErr: any) {
        appendLog(`Booking error: ${bookingErr.message}`);
        setError(`Booking failed: ${bookingErr.message}`);
      }
    } catch (err: any) {
      appendLog(`Exception: ${err.message}`);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>Quick Booking</Typography>
      <Typography variant="body2" paragraph color="text.secondary">
        This is a simplified booking process that bypasses the multi-step UI for testing purposes.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Schedule</InputLabel>
            <Select
              value={scheduleId}
              label="Schedule"
              onChange={(e) => setScheduleId(e.target.value)}
            >
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <MenuItem 
                    key={schedule.id || schedule.scheduleId} 
                    value={schedule.scheduleId || schedule.id}
                  >
                    {schedule.time || schedule.timeStart || 'Unknown'} - {schedule.date || 'Today'}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="1">10:00 - Default</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value as string)}
            >
              <MenuItem value="creditCard">Credit Card</MenuItem>
              <MenuItem value="momo">MoMo</MenuItem>
              <MenuItem value="vnpay">VNPay</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Seat IDs (comma separated)"
            value={seatIds}
            onChange={(e) => setSeatIds(e.target.value)}
            helperText="e.g., seat-A1-1,seat-A2-2"
          />
        </Grid>
      </Grid>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleBooking}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Book Now (Simplified)'}
      </Button>
      
      {/* Debug log */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2">Debug Log:</Typography>
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        p: 1.5, 
        borderRadius: 1,
        height: '150px',
        overflow: 'auto',
        fontFamily: 'monospace',
        fontSize: '0.75rem',
        whiteSpace: 'pre-wrap'
      }}>
        {log || 'No logs yet.'}
      </Box>
    </Paper>
  );
};

export default SimpleBooking; 