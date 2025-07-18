import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { Snackbar, Alert, AlertColor, AlertProps } from '@mui/material';

type ToastVariant = 'filled' | 'outlined' | 'standard';

interface ToastOptions {
  message: string;
  severity?: AlertColor;
  variant?: ToastVariant;
  autoHideDuration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toastOptions, setToastOptions] = useState<ToastOptions>({
    message: '',
    severity: 'success',
    variant: 'filled',
    autoHideDuration: 3000,
  });

  const showToast = useCallback((options: ToastOptions) => {
    setToastOptions({
      message: options.message,
      severity: options.severity || 'success',
      variant: options.variant || 'filled',
      autoHideDuration: options.autoHideDuration || 3000,
    });
    setOpen(true);
  }, []);

  const handleClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={toastOptions.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={toastOptions.severity}
          variant={toastOptions.variant as AlertProps['variant']}
          sx={{ width: '100%' }}
        >
          {toastOptions.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};
