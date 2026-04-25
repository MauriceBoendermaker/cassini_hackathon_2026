type Props = {
  time?: string;
  tone?: "light" | "dark";
};

export function StatusBar({ time = "14:08", tone = "light" }: Props) {
  return (
    <div className={"status-bar " + (tone === "dark" ? "on-dark" : "")}>
      <div>{time}</div>
      <div className="sb-right">
        <div className="sb-bars">
          <i />
          <i />
          <i />
          <i />
        </div>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
          <path d="M7 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="currentColor" />
          <path
            d="M2 6.2a7 7 0 0110 0M0 4a10 10 0 0114 0"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div className="sb-batt">
          <i />
        </div>
      </div>
    </div>
  );
}
