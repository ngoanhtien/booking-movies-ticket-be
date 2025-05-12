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
    
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            '&:hover': {
              transform: 'translateY(-8px)',
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              '& .MuiCardMedia-root': {
                filter: 'brightness(1.05)',
              }
            }
          }}
          onClick={() => handleMovieClick(movie.id)}
        >
          {/* Status Badge */}
          {movieStatus && (
            <Chip
              label={movieStatus === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')}
              color={movieStatus === 'ACTIVE' ? 'success' : 'info'}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 2,
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: '0.7rem',
                height: 24,
                px: 1
              }}
            />
          )}
          
          {/* Age Restriction Badge */}
          {ageRestriction && (
            <Tooltip title={
              ageRestriction === 'P' ? 'Phù hợp mọi lứa tuổi' :
              ageRestriction === 'C13' ? 'Cấm khán giả dưới 13 tuổi' :
              ageRestriction === 'C16' ? 'Cấm khán giả dưới 16 tuổi' :
              ageRestriction === 'C18' ? 'Cấm khán giả dưới 18 tuổi' : ''
            }>
              <Chip
                label={ageRestriction}
                color={ageRestrictionColor}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            </Tooltip>
          )}
          
          {/* Poster Image */}
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="350"
              image={posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={title}
              sx={{ 
                objectFit: 'cover',
                filter: movieStatus !== 'ACTIVE' ? 'brightness(0.85)' : 'brightness(1)',
                transition: 'all 0.3s ease'
              }}
            />
            
            {/* Rating Overlay */}
            <Badge
              badgeContent={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255, 215, 0, 0.7)',
                }}>
                  <StarIcon fontSize="small" sx={{ color: 'gold', mr: 0.5, fontSize: '16px' }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {ratingValue.toFixed(1)}
                  </Typography>
                </Box>
              }
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                '& .MuiBadge-badge': {
                  position: 'static',
                  transform: 'none'
                }
              }}
            />
            
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
            p: 2,
            bgcolor: movieStatus !== 'ACTIVE' ? alpha(theme.palette.action.disabledBackground, 0.05) : 'inherit'
          }}>
            {/* Movie Title */}
            <Typography variant="h6" component="div" gutterBottom sx={{ 
              mb: 0.5, 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '3.3rem',
              lineHeight: '1.6rem'
            }}>
              {title}
            </Typography>
            
            {/* Rating Stars */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MuiRating
                value={ratingValue}
                precision={0.5}
                size="small"
                readOnly
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
                ({Math.floor(Math.random() * 1000) + 100})
              </Typography>
            </Box>
            
            {/* Movie Info Row */}
            <Box sx={{ mb: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {/* Duration */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 1.5 }}>
                  <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {movie.duration} {t('movies.minutes')}
                  </Typography>
                </Box>
                
                {/* Release Date */}
                {releaseDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon fontSize="small" color="action" sx={{ fontSize: '1rem', mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
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
              opacity: 0.8
            }}>
              {description}
            </Typography>
            
            {/* Book Button */}
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
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  background: movieStatus === 'ACTIVE' ? 
                    'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)' : 
                    'linear-gradient(45deg, #808080 30%, #A0A0A0 90%)',
                  '&:hover': {
                    background: movieStatus === 'ACTIVE' ? 
                      'linear-gradient(45deg, #E6004D 30%, #E63939 90%)' : 
                      'linear-gradient(45deg, #707070 30%, #909090 90%)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                  }
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

  // Section title component
  const SectionTitle = ({ title, icon }: { title: string, icon?: React.ReactNode }) => (
    <Box sx={{ 
      mb: 3, 
      mt: 4, 
      display: 'flex', 
      alignItems: 'center',
      pb: 1,
      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
    }}>
      {icon && <Box sx={{ mr: 1, color: theme.palette.primary.main }}>{icon}</Box>}
      <Typography 
        variant="h5" 
        component="h2" 
        sx={{ 
          fontWeight: 'bold',
          position: 'relative',
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -10,
            left: 0,
            width: 80,
            height: 5,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 2
          }
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth={isMobile ? "xs" : isTablet ? "sm" : "lg"} sx={{ py: 4 }}>
      {/* Page Title */}
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
        mb: 4,
        fontWeight: 'bold',
        fontSize: { xs: '1.6rem', sm: '2rem', md: '2.2rem' },
        background: 'linear-gradient(45deg, #FF2E63 30%, #FF5555 90%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {t('movies.browseMovies')}
      </Typography>
      
      {/* Tab Navigation */}
      <Paper elevation={0} sx={{ 
        mb: 4, 
        borderRadius: 3, 
        overflow: 'hidden', 
        bgcolor: theme.palette.background.paper,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered 
          variant="fullWidth"
          sx={{ 
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('movies.allMovies')} sx={{ fontWeight: 'bold', textTransform: 'none', py: 2 }} />
          <Tab label={t('movies.nowShowing')} sx={{ fontWeight: 'bold', textTransform: 'none', py: 2 }} />
          <Tab label={t('movies.comingSoon')} sx={{ fontWeight: 'bold', textTransform: 'none', py: 2 }} />
        </Tabs>
      </Paper>
      
      {/* Filter and Search */}
      {tabValue === 0 && (
        <Paper elevation={0} sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              size="small"
            />
            
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel id="genre-label">{t('movies.genre')}</InputLabel>
              <Select
                labelId="genre-label"
                value={filters.genre}
                onChange={handleGenreChange as any}
                label={t('movies.genre')}
                sx={{ borderRadius: 2 }}
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
      
      {/* Movie Grid */}
      {!isLoading && !isError && Array.isArray(moviesToRender) && moviesToRender.length > 0 && (
        <>
          {/* Show section titles only for All Movies tab */}
          {tabValue === 0 && (
            <>
              {/* Now Showing Section */}
              {moviesToRender.some(movie => movie.status === 'ACTIVE' || movie.status === 'SHOWING') && (
                <>
                  <SectionTitle title={t('movies.nowShowing')} icon={<LocalActivityIcon fontSize="medium" />} />
                  <Grid container spacing={3}>
                    {moviesToRender
                      .filter(movie => movie.status === 'ACTIVE' || movie.status === 'SHOWING')
                      .map(renderMovieCard)}
                  </Grid>
                </>
              )}
              
              {/* Coming Soon Section */}
              {moviesToRender.some(movie => movie.status === 'INACTIVE' || movie.status === 'UPCOMING') && (
                <>
                  <SectionTitle title={t('movies.comingSoon')} icon={<CalendarMonthIcon fontSize="medium" />} />
                  <Grid container spacing={3}>
                    {moviesToRender
                      .filter(movie => movie.status === 'INACTIVE' || movie.status === 'UPCOMING')
                      .map(renderMovieCard)}
                  </Grid>
                </>
              )}
            </>
          )}
          
          {/* For other tabs, just show the list */}
          {tabValue !== 0 && (
            <Grid container spacing={3}>
              {moviesToRender.map(renderMovieCard)}
            </Grid>
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
      
      {/* Pagination */}
      {tabValue === 0 && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={totalPages} 
            page={page + 1} 
            onChange={handlePageChange} 
            color="primary" 
            size={isMobile ? 'small' : 'medium'}
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 1
              }
            }}
          />
        </Box>
      )}
    </Container>
  );
};

export default MovieList; 