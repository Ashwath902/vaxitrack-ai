import React from 'react';
import {
  X,
  MapPin,
  Thermometer,
  ShieldAlert,
  Battery,
  Droplets,
  Clock,
  Truck,
  Box,
  FileCheck2,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import StatusBadge from '../Common/StatusBadge';

export default function ShipmentDetailModal({ shipment, onClose }) {
  const { safeRange, simulateExcursion, setActiveTab, batches } = useColdChain();

  if (!shipment) return null;

  const associatedBatch = batches.find(b => b.batchId === shipment.batchId);

  const handleSimulateThis = () => {
    simulateExcursion(shipment.id);
  };

  const handleJumpToBatch = () => {
    onClose();
    setActiveTab('batches');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content wide" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: shipment.isExcursion ? '#FFE4E6' : '#CCFBF1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: shipment.isExcursion ? '#E11D48' : '#0D9488'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {shipment.id}
                <StatusBadge status={shipment.status} isExcursion={shipment.isExcursion} />
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '2px 0 0' }}>
                {shipment.vaccine} • Batch: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{shipment.batchId}</span>
              </p>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Excursion Warning Banner if active */}
          {shipment.isExcursion && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={24} color="#E11D48" />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#9F1239' }}>
                    Active Thermal Excursion Warning ({shipment.currentTemp}°C)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#881337', marginTop: '2px' }}>
                    Temperature exceeds maximum safe limit ({safeRange.max}°C). Batch {shipment.batchId} has been placed in quarantine for review.
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="action-btn quarantine"
                onClick={handleJumpToBatch}
              >
                <span>Inspect Batch</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Current Temperature
              </div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: shipment.isExcursion ? '#E11D48' : '#0D9488',
                marginTop: '4px'
              }}>
                {shipment.currentTemp.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Target: {safeRange.min}–{safeRange.max}°C
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Doses
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', marginTop: '4px' }}>
                {shipment.doses.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Intact Packaging
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Telemetry Battery
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', marginTop: '4px' }}>
                {shipment.batteryPercent}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10B981' }}>
                ● Active Transmitter
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Relative Humidity
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#0F172A', marginTop: '4px' }}>
                {shipment.humidity}%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                Ambient: {shipment.ambientTemp}°C
              </div>
            </div>
          </div>

          {/* Logistics Route Overview */}
          <div style={{
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Origin Facility
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {shipment.origin}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0D9488' }}>
              <ArrowRight size={18} />
              <span style={{ fontSize: '0.76rem', fontWeight: 600 }}>{shipment.carrier}</span>
              <ArrowRight size={18} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                Destination Depository
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                {shipment.destination}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0D9488', fontWeight: 600, marginTop: '2px' }}>
                ETA: {shipment.eta} ({shipment.milesRemaining} mi remaining)
              </div>
            </div>
          </div>

          {/* Synthetic GPS Breadcrumbs Timeline */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px'
            }}>
              <h4 style={{
                fontSize: '0.96rem',
                fontWeight: 700,
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Navigation size={18} color="#0D9488" />
                <span>Synthetic GPS Breadcrumbs &amp; Transit Telemetry</span>
              </h4>
              <span style={{
                fontSize: '0.72rem',
                color: '#64748B',
                background: '#F1F5F9',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                Simulated Waypoint Log
              </span>
            </div>

            <div className="gps-timeline">
              {shipment.gpsBreadcrumbs.map((wp, index) => {
                const isCurrent = wp.status === 'current';
                const isCompleted = wp.status === 'completed';
                const isUpcoming = wp.status === 'upcoming';
                const isExcursionWp = isCurrent && shipment.isExcursion;

                return (
                  <div
                    key={wp.id}
                    className={`gps-point-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isExcursionWp ? 'excursion' : ''}`}
                  >
                    <div className="gps-marker-icon">
                      {isCompleted && <CheckCircle2 size={13} />}
                      {isCurrent && !isExcursionWp && <MapPin size={13} />}
                      {isExcursionWp && <AlertTriangle size={13} />}
                      {isUpcoming && <span>{index + 1}</span>}
                    </div>

                    <div className="gps-point-card" style={{
                      borderColor: isExcursionWp ? '#FECDD3' : undefined,
                      background: isExcursionWp ? '#FFF5F6' : undefined
                    }}>
                      <div className="gps-point-info">
                        <h5>
                          {wp.name}
                          {isCurrent && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '0.68rem',
                              background: isExcursionWp ? '#E11D48' : '#06B6D4',
                              color: '#FFFFFF',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}>
                              {isExcursionWp ? 'CURRENT EXCURSION POINT' : 'CURRENT WAYPOINT'}
                            </span>
                          )}
                        </h5>
                        <p>{wp.location} • {wp.time} • Carrier: <strong>{wp.carrier}</strong></p>
                        <p style={{ marginTop: '4px', color: isExcursionWp ? '#9F1239' : '#475569', fontWeight: isExcursionWp ? 600 : 400 }}>
                          {wp.note}
                        </p>
                      </div>

                      {wp.temp !== null && (
                        <div className="gps-telemetry-badge" style={{
                          background: (wp.temp > safeRange.max || wp.temp < safeRange.min) ? '#FFE4E6' : '#CCFBF1',
                          color: (wp.temp > safeRange.max || wp.temp < safeRange.min) ? '#E11D48' : '#0F766E'
                        }}>
                          {wp.temp.toFixed(1)}°C
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {!shipment.isExcursion && (
            <button
              type="button"
              className="action-btn"
              onClick={handleSimulateThis}
              style={{
                marginRight: 'auto',
                background: '#FFE4E6',
                border: '1px solid #FECDD3',
                color: '#BE123C',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Flame size={14} />
              Simulate Excursion on {shipment.id}
            </button>
          )}

          {associatedBatch && (
            <button
              type="button"
              className="action-btn ack"
              onClick={handleJumpToBatch}
            >
              <Box size={14} />
              View Batch {shipment.batchId}
            </button>
          )}

          <button type="button" className="btn-header-action primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
