import React, { useEffect } from 'react';
import { CheckCircle2, AlertOctagon, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  let bg = 'rgba(16, 185, 129, 0.95)'; // Green success
  let icon = <CheckCircle2 size={18} />;
  
  if (type === 'error') {
    bg = 'rgba(239, 68, 68, 0.95)'; // Red error
    icon = <AlertOctagon size={18} />;
  } else if (type === 'warning') {
    bg = 'rgba(245, 158, 11, 0.95)'; // Orange warning
    icon = <AlertTriangle size={18} />;
  } else if (type === 'info') {
    bg = 'rgba(15, 56, 105, 0.95)'; // Navy info
    icon = <Info size={18} />;
  }

  return (
    <div
      className={`toast-float toast-${type}`}
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        background: bg,
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        @keyframes slideDown {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '12px',
          transition: 'all 0.2s',
          outline: 'none'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
      >
        <X size={14} />
      </button>
    </div>
  );
}
