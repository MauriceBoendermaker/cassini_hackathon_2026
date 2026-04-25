import { useState } from "react";
import { useSettings } from "../../../state/SettingsContext";
import { IconClose, IconPhone } from "../../../components/icons/Icons";

export function EmergencyContactsSheet({ onClose }: { onClose: () => void }) {
  const { emergencyContacts, setEmergencyContacts } = useSettings();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function confirmAdd() {
    if (!name.trim() || !phone.trim()) return;
    setEmergencyContacts([
      ...emergencyContacts,
      { id: crypto.randomUUID(), name: name.trim(), phone: phone.trim() },
    ]);
    setName("");
    setPhone("");
    setAdding(false);
  }

  function removeContact(id: string) {
    setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
  }

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Emergency contacts
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        {/* 112 fixed row */}
        <div
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
            style={{ background: "var(--s4-soft)", color: "var(--s4)" }}
          >
            <IconPhone size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500 }}>112 · Emergency</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
              European emergency number
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 99,
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}
          >
            system
          </span>
        </div>

        {/* Custom contacts */}
        {emergencyContacts.map((c) => (
          <div
            key={c.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "11px 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div className="lr-icon" style={{ background: "var(--bg-soft)" }}>
              <IconPhone size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{c.name}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {c.phone}
              </div>
            </div>
            <button
              onClick={() => removeContact(c.id)}
              aria-label={`Remove ${c.name}`}
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
        ))}

        {/* Add contact / inline form */}
        {adding ? (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+31 6 ..."
                type="tel"
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setAdding(false); setName(""); setPhone(""); }}
                className="btn secondary full"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAdd}
                className="btn primary full"
                style={{ flex: 1, opacity: !name.trim() || !phone.trim() ? 0.4 : 1 }}
                disabled={!name.trim() || !phone.trim()}
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <>
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
                Add emergency contact
              </div>
            </button>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-4)",
                lineHeight: 1.5,
                marginTop: 4,
              }}
            >
              Contacts receive a text when you send SOS or your area reaches stage 4.
            </div>
          </>
        )}
      </div>
    </>
  );
}
