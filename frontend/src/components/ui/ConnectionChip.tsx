import { IconWifi, IconWifiOff } from "../icons/Icons";

export function ConnectionChip({ online }: { online: boolean }) {
  return (
    <span className={"chip " + (online ? "live" : "offline")}>
      {online ? <IconWifi size={12} /> : <IconWifiOff size={12} />}
      <span>{online ? "Online" : "Offline · Galileo"}</span>
    </span>
  );
}
