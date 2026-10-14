import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Info,
  CheckCircle2,
  Thermometer,
  Layers,
  ArrowRight,
  HelpCircle,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';
import { calculateMKT, calculateExcursionDuration } from '../../utils/coldChainCalculations';

export default function AIAssistantPanel() {
  const {
    shipments,
    batches,
    safeRange,
    activeExcursionsCount,
    quarantinedBatchesCount,
    demoResetCount
  } = useColdChain();

  const excursionShipment = shipments.find(s => s.isExcursion);
  const [selectedTargetId, setSelectedTargetId] = useState(() => excursionShipment?.id || shipments[0]?.id || 'SHP-8821');

  // Update selected target if excursion state changes
  useEffect(() => {
    if (excursionShipment) {
      setSelectedTargetId(excursionShipment.id);
    }
  }, [excursionShipment]);

  const activeShipment = shipments.find(s => s.id === selectedTargetId) || excursionShipment || shipments[0];
  const activeBatch = batches.find(b => b.batchId === activeShipment?.batchId || b.assignedShipmentId === activeShipment?.id);

  // Live Deterministic Calculations (Code-Computed, Never Hallucinated)
  const currentMKT = calculateMKT(activeShipment?.tempHistory || []);
  const currentExcursionDuration = calculateExcursionDuration(activeShipment?.tempHistory || [], safeRange);

  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const initialGreeting = excursionShipment
    ? `⚠️ Active excursion detected on shipment ${excursionShipment.id} (${excursionShipment.currentTemp}°C vs ${safeRange.max}°C limit). Batch ${excursionShipment.batchId} has been placed in quarantine for review.\n\nCode-calculated MKT: ${currentMKT.available ? `${currentMKT.valueCelsius}°C` : 'N/A'}. Excursion duration: ${currentExcursionDuration.durationFormatted}.\n\nAsk any operational question or select a prompt below for automated GxP SOP triage.`
    : `All monitored cold-chain shipments are currently within the configured safe envelope (${safeRange.min.toFixed(1)}°C – ${safeRange.max.toFixed(1)}°C). Fleet telemetry integrity is nominal.\n\nCode-calculated MKT across monitored shipments is within WHO parameters. How can I assist your logistics operations?`;

  const [chatMessages, setChatMessages] = useState(() => [
    {
      id: 'msg-init',
      sender: 'ai',
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calculations: {
        mkt: currentMKT,
        duration: currentExcursionDuration
      }
    }
  ]);

  const chatStreamRef = useRef(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [chatMessages, isLoading]);

  // Handle Demo Reset: restore pristine assistant chat
  useEffect(() => {
    if (demoResetCount > 0) {
      setIsLoading(false);
      setApiError(null);
      setChatInput('');
      const resetShipment = shipments.find(s => s.id === 'SHP-8821') || shipments[0];
      const resetMkt = calculateMKT(resetShipment?.tempHistory || []);
      const resetDur = calculateExcursionDuration(resetShipment?.tempHistory || [], safeRange);

      setChatMessages([
        {
          id: `msg-reset-${Date.now()}`,
          sender: 'ai',
          text: `Demo reset completed. All monitored cold-chain shipments are currently within the configured safe envelope (${safeRange.min.toFixed(1)}°C – ${safeRange.max.toFixed(1)}°C). Fleet telemetry integrity is nominal.\n\nCode-calculated MKT for baseline: ${resetMkt.available ? `${resetMkt.valueCelsius}°C` : 'N/A'}. Excursion duration: ${resetDur.durationFormatted}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          calculations: {
            mkt: resetMkt,
            duration: resetDur
          }
        }
      ]);
    }
  }, [demoResetCount]);

  const handleQuickPrompt = (promptText) => {
    setChatInput(promptText);
    executePrompt(promptText);
  };

  const executePrompt = async (query) => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg = {
      id: userMessageId,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    setApiError(null);

    // Prepare live shipment & fleet payload
    const payload = {
      question: trimmed,
      shipment: activeShipment,
      safeRange,
      batch: activeBatch,
      fleetContext: {
        totalShipments: shipments.length,
        activeExcursionsCount,
        quarantinedBatchesCount,
      }
    };

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle server/API error response gracefully
        const errorText = data?.error || `API returned status ${response.status}`;
        const isMissingKey = data?.code === 'MISSING_API_KEY';

        let userFacingError = errorText;
        if (isMissingKey) {
          userFacingError = `⚠️ Gemini API Key Required:\n${errorText}\n\nTo enable live AI inference on Vercel or locally:\n1. Set GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.\n2. For local testing, add GEMINI_API_KEY=your_key to a .env file.\n\nNote: Deterministic MKT and Excursion Duration calculations remain fully operational without the key.`;
        }

        setApiError({
          code: data?.code || 'API_ERROR',
          message: errorText
        });

        setChatMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'ai',
            isError: true,
            text: userFacingError,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            calculations: data?.calculations || {
              mkt: currentMKT,
              duration: currentExcursionDuration
            }
          }
        ]);
        return;
      }

      // Success: render response from Gemini 3.8 Flash
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer || 'Analysis complete.',
          model: data.model || 'gemini-3.8-flash',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          calculations: data.calculations || {
            mkt: currentMKT,
            duration: currentExcursionDuration
          },
          facts: data.facts
        }
      ]);

    } catch (networkErr) {
      console.error('Copilot network fetch failed:', networkErr);
      const msg = `Network connection to /api/analyze failed. Check your connection or local dev server. (${networkErr.message})`;
      setApiError({ code: 'NETWORK_ERROR', message: msg });

      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          isError: true,
          text: msg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          calculations: {
            mkt: currentMKT,
            duration: currentExcursionDuration
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    executePrompt(chatInput);
  };

  const handleClearChat = () => {
    setChatMessages([]);
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
                  Gemini 3.8 Flash
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: '1px solid #E2E8F0'
                }}>
                  Simulated Telemetry
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                GxP cold-chain deviation analysis, Mean Kinetic Temperature evaluation &amp; SOP routing
              </p>
            </div>
          </div>

          {/* Consignment Target Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
              Consignment:
            </span>
            <select
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#0F172A'
              }}
              aria-label="Select shipment for AI analysis"
            >
              {shipments.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} {s.isExcursion ? '⚠️ (Excursion)' : '✓'} ({s.currentTemp}°C)
                </option>
              ))}
            </select>
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
              Vaccine efficacy and stability release must be evaluated by certified QA personnel per manufacturer monographs (SOP-704). The AI model cannot independently authorize release or declare spoilage.
            </div>
          </div>
        </div>

        {/* Live Code-Calculated Telemetry Badges (Deterministic, Never Hallucinated) */}
        <div className="ai-calc-pill-row">
          <div className="ai-calc-pill" title="Haynes Mean Kinetic Temperature computed deterministically over recorded telemetry readings">
            <Thermometer size={13} color="#0D9488" />
            <span>Deterministic MKT:</span>
            <strong>
              {currentMKT.available ? `${currentMKT.valueCelsius}°C` : 'Unavailable'}
            </strong>
          </div>
          <div style={{ color: '#CBD5E1' }}>|</div>
          <div className="ai-calc-pill" title="Thermal deviation duration evaluated across logged probe samples">
            <Clock size={13} color="#0D9488" />
            <span>Excursion Duration:</span>
            <strong>
              {currentExcursionDuration.durationFormatted}
            </strong>
          </div>
          <div style={{ color: '#CBD5E1' }}>|</div>
          <div className="ai-calc-pill" title="All sensors in demo stream are synthetically generated">
            <Activity size={13} color="#0D9488" />
            <span>Mode:</span>
            <strong>Synthetic Telemetry Stream</strong>
          </div>
        </div>

        {/* Live Incident Status Summary */}
        <div className="incident-summary-block">
          <div className="summary-heading">
            <Thermometer size={16} color="#0D9488" />
            <span>Consignment Telemetry Facts ({activeShipment?.id})</span>
          </div>

          <div className="summary-content">
            {activeShipment?.isExcursion ? (
              <div>
                <p>
                  <strong>Incident Alert on {activeShipment.id}:</strong> Sensor telemetry recorded{' '}
                  <span style={{ color: '#E11D48', fontWeight: 700 }}>{activeShipment.currentTemp}°C</span>, exceeding the configured safe threshold of{' '}
                  {safeRange.max}°C by +{(activeShipment.currentTemp - safeRange.max).toFixed(1)}°C. Carrying <strong>{activeShipment.doses?.toLocaleString()} doses</strong> of {activeShipment.vaccine}.
                </p>
                <p style={{ marginTop: '6px' }}>
                  <strong>Rule-Based Hold Status:</strong> Associated Batch{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{activeShipment.batchId}</span> is flagged as{' '}
                  <strong style={{ color: '#9F1239' }}>{activeBatch?.status || 'Quarantined for Review'}</strong>. Destination: {activeShipment.destination}.
                </p>
              </div>
            ) : (
              <p>
                <strong>Cold-Chain Nominal on {activeShipment?.id}:</strong> Probe reading is currently{' '}
                <strong style={{ color: '#059669' }}>{activeShipment?.currentTemp}°C</strong> within safe envelope ({safeRange.min}°C – {safeRange.max}°C). Carrying {activeShipment?.doses?.toLocaleString()} doses of {activeShipment?.vaccine}.
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
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#334155',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>Interactive Copilot Query Session (Gemini 3.8 Flash)</span>
            {chatMessages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
                title="Clear current query transcript"
              >
                Clear History
              </button>
            )}
          </div>

          <div className="ai-chat-stream" ref={chatStreamRef}>
            {chatMessages.length === 0 ? (
              <div className="ai-empty-state">
                <HelpCircle size={28} color="#94A3B8" />
                <p>
                  <strong>No queries yet.</strong> Ask Copilot about the active temperature excursion on {activeShipment?.id}, MKT calculation guidance, or carrier reefer contingency SOPs.
                </p>
              </div>
            ) : (
              chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={
                    msg.sender === 'user'
                      ? 'ai-message-user'
                      : msg.isError
                        ? 'ai-message-error'
                        : 'ai-message-assistant'
                  }
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </div>

                  {msg.sender === 'ai' && !msg.isError && (
                    <div className="ai-meta-disclaimer">
                      <CheckCircle2 size={12} color="#0D9488" />
                      <span>
                        AI Advisory • Rule-based quarantine triggers apply • Release requires authorized QA Director review (SOP-704)
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="ai-loading-bubble">
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                <span>Incident Copilot is analyzing cold-chain telemetry with Gemini 3.8 Flash...</span>
              </div>
            )}
          </div>

          {/* Error Notification Alert */}
          {apiError && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              borderRadius: '8px',
              padding: '8px 12px',
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#9F1239'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} color="#E11D48" />
                <span>{apiError.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setApiError(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9F1239', fontWeight: 700, fontSize: '0.9rem' }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Chat Input Form */}
          <form onSubmit={handleChatSubmit} className="ai-chat-box">
            <input
              type="text"
              className="ai-chat-input"
              placeholder={`Ask Copilot about ${activeShipment?.id} excursion, MKT formula, or carrier SOPs...`}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              disabled={isLoading}
              aria-label="Ask Incident Copilot"
            />
            <button
              type="submit"
              className="ai-send-btn"
              title="Send query to Copilot"
              disabled={isLoading || !chatInput.trim()}
            >
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
              onClick={() => handleQuickPrompt(`Analyze current thermal excursion on ${activeShipment?.id || 'SHP-8821'}`)}
              disabled={isLoading}
            >
              <span>Analyze {activeShipment?.id || 'SHP-8821'} Excursion</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('Explain WHO 2°C–8°C Cold Chain Standard & MKT Formula')}
              disabled={isLoading}
            >
              <span>WHO 2°C–8°C Standard &amp; MKT</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('Generate Cold-Chain Deviation Audit Summary')}
              disabled={isLoading}
            >
              <span>Quarantine Deviation Protocol</span>
              <ArrowRight size={13} />
            </button>

            <button
              type="button"
              className="prompt-btn"
              onClick={() => handleQuickPrompt('What are the carrier SOP steps for refrigeration failure?')}
              disabled={isLoading}
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
