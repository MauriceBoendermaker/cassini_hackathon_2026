import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../../components/layout/AppBar";
import { StageBadge } from "../../components/ui/StageBadge";
import {
  IconChevronL,
  IconClose,
  IconFilter,
  IconTriangle,
} from "../../components/icons/Icons";
import { formatRelative, NOTIFICATIONS, STAGE_COLORS, STAGES, type StageNum } from "../../lib/demo";

type Tab = "all" | "active" | "cleared";
type TimeRange = "hour" | "day" | "week" | "all";

const TIME_RANGES: { key: TimeRange; label: string; minutes: number }[] = [
  { key: "hour",  label: "Last hour", minutes: 60 },
  { key: "day",   label: "Last day",  minutes: 60 * 24 },
  { key: "week",  label: "Last week", minutes: 60 * 24 * 7 },
  { key: "all",   label: "All time",  minutes: Infinity },
];

export function HistoryPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [stageFilter, setStageFilter] = useState<StageNum[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [showFilter, setShowFilter] = useState(false);

  const hasActiveFilters = stageFilter.length > 0 || timeRange !== "all";

  const rangeMinutes = TIME_RANGES.find((r) => r.key === timeRange)!.minutes;

  const visible = NOTIFICATIONS.filter((n) => {
    if (tab === "active" && n.stage < 3) return false;
    if (tab === "cleared" && n.stage >= 3) return false;
    if (stageFilter.length > 0 && !stageFilter.includes(n.stage)) return false;
    if (n.minutesAgo > rangeMinutes) return false;
    return true;
  });

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
          <button
            className="icon-btn"
            onClick={() => setShowFilter(true)}
            aria-label="Filter"
            style={{ position: "relative" }}
          >
            <IconFilter size={18} />
            {hasActiveFilters && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--s4)",
                  border: "1.5px solid var(--surface)",
                }}
              />
            )}
          </button>
        }
      />
      <div className="scroll">
        {/* Tab bar */}
        <div className="seg" style={{ marginBottom: 14 }}>
          <button className={tab === "all" ? "active" : ""} onClick={() => setTab("all")}>
            All
          </button>
          <button className={tab === "active" ? "active" : ""} onClick={() => setTab("active")}>
            Active
          </button>
          <button className={tab === "cleared" ? "active" : ""} onClick={() => setTab("cleared")}>
            Cleared
          </button>
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
              padding: "7px 10px",
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              borderRadius: "var(--r)",
              fontSize: 12,
              color: "var(--ink-3)",
            }}
          >
            <IconFilter size={13} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              {[
                stageFilter.length > 0 && `Stage ${stageFilter.join(", ")}`,
                timeRange !== "all" && TIME_RANGES.find((r) => r.key === timeRange)!.label,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <button
              onClick={() => { setStageFilter([]); setTimeRange("all"); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-3)",
                padding: "2px 4px",
                fontSize: 11,
                fontFamily: "var(--font-ui)",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Notification cards */}
        {visible.length > 0 ? (
          visible.map((n) => (
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
                      {formatRelative(n.minutesAgo)}
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
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "var(--ink-4)",
              fontSize: 13.5,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔔</div>
            No alerts match your filters
          </div>
        )}
      </div>

      {showFilter && (
        <FilterSheet
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}

function FilterSheet({
  stageFilter,
  setStageFilter,
  timeRange,
  setTimeRange,
  onClose,
}: {
  stageFilter: StageNum[];
  setStageFilter: (v: StageNum[]) => void;
  timeRange: TimeRange;
  setTimeRange: (v: TimeRange) => void;
  onClose: () => void;
}) {
  // Local draft state so changes only apply on "Apply"
  const [draftStages, setDraftStages] = useState<StageNum[]>(stageFilter);
  const [draftTime, setDraftTime] = useState<TimeRange>(timeRange);

  function toggleStage(n: StageNum) {
    setDraftStages(
      draftStages.includes(n)
        ? draftStages.filter((s) => s !== n)
        : [...draftStages, n].sort((a, b) => a - b),
    );
  }

  function apply() {
    setStageFilter(draftStages);
    setTimeRange(draftTime);
    onClose();
  }

  function clearAll() {
    setDraftStages([]);
    setDraftTime("all");
  }

  const isDirty =
    JSON.stringify(draftStages) !== JSON.stringify(stageFilter) ||
    draftTime !== timeRange;

  const hasAny = draftStages.length > 0 || draftTime !== "all";

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Filter alerts
          </div>
          {hasAny && (
            <button
              onClick={clearAll}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--ink-3)",
                fontFamily: "var(--font-ui)",
                padding: "4px 6px",
              }}
            >
              Clear all
            </button>
          )}
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        {/* Stage filter */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>Severity</div>
        <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
          {STAGES.map((s) => {
            const active = draftStages.includes(s.n as StageNum);
            return (
              <button
                key={s.n}
                onClick={() => toggleStage(s.n as StageNum)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "7px 12px",
                  borderRadius: 99,
                  border: "1.5px solid",
                  borderColor: active
                    ? STAGE_COLORS[s.n as StageNum].bg
                    : "var(--line)",
                  background: active
                    ? STAGE_COLORS[s.n as StageNum].soft
                    : "var(--surface)",
                  cursor: "pointer",
                  fontFamily: "var(--font-ui)",
                  transition: "background .15s, border-color .15s",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                  <circle cx="4" cy="4" r="3.5" fill={STAGE_COLORS[s.n as StageNum].bg} />
                </svg>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: active ? "var(--ink)" : "var(--ink-3)",
                  }}
                >
                  {s.short}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time range filter */}
        <div className="eyebrow" style={{ marginBottom: 10 }}>Time range</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setDraftTime(r.key)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                borderRadius: "var(--r)",
                border: "1.5px solid",
                borderColor: draftTime === r.key ? "var(--ink-card)" : "var(--line)",
                background: draftTime === r.key ? "var(--ink-card)" : "var(--surface)",
                color: draftTime === r.key ? "var(--ink-card-fg)" : "var(--ink-2)",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                fontWeight: 500,
                transition: "background .15s, border-color .15s, color .15s",
              }}
            >
              {r.label}
              {draftTime === r.key && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Apply */}
        <button
          onClick={apply}
          className="btn primary full"
          style={{ opacity: isDirty ? 1 : 0.5 }}
          disabled={!isDirty}
        >
          Apply filters
        </button>
      </div>
    </>
  );
}
