import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, addDays, isWeekend, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Badge,
  alpha,
  useMediaQuery,
  SelectChangeEvent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import { fetchMovieDetails } from '../../services/movieService';
import { 
  fetchCities, 
  fetchCinemasByCity, 
  fetchShowtimes, 
  calculateTicketPrice,
  City,
  Cinema,
  Showtime
} from '../../services/cinemaService';

// Define our own Movie interface to avoid issues with imported types
interface MovieDetails {
  id: string;
  title: string;
  posterUrl: string;
  duration: number;
  ageRestriction?: string;
  genres?: string[];
}

// Use any for movieData to avoid type issues
interface MovieFromAPI {
  id: number | string;
  title: string;
  posterUrl: string;
  duration: number;
  ageRestriction?: string;
  genres?: string[];
  [key: string]: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Generate dates for the next 7 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    dates.push({
      date,
      dayName: format(date, 'EEE', { locale: vi }),
      dayNumber: format(date, 'd'),
      monthName: format(date, 'MMM', { locale: vi }),
      isWeekend: isWeekend(date),
      formatted: format(date, 'yyyy-MM-dd')
    });
  }
  
  return dates;
};

const CinemaSelection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  
  // State
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [showCinemas, setShowCinemas] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  
  // Generate dates list
  const dates = generateDates();
  
  // Fetch movie details
  const { data: movieData, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => fetchMovieDetails(movieId || ''),
    enabled: !!movieId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Safely handle data with proper default values - using any type to avoid type errors
  const movie = {
    id: (movieData as any)?.id?.toString() || '',
    title: (movieData as any)?.title || '',
    posterUrl: (movieData as any)?.posterUrl || '',
    duration: (movieData as any)?.duration || 0,
    ageRestriction: (movieData as any)?.ageRestriction,
    genres: Array.isArray((movieData as any)?.genres) ? (movieData as any)?.genres : [],
  };
  
  // Fetch cities
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
  
  const cities: City[] = citiesData || [];
  
  // Fetch cinemas by city
  const { data: cinemasData, isLoading: isLoadingCinemas } = useQuery({
    queryKey: ['cinemas', selectedCity],
    queryFn: () => fetchCinemasByCity(selectedCity),
    enabled: !!selectedCity,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
  
  const cinemas: Cinema[] = cinemasData || [];
  
  // Fetch showtimes for the selected cinema and movie
  const { data: showtimesData, isLoading: isLoadingShowtimes } = useQuery({
    queryKey: ['showtimes', selectedCinema?.id, movieId, selectedDate],
    queryFn: () => fetchShowtimes(selectedCinema?.id || '', movieId || '', selectedDate),
    enabled: !!selectedCinema && !!movieId && !!selectedDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const showtimes: Showtime[] = showtimesData || [];
  
  // Group showtimes by time slots (morning, afternoon, evening)
  const groupedShowtimes = React.useMemo(() => {
    const grouped = {
      morning: [] as Showtime[],   // Before 12:00
      afternoon: [] as Showtime[], // 12:00 - 17:59
      evening: [] as Showtime[]    // 18:00 onwards
    };
    
    showtimes.forEach((showtime: Showtime) => {
      const startTime = new Date(showtime.startTime);
      const hour = startTime.getHours();
      
      if (hour < 12) {
        grouped.morning.push(showtime);
      } else if (hour < 18) {
        grouped.afternoon.push(showtime);
      } else {
        grouped.evening.push(showtime);
      }
    });
    
    // Sort each group by time
    Object.keys(grouped).forEach(key => {
      grouped[key as keyof typeof grouped].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });
    
    return grouped;
  }, [showtimes]);
  
  // When cities data is loaded, default to first city
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      setSelectedCity(cities[0].id);
    }
  }, [cities, selectedCity]);
  
  // Reset selected cinema when city changes
  useEffect(() => {
    setSelectedCinema(null);
    setSelectedShowtime(null);
    setShowCinemas(true);
  }, [selectedCity]);
  
  // Reset selected showtime when date or cinema changes
  useEffect(() => {
    setSelectedShowtime(null);
  }, [selectedDate, selectedCinema]);
  
  // Handler for city change
  const handleCityChange = (event: SelectChangeEvent) => {
    setSelectedCity(event.target.value);
  };
  
  // Handler for cinema selection
  const handleCinemaSelect = (cinema: Cinema) => {
    setSelectedCinema(cinema);
    setShowCinemas(false);
  };
  
  // Handler for date selection
  const handleDateSelect = (index: number) => {
    setActiveDateIndex(index);
    setSelectedDate(dates[index].formatted);
  };
  
  // Handler for showtime selection
  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
  };
  
  // Handler for proceed to seat selection
  const handleProceedToSeats = () => {
    if (selectedShowtime && movieId) {
      navigate(`/select-seats/${movieId}/${selectedShowtime.id}`);
    }
  };
  
  // Format time from ISO string to HH:MM
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };
  
  if (isLoadingMovie) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('common.loading')}
        </Typography>
      </Container>
    );
  }
  
  if (!movie) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">
          {t('movies.notFound')}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/movies')}
        >
          {t('common.backToMovies')}
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Movie Info Banner */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(to right, ${alpha(theme.palette.primary.dark, 0.9)}, ${alpha(theme.palette.primary.main, 0.6)})`,
          color: 'white',
          borderRadius: 2
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={3} md={2}>
            <Box
              component="img"
              src={movie.posterUrl}
              alt={movie.title}
              sx={{
                width: '100%',
                borderRadius: 1,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            />
          </Grid>
          <Grid item xs={12} sm={9} md={10}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              {movie.title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {(movie as any).genres && (movie as any).genres.map((genre: string, index: number) => (
                <Chip 
                  key={index}
                  label={genre} 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#fff', 0.2),
                    color: 'white',
                    '&:hover': { bgcolor: alpha('#fff', 0.3) }
                  }} 
                />
              ))}
              <Chip 
                icon={<AccessTimeIcon sx={{ color: 'white !important' }} />}
                label={`${movie.duration} ${t('movies.minutes')}`}
                size="small"
                sx={{ 
                  bgcolor: alpha('#fff', 0.2),
                  color: 'white',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
              {movie.ageRestriction && (
                <Chip 
                  label={movie.ageRestriction}
                  size="small"
                  sx={{ 
                    bgcolor: movie.ageRestriction === 'P' ? alpha(theme.palette.success.main, 0.7) : alpha(theme.palette.error.main, 0.7),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}
            </Box>
            <Typography variant="body1" paragraph>
              {t('booking.selectCinemaDescription')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* City Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationOnIcon sx={{ mr: 1 }} />
          {t('booking.selectCity')}
        </Typography>
        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel id="city-select-label">{t('booking.city')}</InputLabel>
          <Select
            labelId="city-select-label"
            id="city-select"
            value={selectedCity}
            onChange={handleCityChange}
            label={t('booking.city')}
            disabled={isLoadingCities}
          >
            {cities.map((city: City) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      {/* Date Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarMonthIcon sx={{ mr: 1 }} />
          {t('booking.selectDate')}
        </Typography>
        <Box 
          sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: 1, 
            pb: 1,
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              borderRadius: 4,
            },
          }}
        >
          {dates.map((dateObj, index) => (
            <Card 
              key={dateObj.formatted} 
              elevation={activeDateIndex === index ? 3 : 1}
              sx={{ 
                minWidth: 80, 
                cursor: 'pointer',
                border: activeDateIndex === index ? `2px solid ${theme.palette.primary.main}` : 'none',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
              onClick={() => handleDateSelect(index)}
            >
              <Box 
                sx={{ 
                  p: 1.5, 
                  textAlign: 'center',
                  bgcolor: activeDateIndex === index ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                }}
              >
                <Typography 
                  variant="caption" 
                  component="div" 
                  fontWeight={activeDateIndex === index ? 'bold' : 'normal'}
                >
                  {dateObj.dayName}
                </Typography>
                <Typography 
                  variant="h5" 
                  component="div" 
                  fontWeight="bold"
                  color={dateObj.isWeekend ? 'error' : (activeDateIndex === index ? 'primary' : 'text.primary')}
                >
                  {dateObj.dayNumber}
                </Typography>
                <Typography 
                  variant="caption" 
                  component="div"
                  fontWeight={activeDateIndex === index ? 'bold' : 'normal'}
                >
                  {dateObj.monthName}
                </Typography>
                {index === 0 && (
                  <Chip 
                    label={t('booking.today')} 
                    size="small" 
                    color="primary" 
                    sx={{ mt: 0.5, fontSize: '0.7rem' }} 
                  />
                )}
                {dateObj.isWeekend && index !== 0 && (
                  <Chip 
                    label={t('booking.weekend')} 
                    size="small" 
                    color="error" 
                    sx={{ mt: 0.5, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            </Card>
          ))}
        </Box>
      </Paper>
      
      {/* Cinemas List */}
      {selectedCity && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="h2" color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1 }} />
              {t('booking.selectCinema')}
            </Typography>
            {selectedCinema && !showCinemas && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setShowCinemas(true)}
              >
                {t('booking.changeCinema')}
              </Button>
            )}
          </Box>
          
          {isLoadingCinemas ? (
            <Box sx={{ py: 2 }}>
              {[1, 2, 3].map((n) => (
                <Box key={n} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              ))}
            </Box>
          ) : (
            <>
              {showCinemas ? (
                <Grid container spacing={3}>
                  {cinemas.map((cinema: Cinema) => (
                    <Grid item xs={12} md={6} key={cinema.id}>
                      <Card 
                        sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          height: '100%',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)'
                          }
                        }}
                      >
                        <CardActionArea onClick={() => handleCinemaSelect(cinema)}>
                          <CardMedia
                            component="img"
                            height="140"
                            image={cinema.imageUrl || 'https://cdn.pixabay.com/photo/2017/11/24/10/43/ticket-2974645_1280.jpg'}
                            alt={cinema.name}
                          />
                          <CardContent>
                            <Typography variant="h6" component="div" gutterBottom>
                              {cinema.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                mb: 1
                              }}
                            >
                              <LocationOnIcon fontSize="small" sx={{ mr: 0.5, mt: 0.25 }} />
                              {cinema.address}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('booking.basePrice')}: {formatCurrency(cinema.basePrice)}
                            </Typography>
                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                size="small" 
                                endIcon={<KeyboardArrowRightIcon />}
                                color="primary"
                              >
                                {t('booking.selectCinema')}
                              </Button>
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                  
                  {cinemas.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          {t('booking.noCinemasFound')}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              ) : selectedCinema && (
                <Box>
                  <Card sx={{ mb: 3 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={selectedCinema.imageUrl || 'https://cdn.pixabay.com/photo/2017/11/24/10/43/ticket-2974645_1280.jpg'}
                      alt={selectedCinema.name}
                    />
                    <CardContent>
                      <Typography variant="h5" component="div" gutterBottom>
                        {selectedCinema.name}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start',
                          mb: 2 
                        }}
                      >
                        <LocationOnIcon sx={{ mr: 0.5, mt: 0.25 }} />
                        {selectedCinema.address}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="h6" component="div" gutterBottom color="primary">
                        {t('booking.showtimes')} - {format(new Date(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi })}
                      </Typography>
                      
                      {isLoadingShowtimes ? (
                        <Box sx={{ py: 2 }}>
                          {[1, 2, 3].map((n) => (
                            <Skeleton key={n} variant="rectangular" height={60} sx={{ borderRadius: 1, mb: 2 }} />
                          ))}
                        </Box>
                      ) : (
                        <>
                          {Object.entries(groupedShowtimes).map(([timeSlot, times]) => {
                            if (times.length === 0) return null;
                            
                            return (
                              <Box key={timeSlot} sx={{ mb: 3 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    mb: 1.5, 
                                    color: theme.palette.text.secondary,
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                >
                                  <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                                  {timeSlot === 'morning' && t('booking.morningShowtimes')}
                                  {timeSlot === 'afternoon' && t('booking.afternoonShowtimes')}
                                  {timeSlot === 'evening' && t('booking.eveningShowtimes')}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                  {times.map((showtime) => (
                                    <Button
                                      key={showtime.id}
                                      variant={selectedShowtime?.id === showtime.id ? "contained" : "outlined"}
                                      color={selectedShowtime?.id === showtime.id ? "primary" : "inherit"}
                                      onClick={() => handleShowtimeSelect(showtime)}
                                      disabled={showtime.availableSeats === 0}
                                      sx={{ 
                                        minWidth: 100,
                                        position: 'relative',
                                        '&:hover': {
                                          bgcolor: selectedShowtime?.id === showtime.id 
                                            ? theme.palette.primary.main 
                                            : alpha(theme.palette.primary.main, 0.1)
                                        }
                                      }}
                                    >
                                      <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle1" component="div">
                                          {formatTime(showtime.startTime)}
                                        </Typography>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                          {formatCurrency(showtime.price)}
                                        </Typography>
                                        <Typography variant="caption" display="block" color={
                                          showtime.availableSeats > 30 
                                            ? "success.main" 
                                            : showtime.availableSeats > 10 
                                              ? "warning.main" 
                                              : "error.main"
                                        }>
                                          {showtime.availableSeats} {t('booking.seatsLeft')}
                                        </Typography>
                                      </Box>
                                      
                                      {showtime.isWeekend && (
                                        <Chip 
                                          label={t('booking.weekend')}
                                          size="small"
                                          color="error"
                                          sx={{ 
                                            position: 'absolute',
                                            top: -8,
                                            right: -10,
                                            transform: 'scale(0.8)',
                                            fontSize: '0.6rem'
                                          }}
                                        />
                                      )}
                                    </Button>
                                  ))}
                                </Box>
                              </Box>
                            );
                          })}
                          
                          {showtimes.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                              <Typography variant="body1" color="text.secondary">
                                {t('booking.noShowtimesAvailable')}
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}
                      
                      {selectedCinema.priceVariations && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" color="primary" gutterBottom>
                            {t('booking.priceVariations')}
                          </Typography>
                          <Grid container spacing={2}>
                            {selectedCinema.priceVariations.weekend && (
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2">
                                  {t('booking.weekend')}: +{selectedCinema.priceVariations.weekend}%
                                </Typography>
                              </Grid>
                            )}
                            {selectedCinema.priceVariations.holiday && (
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2">
                                  {t('booking.holiday')}: +{selectedCinema.priceVariations.holiday}%
                                </Typography>
                              </Grid>
                            )}
                            {selectedCinema.priceVariations.evening && (
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2">
                                  {t('booking.evening')}: +{selectedCinema.priceVariations.evening}%
                                </Typography>
                              </Grid>
                            )}
                            {selectedCinema.priceVariations.vip && (
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2">
                                  {t('booking.vipSeat')}: +{selectedCinema.priceVariations.vip}%
                                </Typography>
                              </Grid>
                            )}
                            {selectedCinema.priceVariations.couple && (
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2">
                                  {t('booking.coupleSeat')}: +{selectedCinema.priceVariations.couple}%
                                </Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              )}
            </>
          )}
        </Paper>
      )}
      
      {/* Booking Summary & Action Button */}
      {selectedShowtime && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mt: 4, 
            position: 'sticky', 
            bottom: 16, 
            zIndex: 10,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">
                    {selectedCinema?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarMonthIcon color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">
                    {format(new Date(selectedDate), 'dd/MM/yyyy')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon color="primary" sx={{ mr: 0.5 }} />
                  <Typography variant="body1">
                    {formatTime(selectedShowtime.startTime)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                startIcon={<EventSeatIcon />}
                fullWidth={isMobile}
                onClick={handleProceedToSeats}
                disabled={!selectedShowtime}
              >
                {t('booking.selectSeats')}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default CinemaSelection; 