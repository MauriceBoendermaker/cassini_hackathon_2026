export function HomeIndicator({ tone = "default" }: { tone?: "default" | "sos" } = {}) {
  return (
    <div className={"home-indicator" + (tone === "sos" ? " on-sos" : "")}>
      <i />
    </div>
  );
}
