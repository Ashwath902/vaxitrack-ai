import React, { useState } from 'react';
import { X, CheckCircle2, FileCheck2, Truck, MapPin } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function NewHandoffModal({ isOpen, onClose }) {
  const { shipments, addCustodyHandoff } = useColdChain();

  const [shipmentId, setShipmentId] = useState(shipments[0]?.id || 'SHP-8821');
  const [sender, setSender] = useState('CryoLogistics Express (Driver T. Adams)');
  const [receiver, setReceiver] = useState('Mt. Sinai Hospital Intake QA (Nurse J. Wong)');
  const [location, setLocation] = useState('Mt. Sinai Receiving Dock Bay 4, New York, NY');
  const [verificationMethod, setVerificationMethod] = useState('Cryptographic NFC Tag + Biometric Touch');
  const [temperature, setTemperature] = useState('4.2');
  const [notes, setNotes] = useState('Pallet thermal wrap inspected. Digital temperature logger verified within safe bounds.');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addCustodyHandoff({
      shipmentId,
      sender,
      receiver,
      location,
      verificationMethod,
      temperature,
      notes,
      timestamp: new Date().toLocaleString()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h3>
            <FileCheck2 size={20} color="#0D9488" />
            Record Custody Transfer Handoff
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Select In-Transit Shipment</label>
              <select
                className="form-select"
                value={shipmentId}
                onChange={e => setShipmentId(e.target.value)}
                required
              >
                {shipments.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.id}: {s.vaccine} ({s.currentTemp}°C)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Releasing Party (Sender)</label>
                <input
                  type="text"
                  className="form-input"
                  value={sender}
                  onChange={e => setSender(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Receiving Party (Receiver)</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiver}
                  onChange={e => setReceiver(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Checkpoint / Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Hand-off Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Verification &amp; Authentication Method</label>
              <select
                className="form-select"
                value={verificationMethod}
                onChange={e => setVerificationMethod(e.target.value)}
              >
                <option value="Cryptographic NFC Tag + Biometric Touch">Cryptographic NFC Tag + Biometric Touch</option>
                <option value="Digital IATA e-Waybill Handshake">Digital IATA e-Waybill Handshake</option>
                <option value="Dual Smart Key Exchange">Dual Smart Key Exchange</option>
                <option value="Tamper-Evident Physical RFID Barcode">Tamper-Evident Physical RFID Barcode</option>
              </select>
            </div>

            <div className="form-group">
              <label>Chain of Custody Verification Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="action-btn ack" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-header-action primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              Confirm Handoff Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
