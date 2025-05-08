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
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Chip,
  Tooltip
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MovieFilter as MovieIcon,
  EventSeat as SeatIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

// Define the Room type
interface Room {
  id: string;
  name: string;
  theaterId: string;
  theaterName: string;
  capacity: number;
  seatRows: number;
  seatColumns: number;
  roomType: string;
  status: string;
}

// Initial form values
const initialFormValues = {
  id: '',
  name: '',
  theaterId: '',
  capacity: 0,
  seatRows: 0,
  seatColumns: 0,
  roomType: '',
  status: 'ACTIVE'
};

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: 'R001',
    name: 'Phòng 1',
    theaterId: 'T001',
    theaterName: 'CGV Vincom Center Bà Triệu',
    capacity: 120,
    seatRows: 10,
    seatColumns: 12,
    roomType: '2D',
    status: 'ACTIVE'
  },
  {
    id: 'R002',
    name: 'Phòng 2 IMAX',
    theaterId: 'T001',
    theaterName: 'CGV Vincom Center Bà Triệu',
    capacity: 180,
    seatRows: 12,
    seatColumns: 15,
    roomType: 'IMAX',
    status: 'ACTIVE'
  },
  {
    id: 'R003',
    name: 'Phòng 3 3D',
    theaterId: 'T001',
    theaterName: 'CGV Vincom Center Bà Triệu',
    capacity: 150,
    seatRows: 10,
    seatColumns: 15,
    roomType: '3D',
    status: 'ACTIVE'
  },
  {
    id: 'R004',
    name: 'Phòng 1',
    theaterId: 'T002',
    theaterName: 'CGV Aeon Mall Hà Đông',
    capacity: 100,
    seatRows: 10,
    seatColumns: 10,
    roomType: '2D',
    status: 'ACTIVE'
  },
  {
    id: 'R005',
    name: 'Phòng 2',
    theaterId: 'T002',
    theaterName: 'CGV Aeon Mall Hà Đông',
    capacity: 120,
    seatRows: 10,
    seatColumns: 12,
    roomType: '2D',
    status: 'MAINTENANCE'
  },
  {
    id: 'R006',
    name: 'Phòng VIP',
    theaterId: 'T003',
    theaterName: 'Lotte Cinema Landmark 72',
    capacity: 80,
    seatRows: 8,
    seatColumns: 10,
    roomType: 'VIP',
    status: 'ACTIVE'
  },
  {
    id: 'R007',
    name: 'Phòng IMAX',
    theaterId: 'T003',
    theaterName: 'Lotte Cinema Landmark 72',
    capacity: 200,
    seatRows: 10,
    seatColumns: 20,
    roomType: 'IMAX',
    status: 'ACTIVE'
  },
  {
    id: 'R008',
    name: 'Phòng 1',
    theaterId: 'T004',
    theaterName: 'BHD Star Phạm Ngọc Thạch',
    capacity: 110,
    seatRows: 10,
    seatColumns: 11,
    roomType: '2D',
    status: 'ACTIVE'
  }
];

// Mock data for theaters
const mockTheaters = [
  { id: 'T001', name: 'CGV Vincom Center Bà Triệu' },
  { id: 'T002', name: 'CGV Aeon Mall Hà Đông' },
  { id: 'T003', name: 'Lotte Cinema Landmark 72' },
  { id: 'T004', name: 'BHD Star Phạm Ngọc Thạch' },
  { id: 'T005', name: 'Beta Cinemas Mỹ Đình' }
];

// Room types
const roomTypes = ['2D', '3D', '4D', 'IMAX', 'VIP', 'PREMIUM'];

// Status options
const statusOptions = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'INACTIVE', label: 'Không hoạt động' }
];

