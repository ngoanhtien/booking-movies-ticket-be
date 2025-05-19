import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../../store/slices/authSlice';
import axiosInstance from '../../utils/axios';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: any) => state.auth);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Lấy đường dẫn chuyển hướng từ location.state
  const from = location.state?.from || '/movies';

  // Kiểm tra xem phiên đăng nhập có hết hạn không
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const expired = queryParams.get('expired');
    if (expired === 'true') {
      setSessionExpired(true);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginStart());
    setSessionExpired(false); // Xóa thông báo phiên hết hạn khi người dùng thử đăng nhập lại

    try {
      console.log("Đang đăng nhập với:", formData);
      const response = await axiosInstance.post('/auth/login', formData);
      console.log("Login API response:", response.data);

      const { accessToken, refreshToken } = response.data.result;
      
      // Store tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Get user info
      const userResponse = await axiosInstance.get('/user/me');
      console.log("User info API response:", userResponse.data);
      
      const userData = userResponse.data.result;
      
      // Tạo object user với các trường cần thiết
      const user = {
        id: userData.id,
        email: userData.email,
        fullName: userData.fullName,  // Lưu fullName từ backend
        name: userData.fullName,      // Tương thích với các component cũ sử dụng name
        role: userData.role           // Quan trọng cho việc phân quyền
      };
      
      console.log("User object for Redux:", user);
      
      dispatch(loginSuccess({ 
        user: user, 
        token: accessToken,
        refreshToken: refreshToken 
      }));

      // Chuyển hướng dựa trên vai trò người dùng và trang trước đó
      console.log("User role:", user.role);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        // Chuyển hướng về trang trước đó nếu có, hoặc về trang danh sách phim nếu không có
        navigate(from);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            {t('auth.login')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {sessionExpired && (
            <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
              Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('auth.username')}
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('auth.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.login')}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {t('auth.register')}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 