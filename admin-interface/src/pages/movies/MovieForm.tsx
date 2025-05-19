import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Movie, MovieFormData } from '../../types';
import MovieIcon from '@mui/icons-material/Movie';
import CloseIcon from '@mui/icons-material/Close';

interface MovieFormProps {
  movie: Movie | null;
  onSave: (formData: MovieFormData) => void;
  onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(movie?.posterUrl || null);

  const validationSchema = Yup.object({
    title: Yup.string().required(t('validation.required', { field: t('movies.title') })),
    description: Yup.string().required(t('validation.required', { field: t('movies.description') })),
    duration: Yup.number()
      .required(t('validation.required', { field: t('movies.duration') }))
      .min(1, t('validation.minLength', { field: t('movies.duration'), min: 1 })),
    releaseDate: Yup.date().required(t('validation.required', { field: t('movies.releaseDate') })),
    status: Yup.string().required(t('validation.required', { field: t('common.status') })),
    posterUrl: Yup.string().url(t('validation.url')),
  });

  const formik = useFormik<MovieFormData>({
    initialValues: {
      title: movie?.title || '',
      description: movie?.description || '',
      duration: movie?.duration || 0,
      releaseDate: movie?.releaseDate ? new Date(movie.releaseDate) : new Date(),
      status: movie?.status === 'SHOWING' ? 'ACTIVE' : movie?.status === 'UPCOMING' ? 'INACTIVE' : (movie?.status || 'ACTIVE'),
      posterUrl: movie?.posterUrl || '',
      posterFile: null
    },
    validationSchema,
    onSubmit: (values) => {
      // Include the selectedFile in the form data
      const formData = {
        ...values,
        posterFile: selectedFile
      };
      onSave(formData);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Optional: You might want to clear the posterUrl field if a new file is selected
      // formik.setFieldValue('posterUrl', '');
      
      // Clean up the object URL when component unmounts or when file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    formik.setFieldValue('posterUrl', '');
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>
        {movie ? t('movies.editMovie') : t('movies.addMovie')}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              margin="normal"
              label={t('movies.title')}
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
            
            <TextField
              fullWidth
              margin="normal"
              label={t('movies.description')}
              name="description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label={t('movies.duration')}
                  name="duration"
                  type="number"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  error={formik.touched.duration && Boolean(formik.errors.duration)}
                  helperText={formik.touched.duration && formik.errors.duration}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">{t('movies.minutes')}</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{t('common.status')}</InputLabel>
                  <Select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    label={t('common.status')}
                  >
                    <MenuItem value="ACTIVE">{t('common.active')}</MenuItem>
                    <MenuItem value="INACTIVE">{t('common.inactive')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label={t('movies.releaseDate')}
                value={formik.values.releaseDate}
                onChange={(date) => formik.setFieldValue('releaseDate', date || new Date())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: formik.touched.releaseDate && Boolean(formik.errors.releaseDate),
                    helperText: formik.touched.releaseDate && formik.errors.releaseDate ? String(formik.errors.releaseDate) : undefined
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ border: '1px dashed grey', borderRadius: 1, p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('movies.poster')}
              </Typography>
              
              {previewUrl ? (
                <Box sx={{ position: 'relative', mb: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={previewUrl} 
                    alt={t('movies.posterPreview')} 
                    style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
                  />
                  <IconButton 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      bgcolor: 'rgba(0,0,0,0.3)', 
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
                    }}
                    onClick={handleRemoveImage}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.04)',
                    borderRadius: 1,
                    p: 3,
                    mb: 2,
                    flexGrow: 1
                  }}
                >
                  <MovieIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {t('movies.noPoster')}
                  </Typography>
                </Box>
              )}
              
              <input
                accept="image/*"
                id="poster-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="poster-upload">
                <Button 
                  variant="outlined" 
                  component="span" 
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  {t('movies.uploadPoster')}
                </Button>
              </label>
              
              {formik.values.posterUrl && !selectedFile && (
                <TextField
                  fullWidth
                  margin="normal"
                  size="small"
                  label={t('movies.posterUrl')}
                  name="posterUrl"
                  value={formik.values.posterUrl}
                  onChange={formik.handleChange}
                  error={formik.touched.posterUrl && Boolean(formik.errors.posterUrl)}
                  helperText={formik.touched.posterUrl && formik.errors.posterUrl}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" color="primary">
          {movie ? t('common.update') : t('common.create')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default MovieForm; 