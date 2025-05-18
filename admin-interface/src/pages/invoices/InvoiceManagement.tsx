import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Invoice, InvoiceFormData } from '../../types/invoice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

interface User { id: number; fullName: string; }
interface Booking { id: number; code: string; }

const validationSchema = Yup.object({
  userId: Yup.number().required('Người dùng là bắt buộc'),
  bookingId: Yup.number().required('Đặt vé là bắt buộc'),
  amount: Yup.number().required('Số tiền là bắt buộc').min(0, 'Số tiền phải lớn hơn 0'),
  status: Yup.string().required('Trạng thái là bắt buộc'),
});

const InvoiceManagement: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const formik = useFormik<InvoiceFormData>({
    initialValues: {
      userId: 0,
      bookingId: 0,
      amount: 0,
      status: 'UNPAID',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (selectedInvoice) {
          await axios.put('/api/invoices', values);
          setSnackbar({ open: true, message: 'Cập nhật hóa đơn thành công', severity: 'success' });
        } else {
          await axios.post('/api/invoices', values);
          setSnackbar({ open: true, message: 'Thêm hóa đơn thành công', severity: 'success' });
        }
        handleCloseDialog();
        fetchInvoices();
      } catch (error) {
        setSnackbar({ open: true, message: 'Có lỗi xảy ra', severity: 'error' });
      }
    },
  });

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/api/invoices');
      setInvoices(response.data.data.content);
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể tải danh sách hóa đơn', severity: 'error' });
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.data.content);
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể tải danh sách người dùng', severity: 'error' });
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/api/bookings');
      setBookings(response.data.data.content);
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể tải danh sách đặt vé', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchUsers();
    fetchBookings();
  }, []);

  const handleAdd = () => {
    setSelectedInvoice(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    formik.setValues({
      id: invoice.id,
      userId: invoice.userId,
      bookingId: invoice.bookingId,
      amount: invoice.amount,
      status: invoice.status,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      try {
        await axios.delete(`/api/invoices/${id}`);
        setSnackbar({ open: true, message: 'Xóa hóa đơn thành công', severity: 'success' });
        fetchInvoices();
      } catch (error) {
        setSnackbar({ open: true, message: 'Không thể xóa hóa đơn', severity: 'error' });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvoice(null);
    formik.resetForm();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'code', headerName: 'Mã hóa đơn', width: 120 },
    { field: 'userId', headerName: 'Người dùng', width: 180, valueGetter: (params) => {
      const user = users.find(u => u.id === params.row.userId);
      return user ? user.fullName : '';
    } },
    { field: 'bookingId', headerName: 'Đặt vé', width: 120, valueGetter: (params) => {
      const booking = bookings.find(b => b.id === params.row.bookingId);
      return booking ? booking.code : '';
    } },
    { field: 'amount', headerName: 'Số tiền', width: 120 },
    { field: 'status', headerName: 'Trạng thái', width: 120 },
    { field: 'createdAt', headerName: 'Ngày tạo', width: 150 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 180,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => handleEdit(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Quản lý hóa đơn
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Thêm hóa đơn
          </Button>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={invoices}
            columns={columns}
            paginationModel={{ page: 0, pageSize: 5 }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedInvoice ? 'Chỉnh sửa hóa đơn' : 'Thêm hóa đơn mới'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Người dùng</InputLabel>
                  <Select
                    name="userId"
                    value={formik.values.userId}
                    onChange={formik.handleChange}
                    error={formik.touched.userId && Boolean(formik.errors.userId)}
                  >
                    <MenuItem value={0} disabled>Chọn người dùng</MenuItem>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>{user.fullName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Đặt vé</InputLabel>
                  <Select
                    name="bookingId"
                    value={formik.values.bookingId}
                    onChange={formik.handleChange}
                    error={formik.touched.bookingId && Boolean(formik.errors.bookingId)}
                  >
                    <MenuItem value={0} disabled>Chọn đặt vé</MenuItem>
                    {bookings.map((booking) => (
                      <MenuItem key={booking.id} value={booking.id}>{booking.code}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Số tiền"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                  >
                    <MenuItem value="PAID">Đã thanh toán</MenuItem>
                    <MenuItem value="UNPAID">Chưa thanh toán</MenuItem>
                    <MenuItem value="CANCELLED">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {selectedInvoice ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceManagement; 