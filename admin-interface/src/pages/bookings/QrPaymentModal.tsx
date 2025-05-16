import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
  Paper, Grid, Divider, CircularProgress, styled, Alert 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../utils/axios';
import { BookingData, FoodItemInfo } from '../../types/booking';

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
        const response = await axiosInstance.post('/api/v1/payment/generate-qr', {
          bookingId: bookingId,
          paymentMethod: 'QR_MOMO', // Hoặc 'QR_SEPAY' tùy theo yêu cầu
          amount: totalAmount
        });
        
        if (response.data?.result) {
          setQrData(response.data.result);
        } else if (response.data?.data) {
          setQrData(response.data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err: any) {
        console.error('Error generating QR code:', err);
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
      const response = await axiosInstance.get(`/api/v1/payment/status/${qrData.paymentId}`);
      const isPaid = response.data?.result?.paid || response.data?.data?.paid;
      
      if (isPaid) {
        onPaymentCompleted();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
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
  
  return (
    <Dialog 
      open={open} 
      onClose={timeLeft > 0 ? onClose : undefined}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {t('booking.payment.qrPaymentTitle', 'Thanh toán bằng mã QR')}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : qrData ? (
          <Grid container spacing={3}>
            {/* Cột bên trái: Thông tin đặt vé */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>
                  {t('booking.payment.bookingInfo', 'Thông tin đặt vé')}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>{bookingData.movie?.movieName}</strong>
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('booking.payment.showtime', 'Thời gian')}:</strong> {bookingData.movie?.date?.toString()} {bookingData.movie?.startTime?.toString()}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('booking.payment.cinema', 'Rạp')}:</strong> {bookingData.cinema?.cinemaName}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('booking.payment.room', 'Phòng chiếu')}:</strong> {bookingData.cinema?.roomName}
                  </Typography>
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>{t('booking.payment.seats', 'Ghế')}:</strong> {bookingData.seats?.join(', ')}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {bookingData.foodItems && bookingData.foodItems.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('booking.payment.foodItems', 'Thức ăn & Đồ uống')}:
                    </Typography>
                    
                    {bookingData.foodItems.map((item: FoodItemInfo, index: number) => (
                      <Typography key={index} variant="body2">
                        {item.quantity} x {item.name} ({item.price.toLocaleString()} đ)
                      </Typography>
                    ))}
                  </Box>
                )}
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="h6" color="primary">
                  {t('booking.payment.totalAmount', 'Tổng tiền')}: {totalAmount.toLocaleString()} đ
                </Typography>
              </Paper>
            </Grid>
            
            {/* Cột bên phải: Mã QR và hướng dẫn */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  {qrData.provider === 'MOMO' 
                    ? t('booking.payment.scanMoMoQr', 'Quét mã QR bằng MoMo để thanh toán') 
                    : t('booking.payment.scanSePayQr', 'Quét mã QR để thanh toán')}
                </Typography>
                
                <QRImg 
                  src={qrData.qrImageUrl} 
                  alt="Payment QR Code" 
                  sx={{ maxWidth: '250px', my: 2 }}
                />
                
                <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                  {t('booking.payment.noCancel', 'Đã thanh toán sẽ không được huỷ vé, vui lòng kiểm tra lại thông tin vé')}
                </Alert>
                
                <TimerWrapper>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {t('booking.payment.timeRemaining', 'Thời gian còn lại')}:
                  </Typography>
                  <CountdownText>
                    {formatTime(timeLeft)}
                  </CountdownText>
                </TimerWrapper>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  {qrData.provider === 'MOMO' 
                    ? t('booking.payment.momoInstructions', 'Sử dụng App MoMo hoặc ứng dụng Camera hỗ trợ để quét mã.') 
                    : t('booking.payment.sePayInstructions', 'Sử dụng ứng dụng ngân hàng để quét mã VietQR.')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={timeLeft <= 0}>
          {t('common.cancel', 'Hủy')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QrPaymentModal; 