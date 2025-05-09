import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Switch,
  FormControlLabel,
  TextareaAutosize,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  NotificationsActive as NotificationIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

// Define the Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  targetAudience: 'ALL_USERS' | 'SUBSCRIBERS' | 'NEW_USERS' | 'CUSTOM_SEGMENT';
  customSegmentId?: string;
  sendTime: Date;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED';
  channel: 'PUSH' | 'EMAIL' | 'SMS'; // Added channel for notification type
  sentCount?: number;
  readCount?: number;
  createdBy: string;
}

// Initial form values
const initialFormValues = {
  id: '',
  title: '',
  message: '',
  targetAudience: 'ALL_USERS' as Notification['targetAudience'],
  customSegmentId: '',
  sendTime: new Date(),
  status: 'DRAFT' as Notification['status'],
  channel: 'PUSH' as Notification['channel'],
  createdBy: 'Admin User'
};

// Mock data for notifications
const mockNotifications: Notification[] = [
  {
    id: 'N001',
    title: 'Chào mừng bạn mới!',
    message: 'Chào mừng bạn đã đến với hệ thống đặt vé của chúng tôi! Khám phá ngay hàng ngàn bộ phim hấp dẫn.',
    targetAudience: 'NEW_USERS',
    sendTime: new Date(2024, 5, 10, 10, 0, 0),
    status: 'SENT',
    channel: 'EMAIL',
    sentCount: 150,
    readCount: 120,
    createdBy: 'Marketing Team'
  },
  {
    id: 'N002',
    title: 'Khuyến mãi cuối tuần - Giảm 20%!',
    message: 'Đừng bỏ lỡ! Giảm giá 20% tất cả các vé xem phim vào cuối tuần này. Mã: WEEKEND20',
    targetAudience: 'ALL_USERS',
    sendTime: new Date(new Date().setDate(new Date().getDate() + 2)), // Scheduled for 2 days from now
    status: 'SCHEDULED',
    channel: 'PUSH',
    createdBy: 'Admin User'
  },
  {
    id: 'N003',
    title: 'Thông báo bảo trì hệ thống',
    message: 'Hệ thống sẽ tạm ngừng để bảo trì vào lúc 02:00 AM - 04:00 AM ngày 15/07. Mong quý khách thông cảm!',
    targetAudience: 'ALL_USERS',
    sendTime: new Date(2024, 6, 14, 18, 0, 0),
    status: 'SENT',
    channel: 'EMAIL',
    sentCount: 5000,
    readCount: 4500,
    createdBy: 'Technical Team'
  },
  {
    id: 'N004',
    title: 'Ra mắt phim bom tấn: Deadpool & Wolverine',
    message: 'Deadpool & Wolverine chính thức ra rạp! Đặt vé ngay để không bỏ lỡ siêu phẩm hành động hài hước này.',
    targetAudience: 'SUBSCRIBERS',
    sendTime: new Date(), // Sent now (example)
    status: 'DRAFT',
    channel: 'PUSH',
    createdBy: 'Content Team'
  },
  {
    id: 'N005',
    title: 'Ưu đãi đặc biệt cho thành viên VIP',
    message: 'Thành viên VIP nhận ngay ưu đãi giảm 30% cho combo bắp nước lớn. Áp dụng đến hết tháng này!',
    targetAudience: 'CUSTOM_SEGMENT',
    customSegmentId: 'VIP_MEMBERS_MAY2024',
    sendTime: new Date(2024, 4, 20, 9, 0, 0),
    status: 'SENT',
    channel: 'SMS',
    sentCount: 500,
    readCount: 480,
    createdBy: 'CRM Team'
  },
];

// Target audience options
const targetAudienceOptions = [
  { value: 'ALL_USERS', label: 'Tất cả người dùng', icon: <GroupIcon /> },
  { value: 'SUBSCRIBERS', label: 'Người dùng đã đăng ký', icon: <PersonIcon /> },
  { value: 'NEW_USERS', label: 'Người dùng mới', icon: <PersonIcon /> },
  { value: 'CUSTOM_SEGMENT', label: 'Phân khúc tùy chỉnh', icon: <GroupIcon /> }
];

// Channel options
const channelOptions = [
  { value: 'PUSH', label: 'Thông báo đẩy (Push)' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'Tin nhắn SMS' }
];

// Status options
const statusMapping: Record<Notification['status'], { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactElement }> = {
  DRAFT: { label: 'Bản nháp', color: 'default', icon: <PendingIcon /> },
  SCHEDULED: { label: 'Đã lên lịch', color: 'info', icon: <ScheduleIcon /> },
  SENT: { label: 'Đã gửi', color: 'success', icon: <CheckCircleIcon /> },
  FAILED: { label: 'Gửi thất bại', color: 'error', icon: <ErrorIcon /> }
};

