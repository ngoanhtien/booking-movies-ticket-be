import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslation } from 'react-i18next';
import { fetchMovies } from '../../services/movieService';
import * as cinemaService from '../../services/cinemaService';
import { Showtime } from '../../services/showtimeService';
import { useQuery } from '@tanstack/react-query';

interface ShowtimeFormProps {
  showtime: Showtime | null;
  onSave: (showtimeData: Partial<Showtime>) => void;
  onCancel: () => void;
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({
  showtime,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [selectedBranchId, setSelectedBranchId] = useState<number | ''>('');
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | ''>('');

  // Fetch movies
  const { data: moviesData, isLoading: isLoadingMovies } = useQuery({
    queryKey: ['movies-dropdown'],
    queryFn: () => fetchMovies(0, 100, { status: 'ACTIVE' }),
  });

  // Fetch cinemas
  const { data: cinemasData, isLoading: isLoadingCinemas } = useQuery({
    queryKey: ['cinemas-dropdown'],
    queryFn: () => cinemaService.getAllCinemas(0, 100),
  });

  // Fetch branches based on selected cinema
  const { data: branchesData, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches-dropdown', selectedCinemaId],
    queryFn: () => cinemaService.getBranchesByCinemaId(Number(selectedCinemaId)),
    enabled: !!selectedCinemaId,
  });

  // Fetch rooms based on selected branch
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['rooms-dropdown', selectedBranchId],
    queryFn: () => cinemaService.getRoomsByBranchId(Number(selectedBranchId)),
    enabled: !!selectedBranchId,
  });

  // Format data for dropdowns
  const movies = moviesData?.content || [];
  const cinemas = cinemasData?.content || [];
  const branches = branchesData || [];
  const rooms = roomsData || [];

  // Set initial values based on showtime if provided
  useEffect(() => {
    if (showtime) {
      const cinemaId = showtime.room?.branch?.cinema?.id;
      const branchId = showtime.room?.branch?.id;
      
      if (cinemaId) {
        setSelectedCinemaId(cinemaId);
      }
      
      if (branchId) {
        setSelectedBranchId(branchId);
      }
    }
  }, [showtime]);

  const validationSchema = Yup.object({
    scheduleId: Yup.number()
      .required(t('showtimes.validation.scheduleRequired')),
    roomId: Yup.number()
      .required(t('showtimes.validation.roomRequired')),
    startTime: Yup.date()
      .required(t('showtimes.validation.startTimeRequired')),
    endTime: Yup.date()
      .required(t('showtimes.validation.endTimeRequired')),
    price: Yup.number()
      .required(t('showtimes.validation.priceRequired'))
      .min(1, t('showtimes.validation.priceMin')),
    status: Yup.string()
      .required(t('showtimes.validation.statusRequired')),
  });

  // Parse ISO string to Date
  const parseTimeString = (timeString?: string): Date => {
    if (!timeString) return new Date();
    return new Date(timeString);
  };

  const formik = useFormik({
    initialValues: {
      scheduleId: showtime?.scheduleId || '',
      roomId: showtime?.roomId || '',
      startTime: parseTimeString(showtime?.startTime),
      endTime: parseTimeString(showtime?.endTime),
      price: showtime?.price || 0,
      status: showtime?.status || 'ACTIVE',
    },
    validationSchema,
    onSubmit: (values) => {
      onSave({
        scheduleId: Number(values.scheduleId),
        roomId: Number(values.roomId),
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        price: Number(values.price),
        status: values.status,
      });
    },
  });

  const isLoading = isLoadingMovies || isLoadingCinemas || isLoadingBranches || isLoadingRooms;

  return (
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>
        {showtime ? t('showtimes.editShowtime') : t('showtimes.addShowtime')}
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="movie-label">{t('showtimes.movie')}</InputLabel>
              <Select
                labelId="movie-label"
                id="scheduleId"
                name="scheduleId"
                value={formik.values.scheduleId}
                label={t('showtimes.movie')}
                onChange={formik.handleChange}
                error={formik.touched.scheduleId && Boolean(formik.errors.scheduleId)}
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
                value={selectedCinemaId}
                label={t('showtimes.cinema')}
                onChange={(e) => {
                  const newCinemaId = e.target.value as number;
                  setSelectedCinemaId(newCinemaId);
                  setSelectedBranchId('');
                  formik.setFieldValue('roomId', '');
                }}
              >
                {cinemas.map((cinema: any) => (
                  <MenuItem key={cinema.id} value={cinema.id}>
                    {cinema.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedCinemaId}>
              <InputLabel id="branch-label">{t('showtimes.branch')}</InputLabel>
              <Select
                labelId="branch-label"
                id="branchId"
                name="branchId"
                value={selectedBranchId}
                label={t('showtimes.branch')}
                onChange={(e) => {
                  const newBranchId = e.target.value as number;
                  setSelectedBranchId(newBranchId);
                  formik.setFieldValue('roomId', '');
                }}
                disabled={!selectedCinemaId || branches.length === 0}
              >
                {branches.map((branch: any) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!selectedBranchId}>
              <InputLabel id="room-label">{t('showtimes.room')}</InputLabel>
              <Select
                labelId="room-label"
                id="roomId"
                name="roomId"
                value={formik.values.roomId}
                label={t('showtimes.room')}
                onChange={formik.handleChange}
                error={formik.touched.roomId && Boolean(formik.errors.roomId)}
                disabled={!selectedBranchId || rooms.length === 0}
              >
                {rooms.map((room: any) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} - {room.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label={t('showtimes.startTime')}
                value={formik.values.startTime}
                onChange={(date) => formik.setFieldValue('startTime', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.startTime && Boolean(formik.errors.startTime),
                    helperText: formik.touched.startTime && (formik.errors.startTime as string),
                  },
                }}
              />

              <DateTimePicker
                label={t('showtimes.endTime')}
                value={formik.values.endTime}
                onChange={(date) => formik.setFieldValue('endTime', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: formik.touched.endTime && Boolean(formik.errors.endTime),
                    helperText: formik.touched.endTime && (formik.errors.endTime as string),
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </form>
  );
};

export default ShowtimeForm; 