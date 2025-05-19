import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  Avatar,
  Snackbar,
  Alert,
  TextField,
  Grid,
  MenuItem,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UserForm from './UserForm';
import { userService, UserRequest, UserResponse, UserCriteria } from '../../services/userService';
import { User, UserRole } from '../../types/user';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [searchCriteria, setSearchCriteria] = useState<UserCriteria>({
    username: '',
    email: '',
    fullName: '',
    status: undefined,
    role: undefined,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(
        searchCriteria,
        paginationModel.page,
        paginationModel.pageSize
      );
      setUsers(response.data.content);
    } catch (err) {
      setError(t('common.error.fetching'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [paginationModel, searchCriteria]);

  const handleSearchChange = (field: keyof UserCriteria, value: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value || undefined
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleStatusChange = (value: 'ACTIVE' | 'INACTIVE' | '') => {
    setSearchCriteria(prev => ({
      ...prev,
      status: value || undefined
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleRoleChange = (value: UserRole | '') => {
    setSearchCriteria(prev => ({
      ...prev,
      role: value || undefined
    }));
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: t('users.avatar'),
      width: 100,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatarUrl}
          alt={params.row.fullName}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    { field: 'id', headerName: t('users.id'), width: 70 },
    { field: 'username', headerName: t('users.username'), width: 130 },
    { field: 'email', headerName: t('users.email'), width: 200 },
    { field: 'fullName', headerName: t('users.fullName'), width: 200 },
    { field: 'phone', headerName: t('users.phone'), width: 130 },
    { field: 'membershipLevel', headerName: t('users.membershipLevel'), width: 130 },
    {
      field: 'role',
      headerName: t('users.role'),
      width: 130,
      renderCell: (params) => (
        <Typography>
          {params.value === 'ADMIN' ? t('users.roles.admin') : t('users.roles.user')}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: t('common.status'),
      width: 130,
      renderCell: (params) => (
        <Typography
          color={params.value === 'ACTIVE' ? 'success.main' : 'error.main'}
        >
          {params.value === 'ACTIVE' ? t('common.active') : t('common.inactive')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 130,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedUser(null);
    setOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userService.deactivateUser(id);
      setSuccess(t('users.deactivateSuccess'));
      fetchUsers();
    } catch (err) {
      setError(t('users.deactivateError'));
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (userData: UserRequest, avatarFile?: File) => {
    try {
      if (userData.id) {
        await userService.updateUser(userData, avatarFile);
        setSuccess(t('users.updateSuccess'));
      } else {
        await userService.createUser(userData, avatarFile);
        setSuccess(t('users.createSuccess'));
      }
      handleClose();
      fetchUsers();
    } catch (err) {
      setError(t('users.saveError'));
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const blob = await userService.exportUsers(searchCriteria);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(t('users.exportSuccess'));
    } catch (err) {
      setError(t('users.exportError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('users.title')}</Typography>
        <Box>
          <Tooltip title={t('users.export')}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              sx={{ mr: 2 }}
            >
              {t('users.export')}
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            {t('common.add')}
          </Button>
        </Box>
      </Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('users.username')}
                value={searchCriteria.username}
                onChange={(e) => handleSearchChange('username', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('users.email')}
                value={searchCriteria.email}
                onChange={(e) => handleSearchChange('email', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('users.fullName')}
                value={searchCriteria.fullName}
                onChange={(e) => handleSearchChange('fullName', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label={t('users.role')}
                value={searchCriteria.role || ''}
                onChange={(e) => handleRoleChange(e.target.value as UserRole | '')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="USER">{t('users.roles.user')}</MenuItem>
                <MenuItem value="ADMIN">{t('users.roles.admin')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label={t('common.status')}
                value={searchCriteria.status || ''}
                onChange={(e) => handleStatusChange(e.target.value as 'ACTIVE' | 'INACTIVE' | '')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="ACTIVE">{t('common.active')}</MenuItem>
                <MenuItem value="INACTIVE">{t('common.inactive')}</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 20]}
            checkboxSelection
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <UserForm
          user={selectedUser}
          onSave={handleSave}
          onCancel={handleClose}
        />
      </Dialog>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 