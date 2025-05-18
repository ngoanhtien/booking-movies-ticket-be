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
  FormControl,
  InputLabel,
  Select,
  Chip,
  FormHelperText,
  Stack,
  Avatar,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import ChairIcon from '@mui/icons-material/Chair';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import { Theater, TheaterFormData } from '../../types/theater';
import { Cinema } from '../../types/cinema';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(5, 'Tên cụm rạp phải có ít nhất 5 ký tự')
    .max(200, 'Tên cụm rạp không được vượt quá 200 ký tự')
    .required('Tên cụm rạp là bắt buộc'),
  cinemaId: Yup.number()
    .required('Hãng rạp là bắt buộc'),
  address: Yup.string()
    .min(10, 'Địa chỉ phải có ít nhất 10 ký tự')
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .required('Địa chỉ là bắt buộc'),
  capacity: Yup.number()
    .min(50, 'Sức chứa phải ít nhất 50')
    .max(10000, 'Sức chứa không được vượt quá 10000')
    .required('Sức chứa là bắt buộc'),
  numberOfRooms: Yup.number()
    .min(1, 'Số phòng chiếu phải ít nhất 1')
    .max(50, 'Số phòng chiếu không được vượt quá 50')
    .required('Số phòng chiếu là bắt buộc'),
  status: Yup.string()
    .oneOf(['ACTIVE', 'INACTIVE', 'MAINTENANCE'], 'Trạng thái không hợp lệ')
    .required('Trạng thái là bắt buộc'),
  description: Yup.string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
});

// Mock data for development - replace with API calls in production
const MOCK_THEATERS: Theater[] = [
  {
    id: 1,
    name: 'CGV Vincom Center Bà Triệu',
    cinemaId: 1,
    cinemaName: 'CGV Cinemas',
    address: 'Tầng 6, Vincom Center Bà Triệu, 191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    capacity: 1200,
    numberOfRooms: 8,
    status: 'ACTIVE',
    description: 'Rạp chiếu phim cao cấp với 8 phòng và công nghệ hiện đại',
    createdAt: '2024-01-15',
    updatedAt: '2024-05-01',
  },
  {
    id: 2,
    name: 'CGV Aeon Mall Hà Đông',
    cinemaId: 1,
    cinemaName: 'CGV Cinemas',
    address: 'Tầng 3, AEON Mall Hà Đông, Hà Đông, Hà Nội',
    capacity: 950,
    numberOfRooms: 6,
    status: 'ACTIVE',
    description: 'Cụm rạp với 6 phòng chiếu hiện đại',
    createdAt: '2024-02-10',
    updatedAt: '2024-04-20',
  },
  {
    id: 3,
    name: 'BHD Star Vincom Royal City',
    cinemaId: 2,
    cinemaName: 'BHD Star Cineplex',
    address: 'Tầng B2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    capacity: 1500,
    numberOfRooms: 10,
    status: 'ACTIVE',
    description: 'Cụm rạp cao cấp với 10 phòng chiếu',
    createdAt: '2024-03-01',
    updatedAt: '2024-04-15',
  },
  {
    id: 4,
    name: 'Lotte Cinema Landmark 81',
    cinemaId: 3,
    cinemaName: 'Lotte Cinema',
    address: 'Tầng 5, Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP HCM',
    capacity: 1800,
    numberOfRooms: 12,
    status: 'ACTIVE',
    description: 'Cụm rạp lớn nhất với 12 phòng chiếu và phòng chiếu ULTRA Screen',
    createdAt: '2024-02-05',
    updatedAt: '2024-05-03',
  },
  {
    id: 5,
    name: 'Galaxy Nguyễn Du',
    cinemaId: 4,
    cinemaName: 'Galaxy Cinema',
    address: '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP HCM',
    capacity: 800,
    numberOfRooms: 5,
    status: 'MAINTENANCE',
    description: 'Đang nâng cấp hệ thống âm thanh',
    createdAt: '2023-11-10',
    updatedAt: '2024-05-05',
  },
];

