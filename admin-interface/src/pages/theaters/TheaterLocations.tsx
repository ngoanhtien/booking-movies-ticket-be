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
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Link,
  Stack,
  InputAdornment,
  MenuItem
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Map as MapIcon,
  OpenInNew as OpenInNewIcon,
  Search as SearchIcon,
  ViewList as ListIcon,
  GridView as GridViewIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// Define the TheaterLocation type
interface TheaterLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email: string;
  openingHours: string;
  parkingAvailable: boolean;
  imageUrl: string;
  mapUrl: string;
  description: string;
}

// Initial form values
const initialFormValues = {
  id: '',
  name: '',
  address: '',
  district: '',
  city: '',
  latitude: 0,
  longitude: 0,
  phoneNumber: '',
  email: '',
  openingHours: '',
  parkingAvailable: true,
  imageUrl: '',
  mapUrl: '',
  description: ''
};

// Mock data for theater locations
const mockTheaterLocations: TheaterLocation[] = [
  {
    id: 'L001',
    name: 'CGV Vincom Center Bà Triệu',
    address: 'Tầng 6, Vincom Center, 191 Bà Triệu, Phường Lê Đại Hành',
    district: 'Hai Bà Trưng',
    city: 'Hà Nội',
    latitude: 21.0118,
    longitude: 105.8489,
    phoneNumber: '024 3974 3333',
    email: 'cgvbatrieu@cgv.vn',
    openingHours: '9:00 - 22:30',
    parkingAvailable: true,
    imageUrl: 'https://www.cgv.vn/media/site/cache/3/980x415/top_images/2023/02/cgvbtrieu_1.png',
    mapUrl: 'https://maps.google.com/maps?q=21.0118,105.8489',
    description: 'Rạp CGV tại Vincom Center Bà Triệu là một trong những rạp chiếu phim hiện đại và sang trọng tại Hà Nội, với nhiều phòng chiếu chất lượng cao và không gian thoải mái.'
  },
  {
    id: 'L002',
    name: 'CGV Aeon Mall Hà Đông',
    address: 'Tầng 3, AEON Mall Hà Đông, Phường Dương Nội',
    district: 'Hà Đông',
    city: 'Hà Nội',
    latitude: 20.9867,
    longitude: 105.7525,
    phoneNumber: '024 3826 4455',
    email: 'cgvhadong@cgv.vn',
    openingHours: '10:00 - 22:00',
    parkingAvailable: true,
    imageUrl: 'https://www.cgv.vn/media/site/cache/3/980x415/top_images/2022/12/cgvaeonhadong.png',
    mapUrl: 'https://maps.google.com/maps?q=20.9867,105.7525',
    description: 'Rạp CGV tại AEON Mall Hà Đông là một trong những rạp chiếu phim lớn nhất khu vực phía Tây Hà Nội, với không gian rộng rãi và nhiều tiện ích mua sắm xung quanh.'
  },
  {
    id: 'L003',
    name: 'Lotte Cinema Landmark 72',
    address: 'Tầng 5, Keangnam Hanoi Landmark Tower, Phạm Hùng',
    district: 'Nam Từ Liêm',
    city: 'Hà Nội',
    latitude: 21.0167,
    longitude: 105.7833,
    phoneNumber: '024 3771 4567',
    email: 'info@lottecinemalm72.vn',
    openingHours: '9:00 - 23:00',
    parkingAvailable: true,
    imageUrl: 'https://lotte.vn/Content/images/thumbnail/Keangnam2.jpg',
    mapUrl: 'https://maps.google.com/maps?q=21.0167,105.7833',
    description: 'Lotte Cinema tại Landmark 72 là rạp chiếu phim cao nhất Hà Nội, nằm trong tòa nhà cao nhất Việt Nam, với công nghệ chiếu phim hiện đại và phòng chiếu VIP.'
  },
  {
    id: 'L004',
    name: 'BHD Star Phạm Ngọc Thạch',
    address: 'Tầng 8, Vincom Center, 2 Phạm Ngọc Thạch',
    district: 'Đống Đa',
    city: 'Hà Nội',
    latitude: 21.0060,
    longitude: 105.8338,
    phoneNumber: '024 3512 1212',
    email: 'cskh@bhdstar.vn',
    openingHours: '8:00 - 23:00',
    parkingAvailable: true,
    imageUrl: 'https://www.bhdstar.vn/wp-content/uploads/2018/07/BHD-Star-Pham-Ngoc-Thach-4.jpg',
    mapUrl: 'https://maps.google.com/maps?q=21.0060,105.8338',
    description: 'BHD Star Phạm Ngọc Thạch là rạp chiếu phim sang trọng với thiết kế độc đáo và hiện đại, nằm ở khu vực trung tâm của Hà Nội.'
  },
  {
    id: 'L005',
    name: 'Beta Cinemas Mỹ Đình',
    address: 'Tầng hầm B1, Tòa nhà Golden Palace, 99 Mễ Trì',
    district: 'Nam Từ Liêm',
    city: 'Hà Nội',
    latitude: 21.0100,
    longitude: 105.7733,
    phoneNumber: '024 3200 1881',
    email: 'info@betacinemas.vn',
    openingHours: '9:30 - 22:00',
    parkingAvailable: true,
    imageUrl: 'https://betacinemas.vn/Assets/Images/rap/betagoldenpalace.jpg',
    mapUrl: 'https://maps.google.com/maps?q=21.0100,105.7733',
    description: 'Beta Cinemas Mỹ Đình là rạp chiếu phim với giá vé hợp lý và chất lượng phục vụ tốt, phù hợp cho mọi đối tượng khán giả.'
  },
  {
    id: 'L006',
    name: 'CGV Tràng Tiền Plaza',
    address: 'Tầng 5, TTTM Tràng Tiền Plaza, 24 Hai Bà Trưng',
    district: 'Hoàn Kiếm',
    city: 'Hà Nội',
    latitude: 21.0250,
    longitude: 105.8530,
    phoneNumber: '024 3974 3388',
    email: 'cgvtrangtien@cgv.vn',
    openingHours: '9:00 - 22:30',
    parkingAvailable: true,
    imageUrl: 'https://www.cgv.vn/media/site/cache/3/980x415/top_images/2022/12/cgvtrangtien.jpg',
    mapUrl: 'https://maps.google.com/maps?q=21.0250,105.8530',
    description: 'CGV Tràng Tiền Plaza là rạp chiếu phim cao cấp nằm trong trung tâm thương mại sang trọng bậc nhất Hà Nội, với vị trí đắc địa tại khu vực Hồ Gươm.'
  },
  {
    id: 'L007',
    name: 'CGV Hồ Gươm Plaza',
    address: 'Tầng 3, TTTM Hồ Gươm Plaza, 110 Trần Phú',
    district: 'Hà Đông',
    city: 'Hà Nội',
    latitude: 20.9800,
    longitude: 105.7870,
    phoneNumber: '024 3351 1313',
    email: 'cgvhoguom@cgv.vn',
    openingHours: '9:00 - 22:00',
    parkingAvailable: true,
    imageUrl: 'https://www.cgv.vn/media/site/cache/3/980x415/top_images/2022/12/cgvhoguomplaza.jpg',
    mapUrl: 'https://maps.google.com/maps?q=20.9800,105.7870',
    description: 'CGV Hồ Gươm Plaza là rạp chiếu phim hiện đại tại khu vực phía Tây Hà Nội, nằm trong trung tâm thương mại sầm uất với nhiều tiện ích.'
  },
  {
    id: 'L008',
    name: 'Lotte Cinema Thăng Long',
    address: 'Tầng 6, TTTM Big C Thăng Long, 222 Trần Duy Hưng',
    district: 'Cầu Giấy',
    city: 'Hà Nội',
    latitude: 21.0070,
    longitude: 105.8000,
    phoneNumber: '024 3887 8787',
    email: 'info@lottecimematl.vn',
    openingHours: '8:30 - 22:30',
    parkingAvailable: true,
    imageUrl: 'https://lotte.vn/Content/images/thumbnail/Thanglong.jpg',
    mapUrl: 'https://maps.google.com/maps?q=21.0070,105.8000',
    description: 'Lotte Cinema Thăng Long là rạp chiếu phim thuận tiện nằm trong trung tâm thương mại Big C, với đầy đủ tiện ích mua sắm và ăn uống xung quanh.'
  }
];

