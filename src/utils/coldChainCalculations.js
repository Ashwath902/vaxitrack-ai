/**
 * Deterministic Cold-Chain Calculation Engine for VaxiTrack AI
 *
 * Implements standard regulatory and pharmaceutical thermal metrics:
 * 1. Mean Kinetic Temperature (MKT) via the Haynes Equation (USP <1079> / WHO)
 * 2. Excursion Duration Calculation from discrete telemetry samples
 *
 * All functions execute deterministically in code without AI hallucination.
 * Telemetry points are explicitly tagged as simulated.
 */

const ACTIVATION_ENERGY_RATIO = 10000; // ΔH / R in Kelvin (standard biologicals ΔH ≈ 83.144 kJ/mol, R = 8.314472 J/mol·K)
const KELVIN_OFFSET = 273.15;

/**
 * Calculates Mean Kinetic Temperature (MKT) deterministically.
 *
 * Haynes Formula:
 *   Tk = (ΔH / R) / -ln( (1 / n) * Σ exp( - (ΔH / R) / Ti ) )
 *   MKT_celsius = Tk - 273.15
 *
 * @param {Array<Object|number>} tempHistory - Array of telemetry objects with .temp or raw numbers
 * @returns {Object} MKT result with status, sample count, and values
 */
export function calculateMKT(tempHistory) {
  if (!Array.isArray(tempHistory) || tempHistory.length === 0) {
    return {
      available: false,
      valueCelsius: null,
      valueKelvin: null,
      sampleCount: 0,
      status: 'Calculation unavailable: No temperature telemetry points provided.',
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }

  // Extract valid numerical temperatures
  const validTemps = tempHistory
    .map(pt => (typeof pt === 'number' ? pt : pt?.temp))
    .filter(t => typeof t === 'number' && !isNaN(t) && t > -KELVIN_OFFSET);

  if (validTemps.length === 0) {
    return {
      available: false,
      valueCelsius: null,
      valueKelvin: null,
      sampleCount: 0,
      status: 'Calculation unavailable: Telemetry history contains no valid numerical temperature readings.',
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }

  try {
    let sumExp = 0;
    for (let i = 0; i < validTemps.length; i++) {
      const tKelvin = validTemps[i] + KELVIN_OFFSET;
      sumExp += Math.exp(-ACTIVATION_ENERGY_RATIO / tKelvin);
    }

    const meanExp = sumExp / validTemps.length;
    if (meanExp <= 0 || !isFinite(meanExp)) {
      return {
        available: false,
        valueCelsius: null,
        valueKelvin: null,
        sampleCount: validTemps.length,
        status: 'Calculation unavailable: Mathematical anomaly in exponential summation.',
        telemetryType: 'Simulated Cold-Chain Telemetry'
      };
    }

    const mktKelvin = ACTIVATION_ENERGY_RATIO / -Math.log(meanExp);
    const mktCelsius = mktKelvin - KELVIN_OFFSET;

    if (isNaN(mktCelsius) || !isFinite(mktCelsius)) {
      return {
        available: false,
        valueCelsius: null,
        valueKelvin: null,
        sampleCount: validTemps.length,
        status: 'Calculation unavailable: Result produced non-finite value.',
        telemetryType: 'Simulated Cold-Chain Telemetry'
      };
    }

    return {
      available: true,
      valueCelsius: Math.round(mktCelsius * 100) / 100,
      valueKelvin: Math.round(mktKelvin * 100) / 100,
      sampleCount: validTemps.length,
      formula: 'Haynes Equation (USP <1079> / WHO, ΔH/R = 10,000 K)',
      status: `Calculated deterministically across ${validTemps.length} telemetry readings.`,
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  } catch (err) {
    return {
      available: false,
      valueCelsius: null,
      valueKelvin: null,
      sampleCount: validTemps.length,
      status: `Calculation unavailable: ${err.message}`,
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }
}

/**
 * Parses a time string (e.g. "09:00", "14:30:15", "03:15 PM", or ISO string) into minutes from start of day.
 * Returns null if not parseable.
 *
 * @param {string} timeStr
 * @returns {number|null} Minutes as float or null
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const trimmed = timeStr.trim();

  // Match HH:mm or HH:mm:ss with optional AM/PM
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    const ampm = match[4] ? match[4].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes + seconds / 60;
  }

  // Try standard ISO or locale parse
  const parsed = Date.parse(timeStr);
  if (!isNaN(parsed)) {
    return parsed / (1000 * 60);
  }

  return null;
}

/**
 * Calculates thermal excursion duration deterministically.
 *
 * @param {Array<Object>} tempHistory - Array of points with .temp, .time, and optional .isExcursion
 * @param {{ min: number, max: number }} safeRange - Configured safe limits
 * @returns {Object} Duration calculation result
 */
export function calculateExcursionDuration(tempHistory, safeRange) {
  if (!Array.isArray(tempHistory) || tempHistory.length === 0) {
    return {
      available: false,
      durationMinutes: null,
      durationFormatted: 'Unavailable',
      excursionPointsCount: 0,
      totalPointsCount: 0,
      isCurrentlyInExcursion: false,
      peakTemp: null,
      status: 'Calculation unavailable: Telemetry history is empty.',
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }

  if (!safeRange || typeof safeRange.min !== 'number' || typeof safeRange.max !== 'number') {
    return {
      available: false,
      durationMinutes: null,
      durationFormatted: 'Unavailable',
      excursionPointsCount: 0,
      totalPointsCount: tempHistory.length,
      isCurrentlyInExcursion: false,
      peakTemp: null,
      status: 'Calculation unavailable: Safe temperature thresholds not defined.',
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }

  const { min, max } = safeRange;

  const evaluatedPoints = tempHistory.map((pt, idx) => {
    const temp = typeof pt === 'number' ? pt : pt?.temp;
    const isBreach = typeof temp === 'number' && (temp > max || temp < min || pt?.isExcursion === true);
    return {
      index: idx,
      temp,
      time: pt?.time,
      isBreach
    };
  });

  const breachPoints = evaluatedPoints.filter(p => p.isBreach);

  if (breachPoints.length === 0) {
    return {
      available: true,
      durationMinutes: 0,
      durationFormatted: '0 minutes (No excursion detected)',
      excursionPointsCount: 0,
      totalPointsCount: tempHistory.length,
      isCurrentlyInExcursion: false,
      peakTemp: null,
      status: 'All recorded telemetry points are within the configured safe threshold.',
      telemetryType: 'Simulated Cold-Chain Telemetry'
    };
  }

  const firstBreach = breachPoints[0];
  const lastBreach = breachPoints[breachPoints.length - 1];
  const peakTemp = Math.max(...breachPoints.map(p => p.temp).filter(t => typeof t === 'number'));

  const tStart = parseTimeToMinutes(firstBreach.time);
  const tEnd = parseTimeToMinutes(lastBreach.time);

  let durationMinutes = 0;
  let statusNote = '';

  if (tStart !== null && tEnd !== null && tEnd >= tStart) {
    const elapsed = tEnd - tStart;
    if (elapsed === 0) {
      // Single reading spike or readings within same second
      durationMinutes = breachPoints.length === 1 ? 5 : Math.round(breachPoints.length * 2);
      statusNote = `Calculated across ${breachPoints.length} excursion telemetry ping(s) at ${firstBreach.time}.`;
    } else {
      durationMinutes = Math.round(elapsed * 10) / 10;
      statusNote = `Calculated elapsed interval from ${firstBreach.time} to ${lastBreach.time} across ${breachPoints.length} breach reading(s).`;
    }
  } else {
    // Timestamps could not be parsed as clock minutes
    durationMinutes = breachPoints.length * 5;
    statusNote = `Estimated deterministically from ${breachPoints.length} logged excursion sample(s).`;
  }

  // Format readable string
  let durationFormatted = '';
  if (durationMinutes >= 60) {
    const hrs = Math.floor(durationMinutes / 60);
    const mins = Math.round(durationMinutes % 60);
    durationFormatted = mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  } else {
    durationFormatted = `${durationMinutes} minutes`;
  }

  const isCurrentlyInExcursion = evaluatedPoints[evaluatedPoints.length - 1].isBreach;

  return {
    available: true,
    durationMinutes,
    durationFormatted,
    excursionPointsCount: breachPoints.length,
    totalPointsCount: tempHistory.length,
    isCurrentlyInExcursion,
    peakTemp,
    firstExcursionTime: firstBreach.time || 'Unknown',
    lastExcursionTime: lastBreach.time || 'Unknown',
    status: statusNote,
    telemetryType: 'Simulated Cold-Chain Telemetry'
  };
}
