import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Collapse,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  AccessTime as ShowtimeIcon,
  People as UserIcon,
  ConfirmationNumber as BookingIcon,
  Logout as LogoutIcon,
  Theaters as TheatersIcon,
  Business as BusinessIcon,
  ReceiptLong as ReceiptLongIcon,
  BarChart as BarChartIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 260;

type SidebarGroup = 'user' | 'movies' | 'cinema' | 'theater' | 'room' | 'promotions';

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [openGroups, setOpenGroups] = useState<Record<SidebarGroup, boolean>>({
    user: false,
    movies: false,
    cinema: false,
    theater: false,
    room: false,
    promotions: false,
  });

  const handleGroupClick = (group: SidebarGroup) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f4f6f8' }}>
      <Toolbar sx={{ 
        px: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <Typography variant="h6" noWrap component="div" fontWeight="700" color="primary">
          {t('common.adminPanel')}
        </Typography>
      </Toolbar>
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 2 }}>
        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', 
          mb: 2 
        }}>
          <List component="nav" disablePadding>
            <ListItem 
              button 
              onClick={() => handleNavigation('/admin/dashboard')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                borderRadius: 0,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#2196f3' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('common.dashboard')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          mb: 2 
        }}>
          <List component="nav" disablePadding>
            {/* User Management */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('user')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#ff9800' }}>
                <UserIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.userManagement')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.user ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.user} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/users')}
                >
                  <ListItemText 
                    primary={t('sidebar.allUsers')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5, 
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/users/roles')}
                >
                  <ListItemText 
                    primary={t('sidebar.rolesPermissions')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>
            
            {/* Movies Management */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('movies')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#2196f3' }}>
                <MovieIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.moviesManagement')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.movies ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.movies} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/movies')}
                >
                  <ListItemText 
                    primary={t('sidebar.allMovies')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/movies/schedules')}
                >
                  <ListItemText 
                    primary={t('sidebar.movieSchedules')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Paper>

        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          mb: 2
        }}>
          <List component="nav" disablePadding>
            {/* Cinema Management */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('cinema')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#9c27b0' }}>
                <TheatersIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.cinemaManagement')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.cinema ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.cinema} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/cinemas')}
                >
                  <ListItemText 
                    primary={t('sidebar.allCinemas')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>

            {/* Theater Management */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('theater')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#4caf50' }}>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.theaterManagement')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.theater ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.theater} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/theaters')}
                >
                  <ListItemText 
                    primary={t('sidebar.allTheaters')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/theaters/locations')}
                >
                  <ListItemText 
                    primary={t('sidebar.theaterLocations')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>

            {/* Room Management */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('room')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#f44336' }}>
                <ReceiptLongIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.roomManagement')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.room ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.room} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/rooms')}
                >
                  <ListItemText 
                    primary={t('sidebar.allRooms')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/showtimes')}
                >
                  <ListItemText 
                    primary={t('sidebar.showtimes')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Paper>

        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
        }}>
          <List component="nav" disablePadding>
            {/* Promotions */}
            <ListItem 
              button 
              onClick={() => handleGroupClick('promotions')} 
              sx={{ 
                py: 1.5,
                px: 2.5,
                '&:hover': { 
                  bgcolor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#ff9800' }}>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText 
                primary={t('sidebar.promotions')} 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }} 
              />
              {openGroups.promotions ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={openGroups.promotions} timeout="auto" unmountOnExit>
              <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/promotions')}
                >
                  <ListItemText 
                    primary={t('sidebar.allPromotions')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/promotions/discounts')}
                >
                  <ListItemText 
                    primary={t('sidebar.discounts')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
                <ListItem 
                  button 
                  sx={{ 
                    py: 1.2, 
                    pl: 7,
                    pr: 2.5,
                    '&:hover': { 
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }} 
                  onClick={() => handleNavigation('/admin/promotions/notifications')}
                >
                  <ListItemText 
                    primary={t('sidebar.sendNotifications')} 
                    primaryTypographyProps={{ 
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.secondary'
                    }} 
                  />
                </ListItem>
              </List>
            </Collapse>
          </List>
        </Paper>
      </Box>

      <Paper elevation={0} sx={{ 
        m: 2, 
        p: 2, 
        borderRadius: 3, 
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 46, 
              height: 46, 
              borderRadius: 2, 
              bgcolor: 'primary.main',
              mr: 1.5
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight="600" color="text.primary">
              {user?.name || t('common.adminUser')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'admin@example.com'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          bgcolor: 'white',
          color: 'text.primary'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight="700">
            {user?.name || t('common.adminPanel')}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '0 0 20px 0 rgba(0,0,0,0.04)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          bgcolor: '#f4f6f8',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 