// Cities
const cities = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang'];

// Districts in Hanoi
const districts = [
  'Hoàn Kiếm', 'Ba Đình', 'Đống Đa', 'Hai Bà Trưng', 'Thanh Xuân', 'Cầu Giấy', 
  'Hoàng Mai', 'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Tây Hồ', 'Hà Đông'
];

const TheaterLocations: React.FC = () => {
  const { t } = useTranslation();
  const [locations, setLocations] = useState<TheaterLocation[]>(mockTheaterLocations);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<TheaterLocation | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    location => location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Tên rạp là bắt buộc'),
    address: Yup.string().required('Địa chỉ là bắt buộc'),
    district: Yup.string().required('Quận/Huyện là bắt buộc'),
    city: Yup.string().required('Thành phố là bắt buộc'),
    latitude: Yup.number().required('Vĩ độ là bắt buộc'),
    longitude: Yup.number().required('Kinh độ là bắt buộc'),
    phoneNumber: Yup.string().required('Số điện thoại là bắt buộc'),
    email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
    openingHours: Yup.string().required('Giờ mở cửa là bắt buộc'),
    imageUrl: Yup.string().required('Hình ảnh là bắt buộc'),
    mapUrl: Yup.string().required('URL bản đồ là bắt buộc'),
    description: Yup.string().required('Mô tả là bắt buộc')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (dialogType === 'add') {
        // Add new location
        const newLocation: TheaterLocation = {
          ...values,
          id: `L${(locations.length + 1).toString().padStart(3, '0')}`
        };
        setLocations([...locations, newLocation]);
      } else {
        // Edit existing location
        const updatedLocations = locations.map(location => 
          location.id === values.id 
            ? values 
            : location
        );
        setLocations(updatedLocations);
      }
      handleCloseDialog();
    }
  });

  // Handle opening the add dialog
  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    setOpenDialog(true);
  };

  // Handle opening the edit dialog
  const handleEditClick = (id: string) => {
    setDialogType('edit');
    const locationToEdit = locations.find(location => location.id === id);
    if (locationToEdit) {
      formik.setValues(locationToEdit);
    }
    setOpenDialog(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (id: string) => {
    setSelectedLocationId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = () => {
    if (selectedLocationId) {
      setLocations(locations.filter(location => location.id !== selectedLocationId));
    }
    setDeleteConfirmOpen(false);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  // Handle opening the map dialog
  const handleMapClick = (location: TheaterLocation) => {
    setSelectedLocation(location);
    setMapDialogOpen(true);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { 
      field: 'name', 
      headerName: 'Tên rạp', 
      width: 250,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'address', 
      headerName: 'Địa chỉ', 
      width: 300
    },
    { 
      field: 'district', 
      headerName: 'Quận/Huyện', 
      width: 120
    },
    { 
      field: 'city', 
      headerName: 'Thành phố', 
      width: 120
    },
    { 
      field: 'parkingAvailable', 
      headerName: 'Bãi đỗ xe', 
      width: 110,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          icon={<CarIcon fontSize="small" />}
          label={params.value ? 'Có' : 'Không'} 
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'openingHours', 
      headerName: 'Giờ mở cửa', 
      width: 120
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Xem bản đồ">
            <IconButton 
              color="info" 
              onClick={() => handleMapClick(params.row as TheaterLocation)}
              size="small"
            >
              <MapIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton 
              color="primary" 
              onClick={() => handleEditClick(params.row.id)}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton 
              color="error" 
              onClick={() => handleDeleteClick(params.row.id)}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mở trong Google Maps">
            <IconButton 
              color="success" 
              onClick={() => window.open(params.row.mapUrl, '_blank')}
              size="small"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">
          Vị trí cụm rạp
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Thêm vị trí mới
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Tìm kiếm theo tên, địa chỉ, thành phố..."
          variant="outlined"
          size="small"
          sx={{ width: 400 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Box>
          <Tooltip title="Xem dạng lưới">
            <IconButton 
              color={viewMode === 'grid' ? 'primary' : 'default'} 
              onClick={() => setViewMode('grid')}
            >
              <GridViewIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xem dạng danh sách">
            <IconButton 
              color={viewMode === 'list' ? 'primary' : 'default'} 
              onClick={() => setViewMode('list')}
            >
              <ListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {viewMode === 'list' ? (
        <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <DataGrid
            rows={filteredLocations}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 20]}
            density="standard"
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredLocations.map((location) => (
            <Grid item xs={12} sm={6} md={4} key={location.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                } 
              }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={location.imageUrl}
                  alt={location.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {location.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <LocationIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                    {location.address}, {location.district}, {location.city}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ verticalAlign: 'text-bottom', mr: 0.5 }} />
                    {location.phoneNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Giờ mở cửa:</Box> {location.openingHours}
                  </Typography>
                  {location.parkingAvailable && (
                    <Chip 
                      icon={<CarIcon fontSize="small" />}
                      label="Có bãi đỗ xe" 
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<MapIcon />}
                    onClick={() => handleMapClick(location)}
                  >
                    Xem bản đồ
                  </Button>
                  <Button 
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(location.id)}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(location.id)}
                  >
                    Xóa
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {dialogType === 'add' ? 'Thêm vị trí rạp mới' : 'Chỉnh sửa vị trí rạp'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên rạp"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL hình ảnh"
                  name="imageUrl"
                  value={formik.values.imageUrl}
                  onChange={formik.handleChange}
                  error={formik.touched.imageUrl && Boolean(formik.errors.imageUrl)}
                  helperText={formik.touched.imageUrl && formik.errors.imageUrl}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Quận/Huyện"
                  name="district"
                  select
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  error={formik.touched.district && Boolean(formik.errors.district)}
                  helperText={formik.touched.district && formik.errors.district}
                >
                  {districts.map((district) => (
                    <MenuItem key={district} value={district}>
                      {district}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Thành phố"
                  name="city"
                  select
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vĩ độ"
                  name="latitude"
                  type="number"
                  value={formik.values.latitude}
                  onChange={formik.handleChange}
                  error={formik.touched.latitude && Boolean(formik.errors.latitude)}
                  helperText={formik.touched.latitude && formik.errors.latitude}
                  InputProps={{
                    inputProps: { step: 0.0001 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Kinh độ"
                  name="longitude"
                  type="number"
                  value={formik.values.longitude}
                  onChange={formik.handleChange}
                  error={formik.touched.longitude && Boolean(formik.errors.longitude)}
                  helperText={formik.touched.longitude && formik.errors.longitude}
                  InputProps={{
                    inputProps: { step: 0.0001 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                  helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Giờ mở cửa"
                  name="openingHours"
                  value={formik.values.openingHours}
                  onChange={formik.handleChange}
                  error={formik.touched.openingHours && Boolean(formik.errors.openingHours)}
                  helperText={formik.touched.openingHours && formik.errors.openingHours}
                  placeholder="Ví dụ: 9:00 - 22:30"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL bản đồ"
                  name="mapUrl"
                  value={formik.values.mapUrl}
                  onChange={formik.handleChange}
                  error={formik.touched.mapUrl && Boolean(formik.errors.mapUrl)}
                  helperText={formik.touched.mapUrl && formik.errors.mapUrl}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả"
                  name="description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    formik.setFieldValue(
                      'mapUrl', 
                      `https://maps.google.com/maps?q=${formik.values.latitude},${formik.values.longitude}`
                    );
                  }}
                  sx={{ mr: 1 }}
                >
                  Tạo URL bản đồ từ tọa độ
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => window.open('https://www.google.com/maps', '_blank')}
                >
                  Mở Google Maps để tìm tọa độ
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button type="submit" variant="contained">
              {dialogType === 'add' ? 'Thêm' : 'Lưu'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa vị trí rạp này? Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Dialog */}
      <Dialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedLocation && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedLocation.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {selectedLocation.address}, {selectedLocation.district}, {selectedLocation.city}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ height: 450, width: '100%', position: 'relative' }}>
                <iframe
                  src={`https://maps.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Số điện thoại:</Box> {selectedLocation.phoneNumber}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Email:</Box> {selectedLocation.email}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Giờ mở cửa:</Box> {selectedLocation.openingHours}
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>Bãi đỗ xe:</Box> {selectedLocation.parkingAvailable ? 'Có' : 'Không'}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 'bold' }}>Mô tả:</Box>
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedLocation.description}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => window.open(selectedLocation.mapUrl, '_blank')}
                startIcon={<OpenInNewIcon />}
              >
                Mở trong Google Maps
              </Button>
              <Button onClick={() => setMapDialogOpen(false)}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default TheaterLocations; 