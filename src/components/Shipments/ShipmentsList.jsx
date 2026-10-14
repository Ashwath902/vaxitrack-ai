import React, { useState } from 'react';
import {
  Truck,
  Thermometer,
  MapPin,
  Battery,
  Droplets,
  Flame,
  ArrowRight,
  Filter,
  Search,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import StatusBadge from '../Common/StatusBadge';
import ShipmentDetailModal from './ShipmentDetailModal';

export default function ShipmentsList() {
  const {
    shipments,
    selectedShipmentId,
    setSelectedShipmentId,
    simulateExcursion,
    safeRange
  } = useColdChain();

  const [filterMode, setFilterMode] = useState('all'); // 'all', 'normal', 'excursion'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShipments = shipments.filter(s => {
    // Filter mode
    if (filterMode === 'normal' && s.isExcursion) return false;
    if (filterMode === 'excursion' && !s.isExcursion) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.vaccine.toLowerCase().includes(q) ||
        s.batchId.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeShipmentForModal = shipments.find(s => s.id === selectedShipmentId) || null;

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
            className={`action-btn ${filterMode === 'all' ? 'ack' : ''}`}
            onClick={() => setFilterMode('all')}
            style={{
              background: filterMode === 'all' ? '#0D9488' : '#F1F5F9',
              color: filterMode === 'all' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            All Shipments ({shipments.length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterMode('normal')}
            style={{
              background: filterMode === 'normal' ? '#10B981' : '#F1F5F9',
              color: filterMode === 'normal' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Within Safe Range ({shipments.filter(s => !s.isExcursion).length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterMode('excursion')}
            style={{
              background: filterMode === 'excursion' ? '#E11D48' : '#F1F5F9',
              color: filterMode === 'excursion' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Excursions ({shipments.filter(s => s.isExcursion).length})
          </button>
        </div>

        {/* Search Field */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search ID, vaccine, destination..."
              className="table-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', width: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* Shipment Cards Grid */}
      <div className="shipments-grid">
        {filteredShipments.map(shipment => {
          return (
            <div
              key={shipment.id}
              className={`shipment-card ${shipment.isExcursion ? 'has-excursion' : ''}`}
              onClick={() => setSelectedShipmentId(shipment.id)}
            >
              <div className="shipment-card-top">
                <div>
                  <div className="shipment-id-badge">
                    <Truck size={16} color={shipment.isExcursion ? '#E11D48' : '#0D9488'} />
                    <span>{shipment.id}</span>
                  </div>
                  <h4 className="vaccine-title">{shipment.vaccine}</h4>
                  <div className="vaccine-batch-tag">
                    Batch: {shipment.batchId} • {shipment.doses.toLocaleString()} doses
                  </div>
                </div>

                <StatusBadge
                  status={shipment.status}
                  isExcursion={shipment.isExcursion}
                />
              </div>

              {/* Temperature Reading Box */}
              <div className={`temp-dial-box ${shipment.isExcursion ? 'excursion' : 'normal'}`}>
                <div>
                  <div className="temp-number-display">
                    <span className="temp-val">{shipment.currentTemp.toFixed(1)}</span>
                    <span className="temp-unit">°C</span>
                  </div>
                  <div className="temp-status-text">
                    {shipment.isExcursion ? 'Critical Excursion' : `Safe Range (${safeRange.min}–${safeRange.max}°C)`}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Battery size={13} color="#10B981" />
                    <span>{shipment.batteryPercent}% bat</span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Droplets size={13} color="#06B6D4" />
                    <span>{shipment.humidity}% hum</span>
                  </div>
                </div>
              </div>

              {/* Origin -> Destination Route */}
              <div className="shipment-route">
                <div className="route-point">
                  <span className="label">Origin</span>
                  <span className="city">{shipment.origin.split(',')[0]}</span>
                </div>
                <div className="route-arrow">➔</div>
                <div className="route-point" style={{ textAlign: 'right' }}>
                  <span className="label">Destination</span>
                  <span className="city">{shipment.destination.split(',')[0]}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="shipment-card-footer">
                <div className="footer-meta">
                  <Clock size={12} color="#94A3B8" />
                  <span>ETA: {shipment.eta}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!shipment.isExcursion && (
                    <button
                      type="button"
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        simulateExcursion(shipment.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#FFF1F2',
                        color: '#BE123C',
                        border: '1px solid #FECDD3',
                        fontSize: '0.7rem'
                      }}
                      title="Simulate temperature excursion on this shipment"
                    >
                      <Flame size={12} />
                      <span>Excursion</span>
                    </button>
                  )}

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0D9488', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    GPS Logs <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredShipments.length === 0 && (
        <div className="empty-state" style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div className="empty-state-icon">
            <Truck size={28} />
          </div>
          <h4>No matching shipments found</h4>
          <p>Try clearing your search query or reset the filter toggle to view all cold-chain shipments.</p>
        </div>
      )}

      {/* Shipment Detail Modal */}
      {activeShipmentForModal && (
        <ShipmentDetailModal
          shipment={activeShipmentForModal}
          onClose={() => setSelectedShipmentId(null)}
        />
      )}
    </div>
  );
}
