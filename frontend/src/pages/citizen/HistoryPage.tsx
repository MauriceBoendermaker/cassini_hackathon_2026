import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../../components/layout/AppBar";
import { StageBadge } from "../../components/ui/StageBadge";
import { IconChevronL, IconFilter, IconTriangle } from "../../components/icons/Icons";
import { NOTIFICATIONS, STAGE_COLORS } from "../../lib/demo";

type Filter = "all" | "active" | "cleared";

export function HistoryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("all");

  void filter; // demo data isn't filtered yet — kept for visual parity

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="ALERTS"
        title="Notifications"
        left={
          <button className="icon-btn" onClick={() => navigate("/")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
        right={
          <button className="icon-btn" aria-label="Filter">
            <IconFilter size={18} />
          </button>
        }
      />
      <div className="scroll">
        <div className="seg" style={{ marginBottom: 14 }}>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All
          </button>
          <button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>
            Active
          </button>
          <button className={filter === "cleared" ? "active" : ""} onClick={() => setFilter("cleared")}>
            Cleared
          </button>
        </div>
        {NOTIFICATIONS.map((n) => (
          <div key={n.id} className="card" style={{ marginBottom: 10, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: STAGE_COLORS[n.stage].bg,
                  color: STAGE_COLORS[n.stage].ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconTriangle size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <StageBadge n={n.stage} size="sm" />
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--ink-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {n.date} · {n.t}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{n.title}</div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-3)",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {n.body}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
