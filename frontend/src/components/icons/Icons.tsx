import type { SVGProps, ReactNode } from "react";

type IconBaseProps = Omit<SVGProps<SVGSVGElement>, "stroke"> & {
  size?: number;
  stroke?: number;
  children?: ReactNode;
};

export const Icon = ({
  children,
  size = 22,
  stroke = 1.6,
  ...rest
}: IconBaseProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

type IP = Omit<IconBaseProps, "children">;

export const IconHome = (p: IP) => (
  <Icon {...p}>
    <path d="M3 11l9-7 9 7" />
    <path d="M5 10v10h14V10" />
  </Icon>
);

export const IconMap = (p: IP) => (
  <Icon {...p}>
    <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </Icon>
);

export const IconBell = (p: IP) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z" />
    <path d="M10 21a2 2 0 004 0" />
  </Icon>
);

export const IconSettings = (p: IP) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 014.2 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 017 4.3l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1A2 2 0 0119.7 7l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </Icon>
);

export const IconTriangle = (p: IP) => (
  <Icon {...p}>
    <path d="M12 3l9.5 17H2.5L12 3z" />
    <path d="M12 10v5" />
    <circle cx="12" cy="18" r="0.6" fill="currentColor" />
  </Icon>
);

export const IconChevronR = (p: IP) => (
  <Icon {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);
export const IconChevronL = (p: IP) => (
  <Icon {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);
export const IconChevronD = (p: IP) => (
  <Icon {...p}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
);

export const IconClose = (p: IP) => (
  <Icon {...p}>
    <path d="M6 6l12 12M6 18L18 6" />
  </Icon>
);

export const IconCheck = (p: IP) => (
  <Icon {...p}>
    <path d="M5 12l5 5L20 7" />
  </Icon>
);

export const IconPin = (p: IP) => (
  <Icon {...p}>
    <path d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

export const IconMapPin = IconPin;

export const IconCrosshair = (p: IP) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <circle cx="12" cy="12" r="2" />
  </Icon>
);

export const IconWifi = (p: IP) => (
  <Icon {...p}>
    <path d="M5 12.5a10 10 0 0114 0" />
    <path d="M8.5 16a5 5 0 017 0" />
    <circle cx="12" cy="19" r="0.8" fill="currentColor" />
    <path d="M2 9a14 14 0 0120 0" />
  </Icon>
);

export const IconWifiOff = (p: IP) => (
  <Icon {...p}>
    <path d="M2 9a14 14 0 015-3.5" />
    <path d="M16 5.5A14 14 0 0122 9" />
    <path d="M5 12.5a10 10 0 014.5-2.5" />
    <path d="M14.5 10a10 10 0 014.5 2.5" />
    <path d="M8.5 16a5 5 0 017 0" />
    <circle cx="12" cy="19" r="0.8" fill="currentColor" />
    <path d="M3 3l18 18" />
  </Icon>
);

export const IconGlobe = (p: IP) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
  </Icon>
);

export const IconClock = (p: IP) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const IconInfo = (p: IP) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.5" />
  </Icon>
);

export const IconPhone = (p: IP) => (
  <Icon {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </Icon>
);

export const IconShare = (p: IP) => (
  <Icon {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" />
  </Icon>
);

export const IconPlus = (p: IP) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const IconMinus = (p: IP) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);

export const IconLayers = (p: IP) => (
  <Icon {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5M3 18l9 5 9-5" />
  </Icon>
);

export const IconRoute = (p: IP) => (
  <Icon {...p}>
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="5" r="2" />
    <path d="M8 19h6a4 4 0 000-8h-4a4 4 0 010-8h6" />
  </Icon>
);

export const IconShield = (p: IP) => (
  <Icon {...p}>
    <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" />
  </Icon>
);

export const IconHand = (p: IP) => (
  <Icon {...p}>
    <path d="M9 11V5a1.5 1.5 0 013 0v6" />
    <path d="M12 11V4a1.5 1.5 0 013 0v7" />
    <path d="M15 11V6a1.5 1.5 0 013 0v8a7 7 0 01-7 7H10c-2 0-3-1-4-3l-3-5 2-1.5 3 2.5V8.5a1.5 1.5 0 013 0V11" />
  </Icon>
);

export const IconSatellite = (p: IP) => (
  <Icon {...p}>
    <path d="M5 13l6 6 3-3-6-6z" />
    <path d="M9 9l3-3 6 6-3 3" />
    <path d="M9 13l-3 3" />
    <path d="M16 18a3 3 0 003-3M19 21a6 6 0 006-6" />
  </Icon>
);

export const IconBattery = (p: IP) => (
  <Icon {...p}>
    <rect x="3" y="8" width="16" height="8" rx="2" />
    <path d="M21 11v2" />
    <rect x="5" y="10" width="6" height="4" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconSearch = (p: IP) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16l5 5" />
  </Icon>
);

export const IconUsers = (p: IP) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20a6 6 0 0112 0" />
    <circle cx="17" cy="9" r="3" />
    <path d="M14.5 14.5A5 5 0 0121 19" />
  </Icon>
);

export const IconFilter = (p: IP) => (
  <Icon {...p}>
    <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />
  </Icon>
);

export const IconDrop = (p: IP) => (
  <Icon {...p}>
    <path d="M12 3s7 7.5 7 12a7 7 0 11-14 0c0-4.5 7-12 7-12z" />
  </Icon>
);

export const IconLightning = (p: IP) => (
  <Icon {...p}>
    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
  </Icon>
);

export const IconEye = (p: IP) => (
  <Icon {...p}>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const IconArrow = (p: IP) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const IconCamera = (p: IP) => (
  <Icon {...p}>
    <path d="M3 8h3l2-3h8l2 3h3v11H3z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
);

export const IconBackpack = (p: IP) => (
  <Icon {...p}>
    <path d="M9 7V5a3 3 0 016 0v2" />
    <rect x="5" y="7" width="14" height="14" rx="3" />
    <path d="M9 14h6" />
  </Icon>
);
