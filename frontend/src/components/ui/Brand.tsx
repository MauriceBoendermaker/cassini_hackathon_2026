import { AegisLogo } from "../brand/AegisLogo";

type Props = { size?: number };

export function Brand({ size = 18 }: Props) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <AegisLogo size={size + 6} color="var(--brand)" />
      <span style={{ fontWeight: 700, letterSpacing: "-0.01em", fontSize: size }}>Aegis</span>
    </span>
  );
}
