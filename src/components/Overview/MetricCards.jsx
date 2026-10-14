import React from 'react';
import {
  Truck,
  AlertTriangle,
  ShieldCheck,
  Boxes,
  FileCheck2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function MetricCards() {
  const {
    shipments,
    activeExcursionsCount,
    inRangeShipmentsCount,
    inRangePercent,
    quarantinedBatchesCount,
    custodyLogs,
    setActiveTab
  } = useColdChain();

  const metrics = [
    {
      id: 'shipments',
      title: 'Monitored Shipments',
      value: shipments.length,
      subtext: `${inRangeShipmentsCount} in optimal transit`,
      icon: Truck,
      colorClass: 'teal',
      badge: 'Active Fleet',
      badgeClass: 'success',
      onClick: () => setActiveTab('shipments'),
    },
    {
      id: 'excursions',
      title: 'Active Excursions',
      value: activeExcursionsCount,
      subtext: activeExcursionsCount > 0 ? 'Urgent SOP triage needed' : '0 thermal breaches',
      icon: AlertTriangle,
      colorClass: activeExcursionsCount > 0 ? 'rose' : 'emerald',
      badge: activeExcursionsCount > 0 ? 'CRITICAL' : 'Compliant',
      badgeClass: activeExcursionsCount > 0 ? 'danger' : 'success',
      onClick: () => setActiveTab('alerts'),
    },
    {
      id: 'inRange',
      title: 'Cold-Chain Integrity',
      value: `${inRangePercent}%`,
      subtext: 'Within 2.0°C – 8.0°C threshold',
      icon: ShieldCheck,
      colorClass: parseFloat(inRangePercent) === 100 ? 'emerald' : 'amber',
      badge: parseFloat(inRangePercent) >= 95 ? 'Target Met' : 'Attention',
      badgeClass: parseFloat(inRangePercent) >= 95 ? 'success' : 'warning',
      onClick: () => setActiveTab('overview'),
    },
    {
      id: 'batches',
      title: 'Batches on Hold',
      value: quarantinedBatchesCount,
      subtext: quarantinedBatchesCount > 0 ? 'Pending QA authorization' : 'All batches released/in transit',
      icon: Boxes,
      colorClass: quarantinedBatchesCount > 0 ? 'rose' : 'indigo',
      badge: quarantinedBatchesCount > 0 ? 'Action Req.' : 'Standard',
      badgeClass: quarantinedBatchesCount > 0 ? 'danger' : 'success',
      onClick: () => setActiveTab('batches'),
    },
    {
      id: 'custody',
      title: 'Custody Handoffs',
      value: custodyLogs.length,
      subtext: '100% digital seal verification',
      icon: FileCheck2,
      colorClass: 'indigo',
      badge: 'Verified',
      badgeClass: 'success',
      onClick: () => setActiveTab('custody'),
    }
  ];

  return (
    <div className="kpi-grid">
      {metrics.map(m => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`kpi-card ${m.colorClass}`}
            onClick={m.onClick}
            style={{ cursor: 'pointer' }}
            title={`Click to open ${m.title}`}
          >
            <div className="kpi-header">
              <span className="kpi-title">{m.title}</span>
              <div className={`kpi-icon-wrapper ${m.colorClass}`}>
                <Icon size={19} />
              </div>
            </div>

            <div className="kpi-value-row">
              <span className="kpi-value">{m.value}</span>
            </div>

            <div className="kpi-subtext">
              <span className={`kpi-badge ${m.badgeClass}`}>{m.badge}</span>
              <span>{m.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
