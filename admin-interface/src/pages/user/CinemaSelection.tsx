import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  CircularProgress, 
  Grid,
  Paper,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

// Giả sử bạn có các services và types này
// import { fetchCities, fetchCinemasByCity, fetchShowtimes } from '../../services/cinemaService';
// import { City, Cinema, Showtime } from '../../types';

// Mock data for now
interface City {
  id: string;
  name: string;
}

interface Cinema {
  id: string;
  name: string;
  address: string;
  // Thêm thông tin giá vé cơ bản nếu có
  basePrice?: number; 
}

const mockCities: City[] = [
  { id: 'hcm', name: 'Hồ Chí Minh' },
  { id: 'hn', name: 'Hà Nội' },
  { id: 'dn', name: 'Đà Nẵng' },
];

const mockCinemas: { [key: string]: Cinema[] } = {
  hcm: [
    { id: 'cgv-aeon-tanphu', name: 'CGV Aeon Mall Tân Phú', address: '30 Bờ Bao Tân Thắng, Sơn Kỳ, Tân Phú', basePrice: 75000 },
    { id: 'lotte-NVL', name: 'Lotte Cinema Nguyễn Văn Lượng', address: '65 Nguyễn Văn Lượng, Gò Vấp', basePrice: 70000 },
    { id: 'bhd-vincom-thuduc', name: 'BHD Vincom Thủ Đức', address: '216 Võ Văn Ngân, Bình Thọ, Thủ Đức', basePrice: 80000 },
  ],
  hn: [
    { id: 'cgv-vincom-ba-trieu', name: 'CGV Vincom Bà Triệu', address: '191 P. Bà Triệu, Lê Đại Hành, Hai Bà Trưng', basePrice: 85000 },
    { id: 'lotte-long-bien', name: 'Lotte Cinema Long Biên', address: '7 Đ. Nguyễn Văn Linh, Gia Thụy, Long Biên', basePrice: 75000 },
  ],
  dn: [
    { id: 'cgv-vinh-trung', name: 'CGV Vinh Trung Plaza', address: '255-257 Hùng Vương, Vĩnh Trung, Thanh Khê', basePrice: 70000 },
  ],
};

const CinemaSelection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>(); // Lấy movieId từ URL
  const theme = useTheme(); // Call useTheme to get the theme object

  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cinemasInCity, setCinemasInCity] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);
  const [loadingCinemas, setLoadingCinemas] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCity) {
      setLoadingCinemas(true);
      setError(null);
      // Simulate API call
      setTimeout(() => {
        setCinemasInCity(mockCinemas[selectedCity] || []);
        setSelectedCinema(null); // Reset selected cinema when city changes
        setLoadingCinemas(false);
      }, 500);
    } else {
      setCinemasInCity([]);
      setSelectedCinema(null);
    }
  }, [selectedCity]);

  const handleCityChange = (event: any) => {
    setSelectedCity(event.target.value as string);
  };

  const handleCinemaSelect = (cinema: Cinema) => {
    setSelectedCinema(cinema);
  };

  const handleNextStep = () => {
    if (selectedCinema && movieId) {
      // Chuyển sang bước chọn lịch chiếu (Showtime Selection)
      // Truyền movieId và cinemaId
      navigate(`/booking/${movieId}/showtimes/${selectedCinema.id}`);
    } else {
      setError(t('cinemaSelection.errorSelectCinema'));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        {t('cinemaSelection.title')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t('cinemaSelection.selectCity')}
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="city-select-label">{t('cinemaSelection.city')}</InputLabel>
            <Select
              labelId="city-select-label"
              id="city-select"
              value={selectedCity}
              onChange={handleCityChange}
              label={t('cinemaSelection.city')}
            >
              <MenuItem value="">
                <em>{t('cinemaSelection.pleaseSelectCity')}</em>
              </MenuItem>
              {mockCities.map((city) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            {t('cinemaSelection.selectCinema')}
          </Typography>
          {loadingCinemas ? (
            <Box display="flex" justifyContent="center" sx={{ my: 3 }}>
              <CircularProgress />
            </Box>
          ) : cinemasInCity.length > 0 ? (
            <Grid container spacing={2}>
              {cinemasInCity.map((cinema) => (
                <Grid item xs={12} sm={6} key={cinema.id}>
                  <Paper 
                    elevation={selectedCinema?.id === cinema.id ? 6 : 2}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: selectedCinema?.id === cinema.id ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      transition: 'border 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      }
                    }}
                    onClick={() => handleCinemaSelect(cinema)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">{cinema.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{cinema.address}</Typography>
                    {cinema.basePrice && (
                      <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                        {t('cinemaSelection.priceFrom', { price: cinema.basePrice.toLocaleString('vi-VN') })}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              {selectedCity ? t('cinemaSelection.noCinemasInCity') : t('cinemaSelection.promptSelectCity')}
            </Typography>
          )}
        </Grid>
      </Grid>

      {selectedCinema && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {t('cinemaSelection.selectedCinema')}: {selectedCinema.name}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleNextStep}
            sx={{ px: 5, py: 1.5 }}
          >
            {t('common.next')}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CinemaSelection; 