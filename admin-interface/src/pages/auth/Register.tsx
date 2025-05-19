import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validationSchema = Yup.object({
    fullName: Yup.string().required(t('validation.required', 'Trường này là bắt buộc')),
    username: Yup.string().required(t('validation.required', 'Trường này là bắt buộc')),
    email: Yup.string()
      .email(t('validation.email', 'Email không hợp lệ'))
      .required(t('validation.required', 'Trường này là bắt buộc')),
    password: Yup.string()
      .min(6, t('validation.passwordMin', 'Mật khẩu phải có ít nhất 6 ký tự'))
      .required(t('validation.required', 'Trường này là bắt buộc')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], t('validation.passwordMatch', 'Mật khẩu không khớp'))
      .required(t('validation.required', 'Trường này là bắt buộc')),
  });

  const formik = useFormik({
    initialValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const response = await axios.post('/auth/register', {
          fullName: values.fullName,
          username: values.username,
          email: values.email,
          password: values.password,
          role: 'USER',
        });
        
        setSuccess(t('auth.registerSuccess', 'Đăng ký thành công! Bạn có thể đăng nhập ngay.'));
      } catch (err: any) {
        setError(err.response?.data?.message || t('auth.registerError', 'Đăng ký thất bại. Vui lòng thử lại.'));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={6} 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          {t('auth.register', 'Register')}
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="fullName"
            label={t('auth.fullName', 'Full Name')}
            name="fullName"
            autoComplete="name"
            autoFocus
            value={formik.values.fullName}
            onChange={formik.handleChange}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName && formik.errors.fullName}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label={t('auth.username', 'Username')}
            name="username"
            autoComplete="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth.email', 'Email Address')}
            name="email"
            autoComplete="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('auth.password', 'Password')}
            type="password"
            id="password"
            autoComplete="new-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('auth.confirmPassword', 'Confirm Password')}
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('auth.register', 'Register')}
          </Button>
          <Grid container justifyContent="flex-end"> 
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none', color: 'primary.main', fontSize: '0.875rem' }}>
                {t('auth.alreadyHaveAccount', 'Already have an account? Sign in')}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 