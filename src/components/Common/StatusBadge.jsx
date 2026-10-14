import React from 'react';

export default function StatusBadge({ status, isExcursion = false, customText = null }) {
  let badgeClass = 'status-badge';
  let label = customText || status;

  if (isExcursion || status === 'Temperature Excursion!' || status === 'CRITICAL') {
    badgeClass += ' excursion';
    label = customText || 'Excursion Detected';
  } else if (status === 'Within Safe Range' || status === 'Within Range') {
    badgeClass += ' within-range';
    label = customText || 'Within Range (2–8°C)';
  } else if (status === 'Quarantined for Review') {
    badgeClass += ' quarantined';
    label = customText || 'Quarantined for Review';
  } else if (status === 'Released' || status === 'Released / Authorized') {
    badgeClass += ' released';
    label = customText || 'Released & Verified';
  } else if (status === 'In Transit') {
    badgeClass += ' in-transit';
    label = customText || 'In Transit';
  } else if (status === 'WARNING') {
    badgeClass += ' warning';
    label = customText || 'Warning';
  } else {
    badgeClass += ' in-transit';
  }

  return (
    <span className={badgeClass}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
}
