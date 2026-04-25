import type { StageNum } from "../../lib/demo";

export function StageMeter({ n }: { n: StageNum }) {
  return (
    <div className="stage-meter">
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? "on" : ""} />
      ))}
    </div>
  );
}
