import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function ToastNotification() {
  const { toasts, removeToast } = useColdChain();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => {
        let Icon = Info;
        if (toast.type === 'danger') Icon = AlertTriangle;
        if (toast.type === 'success') Icon = CheckCircle;

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <Icon size={20} style={{
              color: toast.type === 'danger' ? '#E11D48' : toast.type === 'success' ? '#10B981' : '#0D9488',
              flexShrink: 0,
              marginTop: '2px'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: '#94A3B8', padding: '2px', borderRadius: '4px' }}
              title="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
