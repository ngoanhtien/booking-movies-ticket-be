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
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ConfirmationNumber as DiscountCodeIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MonetizationIcon,
  Category as CategoryIcon,
  Movie as MovieIcon,
  Fastfood as FoodIcon,
  Settings as SettingsIcon,
  AllInclusive as AllInclusiveIcon,
  Visibility,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

// Define the Discount type
interface Discount {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startDate: Date;
  endDate: Date;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimitPerUser: number | null;
  totalUsageLimit: number | null;
  usedCount: number;
  applicableTo: 'ALL_PRODUCTS' | 'SPECIFIC_MOVIES' | 'SPECIFIC_FOOD' | 'SPECIFIC_CATEGORIES';
  applicableItems: string[]; // Array of movie IDs, food IDs, or category IDs
  isActive: boolean;
}

// Initial form values
const initialFormValues: Discount = {
  id: '',
  code: '',
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 0,
  startDate: new Date(),
  endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  usageLimitPerUser: null,
  totalUsageLimit: null,
  usedCount: 0,
  applicableTo: 'ALL_PRODUCTS',
  applicableItems: [],
  isActive: true,
};

// Mock data for discounts
const mockDiscounts: Discount[] = [
  {
    id: 'D001',
    code: 'WELCOME10',
    name: 'Giảm 10% cho người mới',
    description: 'Giảm 10% cho đơn hàng đầu tiên của khách hàng mới.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    minPurchaseAmount: 0,
    maxDiscountAmount: 50000,
    usageLimitPerUser: 1,
    totalUsageLimit: null,
    usedCount: 1250,
    applicableTo: 'ALL_PRODUCTS',
    applicableItems: [],
    isActive: true,
  },
  {
    id: 'D002',
    code: 'MOVIECOMBO20K',
    name: 'Giảm 20K cho Combo Phim',
    description: 'Giảm 20,000 VND khi mua kèm combo bắp nước với vé phim.',
    discountType: 'FIXED_AMOUNT',
    discountValue: 20000,
    startDate: new Date(2024, 4, 1),
    endDate: new Date(2024, 6, 30),
    minPurchaseAmount: 150000,
    maxDiscountAmount: null,
    usageLimitPerUser: null,
    totalUsageLimit: 500,
    usedCount: 312,
    applicableTo: 'SPECIFIC_CATEGORIES',
    applicableItems: ['CAT_COMBO', 'CAT_TICKET'], // Example category IDs
    isActive: true,
  },
  {
    id: 'D003',
    code: 'DEADPOOLDEAL',
    name: 'Ưu đãi phim Deadpool & Wolverine',
    description: 'Giảm 15% vé xem phim Deadpool & Wolverine.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    startDate: new Date(2024, 6, 20),
    endDate: new Date(2024, 7, 20),
    minPurchaseAmount: 0,
    maxDiscountAmount: 30000,
    usageLimitPerUser: 2,
    totalUsageLimit: 1000,
    usedCount: 88,
    applicableTo: 'SPECIFIC_MOVIES',
    applicableItems: ['M001'], // ID for Deadpool & Wolverine
    isActive: true,
  },
  {
    id: 'D004',
    code: 'BIGORDER50',
    name: 'Giảm 50K cho đơn hàng lớn',
    description: 'Giảm 50,000 VND cho đơn hàng từ 500,000 VND.',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50000,
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2024, 8, 30),
    minPurchaseAmount: 500000,
    maxDiscountAmount: null,
    usageLimitPerUser: null,
    totalUsageLimit: null,
    usedCount: 450,
    applicableTo: 'ALL_PRODUCTS',
    applicableItems: [],
    isActive: true,
  },
  {
    id: 'D005',
    code: 'FOODLOVE10',
    name: 'Giảm 10% đồ ăn nhẹ',
    description: 'Giảm 10% cho tất cả các sản phẩm đồ ăn nhẹ.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: new Date(2024, 5, 1),
    endDate: new Date(2024, 5, 30),
    minPurchaseAmount: 50000,
    maxDiscountAmount: 20000,
    usageLimitPerUser: 5,
    totalUsageLimit: 2000,
    usedCount: 780,
    applicableTo: 'SPECIFIC_FOOD',
    applicableItems: ['F001', 'F002', 'F005'], // IDs for popcorn, snacks
    isActive: false, // Expired example
  },
];

