import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { HouseholdMember, Contact } from "../types/settings";

export type Role = "citizen" | "firefighter";
export type AlertRadius = 1 | 5 | 10 | 25 | 50;

type Settings = {
  /** Two-letter EU language code (settings) — full 24 supported. */
  language: string;
  setLanguage: (code: string) => void;

  /** Subset used to preview stage headlines (EN/NL/DE/FR/ES). */
  previewLang: string;
  setPreviewLang: (code: string) => void;

  online: boolean;
  setOnline: (v: boolean) => void;

  dark: boolean;
  setDark: (v: boolean) => void;

  role: Role;
  setRole: (r: Role) => void;

  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;

  /** Which EFAS stages trigger notifications (index 0 = stage 1 … index 4 = stage 5). */
  alertTiers: boolean[];
  setAlertTiers: (v: boolean[]) => void;

  /** Stages 4 & 5 override Do Not Disturb. */
  alertTiersDND: boolean;
  setAlertTiersDND: (v: boolean) => void;

  /** Alert radius preset in km. */
  alertRadiusKm: AlertRadius;
  setAlertRadiusKm: (v: AlertRadius) => void;

  householdMembers: HouseholdMember[];
  setHouseholdMembers: (v: HouseholdMember[]) => void;

  emergencyContacts: Contact[];
  setEmergencyContacts: (v: Contact[]) => void;
};

const Ctx = createContext<Settings | null>(null);

function readBool(key: string, fallback: boolean): boolean {
  if (typeof localStorage === "undefined") return fallback;
  const v = localStorage.getItem(key);
  if (v === "1") return true;
  if (v === "0") return false;
  return fallback;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() =>
    typeof localStorage !== "undefined" ? localStorage.getItem("aegis.lang") ?? "EN" : "EN",
  );
  const [previewLang, setPreviewLangState] = useState<string>("EN");
  const [online, setOnlineState] = useState<boolean>(() => readBool("aegis.online", true));
  const [dark, setDarkState] = useState<boolean>(() => readBool("aegis.dark", false));
  // Role is session-scoped — every fresh load starts as citizen, regardless
  // of how the previous session ended. Keeps the default demo experience
  // predictable (citizen home, `/` as the landing page).
  const [role, setRoleState] = useState<Role>("citizen");
  const [hasOnboarded, setHasOnboardedState] = useState<boolean>(() =>
    readBool("aegis.onboarded", false),
  );

  const [alertTiers, setAlertTiersState] = useState<boolean[]>(() => {
    try {
      const v = localStorage.getItem("aegis.alertTiers");
      if (v) return JSON.parse(v) as boolean[];
    } catch {}
    return [false, true, true, true, true];
  });

  const [alertTiersDND, setAlertTiersDNDState] = useState<boolean>(() =>
    readBool("aegis.alertTiersDND", true),
  );

  const [alertRadiusKm, setAlertRadiusKmState] = useState<AlertRadius>(() => {
    const v = localStorage.getItem("aegis.alertRadius");
    const n = Number(v);
    return ([1, 5, 10, 25, 50] as AlertRadius[]).includes(n as AlertRadius)
      ? (n as AlertRadius)
      : 5;
  });

  const [householdMembers, setHouseholdMembersState] = useState<HouseholdMember[]>(() => {
    try {
      const v = localStorage.getItem("aegis.household");
      if (v) return JSON.parse(v) as HouseholdMember[];
    } catch {}
    return [];
  });

  const [emergencyContacts, setEmergencyContactsState] = useState<Contact[]>(() => {
    try {
      const v = localStorage.getItem("aegis.contacts");
      if (v) return JSON.parse(v) as Contact[];
    } catch {}
    return [];
  });

  const setLanguage = (c: string) => {
    setLanguageState(c);
    localStorage.setItem("aegis.lang", c);
    if (["EN", "NL", "DE", "FR", "ES"].includes(c)) setPreviewLangState(c);
    document.documentElement.lang = c.toLowerCase();
  };
  const setPreviewLang = (c: string) => setPreviewLangState(c);
  const setOnline = (v: boolean) => {
    setOnlineState(v);
    localStorage.setItem("aegis.online", v ? "1" : "0");
  };
  const setDark = (v: boolean) => {
    setDarkState(v);
    localStorage.setItem("aegis.dark", v ? "1" : "0");
  };
  const setRole = (r: Role) => {
    setRoleState(r);
  };
  const setHasOnboarded = (v: boolean) => {
    setHasOnboardedState(v);
    localStorage.setItem("aegis.onboarded", v ? "1" : "0");
  };

  const setAlertTiers = (v: boolean[]) => {
    setAlertTiersState(v);
    localStorage.setItem("aegis.alertTiers", JSON.stringify(v));
  };
  const setAlertTiersDND = (v: boolean) => {
    setAlertTiersDNDState(v);
    localStorage.setItem("aegis.alertTiersDND", v ? "1" : "0");
  };
  const setAlertRadiusKm = (v: AlertRadius) => {
    setAlertRadiusKmState(v);
    localStorage.setItem("aegis.alertRadius", String(v));
  };
  const setHouseholdMembers = (v: HouseholdMember[]) => {
    setHouseholdMembersState(v);
    localStorage.setItem("aegis.household", JSON.stringify(v));
  };
  const setEmergencyContacts = (v: Contact[]) => {
    setEmergencyContactsState(v);
    localStorage.setItem("aegis.contacts", JSON.stringify(v));
  };

  // Apply theme to documentElement (matches design's data-theme="dark").
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const value = useMemo<Settings>(
    () => ({
      language,
      setLanguage,
      previewLang,
      setPreviewLang,
      online,
      setOnline,
      dark,
      setDark,
      role,
      setRole,
      hasOnboarded,
      setHasOnboarded,
      alertTiers,
      setAlertTiers,
      alertTiersDND,
      setAlertTiersDND,
      alertRadiusKm,
      setAlertRadiusKm,
      householdMembers,
      setHouseholdMembers,
      emergencyContacts,
      setEmergencyContacts,
    }),
    [language, previewLang, online, dark, role, hasOnboarded,
     alertTiers, alertTiersDND, alertRadiusKm, householdMembers, emergencyContacts],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): Settings {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}
