import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  INITIAL_SHIPMENTS,
  INITIAL_BATCHES,
  INITIAL_ALERTS,
  INITIAL_CUSTODY_LOGS,
  INITIAL_SAFE_RANGE,
} from '../data/initialData';

const ColdChainContext = createContext(null);

export function ColdChainProvider({ children }) {
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [batches, setBatches] = useState(INITIAL_BATCHES);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [custodyLogs, setCustodyLogs] = useState(INITIAL_CUSTODY_LOGS);
  const [safeRange, setSafeRange] = useState(INITIAL_SAFE_RANGE);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isSimulatingTelemetry, setIsSimulatingTelemetry] = useState(true);
  const [lastTelemetryTick, setLastTelemetryTick] = useState(new Date().toLocaleTimeString());
  const [demoResetCount, setDemoResetCount] = useState(0);


  // Toast Helper
  const addToast = useCallback((title, message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Selected Shipment Helper
  const selectedShipment = shipments.find(s => s.id === selectedShipmentId) || null;

  // --------------------------------------------------------------------------
  // Core Action: Simulate Temperature Excursion
  // --------------------------------------------------------------------------
  const simulateExcursion = useCallback((targetShipmentId = 'SHP-8821') => {
    const target = shipments.find(s => s.id === targetShipmentId) || shipments[0];
    if (!target) return;

    // Check if already in excursion to prevent duplicate alert spam
    if (target.isExcursion) {
      addToast(
        'Excursion Already Active',
        `Shipment ${target.id} is already in temperature excursion state (${target.currentTemp}°C).`,
        'warning'
      );
      return;
    }

    const excursionTemp = 10.8; // Significant excursion above 8.0°C
    const nowTimeStr = new Date().toLocaleTimeString();
    const fullDateStr = new Date().toISOString().slice(0, 10);

    // 1. Update Shipment
    setShipments(prev => prev.map(shipment => {
      if (shipment.id === target.id) {
        const updatedHistory = [
          ...shipment.tempHistory,
          {
            time: nowTimeStr,
            temp: excursionTemp,
            safeMin: safeRange.min,
            safeMax: safeRange.max,
            isExcursion: true,
          }
        ];

        // Update GPS breadcrumb current note
        const updatedBreadcrumbs = shipment.gpsBreadcrumbs.map(wp => {
          if (wp.status === 'current') {
            return {
              ...wp,
              temp: excursionTemp,
              note: `⚠️ THERMAL ANOMALY: Telemetry spiked to ${excursionTemp}°C at ${nowTimeStr}. Refrigeration compressor check required.`
            };
          }
          return wp;
        });

        return {
          ...shipment,
          currentTemp: excursionTemp,
          status: 'Temperature Excursion!',
          isExcursion: true,
          lastPing: 'Just now',
          tempHistory: updatedHistory,
          gpsBreadcrumbs: updatedBreadcrumbs,
        };
      }
      return shipment;
    }));

    // 2. Rule-Based Alert Trigger
    const newAlert = {
      id: `ALT-${Date.now()}`,
      severity: 'CRITICAL',
      temperature: excursionTemp,
      timestamp: `${fullDateStr} ${nowTimeStr}`,
      shipmentId: target.id,
      vaccine: target.vaccine,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      notes: `Rule Trigger: Sensor recorded ${excursionTemp}°C (exceeds ${safeRange.max}°C limit by +${(excursionTemp - safeRange.max).toFixed(1)}°C). Automated quarantine policy triggered.`,
      quarantineActionTaken: true
    };

    setAlerts(prev => [newAlert, ...prev]);

    // 3. Flag Associated Batch for Quarantine (Rule-Based Policy)
    setBatches(prev => prev.map(batch => {
      if (batch.batchId === target.batchId || batch.assignedShipmentId === target.id) {
        return {
          ...batch,
          status: 'Quarantined for Review',
          quarantineReason: `Rule Trigger: Critical thermal excursion (${excursionTemp}°C > ${safeRange.max}°C) on transit shipment ${target.id}. Requires QA stability verification before clinical release.`,
          quarantinedAt: `${fullDateStr} ${nowTimeStr}`,
          qaSignOff: null,
        };
      }
      return batch;
    }));

    addToast(
      '⚠️ Thermal Excursion Triggered!',
      `Shipment ${target.id} breached safe limit (${excursionTemp}°C). Associated Batch ${target.batchId} auto-flagged for quarantine.`,
      'danger'
    );
  }, [shipments, safeRange, addToast]);

  // --------------------------------------------------------------------------
  // Core Action: Acknowledge Alert
  // --------------------------------------------------------------------------
  const acknowledgeAlert = useCallback((alertId, notes = 'Acknowledged by cold-chain logistics lead per SOP-302.', ackUser = 'Dr. S. Patel (QA Logistics Lead)') => {
    const ackTime = new Date().toLocaleTimeString();
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return {
          ...alert,
          acknowledged: true,
          acknowledgedBy: ackUser,
          acknowledgedAt: ackTime,
          notes: notes ? `${alert.notes ? alert.notes + ' • ' : ''}${notes}` : alert.notes,
        };
      }
      return alert;
    }));

    addToast('Alert Acknowledged', `Incident ${alertId} acknowledged by ${ackUser}.`, 'success');
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Core Action: Flag Batch For Quarantine Manually / Rule Trigger
  // --------------------------------------------------------------------------
  const flagBatchForQuarantine = useCallback((batchId, reason = 'Precautionary hold initiated by operational supervisor.') => {
    const fullDateStr = new Date().toISOString().slice(0, 10);
    const nowTimeStr = new Date().toLocaleTimeString();

    setBatches(prev => prev.map(batch => {
      if (batch.batchId === batchId) {
        return {
          ...batch,
          status: 'Quarantined for Review',
          quarantineReason: reason,
          quarantinedAt: `${fullDateStr} ${nowTimeStr}`,
          qaSignOff: null,
        };
      }
      return batch;
    }));

    addToast('Batch Quarantined', `Batch ${batchId} placed on hold for authorized review.`, 'warning');
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Core Action: Authorize / Release Batch (QA Sign-off)
  // --------------------------------------------------------------------------
  const authorizeBatchRelease = useCallback((batchId, reviewerName, justification) => {
    const fullDateStr = new Date().toISOString().slice(0, 10);
    const nowTimeStr = new Date().toLocaleTimeString();

    setBatches(prev => prev.map(batch => {
      if (batch.batchId === batchId) {
        return {
          ...batch,
          status: 'Released',
          qaSignOff: {
            authorizedBy: reviewerName || 'Authorized QA Director',
            timestamp: `${fullDateStr} ${nowTimeStr}`,
            resolution: justification || 'Mean Kinetic Temperature (MKT) budget within manufacturer stability margin per SOP-704.'
          }
        };
      }
      return batch;
    }));

    addToast('Batch Released', `Batch ${batchId} has been authorized and released for clinical distribution.`, 'success');
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Core Action: Add Chain of Custody Handoff
  // --------------------------------------------------------------------------
  const addCustodyHandoff = useCallback((handoffData) => {
    const newLog = {
      id: `CUS-${Date.now()}`,
      shipmentId: handoffData.shipmentId,
      sender: handoffData.sender,
      receiver: handoffData.receiver,
      timestamp: handoffData.timestamp || new Date().toLocaleString(),
      location: handoffData.location,
      verificationMethod: handoffData.verificationMethod || 'Biometric / Cryptographic NFC Signature',
      temperatureAtHandoff: parseFloat(handoffData.temperature) || 4.2,
      status: 'Verified & Logged',
      notes: handoffData.notes || 'Handoff verification seal intact. Cold chain unbroken.',
    };

    setCustodyLogs(prev => [newLog, ...prev]);
    addToast('Custody Handoff Logged', `Recorded transfer for ${handoffData.shipmentId} at ${handoffData.location}.`, 'info');
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Core Action: Reset Demo
  // --------------------------------------------------------------------------
  const resetDemo = useCallback(() => {
    setShipments(INITIAL_SHIPMENTS);
    setBatches(INITIAL_BATCHES);
    setAlerts(INITIAL_ALERTS);
    setCustodyLogs(INITIAL_CUSTODY_LOGS);
    setSafeRange(INITIAL_SAFE_RANGE);
    setSelectedShipmentId(null);
    setDemoResetCount(c => c + 1);
    addToast('Demo Reset Completed', 'All shipments, alerts, and batches restored to pristine initial conditions.', 'info');
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Configurable Safe Range
  // --------------------------------------------------------------------------
  const updateSafeRange = useCallback((min, max) => {
    const numMin = parseFloat(min);
    const numMax = parseFloat(max);
    if (!isNaN(numMin) && !isNaN(numMax) && numMin < numMax) {
      setSafeRange({ min: numMin, max: numMax });
      addToast('Safe Range Updated', `Target threshold configured to ${numMin.toFixed(1)}°C – ${numMax.toFixed(1)}°C.`, 'info');
    }
  }, [addToast]);

  // --------------------------------------------------------------------------
  // Realistic Synthetic Periodic Telemetry Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isSimulatingTelemetry) return;

    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastTelemetryTick(nowStr);

      setShipments(prevShipments => {
        return prevShipments.map(shipment => {
          let newTemp = shipment.currentTemp;

          if (shipment.isExcursion) {
            // Keep in excursion range with minor realistic fluctuations (e.g. 10.4°C - 10.9°C)
            const delta = (Math.random() * 0.4 - 0.2);
            newTemp = +(Math.max(9.5, Math.min(12.0, shipment.currentTemp + delta))).toFixed(1);
          } else {
            // Subtle normal cold-chain drift within safe bounds
            const delta = (Math.random() * 0.2 - 0.1);
            let candidate = +(shipment.currentTemp + delta).toFixed(1);
            if (candidate > safeRange.max - 0.4) candidate = +(safeRange.max - 0.5).toFixed(1);
            if (candidate < safeRange.min + 0.4) candidate = +(safeRange.min + 0.5).toFixed(1);
            newTemp = candidate;
          }

          // Decrement miles remaining slightly
          const newMiles = shipment.milesRemaining > 5 ? shipment.milesRemaining - 1 : shipment.milesRemaining;

          // Rolling temp history window (keep max 10 points)
          const updatedHistory = [
            ...shipment.tempHistory.slice(-9),
            {
              time: nowStr,
              temp: newTemp,
              safeMin: safeRange.min,
              safeMax: safeRange.max,
              isExcursion: shipment.isExcursion
            }
          ];

          return {
            ...shipment,
            currentTemp: newTemp,
            milesRemaining: newMiles,
            lastPing: 'Just now',
            tempHistory: updatedHistory,
          };
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingTelemetry, safeRange]);

  // Derived Summary Counts
  const activeExcursionsCount = shipments.filter(s => s.isExcursion).length;
  const inRangeShipmentsCount = shipments.filter(s => !s.isExcursion).length;
  const inRangePercent = shipments.length > 0
    ? ((inRangeShipmentsCount / shipments.length) * 100).toFixed(1)
    : '100.0';
  const unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const quarantinedBatchesCount = batches.filter(b => b.status === 'Quarantined for Review').length;

  const value = {
    shipments,
    batches,
    alerts,
    custodyLogs,
    safeRange,
    activeTab,
    selectedShipment,
    selectedShipmentId,
    toasts,
    isSimulatingTelemetry,
    lastTelemetryTick,
    activeExcursionsCount,
    inRangeShipmentsCount,
    inRangePercent,
    unacknowledgedAlertsCount,
    quarantinedBatchesCount,
    setActiveTab,
    setSelectedShipmentId,
    setIsSimulatingTelemetry,
    simulateExcursion,
    acknowledgeAlert,
    flagBatchForQuarantine,
    authorizeBatchRelease,
    addCustodyHandoff,
    resetDemo,
    demoResetCount,
    updateSafeRange,
    addToast,
    removeToast,
  };

  return (
    <ColdChainContext.Provider value={value}>
      {children}
    </ColdChainContext.Provider>
  );
}

export function useColdChain() {
  const context = useContext(ColdChainContext);
  if (!context) {
    throw new Error('useColdChain must be used within a ColdChainProvider');
  }
  return context;
}
