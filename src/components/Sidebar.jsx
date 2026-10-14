import React from 'react';
import {
  LayoutDashboard,
  Truck,
  AlertTriangle,
  Boxes,
  FileCheck,
  Bot,
  Flame,
  RotateCcw,
  Activity,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { useColdChain } from '../context/ColdChainContext';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    shipments,
    alerts,
    batches,
    activeExcursionsCount,
    unacknowledgedAlertsCount,
    quarantinedBatchesCount,
    simulateExcursion,
    resetDemo,
    isSimulatingTelemetry,
    setIsSimulatingTelemetry
  } = useColdChain();

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      badgeType: null
    },
    {
      id: 'shipments',
      label: 'Live Shipments',
      icon: Truck,
      badge: shipments.length,
      badgeType: activeExcursionsCount > 0 ? 'danger' : 'neutral'
    },
    {
      id: 'alerts',
      label: 'Alerts & Incidents',
      icon: AlertTriangle,
      badge: unacknowledgedAlertsCount > 0 ? unacknowledgedAlertsCount : alerts.length,
      badgeType: unacknowledgedAlertsCount > 0 ? 'danger' : 'neutral'
    },
    {
      id: 'batches',
      label: 'Batch Inventory',
      icon: Boxes,
      badge: quarantinedBatchesCount > 0 ? `${quarantinedBatchesCount} Hold` : batches.length,
      badgeType: quarantinedBatchesCount > 0 ? 'danger' : 'neutral'
    },
    {
      id: 'custody',
      label: 'Chain of Custody',
      icon: FileCheck,
      badge: null,
      badgeType: null
    },
    {
      id: 'assistant',
      label: 'AI Incident Copilot',
      icon: Bot,
      badge: 'AI',
      badgeType: 'neutral'
    }
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-wrapper">
          <ShieldCheck size={24} />
        </div>
        <div className="brand-info">
          <h1>
            VaxiTrack <span className="ai-badge">AI</span>
          </h1>
          <p>Cold-Chain Assurance</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge !== null && (
                <span className={`nav-pill ${item.badgeType}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Demo Operations Box */}
        <div className="sidebar-demo-controls">
          <div className="demo-title">
            <Activity size={14} color="#0D9488" />
            <span>Interactive Demo</span>
          </div>

          <button
            type="button"
            className="btn-simulate-excursion"
            onClick={() => simulateExcursion('SHP-8821')}
            title="Spikes temperature of shipment SHP-8821 above 8.0°C to demonstrate rule-based alert & batch quarantine"
          >
            <Flame size={16} />
            <span>Simulate Excursion</span>
          </button>

          <button
            type="button"
            className="btn-reset-demo"
            onClick={resetDemo}
            title="Reset all shipments, alerts, and batches to normal baseline"
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            className="btn-reset-demo"
            onClick={() => setIsSimulatingTelemetry(!isSimulatingTelemetry)}
            style={{ fontSize: '0.74rem' }}
          >
            <Radio size={14} color={isSimulatingTelemetry ? '#10B981' : '#94A3B8'} />
            <span>Telemetry: {isSimulatingTelemetry ? 'Active (Live)' : 'Paused'}</span>
          </button>
        </div>
      </nav>

      {/* Footer / System Status */}
      <div className="sidebar-footer">
        <div className="live-pulse-status">
          <span className={`pulse-dot ${activeExcursionsCount > 0 ? 'danger' : ''}`} />
          <span>{activeExcursionsCount > 0 ? `${activeExcursionsCount} Excursion Active` : 'Cold Chain Nominal'}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', opacity: 0.6 }}>
          v2.4-AI
        </div>
      </div>
    </aside>
  );
}
