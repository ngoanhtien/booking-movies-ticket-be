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
  Tooltip,
  FormHelperText,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  LocalOffer as OfferIcon,
  Discount as DiscountIcon,
  CalendarMonth as CalendarIcon,
  Movie as MovieIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

// Define the Promotion type
interface Promotion {
  id: string;
  name: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  minPurchase: number;
  maxDiscount: number | null;
  maxUses: number;
  usedCount: number;
  targetType: 'ALL' | 'MOVIE' | 'FOOD' | 'COMBO';
  targetId: string | null;
  targetName: string | null;
  isActive: boolean;
  description: string;
}

// Initial form values
const initialFormValues = {
  id: '',
  name: '',
  code: '',
  discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: 0,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  minPurchase: 0,
  maxDiscount: null as number | null,
  maxUses: 100,
  usedCount: 0,
  targetType: 'ALL' as 'ALL' | 'MOVIE' | 'FOOD' | 'COMBO',
  targetId: null as string | null,
  targetName: null as string | null,
  isActive: true,
  description: ''
};

// Mock data for promotions
const mockPromotions: Promotion[] = [
  {
    id: 'PROMO001',
    name: 'Khuyến mãi mùa hè',
    code: 'SUMMER2024',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    startDate: new Date(2024, 5, 1), // June 1, 2024
    endDate: new Date(2024, 7, 31), // August 31, 2024
    minPurchase: 100000,
    maxDiscount: 200000,
    maxUses: 1000,
    usedCount: 258,
    targetType: 'ALL',
    targetId: null,
    targetName: null,
    isActive: true,
    description: 'Giảm giá 20% cho tất cả các vé xem phim và đồ ăn trong mùa hè 2024.'
  },
  {
    id: 'PROMO002',
    name: 'Khuyến mãi phim Marvel',
    code: 'MARVEL15',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    startDate: new Date(2024, 4, 15), // May 15, 2024
    endDate: new Date(2024, 5, 15), // June 15, 2024
    minPurchase: 0,
    maxDiscount: 100000,
    maxUses: 500,
    usedCount: 123,
    targetType: 'MOVIE',
    targetId: 'M001',
    targetName: 'Deadpool & Wolverine',
    isActive: true,
    description: 'Giảm giá 15% cho tất cả các vé xem phim Marvel.'
  },
  {
    id: 'PROMO003',
    name: 'Combo giảm giá',
    code: 'COMBO50K',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    startDate: new Date(2024, 4, 1), // May 1, 2024
    endDate: new Date(2024, 9, 30), // October 30, 2024
    minPurchase: 200000,
    maxDiscount: null,
    maxUses: 300,
    usedCount: 87,
    targetType: 'COMBO',
    targetId: 'C001',
    targetName: 'Combo đôi',
    isActive: true,
    description: 'Giảm 50,000đ cho tất cả các combo đôi khi mua vé.'
  },
  {
    id: 'PROMO004',
    name: 'Giảm giá sinh nhật',
    code: 'BIRTHDAY',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    startDate: new Date(2024, 0, 1), // January 1, 2024
    endDate: new Date(2024, 11, 31), // December 31, 2024
    minPurchase: 0,
    maxDiscount: 100000,
    maxUses: 10000,
    usedCount: 1205,
    targetType: 'ALL',
    targetId: null,
    targetName: null,
    isActive: true,
    description: 'Giảm giá 25% cho khách hàng trong tháng sinh nhật.'
  },
  {
    id: 'PROMO005',
    name: 'Giảm giá đồ ăn',
    code: 'FOOD10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: new Date(2024, 3, 1), // April 1, 2024
    endDate: new Date(2024, 8, 30), // September 30, 2024
    minPurchase: 50000,
    maxDiscount: 30000,
    maxUses: 2000,
    usedCount: 567,
    targetType: 'FOOD',
    targetId: null,
    targetName: null,
    isActive: true,
    description: 'Giảm giá 10% cho tất cả các đồ ăn và thức uống.'
  },
  {
    id: 'PROMO006',
    name: 'Khuyến mãi cuối tuần',
    code: 'WEEKEND',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    startDate: new Date(2024, 4, 1), // May 1, 2024
    endDate: new Date(2024, 10, 30), // November 30, 2024
    minPurchase: 150000,
    maxDiscount: 100000,
    maxUses: 1000,
    usedCount: 321,
    targetType: 'ALL',
    targetId: null,
    targetName: null,
    isActive: true,
    description: 'Giảm giá 15% cho tất cả các đơn hàng vào cuối tuần.'
  },
  {
    id: 'PROMO007',
    name: 'Khuyến mãi học sinh, sinh viên',
    code: 'STUDENT',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: new Date(2024, 0, 1), // January 1, 2024
    endDate: new Date(2024, 11, 31), // December 31, 2024
    minPurchase: 0,
    maxDiscount: 50000,
    maxUses: 5000,
    usedCount: 2183,
    targetType: 'ALL',
    targetId: null,
    targetName: null,
    isActive: true,
    description: 'Giảm giá 10% cho học sinh, sinh viên khi xuất trình thẻ.'
  },
  {
    id: 'PROMO008',
    name: 'Khuyến mãi phim năm mới',
    code: 'NEWYEAR2024',
    discountType: 'FIXED_AMOUNT',
    discountValue: 24000,
    startDate: new Date(2024, 0, 1), // January 1, 2024
    endDate: new Date(2024, 0, 31), // January 31, 2024
    minPurchase: 0,
    maxDiscount: null,
    maxUses: 2024,
    usedCount: 1842,
    targetType: 'ALL',
    targetId: null,
    targetName: null,
    isActive: false,
    description: 'Giảm 24,000đ cho mỗi vé xem phim nhân dịp năm mới 2024.'
  }
];

