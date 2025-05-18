import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
  Paper, Grid, Divider, CircularProgress, styled, Alert, IconButton 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../utils/axios';
import { BookingData, FoodItemInfo } from '../../types/booking';
import CloseIcon from '@mui/icons-material/Close';

const QRImg = styled('img')({
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
  border: '1px solid #f0f0f0',
  borderRadius: '4px'
});

const TimerWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: theme.spacing(2, 0),
}));

const CountdownText = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  color: theme.palette.error.main,
}));

interface QrPaymentModalProps {
  open: boolean;
  onClose: () => void;
  bookingData: BookingData;
  bookingId: number;
  totalAmount: number;
  onPaymentCompleted: () => void;
  onPaymentExpired: () => void;
}

const QrPaymentModal: React.FC<QrPaymentModalProps> = ({
  open,
  onClose,
  bookingData,
  bookingId,
  totalAmount,
  onPaymentCompleted,
  onPaymentExpired
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [checking, setChecking] = useState(false);
  
  // Format time left as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Generate QR code when modal opens
  useEffect(() => {
    if (!open) return;
    
    const generateQr = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("📱 QR DEBUG: Generating QR code for booking ID:", bookingId);
        
        const response = await axiosInstance.post('/api/v1/payment/generate-qr', {
          bookingId: bookingId,
          paymentMethod: 'QR_MOMO', // Hoặc 'QR_SEPAY' tùy theo yêu cầu
          amount: totalAmount
        });
        
        console.log("📱 QR DEBUG: QR API response:", response);
        
        if (response.data?.result) {
          console.log("📱 QR DEBUG: Using result from API response");
          setQrData(response.data.result);
        } else if (response.data?.data) {
          console.log("📱 QR DEBUG: Using data from API response");
          setQrData(response.data.data);
        } else {
          console.error("📱 QR DEBUG: Invalid response format", response.data);
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('📱 QR DEBUG: Error generating QR code:', err);
        setError(err.message || 'Error generating QR code');
      } finally {
        setLoading(false);
      }
    };
    
    generateQr();
    setTimeLeft(300); // Reset timer to 5 minutes
  }, [open, bookingId, totalAmount]);
  
  // Countdown timer
  useEffect(() => {
    if (!open || !qrData) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onPaymentExpired();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [open, qrData, onPaymentExpired]);
  
  // Use useCallback for any callback functions
  const checkPaymentStatus = useCallback(async () => {
    if (!qrData || !qrData.paymentId) return;
    
    try {
      setChecking(true);
      console.log("📱 QR DEBUG: Checking payment status for paymentId:", qrData.paymentId);
      
      const response = await axiosInstance.get(`/api/v1/payment/status/${qrData.paymentId}`);
      console.log("📱 QR DEBUG: Payment status response:", response.data);
      
      const isPaid = response.data?.result?.paid || response.data?.data?.paid;
      console.log("📱 QR DEBUG: Payment status - isPaid:", isPaid);
      
      if (isPaid) {
        console.log("📱 QR DEBUG: Payment completed successfully, calling onPaymentCompleted()");
        onPaymentCompleted();
      } else {
        console.log("📱 QR DEBUG: Payment not completed yet, will check again");
      }
    } catch (err) {
      console.error('📱 QR DEBUG: Error checking payment status:', err);
    } finally {
      setChecking(false);
    }
  }, [qrData, onPaymentCompleted]);
  
  // Update the useEffect to use the callback
  useEffect(() => {
    if (!open || !qrData || !qrData.paymentId) return;
    
    const interval = setInterval(() => {
      if (!checking) {
        checkPaymentStatus();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [open, qrData, checking, checkPaymentStatus]);
  
  // Cancel booking when modal is closed
  const handleCancel = useCallback(async () => {
    if (!bookingId) return;
    
    try {
      console.log("📱 QR DEBUG: Cancelling booking ID:", bookingId);
      setLoading(true);
      
      // Call the cancellation API
      const response = await axiosInstance.post('/api/v1/bookings/cancel', { bookingId });
      console.log("📱 QR DEBUG: Cancel booking response:", response.data);
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('📱 QR DEBUG: Error cancelling booking:', err);
      // Still close the modal even if there's an error
      onClose();
    } finally {
      setLoading(false);
    }
  }, [bookingId, onClose]);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Thanh toán đặt vé
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* QR Code */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : qrData && qrData.qrImageUrl ? (
            <Box>
              <Box 
                component="img" 
                src={qrData.qrImageUrl}
                alt="QR Code" 
                sx={{ maxWidth: 240, mb: 2 }}
              />
              <Typography variant="h6">
                Tổng tiền: {totalAmount.toLocaleString('vi-VN')} VND
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vui lòng quét mã QR để thanh toán
              </Typography>
            </Box>
          ) : (
            <Alert severity="warning">Không thể tạo mã QR. Vui lòng thử lại sau.</Alert>
          )}
        </Box>
        
        {/* Timer */}
        {timeLeft > 0 && (
          <Grid container justifyContent="center" sx={{ mb: 2 }}>
            <Grid item>
              <Typography variant="body1" color={timeLeft < 60 ? "error" : "textPrimary"}>
                Còn lại: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </Typography>
            </Grid>
          </Grid>
        )}
        
        {/* Modal actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleCancel} 
            disabled={loading}
          >
            Hủy đặt vé
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={checkPaymentStatus}
            disabled={checking || loading}
          >
            {checking ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QrPaymentModal; 