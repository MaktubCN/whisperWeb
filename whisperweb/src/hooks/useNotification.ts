import { useState, useCallback } from 'react';
import { NotificationState, NotificationType, initialNotificationState } from '../components/Notification';

const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>(initialNotificationState);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    setNotification({
      open: true,
      message,
      type,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  const notificationProps = {
    open: notification.open,
    message: notification.message,
    type: notification.type,
    onClose: hideNotification,
  };

  return {
    showNotification,
    hideNotification,
    notificationProps,
  };
};

export default useNotification;
