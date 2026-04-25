import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Role = "citizen" | "firefighter";

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
  const [role, setRoleState] = useState<Role>(() => {
    if (typeof localStorage === "undefined") return "citizen";
    const v = localStorage.getItem("aegis.role");
    return v === "firefighter" ? "firefighter" : "citizen";
  });
  const [hasOnboarded, setHasOnboardedState] = useState<boolean>(() =>
    readBool("aegis.onboarded", false),
  );

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
    localStorage.setItem("aegis.role", r);
  };
  const setHasOnboarded = (v: boolean) => {
    setHasOnboardedState(v);
    localStorage.setItem("aegis.onboarded", v ? "1" : "0");
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
    }),
    [language, previewLang, online, dark, role, hasOnboarded],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): Settings {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings must be used within SettingsProvider");
  return v;
}
