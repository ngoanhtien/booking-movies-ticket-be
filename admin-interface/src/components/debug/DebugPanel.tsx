import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';
import axios from '../../utils/axios';

const DebugPanel: React.FC = () => {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<Array<{endpoint: string, success: boolean, message: string}>>([]);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('token');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      setToken(storedToken ? `${storedToken.substring(0, 20)}...` : 'None');
      
      if (expiresAt) {
        const expiry = parseInt(expiresAt);
        const now = Date.now();
        const isExpired = now > expiry;
        
        setTokenExpiry(isExpired 
          ? `Expired (${new Date(expiry).toLocaleTimeString()})` 
          : `Valid until ${new Date(expiry).toLocaleTimeString()}`);
      } else {
        setTokenExpiry('Unknown');
      }
      
      if (!storedToken) {
        setAuthStatus('Not logged in');
        return;
      }
      
      // Test the token with user/me endpoint
      const response = await axios.get('/user/me');
      
      if (response.data && response.status === 200) {
        setAuthStatus('Authenticated');
      } else {
        setAuthStatus('Invalid token');
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      setAuthStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(endpoint);
      
      setTestResults(prev => [
        { 
          endpoint, 
          success: true, 
          message: `Status: ${response.status}, Data: ${JSON.stringify(response.data).substring(0, 100)}...`
        },
        ...prev
      ]);
    } catch (error: any) {
      setTestResults(prev => [
        { 
          endpoint, 
          success: false, 
          message: `Error: ${error.message} ${error.response ? `(Status: ${error.response.status})` : ''}`
        },
        ...prev
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshToken = async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        setTestResults(prev => [
          { endpoint: 'Token Refresh', success: false, message: 'No refresh token available' },
          ...prev
        ]);
        return;
      }
      
      // Try both refresh endpoints
      try {
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        if (response.data) {
          let newToken = null;
          if (response.data.accessToken) {
            newToken = response.data.accessToken;
          } else if (response.data.result && response.data.result.accessToken) {
            newToken = response.data.result.accessToken;
          }
          
          if (newToken) {
            localStorage.setItem('token', newToken);
            setTestResults(prev => [
              { endpoint: 'Token Refresh', success: true, message: 'Token refreshed successfully' },
              ...prev
            ]);
            checkAuth();
          } else {
            setTestResults(prev => [
              { endpoint: 'Token Refresh', success: false, message: 'No token in response' },
              ...prev
            ]);
          }
        }
      } catch (error) {
        try {
          const response = await axios.post('/auth/refresh-token', { refreshToken });
          
          if (response.data) {
            let newToken = null;
            if (response.data.accessToken) {
              newToken = response.data.accessToken;
            } else if (response.data.result && response.data.result.accessToken) {
              newToken = response.data.result.accessToken;
            }
            
            if (newToken) {
              localStorage.setItem('token', newToken);
              setTestResults(prev => [
                { endpoint: 'Token Refresh', success: true, message: 'Token refreshed successfully with alternate endpoint' },
                ...prev
              ]);
              checkAuth();
            } else {
              setTestResults(prev => [
                { endpoint: 'Token Refresh', success: false, message: 'No token in response from alternate endpoint' },
                ...prev
              ]);
            }
          }
        } catch (error: any) {
          setTestResults(prev => [
            { endpoint: 'Token Refresh', success: false, message: `All refresh attempts failed: ${error.message}` },
            ...prev
          ]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={() => setExpanded(!expanded)}
      sx={{ mb: 2, overflow: 'hidden' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BugReportIcon sx={{ mr: 1 }} color="action" />
          <Typography variant="subtitle1">Debug Panel</Typography>
          <Chip 
            label={authStatus} 
            color={authStatus === 'Authenticated' ? 'success' : 'error'}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Authentication Status</Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Status:</strong> {authStatus}
            </Typography>
            <Typography variant="body2">
              <strong>Token:</strong> {token || 'None'}
            </Typography>
            <Typography variant="body2">
              <strong>Expires:</strong> {tokenExpiry || 'Unknown'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={checkAuth} 
              disabled={isLoading}
            >
              Check Auth
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={refreshToken} 
              disabled={isLoading}
              color="secondary"
            >
              Refresh Token
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('tokenExpiresAt');
                checkAuth();
              }} 
              disabled={isLoading}
              color="error"
            >
              Clear Tokens
            </Button>
            {isLoading && <CircularProgress size={24} />}
          </Box>
        </Paper>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Test API Endpoints</Typography>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => testEndpoint('/user/me')} 
              disabled={isLoading}
            >
              Test /user/me
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => testEndpoint('/movie/showing')} 
              disabled={isLoading}
            >
              Test /movie/showing
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => testEndpoint('/payment/test-booking')} 
              disabled={isLoading}
            >
              Test Booking
            </Button>
          </Box>
        </Paper>
        
        {testResults.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Test Results</Typography>
            <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
              {testResults.map((result, index) => (
                <Alert 
                  key={index} 
                  severity={result.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {result.endpoint}
                  </Typography>
                  <Typography variant="body2">
                    {result.message}
                  </Typography>
                </Alert>
              ))}
            </Box>
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setTestResults([])} 
              sx={{ mt: 1 }}
            >
              Clear Results
            </Button>
          </Paper>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default DebugPanel; 