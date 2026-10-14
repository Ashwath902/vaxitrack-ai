import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function QAAuthorizeModal({ batch, onClose }) {
  const { authorizeBatchRelease } = useColdChain();
  const [reviewerName, setReviewerName] = useState('Dr. Elena Rostova (Director of QA / Regulatory Affairs)');
  const [justification, setJustification] = useState(
    'Mean Kinetic Temperature (MKT) stability calculation completed. Thermal exposure budget remained within manufacturer stability limits (SOP-704). Batch approved for clinical administration.'
  );

  if (!batch) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    authorizeBatchRelease(batch.batchId, reviewerName, justification);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h3>
            <ShieldCheck size={20} color="#10B981" />
            Authorized QA Batch Release
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <CheckCircle2 size={22} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#166534' }}>
                  Release Sign-off for Batch {batch.batchId}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#14532D', marginTop: '3px' }}>
                  {batch.vaccineName} • {batch.totalDoses.toLocaleString()} doses • Manufacturer: {batch.manufacturer}
                </div>
              </div>
            </div>

            {batch.quarantineReason && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '0.78rem',
                color: '#991B1B'
              }}>
                <strong>Quarantine Hold Reason:</strong> {batch.quarantineReason}
              </div>
            )}

            <div className="form-group">
              <label>Authorized QA Reviewer Name &amp; Title</label>
              <input
                type="text"
                className="form-input"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>QA Stability Assessment &amp; Release Justification</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Reference SOP protocol, MKT analysis, manufacturer stability monograph, and inspection findings..."
                required
              />
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.74rem',
              color: '#64748B',
              lineHeight: 1.45
            }}>
              <strong>Regulatory Notice:</strong> Temperature excursions flag a batch for review; they do not automatically render vaccines spoiled. Release decisions must be based on documented stability budgets per WHO &amp; FDA guidelines.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="action-btn ack" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-header-action primary"
              style={{ background: '#16A34A', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={16} />
              Authorize &amp; Release Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
