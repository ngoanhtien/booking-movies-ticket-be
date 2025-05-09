import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  useMediaQuery 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../../services/movieService';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Button 
        variant="text" 
        color="primary" 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/movies')}
        sx={{ mb: 4, fontWeight: 'medium' }}
      >
        {t('common.backToMovies')}
      </Button>
      
      <Grid container spacing={4}>
        {/* Movie Poster */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
            <Box
              component="img"
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
              }}
              src={movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={movie.title}
            />
          </Paper>
        </Grid>
        
        {/* Movie Details */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" component="h1" gutterBottom>
            {movie.title}
          </Typography>
          
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<AccessTimeIcon />}
              label={`${movie.duration} ${t('movies.minutes')}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              icon={<CalendarMonthIcon />}
              label={new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
              color="primary"
              variant="outlined"
            />
            <Chip 
              icon={<LocalMoviesIcon />}
              label={movie.status === 'ACTIVE' ? t('movies.showing') : t('movies.upcoming')} 
              color={movie.status === 'ACTIVE' ? 'success' : 'warning'} 
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <Rating value={4} readOnly precision={0.5} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              4.0/5.0 ({Math.floor(Math.random() * 1000) + 100} {t('movies.ratings')})
            </Typography>
          </Box>
          
          <Typography variant="h6" gutterBottom>
            {t('movies.description')}
          </Typography>
          <Typography variant="body1" paragraph>
            {movie.description}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('movies.genre')}
              </Typography>
              <Typography variant="body1">
                Action, Adventure
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('movies.director')}
              </Typography>
              <Typography variant="body1">
                John Doe
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('movies.language')}
              </Typography>
              <Typography variant="body1">
                English
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                {t('movies.ageRestriction')}
              </Typography>
              <Typography variant="body1">
                PG-13
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth={isMobile}
              onClick={() => navigate(`/booking/${movie.id}`)}
              sx={{ px: 4 }}
            >
              {t('movies.bookTickets')}
            </Button>
          </Box>
        </Grid>
      </Grid>
      
      {/* Movie Trailer */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          {t('movies.trailer')}
        </Typography>
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: '8px', 
            overflow: 'hidden',
            position: 'relative',
            paddingTop: '56.25%', // 16:9 aspect ratio
          }}
        >
          <Box
            component="iframe"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title={`${movie.title} Trailer`}
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
        </Paper>
      </Box>
    </Container>
  );
};

export default MovieDetails; 