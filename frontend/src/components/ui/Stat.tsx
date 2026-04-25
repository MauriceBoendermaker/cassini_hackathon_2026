type Props = {
  label: string;
  value: string | number;
  unit?: string;
  tone?: "" | "warn" | "danger";
};

export function Stat({ label, value, unit, tone = "" }: Props) {
  const valColor =
    tone === "warn" ? "var(--s3)" : tone === "danger" ? "var(--s4)" : "var(--ink)";
  return (
    <div className="card" style={{ padding: "12px 14px" }}>
      <div className="eyebrow">{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 22,
            fontWeight: 600,
            color: valColor,
          }}
        >
          {value}
        </div>
        {unit && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