// Mock data for cinemas - replace with API calls in production
const MOCK_CINEMAS: Cinema[] = [
  { id: 1, name: 'CGV Cinemas', hotline: '1900 6017', description: 'Chuỗi rạp chiếu phim lớn nhất', logoUrl: '', address: 'TP HCM', isDeleted: false, createdAt: '', updatedAt: '' },
  { id: 2, name: 'BHD Star Cineplex', hotline: '1900 2099', description: 'Chuỗi rạp chiếu phim cao cấp', logoUrl: '', address: 'TP HCM', isDeleted: false, createdAt: '', updatedAt: '' },
  { id: 3, name: 'Lotte Cinema', hotline: '1900 6995', description: 'Chuỗi rạp chiếu phim hiện đại', logoUrl: '', address: 'TP HCM', isDeleted: false, createdAt: '', updatedAt: '' },
  { id: 4, name: 'Galaxy Cinema', hotline: '1900 8080', description: 'Chuỗi rạp chiếu phim phổ thông', logoUrl: '', address: 'TP HCM', isDeleted: false, createdAt: '', updatedAt: '' },
];

const getStatusChip = (status: string) => {
  let color: 'success' | 'warning' | 'error' = 'success';
  let label = 'Hoạt động';
  
  if (status === 'INACTIVE') {
    color = 'error';
    label = 'Ngừng hoạt động';
  } else if (status === 'MAINTENANCE') {
    color = 'warning';
    label = 'Bảo trì';
  }
  
  return (
    <Chip 
      label={label} 
      color={color} 
      size="small" 
      sx={{ 
        fontWeight: '500',
        borderRadius: '6px', 
        height: 'auto', 
        padding: '4px 8px'
      }} 
    />
  );
};

