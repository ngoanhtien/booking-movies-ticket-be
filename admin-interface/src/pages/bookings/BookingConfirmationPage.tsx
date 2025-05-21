import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axios";

interface RootState {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

interface ShowtimeInfo {
  scheduleId: number;
  roomId: number;
  roomName: string;
  branchName: string;
  movieName: string;
  scheduleTime: string;
  scheduleDate: string;
}

interface BookingConfirmationState {
  selectedSeats: string[];
  totalPrice: number;
  showtimeInfo: ShowtimeInfo;
  movieId: string;
  selectedCombos?: { [id: string]: number };
  comboTotal?: number;
  ticketTotal?: number;
}

// Mock combo data (should match SeatSelectionPage)
const comboList = [
  {
    id: "combo1",
    name: "Beta Combo 69oz",
    price: 68000,
    description: "TIẾT KIỆM 28K!!! Gồm: 1 Bắp (69oz) + 1 Nước có gaz (22oz)",
    image: "https://i.imgur.com/0Q9QZbK.png",
  },
  {
    id: "combo2",
    name: "Sweet Combo 69oz",
    price: 88000,
    description: "TIẾT KIỆM 46K!!! Gồm: 1 Bắp (69oz) + 2 Nước có gaz (22oz)",
    image: "https://i.imgur.com/0Q9QZbK.png",
  },
];

const BookingConfirmationPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  // Get state from navigation
  const bookingState = location.state as BookingConfirmationState;
  const selectedCombos = bookingState.selectedCombos || {};
  const comboTotal = bookingState.comboTotal || 0;
  const ticketTotal =
    bookingState.ticketTotal || bookingState.totalPrice - comboTotal;

  // Local state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  const [bookingCode, setBookingCode] = useState<string>("");

