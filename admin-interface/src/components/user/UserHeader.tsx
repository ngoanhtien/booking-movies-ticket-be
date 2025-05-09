import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Movie,
  ConfirmationNumber,
  Person,
  History,
  Notifications,
  Language,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';

const UserHeader: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // State for user profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  // State for mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  // State for language menu
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(null);

  // Handle profile menu open
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  // Handle profile menu close
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  // Handle language menu open
  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  // Handle language menu close
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };

  // Handle change language
  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    handleLanguageMenuClose();
  };

  // Handle drawer toggle
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
    handleProfileMenuClose();
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          {t('common.appName')}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation('/movies')}>
          <ListItemIcon>
            <Movie />
          </ListItemIcon>
          <ListItemText primary={t('navigation.movies')} />
        </ListItem>
        
        {isAuthenticated && (
          <>
            <ListItem button onClick={() => handleNavigation('/booking')}>
              <ListItemIcon>
                <ConfirmationNumber />
              </ListItemIcon>
              <ListItemText primary={t('navigation.bookTicket')} />
            </ListItem>
            
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary={t('navigation.profile')} />
            </ListItem>
            
            <ListItem button onClick={() => handleNavigation('/booking-history')}>
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText primary={t('navigation.bookingHistory')} />
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        {!isAuthenticated ? (
          <>
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemText primary={t('auth.login')} />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemText primary={t('auth.register')} />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary={t('auth.logout')} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo and app name */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: 'flex',
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
              }}
            >
              {t('common.appName')}
            </Typography>

            {/* Mobile menu button */}
            {isMobile ? (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ ml: 'auto' }}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              <>
                {/* Desktop navigation links */}
                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                  <Button
                    component={RouterLink}
                    to="/movies"
                    sx={{ color: 'text.primary', mx: 1 }}
                  >
                    {t('navigation.movies')}
                  </Button>
                  
                  {isAuthenticated && (
                    <Button
                      component={RouterLink}
                      to="/booking"
                      sx={{ color: 'text.primary', mx: 1 }}
                    >
                      {t('navigation.bookTicket')}
                    </Button>
                  )}
                </Box>

                {/* Right-side items */}
                <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
                  {/* Language selector */}
                  <Box sx={{ mr: 2 }}>
                    <Tooltip title={t('common.language')}>
                      <IconButton onClick={handleLanguageMenuOpen} size="small">
                        <Language />
                      </IconButton>
                    </Tooltip>
                    <Menu
                      anchorEl={languageAnchorEl}
                      open={Boolean(languageAnchorEl)}
                      onClose={handleLanguageMenuClose}
                      PaperProps={{
                        sx: { minWidth: 120 }
                      }}
                    >
                      <MenuItem onClick={() => handleLanguageChange('vi')}>
                        Tiếng Việt
                      </MenuItem>
                      <MenuItem onClick={() => handleLanguageChange('en')}>
                        English
                      </MenuItem>
                    </Menu>
                  </Box>

                  {/* User profile or login/register buttons */}
                  {!isAuthenticated ? (
                    <>
                      <Button
                        component={RouterLink}
                        to="/login"
                        sx={{ color: 'text.primary', mx: 1 }}
                      >
                        {t('auth.login')}
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        sx={{ mx: 1 }}
                      >
                        {t('auth.register')}
                      </Button>
                    </>
                  ) : (
                    <Box>
                      <Tooltip title={t('navigation.profile')}>
                        <IconButton onClick={handleProfileMenuOpen} size="small">
                          <AccountCircle />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={profileAnchorEl}
                        open={Boolean(profileAnchorEl)}
                        onClose={handleProfileMenuClose}
                        PaperProps={{
                          sx: { width: 220 }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <Box sx={{ py: 1, px: 2 }}>
                          <Typography variant="subtitle1" noWrap>
                            {user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {user?.email}
                          </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => handleNavigation('/profile')}>
                          <ListItemIcon>
                            <Person fontSize="small" />
                          </ListItemIcon>
                          {t('navigation.profile')}
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/booking-history')}>
                          <ListItemIcon>
                            <History fontSize="small" />
                          </ListItemIcon>
                          {t('navigation.bookingHistory')}
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                          <ListItemIcon>
                            <Logout fontSize="small" />
                          </ListItemIcon>
                          {t('auth.logout')}
                        </MenuItem>
                      </Menu>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default UserHeader; 