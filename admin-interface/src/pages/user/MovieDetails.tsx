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
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieDetails } from '../../services/movieService';
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
import DirectBookingButton from '../../components/DirectBookingButton';
import DebugPanel from '../../components/debug/DebugPanel';
import { Actor } from '../../types';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  
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
  
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <DebugPanel />
      
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
                    startIcon={<LocalActivityIcon />}
                    onClick={() => navigate(`/book-tickets/${movie.id}`)}
                    sx={{ 
                      px: { xs: 3, sm: 6 },
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem'},
                      fontWeight: 'bold',
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    Book Tickets
                  </Button>
                  
                  <DirectBookingButton 
                    movieId={movie.id} 
                    variant="outlined"
                    size="medium"
                    showDebugInfo
                  />
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 1,
                  color: theme.palette.text.secondary
                }}>
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('movies.director')}
                </Typography>
                <List>
                  {typeof movie.director === 'string' ? (
                    <ListItem sx={{ px: 1, py: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar alt={movie.director}>
                          {movie.director.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={movie.director} />
                    </ListItem>
                  ) : Array.isArray(movie.director) && movie.director.map((director: string, index: number) => (
                    <ListItem key={index} sx={{ px: 1, py: 0.5 }}>
                      <ListItemAvatar>
                        <Avatar alt={director}>
                          {director.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={director} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {/* Actors */}
            {movie.actors && movie.actors.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  mb: 1,
                  color: theme.palette.text.secondary
                }}>
                  <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                  {t('movies.actors')}
                </Typography>
                <Grid container spacing={2}>
                  {movie.actors.map((actor: Actor, index) => (
                    <Grid item xs={12} sm={6} key={actor.id || index}>
                      <ListItem sx={{ px: 1, py: 0.5 }}>
                        <ListItemAvatar>
                          <Avatar alt={actor.name} src={actor.profilePath}>
                            {!actor.profilePath && actor.name ? actor.name.charAt(0).toUpperCase() : null}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={actor.name} 
                          secondary={actor.character || null}
                        />
                      </ListItem>
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
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 'bold',
            mb: 3,
            display: 'flex',
            alignItems: 'center'
          }}>
            <TheatersIcon color="primary" sx={{ mr: 1 }} />
            {t('movies.trailer')}
          </Typography>
          
          <Box 
            sx={{ 
              borderRadius: '12px', 
              overflow: 'hidden',
              position: 'relative',
              paddingTop: '56.25%', // 16:9 aspect ratio
              backgroundColor: 'black', // Background for the iframe container
              boxShadow: `0 10px 30px ${alpha('#000', 0.15)}`,
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
        </Paper>
      )}
      
      {/* Book Ticket Button (Bottom) - MoMo Style */}
      {movieStatus === 'ACTIVE' && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mt: 5,
          mb: 2
        }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth={isMobile}
            startIcon={<LocalActivityIcon />}
            onClick={() => navigate(`/book-tickets/${movie.id}`)}
            sx={{ 
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              maxWidth: 'md',
              boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              '&:hover': {
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            {t('movies.bookTickets')}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MovieDetails;