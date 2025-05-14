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
import { Branch, BranchFormData } from '../../types/branch';
import { Cinema } from '../../types/cinema';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  name: Yup.string().required('Tên chi nhánh là bắt buộc'),
  address: Yup.string().required('Địa chỉ là bắt buộc'),
  hotline: Yup.string().required('Số điện thoại là bắt buộc'),
  cinemaId: Yup.number().required('Rạp chiếu phim là bắt buộc'),
});

const BranchManagement: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const formik = useFormik<BranchFormData>({
    initialValues: {
      name: '',
      address: '',
      hotline: '',
      cinemaId: 0,
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
        if (selectedBranch) {
          await axios.put('/api/branches', formData);
          setSnackbar({ open: true, message: 'Cập nhật chi nhánh thành công', severity: 'success' });
        } else {
          await axios.post('/api/branches', formData);
          setSnackbar({ open: true, message: 'Thêm chi nhánh thành công', severity: 'success' });
        }
        handleCloseDialog();
        fetchBranches();
      } catch (error) {
        setSnackbar({ open: true, message: 'Có lỗi xảy ra', severity: 'error' });
      }
    },
  });

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/branches');
      setBranches(response.data.data.content);
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể tải danh sách chi nhánh', severity: 'error' });
    }
  };

  const fetchCinemas = async () => {
    try {
      const response = await axios.get('/api/cinema');
      setCinemas(response.data.data.content);
    } catch (error) {
      setSnackbar({ open: true, message: 'Không thể tải danh sách rạp chiếu phim', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCinemas();
  }, []);

  const handleAdd = () => {
    setSelectedBranch(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    formik.setValues({
      id: branch.id,
      name: branch.name,
      address: branch.address,
      hotline: branch.hotline,
      cinemaId: branch.cinemaId,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
      try {
        await axios.delete(`/api/branches/${id}`);
        setSnackbar({ open: true, message: 'Xóa chi nhánh thành công', severity: 'success' });
        fetchBranches();
      } catch (error) {
        setSnackbar({ open: true, message: 'Không thể xóa chi nhánh', severity: 'error' });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBranch(null);
    formik.resetForm();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Tên chi nhánh', flex: 1 },
    { field: 'address', headerName: 'Địa chỉ', flex: 1 },
    { field: 'hotline', headerName: 'Số điện thoại', width: 150 },
    { field: 'cinemaId', headerName: 'Rạp chiếu phim', width: 180, valueGetter: (params) => {
      const cinema = cinemas.find(c => c.id === params.row.cinemaId);
      return cinema ? cinema.name : '';
    } },
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
        Quản lý chi nhánh
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Thêm chi nhánh
          </Button>
        </Grid>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={branches}
            columns={columns}
            paginationModel={{ page: 0, pageSize: 5 }}
            pageSizeOptions={[5, 10]}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
      </Paper>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Tên chi nhánh"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
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
                  name="hotline"
                  label="Số điện thoại"
                  value={formik.values.hotline}
                  onChange={formik.handleChange}
                  error={formik.touched.hotline && Boolean(formik.errors.hotline)}
                  helperText={formik.touched.hotline && formik.errors.hotline}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Rạp chiếu phim</InputLabel>
                  <Select
                    name="cinemaId"
                    value={formik.values.cinemaId}
                    onChange={formik.handleChange}
                    error={formik.touched.cinemaId && Boolean(formik.errors.cinemaId)}
                  >
                    <MenuItem value={0} disabled>Chọn rạp chiếu phim</MenuItem>
                    {cinemas.map((cinema) => (
                      <MenuItem key={cinema.id} value={cinema.id}>{cinema.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      formik.setFieldValue('imageUrl', file);
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {selectedBranch ? 'Cập nhật' : 'Thêm mới'}
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

export default BranchManagement; 