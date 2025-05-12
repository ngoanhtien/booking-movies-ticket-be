import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, Paper, Button, Divider, Chip } from '@mui/material';
import BookingForm from './BookingForm'; // Assuming BookingForm is in the same directory
import { useParams, useNavigate } from 'react-router-dom';
import TokenDebugger from '../../components/debug/TokenDebugger';
import BookingDebugger from '../../components/debug/BookingDebugger';
import SimpleBooking from '../../components/SimpleBooking';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axios';

interface RootState {
  auth: {
    isAuthenticated: boolean;
    token: string | null;
  };
}

interface BookingPageProps {
  directBooking?: boolean;
}

const BookingPage: React.FC<BookingPageProps> = ({ directBooking = false }) => {
  const { movieId, cinemaId } = useParams<{ movieId: string; cinemaId: string }>();
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showDebugging, setShowDebugging] = useState<boolean>(false);

  useEffect(() => {
    // Check if direct booking was requested via localStorage
    const isDirectBooking = localStorage.getItem('directBooking') === 'true';
    
    if (isDirectBooking) {
      // Clear the flag
      localStorage.removeItem('directBooking');
      
      // Log the direct booking
      addDebugLog('Direct booking mode activated via localStorage');
      setShowDebugging(true);
    }
    
    // Get movie name if movieId exists
    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  const addDebugLog = (message: string) => {
    setDebugInfo(prev => `${prev}\n${new Date().toISOString().substring(11, 19)} - ${message}`);
  };
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const fetchMovieDetails = async () => {
    try {
      addDebugLog(`Fetching movie details for ID: ${movieId}`);
      
      const response = await axiosInstance.get(`/movie/detail/${movieId}`);
      const data = response.data;
      
      addDebugLog(`Movie details fetched successfully: ${JSON.stringify(data).substring(0, 100)}...`);
      
      // Extract movie name from response
      const movieName = data.result?.name || data.name || data.title || 'Unknown Movie';
      setMovieName(movieName);
      addDebugLog(`Movie name set to: ${movieName}`);
    } catch (err: any) {
      addDebugLog(`Exception fetching movie details: ${err.message}`);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Booking Page
          </Typography>
          {movieName && (
            <Typography variant="h6" color="text.secondary">
              {movieName}
            </Typography>
          )}
        </Box>
        
        <Box>
          <Chip 
            label={`Movie ID: ${movieId || 'None'}`} 
            sx={{ mr: 1 }} 
            size="small" 
            variant="outlined"
          />
          <Button 
            size="small" 
            variant="outlined" 
            onClick={() => setShowDebugging(!showDebugging)}
          >
            {showDebugging ? 'Hide' : 'Show'} Debug Tools
          </Button>
        </Box>
      </Box>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Debug information */}
      {showDebugging && (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Debugging Tools</Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Use these tools to diagnose booking issues. Direct booking bypasses the normal flow.
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TokenDebugger />
            <BookingDebugger movieId={movieId} />
            
            {/* Debug log */}
            {debugInfo && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>Page Debug Log:</Typography>
                <Box sx={{ 
                  p: 1.5, 
                  bgcolor: '#000', 
                  color: '#0f0', 
                  borderRadius: 1, 
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  maxHeight: '150px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  mb: 2
                }}>
                  {debugInfo}
                </Box>
                <Button size="small" onClick={() => setDebugInfo('')}>Clear Log</Button>
              </Paper>
            )}
          </Paper>
          
          {/* Add simplified booking component */}
          <SimpleBooking 
            movieId={movieId} 
            onSuccess={(bookingId) => {
              addDebugLog(`Booking successful with ID: ${bookingId}`);
            }}
          />
        </>
      )}
      
      {/* Booking form - Only show if authenticated */}
      {isAuthenticated ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" gutterBottom align="center">
              Standard Booking Form
            </Typography>
            <BookingForm movieId={movieId} cinemaId={cinemaId} directBooking={directBooking} />
          </Paper>
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please log in to book tickets.
        </Alert>
      )}
    </Container>
  );
};

export default BookingPage; 