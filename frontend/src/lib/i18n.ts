// Minimal i18n. UI stays in English; stage headlines preview in five demo
// languages so judges can see the translation pipeline in motion.

export type DemoLang = "EN" | "NL" | "DE" | "FR" | "ES";

type Dict = Record<string, string>;

const I18N: Record<DemoLang, Dict> = {
  EN: {
    appName: "Aegis",
    appSub: "EU Flood Alert",
    home: "Home", map: "Map", sos: "SOS", alerts: "Alerts", more: "More",
    currentStage: "Current stage",
    yourArea: "Your area",
    nextUpdate: "Next update",
    viewMap: "View live flood map",
    seeAlert: "Open active alert",
    safeRoute: "Safe route to high ground",
    sosTitle: "Send SOS",
    holdToSend: "Hold to send SOS",
  },
  NL: {
    currentStage: "Huidige fase",
    yourArea: "Uw gebied",
    nextUpdate: "Volgende update",
    viewMap: "Live overstromingskaart",
    seeAlert: "Open actieve waarschuwing",
    safeRoute: "Veilige route naar hoge grond",
    sosTitle: "SOS versturen",
    holdToSend: "Houd ingedrukt om SOS te verzenden",
  },
  DE: {
    currentStage: "Aktuelle Stufe",
    yourArea: "Ihr Gebiet",
    nextUpdate: "Nächste Aktualisierung",
    viewMap: "Live-Hochwasserkarte",
    seeAlert: "Aktive Warnung öffnen",
    safeRoute: "Sichere Route auf höher gelegenes Gelände",
    sosTitle: "SOS senden",
    holdToSend: "Halten, um SOS zu senden",
  },
  FR: {
    currentStage: "Niveau actuel",
    yourArea: "Votre zone",
    nextUpdate: "Prochaine mise à jour",
    viewMap: "Carte des inondations en direct",
    seeAlert: "Ouvrir l’alerte active",
    safeRoute: "Itinéraire sûr vers les hauteurs",
    sosTitle: "Envoyer un SOS",
    holdToSend: "Maintenir pour envoyer un SOS",
  },
  ES: {
    currentStage: "Nivel actual",
    yourArea: "Tu zona",
    nextUpdate: "Próxima actualización",
    viewMap: "Mapa de inundaciones en vivo",
    seeAlert: "Abrir alerta activa",
    safeRoute: "Ruta segura a terreno elevado",
    sosTitle: "Enviar SOS",
    holdToSend: "Mantén pulsado para enviar SOS",
  },
};

export function t(lang: string, key: string): string {
  const lk = (lang as DemoLang) in I18N ? (lang as DemoLang) : "EN";
  return I18N[lk][key] ?? I18N.EN[key] ?? key;
}

const STAGE_TEXT: Record<DemoLang, string[]> = {
  EN: ["Conditions normal","Watch in effect","Flood warning","Severe flood warning","Evacuation order"],
  NL: ["Omstandigheden normaal","Waarschuwing actief","Overstromingswaarschuwing","Ernstige overstromingswaarschuwing","Evacuatiebevel"],
  DE: ["Lage normal","Beobachtung aktiv","Hochwasserwarnung","Schwere Hochwasserwarnung","Evakuierungsbefehl"],
  FR: ["Situation normale","Vigilance active","Avertissement de crue","Avertissement de crue grave","Ordre d’évacuation"],
  ES: ["Condiciones normales","Vigilancia activa","Aviso de inundación","Aviso grave de inundación","Orden de evacuación"],
};

export function stageHeadline(lang: string, n: number): string {
  const lk = (lang as DemoLang) in STAGE_TEXT ? (lang as DemoLang) : "EN";
  const arr = STAGE_TEXT[lk];
  return arr[Math.max(0, Math.min(4, n - 1))];
}

export const DEMO_LANGS: DemoLang[] = ["EN", "NL", "DE", "FR", "ES"];
