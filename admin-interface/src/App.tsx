import React, { createContext, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import AppRoutes from './routes';
import { store } from './store';
import AuthCheck from './components/AuthCheck';
import './i18n';
import './utils/axios'; // Chỉ cần import để đảm bảo cấu hình được áp dụng
import { io, Socket } from 'socket.io-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create a context for the socket.io socket
export const SocketContext = createContext<Socket | null>(null);

const App: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the socket.io server (update endpoint as needed)
    const socket = io('http://localhost:8080/api/v1/websocket',{
      transports: ['websocket']
    });
    socketRef.current = socket;

    // Log connection events
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });

    // Optionally, add event listeners here (connect, disconnect, message)
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <SocketContext.Provider value={socketRef.current}>
            <BrowserRouter>
              <AuthCheck />
              <AppRoutes />
            </BrowserRouter>
          </SocketContext.Provider>
        </QueryClientProvider>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
