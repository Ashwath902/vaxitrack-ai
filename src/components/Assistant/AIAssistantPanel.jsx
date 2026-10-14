import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  Send,
  Info,
  CheckCircle2,
  FileText,
  Thermometer,
  Layers,
  ArrowRight,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

export default function AIAssistantPanel() {
  const {
    shipments,
    alerts,
    batches,
    safeRange,
    activeExcursionsCount,
    quarantinedBatchesCount,
    setSelectedShipmentId,
    setActiveTab
  } = useColdChain();

  const excursionShipment = shipments.find(s => s.isExcursion);
  const quarantinedBatch = batches.find(b => b.status === 'Quarantined for Review');

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: excursionShipment
        ? `⚠️ Active excursion detected on shipment ${excursionShipment.id} (${excursionShipment.currentTemp}°C vs ${safeRange.max}°C limit). Batch ${excursionShipment.batchId} has been placed in quarantine for review. Recommended operational triage protocols are highlighted below.`
        : `All monitored cold-chain shipments are currently within the configured safe envelope (${safeRange.min.toFixed(1)}°C – ${safeRange.max.toFixed(1)}°C). Fleet telemetry integrity is nominal.`
    }
  ]);

  const handleQuickPrompt = (promptText) => {
    setChatInput(promptText);
    executePrompt(promptText);
  };

  const executePrompt = (query) => {
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    let aiResponse = '';

    const lower = query.toLowerCase();

    if (lower.includes('excursion') || lower.includes('shp-8821') || lower.includes('analyze')) {
      if (excursionShipment) {
        aiResponse = `📊 Operational Incident Triage for ${excursionShipment.id}:\n` +
          `• Sensor Reading: ${excursionShipment.currentTemp}°C (+${(excursionShipment.currentTemp - safeRange.max).toFixed(1)}°C above max limit).\n` +
          `• Vaccine Formulation: ${excursionShipment.vaccine}.\n` +
          `• Associated Batch: ${excursionShipment.batchId} (${excursionShipment.doses.toLocaleString()} doses).\n` +
          `• Compliance Action: Rule-based quarantine automatically invoked. Destination receiving team must route parcel directly to Quarantine Holding Bay 3. Physical inspection of thermal data loggers required. Notice: This thermal excursion does not prove vaccine denaturation; stability release must be evaluated by authorized QA personnel against manufacturer monographs.`;
      } else {
        aiResponse = `Fleet Status: Zero active temperature excursions detected across all ${shipments.length} monitored shipments. All continuous probe feeds are maintaining nominal thermal equilibrium between ${safeRange.min}°C and ${safeRange.max}°C.`;
      }
    } else if (lower.includes('mkt') || lower.includes('formula') || lower.includes('who') || lower.includes('safe range')) {
      aiResponse = `🔬 Cold-Chain Mean Kinetic Temperature (MKT) Guidance:\n` +
        `• Standard WHO Envelope: 2.0°C to 8.0°C for routine biologicals.\n` +
        `• MKT Definition: A single calculated temperature that represents the cumulative isothermal effect of temperature fluctuations over storage time (Haynes formula, activation energy ΔH ≈ 83.14 kJ/mol).\n` +
        `• Operational Rule: Brief transient excursions (< 2 hours, < 10°C) often fall within allowable stability budgets for certain formulations, but MUST receive formal QA documentation before clinical release.`;
    } else if (lower.includes('quarantine') || lower.includes('report') || lower.includes('protocol')) {
      aiResponse = `📋 Quarantine Protocol Summary (SOP-401):\n` +
        `1. Automatic Rule Trigger: Any probe telemetry exceeding safe threshold immediately flags batch in inventory ledger.\n` +
        `2. Physical Isolation: Receiving cold depot transfers shipper into designated yellow-tagged quarantine bay.\n` +
        `3. Chain of Custody Hold: Digital lock prevents warehouse distribution to vaccination centers.\n` +
        `4. Authorized QA Evaluation: Quality director reviews raw data logger files, calculates MKT, and signs official release or disposal certificate.`;
    } else if (lower.includes('carrier') || lower.includes('driver') || lower.includes('sop') || lower.includes('dry-ice')) {
      aiResponse = `🚚 Carrier Transit SOP Recommendations:\n` +
        `• Immediate Action: Carrier dispatch should contact refrigerated vehicle driver to verify secondary cooling system status and ensure cab-to-cargo door seal integrity.\n` +
        `• Contingency: If vehicle refrigeration failure is confirmed, divert to nearest partner depot for dry-ice re-icing or eutectic plate exchange within 90 minutes.`;
    } else {
      aiResponse = `Telemetry Copilot Analysis: Based on current sensor streams, ${shipments.length} shipments are tracked. Active excursions: ${activeExcursionsCount}. Quarantined batches: ${quarantinedBatchesCount}. All decision gates adhere strictly to predefined threshold rules. For clinical release determinations, consult the authorized Quality Director.`;
    }

    setChatMessages(prev => [...prev, userMsg, { sender: 'ai', text: aiResponse }]);
    setChatInput('');
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    executePrompt(chatInput);
  };

  return (
    <div className="ai-assistant-container">
      {/* Main Copilot Analysis Panel */}
      <div className="ai-copilot-card">
        {/* Header */}
        <div className="ai-copilot-header">
          <div className="ai-copilot-title">
            <div className="copilot-avatar">
              <Bot size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  VaxiTrack Incident Copilot
                </h3>
                <span className="ai-tag-chip">
                  <Sparkles size={11} style={{ marginRight: 4, display: 'inline' }} />
                  AI-Generated Advisory
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                Operational cold-chain telemetry synthesis &amp; deviation response protocols
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Regulatory & Clinical Safety Disclaimer */}
        <div className="ai-disclaimer-box" role="note">
          <Info size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Regulatory &amp; Non-Clinical Operational Advisory Notice:</strong>
            <div style={{ marginTop: '3px' }}>
              The VaxiTrack AI Copilot synthesizes logistics telemetry and standard operating procedures for transit routing, incident logging, and cold-bay staging only.
              <strong> Quarantine triggers are strictly rule-based</strong>. A temperature excursion indicates a thermal deviation requiring investigation, not definitive proof of vaccine spoilage.
              Vaccine efficacy and stability release must be evaluated by certified QA personnel per manufacturer monographs.
            </div>
          </div>
        </div>

        {/* Live Incident Status Summary */}
        <div className="incident-summary-block">
          <div className="summary-heading">
            <Thermometer size={16} color="#0D9488" />
            <span>Active Incident Synthesis</span>
          </div>

          <div className="summary-content">
            {excursionShipment ? (
              <div>
                <p>
                  <strong>Incident Alert on {excursionShipment.id}:</strong> At {excursionShipment.lastPing}, internal temperature spiked to{' '}
                  <span style={{ color: '#E11D48', fontWeight: 700 }}>{excursionShipment.currentTemp}°C</span>, exceeding the configured safe threshold of{' '}
                  {safeRange.max}°C. The consignment is carrying <strong>{excursionShipment.doses.toLocaleString()} doses</strong> of {excursionShipment.vaccine}.
                </p>
                <p style={{ marginTop: '8px' }}>
                  <strong>Rule-Based Safeguard Activated:</strong> Batch{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{excursionShipment.batchId}</span> has been automatically flagged as{' '}
                  <strong style={{ color: '#9F1239' }}>Quarantined for Review</strong>. The shipment is currently en route to {excursionShipment.destination}.
                </p>
              </div>
            ) : (
              <p>
                <strong>Cold-Chain Nominal:</strong> All {shipments.length} active consignments are operating within the standard WHO safe envelope ({safeRange.min}°C – {safeRange.max}°C).
                Mean telemetry variance is ±0.3°C, indicating stable compressor performance across all carrier refrigeration units.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Operational Next Steps (SOP Checklist) */}
        <div>
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Layers size={17} color="#0D9488" />
            <span>Recommended Operational SOP Next Steps</span>
          </div>

          <div className="sop-checklist">
            <div className="sop-step-card">
              <div className="sop-step-number">1</div>
              <div className="sop-step-content">
                <h5>Notify Receiving Depository Cold Bay</h5>
                <p>
                  Alert receiving dock personnel at destination to prepare designated quarantine storage bay (2°C–8°C) to prevent mixing with released inventory.
                </p>
              </div>
            </div>

            <div className="sop-step-card">
              <div className="sop-step-number">2</div>
              <div className="sop-step-content">
                <h5>Carrier Telematics &amp; Driver Contact</h5>
                <p>
                  Instruct carrier dispatch to contact the transport vehicle to verify reefer unit operational state, cargo door seals, and power supply.
                </p>
              </div>
            </div>

            <div className="sop-step-card">
              <div className="sop-step-number">3</div>
              <div className="sop-step-content">
                <h5>Secondary Logger Physical Retrieval</h5>
                <p>
                  Upon dock arrival, quarantine physical container immediately and extract calibrated NIST-traceable secondary logger data for audit.
                </p>
              </div>
            </div>

            <div className="sop-step-card">
              <div className="sop-step-number">4</div>
              <div className="sop-step-content">
                <h5>Authorized QA Stability &amp; MKT Assessment</h5>
                <p>
                  Submit cumulative thermal history to QA Director for Mean Kinetic Temperature analysis against manufacturer stability monograph (SOP-704).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Chat Stream */}
        <div style={{ marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
            Interactive Copilot Query Session
          </div>

          <div style={{
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '6px'
          }}>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? '#0D9488' : '#F1F5F9',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleChatSubmit} className="ai-chat-box">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask Copilot about cold-chain deviations, MKT, or carrier SOPs..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" className="ai-send-btn" title="Send query to Copilot">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Sidebar / Quick Prompts Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="quick-prompts-card">
          <div className="quick-prompts-title">
            <Sparkles size={16} color="#0D9488" />
            <span>Fast Operational Prompts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('Analyze current thermal excursion on SHP-8821')}
            >
              <span>Analyze SHP-8821 Excursion</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('Explain WHO 2°C–8°C Cold Chain Standard & MKT Formula')}
            >
              <span>WHO 2°C–8°C Standard &amp; MKT</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('Generate Cold-Chain Deviation Audit Summary')}
            >
              <span>Quarantine Deviation Protocol</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('What are the carrier SOP steps for refrigeration failure?')}
            >
              <span>Carrier Contingency SOPs</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Cold-Chain Compliance Guide Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} color="#10B981" />
            <span>GxP Compliance Safeguards</span>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: 1.5 }}>
            Automated rule engines flag deviations without clinical assumption. All release authorizations require dual cryptographic sign-offs in accordance with 21 CFR Part 11 guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
