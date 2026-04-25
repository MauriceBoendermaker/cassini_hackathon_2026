type Props = { label: string; height?: number; radius?: number };

export function Placeholder({ label, height = 120, radius = 16 }: Props) {
  return (
    <div
      style={{
        height,
        borderRadius: radius,
        border: "1px solid var(--line)",
        background: `repeating-linear-gradient(45deg, var(--bg-soft) 0 8px, transparent 8px 16px), var(--surface)`,
        color: "var(--ink-3)",
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {label}
    </div>
  );
}
