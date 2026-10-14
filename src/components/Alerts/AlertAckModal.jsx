import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function AlertAckModal({ alert, onClose }) {
  const { acknowledgeAlert } = useColdChain();
  const [operatorName, setOperatorName] = useState('Dr. S. Patel (QA Logistics Lead)');
  const [notes, setNotes] = useState('Cold-chain deviation logged. Destination facility notified to prepare auxiliary cold locker.');

  if (!alert) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    acknowledgeAlert(alert.id, notes, operatorName);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>
            <ShieldCheck size={20} color="#0D9488" />
            Acknowledge Excursion Incident
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <AlertTriangle size={24} color="#E11D48" />
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#9F1239' }}>
                  Incident {alert.id} • {alert.shipmentId}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#881337', marginTop: '2px' }}>
                  {alert.vaccine} recorded {alert.temperature}°C at {alert.timestamp}.
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Acknowledging Cold-Chain Officer / Operator</label>
              <input
                type="text"
                className="form-input"
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Operational Response &amp; SOP Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Detail SOP actions taken, carrier communications, or secondary coolant inspection..."
                required
              />
            </div>

            <div style={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
              By acknowledging, you confirm receipt of this thermal excursion telemetry alert and record this action to the official cold-chain compliance audit trail.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="action-btn ack" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-header-action primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              Confirm Acknowledgment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
