import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Chip, 
  Button, 
  CircularProgress,
  Paper,
  Divider,
  Rating,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  alpha,
  TextField,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails, fetchShowtimesByMovie, checkCanReview, submitReview } from '../../services/movieService';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import StarIcon from '@mui/icons-material/Star';
import MovieIcon from '@mui/icons-material/Movie';
import LanguageIcon from '@mui/icons-material/Language';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import TheatersIcon from '@mui/icons-material/Theaters';
import SpeedIcon from '@mui/icons-material/Speed';
import DebugPanel from '../../components/debug/DebugPanel';
import { MovieShowtimesResponse, BranchWithShowtimes, ShowtimeDetail } from '../../types/showtime';
import { Actor } from '../../types';
import { Review } from '../../types';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [directBooking, setDirectBooking] = React.useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = React.useState<boolean>(false);
  const [reviewRating, setReviewRating] = React.useState<number | null>(null);
  const [reviewComment, setReviewComment] = React.useState<string>('');
  const [reviewError, setReviewError] = React.useState<string>('');

  const formattedSelectedDate = formatDate(selectedDate);
  console.log("Formatted Date for API call:", formattedSelectedDate);

  const { 
    data: movie, 
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['movieDetails', id],
    queryFn: () => fetchMovieDetails(id as string),
    enabled: !!id
  });
  
  // Query for showtimes
  const { 
    data: showtimesData, 
    isLoading: isLoadingShowtimes, 
    isError: isErrorShowtimes, 
    error: errorShowtimes 
  } = useQuery<MovieShowtimesResponse, Error>({
    queryKey: ['movieShowtimes', id, formattedSelectedDate],
    queryFn: () => fetchShowtimesByMovie(id as string, formattedSelectedDate),
    enabled: !!id && !!movie && !!formattedSelectedDate,
  });
  
  // Query to check if user can review
  const { data: canReview, isLoading: isLoadingCanReview } = useQuery({
    queryKey: ['canReview', id],
    queryFn: () => checkCanReview(id as string),
    enabled: !!id && !!movie,
  });
  
  // Mutation for submitting a review
  const reviewMutation = useMutation({
    mutationFn: ({ movieId, rating, comment }: { movieId: string; rating: number; comment: string }) => 
      submitReview(movieId, rating, comment),
    onSuccess: (newReview) => {
      console.log('Review submitted successfully:', newReview);
      queryClient.invalidateQueries({ queryKey: ['movieDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['canReview', id]});
      setShowReviewForm(false);
      setReviewRating(null);
      setReviewComment('');
      setReviewError('');
    },
    onError: (err: Error) => {
      console.error('Error submitting review:', err);
      setReviewError(err.message || t('errors.somethingWentWrong'));
    }
  });

  const handleSubmitReview = () => {
    if (!id || reviewRating === null || reviewRating < 1 || reviewComment.trim() === '') {
      setReviewError(t('reviews.validationError'));
      return;
    }
    setReviewError('');
    reviewMutation.mutate({ movieId: id, rating: reviewRating, comment: reviewComment });
  };
  
  // Helper function to get color for age restriction
  const getAgeRestrictionColor = (restriction?: string) => {
    if (!restriction) return 'primary';
    if (restriction === 'P') return 'success';
    if (restriction === 'C13') return 'warning';
    if (restriction === 'C16') return 'error';
    if (restriction === 'C18') return 'error';
    return 'secondary';
  };
  
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (isError || !movie) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            {t('errors.fetchFailed', { entity: t('movies.movieDetails') })}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {(error as Error)?.message || t('errors.somethingWentWrong')}
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ mt: 2, mr: 2 }} 
            onClick={() => window.location.reload()}
          >
            {t('common.retry')}
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => navigate('/movies')}
            startIcon={<ArrowBackIcon />}
          >
            {t('common.backToMovies')}
          </Button>
        </Box>
      </Container>
    );
  }
  
  // Chuẩn hóa dữ liệu phim
  const title = movie.title || movie.name || "";
  const description = movie.description || movie.summary || "";
  const longDescription = movie.descriptionLong || description;
  const releaseDate = movie.releaseDate || movie.releasedDate || "";
  const posterUrl = movie.posterUrl || movie.imageSmallUrl || movie.imageLargeUrl || "";
  const movieStatus = movie.status === "SHOWING" ? "ACTIVE" : movie.status === "UPCOMING" ? "INACTIVE" : movie.status;
  const ageRestriction = movie.ageRestriction || (movie.ageLimit ? `C${movie.ageLimit}` : undefined);
  
  const ageRestrictionColor = getAgeRestrictionColor(ageRestriction);
  
  const reviews = movie.reviews || [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      {/* <DebugPanel /> */}
      
      <Button 
        variant="text" 
        color="primary" 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/movies')}
        sx={{ mb: 4, fontWeight: 'medium' }}
      >
        {t('common.backToMovies')}
      </Button>
      
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden', 
          mb: 4,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Grid container spacing={0}>
          {/* Movie Poster */}
          <Grid item xs={12} md={4} sx={{ position: 'relative' }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: { xs: 'auto', md: '100%' },
                objectFit: 'cover',
                display: 'block',
                borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
              }}
              src={posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={title}
            />
            
            {/* Status Badge - MoMo Style */}
            <Chip
              label={movieStatus === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')}
              color={movieStatus === 'ACTIVE' ? 'success' : 'info'}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            
            {/* Age Restriction Badge - MoMo Style */}
            {ageRestriction && (
              <Chip
                label={ageRestriction}
                color={ageRestrictionColor}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            )}
          </Grid>
          
          {/* Movie Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ 
                fontWeight: 'bold',
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}>
                {title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating value={movie.rating ? parseFloat(movie.rating) : 4} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {movie.rating ? `${movie.rating}/5.0` : '4.0/5.0'} ({Math.floor(Math.random() * 1000) + 100} {t('movies.ratings')})
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AccessTimeIcon />}
                  label={`${movie.duration} ${t('movies.minutes')}`} 
                  color="primary" 
                  variant="outlined"
                />
                {releaseDate && (
                  <Chip 
                    icon={<CalendarMonthIcon />}
                    label={new Date(releaseDate).toLocaleDateString('vi-VN')}
                    color="primary"
                    variant="outlined"
                  />
                )}
                <Chip 
                  icon={<LocalMoviesIcon />}
                  label={movieStatus === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')} 
                  color={movieStatus === 'ACTIVE' ? 'success' : 'warning'} 
                  variant="outlined"
                />
              </Box>
              
              {/* Book Ticket Button - MoMo Style (Prominent) */}
              {movieStatus === 'ACTIVE' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth={isMobile}
                    startIcon={<LocalActivityIcon sx={{ fontSize: '1.3rem' }} />}
                    onClick={() => navigate(`/book-tickets/${movie.id}`)}
                    sx={{ 
                      px: { xs: 3, sm: 6 },
                      py: 2,
                      fontSize: { xs: '1rem', sm: '1.2rem'},
                      fontWeight: '800',
                      borderRadius: 3,
                      textTransform: 'none',
                      background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.6)}`,
                        background: 'linear-gradient(45deg, #E6004D 30%, #E63939 90%)',
                      }
                    }}
                  >
                    {t('movies.bookTickets')}
                  </Button>
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
                {t('movies.description')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ 
                whiteSpace: 'pre-line',
                color: alpha(theme.palette.text.primary, 0.9),
                lineHeight: 1.7,
                fontSize: '1rem'
              }}>
                {longDescription}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Movie Info Section */}
      <Grid container spacing={4}>
        {/* Cast & Crew Information */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              height: '100%',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 'bold', 
              pb: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <GroupIcon color="primary" sx={{ mr: 1 }} />
              {t('movies.castAndCrew')}
            </Typography>
            
            {/* Directors */}
            {movie.director && (
              <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: alpha(theme.palette.primary.light, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 1,
                  color: theme.palette.primary.main
                }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('movies.director')}
                </Typography>
                <List>
                  {typeof movie.director === 'string' ? (
                    <ListItem 
                      sx={{ 
                        px: 1, 
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          alt={movie.director}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.3)}`
                          }}
                        >
                          {movie.director.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>{movie.director}</Typography>} 
                      />
                    </ListItem>
                  ) : Array.isArray(movie.director) && movie.director.map((director: string, index: number) => (
                    <ListItem 
                      key={index} 
                      sx={{ 
                        px: 1, 
                        py: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: alpha(theme.palette.primary.main, 0.04)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          alt={director}
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.3)}`
                          }}
                        >
                          {director.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="body1" sx={{ fontWeight: 'medium' }}>{director}</Typography>} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Actors */}
            {movie.actors && movie.actors.length > 0 && (
              <Box sx={{ 
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.secondary.light, 0.04),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
              }}>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 2,
                  color: theme.palette.secondary.dark
                }}>
                  <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('movies.actors')}
                </Typography>
                <Grid container spacing={2}>
                  {movie.actors.map((actor: Actor, index) => (
                    <Grid item xs={12} sm={6} key={actor.id || index}>
                      <Paper
                        elevation={0}
                        sx={{ 
                          display: 'flex',
                          p: 1,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.15)}`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            alt={actor.name} 
                            src={actor.profilePath}
                            sx={{
                              width: 56,
                              height: 56,
                              border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                              boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
                            }}
                          >
                            {!actor.profilePath && actor.name ? actor.name.charAt(0).toUpperCase() : null}
                          </Avatar>
                        </ListItemAvatar>
                        <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {actor.name}
                          </Typography>
                          {actor.character && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {actor.character}
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Movie Information */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              height: '100%',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 'bold', 
              pb: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <MovieIcon color="primary" sx={{ mr: 1 }} />
              {t('movies.additionalInfo')}
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 1, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <ListItemText 
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      {t('movies.genre')}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                      {movie.categories && movie.categories.length > 0 
                        ? movie.categories.map((cat: any) => cat.name).join(', ')
                        : 'Action, Adventure, Drama'}
                    </Typography>
                  }
                />
              </ListItem>
              
              {movie.language && (
                <ListItem sx={{ px: 1, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        {t('movies.language')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                        {movie.language}
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              
              {releaseDate && (
                <ListItem sx={{ px: 1, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        {t('movies.releaseDate')}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                        {new Date(releaseDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    }
                  />
                </ListItem>
              )}
              
              {ageRestriction && (
                <ListItem sx={{ px: 1, py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        {t('movies.ageRestriction')}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={ageRestriction} 
                          color={ageRestrictionColor}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    }
                  />
                </ListItem>
              )}
              
              <ListItem sx={{ px: 1, py: 1.5 }}>
                <ListItemText 
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      {t('movies.duration')}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                      {movie.duration} {t('movies.minutes')}
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Movie Trailer */}
      {movie.trailerUrl && (
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4, 
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.dark, 0.03)}, ${alpha(theme.palette.background.paper, 0.9)})`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
            }
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 'bold',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            background: `linear-gradient(to right, ${theme.palette.error.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            <TheatersIcon sx={{ mr: 1, color: theme.palette.error.main }} />
            {t('movies.trailer')}
          </Typography>
          
          <Box
            sx={{
              position: 'relative',
              mb: 2,
            }}
          >
            <Box 
              sx={{ 
                borderRadius: '16px', 
                overflow: 'hidden',
                position: 'relative',
                paddingTop: '56.25%', // 16:9 aspect ratio
                backgroundColor: 'black', // Background for the iframe container
                boxShadow: `0 16px 40px ${alpha('#000', 0.25)}`,
                border: `3px solid ${alpha(theme.palette.primary.dark, 0.1)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  borderRadius: '14px',
                  zIndex: 1,
                  pointerEvents: 'none',
                }
              }}
            >
              <Box
                component="iframe"
                src={
                  movie.trailerUrl.includes('youtube.com/embed') 
                    ? movie.trailerUrl 
                    : `https://www.youtube.com/embed/${movie.trailerUrl.split('v=')[1] || movie.trailerUrl}`
                }
                title={`${title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
            
            {/* Thêm tiêu đề trailer phim bên dưới */}
            <Typography variant="body1" align="center" sx={{ mt: 2, fontWeight: 'medium', color: theme.palette.text.secondary }}>
              {`${title} - ${t('movies.officialTrailer', 'Official Trailer')}`}
            </Typography>
          </Box>
        </Paper>
      )}
      
      {/* Showtimes Section - NEW */}
      {movie && movie.status === 'SHOWING' && (
        <>
          <Paper elevation={0} sx={{ mt: 4, p: { xs: 2, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <TheatersIcon color="primary" sx={{ mr: 1 }} />
                    {t('movies.availableShowtimes', 'Available Showtimes')}
                </Typography>
                
                <TextField
                  type="date"
                  label={t('common.selectDate', 'Select Date')}
                  value={formattedSelectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setSelectedDate(newDate);
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: {xs: '100%', sm: 'auto'}, maxWidth: 200 }}
                />
            </Box>

            {isLoadingShowtimes && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ml: 2}}>{t('loading.showtimes', 'Loading showtimes...')}</Typography>
              </Box>
            )}
            {isErrorShowtimes && (
              <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2, border: `1px solid ${theme.palette.error.main}`, bgcolor: alpha(theme.palette.error.light, 0.1) }}>
                <Typography color="error" sx={{ textAlign: 'center' }}>
                  {t('errors.fetchFailedDetailed', { entity: t('movies.showtimes', 'Showtimes'), message: (errorShowtimes as Error)?.message || t('errors.unknown', 'Unknown error') })}
                </Typography>
              </Paper>
            )}
            {showtimesData && showtimesData.branches && showtimesData.branches.length > 0 && !isLoadingShowtimes && !isErrorShowtimes && (
              <>
                {showtimesData.branches.map((branch: BranchWithShowtimes, branchIndex: number) => (
                  <Box key={branch.branchId} sx={{ mb: branchIndex < showtimesData.branches.length - 1 ? 3 : 0 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'medium' }}>{branch.branchName}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>{branch.address}</Typography>
                    {branch.hotline && <Typography variant="caption" color="text.secondary" sx={{mb:1, display: 'block'}}>{t('common.hotline', 'Hotline')}: {branch.hotline}</Typography>}

                    {branch.showtimes && branch.showtimes.length > 0 ? (
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        {branch.showtimes.map((st: ShowtimeDetail) => (
                          <Grid item key={`${st.scheduleId}-${st.roomId}-${st.scheduleTime}`}>
                            <Chip
                              label={`${st.scheduleTime} (${st.roomName || t('common.unknown', 'Unknown')})`}
                              variant="outlined"
                              clickable
                              onClick={() => navigate(`/book-tickets/${movie.id}?scheduleId=${st.scheduleId}&roomId=${st.roomId}&branchId=${branch.branchId}&date=${st.scheduleDate || formattedSelectedDate}&time=${st.scheduleTime}`)}
                              sx={{
                                borderColor: theme.palette.primary.light,
                                color: theme.palette.primary.dark,
                                fontWeight: 'medium',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  borderColor: theme.palette.primary.main,
                                }
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                        {t('movies.noShowtimesForBranchDay', 'No showtimes available for this branch on the selected date.')}
                      </Typography>
                    )}
                    {branchIndex < showtimesData.branches.length - 1 && (
                        <Divider sx={{ my: 3 }}/>
                    )}
                  </Box>
                ))}
              </>
            )}
            {showtimesData && (!showtimesData.branches || showtimesData.branches.length === 0) && !isLoadingShowtimes && !isErrorShowtimes && (
              <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontStyle: 'italic' }}>
                  {t('movies.noShowtimesForDay', 'No showtimes are currently available for this movie on the selected date.')}
                </Typography>
              </Box>
            )}
           </Paper>
        </>
      )}
      
      {/* Book Ticket Button (Bottom) - MoMo Style */}
      {movieStatus === 'ACTIVE' && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 5,
          mb: 3,
          position: 'relative'
        }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth={isMobile}
            startIcon={<LocalActivityIcon sx={{ fontSize: '1.5rem' }} />}
            onClick={() => {
              if (directBooking) {
                localStorage.setItem('directBooking', 'true');
                localStorage.setItem('lastMovieId', id as string);
              }
              navigate(`/book-tickets/${movie.id}`);
            }}
            sx={{ 
              px: 8,
              py: 2,
              fontSize: '1.3rem',
              fontWeight: '800',
              borderRadius: 3,
              textTransform: 'none',
              maxWidth: isMobile ? '90%' : 'md',
              background: directBooking 
                ? 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)' 
                : 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
              boxShadow: directBooking
                ? '0 10px 20px rgba(76, 175, 80, 0.3), 0 6px 6px rgba(76, 175, 80, 0.2)'
                : '0 10px 20px rgba(255, 46, 99, 0.3), 0 6px 6px rgba(255, 46, 99, 0.2)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: directBooking
                  ? '0 15px 30px rgba(76, 175, 80, 0.4), 0 10px 10px rgba(76, 175, 80, 0.2)'
                  : '0 15px 30px rgba(255, 46, 99, 0.4), 0 10px 10px rgba(255, 46, 99, 0.2)',
                background: directBooking
                  ? 'linear-gradient(45deg, #43A047 30%, #7CB342 90%)'
                  : 'linear-gradient(45deg, #E6004D 30%, #E63939 90%)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -15,
                left: -15,
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.5)',
                filter: 'blur(10px)',
                animation: 'floatingLight 4s infinite ease-in-out',
              },
              '@keyframes floatingLight': {
                '0%': { transform: 'translate(0%, 0%)' },
                '25%': { transform: 'translate(100%, 100%)' },
                '50%': { transform: 'translate(200%, 50%)' },
                '75%': { transform: 'translate(100%, 200%)' },
                '100%': { transform: 'translate(0%, 0%)' },
              }
            }}
          >
            {directBooking 
              ? t('movies.bookTicketsFast', 'Đặt vé nhanh') 
              : t('movies.bookTickets', 'Đặt vé')}
          </Button>
          
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tooltip title={t('movies.fastBookingExplanation', 'Đặt vé nhanh sẽ bỏ qua bước chọn rạp')}>
              <FormControlLabel
                control={
                  <Switch
                    checked={directBooking}
                    onChange={(e) => setDirectBooking(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 0.5, color: directBooking ? 'success.main' : 'text.secondary', fontSize: '1rem' }} />
                    <Typography variant="body2" color={directBooking ? 'success.main' : 'text.secondary'} sx={{ fontWeight: directBooking ? 'bold' : 'normal' }}>
                      {t('movies.fastBooking', 'Đặt vé nhanh (bỏ qua chọn rạp)')}
                    </Typography>
                  </Box>
                }
              />
            </Tooltip>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default MovieDetails;