// Mock data for targets
const mockMovies = [
  { id: 'M001', name: 'Deadpool & Wolverine' },
  { id: 'M002', name: 'Inside Out 2' },
  { id: 'M003', name: 'Venom 3' },
  { id: 'M004', name: 'Kung Fu Panda 4' },
  { id: 'M005', name: 'Thiện Ác Đối Đầu 3' }
];

const mockFoodItems = [
  { id: 'F001', name: 'Bắp rang bơ (vừa)' },
  { id: 'F002', name: 'Bắp rang bơ (lớn)' },
  { id: 'F003', name: 'Coca-Cola (vừa)' },
  { id: 'F004', name: 'Coca-Cola (lớn)' },
  { id: 'F005', name: 'Khoai tây chiên' }
];

const mockCombos = [
  { id: 'C001', name: 'Combo đôi' },
  { id: 'C002', name: 'Combo gia đình' },
  { id: 'C003', name: 'Combo bắp nước' },
  { id: 'C004', name: 'Combo sinh nhật' },
  { id: 'C005', name: 'Combo trọn gói' }
];

// Target type options
const targetTypeOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'MOVIE', label: 'Phim' },
  { value: 'FOOD', label: 'Đồ ăn' },
  { value: 'COMBO', label: 'Combo' }
];

