type Props = {
  size?: number;
  color?: string;
  /**
   * Color of the inner exclamation mark. Defaults to `var(--brand-ink)`
   * so that when `color="var(--brand)"` is used, the mark naturally
   * contrasts in both light and dark modes (brand and brand-ink invert
   * opposite each other). When passing a fixed `color` like "#fff", also
   * pass an explicit `mark` (e.g. `"var(--ink-card)"`) to keep contrast.
   */
  mark?: string;
  title?: string;
};

/**
 * The Aegis brand mark — solid filled triangle with vertical exclamation
 * stroke and dot, matching the design prototype's 32x32 viewBox.
 */
export function AegisLogo({
  size = 28,
  color = "currentColor",
  mark = "var(--brand-ink)",
  title = "Aegis",
}: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" role="img" aria-label={title}>
      <title>{title}</title>
      <path
        d="M16 4 L28.5 26 L3.5 26 Z"
        fill={color}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 12 L16 19" stroke={mark} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="22.5" r="1.4" fill={mark} />
    </svg>
  );
}
