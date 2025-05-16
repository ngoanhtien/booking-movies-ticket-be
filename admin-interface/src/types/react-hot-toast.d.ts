// Type definitions for react-hot-toast
// This helps TypeScript recognize the toast module and its properties

declare module 'react-hot-toast' {
  export interface Toast {
    id: string;
    type?: 'success' | 'error' | 'loading' | 'blank' | 'custom';
    message?: string;
    icon?: React.ReactNode;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    ariaProps?: {
      role: string;
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    iconTheme?: {
      primary: string;
      secondary: string;
    };
  }

  interface ToastOptions {
    id?: string;
    icon?: React.ReactNode;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    style?: React.CSSProperties;
    className?: string;
    ariaProps?: {
      role: string;
      'aria-live': 'assertive' | 'off' | 'polite';
    };
    iconTheme?: {
      primary: string;
      secondary: string;
    };
  }

  interface ToastHandler {
    (message: string, options?: ToastOptions): string;
  }

  interface Toast {
    success: ToastHandler;
    error: ToastHandler;
    loading: ToastHandler;
    custom: (element: JSX.Element, options?: ToastOptions) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId: string) => void;
  }

  const toast: Toast;
  
  export { toast };
} 