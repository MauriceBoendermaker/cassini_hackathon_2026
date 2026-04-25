import { useNavigate, useLocation } from "react-router-dom";
import {
  IconHome,
  IconMap,
  IconLightning,
  IconLayers,
  IconSettings,
  IconUsers,
  IconPhone,
} from "../icons/Icons";
import type { Role } from "../../state/SettingsContext";

type TabItem = {
  k: string;
  label: string;
  to: string;
  Icon: (p: { size?: number }) => JSX.Element;
  sos?: boolean;
};

function citizenTabs(): TabItem[] {
  return [
    { k: "home",    label: "Home",    to: "/",        Icon: IconHome },
    { k: "map",     label: "Map",     to: "/map",     Icon: IconMap },
    { k: "sos",     label: "SOS",     to: "/sos",     Icon: IconLightning, sos: true },
    { k: "modules", label: "Modules", to: "/modules", Icon: IconLayers },
    { k: "settings",label: "More",    to: "/settings",Icon: IconSettings },
  ];
}

function firefighterTabs(): TabItem[] {
  return [
    { k: "ops",   label: "Ops",   to: "/ops",          Icon: IconMap },
    { k: "units", label: "Units", to: "/ops/units",    Icon: IconUsers },
    { k: "queue", label: "Queue", to: "/ops/queue",    Icon: IconLightning },
    { k: "comms", label: "Comms", to: "/ops/comms",    Icon: IconPhone },
    { k: "more",  label: "More",  to: "/ops/settings", Icon: IconSettings },
  ];
}

export function TabBar({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tabs = role === "firefighter" ? firefighterTabs() : citizenTabs();

  const isActive = (to: string) => {
    if (to === "/" || to === "/ops") return pathname === to;
    return pathname.startsWith(to);
  };

  return (
    <div className="tab-bar">
      {tabs.map((t) => (
        <button
          key={t.k}
          className={(isActive(t.to) ? "active" : "") + (t.sos ? " sos" : "")}
          onClick={() => navigate(t.to)}
        >
          <t.Icon size={22} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
