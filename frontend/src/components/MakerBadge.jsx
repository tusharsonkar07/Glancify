/**
 * MakerBadge
 * ──────────
 * A simple inline attribution button for the header.
 * Clicking opens the DeveloperCard dialog.
 */

export default function MakerBadge({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="About the maker — opens Tushar Sonkar's profile"
      aria-haspopup="dialog"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        borderRadius: '6px',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(28, 25, 23, 0.05)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {/* Heart */}
      <span
        aria-hidden="true"
        style={{
          color: '#DC2626',
          fontSize: '0.7rem',
          lineHeight: 1,
        }}
      >
        ♥
      </span>

      {/* Name label */}
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '0.65rem',
          fontWeight: 500,
          color: '#1C1917',
          letterSpacing: '0.035em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        Developed by...
      </span>
    </button>
  );
}
