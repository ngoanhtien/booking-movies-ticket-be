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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { fetchMovies, fetchShowingMovies, fetchUpcomingMovies, MovieFilters } from '../../services/movieService';
import { Movie } from '../../types';

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
  
  const renderMovieCard = (movie: Movie) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.03)',
              cursor: 'pointer'
            }
          }}
          onClick={() => handleMovieClick(movie.id)}
        >
          <CardMedia
            component="img"
            height="350"
            image={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
            alt={movie.title}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="div" gutterBottom noWrap>
              {movie.title}
            </Typography>
            <Box sx={{ mb: 1, display: 'flex', gap: 0.5 }}>
              <Chip 
                label={`${movie.duration} ${t('movies.minutes')}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={movie.status === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')} 
                size="small" 
                color={movie.status === 'ACTIVE' ? 'success' : 'warning'} 
                variant="outlined" 
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2
            }}>
              {movie.description}
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button 
                variant="contained" 
                fullWidth 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/booking/${movie.id}`);
                }}
              >
                {t('movies.bookTickets')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };
  
  const isLoading = isAllMoviesLoading || isShowingLoading || isUpcomingLoading;
  const isError = isAllMoviesError || isShowingError || isUpcomingError;
  const error = allMoviesError || showingError || upcomingError;
  
  let moviesToRender: Movie[] = [];
  let totalPages = 0;
  
  if (tabValue === 0 && moviesData) {
    moviesToRender = moviesData.content;
    totalPages = moviesData.totalPages;
  } else if (tabValue === 1 && showingMovies) {
    moviesToRender = showingMovies;
    totalPages = 1; // Pagination is not used for showing/upcoming tabs
  } else if (tabValue === 2 && upcomingMovies) {
    moviesToRender = upcomingMovies;
    totalPages = 1; // Pagination is not used for showing/upcoming tabs
  }
  
  // Generate mock genres for the filter
  const genres = [
    { id: 'action', name: 'Action' },
    { id: 'comedy', name: 'Comedy' },
    { id: 'drama', name: 'Drama' },
    { id: 'horror', name: 'Horror' },
    { id: 'scifi', name: 'Sci-Fi' }
  ];

  return (
    <Container maxWidth={isMobile ? "xs" : isTablet ? "sm" : "lg"} sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        {t('movies.browseMovies')}
      </Typography>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        centered 
        sx={{ mb: 4 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label={t('movies.allMovies')} />
        <Tab label={t('movies.nowShowing')} />
        <Tab label={t('movies.comingSoon')} />
      </Tabs>
      
      {/* Filter and Search */}
      {tabValue === 0 && (
        <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
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
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="genre-label">{t('movies.genre')}</InputLabel>
            <Select
              labelId="genre-label"
              value={filters.genre}
              onChange={handleGenreChange as any}
              label={t('movies.genre')}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              {genres.map((genre) => (
                <MenuItem key={genre.id} value={genre.id}>{genre.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {isError && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" gutterBottom>
            {t('errors.fetchFailed', { entity: t('movies.movies') })}
          </Typography>
          <Typography variant="body2">{(error as Error)?.message}</Typography>
          <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            {t('common.retry')}
          </Button>
        </Box>
      )}
      
      {/* Movie Grid */}
      {!isLoading && !isError && moviesToRender.length > 0 && (
        <Grid container spacing={3}>
          {moviesToRender.map(renderMovieCard)}
        </Grid>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && moviesToRender.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            {t('movies.noMoviesFound')}
          </Typography>
        </Box>
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
          />
        </Box>
      )}
    </Container>
  );
};

export default MovieList; 