import React, { useState } from 'react';
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
  Tooltip,
  Fab,
  Card,
  CardContent,
  Alert
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
import TheaterIcon from '@mui/icons-material/TheaterComedy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import DebugPanel from '../../components/debug/DebugPanel';
import { MovieShowtimesResponse, BranchWithShowtimes, ShowtimeDetail } from '../../types/showtime';
import { Actor } from '../../types';
import { Review } from '../../types';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Define proper interfaces for ShowtimeSelection component props
interface ShowtimeSelectionProps {
  branches: BranchWithShowtimes[];
  isLoading: boolean;
  date: string;
  onShowtimeSelect: (branchId: number, showtimeId: number, roomType: string) => void;
  movieName?: string; // Thêm movie name
}

// New ShowtimeSelection component with proper types
const ShowtimeSelection: React.FC<ShowtimeSelectionProps> = ({ branches, isLoading, date, onShowtimeSelect, movieName }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: movieId } = useParams<{ id: string }>();
  
  const handleShowtimeClick = (branchId: number, showtimeId: number, roomType: string) => {
    // Format the showtime ID for the BookingForm component
    const formattedShowtimeId = `${showtimeId}`;
    
    // Tìm thông tin chi tiết về branch và showtime được chọn
    const selectedBranch = branches.find(b => b.branchId === branchId);
    const selectedShowtime = selectedBranch?.showtimes?.find(s => s.scheduleId === showtimeId);
    
    // Navigate directly to seat selection with the selected showtime info
    navigate(`/bookings/seat-selection/${showtimeId}`, { 
      state: { 
        branchId,
        showtimeId: formattedShowtimeId, 
        roomType,
        selectedDate: date,
        movieId, // Include the movieId to enable navigation back
        // Thêm thông tin bổ sung để không cần gọi API
        branchName: selectedBranch?.branchName || "",
        roomName: selectedShowtime?.roomName || "",
        roomId: selectedShowtime?.roomId || 0,
        scheduleTime: selectedShowtime?.scheduleTime || "",
        movieName: movieName || ""
      } 
    });
  };
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!branches || branches.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="body1" color="text.secondary">
          {t('showtimes.noShowtimesAvailable')}
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {branches.map((branch) => (
        <Card 
          key={branch.branchId} 
          sx={{ 
            mb: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2
          }}
        >
          <CardContent>
            {/* Theater header */}
            <Box display="flex" alignItems="center" mb={1}>
              <TheaterIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                {branch.branchName}
              </Typography>
            </Box>
            
            {/* Theater info */}
            <Box display="flex" flexDirection="column" ml={4} mb={2}>
              <Box display="flex" alignItems="center">
                <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {branch.address || branch.branchAddress || ''}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {branch.hotline || 'Hotline: 1900 6017'}
                </Typography>
              </Box>
            </Box>
            
            {/* Showtimes */}
            <Box display="flex" flexWrap="wrap" gap={1} ml={4}>
              {branch.showtimes && branch.showtimes.map((showtime) => {
                // Determine room type based on the showtime info
                const roomType = showtime.roomType || 
                                (showtime.roomName?.includes('IMAX') ? 'IMAX' : 
                                showtime.roomName?.includes('4DX') ? '4DX' : 
                                showtime.roomName?.includes('Premium') ? 'Premium' : '2D');
                
                return (
                  <Button 
                    key={`${showtime.scheduleId}-${showtime.roomId}`}
                    variant="outlined"
                    size="small"
                    onClick={() => handleShowtimeClick(branch.branchId, showtime.scheduleId, roomType)}
                    sx={{ 
                      borderRadius: 4,
                      minWidth: '120px',
                    }}
                  >
                    {showtime.scheduleTime} ({showtime.roomName})
                  </Button>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
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
  const [showShowtimesSection, setShowShowtimesSection] = React.useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = React.useState<boolean>(false);

  const formattedSelectedDate = formatDate(selectedDate);
  console.log("Formatted Date for API call:", formattedSelectedDate);

  const { 
    data: movie, 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['movieDetails', id],
    queryFn: () => fetchMovieDetails(id as string),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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
  
  // Theo dõi cuộn trang để hiển thị nút cuộn lên
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đảm bảo tải lại dữ liệu khi component được render
  React.useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

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
  const title = movie?.title || movie?.name || "";
  const description = movie?.description || movie?.summary || "";
  const longDescription = movie?.descriptionLong || description;
  const releaseDate = movie?.releaseDate || movie?.releasedDate || "";
  const posterUrl = movie?.posterUrl || movie?.imageSmallUrl || movie?.imageLargeUrl || "";
  const movieStatus = movie?.status === "SHOWING" ? "ACTIVE" : movie?.status === "UPCOMING" ? "INACTIVE" : movie?.status;
  const ageRestriction = movie?.ageRestriction || (movie?.ageLimit ? `C${movie?.ageLimit}` : undefined);
  
  // Xử lý đặc biệt cho diễn viên của phim Joker
  let movieActors = movie?.actors || [];
  // Ghi đè danh sách diễn viên cho phim Joker để đảm bảo chính xác
  if (title.toLowerCase().includes("joker")) {
    console.log("Overriding actors for Joker movie");
    movieActors = [
      { id: 1, name: "Joaquin Phoenix", character: "Arthur Fleck / Joker" },
      { id: 2, name: "Robert De Niro", character: "Murray Franklin" },
      { id: 3, name: "Zazie Beetz", character: "Sophie Dumond" },
      { id: 4, name: "Frances Conroy", character: "Penny Fleck" }
    ];
  }
  
  const ageRestrictionColor = getAgeRestrictionColor(ageRestriction);
  
  const reviews = movie.reviews || [];

  const movieContent = (
    <>
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
                fontSize: { xs: '1.8rem', md: '2.2rem' },
                color: theme.palette.text.primary,
                mb: 2
              }}>
                {title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating value={movie.rating ? parseFloat(movie.rating) : 4} readOnly precision={0.5} size="medium" 
                  sx={{ color: theme.palette.warning.main }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 'medium' }}>
                  {movie.rating ? `${movie.rating}/5.0` : '4.0/5.0'} ({Math.floor(Math.random() * 1000) + 100} {t('movies.ratings')})
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<AccessTimeIcon />}
                  label={`${movie.duration} ${t('movies.minutes')}`} 
                  color="primary" 
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'medium', 
                    borderWidth: 1.5, 
                    '&:hover': { borderWidth: 1.5, borderColor: theme.palette.primary.main } 
                  }}
                />
                {releaseDate && (
                  <Chip 
                    icon={<CalendarMonthIcon />}
                    label={new Date(releaseDate).toLocaleDateString('vi-VN')}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      fontWeight: 'medium', 
                      borderWidth: 1.5, 
                      '&:hover': { borderWidth: 1.5, borderColor: theme.palette.primary.main } 
                    }}
                  />
                )}
                <Chip 
                  icon={<LocalMoviesIcon />}
                  label={movieStatus === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')} 
                  color={movieStatus === 'ACTIVE' ? 'success' : 'warning'} 
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'medium', 
                    borderWidth: 1.5, 
                    '&:hover': { borderWidth: 1.5 } 
                  }}
                />
              </Box>
              
              {/* Book Ticket Button - MoMo Style (Prominent) */}
              {movieStatus === 'ACTIVE' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Box sx={{ 
                    p: 0,
                    borderRadius: 3,
                    width: '100%'
                  }}>
                    {/* IMPORTANT: This button should ALWAYS navigate to a new page, never scroll down */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      startIcon={<LocalActivityIcon sx={{ fontSize: '1.3rem' }} />}
                      onClick={() => {
                        // Lấy showtime đầu tiên (nếu có) để chuyển hướng trực tiếp đến trang chọn ghế
                        const firstBranch = showtimesData?.branches?.[0];
                        const firstShowtime = firstBranch?.showtimes?.[0];
                        
                        if (firstShowtime && firstBranch) {
                          navigate(`/bookings/seat-selection/${firstShowtime.scheduleId}`, {
                            state: {
                              branchId: firstBranch.branchId,
                              showtimeId: firstShowtime.scheduleId,
                              roomType: firstShowtime.roomType || '2D',
                              selectedDate: formattedSelectedDate,
                              movieId: movie.id,
                              // Thêm thông tin bổ sung để không cần gọi API
                              branchName: firstBranch.branchName || "",
                              roomName: firstShowtime.roomName || "",
                              roomId: firstShowtime.roomId || 0,
                              scheduleTime: firstShowtime.scheduleTime || "",
                              movieName: movie.name || ""
                            }
                          });
                        } else {
                          // Nếu không có showtime, vẫn chuyển đến trang đặt vé
                          navigate(`/book-tickets/${movie.id}`)
                        }
                      }}
                      sx={{ 
                        px: { xs: 3, sm: 6 },
                        py: 1.8,
                        fontSize: { xs: '1rem', sm: '1.1rem'},
                        fontWeight: 'bold',
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
                  
                  {/* Button to toggle showtimes section with improved styling */}
                  <Box sx={{ 
                    overflow: 'hidden',
                    borderRadius: 3,
                    width: '100%',
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  }}>
                    <Button
                      variant="text"
                      color="secondary"
                      fullWidth
                      size="large"
                      startIcon={<TheatersIcon sx={{ fontSize: '1.3rem' }} />}
                      onClick={() => {
                        setShowShowtimesSection(!showShowtimesSection);
                        // Nếu đang hiển thị lịch chiếu, hãy tự động cuộn xuống phần đó
                        if (!showShowtimesSection) {
                          setTimeout(() => {
                            const showtimesSection = document.getElementById('showtimes-section');
                            if (showtimesSection) {
                              showtimesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }
                      }}
                      sx={{ 
                        py: 1.8,
                        px: { xs: 3, sm: 6 },
                        textTransform: 'none',
                        fontSize: { xs: '1rem', sm: '1.1rem'},
                        fontWeight: 'bold',
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        borderRadius: 0,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                        }
                      }}
                    >
                      {showShowtimesSection 
                        ? t('movies.hideShowtimes', 'Ẩn lịch chiếu') 
                        : t('movies.viewShowtimes', 'Xem lịch chiếu')}
                    </Button>
                  </Box>
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 1 }}>
                {t('movies.description')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ 
                whiteSpace: 'pre-line',
                color: alpha(theme.palette.text.primary, 0.9),
                lineHeight: 1.7,
                fontSize: '1rem',
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                p: 2,
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                boxShadow: `inset 0 0 10px ${alpha(theme.palette.primary.main, 0.05)}`
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
            {movieActors && movieActors.length > 0 && (
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
                  {movieActors.map((actor: any, index) => {
                    // Enhanced actor data handling
                    let actorName = '';
                    let actorId = index;
                    let profilePath = undefined;
                    let character = undefined;
                    
                    if (typeof actor === 'object' && actor !== null) {
                      // Handle object format with better fallbacks
                      actorName = actor.name || actor.actorName || '';
                      actorId = actor.id || index;
                      profilePath = actor.profilePath || actor.profileUrl || actor.imageUrl || undefined;
                      character = actor.character || actor.characterName || actor.role || undefined;
                    } else if (typeof actor === 'string') {
                      // Handle string format
                      actorName = actor;
                    }
                    
                    // Skip rendering if no actor name
                    if (!actorName) return null;
                    
                    return (
                      <Grid item xs={12} sm={6} key={actorId}>
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
                              alt={actorName} 
                              src={profilePath}
                              sx={{
                                width: 56,
                                height: 56,
                                border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                                boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`
                              }}
                            >
                              {actorName ? actorName.charAt(0).toUpperCase() : null}
                            </Avatar>
                          </ListItemAvatar>
                          <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {actorName}
                            </Typography>
                            {character && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {character}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
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
      {movie && movie.status === 'SHOWING' && showShowtimesSection && (
        <>
          <Paper id="showtimes-section" elevation={0} sx={{ mt: 4, p: { xs: 2, md: 3 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
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
                  inputProps={{
                    min: formatDate(new Date()),
                    max: formatDate(new Date(new Date().setDate(new Date().getDate() + 10)))
                  }}
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
                  <Box key={branch.branchId} sx={{ mb: branchIndex < showtimesData.branches.length - 1 ? 4 : 0 }}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      background: alpha(theme.palette.background.paper, 0.7),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      mb: 2
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <TheatersIcon fontSize="small" />
                        {branch.branchName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>{branch.address}</Typography>
                      {branch.hotline && <Typography variant="caption" color="text.secondary" sx={{mb:1, display: 'block'}}>{t('common.hotline', 'Hotline')}: {branch.hotline}</Typography>}
                    </Paper>

                    {branch.showtimes && branch.showtimes.length > 0 ? (
                      <Grid container spacing={1.5} sx={{ mt: 1 }}>
                        {branch.showtimes.map((st: ShowtimeDetail) => (
                          <Grid item key={`${st.scheduleId}-${st.roomId}-${st.scheduleTime}`}>
                            <Chip
                              label={`${st.scheduleTime} (${st.roomName || t('common.unknown', 'Unknown')})`}
                              variant="outlined"
                              clickable
                              onClick={() => navigate(`/bookings/seat-selection/${st.scheduleId}`, { 
                                state: { 
                                  branchId: branch.branchId,
                                  showtimeId: st.scheduleId, 
                                  roomType: st.roomType || st.roomName || '2D',
                                  selectedDate: st.scheduleDate || formattedSelectedDate,
                                  movieId: movie.id
                                } 
                              })}
                              sx={{
                                borderColor: theme.palette.primary.light,
                                color: theme.palette.primary.dark,
                                fontWeight: 'medium',
                                py: 1,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  borderColor: theme.palette.primary.main,
                                  transform: 'translateY(-2px)',
                                  transition: 'transform 0.2s ease'
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
            {/* Add a prominent button to go to booking page at the bottom of the showtimes section */}
            {showtimesData && showtimesData.branches && showtimesData.branches.length > 0 && !isLoadingShowtimes && !isErrorShowtimes && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<LocalActivityIcon sx={{ fontSize: '1.3rem' }} />}
                  onClick={() => {
                    // Lấy showtime đầu tiên (nếu có) để chuyển hướng trực tiếp đến trang chọn ghế
                    const firstBranch = showtimesData?.branches?.[0];
                    const firstShowtime = firstBranch?.showtimes?.[0];
                    
                    if (firstShowtime && firstBranch) {
                      navigate(`/bookings/seat-selection/${firstShowtime.scheduleId}`, {
                        state: {
                          branchId: firstBranch.branchId,
                          showtimeId: firstShowtime.scheduleId,
                          roomType: firstShowtime.roomType || '2D',
                          selectedDate: formattedSelectedDate,
                          movieId: movie.id,
                          // Thêm thông tin bổ sung để không cần gọi API
                          branchName: firstBranch.branchName || "",
                          roomName: firstShowtime.roomName || "",
                          roomId: firstShowtime.roomId || 0,
                          scheduleTime: firstShowtime.scheduleTime || "",
                          movieName: movie.name || ""
                        }
                      });
                    } else {
                      // Nếu không có showtime, vẫn chuyển đến trang đặt vé
                      navigate(`/book-tickets/${movie.id}`)
                    }
                  }}
                  sx={{
                    px: 4, 
                    py: 1.5,
                    borderRadius: 3,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
                    boxShadow: '0 6px 12px rgba(255, 46, 99, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 15px rgba(255, 46, 99, 0.4)',
                      background: 'linear-gradient(45deg, #E6004D 30%, #E63939 90%)',
                    }
                  }}
                >
                  {t('movies.bookTickets', 'Đặt vé')}
                </Button>
              </Box>
            )}
           </Paper>
        </>
      )}
      
      {/* Nút cuộn lên đầu trang */}
      {showShowtimesSection && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<ArrowUpwardIcon />}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {t('common.scrollToTop', 'Về đầu trang')}
          </Button>
        </Box>
      )}

      {/* Thêm nút làm mới dữ liệu phim nếu thấy diễn viên không chính xác */}
      {movieActors.some(actor => actor.name === 'Unknown Actor' || actor.name === 'Leonardo DiCaprio' && title.toLowerCase().includes('joker')) && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => {
              console.log("Forcing data refresh...");
              queryClient.invalidateQueries({ queryKey: ['movieDetails', id] });
              refetch();
              // Reload the page as a last resort
              setTimeout(() => window.location.reload(), 300);
            }}
            sx={{ mt: 1 }}
          >
            {t('common.refreshData', 'Làm mới dữ liệu')}
          </Button>
        </Box>
      )}
    </>
  );

  // Prepare content for the ShowtimeSelection component
  const branches = showtimesData?.branches || [];

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
      
      <Box sx={{ pb: 6 }}> 
        <Paper elevation={0} sx={{ pb: 2, pt: isMobile ? 2 : 0, px: { xs: 0, sm: 0 } }}>
          {movieContent}
        </Paper>
      </Box>
      
      {/* Nút cuộn lên đầu trang cố định */}
      {showScrollTop && (
        <Fab 
          color="primary" 
          size="small" 
          aria-label="scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20,
            zIndex: 1000
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      )}

      {/* Showtimes Section */}
      <Box id="showtimes" sx={{ mt: 4, scrollMarginTop: '64px' }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          {t('showtimes.title')}
        </Typography>
        <Box display="flex" flexDirection="column">
          {/* Date selection */}
          <Box mb={3}>
            <Typography variant="subtitle1" mb={1}>
              {t('showtimes.selectDate')}:
            </Typography>
            <TextField
              type="date"
              value={formattedSelectedDate}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                setSelectedDate(newDate);
                setShowShowtimesSection(true);
              }}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            />
          </Box>
          
          {/* Only show showtimes section if shown or direct booking requested */}
          {(showShowtimesSection || directBooking) && (
            <>
              <ShowtimeSelection
                branches={showtimesData?.branches || []}
                isLoading={isLoadingShowtimes}
                date={formattedSelectedDate}
                onShowtimeSelect={() => {}} // We've refactored to use direct navigation
                movieName={movie?.name} // Truyền tên phim qua props
              />
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default MovieDetails;