// Mock data for applicable items (movies, food, categories)
const mockMovies = [
  { id: 'M001', name: 'Deadpool & Wolverine' },
  { id: 'M002', name: 'Inside Out 2' },
  { id: 'M003', name: 'Venom 3' },
];
const mockFoodItems = [
  { id: 'F001', name: 'Bắp rang bơ (vừa)' },
  { id: 'F002', name: 'Bắp rang bơ (lớn)' },
  { id: 'F003', name: 'Coca-Cola (vừa)' },
  { id: 'F004', name: 'Coca-Cola (lớn)' },
  { id: 'F005', name: 'Khoai tây chiên' },
];
const mockCategories = [
  { id: 'CAT_TICKET', name: 'Vé xem phim' },
  { id: 'CAT_COMBO', name: 'Combo Bắp Nước' },
  { id: 'CAT_SNACK', name: 'Đồ ăn nhẹ' },
  { id: 'CAT_DRINK', name: 'Nước uống' },
];

// Discount type options
const discountTypeOptions = [
  { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
  { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' }
];

// Applicable to options
const applicableToOptions = [
  { value: 'ALL_PRODUCTS', label: 'Tất cả sản phẩm', icon: <AllInclusiveIcon /> },
  { value: 'SPECIFIC_MOVIES', label: 'Phim cụ thể', icon: <MovieIcon /> },
  { value: 'SPECIFIC_FOOD', label: 'Đồ ăn cụ thể', icon: <FoodIcon /> },
  { value: 'SPECIFIC_CATEGORIES', label: 'Danh mục cụ thể', icon: <CategoryIcon /> }
];

const DiscountManagement: React.FC = () => {
  const { t } = useTranslation();
  const [discounts, setDiscounts] = useState<Discount[]>(mockDiscounts);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'add' | 'edit'>('add');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'PERCENTAGE' | 'FIXED_AMOUNT'>('all');

  // Get filtered discounts
  const filteredDiscounts = discounts.filter(discount => {
    // Search term filter
    const matchesSearch = 
      discount.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && discount.isActive) ||
      (filterStatus === 'inactive' && !discount.isActive);

    // Type filter
    const matchesType =
      filterType === 'all' ||
      filterType === discount.discountType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (value: number | null) => {
    if (value === null || typeof value === 'undefined') return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', '')
      .trim() + ' ₫';
  };

  const getApplicableItemsName = (discount: Discount): string => {
    if (discount.applicableTo === 'ALL_PRODUCTS') return 'Tất cả sản phẩm';
    if (!discount.applicableItems || discount.applicableItems.length === 0) return 'Chưa chọn';

    const itemNames = discount.applicableItems.map(itemId => {
      if (discount.applicableTo === 'SPECIFIC_MOVIES') {
        return mockMovies.find(m => m.id === itemId)?.name;
      }
      if (discount.applicableTo === 'SPECIFIC_FOOD') {
        return mockFoodItems.find(f => f.id === itemId)?.name;
      }
      if (discount.applicableTo === 'SPECIFIC_CATEGORIES') {
        return mockCategories.find(c => c.id === itemId)?.name;
      }
      return itemId;
    });
    return itemNames.filter(Boolean).join(', ');
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Tên mã giảm giá là bắt buộc'),
    code: Yup.string().uppercase('Mã phải là chữ hoa').required('Mã giảm giá là bắt buộc'),
    description: Yup.string().required('Mô tả là bắt buộc'),
    discountType: Yup.string().required('Loại giảm giá là bắt buộc'),
    discountValue: Yup.number()
      .required('Giá trị giảm giá là bắt buộc')
      .positive('Giá trị giảm giá phải dương')
      .test('is-valid-percentage', 'Phần trăm phải từ 1-100', function (value) {
        const { discountType } = this.parent;
        if (discountType === 'PERCENTAGE') {
          return typeof value === 'number' && value > 0 && value <= 100;
        }
        return true;
      }),
    startDate: Yup.date().required('Ngày bắt đầu là bắt buộc'),
    endDate: Yup.date()
      .required('Ngày kết thúc là bắt buộc')
      .min(Yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu'),
    minPurchaseAmount: Yup.number().nullable().min(0, 'Không được âm'),
    maxDiscountAmount: Yup.number().nullable().min(0, 'Không được âm')
        .test('max-greater-than-value', 'Tối đa phải lớn hơn giá trị giảm (nếu là cố định)', function(value){
            const { discountType, discountValue } = this.parent;
            if (value === null) { // If null, it's valid as per nullable()
                return true;
            }
            // At this point, value should be a number if not null due to Yup's type coercion for number().nullable()
            if(discountType === 'FIXED_AMOUNT' && typeof discountValue === 'number' && typeof value === 'number'){
                return value >= discountValue;
            }
            return true;
        }),
    usageLimitPerUser: Yup.number().nullable().min(1, 'Phải ít nhất 1'),
    totalUsageLimit: Yup.number().nullable().min(1, 'Phải ít nhất 1'),
    applicableTo: Yup.string().required('Đối tượng áp dụng là bắt buộc'),
    applicableItems: Yup.array().when('applicableTo', {
      is: (val: string) => val !== 'ALL_PRODUCTS',
      then: (schema) => schema.min(1, 'Phải chọn ít nhất 1 mục').required('Mục áp dụng là bắt buộc'),
      otherwise: (schema) => schema.optional(),
    }),
    isActive: Yup.boolean(),
  });

  const formik = useFormik<Discount>({
    initialValues: initialFormValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (dialogType === 'add') {
        const newDiscount: Discount = {
          ...values,
          id: `D${(discounts.length + 1).toString().padStart(3, '0')}`,
          usedCount: 0, // New discounts start with 0 used count
        };
        setDiscounts([...discounts, newDiscount]);
      } else if (selectedDiscount) {
        const updatedDiscounts = discounts.map(d => 
          d.id === selectedDiscount.id ? { ...d, ...values } : d
        );
        setDiscounts(updatedDiscounts);
      }
      handleCloseDialog();
    },
  });

  const handleAddClick = () => {
    setSelectedDiscount(null);
    formik.resetForm({ values: initialFormValues });
    setDialogType('add');
    setOpenDialog(true);
  };

  const handleEditClick = (discount: Discount) => {
    setSelectedDiscount(discount);
    formik.setValues(discount);
    setDialogType('edit');
    setOpenDialog(true);
  };

  const handleDeleteClick = (discountId: string) => {
    setSelectedDiscount(discounts.find(d => d.id === discountId) || null);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDiscount) {
      setDiscounts(discounts.filter(d => d.id !== selectedDiscount.id));
    }
    setDeleteConfirmOpen(false);
    setSelectedDiscount(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDiscount(null);
    formik.resetForm({ values: initialFormValues });
  };

  const getApplicableItemOptions = () => {
    switch (formik.values.applicableTo) {
      case 'SPECIFIC_MOVIES': return mockMovies;
      case 'SPECIFIC_FOOD': return mockFoodItems;
      case 'SPECIFIC_CATEGORIES': return mockCategories;
      default: return [];
    }
  };

  // Add handleViewDetails function
  const handleViewDetails = (discount: Discount) => {
    setSelectedDiscount(discount);
    // You could also add a view mode to the dialog
    setDialogType('edit');
    formik.setValues({...discount});
    setOpenDialog(true);
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: t('discount.code', 'Mã giảm giá'), flex: 1, minWidth: 120,
      renderCell: (params: GridRenderCellParams<Discount>) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DiscountCodeIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    { field: 'name', headerName: t('discount.name', 'Tên khuyến mãi'), flex: 2, minWidth: 200 },
    { 
      field: 'discountValue', 
      headerName: t('discount.value', 'Giá trị'), 
      flex: 1, 
      minWidth: 120,
      renderCell: (params: GridRenderCellParams<Discount>) => {
        const { discountType, discountValue } = params.row;
        return (
          <Typography>
            {discountType === 'PERCENTAGE' 
              ? `${discountValue}%` 
              : formatCurrency(discountValue)
            }
          </Typography>
        );
      }
    },
    {
      field: 'validPeriod',
      headerName: t('discount.validPeriod', 'Thời gian hiệu lực'),
      flex: 1.5,
      minWidth: 200,
      valueGetter: (params) => {
        const { startDate, endDate } = params.row;
        const format = (date: Date) => new Date(date).toLocaleDateString('vi-VN');
        return `${format(startDate)} - ${format(endDate)}`;
      },
      renderCell: (params) => {
        const now = new Date();
        const { startDate, endDate } = params.row;
        let status: 'future' | 'active' | 'expired' = 'active';
        
        if (new Date(startDate) > now) {
          status = 'future';
        } else if (new Date(endDate) < now) {
          status = 'expired';
        }
        
        const format = (date: Date) => new Date(date).toLocaleDateString('vi-VN');
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ 
              color: status === 'active' ? 'success.main' : status === 'future' ? 'info.main' : 'text.disabled',
              mr: 1 
            }} />
            <Typography>{`${format(startDate)} - ${format(endDate)}`}</Typography>
          </Box>
        );
      }
    },
    {
      field: 'applicableTo',
      headerName: t('discount.applicableTo', 'Áp dụng cho'),
      flex: 1.5,
      minWidth: 180,
      valueGetter: (params) => getApplicableItemsName(params.row),
      renderCell: (params) => {
        const { applicableTo } = params.row;
        let icon = <AllInclusiveIcon />;
        
        if (applicableTo === 'SPECIFIC_MOVIES') {
          icon = <MovieIcon />;
        } else if (applicableTo === 'SPECIFIC_FOOD') {
          icon = <FoodIcon />;
        } else if (applicableTo === 'SPECIFIC_CATEGORIES') {
          icon = <CategoryIcon />;
        }
        
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 1, color: 'primary.main' }}>{icon}</Box>
            <Typography noWrap>{getApplicableItemsName(params.row)}</Typography>
          </Box>
        );
      }
    },
    {
      field: 'isActive',
      headerName: t('discount.status', 'Trạng thái'),
      width: 120,
      renderCell: (params: GridRenderCellParams<Discount>) => (
        <Chip 
          label={params.value ? t('discount.active', 'Hoạt động') : t('discount.inactive', 'Không hoạt động')} 
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: t('common.actions', 'Thao tác'),
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Discount>) => (
        <Box>
          <Tooltip title={t('common.view', 'Xem chi tiết')}>
            <IconButton 
              onClick={() => handleViewDetails(params.row)}
              size="small" 
              sx={{ color: 'info.main' }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.edit', 'Chỉnh sửa')}>
            <IconButton 
              onClick={() => handleEditClick(params.row)}
              size="small" 
              sx={{ color: 'primary.main' }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common.delete', 'Xóa')}>
            <IconButton 
              onClick={() => handleDeleteClick(params.row.id)}
              size="small" 
              sx={{ color: 'error.main' }}
            >
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
          <Typography variant="h4">Quản lý Mã Giảm Giá</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
            Thêm mã giảm giá
          </Button>
        </Box>

        {/* Search and filter section */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label={t('common.search', 'Tìm kiếm')}
            placeholder={t('discount.searchPlaceholder', 'Tìm theo mã hoặc tên...')}
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

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('discount.statusFilter', 'Trạng thái')}</InputLabel>
            <Select
              value={filterStatus}
              label={t('discount.statusFilter', 'Trạng thái')}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            >
              <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
              <MenuItem value="active">{t('discount.active', 'Hoạt động')}</MenuItem>
              <MenuItem value="inactive">{t('discount.inactive', 'Không hoạt động')}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>{t('discount.typeFilter', 'Loại giảm giá')}</InputLabel>
            <Select
              value={filterType}
              label={t('discount.typeFilter', 'Loại giảm giá')}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            >
              <MenuItem value="all">{t('common.all', 'Tất cả')}</MenuItem>
              <MenuItem value="PERCENTAGE">{t('discount.percentage', 'Phần trăm (%)')}</MenuItem>
              <MenuItem value="FIXED_AMOUNT">{t('discount.fixedAmount', 'Số tiền cố định')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats summary */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              width: { xs: '100%', sm: 'auto', md: '200px' } 
            }}
          >
            <Box sx={{ 
              mr: 1.5, 
              backgroundColor: 'primary.light', 
              borderRadius: '50%', 
              p: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <DiscountCodeIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('discount.totalDiscounts', 'Tổng số mã')}
              </Typography>
              <Typography variant="h6">
                {discounts.length}
              </Typography>
            </Box>
          </Paper>
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              width: { xs: '100%', sm: 'auto', md: '200px' } 
            }}
          >
            <Box sx={{ 
              mr: 1.5, 
              backgroundColor: 'success.light', 
              borderRadius: '50%', 
              p: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <CheckCircleIcon sx={{ color: 'success.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('discount.activeDiscounts', 'Mã đang hoạt động')}
              </Typography>
              <Typography variant="h6">
                {discounts.filter(d => d.isActive).length}
              </Typography>
            </Box>
          </Paper>
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              width: { xs: '100%', sm: 'auto', md: '200px' } 
            }}
          >
            <Box sx={{ 
              mr: 1.5, 
              backgroundColor: 'error.light', 
              borderRadius: '50%', 
              p: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <ErrorIcon sx={{ color: 'error.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('discount.inactiveDiscounts', 'Mã không hoạt động')}
              </Typography>
              <Typography variant="h6">
                {discounts.filter(d => !d.isActive).length}
              </Typography>
            </Box>
          </Paper>
        </Box>

        <Paper sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <DataGrid
            rows={filteredDiscounts}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 10 } },
              sorting: { sortModel: [{ field: 'isActive', sort: 'desc' }] }
            }}
            pageSizeOptions={[5, 10, 20]}
            density="compact"
            disableRowSelectionOnClick
            sx={{ '& .MuiDataGrid-cell:focus': { outline: 'none' } }}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <form onSubmit={formik.handleSubmit}>
            <DialogTitle>
              {dialogType === 'add' ? 'Tạo mã giảm giá mới' : 'Chỉnh sửa mã giảm giá'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Tên mã giảm giá"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Mã giảm giá (CODE)"
                    name="code"
                    value={formik.values.code}
                    onChange={(e) => formik.setFieldValue('code', e.target.value.toUpperCase())}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả chi tiết"
                    name="description"
                    multiline
                    rows={2}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
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
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formik.touched.discountType && formik.errors.discountType}</FormHelperText>
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
                      endAdornment: <InputAdornment position="end">
                        {formik.values.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}
                      </InputAdornment>,
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
                        helperText: formik.touched.startDate && typeof formik.errors.startDate === 'string' ? formik.errors.startDate : null,
                      },
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
                        helperText: formik.touched.endDate && typeof formik.errors.endDate === 'string' ? formik.errors.endDate : null,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tổng tiền mua tối thiểu (để trống nếu không áp dụng)"
                    name="minPurchaseAmount"
                    type="number"
                    value={formik.values.minPurchaseAmount === null ? '' : formik.values.minPurchaseAmount}
                    onChange={(e) => formik.setFieldValue('minPurchaseAmount', e.target.value === '' ? null : Number(e.target.value))}
                    error={formik.touched.minPurchaseAmount && Boolean(formik.errors.minPurchaseAmount)}
                    helperText={formik.touched.minPurchaseAmount && formik.errors.minPurchaseAmount}
                    InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Số tiền giảm tối đa (để trống nếu không giới hạn)"
                    name="maxDiscountAmount"
                    type="number"
                    value={formik.values.maxDiscountAmount === null ? '' : formik.values.maxDiscountAmount}
                    onChange={(e) => formik.setFieldValue('maxDiscountAmount', e.target.value === '' ? null : Number(e.target.value))}
                    error={formik.touched.maxDiscountAmount && Boolean(formik.errors.maxDiscountAmount)}
                    helperText={formik.touched.maxDiscountAmount && formik.errors.maxDiscountAmount}
                    InputProps={{ endAdornment: <InputAdornment position="end">VNĐ</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Giới hạn sử dụng/người dùng (để trống nếu không giới hạn)"
                    name="usageLimitPerUser"
                    type="number"
                    value={formik.values.usageLimitPerUser === null ? '' : formik.values.usageLimitPerUser}
                    onChange={(e) => formik.setFieldValue('usageLimitPerUser', e.target.value === '' ? null : Number(e.target.value))}
                    error={formik.touched.usageLimitPerUser && Boolean(formik.errors.usageLimitPerUser)}
                    helperText={formik.touched.usageLimitPerUser && formik.errors.usageLimitPerUser}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tổng giới hạn sử dụng (để trống nếu không giới hạn)"
                    name="totalUsageLimit"
                    type="number"
                    value={formik.values.totalUsageLimit === null ? '' : formik.values.totalUsageLimit}
                    onChange={(e) => formik.setFieldValue('totalUsageLimit', e.target.value === '' ? null : Number(e.target.value))}
                    error={formik.touched.totalUsageLimit && Boolean(formik.errors.totalUsageLimit)}
                    helperText={formik.touched.totalUsageLimit && formik.errors.totalUsageLimit}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.applicableTo && Boolean(formik.errors.applicableTo)}>
                    <InputLabel>Áp dụng cho</InputLabel>
                    <Select
                      name="applicableTo"
                      value={formik.values.applicableTo}
                      onChange={(e) => {
                        formik.handleChange(e);
                        formik.setFieldValue('applicableItems', []); // Reset items when type changes
                      }}
                      label="Áp dụng cho"
                    >
                      {applicableToOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                            {option.icon && React.cloneElement(option.icon, { sx: { mr: 1}})}
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{formik.touched.applicableTo && formik.errors.applicableTo}</FormHelperText>
                  </FormControl>
                </Grid>
                {formik.values.applicableTo !== 'ALL_PRODUCTS' && (
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      multiple
                      options={getApplicableItemOptions()}
                      getOptionLabel={(option) => option.name}
                      value={getApplicableItemOptions().filter(opt => formik.values.applicableItems.includes(opt.id))}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('applicableItems', newValue.map(item => item.id));
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label={`Chọn ${applicableToOptions.find(o => o.value === formik.values.applicableTo)?.label.toLowerCase().replace(' cụ thể','')}`}
                          placeholder="Chọn các mục..."
                          error={formik.touched.applicableItems && Boolean(formik.errors.applicableItems)}
                          helperText={formik.touched.applicableItems && formik.errors.applicableItems as string}
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.name}
                            {...getTagProps({ index })}
                            key={option.id}
                          />
                        ))
                      }
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="Kích hoạt mã giảm giá"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button type="submit" variant="contained">
                {dialogType === 'add' ? 'Thêm mã' : 'Lưu thay đổi'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Xác nhận xóa mã giảm giá</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa mã giảm giá "{selectedDiscount?.name}" (Code: {selectedDiscount?.code})? 
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">Xóa</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default DiscountManagement; 