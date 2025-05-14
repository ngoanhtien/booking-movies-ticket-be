import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { UserRequest } from '../../services/userService';
import { User, UserStatus, MembershipLevel, UserRole } from '../../types/user';

interface Props {
  user: User | null;
  onSave: (userData: UserRequest, avatarFile?: File) => void;
  onCancel: () => void;
}

const UserForm: React.FC<Props> = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatarUrl || null);

  const validationSchema = Yup.object({
    username: Yup.string()
      .required(t('validation.required', { field: t('users.username') }))
      .min(3, t('validation.minLength', { field: t('users.username'), min: 3 }))
      .max(50, t('validation.maxLength', { field: t('users.username'), max: 50 })),
    email: Yup.string()
      .required(t('validation.required', { field: t('users.email') }))
      .email(t('validation.email')),
    fullName: Yup.string()
      .required(t('validation.required', { field: t('users.fullName') }))
      .max(100, t('validation.maxLength', { field: t('users.fullName'), max: 100 })),
    phone: Yup.string()
      .required(t('validation.required', { field: t('users.phone') }))
      .matches(/^\+?[0-9]{10,15}$/, t('validation.phone')),
    membershipLevel: Yup.string()
      .required(t('validation.required', { field: t('users.membershipLevel') }))
      .oneOf(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'], t('validation.invalidMembershipLevel')),
    role: Yup.string()
      .required(t('validation.required', { field: t('users.role') }))
      .oneOf(['USER', 'ADMIN'], t('validation.invalidRole')),
    status: Yup.string()
      .required(t('validation.required', { field: t('common.status') }))
      .oneOf(['ACTIVE', 'INACTIVE'], t('validation.invalidStatus')),
    avatarUrl: Yup.string()
      .url(t('validation.url'))
      .nullable(),
  });

  const formik = useFormik({
    initialValues: {
      id: user?.id,
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      membershipLevel: (user?.membershipLevel as MembershipLevel) || 'BRONZE',
      role: (user?.role as UserRole) || 'USER',
      status: (user?.status as UserStatus) || 'ACTIVE',
      avatarUrl: user?.avatarUrl || '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave(values, selectedFile || undefined);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>
        {user ? t('users.editTitle') : t('users.addTitle')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={previewUrl || undefined}
                alt={formik.values.fullName}
                sx={{ width: 100, height: 100 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <CloudUploadIcon />
                </IconButton>
              </label>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="username"
              name="username"
              label={t('users.username')}
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label={t('users.email')}
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="fullName"
              name="fullName"
              label={t('users.fullName')}
              value={formik.values.fullName}
              onChange={formik.handleChange}
              error={formik.touched.fullName && Boolean(formik.errors.fullName)}
              helperText={formik.touched.fullName && formik.errors.fullName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label={t('users.phone')}
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              id="membershipLevel"
              name="membershipLevel"
              label={t('users.membershipLevel')}
              value={formik.values.membershipLevel}
              onChange={formik.handleChange}
              error={formik.touched.membershipLevel && Boolean(formik.errors.membershipLevel)}
              helperText={formik.touched.membershipLevel && formik.errors.membershipLevel}
            >
              <MenuItem value="BRONZE">{t('users.membershipLevels.bronze')}</MenuItem>
              <MenuItem value="SILVER">{t('users.membershipLevels.silver')}</MenuItem>
              <MenuItem value="GOLD">{t('users.membershipLevels.gold')}</MenuItem>
              <MenuItem value="PLATINUM">{t('users.membershipLevels.platinum')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              id="role"
              name="role"
              label={t('users.role')}
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
            >
              <MenuItem value="USER">{t('users.roles.user')}</MenuItem>
              <MenuItem value="ADMIN">{t('users.roles.admin')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              id="status"
              name="status"
              label={t('common.status')}
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              <MenuItem value="ACTIVE">{t('common.active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('common.inactive')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" color="primary">
          {t('common.save')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default UserForm; 