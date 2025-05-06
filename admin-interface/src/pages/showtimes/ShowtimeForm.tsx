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
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';

interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  cinemaId: number;
  cinemaName: string;
  roomId: number;
  roomName: string;
  date: string;
  time: string;
  price: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface ShowtimeFormProps {
  showtime: Showtime | null;
  onSave: (showtime: Omit<Showtime, 'id'>) => void;
  onCancel: () => void;
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({
  showtime,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();

  // Mock data - will be replaced with API calls
  const movies = [
    { id: 1, title: 'Sample Movie 1' },
    { id: 2, title: 'Sample Movie 2' },
  ];

  const cinemas = [
    { id: 1, name: 'Sample Cinema 1' },
    { id: 2, name: 'Sample Cinema 2' },
  ];

  const rooms = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' },
  ];

  const validationSchema = Yup.object({
    movieId: Yup.number()
      .required(t('showtimes.validation.movieRequired')),
    cinemaId: Yup.number()
      .required(t('showtimes.validation.cinemaRequired')),
    roomId: Yup.number()
      .required(t('showtimes.validation.roomRequired')),
    date: Yup.date()
      .required(t('showtimes.validation.dateRequired')),
    time: Yup.string()
      .required(t('showtimes.validation.timeRequired')),
    price: Yup.number()
      .required(t('showtimes.validation.priceRequired'))
      .min(1, t('showtimes.validation.priceMin')),
    status: Yup.string()
      .required(t('showtimes.validation.statusRequired')),
  });

  const formik = useFormik({
    initialValues: {
      movieId: showtime?.movieId || 0,
      cinemaId: showtime?.cinemaId || 0,
      roomId: showtime?.roomId || 0,
      date: showtime?.date ? new Date(showtime.date) : new Date(),
      time: showtime?.time || '',
      price: showtime?.price || 0,
      status: showtime?.status || 'ACTIVE',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        movieId: Number(values.movieId),
        cinemaId: Number(values.cinemaId),
        roomId: Number(values.roomId),
        date: values.date.toISOString().split('T')[0],
        time: values.time,
        price: Number(values.price),
        status: values.status,
        movieTitle: movies.find(m => m.id === Number(values.movieId))?.title || '',
        cinemaName: cinemas.find(c => c.id === Number(values.cinemaId))?.name || '',
        roomName: rooms.find(r => r.id === Number(values.roomId))?.name || '',
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>
        {showtime ? t('showtimes.editShowtime') : t('showtimes.addShowtime')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="movie-label">{t('showtimes.movie')}</InputLabel>
            <Select
              labelId="movie-label"
              id="movieId"
              name="movieId"
              value={formik.values.movieId}
              label={t('showtimes.movie')}
              onChange={formik.handleChange}
              error={formik.touched.movieId && Boolean(formik.errors.movieId)}
            >
              {movies.map((movie) => (
                <MenuItem key={movie.id} value={movie.id}>
                  {movie.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="cinema-label">{t('showtimes.cinema')}</InputLabel>
            <Select
              labelId="cinema-label"
              id="cinemaId"
              name="cinemaId"
              value={formik.values.cinemaId}
              label={t('showtimes.cinema')}
              onChange={formik.handleChange}
              error={formik.touched.cinemaId && Boolean(formik.errors.cinemaId)}
            >
              {cinemas.map((cinema) => (
                <MenuItem key={cinema.id} value={cinema.id}>
                  {cinema.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="room-label">{t('showtimes.room')}</InputLabel>
            <Select
              labelId="room-label"
              id="roomId"
              name="roomId"
              value={formik.values.roomId}
              label={t('showtimes.room')}
              onChange={formik.handleChange}
              error={formik.touched.roomId && Boolean(formik.errors.roomId)}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={t('showtimes.date')}
              value={formik.values.date}
              onChange={(date) => formik.setFieldValue('date', date)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.date && Boolean(formik.errors.date),
                  helperText: formik.touched.date && (formik.errors.date as string),
                },
              }}
            />

            <TimePicker
              label={t('showtimes.time')}
              value={formik.values.time ? new Date(`2000-01-01T${formik.values.time}`) : null}
              onChange={(time) => {
                if (time) {
                  const hours = time.getHours().toString().padStart(2, '0');
                  const minutes = time.getMinutes().toString().padStart(2, '0');
                  formik.setFieldValue('time', `${hours}:${minutes}`);
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.time && Boolean(formik.errors.time),
                  helperText: formik.touched.time && (formik.errors.time as string),
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            id="price"
            name="price"
            label={t('showtimes.price')}
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
          />

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

export default ShowtimeForm; 