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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Cinema, CinemaFormData } from '../../types/cinema';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(8, 'Tên rạp phải có ít nhất 8 ký tự')
    .max(225, 'Tên rạp không được vượt quá 225 ký tự')
    .required('Tên rạp là bắt buộc'),
  hotline: Yup.string()
    .matches(/^\+?[0-9. ()-]{7,25}$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại là bắt buộc'),
  description: Yup.string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  address: Yup.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .required('Địa chỉ là bắt buộc'),
});

const CinemaManagement: React.FC = () => {
  const { t } = useTranslation();
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const formik = useFormik<CinemaFormData>({
    initialValues: {
      name: '',
      hotline: '',
      description: '',
      address: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value);
          }
        });

        if (selectedCinema) {
          await axios.put(`/api/cinema`, formData);
          setSnackbar({
            open: true,
            message: 'Cập nhật rạp chiếu phim thành công',
            severity: 'success',
          });
        } else {
          await axios.post(`/api/cinema`, formData);
          setSnackbar({
            open: true,
            message: 'Thêm rạp chiếu phim thành công',
            severity: 'success',
          });
        }
        handleCloseDialog();
        fetchCinemas();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra',
          severity: 'error',
        });
      }
    },
  });

  const fetchCinemas = async () => {
    try {
      const response = await axios.get('/api/cinema');
      setCinemas(response.data.data.content);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách rạp chiếu phim',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleAdd = () => {
    setSelectedCinema(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (cinema: Cinema) => {
    setSelectedCinema(cinema);
    formik.setValues({
      id: cinema.id,
      name: cinema.name,
      hotline: cinema.hotline,
      description: cinema.description || '',
      address: cinema.address,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp chiếu phim này?')) {
      try {
        await axios.delete(`/api/cinema/${id}`);
        setSnackbar({
          open: true,
          message: 'Xóa rạp chiếu phim thành công',
          severity: 'success',
        });
        fetchCinemas();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Không thể xóa rạp chiếu phim',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCinema(null);
    formik.resetForm();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Tên rạp', flex: 1 },
    { field: 'hotline', headerName: 'Số điện thoại', width: 150 },
    { field: 'address', headerName: 'Địa chỉ', flex: 1 },
    { field: 'description', headerName: 'Mô tả', flex: 1 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 180,
      renderCell: (params) => (
        <>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Quản lý rạp chiếu phim
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Thêm rạp mới
          </Button>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={cinemas}
            columns={columns}
            paginationModel={{ page: 0, pageSize: 5 }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCinema ? 'Chỉnh sửa rạp chiếu phim' : 'Thêm rạp chiếu phim mới'}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Tên rạp"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="hotline"
                  label="Số điện thoại"
                  value={formik.values.hotline}
                  onChange={formik.handleChange}
                  error={formik.touched.hotline && Boolean(formik.errors.hotline)}
                  helperText={formik.touched.hotline && formik.errors.hotline}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Địa chỉ"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="description"
                  label="Mô tả"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      formik.setFieldValue('logoUrl', file);
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {selectedCinema ? 'Cập nhật' : 'Thêm mới'}
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

export default CinemaManagement; 