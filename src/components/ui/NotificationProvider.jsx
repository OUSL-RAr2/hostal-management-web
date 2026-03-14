import React, { useCallback, useMemo, useRef, useState } from 'react';
import './NotificationProvider.css';
import { NotificationContext } from './NotificationContext';

const DEFAULT_DURATION = 3500;

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    tone: 'danger'
  });
  const resolverRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = DEFAULT_DURATION) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const confirm = useCallback((options = {}) => {
    const {
      title = 'Please confirm',
      message = 'Do you want to continue?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      tone = 'danger'
    } = options;

    setConfirmState({
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      tone
    });

    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const closeConfirm = useCallback((result) => {
    if (resolverRef.current) {
      resolverRef.current(result);
      resolverRef.current = null;
    }
    setConfirmState((current) => ({ ...current, open: false }));
  }, []);

  const contextValue = useMemo(() => ({
    showToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    confirm
  }), [showToast, confirm]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`} role="status">
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div className="confirm-overlay" onClick={() => closeConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>{confirmState.title}</h3>
            <p>{confirmState.message}</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel-btn"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`confirm-ok-btn confirm-${confirmState.tone}`}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

