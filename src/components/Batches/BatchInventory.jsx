import React, { useState } from 'react';
import {
  Boxes,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Building,
  RotateCcw
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import StatusBadge from '../Common/StatusBadge';
import QAAuthorizeModal from './QAAuthorizeModal';

export default function BatchInventory() {
  const {
    batches,
    setSelectedShipmentId,
    setActiveTab,
    flagBatchForQuarantine
  } = useColdChain();

  const [activeBatchForRelease, setActiveBatchForRelease] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Quarantined for Review', 'Released', 'In Transit', 'Within Range'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBatches = batches.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.batchId.toLowerCase().includes(q) ||
        b.vaccineName.toLowerCase().includes(q) ||
        b.manufacturer.toLowerCase().includes(q) ||
        b.assignedShipmentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenShipment = (shipmentId) => {
    if (shipmentId && shipmentId !== 'SHP-ARCHIVED') {
      setSelectedShipmentId(shipmentId);
      setActiveTab('shipments');
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
        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterStatus('all')}
            style={{
              background: filterStatus === 'all' ? '#0D9488' : '#F1F5F9',
              color: filterStatus === 'all' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            All Batches ({batches.length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterStatus('Quarantined for Review')}
            style={{
              background: filterStatus === 'Quarantined for Review' ? '#E11D48' : '#F1F5F9',
              color: filterStatus === 'Quarantined for Review' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Quarantined for Review ({batches.filter(b => b.status === 'Quarantined for Review').length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterStatus('Within Range')}
            style={{
              background: filterStatus === 'Within Range' ? '#10B981' : '#F1F5F9',
              color: filterStatus === 'Within Range' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Within Range ({batches.filter(b => b.status === 'Within Range').length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterStatus('In Transit')}
            style={{
              background: filterStatus === 'In Transit' ? '#2563EB' : '#F1F5F9',
              color: filterStatus === 'In Transit' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            In Transit ({batches.filter(b => b.status === 'In Transit').length})
          </button>

          <button
            type="button"
            className="action-btn"
            onClick={() => setFilterStatus('Released')}
            style={{
              background: filterStatus === 'Released' ? '#166534' : '#F1F5F9',
              color: filterStatus === 'Released' ? '#FFFFFF' : '#475569',
              fontWeight: 600
            }}
          >
            Released ({batches.filter(b => b.status === 'Released').length})
          </button>
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search Batch ID, vaccine, manufacturer..."
            className="table-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', width: '260px' }}
          />
        </div>
      </div>

      {/* Batches Table */}
      <div className="table-container">
        <div className="table-header-bar">
          <div className="table-title">
            <Boxes size={19} color="#0D9488" />
            <span>Vaccine Batch Inventory &amp; Compliance Ledger</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
            Rule-based quarantine enforcement with authorized QA release protocols
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Vaccine Formulation</th>
                <th>Doses / Packaging</th>
                <th>Assigned Shipment</th>
                <th>Expiry Date</th>
                <th>Inventory Status</th>
                <th>Quarantine / QA Notes</th>
                <th style={{ textAlign: 'right' }}>Authorized Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(batch => {
                const isQuarantined = batch.status === 'Quarantined for Review';
                const isReleased = batch.status === 'Released';

                return (
                  <tr key={batch.batchId} className={isQuarantined ? 'row-excursion' : ''}>
                    <td className="mono-cell">
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                        {batch.batchId}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                        Mfg: {batch.mfgDate}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{batch.vaccineName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={11} />
                        <span>{batch.manufacturer}</span>
                      </div>
                    </td>

                    <td>
                      <div className="mono-cell" style={{ fontWeight: 700, color: '#0F172A' }}>
                        {batch.totalDoses.toLocaleString()} doses
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>2°C–8°C Cold Chain</div>
                    </td>

                    <td>
                      {batch.assignedShipmentId !== 'SHP-ARCHIVED' ? (
                        <button
                          type="button"
                          className="action-btn ack"
                          onClick={() => handleOpenShipment(batch.assignedShipmentId)}
                          style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                        >
                          <span className="mono-cell">{batch.assignedShipmentId}</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Archived Storage</span>
                      )}
                    </td>

                    <td>
                      <div className="mono-cell" style={{ fontSize: '0.78rem', color: '#334155' }}>
                        {batch.expiryDate}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={batch.status} />
                    </td>

                    <td style={{ maxWidth: '260px' }}>
                      {isQuarantined ? (
                        <div style={{
                          background: '#FEF2F2',
                          border: '1px solid #FCA5A5',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.72rem',
                          color: '#991B1B',
                          lineHeight: 1.35
                        }}>
                          <strong>Hold Reason:</strong> {batch.quarantineReason}
                        </div>
                      ) : isReleased && batch.qaSignOff ? (
                        <div style={{
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.72rem',
                          color: '#166534',
                          lineHeight: 1.35
                        }}>
                          <strong>QA Sign-off:</strong> {batch.qaSignOff.authorizedBy} ({batch.qaSignOff.timestamp})
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {batch.notes}
                        </div>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {isQuarantined ? (
                        <button
                          type="button"
                          className="action-btn release"
                          onClick={() => setActiveBatchForRelease(batch)}
                          style={{ padding: '6px 12px' }}
                        >
                          <ShieldCheck size={14} />
                          <span>Authorize Release</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-btn"
                          onClick={() => flagBatchForQuarantine(batch.batchId, 'Precautionary operational quarantine hold.')}
                          style={{
                            fontSize: '0.72rem',
                            padding: '4px 8px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#64748B'
                          }}
                        >
                          Hold for Review
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBatches.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Boxes size={28} />
            </div>
            <h4>No vaccine batches match your filter</h4>
            <p>Try switching to "All Batches" to view the complete inventory.</p>
          </div>
        )}
      </div>

      {/* QA Authorization Modal */}
      {activeBatchForRelease && (
        <QAAuthorizeModal
          batch={activeBatchForRelease}
          onClose={() => setActiveBatchForRelease(null)}
        />
      )}
    </div>
  );
}
