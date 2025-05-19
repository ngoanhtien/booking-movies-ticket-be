import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Tab,
  Tabs,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormGroup
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  MovieFilter as MovieIcon,
  EventSeat as SeatIcon,
  Chair as ChairIcon,
  Tv as ScreenIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
  seatType: SeatType; // Required, not optional
}

// Define the SeatType enum
enum SeatType {
  Standard = 'STANDARD',
  VIP = 'VIP',
  Couple = 'COUPLE',
  Disabled = 'DISABLED',
}

// Define the Seat type
interface Seat {
  row: number;
  column: number;
  type: SeatType;
  isActivated: boolean;
}

// Define the form values type separately from Room
interface RoomFormValues {
  id: string;
  name: string;
  theaterId: string;
  capacity: number;
  seatRows: number;
  seatColumns: number;
  roomType: string;
  status: string;
  seatType: SeatType;
}

// Initial form values
const initialFormValues: RoomFormValues = {
  id: '',
  name: '',
  theaterId: '',
  capacity: 0,
  seatRows: 10,
  seatColumns: 12,
  roomType: '',
  status: 'ACTIVE',
  seatType: SeatType.Standard // Default seat type for new seats
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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
    status: 'MAINTENANCE',
    seatType: SeatType.Standard
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
    status: 'ACTIVE',
    seatType: SeatType.VIP
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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
    status: 'ACTIVE',
    seatType: SeatType.Standard
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

// Seat type options
const seatTypeOptions = [
  { value: SeatType.Standard, label: 'Standard', color: '#2196f3' },
  { value: SeatType.VIP, label: 'VIP', color: '#9c27b0' },
  { value: SeatType.Couple, label: 'Couple', color: '#e91e63' },
  { value: SeatType.Disabled, label: 'Disabled', color: '#9e9e9e' }
];

// Tab Panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`room-tabpanel-${index}`}
      aria-labelledby={`room-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `room-tab-${index}`,
    'aria-controls': `room-tabpanel-${index}`,
  };
}

// Helper function to generate default seat layout
const generateDefaultSeatLayout = (rows: number, columns: number): Seat[][] => {
  const layout: Seat[][] = [];
  for (let i = 0; i < rows; i++) {
    const rowSeats: Seat[] = [];
    for (let j = 0; j < columns; j++) {
      rowSeats.push({
        row: i,
        column: j,
        type: SeatType.Standard,
        isActivated: true
      });
    }
    layout.push(rowSeats);
  }
  return layout;
};

const RoomManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [seatLayout, setSeatLayout] = useState<Seat[][]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>(SeatType.Standard);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Tên phòng là bắt buộc'),
    theaterId: Yup.string().required('Vui lòng chọn rạp'),
    capacity: Yup.number().required('Số lượng ghế là bắt buộc').positive('Số lượng ghế phải là số dương'),
    seatRows: Yup.number().required('Số hàng là bắt buộc').positive('Số hàng phải là số dương').max(26, 'Số hàng tối đa là 26'),
    seatColumns: Yup.number().required('Số cột là bắt buộc').positive('Số cột phải là số dương').max(50, 'Số cột tối đa là 50'),
    roomType: Yup.string().required('Loại phòng là bắt buộc'),
    status: Yup.string().required('Trạng thái là bắt buộc')
  });

  // Formik setup
  const formik = useFormik<RoomFormValues>({
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

  // Update seat layout when rows or columns change
  useEffect(() => {
    if (openDialog) {
      setSeatLayout(generateDefaultSeatLayout(
        formik.values.seatRows || 10, 
        formik.values.seatColumns || 12
      ));
    }
  }, [formik.values.seatRows, formik.values.seatColumns, openDialog]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle opening the add dialog
  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    setTabValue(0);
    setOpenDialog(true);
  };

  // Handle opening the edit dialog
  const handleEditClick = (id: string) => {
    setDialogType('edit');
    const roomToEdit = rooms.find(room => room.id === id);
    if (roomToEdit) {
      formik.setValues(roomToEdit);
    }
    setTabValue(0);
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
    setTabValue(0);
  };
  
  // Handle seat type change
  const handleSeatTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSeatType(event.target.value as SeatType);
  };

  // Handle seat click in the layout
  const handleSeatClick = (rowIndex: number, colIndex: number) => {
    const newLayout = [...seatLayout];
    newLayout[rowIndex][colIndex].type = selectedSeatType;
    setSeatLayout(newLayout);
  };

  // Handle opening the schedule calendar
  const handleOpenSchedule = (id: string) => {
    navigate(`/admin/rooms/schedules/${id}`);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Tên phòng', flex: 1, minWidth: 180 },
    { field: 'theaterName', headerName: 'Rạp chiếu phim', flex: 1.5, minWidth: 250 },
    { 
      field: 'capacity', 
      headerName: 'Sức chứa', 
      width: 130,
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
      width: 120,
      valueGetter: (params) => `${params.row.seatRows} × ${params.row.seatColumns}`
    },
    { 
      field: 'roomType', 
      headerName: 'Loại phòng', 
      flex: 0.8,
      minWidth: 140,
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
      flex: 0.8,
      minWidth: 150,
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
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Lịch chiếu phim">
            <IconButton 
              color="info" 
              onClick={() => handleOpenSchedule(params.row.id)}
              size="small"
            >
              <CalendarIcon fontSize="small" />
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
        </Box>
      ),
    },
  ];

  // Render seat layout grid
  const renderSeatLayoutGrid = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Paper 
            sx={{ 
              padding: '10px 40px', 
              backgroundColor: '#f5f5f5', 
              textAlign: 'center',
              width: '80%',
              mb: 2
            }}
          >
            <Typography variant="body2" color="textSecondary">SCREEN</Typography>
          </Paper>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {seatLayout.map((row, rowIndex) => (
            <Box 
              key={`row-${rowIndex}`} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mb: 0.5 
              }}
            >
              <Typography sx={{ width: '20px', textAlign: 'center', mr: 1, fontSize: '0.8rem' }}>
                {String.fromCharCode(65 + rowIndex)}
              </Typography>
              
              {row.map((seat, colIndex) => {
                // Determine the seat color based on type
                const seatColor = seatTypeOptions.find(option => option.value === seat.type)?.color || '#2196f3';
                
                return (
                  <Box 
                    key={`seat-${rowIndex}-${colIndex}`}
                    onClick={() => handleSeatClick(rowIndex, colIndex)}
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: '4px',
                      backgroundColor: seat.isActivated ? seatColor : 'transparent',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '2px',
                      cursor: 'pointer',
                      border: seat.isActivated ? 'none' : '1px dashed #ccc',
                      '&:hover': {
                        opacity: 0.8,
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '10px' }}>
                      {colIndex + 1}
                    </Typography>
                  </Box>
                );
              })}
              
              <Typography sx={{ width: '20px', textAlign: 'center', ml: 1, fontSize: '0.8rem' }}>
                {String.fromCharCode(65 + rowIndex)}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Grid container spacing={2} justifyContent="center" sx={{ maxWidth: 500 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <Grid item key={num}>
                <Typography variant="caption">{num}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  };

  // Render seat type selection
  const renderSeatTypeSelection = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Seat Type</FormLabel>
          <RadioGroup row value={selectedSeatType} onChange={handleSeatTypeChange}>
            {seatTypeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={
                  <Radio 
                    sx={{
                      color: option.color,
                      '&.Mui-checked': {
                        color: option.color,
                      }
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', pb: 2, borderBottom: '1px solid #eee' }}>
        <Typography variant="h4" component="h1">
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

      <Paper sx={{ height: 'calc(100vh - 240px)', width: '100%', p: 2 }}>
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
            border: 'none',
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0'
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 'bold'
            }
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
        <DialogTitle>
          {dialogType === 'add' ? 'Thêm phòng chiếu mới' : 'Chỉnh sửa phòng chiếu'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="room tabs">
              <Tab label="Room Properties" {...a11yProps(0)} />
              <Tab label="Seat Layout" {...a11yProps(1)} />
            </Tabs>
          </Box>
          
          <form onSubmit={formik.handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
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
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderSeatTypeSelection()}
              {renderSeatLayoutGrid()}
            </TabPanel>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={() => formik.handleSubmit()} variant="contained" disabled={tabValue !== 0 && dialogType === 'add'}>
            {dialogType === 'add' ? 'Thêm' : 'Lưu'}
          </Button>
        </DialogActions>
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