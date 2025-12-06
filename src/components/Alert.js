import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import './Alert.css';

export default function Alert({ message, type = 'info', onClose }) {
  // Lock body scroll when alert is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      case 'warning':
        return <AlertCircle size={24} />;
      default:
        return <Info size={24} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  };

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
        <button className="alert-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={`alert-icon alert-icon-${type}`}>
          {getIcon()}
        </div>
        
        <h3 className="alert-title">{getTitle()}</h3>
        
        <p className="alert-message">{message}</p>
        
        <button className={`alert-button alert-button-${type}`} onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
