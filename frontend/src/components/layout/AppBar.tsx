import type { ReactNode, CSSProperties } from "react";

type Props = {
  title?: ReactNode;
  sub?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
};

export function AppBar({ title, sub, left, right, style }: Props) {
  return (
    <div className="app-bar" style={style}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        {sub && <div className="ab-sub">{sub}</div>}
        {title && <div className="ab-title">{title}</div>}
      </div>
      {right}
    </div>
  );
}
