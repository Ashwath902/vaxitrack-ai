import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function SafeRangeConfigModal({ isOpen, onClose }) {
  const { safeRange, updateSafeRange } = useColdChain();
  const [minVal, setMinVal] = useState(safeRange.min.toString());
  const [maxVal, setMaxVal] = useState(safeRange.max.toString());

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateSafeRange(minVal, maxVal);
    onClose();
  };

  const handleResetWHO = () => {
    setMinVal('2.0');
    setMaxVal('8.0');
    updateSafeRange('2.0', '8.0');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>
            <Sliders size={20} color="#0D9488" />
            Configure Safe Temperature Range
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>
              Define the cold-chain telemetry thresholds for automated excursion detection and batch quarantine rules.
              The standard WHO recommendation for routine vaccine cold-chain distribution is <strong>2.0°C to 8.0°C</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Lower Limit Min (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={minVal}
                  onChange={e => setMinVal(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Standard: 2.0°C</span>
              </div>

              <div className="form-group">
                <label>Upper Limit Max (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={maxVal}
                  onChange={e => setMaxVal(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Standard: 8.0°C</span>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Rule Trigger Behavior:
              </div>
              <ul style={{ fontSize: '0.76rem', color: '#64748B', paddingLeft: '18px', lineHeight: 1.6 }}>
                <li>Readings &gt; {maxVal || '8.0'}°C: Critical Excursion &amp; immediate quarantine flag.</li>
                <li>Readings &lt; {minVal || '2.0'}°C: Critical Freezing Risk alert.</li>
                <li>Readings between {minVal || '2.0'}°C and {maxVal || '8.0'}°C: Optimal thermal envelope.</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="action-btn ack"
              onClick={handleResetWHO}
              style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              Reset to WHO 2–8°C
            </button>
            <button type="button" className="action-btn ack" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-header-action primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