  // Get authentication state
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Handle back button click
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle confirm booking
  const handleConfirmBooking = async () => {
    if (
      !bookingState ||
      !bookingState.selectedSeats ||
      bookingState.selectedSeats.length === 0
    ) {
      setError("Không có thông tin ghế được chọn");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a booking request
      const bookingRequest = {
        scheduleId: bookingState.showtimeInfo.scheduleId,
        roomId: bookingState.showtimeInfo.roomId,
        seatCodes: bookingState.selectedSeats,
        totalAmount: bookingState.totalPrice,
        paymentMethod: "QR_MOMO", // Default payment method
      };

      // Mock API call for booking
      // In production, replace this with actual API call
      // const response = await axiosInstance.post('/api/v1/bookings', bookingRequest);

      // Mock successful response
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay

      // Generate a random booking code
      const mockBookingCode = `BK${Math.floor(Math.random() * 10000)}`;
      setBookingCode(mockBookingCode);
      setBookingComplete(true);
      toast.success("Đặt vé thành công!");
    } catch (err: any) {
      console.error("Error confirming booking:", err);
      setError(err.message || "Lỗi khi xác nhận đặt vé");
      toast.error("Đặt vé thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // If no booking state, show error
  if (!bookingState || !bookingState.showtimeInfo) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy thông tin đặt vé. Vui lòng quay lại trang chi tiết
          phim.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/movies")}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách phim
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
        disabled={loading || bookingComplete}
      >
        Quay lại
      </Button>

      {/* Header */}
      <Typography variant="h4" gutterBottom>
        {bookingComplete ? "Đặt vé thành công" : "Xác nhận đặt vé"}
      </Typography>

      {/* Main content */}
      {isAuthenticated ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Paper sx={{ p: 3, width: "100%", mb: 4 }}>
            {loading ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                p={5}
                gap={2}
              >
                <CircularProgress />
                <Typography>Đang xử lý đặt vé...</Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : bookingComplete ? (
              // Booking successful view
              <Box sx={{ textAlign: "center" }}>
                <CheckCircleIcon
                  sx={{
                    fontSize: 80,
                    color: theme.palette.success.main,
                    mb: 2,
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  Đặt vé thành công!
                </Typography>
                <Typography variant="body1" paragraph>
                  Mã đặt vé của bạn là: <b>{bookingCode}</b>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 4, color: theme.palette.text.secondary }}
                >
                  Vui lòng lưu lại mã đặt vé này để sử dụng khi đến rạp.
                </Typography>

                <Divider sx={{ my: 3 }} />

                {/* Booking details summary */}
                <Grid container spacing={2} sx={{ textAlign: "left", mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Phim:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bookingState.showtimeInfo.movieName}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight="bold">
                      Rạp chiếu:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bookingState.showtimeInfo.branchName}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight="bold">
                      Phòng chiếu:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bookingState.showtimeInfo.roomName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Suất chiếu:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bookingState.showtimeInfo.scheduleTime} -{" "}
                      {bookingState.showtimeInfo.scheduleDate}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight="bold">
                      Ghế:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bookingState.selectedSeats.join(", ")}
                    </Typography>

                    <Typography variant="subtitle1" fontWeight="bold">
                      Tổng tiền:
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                    >
                      {bookingState.totalPrice.toLocaleString("vi-VN")}đ
                    </Typography>
                  </Grid>
                </Grid>
                {/* Combo summary if any */}
                {Object.values(selectedCombos).some((qty) => qty > 0) && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 3,
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="#d81b60"
                    >
                      Combo đã chọn
                    </Typography>
                    <List dense>
                      {Object.entries(selectedCombos).map(([id, qty]) => {
                        if (!qty) return null;
                        const combo = comboList.find((c) => c.id === id);
                        if (!combo) return null;
                        return (
                          <ListItem key={id} sx={{ py: 0.5 }}>
                            <img
                              src={combo.image}
                              alt={combo.name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                marginRight: 12,
                              }}
                            />
                            <ListItemText
                              primary={
                                <>
                                  <b>{combo.name}</b> x {qty}
                                </>
                              }
                              secondary={
                                combo.price.toLocaleString("vi-VN") +
                                "đ / combo"
                              }
                            />
                            <Typography fontWeight="bold" color="#d81b60">
                              {(combo.price * qty).toLocaleString("vi-VN")}đ
                            </Typography>
                          </ListItem>
                        );
                      })}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight="bold">Tổng combo:</Typography>
                      <Typography fontWeight="bold" color="#d81b60">
                        {comboTotal.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  </Paper>
                )}

                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/booking-history")}
                    sx={{ px: 4, py: 1 }}
                  >
                    Lịch sử đặt vé
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/movies")}
                    sx={{ px: 3, py: 1 }}
                  >
                    Quay lại danh sách phim
                  </Button>
                </Box>
              </Box>
            ) : (
              // Booking confirmation view
              <Box>
                <Typography variant="h5" gutterBottom>
                  Thông tin đặt vé
                </Typography>

                {/* Movie & Showtime Details */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Thông tin phim
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Phim:</strong>{" "}
                        {bookingState.showtimeInfo.movieName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Thời gian:</strong>{" "}
                        {bookingState.showtimeInfo.scheduleTime}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Ngày:</strong>{" "}
                        {bookingState.showtimeInfo.scheduleDate}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        fontWeight="bold"
                      >
                        Thông tin rạp
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Rạp:</strong>{" "}
                        {bookingState.showtimeInfo.branchName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Phòng:</strong>{" "}
                        {bookingState.showtimeInfo.roomName}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Seat Details */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold"
                  >
                    Thông tin ghế
                  </Typography>
                  <Typography variant="body1">
                    <strong>Số lượng ghế:</strong>{" "}
                    {bookingState.selectedSeats.length}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Ghế đã chọn:</strong>{" "}
                    {bookingState.selectedSeats.join(", ")}
                  </Typography>
                </Paper>

                {/* Combo summary if any */}
                {Object.values(selectedCombos).some((qty) => qty > 0) && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 4,
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      gutterBottom
                      fontWeight="bold"
                      color="#d81b60"
                    >
                      Combo đã chọn
                    </Typography>
                    <List dense>
                      {Object.entries(selectedCombos).map(([id, qty]) => {
                        if (!qty) return null;
                        const combo = comboList.find((c) => c.id === id);
                        if (!combo) return null;
                        return (
                          <ListItem key={id} sx={{ py: 0.5 }}>
                            <img
                              src={combo.image}
                              alt={combo.name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 6,
                                marginRight: 12,
                              }}
                            />
                            <ListItemText
                              primary={
                                <>
                                  <b>{combo.name}</b> x {qty}
                                </>
                              }
                              secondary={
                                combo.price.toLocaleString("vi-VN") +
                                "đ / combo"
                              }
                            />
                            <Typography fontWeight="bold" color="#d81b60">
                              {(combo.price * qty).toLocaleString("vi-VN")}đ
                            </Typography>
                          </ListItem>
                        );
                      })}
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight="bold">Tổng combo:</Typography>
                      <Typography fontWeight="bold" color="#d81b60">
                        {comboTotal.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Box>
                  </Paper>
                )}
                {/* Payment Details */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 4,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold"
                  >
                    Thông tin thanh toán
                  </Typography>
                  <Grid container alignItems="center">
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        <strong>Tổng tiền:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary"
                      >
                        {bookingState.totalPrice.toLocaleString("vi-VN")}đ
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    * Giá đã bao gồm thuế VAT
                  </Typography>
                </Paper>

                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  {/* <Button 
                    variant="contained" 
                    color="primary"
                    size="large"
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    sx={{ 
                      px: 6, 
                      py: 1.5,
                      borderRadius: '8px',
                      fontSize: '1.1rem'
                    }}
                  >
                    Xác nhận và thanh toán
                  </Button> */}
                  <div style={{ width: 400, height: 400 }}>
                  <img style={{ width: '100%', height: '100%' }} src="https://qr.sepay.vn/img?acc=VQRQACHDW3604&bank=MBBank&amount=10000000&des=hfdjsfdsk&template=compact"></img>
                  </div>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Vui lòng đăng nhập để tiếp tục.
        </Alert>
      )}
    </Container>
  );
};

export default BookingConfirmationPage;
