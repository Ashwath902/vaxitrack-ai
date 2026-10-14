import React from 'react';
import { AlertTriangle, ArrowRight, Bot, ShieldAlert } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function ExcursionBanner() {
  const { shipments, alerts, setActiveTab, setSelectedShipmentId } = useColdChain();

  const excursionShipment = shipments.find(s => s.isExcursion);
  if (!excursionShipment) return null;

  const handleInspect = () => {
    setSelectedShipmentId(excursionShipment.id);
    setActiveTab('alerts');
  };

  const handleOpenAI = () => {
    setActiveTab('assistant');
  };

  return (
    <div className="excursion-banner" role="alert">
      <div className="excursion-banner-left">
        <div className="banner-alert-icon">
          <ShieldAlert size={22} />
        </div>
        <div className="banner-alert-text">
          <h4>
            <span>Active Temperature Excursion Detected</span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              background: '#E11D48',
              color: '#FFF',
              padding: '1px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem'
            }}>
              {excursionShipment.currentTemp}°C (&gt; 8.0°C Limit)
            </span>
          </h4>
          <p>
            Shipment <strong>{excursionShipment.id}</strong> ({excursionShipment.vaccine}) breached upper safe envelope.
            Batch <strong>{excursionShipment.batchId}</strong> has been auto-flagged for quarantine review per Cold-Chain SOP.
          </p>
        </div>
      </div>

      <div className="banner-actions">
        <button
          type="button"
          className="btn-banner-action danger-outline"
          onClick={handleOpenAI}
        >
          <Bot size={15} />
          <span>AI Triage Advice</span>
        </button>

        <button
          type="button"
          className="btn-banner-action danger-solid"
          onClick={handleInspect}
        >
          <span>Review Incident</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
