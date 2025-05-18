import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Divider, 
  TextField, 
  FormControl, 
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

interface BookingDebuggerProps {
  movieId?: string;
}

const BookingDebugger: React.FC<BookingDebuggerProps> = ({ movieId }) => {
  const [debugLog, setDebugLog] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scheduleId, setScheduleId] = useState<string>('1');
  const [roomId, setRoomId] = useState<string>('1');
  const [seatIds, setSeatIds] = useState<string>('seat-A1-1,seat-A2-2');
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');

  const appendLog = (message: string) => {
    setDebugLog(prev => `${prev}${message}\n`);
  };

  const clearLog = () => {
    setDebugLog('');
  };

  const testBookingEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        appendLog('ERROR: No token found in localStorage');
        return;
      }

      appendLog(`Testing booking endpoint: ${endpoint}`);
      appendLog(`Request data: scheduleId=${scheduleId}, roomId=${roomId}, seats=${seatIds}`);

      // Create booking request
      const bookingRequest = {
        scheduleId: parseInt(scheduleId),
        roomId: parseInt(roomId),
        seatIds: seatIds.split(',').map(s => s.trim()),
        foodItems: [],
        paymentMethod: paymentMethod
      };

      // Use fetch API directly to avoid axios interceptors
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingRequest)
      });

      appendLog(`Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        appendLog(`Success! Response: ${JSON.stringify(data).substring(0, 200)}...`);
        
        // Show booking ID if available
        if (data?.result?.bookingId || data?.data?.bookingId || data?.bookingId) {
          const bookingId = data?.result?.bookingId || data?.data?.bookingId || data?.bookingId;
          appendLog(`Booking ID: ${bookingId}`);
          
          // Test payment simulation endpoint
          await testPaymentEndpoint(bookingId);
        }
      } else {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = 'Could not parse error response';
        }
        appendLog(`Error! ${errorText}`);
      }
    } catch (error: any) {
      appendLog(`Exception: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testPaymentEndpoint = async (bookingId: number) => {
    try {
      const token = localStorage.getItem('token');
      appendLog(`Testing payment simulation for booking ID: ${bookingId}`);
      
      const paymentData = {
        bookingId: bookingId,
        paymentMethod: paymentMethod,
        amount: 0,
        status: 'SUCCESS'
      };
      
      const response = await fetch('/api/v1/payment/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });
      
      appendLog(`Payment response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        appendLog(`Payment success! ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        let errorText = '';
        try {
          const errorData = await response.json();
          errorText = JSON.stringify(errorData);
        } catch (e) {
          errorText = 'Could not parse error response';
        }
        appendLog(`Payment error! ${errorText}`);
      }
    } catch (error: any) {
      appendLog(`Payment exception: ${error.message}`);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>Booking API Debugger</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Schedule ID"
            value={scheduleId}
            onChange={(e) => setScheduleId(e.target.value)}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            size="small"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
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
            size="small"
            variant="outlined"
            helperText="Example: seat-A1-1,seat-A2-2"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={() => testBookingEndpoint('/api/v1/payment/sepay-webhook')}
          disabled={isLoading}
          size="small"
        >
          Test sepay-webhook
        </Button>
        <Button 
          variant="contained" 
          onClick={() => testBookingEndpoint('/api/v1/payment/bookings/create')}
          disabled={isLoading}
          size="small"
        >
          Test bookings/create
        </Button>
        <Button 
          variant="outlined" 
          onClick={clearLog}
          disabled={isLoading}
          size="small"
        >
          Clear Log
        </Button>
      </Box>
      
      <Box sx={{ 
        p: 1.5, 
        bgcolor: '#000', 
        color: '#0f0', 
        borderRadius: 1, 
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        height: '200px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap'
      }}>
        {isLoading && <CircularProgress size={20} sx={{ color: '#0f0', mr: 1 }} />}
        {debugLog || 'Debug log will appear here...'}
      </Box>
    </Paper>
  );
};

export default BookingDebugger; 