const NotificationManagement: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit' | 'view'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | Notification['status']>( 'all');
  const [filterChannel, setFilterChannel] = useState<'all' | Notification['channel']>('all');

  // Get filtered notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || filterStatus === notification.status;

    const matchesChannel =
      filterChannel === 'all' || filterChannel === notification.channel;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  // Format Date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc'),
    message: Yup.string().required('Nội dung thông báo là bắt buộc'),
    targetAudience: Yup.string().required('Đối tượng nhận là bắt buộc'),
    customSegmentId: Yup.string().when('targetAudience', {
      is: 'CUSTOM_SEGMENT',
      then: (schema) => schema.required('ID phân khúc tùy chỉnh là bắt buộc'),
      otherwise: (schema) => schema.optional()
    }),
    sendTime: Yup.date().required('Thời gian gửi là bắt buộc').min(new Date(), 'Thời gian gửi phải trong tương lai'),
    channel: Yup.string().required('Kênh gửi là bắt buộc')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (dialogType === 'add') {
        const newNotification: Notification = {
          ...values,
          id: `N${(notifications.length + 1).toString().padStart(3, '0')}`,
          status: values.sendTime > new Date() ? 'SCHEDULED' : 'DRAFT', // Auto-set to SCHEDULED if future
        };
        setNotifications([...notifications, newNotification]);
      } else if (dialogType === 'edit' && selectedNotification) {
        const updatedNotifications = notifications.map(notif => 
          notif.id === selectedNotification.id 
            ? { 
                ...selectedNotification, 
                ...values, 
                status: values.sendTime > new Date() && values.status !== 'SENT' ? 'SCHEDULED' : values.status 
              }
            : notif
        );
        setNotifications(updatedNotifications);
      }
      handleCloseDialog();
    }
  });

  const handleAddClick = () => {
    setSelectedNotification(null);
    formik.resetForm({ values: initialFormValues });
    setDialogType('add');
    setOpenDialog(true);
  };

  const handleEditClick = (notification: Notification) => {
    setSelectedNotification(notification);
    formik.setValues({
      ...notification,
      customSegmentId: notification.customSegmentId || '', 
    });
    setDialogType('edit');
    setOpenDialog(true);
  };
  
  const handleViewClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogType('view');
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedNotification(notifications.find(n => n.id === id) || null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedNotification) {
      setNotifications(notifications.filter(notif => notif.id !== selectedNotification.id));
    }
    setDeleteConfirmOpen(false);
    setSelectedNotification(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNotification(null);
    formik.resetForm({ values: initialFormValues });
  };

  const handleSendClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setSendConfirmOpen(true);
  };

  const handleConfirmSend = () => {
    if (selectedNotification) {
      setNotifications(notifications.map(n => 
        n.id === selectedNotification.id ? { ...n, status: 'SENT', sendTime: new Date() } : n
      ));
    }
    setSendConfirmOpen(false);
    setSelectedNotification(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: t('notification.title', 'Tiêu đề'),
      flex: 2,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<Notification>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Tooltip title={params.row.message}>
             <Typography variant="body2" sx={{ fontWeight: 'bold' }} noWrap>{params.value}</Typography>
          </Tooltip>
        </Box>
      )
    },
    {
      field: 'targetAudience',
      headerName: t('notification.targetAudience', 'Đối tượng'),
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams<Notification>) => {
        const option = targetAudienceOptions.find(o => o.value === params.row.targetAudience);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {option?.icon && React.cloneElement(option.icon, { sx: { mr: 1, color: 'text.secondary'}})}
            <Typography variant="body2">{option?.label || params.row.targetAudience}</Typography>
          </Box>
        );
      }
    },
    {
      field: 'channel',
      headerName: t('notification.channel', 'Kênh'),
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Notification>) => (
        <Chip 
          label={channelOptions.find(c => c.value === params.value)?.label || params.value}
          size="small" 
          variant="outlined"
        />
      )
    },
    {
      field: 'sendTime',
      headerName: t('notification.sendTime', 'Thời gian gửi'),
      flex: 1.2,
      minWidth: 180,
      valueGetter: (params) => new Date(params.row.sendTime),
      renderCell: (params: GridRenderCellParams<Notification>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ScheduleIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="body2">{formatDate(params.row.sendTime)}</Typography>
        </Box>
      ),
      type: 'dateTime',
    },
    {
      field: 'status',
      headerName: t('notification.status', 'Trạng thái'),
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<Notification>) => {
        const statusInfo = statusMapping[params.row.status];
        return (
          <Chip 
            icon={React.cloneElement(statusInfo.icon, {fontSize: 'small'})}
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: t('common.actions', 'Thao tác'),
      width: 180, // Increased width for more actions
      sortable: false,
      renderCell: (params: GridRenderCellParams<Notification>) => (
        <Box>
          <Tooltip title={t('common.view', 'Xem chi tiết')}>
            <IconButton onClick={() => handleViewClick(params.row)} size="small" sx={{ color: 'info.main'}}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.edit', 'Chỉnh sửa')}>
            <IconButton 
              onClick={() => handleEditClick(params.row)} 
              size="small" 
              disabled={params.row.status === 'SENT'}
              sx={{ color: params.row.status !== 'SENT' ? 'primary.main' : 'text.disabled' }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('notification.sendNow', 'Gửi ngay')}>
            <IconButton 
              onClick={() => handleSendClick(params.row)} 
              size="small" 
              disabled={params.row.status === 'SENT'}
              sx={{ color: params.row.status !== 'SENT' ? 'success.main' : 'text.disabled' }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete', 'Xóa')}>
            <IconButton onClick={() => handleDeleteClick(params.row.id)} size="small" sx={{ color: 'error.main'}}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4">{t('notification.manageTitle','Quản lý Thông báo')}</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            {t('notification.addNew', 'Tạo thông báo mới')}
          </Button>
        </Box>

        {/* Search and filter section */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label={t('common.search', 'Tìm kiếm')}
            placeholder={t('notification.searchPlaceholder', 'Tìm theo tiêu đề, nội dung...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: 'auto', flexGrow: 1 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('notification.statusFilter', 'Trạng thái')}</InputLabel>
            <Select
              value={filterStatus}
              label={t('notification.statusFilter', 'Trạng thái')}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            >
              <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
              {Object.entries(statusMapping).map(([key, value]) => (
                <MenuItem key={key} value={key}>{value.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t('notification.channelFilter', 'Kênh gửi')}</InputLabel>
            <Select
              value={filterChannel}
              label={t('notification.channelFilter', 'Kênh gửi')}
              onChange={(e) => setFilterChannel(e.target.value as typeof filterChannel)}
            >
              <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
              {channelOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Stats Summary */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, flexGrow: 1 }}>
            <Box sx={{ mr: 1.5, backgroundColor: 'primary.light', borderRadius: '50%', p: 1, display: 'flex'}}><NotificationIcon sx={{color: 'primary.main'}} /></Box>
            <Box><Typography variant="body2" color="text.secondary">{t('notification.stats.total','Tổng số thông báo')}</Typography><Typography variant="h6">{notifications.length}</Typography></Box>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, flexGrow: 1 }}>
            <Box sx={{ mr: 1.5, backgroundColor: statusMapping.SCHEDULED.color + '.light', borderRadius: '50%', p: 1, display: 'flex'}}>{React.cloneElement(statusMapping.SCHEDULED.icon, {sx: {color: statusMapping.SCHEDULED.color + '.main'}})}</Box>
            <Box><Typography variant="body2" color="text.secondary">{t('notification.stats.scheduled','Đã lên lịch')}</Typography><Typography variant="h6">{notifications.filter(n=>n.status === 'SCHEDULED').length}</Typography></Box>
          </Paper>
          <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' }, flexGrow: 1 }}>
            <Box sx={{ mr: 1.5, backgroundColor: statusMapping.SENT.color + '.light', borderRadius: '50%', p: 1, display: 'flex'}}>{React.cloneElement(statusMapping.SENT.icon, {sx: {color: statusMapping.SENT.color + '.main'}})}</Box>
            <Box><Typography variant="body2" color="text.secondary">{t('notification.stats.sent','Đã gửi')}</Typography><Typography variant="h6">{notifications.filter(n=>n.status === 'SENT').length}</Typography></Box>
          </Paper>
        </Box>

        <Paper sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
          <DataGrid
            rows={filteredNotifications}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'sendTime', sort: 'desc' }] }
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            density="compact"
            disableRowSelectionOnClick
            sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {dialogType === 'add' && t('notification.dialog.addTitle', 'Tạo thông báo mới')}
              {dialogType === 'edit' && t('notification.dialog.editTitle', 'Chỉnh sửa thông báo')}
              {dialogType === 'view' && t('notification.dialog.viewTitle', 'Xem chi tiết thông báo')}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label={t('notification.form.title', 'Tiêu đề')} 
                    name="title" 
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    InputProps={{ readOnly: dialogType === 'view' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('notification.form.message', 'Nội dung thông báo')}
                    name="message"
                    multiline
                    rows={4}
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    error={formik.touched.message && Boolean(formik.errors.message)}
                    helperText={formik.touched.message && formik.errors.message}
                    InputProps={{ readOnly: dialogType === 'view' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={formik.touched.targetAudience && Boolean(formik.errors.targetAudience)}>
                    <InputLabel>{t('notification.form.targetAudience', 'Đối tượng nhận')}</InputLabel>
                    <Select
                      name="targetAudience"
                      value={formik.values.targetAudience}
                      onChange={formik.handleChange}
                      label={t('notification.form.targetAudience', 'Đối tượng nhận')}
                      inputProps={{ readOnly: dialogType === 'view' }}
                    >
                      {targetAudienceOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                           <Box sx={{display: 'flex', alignItems: 'center'}}>
                            {option.icon && React.cloneElement(option.icon, { sx: { mr: 1}})}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formik.touched.targetAudience && formik.errors.targetAudience}</FormHelperText>
                  </FormControl>
                </Grid>
                {formik.values.targetAudience === 'CUSTOM_SEGMENT' && (
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label={t('notification.form.customSegmentId', 'ID Phân khúc tùy chỉnh')} 
                      name="customSegmentId"
                      value={formik.values.customSegmentId}
                      onChange={formik.handleChange}
                      error={formik.touched.customSegmentId && Boolean(formik.errors.customSegmentId)}
                      helperText={formik.touched.customSegmentId && formik.errors.customSegmentId}
                      InputProps={{ readOnly: dialogType === 'view' }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={formik.touched.channel && Boolean(formik.errors.channel)}>
                    <InputLabel>{t('notification.form.channel', 'Kênh gửi')}</InputLabel>
                    <Select
                      name="channel"
                      value={formik.values.channel}
                      onChange={formik.handleChange}
                      label={t('notification.form.channel', 'Kênh gửi')}
                      inputProps={{ readOnly: dialogType === 'view' }}
                    >
                      {channelOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formik.touched.channel && formik.errors.channel}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DateTimePicker
                        label={t('notification.form.sendTime', 'Thời gian gửi')}
                        value={formik.values.sendTime}
                        onChange={(newValue) => formik.setFieldValue('sendTime', newValue)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: formik.touched.sendTime && Boolean(formik.errors.sendTime),
                                helperText: formik.touched.sendTime && typeof formik.errors.sendTime === 'string' ? formik.errors.sendTime : null,
                            },
                        }}
                        readOnly={dialogType === 'view'}
                        disablePast={dialogType !== 'view'}
                    />
                </Grid>
                 {dialogType === 'view' && selectedNotification && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">{t('notification.form.status', 'Trạng thái')}:</Typography>
                      <Chip 
                        icon={React.cloneElement(statusMapping[selectedNotification.status].icon, {fontSize: 'small'})}
                        label={statusMapping[selectedNotification.status].label}
                        color={statusMapping[selectedNotification.status].color}
                        size="small"
                      />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">{t('notification.form.createdBy', 'Tạo bởi')}:</Typography>
                      <Typography>{selectedNotification.createdBy}</Typography>
                    </Grid>
                    {selectedNotification.sentCount !== undefined && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">{t('notification.form.sentCount', 'Đã gửi')}:</Typography>
                        <Typography>{selectedNotification.sentCount}</Typography>
                      </Grid>
                    )}
                    {selectedNotification.readCount !== undefined && (
                       <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">{t('notification.form.readCount', 'Đã đọc')}:</Typography>
                        <Typography>{selectedNotification.readCount}</Typography>
                      </Grid>
                    )}
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>{t('common.close', 'Đóng')}</Button>
              {dialogType !== 'view' && (
                <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                  {dialogType === 'add' ? t('common.add', 'Thêm') : t('common.save', 'Lưu')}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>{t('notification.dialog.deleteConfirmTitle', 'Xác nhận xóa thông báo')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('notification.dialog.deleteConfirmMessage', 'Bạn có chắc chắn muốn xóa thông báo "{title}"? Hành động này không thể hoàn tác.', { title: selectedNotification?.title })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>{t('common.cancel', 'Hủy')}</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">{t('common.delete', 'Xóa')}</Button>
          </DialogActions>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={sendConfirmOpen} onClose={() => setSendConfirmOpen(false)}>
          <DialogTitle>{t('notification.dialog.sendConfirmTitle', 'Xác nhận gửi thông báo')}</DialogTitle>
          <DialogContent>
            <Typography>
              {t('notification.dialog.sendConfirmMessage', 'Bạn có chắc chắn muốn gửi thông báo "{title}" ngay bây giờ? Thông báo sẽ được gửi đến đối tượng đã chọn.', { title: selectedNotification?.title })}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSendConfirmOpen(false)}>{t('common.cancel', 'Hủy')}</Button>
            <Button onClick={handleConfirmSend} color="primary" variant="contained">{t('notification.sendNow', 'Gửi ngay')}</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default NotificationManagement; 