import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import BookingForm from './BookingForm'; // Assuming BookingForm is in the same directory
import { useParams } from 'react-router-dom';

const BookingPage: React.FC = () => {
  const { movieId, cinemaId } = useParams<{ movieId: string; cinemaId: string }>();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* You can add movie details here if needed, fetched based on movieId */}
        {/* For example:
        {movieId && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h5">Booking for Movie ID: {movieId}</Typography>
            // Fetch and display movie title, poster etc.
          </Box>
        )}
        */}
        <BookingForm movieId={movieId} cinemaId={cinemaId} />
      </Box>
    </Container>
  );
};

export default BookingPage; 