import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { Activity, Thermometer, SlidersHorizontal, Info } from 'lucide-react';
import { useColdChain } from '../../context/ColdChainContext';

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label, safeRange, vaccineName, shipmentId }) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const temp = dataPoint.temp;
    const isExcursion = temp > safeRange.max || temp < safeRange.min;

    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '12px 14px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
          {shipmentId} • {label}
        </div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
          {vaccineName}
        </div>
        <div style={{
          marginTop: '8px',
          display: 'flex',
          alignItems: 'baseline',
          gap: '6px'
        }}>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: isExcursion ? '#E11D48' : '#0D9488'
          }}>
            {temp.toFixed(1)}°C
          </span>
          <span style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: isExcursion ? '#BE123C' : '#059669',
            background: isExcursion ? '#FFE4E6' : '#D1FAE5',
            padding: '2px 6px',
            borderRadius: '9999px'
          }}>
            {isExcursion ? '⚠️ EXCURSION' : '✓ SAFE RANGE'}
          </span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
          Configured Safe Envelope: {safeRange.min.toFixed(1)}°C – {safeRange.max.toFixed(1)}°C
        </div>
      </div>
    );
  }
  return null;
}

export default function TemperatureChart() {
  const { shipments, safeRange } = useColdChain();
  const [selectedShipmentId, setSelectedShipmentId] = useState(shipments[0]?.id || 'SHP-8821');

  const currentShipment = shipments.find(s => s.id === selectedShipmentId) || shipments[0];
  const chartData = currentShipment ? currentShipment.tempHistory : [];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-area">
          <h3>
            <Thermometer size={20} color="#0D9488" />
            Live Cold-Chain Telemetry Stream
            {currentShipment?.isExcursion && (
              <span style={{
                fontSize: '0.72rem',
                background: '#FFE4E6',
                color: '#E11D48',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700
              }}>
                THRESHOLD BREACH
              </span>
            )}
          </h3>
          <p>
            Continuous probe readings vs. configured WHO safe envelope ({safeRange.min.toFixed(1)}°C – {safeRange.max.toFixed(1)}°C)
          </p>
        </div>

        <div className="chart-controls">
          <div className="chart-legend-badge legend-safe-zone">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            <span>Safe Range ({safeRange.min}–{safeRange.max}°C)</span>
          </div>

          <div className="chart-legend-badge legend-excursion-zone">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F43F5E', display: 'inline-block' }} />
            <span>Excursion Zone (&gt;{safeRange.max}°C)</span>
          </div>

          {/* Shipment selector dropdown */}
          <select
            className="chart-select"
            value={selectedShipmentId}
            onChange={e => setSelectedShipmentId(e.target.value)}
            aria-label="Select shipment for temperature chart"
          >
            {shipments.map(s => (
              <option key={s.id} value={s.id}>
                {s.id}: {s.vaccine.split(' ')[0]} ({s.currentTemp}°C) {s.isExcursion ? '⚠️' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              {/* Normal teal gradient */}
              <linearGradient id="tempGradientNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
              </linearGradient>
              {/* Excursion red gradient */}
              <linearGradient id="tempGradientExcursion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />

            <YAxis
              domain={[0, 14]}
              ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
              stroke="#94A3B8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              unit="°C"
            />

            {/* Visual Safe Range Green Band */}
            <ReferenceArea
              y1={safeRange.min}
              y2={safeRange.max}
              fill="#10B981"
              fillOpacity={0.08}
              stroke="#10B981"
              strokeOpacity={0.2}
            />

            {/* Visual Excursion High Danger Band */}
            <ReferenceArea
              y1={safeRange.max}
              y2={14}
              fill="#F43F5E"
              fillOpacity={0.06}
            />

            {/* Upper limit line */}
            <ReferenceLine
              y={safeRange.max}
              stroke="#F43F5E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Max Safe Limit (${safeRange.max}°C)`,
                position: 'top',
                fill: '#E11D48',
                fontSize: 11,
                fontWeight: 600
              }}
            />

            {/* Lower limit line */}
            <ReferenceLine
              y={safeRange.min}
              stroke="#06B6D4"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Min Safe Limit (${safeRange.min}°C)`,
                position: 'bottom',
                fill: '#0891B2',
                fontSize: 11,
                fontWeight: 600
              }}
            />

            <Tooltip
              content={
                <CustomTooltip
                  safeRange={safeRange}
                  vaccineName={currentShipment?.vaccine}
                  shipmentId={currentShipment?.id}
                />
              }
            />

            <Area
              type="monotone"
              dataKey="temp"
              stroke={currentShipment?.isExcursion ? '#E11D48' : '#0D9488'}
              strokeWidth={2.5}
              fill={currentShipment?.isExcursion ? 'url(#tempGradientExcursion)' : 'url(#tempGradientNormal)'}
              dot={{
                r: 4,
                fill: currentShipment?.isExcursion ? '#E11D48' : '#0D9488',
                stroke: '#FFFFFF',
                strokeWidth: 2
              }}
              activeDot={{
                r: 6,
                fill: currentShipment?.isExcursion ? '#BE123C' : '#0F766E',
                stroke: '#FFFFFF',
                strokeWidth: 2
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
