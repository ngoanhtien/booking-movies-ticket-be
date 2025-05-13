import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Box, 
  TextField, 
  InputAdornment,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Pagination,
  Chip,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  Paper,
  Divider,
  Rating as MuiRating,
  alpha,
  Skeleton,
  Badge,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { fetchMovies, fetchShowingMovies, fetchUpcomingMovies, MovieFilters } from '../../services/movieService';
import { Movie } from '../../types';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PublicIcon from '@mui/icons-material/Public';
import HdIcon from '@mui/icons-material/Hd';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';

const MovieList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [page, setPage] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState<MovieFilters>({
    search: '',
    status: 'SHOWING',
    genre: ''
  });
  
  // Fetch all movies with pagination and filters
  const { 
    data: moviesData, 
    isLoading: isAllMoviesLoading,
    isError: isAllMoviesError,
    error: allMoviesError
  } = useQuery({
    queryKey: ['movies', page, filters],
    queryFn: () => fetchMovies(page, 12, filters),
    enabled: tabValue === 0
  });
  
  // Fetch showing movies
  const { 
    data: showingMovies, 
    isLoading: isShowingLoading,
    isError: isShowingError,
    error: showingError
  } = useQuery({
    queryKey: ['showingMovies'],
    queryFn: fetchShowingMovies,
    enabled: tabValue === 1
  });
  
  // Fetch upcoming movies
  const { 
    data: upcomingMovies, 
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
    error: upcomingError
  } = useQuery({
    queryKey: ['upcomingMovies'],
    queryFn: fetchUpcomingMovies,
    enabled: tabValue === 2
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: event.target.value });
    setPage(0);
  };
  
  const handleGenreChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilters({ ...filters, genre: event.target.value as string });
    setPage(0);
  };
  
  const handleMovieClick = (movieId: number) => {
    navigate(`/movies/${movieId}`);
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
  
  // Helper to get background color for age restriction
  const getAgeRestrictionBackground = (restriction?: string) => {
    if (!restriction) return theme.palette.primary.main;
    if (restriction === 'P') return theme.palette.success.main;
    if (restriction === 'C13') return theme.palette.warning.main;
    if (restriction === 'C16') return theme.palette.error.main;
    if (restriction === 'C18') return '#880E4F'; // deep purple for C18
    return theme.palette.secondary.main;
  };
  
  // Helper to get age restriction tooltip text
  const getAgeRestrictionTooltip = (restriction?: string) => {
    if (!restriction) return '';
    if (restriction === 'P') return 'Phù hợp mọi lứa tuổi';
    if (restriction === 'C13') return 'Cấm khán giả dưới 13 tuổi';
    if (restriction === 'C16') return 'Cấm khán giả dưới 16 tuổi';
    if (restriction === 'C18') return 'Cấm khán giả dưới 18 tuổi';
    return restriction;
  };
  
  // Helper to generate random rating data for demo purposes
  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1); // Random between 3.0 and 5.0
  };

  // Helper to get the appropriate rating value
  const getRatingValue = (movie: Movie) => {
    if (movie.rating) return parseFloat(movie.rating);
    return parseFloat(getRandomRating());
  };

  // Helper to format release date
  const formatReleaseDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };
  
  const renderMovieCard = (movie: Movie) => {
    const ageRestrictionColor = getAgeRestrictionColor(movie.ageRestriction || 
      (movie.ageLimit ? `C${movie.ageLimit}` : undefined));
    
    // Điều chỉnh dữ liệu từ API để phù hợp với UI
    const title = movie.title || movie.name || "";
    const description = movie.description || movie.summary || "";
    const releaseDate = movie.releaseDate || movie.releasedDate || "";
    const posterUrl = movie.posterUrl || movie.imageSmallUrl || movie.imageLargeUrl || "";
    const movieStatus = movie.status === "SHOWING" ? "ACTIVE" : movie.status === "UPCOMING" ? "INACTIVE" : movie.status;
    const ratingValue = getRatingValue(movie);
    const ageRestriction = movie.ageRestriction || (movie.ageLimit ? `C${movie.ageLimit}` : "P");
    const reviewCount = Math.floor(Math.random() * 1000) + 100; // Mock review count
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              cursor: 'pointer',
              boxShadow: '0 16px 32px rgba(0,0,0,0.2)',
              '& .MuiCardMedia-root': {
                transform: 'scale(1.05)',
              },
              '& .poster-overlay': {
                opacity: 1,
              },
              '& .movie-status-badge': {
                transform: 'translateY(-3px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              },
              '& .age-restriction-badge': {
                transform: 'translateY(-3px) scale(1.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }
            }
          }}
          onClick={() => handleMovieClick(movie.id)}
        >
          {/* Status Badge - Enhanced with animation */}
          {movieStatus && (
            <Chip
              className="movie-status-badge"
              label={movieStatus === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')}
              color={movieStatus === 'ACTIVE' ? 'success' : 'info'}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                fontSize: '0.75rem',
                height: 28,
                px: 1.5,
                background: movieStatus === 'ACTIVE' 
                  ? 'linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%)' 
                  : 'linear-gradient(90deg, #03A9F4 0%, #00BCD4 100%)',
                border: 'none',
                transition: 'all 0.3s ease'
              }}
            />
          )}
          
          {/* Age Restriction Badge - Enhanced with animation and better visibility */}
          {ageRestriction && (
            <Tooltip 
              title={getAgeRestrictionTooltip(ageRestriction)}
              arrow
              placement="top"
            >
              <Box
                className="age-restriction-badge"
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  fontWeight: 'bold',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '0.9rem',
                  color: '#fff',
                  background: getAgeRestrictionBackground(ageRestriction),
                  boxShadow: '0 3px 8px rgba(0,0,0,0.35)',
                  border: '2px solid #fff',
                  transition: 'all 0.3s ease'
                }}
              >
                {ageRestriction}
              </Box>
            </Tooltip>
          )}
          
          {/* Poster Image */}
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="350"
              image={posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={title}
              sx={{ 
                objectFit: 'cover',
                filter: movieStatus !== 'ACTIVE' ? 'brightness(0.8)' : 'brightness(1)',
                transition: 'all 0.5s ease-in-out',
                transform: 'scale(1)'
              }}
            />
            
            {/* Poster Overlay with gradient - Enhanced with stronger gradient */}
            <Box
              className="poster-overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0) 60%)`,
                opacity: 0.8,
                transition: 'opacity 0.3s ease'
              }}
            />
            
            {/* Rating Overlay - Further enhanced with better visibility */}
            <Box
              sx={{ 
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                borderRadius: '16px',
                px: 2,
                py: 0.7,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255, 215, 0, 0.5)',
              }}
            >
              <StarIcon sx={{ 
                color: ratingValue >= 4 ? '#FFC107' : ratingValue >= 3 ? '#FFD54F' : '#FFF176', 
                mr: 0.7, 
                fontSize: '18px' 
              }} />
              <Typography variant="body2" sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.95rem', 
                mr: 0.8,
                color: ratingValue >= 4 ? '#FFC107' : ratingValue >= 3 ? '#FFD54F' : '#FFF176',
              }}>
                {ratingValue.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: '500' }}>
                ({reviewCount})
              </Typography>
            </Box>
            
            {/* Language Badge */}
            {movie.language && (
              <Tooltip title={`Ngôn ngữ: ${movie.language}`}>
                <Chip
                  icon={<PublicIcon fontSize="small" />}
                  label={movie.language.substring(0, 2).toUpperCase()}
                  size="small"
                  variant="filled"
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    fontSize: '0.7rem',
                    height: 24,
                    '& .MuiChip-icon': {
                      color: 'white',
                      fontSize: '0.9rem'
                    }
                  }}
                />
              </Tooltip>
            )}
            
            {/* 4K/HD Quality Badge if applicable (mocked for demo) */}
            {Math.random() > 0.5 && (
              <Chip
                icon={<HdIcon fontSize="small" />}
                label={Math.random() > 0.5 ? "4K" : "HD"}
                size="small"
                variant="filled"
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  right: movie.language ? 60 : 12,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': {
                    color: 'white',
                    fontSize: '0.9rem'
                  }
                }}
              />
            )}
          </Box>
          
          <CardContent sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2.5,
            bgcolor: movieStatus !== 'ACTIVE' ? alpha(theme.palette.action.disabledBackground, 0.05) : 'inherit'
          }}>
            {/* Movie Title */}
            <Typography variant="h6" component="div" gutterBottom sx={{ 
              mb: 0.5, 
              fontWeight: 'bold',
              fontSize: '1.15rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '3.3rem',
              lineHeight: '1.6rem'
            }}>
              {title}
            </Typography>
            
            {/* Rating Stars - Enhanced with better spacing and color coding */}
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 1.5, 
                p: 1, 
                borderRadius: 1.5,
                background: alpha(theme.palette.action.hover, 0.05),
                '&:hover': {
                  background: alpha(theme.palette.action.hover, 0.1),
                }
              }}
            >
              <MuiRating
                value={ratingValue}
                precision={0.5}
                size="small"
                readOnly
                sx={{
                  '& .MuiRating-icon': {
                    color: ratingValue >= 4 ? '#FFC107' : ratingValue >= 3 ? '#FFD54F' : '#FFF176',
                  }
                }}
              />
              <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ 
                  lineHeight: 1.2, 
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  color: ratingValue >= 4 ? 'success.main' : ratingValue >= 3 ? 'text.primary' : 'text.secondary',
                }}>
                  {ratingValue.toFixed(1)}/5
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  ({reviewCount} đánh giá)
                </Typography>
              </Box>
            </Box>
            
            {/* Movie Info Row */}
            <Box sx={{ mb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {/* Duration */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mr: 1.5,
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  background: alpha(theme.palette.primary.main, 0.05),
                }}>
                  <AccessTimeIcon fontSize="small" color="primary" sx={{ fontSize: '0.95rem', mr: 0.5 }} />
                  <Typography variant="body2" color="primary" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    {movie.duration} {t('movies.minutes')}
                  </Typography>
                </Box>
                
                {/* Release Date */}
                {releaseDate && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                    background: alpha(theme.palette.info.main, 0.05),
                  }}>
                    <CalendarMonthIcon fontSize="small" color="info" sx={{ fontSize: '0.95rem', mr: 0.5 }} />
                    <Typography variant="body2" color="info.main" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {formatReleaseDate(releaseDate)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Movie Description */}
            <Typography variant="body2" color="text.secondary" sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2,
              minHeight: '60px',
              fontSize: '0.85rem',
              opacity: 0.9,
              lineHeight: 1.5
            }}>
              {description}
            </Typography>
            
            {/* Book Button - Enhanced with gradient and better spacing */}
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Button 
                variant="contained" 
                fullWidth 
                color="primary"
                disableElevation
                startIcon={<LocalActivityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/movies/${movie.id}`);
                }}
                sx={{ 
                  borderRadius: '12px',
                  py: 1.2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  background: movieStatus === 'ACTIVE' ? 
                    'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)' : 
                    'linear-gradient(45deg, #757575 30%, #9E9E9E 90%)',
                  '&:hover': {
                    background: movieStatus === 'ACTIVE' ? 
                      'linear-gradient(45deg, #E6004D 30%, #E63939 90%)' : 
                      'linear-gradient(45deg, #616161 30%, #757575 90%)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
                disabled={movieStatus !== 'ACTIVE'}
              >
                {movieStatus === 'ACTIVE' ? t('movies.bookTickets') : t('movies.comingSoon')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };
  
  const renderSkeleton = () => {
    return Array.from(new Array(8)).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card sx={{ height: '100%', borderRadius: 3 }}>
          <Skeleton variant="rectangular" height={350} sx={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
          <CardContent>
            <Skeleton variant="text" height={32} width="80%" />
            <Skeleton variant="text" height={20} width="60%" />
            <Box sx={{ mt: 1, mb: 2, display: 'flex', gap: 1 }}>
              <Skeleton variant="text" height={24} width="40%" />
              <Skeleton variant="text" height={24} width="40%" />
            </Box>
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" />
            <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 2 }} />
          </CardContent>
        </Card>
      </Grid>
    ));
  };
  
  const isLoading = isAllMoviesLoading || isShowingLoading || isUpcomingLoading;
  const isError = isAllMoviesError || isShowingError || isUpcomingError;
  const error = allMoviesError || showingError || upcomingError;
  
  let moviesToRender: Movie[] = [];
  let totalPages = 0;
  
  if (tabValue === 0 && moviesData) {
    // Đảm bảo moviesData.content là một mảng
    moviesToRender = moviesData.content && Array.isArray(moviesData.content) 
      ? moviesData.content 
      : Array.isArray(moviesData) 
        ? moviesData 
        : [];
    
    // Ghi log chi tiết cấu trúc dữ liệu để debug
    console.log("Movies data structure:", moviesData);
    console.log("Movies content type:", moviesData.content ? typeof moviesData.content : "undefined");
    console.log("Is movies content array:", moviesData.content ? Array.isArray(moviesData.content) : false);
    console.log("Movies content length:", moviesData.content && Array.isArray(moviesData.content) ? moviesData.content.length : 0);
    
    // Kiểm tra các phim có hợp lệ không (có ID và tiêu đề)
    if (moviesToRender.length > 0) {
      // Sử dụng SafeToLog để tránh lỗi circular reference
      const safeFirstMovie = {
        id: moviesToRender[0].id,
        name: moviesToRender[0].name || moviesToRender[0].title,
        status: moviesToRender[0].status,
        hasCategories: !!moviesToRender[0].categories,
        categoriesCount: moviesToRender[0].categories?.length || 0,
        hasSchedules: !!moviesToRender[0].schedules,
        schedulesCount: moviesToRender[0].schedules?.length || 0
      };
      console.log("First movie example:", safeFirstMovie);
    } else {
      console.warn("No movies found in response");
    }
    
    // Lấy tổng số trang từ dữ liệu phân trang, mặc định là 1
    totalPages = moviesData.totalPages || 1;
  } else if (tabValue === 1) {
    // Xử lý dữ liệu phim đang chiếu
    moviesToRender = showingMovies && Array.isArray(showingMovies) ? showingMovies : [];
    console.log("Showing movies data:", showingMovies);
    console.log("Showing movies type:", typeof showingMovies);
    console.log("Is showing movies array:", Array.isArray(showingMovies));
    console.log("Showing movies length:", Array.isArray(showingMovies) ? showingMovies.length : 0);
    totalPages = 1;
  } else if (tabValue === 2) {
    // Xử lý dữ liệu phim sắp chiếu
    moviesToRender = upcomingMovies && Array.isArray(upcomingMovies) ? upcomingMovies : [];
    console.log("Upcoming movies data:", upcomingMovies);
    console.log("Upcoming movies type:", typeof upcomingMovies);
    console.log("Is upcoming movies array:", Array.isArray(upcomingMovies));
    console.log("Upcoming movies length:", Array.isArray(upcomingMovies) ? upcomingMovies.length : 0);
    totalPages = 1;
  }
  
  // Kiểm tra lại mảng phim cuối cùng để đảm bảo là một mảng hợp lệ
  if (!Array.isArray(moviesToRender)) {
    console.error("moviesToRender is not an array:", moviesToRender);
    moviesToRender = [];
  }
  
  // Generate mock genres for the filter
  const genres = [
    { id: 'action', name: 'Action' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'horror', name: 'Horror' },
    { id: 'scifi', name: 'Sci-Fi' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'animation', name: 'Animation' },
    { id: 'family', name: 'Family' }
  ];

  // Section title component - Enhanced version
  const SectionTitle = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <Box sx={{ 
      mb: 3, 
      mt: 5, 
      display: 'flex', 
      alignItems: 'center',
      pb: 2,
      borderRadius: 2,
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 1,
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
      }
    }}>
      {icon && (
        <Box 
          sx={{ 
            mr: 2, 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`
          }}
        >
          {icon}
        </Box>
      )}
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.05)',
          letterSpacing: 1
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth={isMobile ? "xs" : isTablet ? "sm" : "lg"} sx={{ py: 4 }}>
      {/* Page Title - Enhanced */}
      <Box sx={{ 
        mb: 5,
        textAlign: 'center',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: -15,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 6,
          borderRadius: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: '800',
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 8px rgba(0,0,0,0.1)',
          letterSpacing: 1
        }}>
          {t('movies.browseMovies')}
        </Typography>
      </Box>
      
      {/* Tab Navigation - Enhanced */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        borderRadius: 3, 
        overflow: 'hidden', 
        bgcolor: theme.palette.background.paper,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered 
          variant="fullWidth"
          sx={{ 
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '4px 4px 0 0',
              background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)'
            },
            '& .Mui-selected': {
              color: '#FF2E63 !important',
              fontWeight: '700 !important'
            }
          }}
          textColor="primary"
        >
          <Tab 
            label={t('movies.allMovies')} 
            sx={{ 
              fontWeight: 600, 
              textTransform: 'none', 
              py: 2.5, 
              fontSize: '1.05rem'
            }} 
          />
          <Tab 
            label={t('movies.nowShowing')} 
            sx={{ 
              fontWeight: 600, 
              textTransform: 'none', 
              py: 2.5, 
              fontSize: '1.05rem'
            }} 
          />
          <Tab 
            label={t('movies.comingSoon')} 
            sx={{ 
              fontWeight: 600, 
              textTransform: 'none', 
              py: 2.5, 
              fontSize: '1.05rem'
            }} 
          />
        </Tabs>
      </Paper>
      
      {/* Filter and Search - Enhanced */}
      {tabValue === 0 && (
        <Paper elevation={0} sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.06)'
        }}>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
            <TextField
              variant="outlined"
              placeholder={t('common.search')}
              fullWidth={isMobile}
              value={filters.search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }
              }}
              size="small"
            />
            
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel id="genre-label">{t('movies.genre')}</InputLabel>
              <Select
                labelId="genre-label"
                value={filters.genre}
                onChange={handleGenreChange as any}
                label={t('movies.genre')}
                sx={{ 
                  borderRadius: 3,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                    }
                  },
                  '&.Mui-focused': {
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {genres.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <Grid container spacing={3}>
          {renderSkeleton()}
        </Grid>
      )}
      
      {/* Error state */}
      {isError && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4, 
          px: 3, 
          borderRadius: 3, 
          bgcolor: alpha(theme.palette.error.light, 0.1), 
          border: `1px solid ${theme.palette.error.main}` 
        }}>
          <Typography color="error" gutterBottom variant="h6">
            {t('errors.fetchFailed', { entity: t('movies.movies') })}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            {(error as Error)?.message || t('errors.somethingWentWrong')}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            {t('common.retry')}
          </Button>
        </Box>
      )}
      
      {/* Movie Grid - Enhanced section styles */}
      {!isLoading && !isError && Array.isArray(moviesToRender) && moviesToRender.length > 0 && (
        <>
          {/* Show section titles only for All Movies tab */}
          {tabValue === 0 && (
            <>
              {/* Now Showing Section - Enhanced with better visual separation */}
              {moviesToRender.some(movie => movie.status === 'ACTIVE' || movie.status === 'SHOWING') && (
                <Box sx={{ position: 'relative' }}>
                  <SectionTitle title={t('movies.nowShowing')} icon={<LocalActivityIcon fontSize="medium" />} />
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      pt: 4,
                      borderRadius: 4, 
                      mb: 5,
                      background: `linear-gradient(to bottom, ${alpha(theme.palette.success.light, 0.08)}, ${alpha(theme.palette.success.light, 0.02)})`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.07)}`
                    }}
                  >
                    <Grid container spacing={3}>
                      {moviesToRender
                        .filter(movie => movie.status === 'ACTIVE' || movie.status === 'SHOWING')
                        .map(renderMovieCard)}
                    </Grid>
                  </Paper>
                </Box>
              )}
              
              {/* Coming Soon Section - Enhanced with better visual separation */}
              {moviesToRender.some(movie => movie.status === 'INACTIVE' || movie.status === 'UPCOMING') && (
                <Box sx={{ position: 'relative' }}>
                  <SectionTitle title={t('movies.comingSoon')} icon={<CalendarMonthIcon fontSize="medium" />} />
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 3, 
                      pt: 4,
                      borderRadius: 4, 
                      mb: 4,
                      background: `linear-gradient(to bottom, ${alpha(theme.palette.info.light, 0.08)}, ${alpha(theme.palette.info.light, 0.02)})`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.07)}`
                    }}
                  >
                    <Grid container spacing={3}>
                      {moviesToRender
                        .filter(movie => movie.status === 'INACTIVE' || movie.status === 'UPCOMING')
                        .map(renderMovieCard)}
                    </Grid>
                  </Paper>
                </Box>
              )}
            </>
          )}
          
          {/* For other tabs, just show the list with enhanced container */}
          {tabValue !== 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 4, 
                mb: 4,
                background: tabValue === 1
                  ? `linear-gradient(to bottom, ${alpha(theme.palette.success.light, 0.08)}, ${alpha(theme.palette.success.light, 0.02)})`
                  : `linear-gradient(to bottom, ${alpha(theme.palette.info.light, 0.08)}, ${alpha(theme.palette.info.light, 0.02)})`,
                border: `1px solid ${alpha(tabValue === 1 ? theme.palette.success.main : theme.palette.info.main, 0.15)}`,
                boxShadow: `0 4px 20px ${alpha(tabValue === 1 ? theme.palette.success.main : theme.palette.info.main, 0.07)}`
              }}
            >
              <Grid container spacing={3}>
                {moviesToRender.map(renderMovieCard)}
              </Grid>
            </Paper>
          )}
        </>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && (!Array.isArray(moviesToRender) || moviesToRender.length === 0) && (
        <Paper elevation={0} sx={{ 
          textAlign: 'center', 
          py: 8, 
          px: 3,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ mb: 2 }}>
            <LocalMoviesIcon sx={{ fontSize: 64, color: alpha(theme.palette.text.secondary, 0.3) }} />
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {t('movies.noMoviesFound')}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
            Có vẻ như không có phim nào phù hợp với tìm kiếm của bạn. Hãy thử tìm kiếm khác hoặc điều chỉnh bộ lọc.
          </Typography>
          {tabValue === 0 && filters.search !== '' && (
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setFilters({ ...filters, search: '' })}
              sx={{ mr: 2 }}
            >
              Xóa tìm kiếm
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Làm mới
          </Button>
        </Paper>
      )}
      
      {/* Pagination - Enhanced */}
      {tabValue === 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={5}>
          <Pagination 
            count={totalPages} 
            page={page + 1} 
            onChange={handlePageChange} 
            color="primary" 
            size={isMobile ? 'medium' : 'large'}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
                  boxShadow: '0 2px 8px rgba(255, 46, 99, 0.3)',
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default MovieList; 