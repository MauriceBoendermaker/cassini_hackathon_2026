import { getStage, STAGE_COLORS, type StageNum } from "../../lib/demo";

type Props = {
  n: StageNum;
  size?: "sm" | "md";
  short?: string;
  label?: string;
};

export function StageBadge({ n, size = "md", short, label }: Props) {
  const s = getStage(n);
  const c = STAGE_COLORS[n];
  const displayShort = short ?? s.short;
  const displayLabel = label ?? s.label;
  return (
    <span
      className="chip mono"
      style={{
        background: c.bg,
        color: c.ink,
        borderColor: "transparent",
        fontSize: size === "sm" ? 10 : 11,
        padding: size === "sm" ? "3px 8px" : "4px 10px",
        fontWeight: 600,
      }}
    >
      {displayShort} · {displayLabel.toUpperCase()}
    </span>
  );
}
