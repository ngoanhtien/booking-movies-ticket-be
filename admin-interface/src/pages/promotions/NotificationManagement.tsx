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
  TextareaAutosize
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
  Pending as PendingIcon
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
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { 
      field: 'title', 
      headerName: 'Tiêu đề', 
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" noWrap>{params.value}</Typography>
        </Tooltip>
      )
    },
    { 
      field: 'channel', 
      headerName: 'Kênh gửi', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={channelOptions.find(c => c.value === params.value)?.label || params.value} 
          size="small" 
          variant="outlined"
          color={params.value === 'PUSH' ? 'primary' : params.value === 'EMAIL' ? 'secondary' : 'info'}
        />
      )
    },
    { 
      field: 'targetAudience', 
      headerName: 'Đối tượng', 
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const audience = targetAudienceOptions.find(opt => opt.value === params.value);
        return (
          <Chip 
            icon={audience?.icon}
            label={audience?.label || params.row.customSegmentId || params.value}
            size="small" 
          />
        );
      }
    },
    { 
      field: 'sendTime', 
      headerName: 'Thời gian gửi', 
      width: 180,
      valueFormatter: (params) => formatDate(params.value as Date)
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const statusInfo = statusMapping[params.value as Notification['status']];
        return <Chip icon={statusInfo.icon} label={statusInfo.label} color={statusInfo.color} size="small" />;
      }
    },
    { 
      field: 'sentRead', 
      headerName: 'Đã gửi/Đã đọc', 
      width: 150,
      valueGetter: (params) => {
        const row = params.row as Notification;
        if (row.status === 'SENT') {
          return `${row.sentCount || 0} / ${row.readCount || 0}`;
        }
        return '-';
      }
    },
    { field: 'createdBy', headerName: 'Người tạo', width: 150 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 180,
      renderCell: (params: GridRenderCellParams) => {
        const notification = params.row as Notification;
        return (
          <Box>
            <Tooltip title="Xem chi tiết">
              <IconButton color="info" onClick={() => handleViewClick(notification)} size="small">
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {notification.status !== 'SENT' && (
              <Tooltip title="Chỉnh sửa">
                <IconButton color="primary" onClick={() => handleEditClick(notification)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Xóa">
              <IconButton color="error" onClick={() => handleDeleteClick(notification.id)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4">Gửi thông báo</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            Tạo thông báo mới
          </Button>
        </Box>

        <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <DataGrid
            rows={notifications}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'sendTime', sort: 'desc' }]
              }
            }}
            pageSizeOptions={[5, 10, 20]}
            density="standard"
            disableRowSelectionOnClick
            sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {dialogType === 'add' ? 'Tạo thông báo mới' : dialogType === 'edit' ? 'Chỉnh sửa thông báo' : 'Chi tiết thông báo'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề thông báo"
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nội dung thông báo"
                    name="message"
                    multiline
                    rows={4}
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    error={formik.touched.message && Boolean(formik.errors.message)}
                    helperText={formik.touched.message && formik.errors.message}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.channel && Boolean(formik.errors.channel)}>
                    <InputLabel>Kênh gửi</InputLabel>
                    <Select
                      name="channel"
                      value={formik.values.channel}
                      onChange={formik.handleChange}
                      label="Kênh gửi"
                      disabled={dialogType === 'view'}
                    >
                      {channelOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.channel && formik.errors.channel && (
                      <FormHelperText>{formik.errors.channel}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.targetAudience && Boolean(formik.errors.targetAudience)}>
                    <InputLabel>Đối tượng nhận</InputLabel>
                    <Select
                      name="targetAudience"
                      value={formik.values.targetAudience}
                      onChange={formik.handleChange}
                      label="Đối tượng nhận"
                      disabled={dialogType === 'view'}
                    >
                      {targetAudienceOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {option.icon && React.cloneElement(option.icon, { sx: { mr: 1 } })}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.targetAudience && formik.errors.targetAudience && (
                      <FormHelperText>{formik.errors.targetAudience}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {formik.values.targetAudience === 'CUSTOM_SEGMENT' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ID Phân khúc tùy chỉnh"
                      name="customSegmentId"
                      value={formik.values.customSegmentId}
                      onChange={formik.handleChange}
                      error={formik.touched.customSegmentId && Boolean(formik.errors.customSegmentId)}
                      helperText={formik.touched.customSegmentId && formik.errors.customSegmentId}
                      disabled={dialogType === 'view'}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={formik.values.targetAudience === 'CUSTOM_SEGMENT' ? 6 : 12}>
                  <DateTimePicker
                    label="Thời gian gửi"
                    value={formik.values.sendTime}
                    onChange={(date) => formik.setFieldValue('sendTime', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.sendTime && Boolean(formik.errors.sendTime),
                        helperText: formik.touched.sendTime && formik.errors.sendTime as string
                      }
                    }}
                    disabled={dialogType === 'view'}
                  />
                </Grid>
                {dialogType === 'view' && selectedNotification && (
                  <>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Trạng thái:</Typography>
                      <Chip 
                        icon={statusMapping[selectedNotification.status].icon}
                        label={statusMapping[selectedNotification.status].label} 
                        color={statusMapping[selectedNotification.status].color} 
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2">Người tạo:</Typography>
                      <Typography>{selectedNotification.createdBy}</Typography>
                    </Grid>
                    {selectedNotification.status === 'SENT' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2">Số lượng đã gửi:</Typography>
                          <Typography>{selectedNotification.sentCount || 0}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2">Số lượng đã đọc:</Typography>
                          <Typography>{selectedNotification.readCount || 0}</Typography>
                        </Grid>
                      </>
                    )}
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
              {dialogType !== 'view' && (
                <Button type="submit" variant="contained" startIcon={<SendIcon />}>
                  {dialogType === 'add' ? 'Lên lịch/Gửi' : 'Lưu thay đổi'}
                </Button>
              )}
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Xác nhận xóa thông báo</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa thông báo "{selectedNotification?.title}"? Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default NotificationManagement; 