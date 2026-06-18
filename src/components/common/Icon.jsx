import React from 'react';

// Crisp inline SVG icons (stroke = currentColor) so the UI reads premium instead
// of relying on emoji. Size + color are controlled by the parent.
const PATHS = {
  flame: (
    <path
      d="M12 3c.5 3-1.8 4.2-2.8 5.6C8 10.2 7.5 11.6 7.5 13a4.5 4.5 0 0 0 9 0c0-1.7-.7-3-1.6-4.2-.3 1-.9 1.7-1.7 2 .4-2.4-.6-4.8-1.7-7.8Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  bolt: (
    <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" fill="currentColor" stroke="none" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M17 5h2.5a2.5 2.5 0 0 1-2.5 4M7 5H4.5A2.5 2.5 0 0 0 7 9" />
      <path d="M12 13v3M9 20h6M10 20v-1.5a2 2 0 0 1 4 0V20" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="14" width="6.5" height="6.5" rx="1.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="M5 12.5 10 17.5 19 6.5" />,
  spark: (
    <path
      d="M12 2.5 13.7 9 20 12l-6.3 3L12 21.5 10.3 15 4 12l6.3-3L12 2.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  trend: <path d="M3 16.5 9 10l4 4 8-9" />,
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.8, style }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {PATHS[name] || null}
    </svg>
  );
}
