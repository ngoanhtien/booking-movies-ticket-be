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
import SockJS from 'sockjs-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Create a context for the socket
export const SocketContext = createContext<SockJS | null>(null);

const App: React.FC = () => {
  const socketRef = useRef<SockJS | null>(null);

  useEffect(() => {
    // Connect to the SockJS server (update endpoint as needed)
    const sock = new SockJS('/api/v1/websocket');
    socketRef.current = sock;
    // Optionally, add event listeners here (onopen, onclose, onmessage)
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
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
