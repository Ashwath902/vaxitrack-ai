import React from 'react';
import { ArrowUpRight, Truck, MapPin, Battery, Thermometer, ShieldAlert } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import StatusBadge from '../Common/StatusBadge';

export default function ActiveShipmentsSummary() {
  const { shipments, setSelectedShipmentId, setActiveTab } = useColdChain();

  const handleOpenDetail = (id) => {
    setSelectedShipmentId(id);
    setActiveTab('shipments');
  };

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <div className="table-title">
          <Truck size={19} color="#0D9488" />
          <span>Active In-Transit Shipments ({shipments.length})</span>
        </div>
        <button
          type="button"
          className="btn-header-action outline"
          onClick={() => setActiveTab('shipments')}
          style={{ fontSize: '0.78rem' }}
        >
          <span>View All Shipments</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Shipment ID</th>
              <th>Vaccine Formulation</th>
              <th>Current Temp</th>
              <th>Destination</th>
              <th>Carrier</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments.map(s => {
              return (
                <tr
                  key={s.id}
                  className={s.isExcursion ? 'row-excursion' : ''}
                  onClick={() => handleOpenDetail(s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="mono-cell">
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{s.id}</span>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{s.batchId}</div>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{s.vaccine}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {s.doses.toLocaleString()} doses
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Thermometer size={16} color={s.isExcursion ? '#E11D48' : '#0D9488'} />
                      <span className="mono-cell" style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: s.isExcursion ? '#E11D48' : '#0F172A'
                      }}>
                        {s.currentTemp.toFixed(1)}°C
                      </span>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <MapPin size={13} color="#94A3B8" />
                      <span style={{ fontWeight: 500 }}>{s.destination.split(',')[0]}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>ETA: {s.eta}</div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#334155' }}>{s.carrier.split('•')[0]}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Battery size={11} color="#10B981" />
                      <span>{s.batteryPercent}% bat</span>
                    </div>
                  </td>

                  <td>
                    <StatusBadge
                      status={s.status}
                      isExcursion={s.isExcursion}
                    />
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="action-btn ack"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(s.id);
                      }}
                    >
                      <span>Telemetry &amp; GPS</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