// Discount type options
const discountTypeOptions = [
  { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
  { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' }
];

const PromotionsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '')
      .trim() + ' ₫';
  };

  // Format discount value
  const formatDiscountValue = (promotion: Promotion) => {
    if (promotion.discountType === 'PERCENTAGE') {
      return `${promotion.discountValue}%`;
    } else {
      return formatCurrency(promotion.discountValue);
    }
  };

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Tên khuyến mãi là bắt buộc'),
    code: Yup.string().required('Mã khuyến mãi là bắt buộc'),
    discountType: Yup.string().required('Loại giảm giá là bắt buộc'),
    discountValue: Yup.number()
      .required('Giá trị giảm giá là bắt buộc')
      .positive('Giá trị giảm giá phải là số dương')
      .test('is-valid-percentage', 'Phần trăm giảm giá phải từ 1-100%', function(value) {
        const { discountType } = this.parent;
        if (discountType === 'PERCENTAGE') {
          if (typeof value === 'number') return value <= 100;
          return true;
        }
        return true;
      }),
    startDate: Yup.date().required('Ngày bắt đầu là bắt buộc'),
    endDate: Yup.date()
      .required('Ngày kết thúc là bắt buộc')
      .min(
        Yup.ref('startDate'),
        'Ngày kết thúc phải sau ngày bắt đầu'
      ),
    minPurchase: Yup.number()
      .required('Mua tối thiểu là bắt buộc')
      .min(0, 'Mua tối thiểu không được âm'),
    maxUses: Yup.number()
      .required('Số lần sử dụng tối đa là bắt buộc')
      .positive('Số lần sử dụng tối đa phải là số dương'),
    maxDiscount: Yup.number()
      .nullable()
      .test('is-valid-max-discount', 'Giảm giá tối đa phải lớn hơn 0', function(value) {
        if (value === null || typeof value === 'undefined') return true;
        return value > 0;
      }),
    targetType: Yup.string().required('Đối tượng áp dụng là bắt buộc'),
    targetId: Yup.string().when('targetType', {
      is: (targetType: string) => targetType !== 'ALL',
      then: (schema) => schema.required('Vui lòng chọn đối tượng áp dụng'),
      otherwise: (schema) => schema.nullable()
    }),
    description: Yup.string().required('Mô tả là bắt buộc')
  });

  // Formik setup
  const formik = useFormik({
    initialValues: initialFormValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      let targetName: string | null = null;
      if (values.targetType === 'MOVIE' && values.targetId) {
        targetName = mockMovies.find(movie => movie.id === values.targetId)?.name || null;
      } else if (values.targetType === 'FOOD' && values.targetId) {
        targetName = mockFoodItems.find(food => food.id === values.targetId)?.name || null;
      } else if (values.targetType === 'COMBO' && values.targetId) {
        targetName = mockCombos.find(combo => combo.id === values.targetId)?.name || null;
      }

      if (dialogType === 'add') {
        // Add new promotion
        const newPromotion: Promotion = {
          ...values,
          id: `PROMO${(promotions.length + 1).toString().padStart(3, '0')}`,
          targetName
        };
        setPromotions([...promotions, newPromotion]);
      } else {
        // Edit existing promotion
        const updatedPromotions = promotions.map(promotion => 
          promotion.id === values.id 
            ? { ...values, targetName } 
            : promotion
        );
        setPromotions(updatedPromotions);
      }
      handleCloseDialog();
    }
  });

  // Target options based on targetType
  const getTargetOptions = () => {
    switch (formik.values.targetType) {
      case 'MOVIE':
        return mockMovies;
      case 'FOOD':
        return mockFoodItems;
      case 'COMBO':
        return mockCombos;
      default:
        return [];
    }
  };

  // Handle opening the add dialog
  const handleAddClick = () => {
    setDialogType('add');
    formik.resetForm();
    setOpenDialog(true);
  };

  // Handle opening the edit dialog
  const handleEditClick = (id: string) => {
    setDialogType('edit');
    const promotionToEdit = promotions.find(promotion => promotion.id === id);
    if (promotionToEdit) {
      formik.setValues(promotionToEdit);
    }
    setOpenDialog(true);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = (id: string) => {
    setSelectedPromotionId(id);
    setDeleteConfirmOpen(true);
  };

  // Handle confirming delete
  const handleConfirmDelete = () => {
    if (selectedPromotionId) {
      setPromotions(promotions.filter(promotion => promotion.id !== selectedPromotionId));
    }
    setDeleteConfirmOpen(false);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  // Handle target type change
  const handleTargetTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    formik.setFieldValue('targetType', event.target.value);
    formik.setFieldValue('targetId', null);
  };

  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    { 
      field: 'name', 
      headerName: 'Tên khuyến mãi', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <OfferIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { field: 'code', headerName: 'Mã', width: 130 },
    { 
      field: 'discount', 
      headerName: 'Giảm giá', 
      width: 120,
      valueGetter: (params) => formatDiscountValue(params.row as Promotion),
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={params.value} 
          color="primary"
          size="small"
          icon={<DiscountIcon sx={{ fontSize: '16px !important' }} />}
        />
      )
    },
    { 
      field: 'dateRange', 
      headerName: 'Thời gian áp dụng', 
      width: 200,
      valueGetter: (params) => {
        const promotion = params.row as Promotion;
        const formatDate = (date: Date) => {
          return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        };
        return `${formatDate(promotion.startDate)} - ${formatDate(promotion.endDate)}`;
      },
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'minPurchase', 
      headerName: 'Mua tối thiểu', 
      width: 140,
      valueGetter: (params) => params.row.minPurchase ? formatCurrency(params.row.minPurchase) : '0 ₫'
    },
    { 
      field: 'usageCount', 
      headerName: 'Đã sử dụng', 
      width: 130,
      valueGetter: (params) => `${params.row.usedCount}/${params.row.maxUses}`
    },
    { 
      field: 'targetType', 
      headerName: 'Đối tượng', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const promotion = params.row as Promotion;
        let label = '';
        let icon: React.ReactElement | undefined = undefined;
        
        switch (promotion.targetType) {
          case 'ALL':
            label = 'Tất cả';
            break;
          case 'MOVIE':
            label = promotion.targetName || 'Phim';
            icon = <MovieIcon fontSize="small" />;
            break;
          case 'FOOD':
            label = promotion.targetName || 'Đồ ăn';
            break;
          case 'COMBO':
            label = promotion.targetName || 'Combo';
            break;
        }
        
        return (
          <Chip 
            label={label} 
            size="small"
            icon={icon}
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'isActive', 
      headerName: 'Trạng thái', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => {
        const active = params.value as boolean;
        return (
          <Chip 
            label={active ? 'Đang hoạt động' : 'Không hoạt động'} 
            color={active ? 'success' : 'default'} 
            size="small" 
          />
        );
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
          <Typography variant="h4">
            Quản lý khuyến mãi
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddClick}
          >
            Thêm khuyến mãi mới
          </Button>
        </Box>

        <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <DataGrid
            rows={promotions}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              sorting: {
                sortModel: [{ field: 'isActive', sort: 'desc' }],
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
              {dialogType === 'add' ? 'Thêm khuyến mãi mới' : 'Chỉnh sửa khuyến mãi'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tên khuyến mãi"
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
                    label="Mã khuyến mãi"
                    name="code"
                    value={formik.values.code}
                    onChange={formik.handleChange}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.discountType && Boolean(formik.errors.discountType)}>
                    <InputLabel>Loại giảm giá</InputLabel>
                    <Select
                      name="discountType"
                      value={formik.values.discountType}
                      onChange={formik.handleChange}
                      label="Loại giảm giá"
                    >
                      {discountTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.discountType && formik.errors.discountType && (
                      <FormHelperText>{formik.errors.discountType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giá trị giảm giá"
                    name="discountValue"
                    type="number"
                    value={formik.values.discountValue}
                    onChange={formik.handleChange}
                    error={formik.touched.discountValue && Boolean(formik.errors.discountValue)}
                    helperText={formik.touched.discountValue && formik.errors.discountValue}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {formik.values.discountType === 'PERCENTAGE' ? '%' : 'VND'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày bắt đầu"
                    value={formik.values.startDate}
                    onChange={(date) => formik.setFieldValue('startDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.startDate && Boolean(formik.errors.startDate),
                        helperText: formik.touched.startDate && typeof formik.errors.startDate === 'string' ? formik.errors.startDate : null
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Ngày kết thúc"
                    value={formik.values.endDate}
                    onChange={(date) => formik.setFieldValue('endDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: formik.touched.endDate && Boolean(formik.errors.endDate),
                        helperText: formik.touched.endDate && typeof formik.errors.endDate === 'string' ? formik.errors.endDate : null
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Mua tối thiểu"
                    name="minPurchase"
                    type="number"
                    value={formik.values.minPurchase}
                    onChange={formik.handleChange}
                    error={formik.touched.minPurchase && Boolean(formik.errors.minPurchase)}
                    helperText={formik.touched.minPurchase && formik.errors.minPurchase}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giảm giá tối đa (để trống nếu không giới hạn)"
                    name="maxDiscount"
                    type="number"
                    value={formik.values.maxDiscount === null ? '' : formik.values.maxDiscount}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value);
                      formik.setFieldValue('maxDiscount', value);
                    }}
                    error={formik.touched.maxDiscount && Boolean(formik.errors.maxDiscount)}
                    helperText={formik.touched.maxDiscount && formik.errors.maxDiscount}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số lần sử dụng tối đa"
                    name="maxUses"
                    type="number"
                    value={formik.values.maxUses}
                    onChange={formik.handleChange}
                    error={formik.touched.maxUses && Boolean(formik.errors.maxUses)}
                    helperText={formik.touched.maxUses && formik.errors.maxUses}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isActive}
                        onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="Đang hoạt động"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.targetType && Boolean(formik.errors.targetType)}>
                    <InputLabel>Đối tượng áp dụng</InputLabel>
                    <Select
                      name="targetType"
                      value={formik.values.targetType}
                      onChange={(e) => {
                        handleTargetTypeChange(e as React.ChangeEvent<{ value: unknown }>);
                      }}
                      label="Đối tượng áp dụng"
                    >
                      {targetTypeOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.targetType && formik.errors.targetType && (
                      <FormHelperText>{formik.errors.targetType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {formik.values.targetType !== 'ALL' && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={formik.touched.targetId && Boolean(formik.errors.targetId)}>
                      <InputLabel>Chọn {formik.values.targetType === 'MOVIE' ? 'phim' : formik.values.targetType === 'FOOD' ? 'đồ ăn' : 'combo'}</InputLabel>
                      <Select
                        name="targetId"
                        value={formik.values.targetId || ''}
                        onChange={formik.handleChange}
                        label={`Chọn ${formik.values.targetType === 'MOVIE' ? 'phim' : formik.values.targetType === 'FOOD' ? 'đồ ăn' : 'combo'}`}
                      >
                        {getTargetOptions().map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.targetId && formik.errors.targetId && (
                        <FormHelperText>{formik.errors.targetId}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                )}
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
              Bạn có chắc chắn muốn xóa khuyến mãi này? Hành động này không thể hoàn tác.
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

export default PromotionsManagement; 