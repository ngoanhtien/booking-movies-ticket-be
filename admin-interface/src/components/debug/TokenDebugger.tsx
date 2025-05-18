import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import axios from 'axios';

const TokenDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const checkToken = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      
      let info = 'TOKEN DEBUG INFO:\n';
      info += `Token exists: ${!!token}\n`;
      info += `Token preview: ${token ? `${token.substring(0, 30)}...` : 'None'}\n`;
      info += `Refresh token exists: ${!!refreshToken}\n`;
      info += `Token expires at: ${expiresAt ? new Date(parseInt(expiresAt)).toLocaleString() : 'Unknown'}\n`;
      info += `Token expired: ${expiresAt ? Date.now() > parseInt(expiresAt) : 'Unknown'}\n\n`;
      
      // Test API call
      if (token) {
        info += 'Testing API call with token...\n';
        try {
          const response = await axios.get('/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          info += `API call successful! Status: ${response.status}\n`;
          info += `Response: ${JSON.stringify(response.data).substring(0, 100)}...\n`;
        } catch (error: any) {
          info += `API call failed! ${error.message}\n`;
          if (error.response) {
            info += `Status: ${error.response.status}\n`;
            info += `Response: ${JSON.stringify(error.response.data).substring(0, 100)}...\n`;
          }
        }
      }
      
      setDebugInfo(info);
    } catch (error: any) {
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial render
  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
      <Typography variant="h6" gutterBottom>Authentication Debugger</Typography>
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ 
        p: 1.5, 
        bgcolor: '#000', 
        color: '#0f0', 
        borderRadius: 1, 
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        height: '150px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        mb: 2
      }}>
        {isLoading ? 'Loading...' : debugInfo}
      </Box>
      
      <Button 
        variant="contained" 
        size="small" 
        onClick={checkToken} 
        disabled={isLoading}
        sx={{ mr: 1 }}
      >
        Refresh Debug Info
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        color="error" 
        onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('tokenExpiresAt');
          window.location.reload();
        }}
      >
        Clear Tokens
      </Button>
    </Paper>
  );
};

export default TokenDebugger; 