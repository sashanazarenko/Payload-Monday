import React from 'react';

interface YesNoToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Shared Yes / No segmented control used across Jolly Catalogue.
 *
 * Active states:
 *   Yes → primary blue  (#1F5C9E) with white text
 *   No  → dark charcoal (#2D3748) with white text
 *
 * Inactive options remain on a white background with secondary text,
 * so both selected states are equally legible.
 */
export function YesNoToggle({ value, onChange, disabled = false, size = 'md' }: YesNoToggleProps) {
  const height = size === 'sm' ? '28px' : '32px';
  const px     = size === 'sm' ? '10px' : '14px';
  const fs     = size === 'sm' ? '12px' : '13px';

  return (
    <div
      className="flex rounded overflow-hidden flex-shrink-0"
      style={{
        border: '1px solid var(--jolly-border)',
        height,
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      {/* YES */}
      <button
        onClick={() => onChange(true)}
        style={{
          padding: `0 ${px}`,
          fontSize: fs,
          fontWeight: 600,
          cursor: 'pointer',
          border: 'none',
          borderRight: '1px solid var(--jolly-border)',
          backgroundColor: value ? 'var(--jolly-primary)' : 'white',
          color: value ? 'white' : 'var(--jolly-text-secondary)',
          transition: 'background-color 0.15s, color 0.15s',
          minWidth: size === 'sm' ? '36px' : '44px',
        }}
        aria-pressed={value}
        aria-label="Yes"
      >
        Yes
      </button>

      {/* NO — charcoal when active so it's clearly distinct from the unselected white state */}
      <button
        onClick={() => onChange(false)}
        style={{
          padding: `0 ${px}`,
          fontSize: fs,
          fontWeight: 600,
          cursor: 'pointer',
          border: 'none',
          backgroundColor: !value ? '#2D3748' : 'white',
          color: !value ? 'white' : 'var(--jolly-text-secondary)',
          transition: 'background-color 0.15s, color 0.15s',
          minWidth: size === 'sm' ? '36px' : '44px',
        }}
        aria-pressed={!value}
        aria-label="No"
      >
        No
      </button>
    </div>
  );
}