const RoomManagement: React.FC = () => {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Tên phòng là bắt buộc'),
    theaterId: Yup.string().required('Vui lòng chọn rạp'),
    capacity: Yup.number().required('Số lượng ghế là bắt buộc').positive('Số lượng ghế phải là số dương'),
    seatRows: Yup.number().required('Số hàng là bắt buộc').positive('Số hàng phải là số dương'),
    seatColumns: Yup.number().required('Số cột là bắt buộc').positive('Số cột phải là số dương'),
    roomType: Yup.string().required('Loại phòng là bắt buộc'),
    status: Yup.string().required('Trạng thái là bắt buộc')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (dialogType === 'add') {
        // Add new room
        const newRoom: Room = {
          ...values,
          id: `R${(rooms.length + 1).toString().padStart(3, '0')}`,
          theaterName: mockTheaters.find(theater => theater.id === values.theaterId)?.name || ''
        };
        setRooms([...rooms, newRoom]);
      } else {
        // Edit existing room
        const updatedRooms = rooms.map(room => 
          room.id === values.id 
            ? { 
                ...values, 
                theaterName: mockTheaters.find(theater => theater.id === values.theaterId)?.name || '' 
              } 
            : room
        );
        setRooms(updatedRooms);
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
    const roomToEdit = rooms.find(room => room.id === id);
    if (roomToEdit) {
      formik.setValues(roomToEdit);
    }
    setOpenDialog(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (id: string) => {
    setSelectedRoomId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = () => {
    if (selectedRoomId) {
      setRooms(rooms.filter(room => room.id !== selectedRoomId));
    }
    setDeleteConfirmOpen(false);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Tên phòng', width: 180 },
    { field: 'theaterName', headerName: 'Rạp chiếu phim', width: 250 },
    { 
      field: 'capacity', 
      headerName: 'Sức chứa', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SeatIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          {params.value}
        </Box>
      )
    },
    { 
      field: 'dimensions', 
      headerName: 'Kích thước', 
      width: 140,
      valueGetter: (params) => `${params.row.seatRows} × ${params.row.seatColumns}`
    },
    { 
      field: 'roomType', 
      headerName: 'Loại phòng', 
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'IMAX' ? 'primary' : 
            params.value === 'VIP' ? 'secondary' : 
            params.value === '3D' ? 'success' : 
            params.value === '4D' ? 'warning' : 
            'default'
          }
          size="small"
          icon={<MovieIcon sx={{ fontSize: '16px !important' }} />}
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string;
        let color: 'success' | 'warning' | 'error' | 'default' = 'default';
        let label = status;
        
        if (status === 'ACTIVE') {
          color = 'success';
          label = 'Hoạt động';
        } else if (status === 'MAINTENANCE') {
          color = 'warning';
          label = 'Bảo trì';
        } else if (status === 'INACTIVE') {
          color = 'error';
          label = 'Không hoạt động';
        }
        
        return <Chip label={label} color={color} size="small" />;
      }
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
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
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4">
          Quản lý phòng chiếu
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Thêm phòng mới
        </Button>
      </Box>

      <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
        <DataGrid
          rows={rooms}
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

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {dialogType === 'add' ? 'Thêm phòng chiếu mới' : 'Chỉnh sửa phòng chiếu'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên phòng"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rạp chiếu phim</InputLabel>
                  <Select
                    name="theaterId"
                    value={formik.values.theaterId}
                    onChange={formik.handleChange}
                    error={formik.touched.theaterId && Boolean(formik.errors.theaterId)}
                    label="Rạp chiếu phim"
                  >
                    {mockTheaters.map(theater => (
                      <MenuItem key={theater.id} value={theater.id}>
                        {theater.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.theaterId && formik.errors.theaterId && (
                    <Typography variant="caption" color="error">
                      {formik.errors.theaterId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Số hàng"
                  name="seatRows"
                  type="number"
                  value={formik.values.seatRows}
                  onChange={formik.handleChange}
                  error={formik.touched.seatRows && Boolean(formik.errors.seatRows)}
                  helperText={formik.touched.seatRows && formik.errors.seatRows}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Số cột"
                  name="seatColumns"
                  type="number"
                  value={formik.values.seatColumns}
                  onChange={formik.handleChange}
                  error={formik.touched.seatColumns && Boolean(formik.errors.seatColumns)}
                  helperText={formik.touched.seatColumns && formik.errors.seatColumns}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sức chứa (ghế)"
                  name="capacity"
                  type="number"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                  helperText={formik.touched.capacity && formik.errors.capacity}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại phòng</InputLabel>
                  <Select
                    name="roomType"
                    value={formik.values.roomType}
                    onChange={formik.handleChange}
                    error={formik.touched.roomType && Boolean(formik.errors.roomType)}
                    label="Loại phòng"
                  >
                    {roomTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.roomType && formik.errors.roomType && (
                    <Typography variant="caption" color="error">
                      {formik.errors.roomType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    label="Trạng thái"
                  >
                    {statusOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.status && formik.errors.status && (
                    <Typography variant="caption" color="error">
                      {formik.errors.status}
                    </Typography>
                  )}
                </FormControl>
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
            Bạn có chắc chắn muốn xóa phòng chiếu này? Hành động này không thể hoàn tác.
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
  );
};

export default RoomManagement; 