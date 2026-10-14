import React, { useState } from 'react';
import {
  Flame,
  RotateCcw,
  Sliders,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useColdChain } from '../context/ColdChainContext';
import SafeRangeConfigModal from './Common/SafeRangeConfigModal';

export default function Topbar() {
  const {
    activeTab,
    safeRange,
    lastTelemetryTick,
    activeExcursionsCount,
    simulateExcursion,
    resetDemo
  } = useColdChain();

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Fleet Operations Overview',
          subtext: 'Real-time telemetry, thermal integrity monitoring, and cold-chain compliance.'
        };
      case 'shipments':
        return {
          title: 'Live Vaccine Shipments',
          subtext: 'Active cold-transport in transit with synthetic GPS breadcrumbs and sensor diagnostics.'
        };
      case 'alerts':
        return {
          title: 'Alerts & Excursion Incidents',
          subtext: 'Automated thermal excursion logs, severity triage, and operational acknowledgments.'
        };
      case 'batches':
        return {
          title: 'Vaccine Batch Inventory',
          subtext: 'Track batch distribution status, automated quarantine holds, and authorized QA releases.'
        };
      case 'custody':
        return {
          title: 'Chain of Custody Logs',
          subtext: 'Immutable handoff records, tamper verification seals, and digital chain acknowledgments.'
        };
      case 'assistant':
        return {
          title: 'VaxiTrack AI Incident Copilot',
          subtext: 'AI-assisted excursion analysis, MKT calculations, and operational SOP recommendations.'
        };
      default:
        return {
          title: 'Cold-Chain Monitoring',
          subtext: 'Automated thermal excursion detection and vaccine logistics control.'
        };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div>
            <h1 className="page-heading">
              {pageInfo.title}
              {activeExcursionsCount > 0 && (
                <span style={{
                  fontSize: '0.72rem',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  background: '#FFE4E6',
                  color: '#9F1239',
                  border: '1px solid #FECDD3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <AlertTriangle size={12} color="#E11D48" />
                  {activeExcursionsCount} Excursion
                </span>
              )}
            </h1>
            <p className="page-subtext">{pageInfo.subtext}</p>
          </div>
        </div>

        <div className="topbar-right">
          {/* Safe Range Badge Config Button */}
          <button
            type="button"
            className="safe-range-badge-btn"
            onClick={() => setIsConfigModalOpen(true)}
            title="Click to configure safe temperature range"
          >
            <Sliders size={14} />
            <span>Safe Range: {safeRange.min.toFixed(1)}°C – {safeRange.max.toFixed(1)}°C</span>
          </button>

          {/* Telemetry Clock Ticker */}
          <div className="telemetry-ticker" title="Synthetic live sensor update cycle">
            <Clock size={13} color="#0D9488" />
            <span>Sync: <strong className="tick-time">{lastTelemetryTick}</strong></span>
          </div>

          {/* Topbar Fast Simulate Button */}
          <button
            type="button"
            className="btn-header-action primary"
            onClick={() => simulateExcursion('SHP-8821')}
            title="Trigger a simulated temperature spike (>8°C) on SHP-8821"
          >
            <Flame size={15} />
            <span>Simulate Excursion</span>
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            className="btn-header-action outline"
            onClick={resetDemo}
            title="Reset system state back to clean initial baseline"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Safe Range Configuration Modal */}
      <SafeRangeConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </>
  );
}
