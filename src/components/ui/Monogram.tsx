/** Small ZH mark: the hero geometry's letters in the same line language. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 24"
      width="32"
      height="24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0.5" y="0.5" width="31" height="23" stroke="currentColor" strokeOpacity="0.28" />
      <path
        d="M5.5 6.5h9L5.5 17.5h9M18.5 6.5v11M26.5 6.5v11M18.5 12h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="miter"
      />
      <rect x="27.5" y="18.5" width="2" height="2" fill="var(--accent)" />
    </svg>
  );
}
