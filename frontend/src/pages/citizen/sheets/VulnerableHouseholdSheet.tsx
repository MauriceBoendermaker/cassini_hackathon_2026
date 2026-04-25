import { useState } from "react";
import { useSettings } from "../../../state/SettingsContext";
import { IconClose, IconInfo } from "../../../components/icons/Icons";
import type { HouseholdCategory } from "../../../types/settings";

const CATS: Record<
  HouseholdCategory,
  { label: string; sub: string; icon: string; bg: string }
> = {
  elderly:  { label: "Elderly",           sub: "75+ years",             icon: "👴", bg: "#eff3ff" },
  infant:   { label: "Infant",            sub: "Under 2 years",         icon: "👶", bg: "#fff0ee" },
  mobility: { label: "Mobility impaired", sub: "Wheelchair / limited",  icon: "♿", bg: "#eef6ee" },
  medical:  { label: "Medical needs",     sub: "Ongoing treatment",     icon: "💊", bg: "#fef5ff" },
};

export function VulnerableHouseholdSheet({ onClose }: { onClose: () => void }) {
  const { householdMembers, setHouseholdMembers } = useSettings();
  const [adding, setAdding] = useState(false);

  function addMember(category: HouseholdCategory) {
    setHouseholdMembers([...householdMembers, { id: crypto.randomUUID(), category }]);
    setAdding(false);
  }

  function removeMember(id: string) {
    setHouseholdMembers(householdMembers.filter((m) => m.id !== id));
  }

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Vulnerable household
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        {/* Info note */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            background: "var(--s1-soft)",
            border: "1px solid oklch(0.88 0.05 240)",
            borderRadius: "var(--r)",
            padding: "10px 12px",
            marginBottom: 12,
            fontSize: 12.5,
            color: "oklch(0.40 0.12 240)",
            lineHeight: 1.5,
          }}
        >
          <IconInfo size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          Shared with rescue teams during SOS — helps prioritise triage. Stays on-device otherwise.
        </div>

        {/* Member list */}
        {householdMembers.map((m) => {
          const cat = CATS[m.category];
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "11px 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                className="lr-icon"
                style={{ background: cat.bg, fontSize: 16 }}
              >
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{cat.sub}</div>
              </div>
              <button
                onClick={() => removeMember(m.id)}
                aria-label={`Remove ${cat.label}`}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--s4)",
                  fontSize: 13,
                  padding: "4px 6px",
                  borderRadius: "var(--r-sm)",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          );
        })}

        {/* Add / category picker */}
        {adding ? (
          <div style={{ marginTop: 10 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Select category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(Object.entries(CATS) as [HouseholdCategory, (typeof CATS)[HouseholdCategory]][]).map(
                ([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => addMember(key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--font-ui)",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink)" }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{cat.sub}</div>
                    </span>
                  </button>
                ),
              )}
            </div>
            <button
              onClick={() => setAdding(false)}
              style={{
                marginTop: 8,
                width: "100%",
                padding: "10px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--ink-3)",
                fontFamily: "var(--font-ui)",
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "13px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontFamily: "var(--font-ui)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "1.5px solid var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 300,
                color: "var(--ink)",
                flexShrink: 0,
              }}
            >
              +
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)" }}>
              Add household member
            </div>
          </button>
        )}
      </div>
    </>
  );
}
