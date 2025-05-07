import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Divider,
  Alert,
  Chip,
  Tooltip as MuiTooltip,
} from '@mui/material';
import {
  Movie as MovieIcon,
  AccessTime as ShowtimeIcon,
  People as UserIcon,
  ConfirmationNumber as BookingIcon,
  Add as AddIcon,
  Event as EventIcon,
  Group as GroupIcon,
  ListAlt as BookingListIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  Videocam as VideocamIcon,
  Category as CategoryIcon,
  Schedule as ScheduleIcon,
  NotificationsNone as NotificationsNoneIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
} from 'recharts';

const COLORS = [
  '#2196f3', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Amber
  '#FF8042', // Orange
  '#8884d8', // Purple
  '#e91e63', // Pink
  '#4caf50', // Green
  '#ff5722', // Deep Orange
];

const CHART_STYLES = {
  tooltip: {
    contentStyle: {
      borderRadius: '12px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
      padding: '10px 14px',
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.96)'
    },
    labelStyle: {
      fontWeight: 600, 
      marginBottom: 5,
      color: '#333'
    },
    itemStyle: {
      padding: '4px 0'
    },
    animationDuration: 300
  },
  grid: {
    stroke: '#e0e0e0',
    strokeOpacity: 0.7,
    strokeDasharray: '3 3',
    vertical: false
  },
  axis: {
    tick: {
      fontSize: 11, 
      fill: '#555'
    },
    axisLine: false,
    tickLine: false
  }
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-5px)'} }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Avatar sx={{ bgcolor: color || 'primary.main', color: 'white', mr: 1.5, width: 48, height: 48, borderRadius: 2 }}>{icon}</Avatar>
        <Typography variant="subtitle1" fontWeight="600" component="div" color="text.secondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: color || 'text.primary', textAlign: 'right' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const ChartContainer: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactElement;
}> = ({ title, icon, children }) => (
  <Paper 
    sx={{ 
      p: 3, 
      borderRadius: 3, 
      boxShadow: '0 8px 30px 0 rgba(0,0,0,0.08)', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px 0 rgba(0,0,0,0.12)',
      },
      overflow: 'hidden',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, primary.main, primary.light)',
        opacity: 0.7,
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, position: 'relative', zIndex: 1 }}>
      {icon && (
        <Box 
          sx={{ 
            mr: 1.5, 
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.lighter',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="div" fontWeight="600" color="text.primary">
        {title}
      </Typography>
    </Box>
    <Box sx={{ flexGrow: 1, height: 280, position: 'relative', zIndex: 1 }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  </Paper>
);

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const stats = {
    movies: 25,
    showtimes: 150,
    users: 1000,
    bookings: 500,
    revenue: '₫120M',
  };
  const mockRecentBookings = [
    { id: 'B001', user: 'Nguyễn Văn An', movie: 'Lật Mặt 7', time: 'Hôm qua 18:00', status: 'Confirmed', avatarIcon: <ReceiptIcon fontSize="small" />, avatarBg: '#e8f5e9', avatarColor: '#388e3c' },
    { id: 'B002', user: 'Trần Thị Bảo', movie: 'Doraemon Movie', time: 'Hôm nay 20:00', status: 'Pending', avatarIcon: <ReceiptIcon fontSize="small" />, avatarBg: '#fff8e1', avatarColor: '#f57c00' },
    { id: 'B003', user: 'Lê Văn Cường', movie: 'Godzilla x Kong', time: '2 ngày trước', status: 'Cancelled', avatarIcon: <ReceiptIcon fontSize="small" />, avatarBg: '#ffebee', avatarColor: '#d32f2f' },
  ];
  const mockRecentUsers = [
    { id: 'U001', name: 'Phạm Minh Tuấn', email: 'tuanpm@example.com', joined: '06/05/24', avatarSeed: 'T', avatarBg: COLORS[0] },
    { id: 'U002', name: 'Hồ Thị Mai', email: 'maih@example.com', joined: '05/05/24', avatarSeed: 'M', avatarBg: COLORS[1] },
    { id: 'U003', name: 'Đặng Văn Kiên', email: 'kiendv@example.com', joined: '04/05/24', avatarSeed: 'K', avatarBg: COLORS[2] },
  ];
  const mockRecentMovies = [
    { id: 'M001', title: 'Tarot', added: '07/05/24', avatarIcon: <VideocamIcon fontSize="small" />, avatarBg: '#e3f2fd', avatarColor: '#0288d1' },
    { id: 'M002', title: 'Vây Hãm: Kẻ Trừng Phạt', added: '05/05/24', avatarIcon: <VideocamIcon fontSize="small" />, avatarBg: '#e3f2fd', avatarColor: '#0288d1' },
    { id: 'M003', title: 'Án Mạng Lầu 4', added: '03/05/24', avatarIcon: <VideocamIcon fontSize="small" />, avatarBg: '#e3f2fd', avatarColor: '#0288d1' },
  ];
  const mockAlerts = [
    { id: 1, severity: 'warning', messageKey: 'dashboard.alertPendingBookingsCount', messageArgs: { count: 2 }, defaultMessage: 'Có {count} đơn đặt vé đang chờ xác nhận!', icon: <WarningIcon /> },
    { id: 2, severity: 'info', messageKey: 'dashboard.alertUpcomingShowtimeCount', messageArgs: { count: 1, time: 30 }, defaultMessage: 'Có {count} suất chiếu sắp diễn ra trong {time} phút!', icon: <NotificationsNoneIcon /> },
  ];

  const salesByMonth = [
    { month: t('months.jan', 'Thg 1'), revenue: 120 }, { month: t('months.feb', 'Thg 2'), revenue: 150 },
    { month: t('months.mar', 'Thg 3'), revenue: 180 }, { month: t('months.apr', 'Thg 4'), revenue: 210 },
    { month: t('months.may', 'Thg 5'), revenue: 170 },
  ];
  const salesByMovie = [
    { name: 'Phim A', revenue: 80 }, { name: 'Phim B', revenue: 120 },
    { name: 'Phim C', revenue: 60 }, { name: 'Phim D', revenue: 90 },
  ];
  const salesByCinema = [
    { name: 'Rạp 1', revenue: 100 }, { name: 'Rạp 2', revenue: 80 },
    { name: 'Rạp 3', revenue: 120 },
  ];
  const salesByFormat = [
    { name: '2D', value: 150 }, { name: '3D', value: 90 },
    { name: 'IMAX', value: 70 },
  ];
  const salesByTime = [
    { time: '09:00', revenue: 20 }, { time: '12:00', revenue: 40 },
    { time: '15:00', revenue: 60 }, { time: '18:00', revenue: 80 },
    { time: '21:00', revenue: 50 },
  ];
  const salesTrend = [
    { date: '01/05', revenue: 20 }, { date: '02/05', revenue: 25 },
    { date: '03/05', revenue: 30 }, { date: '04/05', revenue: 35 },
    { date: '05/05', revenue: 40 }, { date: '06/05', revenue: 42 },
    { date: '07/05', revenue: 38 },
  ];

  const getStatusChip = (status: string) => {
    let chipColor: 'success' | 'warning' | 'error' | 'default' = 'default';
    let translatedStatus = status;
    if (status === 'Confirmed') { chipColor = 'success'; translatedStatus = t('status.confirmed', 'Đã xác nhận'); }
    if (status === 'Pending') { chipColor = 'warning'; translatedStatus = t('status.pending', 'Chờ xử lý'); }
    if (status === 'Cancelled') { chipColor = 'error'; translatedStatus = t('status.cancelled', 'Đã hủy'); }
    return <Chip label={translatedStatus} color={chipColor} size="small" sx={{ fontWeight: '600', borderRadius: '6px', height: 'auto', padding: '2px 8px', fontSize: '0.7rem'}} />;
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 }, bgcolor: '#f4f6f8', minHeight: 'calc(100vh - 64px)' }}>
      {/* Top: Title & Quick Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary">
          {t('dashboard.title', 'Bảng điều khiển')}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', justifyContent: 'flex-end', gap: {xs: 1, sm: 1.5} }}>
          <MuiTooltip title={t('dashboard.addMovieFull', 'Thêm phim mới vào hệ thống')} placement="bottom">
            <Button variant="contained" size="medium" startIcon={<AddIcon />} href="/admin/movies" sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textTransform: 'none' }}>{t('dashboard.addMovie', 'Thêm phim')}</Button>
          </MuiTooltip>
          <MuiTooltip title={t('dashboard.manageShowtimesFull', 'Quản lý các suất chiếu phim')} placement="bottom">
            <Button variant="outlined" size="medium" startIcon={<EventIcon />} href="/admin/showtimes" sx={{ borderRadius: 2, textTransform: 'none' }}>{t('dashboard.showtimes', 'Suất chiếu')}</Button>
          </MuiTooltip>
          <MuiTooltip title={t('dashboard.manageUsersFull', 'Quản lý tài khoản người dùng')} placement="bottom">
            <Button variant="outlined" size="medium" startIcon={<GroupIcon />} href="/admin/users" sx={{ borderRadius: 2, textTransform: 'none' }}>{t('dashboard.users', 'Người dùng')}</Button>
          </MuiTooltip>
          <MuiTooltip title={t('dashboard.viewBookingsFull', 'Xem danh sách tất cả đặt vé')} placement="bottom">
            <Button variant="outlined" size="medium" startIcon={<BookingListIcon />} href="/admin/bookings" sx={{ borderRadius: 2, textTransform: 'none' }}>{t('dashboard.bookings', 'Đặt vé')}</Button>
          </MuiTooltip>
          <MuiTooltip title={t('dashboard.viewReportsFull', 'Xem báo cáo doanh thu và phân tích')} placement="bottom">
            <Button variant="outlined" size="medium" startIcon={<BarChartIcon />} href="/admin/reports" sx={{ borderRadius: 2, textTransform: 'none' }}>{t('dashboard.reports', 'Báo cáo')}</Button>
          </MuiTooltip>
        </Stack>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title={t('dashboard.totalMovies', 'Tổng số phim')} value={stats.movies} icon={<MovieIcon />} color="#2196f3" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title={t('dashboard.totalShowtimes', 'Tổng suất chiếu')} value={stats.showtimes} icon={<EventIcon />} color="#4caf50" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title={t('dashboard.totalUsers', 'Tổng người dùng')} value={stats.users} icon={<UserIcon />} color="#ff9800" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title={t('dashboard.totalBookings', 'Tổng đặt vé')} value={stats.bookings} icon={<BookingIcon />} color="#f44336" /></Grid>
        <Grid item xs={12} sm={6} md={2.4}><StatCard title={t('dashboard.totalRevenue', 'Tổng doanh thu')} value={stats.revenue} icon={<BarChartIcon />} color="#9c27b0"/></Grid>
      </Grid>

      {/* Middle: Recent Activity & Alerts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={3} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight="600">{t('dashboard.recentBookings', 'Đặt vé gần đây')}</Typography>
            <List disablePadding>
              {mockRecentBookings.map((b, index) => (
                <React.Fragment key={b.id}>
                  <ListItem disableGutters sx={{ py: 1.25, alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5 }}>
                      <Avatar sx={{ bgcolor: b.avatarBg, color: b.avatarColor, width: 40, height: 40, borderRadius: 2 }}>{b.avatarIcon}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: '500', variant:'body1', mb: 0.5, color: 'text.primary'}}
                      primary={<span>{b.user} - <b>{b.movie}</b></span>}
                      secondaryTypographyProps={{variant: 'caption', color: 'text.secondary'}}
                      secondary={<Stack direction="column" spacing={0.5}><span>{b.time}</span>{getStatusChip(b.status)}</Stack>}
                    />
                  </ListItem>
                  {index < mockRecentBookings.length - 1 && <Divider variant="inset" component="li" sx={{ml: '56px !important'}} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={3} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight="600">{t('dashboard.recentUsers', 'Người dùng mới')}</Typography>
            <List disablePadding>
              {mockRecentUsers.map((u, index) => (
                <React.Fragment key={u.id}>
                  <ListItem disableGutters sx={{ py: 1.25, alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5 }}>
                      <Avatar sx={{ bgcolor: u.avatarBg, color: 'white', width: 40, height: 40, borderRadius: 2, fontWeight:'bold' }}>{u.avatarSeed}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: '500', variant:'body1', mb: 0.5, color: 'text.primary'}}
                      primary={u.name}
                      secondaryTypographyProps={{variant: 'caption', color: 'text.secondary'}}
                      secondary={<Stack direction="column" spacing={0.5}><span>{u.email}</span><span>{t('dashboard.joined', 'Tham gia')}: <b>{u.joined}</b></span></Stack>}
                    />
                  </ListItem>
                  {index < mockRecentUsers.length - 1 && <Divider variant="inset" component="li" sx={{ml: '56px !important'}} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={3} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }} fontWeight="600">{t('dashboard.recentMovies', 'Phim mới thêm')}</Typography>
            <List disablePadding>
              {mockRecentMovies.map((m, index) => (
                <React.Fragment key={m.id}>
                  <ListItem disableGutters sx={{ py: 1.25, alignItems: 'flex-start' }}>
                    <ListItemAvatar sx={{ minWidth: 'auto', mr: 1.5 }}>
                      <Avatar sx={{ bgcolor: m.avatarBg, color: m.avatarColor, width: 40, height: 40, borderRadius: 2 }}>{m.avatarIcon}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ fontWeight: '500', variant:'body1', mb: 0.5, color: 'text.primary'}}
                      primary={m.title}
                      secondaryTypographyProps={{variant: 'caption', color: 'text.secondary'}}
                      secondary={<span>{t('dashboard.added', 'Ngày thêm')}: <b>{m.added}</b></span>}
                    />
                  </ListItem>
                  {index < mockRecentMovies.length - 1 && <Divider variant="inset" component="li" sx={{ml: '56px !important'}} />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={3} md={6}>
          <Paper sx={{ p: 2.5, borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2.5 } } fontWeight="600">{t('dashboard.alerts', 'Thông báo')}</Typography>
            <Stack spacing={2} sx={{flexGrow: 1}} justifyContent="center">
            {mockAlerts.map((alert) => (
              <Alert key={alert.id} severity={alert.severity as any} icon={alert.icon} sx={{ borderRadius: 2, alignItems: 'center', p: 1.5, boxShadow: 'none', border: `1px solid ${alert.severity}.light`, bgcolor: `${alert.severity}.lighter` }}>
                <Typography variant="body2" fontWeight="500">{t(alert.messageKey, { ...alert.messageArgs, defaultValue: alert.defaultMessage })}</Typography>
              </Alert>
            ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom: Analytics Charts */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }} fontWeight="700" color="text.primary">{t('dashboard.analytics', 'Phân tích doanh thu')}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesByMonth', 'Doanh thu theo tháng')} icon={<TrendingUpIcon />}>
              <BarChart 
                data={salesByMonth} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={8}
                barCategoryGap={16}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" strokeOpacity={0.7} />
                <XAxis 
                  dataKey="month" 
                  tick={{fontSize: 11, fill: '#555'}} 
                  axisLine={false} 
                  tickLine={false} 
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  tick={{fontSize: 11, fill: '#555'}} 
                  tickFormatter={(value) => `${value}${t('currency.millionShort','tr')}`} 
                  axisLine={false} 
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.05)'}} 
                  contentStyle={{
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                    padding: '10px 14px',
                    border: 'none'
                  }} 
                  formatter={(value: number) => [`${value} ${t('currency.million', 'triệu')}`, t('dashboard.revenue','Doanh thu')]} 
                  labelStyle={{fontWeight: 600, marginBottom: 5}}
                />
                <Legend 
                  wrapperStyle={{fontSize: '13px', paddingTop: '15px'}} 
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  dataKey="revenue" 
                  name={t('dashboard.revenue', 'Doanh thu')} 
                  fill="url(#colorRevenue)" 
                  stroke={COLORS[0]}
                  strokeWidth={1}
                  barSize={24} 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesByMovie', 'Doanh thu theo phim')} icon={<VideocamIcon />}>
              <BarChart data={salesByMovie} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#555'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#555'}} tickFormatter={(value) => `${value}${t('currency.millionShort','tr')}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px 12px'}} formatter={(value: number) => [`${value} ${t('currency.million', 'triệu')}`, t('dashboard.revenue','Doanh thu')]} />
                <Legend wrapperStyle={{fontSize: '13px', paddingTop: '15px'}} />
                <Bar dataKey="revenue" name={t('dashboard.revenue', 'Doanh thu')} fill={COLORS[1]} barSize={20} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesByCinema', 'Doanh thu theo rạp')} icon={<MovieIcon />}>
              <BarChart data={salesByCinema} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#555'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#555'}} tickFormatter={(value) => `${value}${t('currency.millionShort','tr')}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px 12px'}} formatter={(value: number) => [`${value} ${t('currency.million', 'triệu')}`, t('dashboard.revenue','Doanh thu')]} />
                <Legend wrapperStyle={{fontSize: '13px', paddingTop: '15px'}} />
                <Bar dataKey="revenue" name={t('dashboard.revenue', 'Doanh thu')} fill={COLORS[2]} barSize={20} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesByFormat', 'Doanh thu theo định dạng')} icon={<CategoryIcon />}>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  {salesByFormat.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorFormat${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={salesByFormat}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={95}
                  innerRadius={55}
                  paddingAngle={3}
                  labelLine={false}
                >
                  {salesByFormat.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#colorFormat${index})`} 
                      stroke={COLORS[index % COLORS.length]} 
                      strokeWidth={1.5}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                    padding: '10px 14px',
                    border: 'none'
                  }} 
                  formatter={(value: number, name: string) => [`${value} ${t('currency.million', 'triệu')}`, name]}
                  labelStyle={{fontWeight: 600, marginBottom: 5}}
                />
                <Legend 
                  iconSize={10} 
                  wrapperStyle={{fontSize: '13px', paddingTop: '18px'}} 
                  verticalAlign="bottom" 
                  align="center" 
                  layout="horizontal"
                  iconType="circle"
                />
              </PieChart>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesByTime', 'Doanh thu theo khung giờ')} icon={<ScheduleIcon />}>
              <LineChart data={salesByTime} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="time" tick={{fontSize: 11, fill: '#555'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#555'}} tickFormatter={(value) => `${value}${t('currency.millionShort','tr')}`} axisLine={false} tickLine={false} />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px 12px'}} formatter={(value: number) => [`${value} ${t('currency.million', 'triệu')}`, t('dashboard.revenue','Doanh thu')]} />
                <Legend wrapperStyle={{fontSize: '13px', paddingTop: '15px'}} />
                <Line type="monotone" dataKey="revenue" name={t('dashboard.revenue', 'Doanh thu')} stroke={COLORS[3]} strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 7, stroke: 'white', strokeWidth: 2, fill: COLORS[3] }} />
              </LineChart>
            </ChartContainer>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ChartContainer title={t('dashboard.salesTrend', 'Xu hướng doanh thu tuần')} icon={<TrendingUpIcon />}>
              <LineChart 
                data={salesTrend} 
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[4]} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS[4]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" strokeOpacity={0.7} />
                <XAxis 
                  dataKey="date" 
                  tick={{fontSize: 11, fill: '#555'}} 
                  axisLine={false} 
                  tickLine={false} 
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  tick={{fontSize: 11, fill: '#555'}} 
                  tickFormatter={(value) => `${value}${t('currency.millionShort','tr')}`} 
                  axisLine={false} 
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip 
                  cursor={{strokeDasharray: '3 3', stroke: '#999', strokeWidth: 1}} 
                  contentStyle={{
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)', 
                    padding: '10px 14px',
                    border: 'none'
                  }} 
                  formatter={(value: number) => [`${value} ${t('currency.million', 'triệu')}`, t('dashboard.revenue','Doanh thu')]} 
                  labelStyle={{fontWeight: 600, marginBottom: 5}}
                />
                <Legend 
                  wrapperStyle={{fontSize: '13px', paddingTop: '15px'}} 
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                />
                <Area
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={COLORS[4]} 
                  strokeWidth={3}
                  fill="url(#colorTrend)"
                  fillOpacity={1}
                  activeDot={{ r: 8, strokeWidth: 2, fill: 'white', stroke: COLORS[4] }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  name={t('dashboard.revenue', 'Doanh thu')} 
                  stroke={COLORS[4]} 
                  strokeWidth={3} 
                  dot={{ r: 5, strokeWidth: 2, fill: 'white', stroke: COLORS[4] }} 
                  activeDot={{ r: 8, stroke: 'white', strokeWidth: 2, fill: COLORS[4] }}
                />
              </LineChart>
            </ChartContainer>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard; 