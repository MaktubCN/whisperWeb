// Notification.tsx
import React from 'react';
import { Alert, Snackbar } from '@mui/material';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  open: boolean;
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ open, message, type, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={type} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export interface NotificationState {
  open: boolean;
  message: string;
  type: NotificationType;
}

export const initialNotificationState: NotificationState = {
  open: false,
  message: '',
  type: 'info',
};

export default Notification;
