import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Box
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import AlertAckModal from './AlertAckModal';

export default function AlertsTable() {
  const {
    alerts,
    shipments,
    batches,
    setSelectedShipmentId,
    setActiveTab,
    flagBatchForQuarantine,
    simulateExcursion
  } = useColdChain();

  const [activeAlertForAck, setActiveAlertForAck] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'unacked', 'critical'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    if (filterMode === 'unacked' && alert.acknowledged) return false;
    if (filterMode === 'critical' && alert.severity !== 'CRITICAL') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.id.toLowerCase().includes(q) ||
        alert.shipmentId.toLowerCase().includes(q) ||
        alert.vaccine.toLowerCase().includes(q) ||
        (alert.notes && alert.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenShipment = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setActiveTab('shipments');
  };

  const handleInspectBatch = (shipmentId) => {
    const s = shipments.find(item => item.id === shipmentId);
    if (s) {
      setActiveTab('batches');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Control Toolbar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterMode('all')}
            style={{
              background: filterMode === 'all' ? '#0D9488' : '#F1F5F9',
              color: filterMode === 'all' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            All Incidents ({alerts.length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterMode('unacked')}
            style={{
              background: filterMode === 'unacked' ? '#E11D48' : '#F1F5F9',
              color: filterMode === 'unacked' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Pending Acknowledgment ({alerts.filter(a => !a.acknowledged).length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterMode('critical')}
            style={{
              background: filterMode === 'critical' ? '#F43F5E' : '#F1F5F9',
              color: filterMode === 'critical' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Critical Only ({alerts.filter(a => a.severity === 'CRITICAL').length})
          </button>
        </div>

        {/* Search Field & Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search alerts, shipment ID..."
              className="table-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <button
            type="button"
            className="action-btn"
            onClick={() => simulateExcursion('SHP-8821')}
            style={{
              background: '#FFF1F2',
              color: '#BE123C',
              border: '1px solid #FECDD3',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Flame size={14} />
            <span>Simulate Excursion</span>
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div className="table-title">
            <AlertTriangle size={19} color="#E11D48" />
            <span>Thermal Excursion Incident Audit Log</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Real-time rule-based trip points with mandatory operator acknowledgments
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Excursion Temp</th>
                <th>Timestamp</th>
                <th>Shipment / Formulation</th>
                <th>Acknowledgment Status</th>
                <th>Incident SOP Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => {
                const isCritical = alert.severity === 'CRITICAL';
                return (
                  <tr key={alert.id} className={!alert.acknowledged ? 'row-excursion' : ''}>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isCritical ? '#FFE4E6' : '#FEF3C7',
                        color: isCritical ? '#9F1239' : '#92400E',
                        border: `1px solid ${isCritical ? '#FECDD3' : '#FDE68A'}`
                      }}>
                        <AlertTriangle size={12} />
                        {alert.severity}
                      </span>
                    </td>

                    <td>
                      <span className="mono-cell" style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: alert.temperature > 8.0 ? '#E11D48' : '#D97706'
                      }}>
                        {alert.temperature.toFixed(1)}°C
                      </span>
                    </td>

                    <td>
                      <div className="mono-cell" style={{ fontSize: '0.76rem', color: '#334155' }}>
                        {alert.timestamp}
                      </div>
                    </td>

                    <td>
                      <div
                        style={{ fontWeight: 700, color: '#0D9488', cursor: 'pointer' }}
                        onClick={() => handleOpenShipment(alert.shipmentId)}
                        title="Click to view shipment details"
                      >
                        {alert.shipmentId}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {alert.vaccine}
                      </div>
                    </td>

                    <td>
                      {alert.acknowledged ? (
                        <div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#166534',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <CheckCircle2 size={14} color="#16A34A" />
                            <span>Acknowledged</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                            By {alert.acknowledgedBy} at {alert.acknowledgedAt}
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          background: '#FFE4E6',
                          color: '#BE123C',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          <Clock size={11} />
                          Action Required
                        </span>
                      )}
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4 }}>
                        {alert.notes || 'Automated sensor alert.'}
                      </div>
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {!alert.acknowledged ? (
                          <button
                            type="button"
                            className="btn-header-action primary"
                            style={{ padding: '5px 10px', fontSize: '0.74rem' }}
                            onClick={() => setActiveAlertForAck(alert)}
                          >
                            <ShieldCheck size={13} />
                            <span>Acknowledge</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="action-btn ack"
                            onClick={() => setActiveAlertForAck(alert)}
                            style={{ fontSize: '0.72rem' }}
                          >
                            Update Notes
                          </button>
                        )}

                        <button
                          type="button"
                          className="action-btn ack"
                          onClick={() => handleOpenShipment(alert.shipmentId)}
                          title="Open shipment GPS and sensor telemetry"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <CheckCircle2 size={28} color="#10B981" />
            </div>
            <h4>No active alerts match your criteria</h4>
            <p>Thermal excursions will automatically register here as soon as sensors breach the 2°C–8°C safe bounds.</p>
          </div>
        )}
      </div>

      {/* Acknowledgment Modal */}
      {activeAlertForAck && (
        <AlertAckModal
          alert={activeAlertForAck}
          onClose={() => setActiveAlertForAck(null)}
        />
      )}
    </div>
  );
}