const TheaterManagement: React.FC = () => {
  const { t } = useTranslation();
  const [theaters, setTheaters] = useState<Theater[]>(MOCK_THEATERS);
  const [cinemas, setCinemas] = useState<Cinema[]>(MOCK_CINEMAS);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const formik = useFormik<TheaterFormData>({
    initialValues: {
      name: '',
      cinemaId: 0,
      address: '',
      capacity: 100,
      numberOfRooms: 5,
      status: 'ACTIVE',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value.toString());
          }
        });

        if (values.imageUrl && values.imageUrl instanceof File) {
          formData.append('imageUrl', values.imageUrl);
        }

        // Simulate API call - replace with actual API calls in production
        if (selectedTheater) {
          // Update existing theater - In production, use axios instead of mocking
          // await axios.put(`/api/theaters/${selectedTheater.id}`, formData);
          
          // Mock update for development
          const updatedTheaters = theaters.map(theater => {
            if (theater.id === selectedTheater.id) {
              // Create a new theater object with the correct type for imageUrl
              const updatedTheater: Theater = {
                ...theater,
                name: values.name,
                cinemaId: values.cinemaId,
                cinemaName: cinemas.find(c => c.id === values.cinemaId)?.name,
                address: values.address,
                capacity: values.capacity,
                numberOfRooms: values.numberOfRooms,
                status: values.status,
                description: values.description,
                // Handle imageUrl - in a real scenario, this would be a URL returned from the server
                imageUrl: values.imageUrl instanceof File 
                  ? URL.createObjectURL(values.imageUrl)  // Create a temporary object URL for display
                  : values.imageUrl as string | undefined,
                updatedAt: new Date().toISOString().split('T')[0]
              };
              return updatedTheater;
            }
            return theater;
          });
          
          setTheaters(updatedTheaters);
          
          setSnackbar({
            open: true,
            message: 'Cập nhật cụm rạp thành công',
            severity: 'success',
          });
        } else {
          // Create new theater - In production, use axios instead of mocking
          // await axios.post('/api/theaters', formData);
          
          // Mock create for development - ensure imageUrl is string or undefined
          const newTheater: Theater = {
            id: Math.max(...theaters.map(t => t.id)) + 1,
            name: values.name,
            cinemaId: values.cinemaId,
            cinemaName: cinemas.find(c => c.id === values.cinemaId)?.name,
            address: values.address,
            capacity: values.capacity,
            numberOfRooms: values.numberOfRooms,
            status: values.status,
            description: values.description,
            // Handle imageUrl - in a real scenario, this would be a URL returned from the server
            imageUrl: values.imageUrl instanceof File 
              ? URL.createObjectURL(values.imageUrl)  // Create a temporary object URL for display
              : values.imageUrl as string | undefined,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
          
          setTheaters([...theaters, newTheater]);
          
          setSnackbar({
            open: true,
            message: 'Thêm cụm rạp thành công',
            severity: 'success',
          });
        }
        handleCloseDialog();
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Có lỗi xảy ra',
          severity: 'error',
        });
      }
    },
  });

  // In production, replace this with actual API call
  const fetchTheaters = async () => {
    try {
      // const response = await axios.get('/api/theaters');
      // setTheaters(response.data);
      
      // Using mock data for development
      setTheaters(MOCK_THEATERS);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách cụm rạp',
        severity: 'error',
      });
    }
  };

  // In production, replace this with actual API call
  const fetchCinemas = async () => {
    try {
      // const response = await axios.get('/api/cinemas');
      // setCinemas(response.data);
      
      // Using mock data for development
      setCinemas(MOCK_CINEMAS);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Không thể tải danh sách hãng rạp',
        severity: 'error',
      });
    }
  };

  useEffect(() => {
    fetchTheaters();
    fetchCinemas();
  }, []);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke any object URLs created for temporary display
      theaters.forEach(theater => {
        if (theater.imageUrl && theater.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(theater.imageUrl);
        }
      });
    };
  }, [theaters]);

  const handleAdd = () => {
    setSelectedTheater(null);
    formik.resetForm();
    setOpenDialog(true);
  };

  const handleEdit = (theater: Theater) => {
    setSelectedTheater(theater);
    formik.setValues({
      id: theater.id,
      name: theater.name,
      cinemaId: theater.cinemaId,
      address: theater.address,
      capacity: theater.capacity,
      numberOfRooms: theater.numberOfRooms,
      status: theater.status,
      description: theater.description || '',
      imageUrl: theater.imageUrl,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cụm rạp này?')) {
      try {
        // In production, use axios for API call
        // await axios.delete(`/api/theaters/${id}`);
        
        // Mock delete for development
        setTheaters(theaters.filter(theater => theater.id !== id));
        
        setSnackbar({
          open: true,
          message: 'Xóa cụm rạp thành công',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Không thể xóa cụm rạp',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTheater(null);
    formik.resetForm();
  };

  const handleImagePreview = (imageUrl: string | undefined) => {
    if (imageUrl) {
      setSelectedImage(imageUrl);
    }
  };

  const columns: GridColDef[] = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 70 
    },
    { 
      field: 'name', 
      headerName: 'Tên cụm rạp', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ color: '#1976d2', mr: 1 }} />
          <Typography variant="body2" fontWeight="500">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: 'cinemaName', 
      headerName: 'Hãng rạp', 
      width: 150
    },
    { 
      field: 'address', 
      headerName: 'Địa chỉ', 
      flex: 1,
      renderCell: (params) => (
        <Tooltip title={params.value} placement="top">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon sx={{ color: '#f44336', mr: 0.5 }} fontSize="small" />
            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
              {params.value}
            </Typography>
          </Box>
        </Tooltip>
      )
    },
    { 
      field: 'capacity', 
      headerName: 'Sức chứa', 
      width: 110,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChairIcon sx={{ color: '#ff9800', mr: 0.5 }} fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'numberOfRooms', 
      headerName: 'Số phòng', 
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalMoviesIcon sx={{ color: '#4caf50', mr: 0.5 }} fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 140,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
            sx={{ 
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.16)' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
            sx={{ 
              bgcolor: 'rgba(211, 47, 47, 0.08)',
              '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.16)' }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary">
          Quản lý cụm rạp
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ 
            borderRadius: 2, 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
            textTransform: 'none', 
            px: 2
          }}
        >
          Thêm cụm rạp mới
        </Button>
      </Box>

      {/* Statistics cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', mr: 2 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng số cụm rạp
              </Typography>
              <Typography variant="h5" fontWeight="600">
                {theaters.length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ bgcolor: '#e8f5e9', color: '#4caf50', mr: 2 }}>
              <LocalMoviesIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng số phòng chiếu
              </Typography>
              <Typography variant="h5" fontWeight="600">
                {theaters.reduce((sum, theater) => sum + theater.numberOfRooms, 0)}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ bgcolor: '#fff3e0', color: '#ff9800', mr: 2 }}>
              <ChairIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Tổng sức chứa
              </Typography>
              <Typography variant="h5" fontWeight="600">
                {theaters.reduce((sum, theater) => sum + theater.capacity, 0).toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ bgcolor: '#ffebee', color: '#f44336', mr: 2 }}>
              <DeleteIcon />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Đang bảo trì
              </Typography>
              <Typography variant="h5" fontWeight="600">
                {theaters.filter(theater => theater.status === 'MAINTENANCE').length}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Data table */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ height: 'auto', width: '100%', p: 2 }}>
          <DataGrid
            rows={theaters}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            autoHeight
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px 0 rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3 }}>
          <Typography variant="h5" fontWeight="600">
            {selectedTheater ? 'Chỉnh sửa cụm rạp' : 'Thêm cụm rạp mới'}
          </Typography>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ px: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Tên cụm rạp"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.cinemaId && Boolean(formik.errors.cinemaId)}
                >
                  <InputLabel id="cinema-select-label">Hãng rạp</InputLabel>
                  <Select
                    labelId="cinema-select-label"
                    name="cinemaId"
                    value={formik.values.cinemaId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Hãng rạp"
                  >
                    <MenuItem value={0} disabled>Chọn hãng rạp</MenuItem>
                    {cinemas.map((cinema) => (
                      <MenuItem key={cinema.id} value={cinema.id}>{cinema.name}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.cinemaId && formik.errors.cinemaId && (
                    <FormHelperText>{formik.errors.cinemaId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Địa chỉ"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  InputProps={{
                    startAdornment: <LocationOnIcon sx={{ mr: 1, color: '#f44336' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="capacity"
                  label="Sức chứa"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                  helperText={formik.touched.capacity && formik.errors.capacity}
                  InputProps={{
                    startAdornment: <ChairIcon sx={{ mr: 1, color: '#ff9800' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="numberOfRooms"
                  label="Số phòng chiếu"
                  value={formik.values.numberOfRooms}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.numberOfRooms && Boolean(formik.errors.numberOfRooms)}
                  helperText={formik.touched.numberOfRooms && formik.errors.numberOfRooms}
                  InputProps={{
                    startAdornment: <LocalMoviesIcon sx={{ mr: 1, color: '#4caf50' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <InputLabel id="status-select-label">Trạng thái</InputLabel>
                  <Select
                    labelId="status-select-label"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Trạng thái"
                  >
                    <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                    <MenuItem value="INACTIVE">Ngừng hoạt động</MenuItem>
                    <MenuItem value="MAINTENANCE">Bảo trì</MenuItem>
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <FormHelperText>{formik.errors.status}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Hình ảnh cụm rạp
                  </Typography>
                  <Box
                    sx={{
                      border: '1px dashed rgba(0, 0, 0, 0.23)',
                      borderRadius: 1,
                      p: 1,
                      display: 'flex',
                      alignItems: 'center',
                      height: '56px',
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      id="theater-image"
                      style={{ display: 'none' }}
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (file) {
                          formik.setFieldValue('imageUrl', file);
                        }
                      }}
                    />
                    <label htmlFor="theater-image">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<ImageIcon />}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Chọn ảnh
                      </Button>
                    </label>
                    {formik.values.imageUrl && (
                      <Typography variant="body2" sx={{ ml: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
                        {formik.values.imageUrl instanceof File
                          ? formik.values.imageUrl.name
                          : 'Ảnh đã chọn'}
                      </Typography>
                    )}
                  </Box>
                </Box>
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
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseDialog} 
              sx={{ borderRadius: 2, textTransform: 'none', minWidth: '100px' }}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ borderRadius: 2, textTransform: 'none', minWidth: '100px' }}
            >
              {selectedTheater ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Image Preview Dialog - for future implementation */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
      >
        <DialogContent sx={{ p: 1 }}>
          {selectedImage && <img src={selectedImage} alt="Theater preview" style={{ width: '100%' }} />}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TheaterManagement; 