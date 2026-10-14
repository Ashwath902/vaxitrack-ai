/**
 * Vercel Serverless Function: /api/analyze
 *
 * Handles AI Cold-Chain Incident Analysis via Google GenAI SDK and Gemini 3.8 Flash.
 *
 * Security & Reliability Safeguards:
 * - Accepts POST requests only (rejects others with HTTP 405)
 * - Validates and sanitizes incoming payload with size/length limits
 * - Never exposes GEMINI_API_KEY to frontend/client
 * - Evaluates MKT and Excursion Duration deterministically in code (prevents hallucinations)
 * - Enforces GxP compliance boundaries (AI advisory cannot authorize release or declare spoilage)
 * - Labeled telemetry as simulated
 */

import { GoogleGenAI } from '@google/genai';
import { calculateMKT, calculateExcursionDuration } from '../src/utils/coldChainCalculations.js';

/**
 * Standard HTTP JSON Response Helper
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Safely extracts and parses JSON body from request
 */
async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      throw new Error('Malformed JSON payload');
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 512 * 1024) { // 512 KB safeguard
        reject(new Error('Payload exceeds maximum allowable size (512 KB)'));
      }
    });
    req.on('end', () => {
      if (!raw || raw.trim() === '') return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Main Vercel Serverless Function Handler
 */
export default async function handler(req, res) {
  // 1. Method Validation: Accept POST only
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, {
      error: 'Method Not Allowed. Incident Copilot only accepts POST requests.',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  // 2. Parse and Validate Request Body
  let body;
  try {
    body = await getJsonBody(req);
  } catch (err) {
    return sendJson(res, 400, {
      error: err.message || 'Invalid request body.',
      code: 'BAD_REQUEST'
    });
  }

  const {
    question,
    prompt,
    shipment,
    safeRange = { min: 2.0, max: 8.0 },
    batch,
    fleetContext = {}
  } = body || {};

  const userQuery = (question || prompt || '').trim();
  if (!userQuery) {
    return sendJson(res, 400, {
      error: 'Query prompt is required. Please provide a question or incident to analyze.',
      code: 'MISSING_PROMPT'
    });
  }

  if (userQuery.length > 2000) {
    return sendJson(res, 400, {
      error: 'Query prompt exceeds maximum allowed limit of 2,000 characters.',
      code: 'PROMPT_TOO_LONG'
    });
  }

  // 3. Extract and Sanitize Telemetry Data
  const targetShipment = shipment || null;
  const tempHistory = Array.isArray(targetShipment?.tempHistory)
    ? targetShipment.tempHistory.slice(-50) // keep up to last 50 points
    : [];

  const configuredSafeRange = {
    min: typeof safeRange?.min === 'number' ? safeRange.min : 2.0,
    max: typeof safeRange?.max === 'number' ? safeRange.max : 8.0
  };

  // 4. Deterministic Code-Based Calculations (No LLM Hallucinations)
  const mktResult = calculateMKT(tempHistory);
  const excursionDurationResult = calculateExcursionDuration(tempHistory, configuredSafeRange);

  // 5. Server Environment Verification: API Key
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      error: 'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in the Vercel Project Environment Variables dashboard or local .env file.',
      code: 'MISSING_API_KEY',
      calculations: {
        mkt: mktResult,
        excursionDuration: excursionDurationResult
      }
    });
  }

  // 6. Model Configuration
  // Uses official stable Gemini model: gemini-3.8-flash (with env override if set)
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  // 7. System Prompt Enforcing Regulatory & Fact-Based Separation
  const systemInstruction = `
You are the VaxiTrack AI Incident Copilot, an enterprise cold-chain pharmaceutical logistics advisory intelligence.
You provide operational cold-chain triage, telemetry synthesis, and SOP routing guidance for logistics coordinators, fleet dispatchers, and QA specialists.

MANDATORY REGULATORY & CLINICAL SAFETY CONSTRAINTS:
1. NON-CLINICAL ADVISORY: You MUST NOT independently declare any vaccine safe to use or clinically spoiled. You MUST NOT authorize batch release or disposal.
2. RULE-BASED QUARANTINE: In VaxiTrack AI, quarantine holds are triggered strictly by pre-configured mathematical thresholds (>8°C or <2°C). A temperature excursion indicates a thermal deviation requiring investigation, not automatic physical denaturation.
3. AUTHORIZED HUMAN REVIEW: Final product release, stability assessment, and batch disposition require authorized QA Director evaluation against manufacturer stability monographs (SOP-704) and 21 CFR Part 11 compliant digital signatures.
4. DETERMINISTIC FACTS VS AI SUGGESTIONS: Clearly separate measured sensor telemetry and code-calculated values from AI operational advice.
5. NO NUMERICAL HALLUCINATIONS: You MUST cite the exact code-calculated values provided in the telemetry context for Mean Kinetic Temperature (MKT) and Excursion Duration. If a calculation is marked as unavailable, explicitly inform the user why.
6. SIMULATED TELEMETRY: All telemetry streams in this demonstration are synthetic/simulated; acknowledge them as simulated telemetry.

REQUIRED STRUCTURE FOR RESPONSES:
Format your answer with clear markdown sections:
### 📊 Measured Telemetry & Known Facts
Summarize verified telemetry (Shipment ID, vaccine formulation, batch ID, current temperature vs safe envelope, code-calculated MKT, code-calculated excursion duration, doses, route).

### 🔍 Missing Information & Investigation Gaps
List critical operational data points still needed before QA disposition (e.g. physical secondary NIST-traceable data logger readout, vehicle refrigeration unit diagnostics/power codes, cargo container door seal inspection, ambient trailer logger).

### ⚠️ Excursion Severity & Thermal Deviation Analysis
Analyze the thermal excursion in the context of the configured safe range (${configuredSafeRange.min.toFixed(1)}°C - ${configuredSafeRange.max.toFixed(1)}°C), duration, and cumulative kinetic impact, without making clinical safety assertions.

### 📋 Operational SOP Next Steps
Recommend concrete, actionable standard operating procedure steps:
1. Immediate destination depot quarantine hold staging (2°C–8°C isolated bay).
2. Carrier dispatch & driver verification (reefer unit, door seals, secondary cooling).
3. Physical data logger retrieval & chain of custody verification upon dock arrival.
4. QA stability dossier submission per SOP-704.

### ⚖️ Regulatory & Safety Notice
A concise reminder that quarantine triggers are rule-based, and release requires authorized QA sign-off.
`.trim();

  // 8. Build Structured User Prompt with Verified Telemetry Context
  let telemetryContext = '';
  if (targetShipment) {
    telemetryContext = `
[CURRENT SHIPMENT TELEMETRY (SIMULATED)]:
• Shipment ID: ${targetShipment.id}
• Vaccine Formulation: ${targetShipment.vaccine || 'Not specified'}
• Associated Batch ID: ${targetShipment.batchId || 'Not specified'}
• Current Probe Temperature: ${targetShipment.currentTemp !== undefined ? `${targetShipment.currentTemp}°C` : 'N/A'}
• Configured Safe Envelope: ${configuredSafeRange.min}°C to ${configuredSafeRange.max}°C
• Thermal Excursion Status: ${targetShipment.isExcursion ? 'CRITICAL EXCURSION DETECTED' : 'Nominal (Within Range)'}
• Carrier / Route: ${targetShipment.carrier || 'N/A'} (Origin: ${targetShipment.origin || 'N/A'} -> Destination: ${targetShipment.destination || 'N/A'})
• Doses: ${targetShipment.doses ? targetShipment.doses.toLocaleString() : 'N/A'}
• Battery Level: ${targetShipment.batteryPercent !== undefined ? `${targetShipment.batteryPercent}%` : 'N/A'}
• Ambient Temperature: ${targetShipment.ambientTemp !== undefined ? `${targetShipment.ambientTemp}°C` : 'N/A'}
• Humidity: ${targetShipment.humidity !== undefined ? `${targetShipment.humidity}%` : 'N/A'}
• ETA: ${targetShipment.eta || 'N/A'}
• Last Telemetry Ping: ${targetShipment.lastPing || 'Just now'}

[CODE-CALCULATED DETERMINISTIC METRICS (DO NOT RE-INVENT)]:
• Mean Kinetic Temperature (MKT): ${mktResult.available ? `${mktResult.valueCelsius}°C (${mktResult.status})` : mktResult.status}
• Thermal Excursion Duration: ${excursionDurationResult.available ? `${excursionDurationResult.durationFormatted} (${excursionDurationResult.status})` : excursionDurationResult.status}
• Recorded Peak Temperature: ${excursionDurationResult.peakTemp !== null && excursionDurationResult.peakTemp !== undefined ? `${excursionDurationResult.peakTemp}°C` : 'N/A'}
• Telemetry Points Sampled: ${tempHistory.length} readings (Simulated Telemetry Stream)

[ASSOCIATED BATCH CONTEXT]:
• Batch Status: ${batch?.status || (targetShipment.isExcursion ? 'Quarantined for Review (Rule Trigger)' : 'In Transit')}
• Quarantine Reason: ${batch?.quarantineReason || (targetShipment.isExcursion ? 'Automated threshold breach rule trigger' : 'None')}
• Manufacturer: ${batch?.manufacturer || 'N/A'}
• Expiry Date: ${batch?.expiryDate || 'N/A'}
`.trim();
  } else {
    telemetryContext = `
[FLEET-WIDE COLD-CHAIN CONTEXT (SIMULATED)]:
• Monitored Shipments: ${fleetContext.totalShipments || 5}
• Active Thermal Excursions: ${fleetContext.activeExcursionsCount || 0}
• Batches on Quarantine Hold: ${fleetContext.quarantinedBatchesCount || 0}
• Configured Global Safe Range: ${configuredSafeRange.min}°C to ${configuredSafeRange.max}°C
`.trim();
  }

  const promptContent = `
${telemetryContext}

[USER QUESTION / OPERATIONAL QUERY]:
${userQuery}

Please synthesize this cold-chain incident per the required regulatory sections and constraints. Cite the deterministic calculations verbatim.
`.trim();

  // 9. Call Gemini via @google/genai SDK
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Request content generation using gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.2 // Low temperature for high factual adherence
      }
    });

    const generatedText = response.text || 'No response generated by Incident Copilot.';

    return sendJson(res, 200, {
      answer: generatedText,
      calculations: {
        mkt: mktResult,
        excursionDuration: excursionDurationResult
      },
      facts: {
        shipmentId: targetShipment?.id || null,
        batchId: targetShipment?.batchId || null,
        vaccine: targetShipment?.vaccine || null,
        currentTemp: targetShipment?.currentTemp ?? null,
        safeRange: configuredSafeRange,
        isExcursion: targetShipment?.isExcursion || false,
        simulatedTelemetry: true
      },
      model: modelName,
      timestamp: new Date().toISOString()
    });

  } catch (apiError) {
    console.error('[VaxiTrack AI Server Error]: Gemini API invocation failed:', apiError);

    // Differentiate known error conditions
    const errorMsg = apiError?.message || '';
    const errorStatus = apiError?.status || apiError?.statusCode || 500;

    if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
      return sendJson(res, 401, {
        error: 'Invalid GEMINI_API_KEY. Please verify that your Google Gemini API key is valid and has Generative Language API access enabled.',
        code: 'INVALID_API_KEY',
        calculations: {
          mkt: mktResult,
          excursionDuration: excursionDurationResult
        }
      });
    }

    if (errorStatus === 429 || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      return sendJson(res, 429, {
        error: 'Gemini API quota/rate limit exceeded. Please wait a moment before resubmitting your query.',
        code: 'RATE_LIMIT_EXCEEDED',
        calculations: {
          mkt: mktResult,
          excursionDuration: excursionDurationResult
        }
      });
    }

    if (errorMsg.includes('NOT_FOUND') || errorMsg.includes('models/')) {
      return sendJson(res, 502, {
        error: `The requested Gemini model (${modelName}) could not be accessed. Verify model availability or configure GEMINI_MODEL in environment variables.`,
        code: 'MODEL_NOT_FOUND',
        calculations: {
          mkt: mktResult,
          excursionDuration: excursionDurationResult
        }
      });
    }

    // Generic safe error
    return sendJson(res, 500, {
      error: 'An internal error occurred while communicating with the Gemini AI service. Check server logs for details.',
      code: 'GEMINI_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
      calculations: {
        mkt: mktResult,
        excursionDuration: excursionDurationResult
      }
    });
  }
}
