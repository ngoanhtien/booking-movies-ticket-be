import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { userService, UpdateProfileRequest, ChangePasswordRequest, UserProfile as IUserProfile } from '../../services/userService';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  
  // Form states
  const [formData, setFormData] = useState<{
    fullname: string;
    email: string;
    phone: string;
    dob: string | null;
  }>({
    fullname: '',
    email: '',
    phone: '',
    dob: null,
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Error and success states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.fetchUserProfile();
      setProfile(userData);
      setFormData({
        fullname: userData.fullname,
        email: userData.email,
        phone: userData.phone || '',
        dob: userData.dob || null,
      });
      setAvatarPreview(userData.avatarUrl);
      setError(null);
    } catch (err) {
      setError(t('profile.fetchError'));
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      dob: date ? format(date, 'yyyy-MM-dd') : null,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData: UpdateProfileRequest = {
        fullname: formData.fullname,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob || undefined,
        avatarFile: avatarFile,
      };
      
      const updatedProfile = await userService.updateUserProfile(updateData);
      setProfile(updatedProfile);
      setSuccess(t('profile.updateSuccess'));
      setEditMode(false);
    } catch (err) {
      setError(t('profile.updateError'));
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('profile.passwordMismatch'));
      return;
    }
    
    try {
      setLoading(true);
      await userService.changePassword(passwordData);
      setSuccess(t('profile.passwordChangeSuccess'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(t('profile.passwordChangeError'));
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullname: profile.fullname,
        email: profile.email,
        phone: profile.phone || '',
        dob: profile.dob || null,
      });
      setAvatarPreview(profile.avatarUrl);
      setAvatarFile(null);
    }
    setEditMode(false);
  };

  if (loading && !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Snackbar 
        open={!!error || !!success} 
        autoHideDuration={6000} 
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert 
          severity={error ? 'error' : 'success'} 
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Box position="relative">
                  <Avatar 
                    src={avatarPreview} 
                    alt={profile?.fullname || 'User'} 
                    sx={{ width: 120, height: 120, mb: 2 }}
                  />
                  {editMode && (
                    <label htmlFor="avatar-upload">
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                      <IconButton 
                        component="span"
                        sx={{
                          position: 'absolute',
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        }}
                        size="small"
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    </label>
                  )}
                </Box>
                
                <Typography variant="h5" component="h2" align="center" gutterBottom>
                  {profile?.fullname || ''}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                  @{profile?.username || ''}
                </Typography>
                <Box 
                  sx={{
                    display: 'inline-flex',
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: '16px',
                    px: 2,
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    {profile?.membershipLevel || 'BRONZE'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab icon={<BadgeIcon />} label={t('profile.personalInfo')} iconPosition="start" />
                <Tab icon={<LockIcon />} label={t('profile.security')} iconPosition="start" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  {!editMode && (
                    <Grid item xs={12} display="flex" justifyContent="flex-end">
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                      >
                        {t('common.edit')}
                      </Button>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.fullName')}
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.phone')}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label={t('profile.birthDate')}
                        value={formData.dob ? new Date(formData.dob) : null}
                        onChange={handleDateChange}
                        disabled={!editMode}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  
                  {editMode && (
                    <Grid item xs={12} display="flex" justifyContent="flex-end" spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          startIcon={<CancelIcon />}
                        >
                          {t('common.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                        >
                          {loading ? <CircularProgress size={24} /> : t('common.save')}
                        </Button>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </form>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handlePasswordSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('profile.currentPassword')}
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.newPassword')}
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t('profile.confirmPassword')}
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword.length > 0}
                      helperText={
                        passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword.length > 0 
                          ? t('profile.passwordMismatch') 
                          : ''
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12} display="flex" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : t('profile.changePassword')}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile; 