import React, { useState } from 'react';
import {
  FileCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  MapPin,
  Thermometer,
  ShieldCheck,
  UserCheck,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import NewHandoffModal from './NewHandoffModal';

export default function CustodyLogs() {
  const {
    custodyLogs,
    setSelectedShipmentId,
    setActiveTab,
    safeRange
  } = useColdChain();

  const [isHandoffModalOpen, setIsHandoffModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = custodyLogs.filter(log => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        log.shipmentId.toLowerCase().includes(q) ||
        log.sender.toLowerCase().includes(q) ||
        log.receiver.toLowerCase().includes(q) ||
        log.location.toLowerCase().includes(q) ||
        log.verificationMethod.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenShipment = (shipmentId) => {
    setSelectedShipmentId(shipmentId);
    setActiveTab('shipments');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search sender, receiver, checkpoint..."
              className="table-search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', width: '280px' }}
            />
          </div>
        </div>

        <button
          type="button"
          className="btn-header-action primary"
          onClick={() => setIsHandoffModalOpen(true)}
        >
          <PlusCircle size={16} />
          <span>Record New Handoff</span>
        </button>
      </div>

      {/* Custody Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div className="table-title">
            <FileCheck size={19} color="#0D9488" />
            <span>Digital Chain of Custody &amp; Handoff Audit Trail</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Cryptographically sealed custody records with handoff temperatures
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Handoff ID</th>
                <th>Shipment ID</th>
                <th>Releasing Sender</th>
                <th>Receiving Party</th>
                <th>Location / Checkpoint</th>
                <th>Handoff Temp</th>
                <th>Verification Protocol</th>
                <th>Integrity Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const temp = log.temperatureAtHandoff;
                const isTempExcursion = temp > safeRange.max || temp < safeRange.min;

                return (
                  <tr key={log.id}>
                    <td className="mono-cell">
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{log.id}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{log.timestamp}</div>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="action-btn ack"
                        onClick={() => handleOpenShipment(log.shipmentId)}
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        <span className="mono-cell">{log.shipmentId}</span>
                        <ArrowRight size={11} />
                      </button>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                        {log.sender}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                        {log.receiver}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                        <MapPin size={13} color="#94A3B8" />
                        <span>{log.location}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Thermometer size={14} color={isTempExcursion ? '#E11D48' : '#0D9488'} />
                        <span className="mono-cell" style={{
                          fontWeight: 700,
                          color: isTempExcursion ? '#E11D48' : '#0F172A'
                        }}>
                          {temp.toFixed(1)}°C
                        </span>
                      </div>
                    </td>

                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#F0FDFA',
                        color: '#0F766E',
                        border: '1px solid #99F6E4',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}>
                        <ShieldCheck size={12} />
                        {log.verificationMethod}
                      </span>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {log.notes}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileCheck size={28} />
            </div>
            <h4>No custody handoff logs match your criteria</h4>
            <p>Use "Record New Handoff" to simulate an in-transit transfer.</p>
          </div>
        )}
      </div>

      {/* Record New Handoff Modal */}
      <NewHandoffModal
        isOpen={isHandoffModalOpen}
        onClose={() => setIsHandoffModalOpen(false)}
      />
    </div>
  );
}
