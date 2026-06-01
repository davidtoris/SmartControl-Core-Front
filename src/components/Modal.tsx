import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidth = '520px',
  maxHeight = '90vh',
  footer
}: ModalProps) {
  // Prevent background scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(8, 28, 51, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card"
        style={{
          width: '100%',
          maxWidth,
          maxHeight,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-hover)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }}
      >
        {/* Cabecera del Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(15, 56, 105, 0.015)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {title}
              </h3>
              {subtitle && (
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(15,56,105,0.05)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {children}
        </div>

        {/* Footer del Modal (Opcional) */}
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            background: 'rgba(15, 56, 105, 0.015)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            flexShrink: 0
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
