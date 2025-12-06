import { useState, useCallback } from 'react';

export function useAlert() {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, type = 'info') => {
    setAlert({ message, type });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(null);
  }, []);

  const success = useCallback((message) => {
    showAlert(message, 'success');
  }, [showAlert]);

  const error = useCallback((message) => {
    showAlert(message, 'error');
  }, [showAlert]);

  const warning = useCallback((message) => {
    showAlert(message, 'warning');
  }, [showAlert]);

  const info = useCallback((message) => {
    showAlert(message, 'info');
  }, [showAlert]);

  return {
    alert,
    showAlert,
    hideAlert,
    success,
    error,
    warning,
    info
  };
}
