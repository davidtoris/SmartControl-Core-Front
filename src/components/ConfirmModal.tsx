import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'confirm' | 'alert' | 'success' | 'warning';
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}: ConfirmModalProps) {
  let icon = <Info size={22} color="var(--brand-blue)" />;
  let iconBg = 'rgba(15, 56, 105, 0.08)';
  let btnColor = 'var(--brand-blue)';
  let shadowColor = 'rgba(15, 56, 105, 0.15)';

  if (type === 'warning') {
    icon = <AlertCircle size={22} color="var(--brand-yellow)" />;
    iconBg = 'rgba(229, 169, 59, 0.12)';
    btnColor = 'var(--brand-yellow)';
    shadowColor = 'rgba(229, 169, 59, 0.15)';
  } else if (type === 'confirm') {
    icon = <AlertTriangle size={22} color="#ef4444" />;
    iconBg = 'rgba(239, 68, 68, 0.1)';
    btnColor = '#ef4444';
    shadowColor = 'rgba(239, 68, 68, 0.15)';
  } else if (type === 'success') {
    icon = <CheckCircle2 size={22} color="#10b981" />;
    iconBg = 'rgba(16, 185, 129, 0.1)';
    btnColor = '#10b981';
    shadowColor = 'rgba(16, 185, 129, 0.15)';
  }

  const footer = (
    <>
      {type === 'confirm' && (
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          {cancelText}
        </button>
      )}
      <button
        onClick={() => {
          if (onConfirm) onConfirm();
          onClose();
        }}
        style={{
          padding: '10px 24px',
          background: btnColor,
          border: 'none',
          borderRadius: '8px',
          color: btnColor === 'var(--brand-yellow)' ? '#081c33' : 'white',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: `0 4px 10px ${shadowColor}`,
          transition: 'var(--transition)'
        }}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="420px"
      icon={
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: btnColor === 'var(--brand-yellow)' ? '#e5a93b' : btnColor
        }}>
          {icon}
        </div>
      }
      footer={footer}
    >
      <p style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        margin: 0
      }}>
        {message}
      </p>
    </Modal>
  );
}
