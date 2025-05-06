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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  posterUrl: string;
}

interface MovieFormProps {
  movie: Movie | null;
  onSave: (movie: Omit<Movie, 'id'>) => void;
  onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const formik = useFormik({
    initialValues: {
      title: movie?.title || '',
      description: movie?.description || '',
      duration: movie?.duration || 0,
      releaseDate: movie?.releaseDate ? new Date(movie.releaseDate) : new Date(),
      status: movie?.status || 'ACTIVE',
      posterUrl: movie?.posterUrl || '',
    },
    validationSchema,
    onSubmit: (values) => {
      // TODO: Implement save functionality
      console.log('Form values:', values);
      onSave({
        ...values,
        releaseDate: values.releaseDate.toISOString().split('T')[0],
        posterUrl: values.posterUrl || movie?.posterUrl || '',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>
        {movie ? t('movies.editMovie') : t('movies.addMovie')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label={t('movies.title')}
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label={t('movies.description')}
            multiline
            rows={4}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <TextField
            fullWidth
            id="duration"
            name="duration"
            label={t('movies.duration')}
            type="number"
            value={formik.values.duration}
            onChange={formik.handleChange}
            error={formik.touched.duration && Boolean(formik.errors.duration)}
            helperText={formik.touched.duration && formik.errors.duration}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('movies.releaseDate')}
              value={formik.values.releaseDate}
              onChange={(date) => formik.setFieldValue('releaseDate', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.releaseDate && Boolean(formik.errors.releaseDate),
                  helperText: formik.touched.releaseDate && (formik.errors.releaseDate as string),
                },
              }}
            />
          </LocalizationProvider>

          <FormControl fullWidth>
            <InputLabel id="status-label">{t('common.status')}</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formik.values.status}
              label={t('common.status')}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="ACTIVE">{t('common.active')}</MenuItem>
              <MenuItem value="INACTIVE">{t('common.inactive')}</MenuItem>
            </Select>
          </FormControl>

          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            {t('movies.poster')}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              {selectedFile.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained">
          {t('common.save')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default MovieForm; 