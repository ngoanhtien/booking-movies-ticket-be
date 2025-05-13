import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Link,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: 'auto',
        py: 3,
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('common.appName')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('footer.tagline')}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="primary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="primary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="primary" aria-label="YouTube">
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.quickLinks')}
            </Typography>
            <Link
              component={RouterLink}
              to="/movies"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('navigation.movies')}
            </Link>
            <Link
              component={RouterLink}
              to="/profile"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('navigation.profile')}
            </Link>
            <Link
              component={RouterLink}
              to="/booking-history"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('navigation.bookingHistory')}
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.help')}
            </Typography>
            <Link
              href="#"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('footer.faq')}
            </Link>
            <Link
              href="#"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('footer.terms')}
            </Link>
            <Link
              href="#"
              color="text.secondary"
              display="block"
              variant="body2"
              sx={{ mb: 1 }}
            >
              {t('footer.privacy')}
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              {t('footer.contact')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('footer.address')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: info@example.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('footer.phone')}: +84 123 456 789
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 3, mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {t('common.appName')}. {t('footer.rightsReserved')}
          </Typography>
          <Box>
            <Link href="#" color="text.secondary" sx={{ mr: 2 }} variant="body2">
              {t('footer.privacy')}
            </Link>
            <Link href="#" color="text.secondary" variant="body2">
              {t('footer.terms')}
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 